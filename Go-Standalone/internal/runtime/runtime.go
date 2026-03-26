package runtime
import (
	"bufio"
	"encoding/json"
	"fmt"
	"github.com/ezlang/ezbot/internal/logger"
	"io"
	"os"
	"os/exec"
	"os/signal"
	"path/filepath"
	"strings"
	"syscall"


	"github.com/ezlang/ezbot/internal/ast"
	"github.com/ezlang/ezbot/internal/discord"
)

type npmProxy struct {
	name string
}

type Engine struct {
	discordClient   *discord.Client
	env             *Environment
	ParserFunc      func(string) (*ast.Program, error)
	CurrentFilePath string
	
	// NPM Bridge
	bridgeProc      *exec.Cmd
	bridgeIn        io.WriteCloser
	bridgeOut       *bufio.Scanner
	bridgeRequestID int
}

func New() *Engine {
	e := &Engine{
		env:             NewEnvironment(),
		CurrentFilePath: ".",
	}
	RegisterBuiltins(e.env, e)
	return e
}

func (e *Engine) Execute(program *ast.Program) error {
	for _, stmt := range program.Statements {
		if err := e.evalStatement(stmt, e.env); err != nil {
			return err
		}
	}
	return nil
}

// evalSourceFile dynamically parses and executes included scripts into the global environment
func (e *Engine) evalSourceFile(source string, env *Environment, filePath string) error {
	if e.ParserFunc != nil {
		oldPath := e.CurrentFilePath
		e.CurrentFilePath = filePath
		defer func() { e.CurrentFilePath = oldPath }()

		program, err := e.ParserFunc(source)
		if err != nil {
			return err
		}
		for _, stmt := range program.Statements {
			if err := e.evalStatement(stmt, env); err != nil {
				return err
			}
		}
		logger.Module("Loaded module: %s", filePath)
	}
	return nil
}

func convertOptions(optsVal interface{}) []discord.AppCommandOption {
	var opts []discord.AppCommandOption
	if slice, ok := optsVal.([]interface{}); ok {
		for _, o := range slice {
			if m, ok := o.(map[string]interface{}); ok {
				opt := discord.AppCommandOption{
					Name:        fmt.Sprintf("%v", m["name"]),
					Description: fmt.Sprintf("%v", m["description"]),
					Type:        3, // Default to string
					Required:    false,
				}
				if t, ok := m["type"]; ok {
					fmt.Sscanf(fmt.Sprintf("%v", t), "%d", &opt.Type)
				}
				if r, ok := m["required"]; ok {
					if b, isBool := r.(bool); isBool {
						opt.Required = b
					} else if s, isStr := r.(string); isStr {
						opt.Required = (s == "true")
					}
				}

				if subOpts, ok := m["options"]; ok {
					opt.Options = convertOptions(subOpts)
				}
				opts = append(opts, opt)
			}
		}
	}
	return opts
}

func injectOptions(options []discord.InteractionDataOption, env *Environment) {
	for _, opt := range options {
		if opt.Type == 1 || opt.Type == 2 { // Subcommand or Subcommand Group
			env.Set(opt.Name, true)
			if len(opt.Options) > 0 {
				injectOptions(opt.Options, env)
			}
		} else {
			env.Set(opt.Name, opt.Value)
		}
	}
}

func (e *Engine) ensureBridge() error {
	if e.bridgeProc != nil {
		return nil
	}

	// For the NPM package release, bridge.js is next to ez-engine in the same bin/ dir.
	// But during dev it might be in different places.
	// Let's try to find it.
	exePath, _ := os.Executable()
	bridgePath := filepath.Join(filepath.Dir(exePath), "bridge.js")
	
	if _, err := os.Stat(bridgePath); os.IsNotExist(err) {
		// Try relative to workspace
		bridgePath = "/root/EZLang/ez-cli/bin/bridge.js"
	}

	cmd := exec.Command("node", bridgePath)
	cmd.Stderr = os.Stderr
	cmd.Env = os.Environ() // Inherit parent environment
	in, _ := cmd.StdinPipe()
	out, _ := cmd.StdoutPipe()
	
	err := cmd.Start()
	if err != nil {
		return fmt.Errorf("failed to start bridge.js: %w", err)
	}

	e.bridgeProc = cmd
	e.bridgeIn = in
	e.bridgeOut = bufio.NewScanner(out)
	
	logger.Info("NPM Bridge initialized.")
	return nil
}

func (e *Engine) bridgeRequest(method string, params []interface{}) (interface{}, error) {
	if err := e.ensureBridge(); err != nil {
		return nil, err
	}

	e.bridgeRequestID++
	id := e.bridgeRequestID
	
	req := map[string]interface{}{
		"id":     id,
		"method": method,
		"params": params,
	}
	
	data, _ := json.Marshal(req)
	_, err := io.WriteString(e.bridgeIn, string(data)+"\n")
	if err != nil {
		return nil, err
	}

	if e.bridgeOut.Scan() {
		var resp struct {
			ID     int         `json:"id"`
			Result interface{} `json:"result"`
			Error  string      `json:"error"`
		}
		json.Unmarshal([]byte(e.bridgeOut.Text()), &resp)
		
		if resp.Error != "" {
			return nil, fmt.Errorf(resp.Error)
		}
		return resp.Result, nil
	}
	
	return nil, fmt.Errorf("bridge disconnected")
}

func (e *Engine) evalStatement(node ast.Statement, env *Environment) error {
	if e.discordClient == nil {
		e.discordClient = discord.NewClient("PENDING")
	}
	switch n := node.(type) {
	case *ast.IncludeCommand:
		pathVal := e.evalExpression(n.FilePath, env)
		pathStr := fmt.Sprintf("%v", pathVal)
		fullPath := pathStr
		if !filepath.IsAbs(pathStr) {
			fullPath = filepath.Join(filepath.Dir(e.CurrentFilePath), pathStr)
		}
		source, err := os.ReadFile(fullPath)
		if err != nil {
			return fmt.Errorf("failed to read included file '%s' (full: '%s'): %w", pathStr, fullPath, err)
		}
		return e.evalSourceFile(string(source), env, fullPath)

	case *ast.LoadPackageCommand:
		pkgVal := e.evalExpression(n.PackageName, env)
		pkgName := fmt.Sprintf("%v", pkgVal)
		alias := n.Alias
		if alias == "" {
			alias = pkgName
		}
		
		_, err := e.bridgeRequest("load", []interface{}{pkgName})
		if err != nil {
			logger.Error("Failed to load npm package %s: %v", pkgName, err)
			return nil
		}

		logger.Module("Loaded npm package: %s (as %s)", pkgName, alias)
		// Set a proxy object that will be intercepted in CallExpression
		env.Set(alias, npmProxy{name: pkgName})

	case *ast.StartBotCommand:
		tokenVal := e.evalExpression(n.Token, env)
		token := fmt.Sprintf("%v", tokenVal)
		if e.discordClient != nil && e.discordClient.Token == "PENDING" {
			e.discordClient.Token = token
		} else {
			e.discordClient = discord.NewClient(token)
		}
		
		e.discordClient.Handlers.Ready = append(e.discordClient.Handlers.Ready, func(data map[string]interface{}) {
			if app, ok := data["application"].(map[string]interface{}); ok {
				env.Set("APP_ID", app["id"].(string))
			}
			if user, ok := data["user"].(map[string]interface{}); ok {
				env.Set("BOT_ID", user["id"].(string))
			}
		})

		err := e.discordClient.Start()
		if err != nil {
			return fmt.Errorf("failed to start discord bot: %w", err)
		}

	case *ast.WhenMessageCommand:
		expectedMsg := e.evalExpression(n.Condition, env)
		e.discordClient.Handlers.MessageCreate = append(e.discordClient.Handlers.MessageCreate, func(msg *discord.Message) {
			if msg.Author.Bot {
				return
			}
			msgStr := fmt.Sprintf("%v", expectedMsg)
			if strings.HasPrefix(msg.Content, msgStr) {
				handlerEnv := NewEnclosedEnvironment(env)
				handlerEnv.Set("__context_message", msg)
				handlerEnv.Set("message", msg)
				handlerEnv.Set("author", msg.Author)
				handlerEnv.Set("member", msg.Member)
				
				// Better argument splitting
				contentWithoutPrefix := strings.TrimSpace(strings.TrimPrefix(msg.Content, msgStr))
				args := strings.Fields(contentWithoutPrefix)
				handlerEnv.Set("args", args)
				
				e.evalBlock(n.Body, handlerEnv)
			}
		})

	case *ast.WhenMessageSentCommand:
		e.discordClient.Handlers.MessageCreate = append(e.discordClient.Handlers.MessageCreate, func(msg *discord.Message) {
			if msg.Author.Bot {
				return
			}
			handlerEnv := NewEnclosedEnvironment(env)
			handlerEnv.Set("__context_message", msg)
			handlerEnv.Set("message", msg)
			handlerEnv.Set("author", msg.Author)
			handlerEnv.Set("member", msg.Member)
			handlerEnv.Set("args", strings.Fields(msg.Content))
			e.evalBlock(n.Body, handlerEnv)
		})

	case *ast.ReplyWithCommand:
		msgVal := e.evalExpression(n.Message, env)
		msgStr := fmt.Sprintf("%v", msgVal)
		if contextMsg, ok := env.Get("__context_message"); ok {
			if msgObj, isMsg := contextMsg.(*discord.Message); isMsg {
				err := e.discordClient.ReplyToMessage(msgObj.ChannelID, msgObj.ID, msgStr, nil, nil, nil)
				if err != nil {
					logger.Error("Failed to reply to message: %v\n", err)
				}
			}
		} else if contextInteraction, ok := env.Get("__context_interaction"); ok {
			if intObj, isInt := contextInteraction.(*discord.Interaction); isInt {
				err := e.discordClient.ReplyToInteraction(intObj.ID, intObj.Token, 4, msgStr, nil, nil, nil)
				if err != nil {
					logger.Error("Failed to reply to interaction: %v\n", err)
				}
			}
		} else {
			return fmt.Errorf("cannot reply outside of a message or interaction context")
		}

	case *ast.SetCommand:
		val := e.evalExpression(n.Value, env)
		env.Set(n.Variable, val)

	case *ast.IfStatement:
		condition := e.evalExpression(n.Condition, env)
		isTrue := false
		if condition != nil {
			switch v := condition.(type) {
			case bool:
				isTrue = v
			case string:
				isTrue = v != "" && v != "false" && v != "null"
			case int, int64:
				isTrue = v != 0
			case float64:
				isTrue = v != 0
			default:
				isTrue = true
			}
		}
		if isTrue {
			e.evalBlock(n.Then, env)
		} else if n.Else != nil {
			e.evalBlock(n.Else, env)
		}

	case *ast.BanCommand:
		userVal := e.evalExpression(n.User, env)
		userStr := fmt.Sprintf("%v", userVal)
		reasonStr := ""
		if n.Reason != nil {
			reasonVal := e.evalExpression(n.Reason, env)
			reasonStr = fmt.Sprintf("%v", reasonVal)
		}
		contextMsg, ok := env.Get("__context_message")
		if !ok {
			return fmt.Errorf("cannot ban outside of a message context")
		}
		if msgObj, isMsg := contextMsg.(*discord.Message); isMsg {
			targetID := userStr
			if targetID == "message.author.id" || targetID == "author.id" {
				targetID = msgObj.Author.ID
			}
			err := e.discordClient.BanUser(msgObj.GuildID, targetID, reasonStr)
			if err != nil {
				logger.Error("Failed to ban: %v\n", err)
			} else {
				logger.Info("Banned user %s for %s\n", targetID, reasonStr)
			}
		}

	case *ast.UnbanCommand:
		userVal := e.evalExpression(n.User, env)
		userStr := fmt.Sprintf("%v", userVal)
		contextMsg, ok := env.Get("__context_message")
		if !ok {
			return fmt.Errorf("cannot unban outside of a message context")
		}
		if msgObj, isMsg := contextMsg.(*discord.Message); isMsg {
			err := e.discordClient.UnbanUser(msgObj.GuildID, userStr)
			if err != nil {
				logger.Error("Failed to unban: %v\n", err)
			}
		}

	case *ast.PurgeCommand:
		amountVal := e.evalExpression(n.Amount, env)
		var amount int
		fmt.Sscanf(fmt.Sprintf("%v", amountVal), "%d", &amount)
		if contextMsg, ok := env.Get("__context_message"); ok {
			if msgObj, isMsg := contextMsg.(*discord.Message); isMsg {
				e.discordClient.PurgeMessages(msgObj.ChannelID, amount)
			}
		}

	case *ast.SetNicknameCommand:
		userVal := e.evalExpression(n.User, env)
		userStr := fmt.Sprintf("%v", userVal)
		nickVal := e.evalExpression(n.Nickname, env)
		nickStr := fmt.Sprintf("%v", nickVal)
		if contextMsg, ok := env.Get("__context_message"); ok {
			if msgObj, isMsg := contextMsg.(*discord.Message); isMsg {
				e.discordClient.SetNickname(msgObj.GuildID, userStr, nickStr)
			}
		}

	case *ast.KickCommand:
		userVal := e.evalExpression(n.User, env)
		userStr := fmt.Sprintf("%v", userVal)
		reasonStr := ""
		if n.Reason != nil {
			reasonVal := e.evalExpression(n.Reason, env)
			reasonStr = fmt.Sprintf("%v", reasonVal)
		}
		contextMsg, ok := env.Get("__context_message")
		if !ok {
			return fmt.Errorf("cannot kick outside of a message context")
		}
		if msgObj, isMsg := contextMsg.(*discord.Message); isMsg {
			targetID := userStr
			if targetID == "message.author.id" || targetID == "author.id" {
				targetID = msgObj.Author.ID
			}
			err := e.discordClient.KickUser(msgObj.GuildID, targetID, reasonStr)
			if err != nil {
				logger.Error("Failed to kick: %v\n", err)
			}
		}

	case *ast.AddRoleCommand:
		roleVal := e.evalExpression(n.Role, env)
		roleStr := fmt.Sprintf("%v", roleVal)
		userVal := e.evalExpression(n.User, env)
		userStr := fmt.Sprintf("%v", userVal)
		contextMsg, ok := env.Get("__context_message")
		if !ok {
			return fmt.Errorf("cannot add role outside of a message context")
		}
		if msgObj, isMsg := contextMsg.(*discord.Message); isMsg {
			targetID := userStr
			if targetID == "message.author.id" || targetID == "author.id" {
				targetID = msgObj.Author.ID
			}
			err := e.discordClient.AddRole(msgObj.GuildID, targetID, roleStr)
			if err != nil {
				logger.Error("Failed to add role: %v\n", err)
			}
		}

	case *ast.RegisterSlashCommand:
		nameVal := e.evalExpression(n.Name, env)
		nameStr := fmt.Sprintf("%v", nameVal)
		descVal := e.evalExpression(n.Description, env)
		descStr := fmt.Sprintf("%v", descVal)
		
		var opts []discord.AppCommandOption
		if n.Options != nil {
			optsVal := e.evalExpression(n.Options, env)
			opts = convertOptions(optsVal)
		}

		cmd := discord.AppCommand{
			Name:        nameStr,
			Description: descStr,
			Type:        1,
			Options:     opts,
		}
		appID := e.discordClient.AppID
		if appID == "" {
			if idVal, ok := env.Get("APP_ID"); ok {
				appID = fmt.Sprintf("%v", idVal)
				e.discordClient.AppID = appID
			} else {
				info, err := e.discordClient.GetApplicationInfo()
				if err == nil && info["id"] != nil {
					appID = info["id"].(string)
					e.discordClient.AppID = appID
				}
			}
		}
		
		if appID == "" {
			logger.Error("Failed to register slash command '%s': Application ID unknown. Please ensure bot has started or provide application id.\n", nameStr)
			return nil
		}

		err := e.discordClient.RegisterGlobalSlashCommand(appID, cmd)
		if err != nil {
			logger.Error("Failed to register slash command '%s': %v\n", nameStr, err)
		} else {
			logger.Info("Registered slash command: /%s\n", nameStr)
		}

	case *ast.WhenCommandUsedCommand:
		expectedCmdVal := e.evalExpression(n.CommandName, env)
		expectedCmd := fmt.Sprintf("%v", expectedCmdVal)
		e.discordClient.Handlers.InteractionCreate = append(e.discordClient.Handlers.InteractionCreate, func(interaction *discord.Interaction) {
			if interaction.Type == 2 && interaction.Data.Name == expectedCmd {
				handlerEnv := NewEnclosedEnvironment(env)
				handlerEnv.Set("__context_interaction", interaction)
				
				// Inject options and subcommands
				injectOptions(interaction.Data.Options, handlerEnv)
				
				e.evalBlock(n.Body, handlerEnv)
			}
		})

	case *ast.WhenContextUsedCommand:
		expectedNameVal := e.evalExpression(n.Name, env)
		expectedName := fmt.Sprintf("%v", expectedNameVal)
		e.discordClient.Handlers.InteractionCreate = append(e.discordClient.Handlers.InteractionCreate, func(interaction *discord.Interaction) {
			if interaction.Type == 2 && interaction.Data.Name == expectedName {
				handlerEnv := NewEnclosedEnvironment(env)
				handlerEnv.Set("__context_interaction", interaction)
				if n.Type == "user" {
					handlerEnv.Set("target_user", interaction.Data.ID)
				} else if n.Type == "message" {
					handlerEnv.Set("target_message", interaction.Message)
				}
				e.evalBlock(n.Body, handlerEnv)
			}
		})

	case *ast.ReplyWithEmbedCommand:
		titleVal := e.evalExpression(n.Title, env)
		titleStr := fmt.Sprintf("%v", titleVal)
		descVal := e.evalExpression(n.Description, env)
		descStr := fmt.Sprintf("%v", descVal)
		embed := discord.Embed{
			Title:       titleStr,
			Description: descStr,
			Color:       0x00d9ff,
		}
		if contextMsg, ok := env.Get("__context_message"); ok {
			if msgObj, isMsg := contextMsg.(*discord.Message); isMsg {
				e.discordClient.ReplyToMessage(msgObj.ChannelID, msgObj.ID, "", []discord.Embed{embed}, nil, nil)
			}
		} else if contextInteraction, ok := env.Get("__context_interaction"); ok {
			if intObj, isInt := contextInteraction.(*discord.Interaction); isInt {
				e.discordClient.ReplyToInteraction(intObj.ID, intObj.Token, 4, "", []discord.Embed{embed}, nil, nil)
			}
		}

	case *ast.ReplyWithButtonCommand:
		btnIdVal := e.evalExpression(n.ButtonID, env)
		btnIdStr := fmt.Sprintf("%v", btnIdVal)
		labelVal := e.evalExpression(n.Label, env)
		labelStr := fmt.Sprintf("%v", labelVal)
		styleInt := 1
		if n.Style == "secondary" {
			styleInt = 2
		} else if n.Style == "success" {
			styleInt = 3
		} else if n.Style == "danger" {
			styleInt = 4
		}
		btn := discord.CreateButton(btnIdStr, labelStr, styleInt)
		row := discord.CreateActionRow(btn)
		if contextMsg, ok := env.Get("__context_message"); ok {
			if msgObj, isMsg := contextMsg.(*discord.Message); isMsg {
				e.discordClient.ReplyToMessage(msgObj.ChannelID, msgObj.ID, "", nil, []discord.Component{row}, nil)
			}
		} else if contextInteraction, ok := env.Get("__context_interaction"); ok {
			if intObj, isInt := contextInteraction.(*discord.Interaction); isInt {
				e.discordClient.ReplyToInteraction(intObj.ID, intObj.Token, 4, "", nil, []discord.Component{row}, nil)
			}
		}

	case *ast.WhenButtonClickedCommand:
		expectedBtnVal := e.evalExpression(n.ButtonID, env)
		expectedBtn := fmt.Sprintf("%v", expectedBtnVal)
		e.discordClient.Handlers.InteractionCreate = append(e.discordClient.Handlers.InteractionCreate, func(interaction *discord.Interaction) {
			if interaction.Type == 3 && interaction.Data.CustomID == expectedBtn {
				handlerEnv := NewEnclosedEnvironment(env)
				handlerEnv.Set("__context_interaction", interaction)
				e.evalBlock(n.Body, handlerEnv)
			}
		})

	case *ast.WhenChannelCreatedCommand:
		e.discordClient.Handlers.ChannelCreate = append(e.discordClient.Handlers.ChannelCreate, func(ch *discord.Channel) {
			handlerEnv := NewEnclosedEnvironment(env)
			handlerEnv.Set("created_channel", ch)
			e.evalBlock(n.Body, handlerEnv)
		})

	case *ast.WhenMemberJoinsCommand:
		e.discordClient.Handlers.GuildMemberAdd = append(e.discordClient.Handlers.GuildMemberAdd, func(data map[string]interface{}) {
			handlerEnv := NewEnclosedEnvironment(env)
			handlerEnv.Set("joined_member", data)
			e.evalBlock(n.Body, handlerEnv)
		})

	case *ast.WhenMemberLeavesCommand:
		e.discordClient.Handlers.GuildMemberRemove = append(e.discordClient.Handlers.GuildMemberRemove, func(data map[string]interface{}) {
			handlerEnv := NewEnclosedEnvironment(env)
			handlerEnv.Set("left_member", data)
			e.evalBlock(n.Body, handlerEnv)
		})

	case *ast.WhenDiscordEventCommand:
		expectedEventVal := e.evalExpression(n.EventName, env)
		expectedEvent := fmt.Sprintf("%v", expectedEventVal)
		e.discordClient.Handlers.GenericEvent = append(e.discordClient.Handlers.GenericEvent, func(eventName string, payload map[string]interface{}) {
			if eventName == expectedEvent || expectedEvent == "ANY" {
				handlerEnv := NewEnclosedEnvironment(env)
				handlerEnv.Set("event_name", eventName)
				handlerEnv.Set("event_data", payload)
				e.evalBlock(n.Body, handlerEnv)
			}
		})

	case *ast.ReplyWithMenuCommand:
		menuIdVal := e.evalExpression(n.MenuID, env)
		menuIdStr := fmt.Sprintf("%v", menuIdVal)
		discordOptions := []discord.SelectOption{}
		for _, opt := range n.Options {
			labelVal := e.evalExpression(opt.Label, env)
			labelStr := fmt.Sprintf("%v", labelVal)
			valVal := e.evalExpression(opt.Value, env)
			valStr := fmt.Sprintf("%v", valVal)
			descStr := ""
			if opt.Description != nil {
				descVal := e.evalExpression(opt.Description, env)
				descStr = fmt.Sprintf("%v", descVal)
			}
			discordOptions = append(discordOptions, discord.SelectOption{
				Label:       labelStr,
				Value:       valStr,
				Description: descStr,
			})
		}
		menu := discord.CreateSelectMenu(menuIdStr, discordOptions)
		row := discord.CreateActionRow(menu)
		if contextMsg, ok := env.Get("__context_message"); ok {
			if msgObj, isMsg := contextMsg.(*discord.Message); isMsg {
				e.discordClient.ReplyToMessage(msgObj.ChannelID, msgObj.ID, "", nil, []discord.Component{row}, nil)
			}
		} else if contextInteraction, ok := env.Get("__context_interaction"); ok {
			if intObj, isInt := contextInteraction.(*discord.Interaction); isInt {
				e.discordClient.ReplyToInteraction(intObj.ID, intObj.Token, 4, "", nil, []discord.Component{row}, nil)
			}
		}

	case *ast.WhenMenuUsedCommand:
		expectedMenuVal := e.evalExpression(n.MenuID, env)
		expectedMenu := fmt.Sprintf("%v", expectedMenuVal)
		e.discordClient.Handlers.InteractionCreate = append(e.discordClient.Handlers.InteractionCreate, func(interaction *discord.Interaction) {
			if interaction.Type == 3 && interaction.Data.CustomID == expectedMenu {
				handlerEnv := NewEnclosedEnvironment(env)
				handlerEnv.Set("__context_interaction", interaction)
				handlerEnv.Set("interaction_values", interaction.Data.Values)
				if len(interaction.Data.Values) > 0 {
					handlerEnv.Set("interaction_value", interaction.Data.Values[0])
				}
				e.evalBlock(n.Body, handlerEnv)
			}
		})

	case *ast.DeleteMessageCommand:
		if contextMsg, ok := env.Get("__context_message"); ok {
			if msgObj, isMsg := contextMsg.(*discord.Message); isMsg {
				err := e.discordClient.DeleteMessage(msgObj.ChannelID, msgObj.ID)
				if err != nil {
					logger.Error("Failed to delete message: %v\n", err)
				}
			}
		}

	case *ast.EditMessageCommand:
		newTextVal := e.evalExpression(n.NewText, env)
		newText := fmt.Sprintf("%v", newTextVal)
		if contextMsg, ok := env.Get("__context_message"); ok {
			if msgObj, isMsg := contextMsg.(*discord.Message); isMsg {
				err := e.discordClient.EditMessage(msgObj.ChannelID, msgObj.ID, newText)
				if err != nil {
					fmt.Printf("Failed to edit message: %v\n", err)
				}
			}
		}

	case *ast.CreateChannelCommand:
		nameVal := e.evalExpression(n.Name, env)
		nameStr := fmt.Sprintf("%v", nameVal)
		if contextMsg, ok := env.Get("__context_message"); ok {
			if msgObj, isMsg := contextMsg.(*discord.Message); isMsg {
				err := e.discordClient.CreateChannel(msgObj.GuildID, nameStr)
				if err != nil {
					fmt.Printf("Failed to create channel: %v\n", err)
				}
			}
		}

	case *ast.CreateRoleCommand:
		nameVal := e.evalExpression(n.Name, env)
		nameStr := fmt.Sprintf("%v", nameVal)
		colorVal := e.evalExpression(n.Color, env)
		var color int
		if colorVal != nil {
			fmt.Sscanf(fmt.Sprintf("%v", colorVal), "%d", &color)
		}
		if contextMsg, ok := env.Get("__context_message"); ok {
			if msgObj, isMsg := contextMsg.(*discord.Message); isMsg {
				e.discordClient.CreateRole(msgObj.GuildID, nameStr, color)
			}
		}

	case *ast.DeleteRoleCommand:
		roleIdVal := e.evalExpression(n.RoleID, env)
		roleID := fmt.Sprintf("%v", roleIdVal)
		if contextMsg, ok := env.Get("__context_message"); ok {
			if msgObj, isMsg := contextMsg.(*discord.Message); isMsg {
				e.discordClient.DeleteRole(msgObj.GuildID, roleID)
			}
		}

	case *ast.DeleteChannelCommand:
		channelIDVal := e.evalExpression(n.ChannelID, env)
		channelID := fmt.Sprintf("%v", channelIDVal)
		err := e.discordClient.DeleteChannel(channelID)
		if err != nil {
			logger.Error("Failed to delete channel: %v\n", err)
		}

	case *ast.ReplyWithAttachmentCommand:
		filepathVal := e.evalExpression(n.FilePath, env)
		filepathStr := fmt.Sprintf("%v", filepathVal)
		filename := filepathStr
		parts := strings.Split(filepathStr, "/")
		if len(parts) > 0 {
			filename = parts[len(parts)-1]
		}
		if contextMsg, ok := env.Get("__context_message"); ok {
			if msgObj, isMsg := contextMsg.(*discord.Message); isMsg {
				err := e.discordClient.ReplyWithFileToMessage(msgObj.ChannelID, msgObj.ID, "", filename, filepathStr)
				if err != nil {
					logger.Error("Failed to reply with attachment: %v\n", err)
				}
			}
		} else if contextInteraction, ok := env.Get("__context_interaction"); ok {
			if intObj, isInt := contextInteraction.(*discord.Interaction); isInt {
				err := e.discordClient.ReplyWithFileToInteraction(intObj.ID, intObj.Token, "", filename, filepathStr)
				if err != nil {
					logger.Error("Failed to reply with attachment to interaction: %v\n", err)
				}
			}
		}

	case *ast.JoinVoiceCommand:
		channelIDVal := e.evalExpression(n.ChannelID, env)
		channelID := fmt.Sprintf("%v", channelIDVal)
		if contextMsg, ok := env.Get("__context_message"); ok {
			if msgObj, isMsg := contextMsg.(*discord.Message); isMsg {
				e.discordClient.JoinVoiceChannel(msgObj.GuildID, channelID)
			}
		}

	case *ast.PlayAudioCommand:
		audioURLVal := e.evalExpression(n.AudioURL, env)
		audioURL := fmt.Sprintf("%v", audioURLVal)
		e.discordClient.PlayAudio(audioURL)

	case *ast.IfUserHasPermissionStatement:
		permissionVal := e.evalExpression(n.Permission, env)
		permission := fmt.Sprintf("%v", permissionVal)
		permsMap := map[string]int{
			"ADMINISTRATOR":   8,
			"MANAGE_MESSAGES": 8192,
			"KICK_MEMBERS":    2,
			"BAN_MEMBERS":     4,
		}
		_ = permsMap[permission]
		hasPerm := true // Mocking true
		if hasPerm {
			e.evalBlock(n.Body, env)
		}

	case *ast.CreateAutoModRuleCommand:
		nameVal := e.evalExpression(n.Name, env)
		name := fmt.Sprintf("%v", nameVal)
		keywordVal := e.evalExpression(n.KeywordFilter, env)
		keyword := fmt.Sprintf("%v", keywordVal)
		if contextMsg, ok := env.Get("__context_message"); ok {
			if msgObj, isMsg := contextMsg.(*discord.Message); isMsg {
				e.discordClient.CreateAutoModRule(msgObj.GuildID, name, keyword)
			}
		}

	case *ast.ReplyWithStickerCommand:
		stickerIDVal := e.evalExpression(n.StickerID, env)
		stickerID := fmt.Sprintf("%v", stickerIDVal)
		if contextMsg, ok := env.Get("__context_message"); ok {
			if msgObj, isMsg := contextMsg.(*discord.Message); isMsg {
				e.discordClient.ReplyToMessage(msgObj.ChannelID, msgObj.ID, "", nil, nil, []string{stickerID})
			}
		} else if contextInteraction, ok := env.Get("__context_interaction"); ok {
			if intObj, isInt := contextInteraction.(*discord.Interaction); isInt {
				e.discordClient.ReplyToInteraction(intObj.ID, intObj.Token, 4, "", nil, nil, []string{stickerID})
			}
		}

	case *ast.CreateWebhookCommand:
		nameVal := e.evalExpression(n.Name, env)
		name := fmt.Sprintf("%v", nameVal)
		if contextMsg, ok := env.Get("__context_message"); ok {
			if msgObj, isMsg := contextMsg.(*discord.Message); isMsg {
				e.discordClient.CreateWebhook(msgObj.ChannelID, name)
			}
		}

	case *ast.SendViaWebhookCommand:
		contentVal := e.evalExpression(n.Content, env)
		content := fmt.Sprintf("%v", contentVal)
		idVal := e.evalExpression(n.WebhookID, env)
		id := fmt.Sprintf("%v", idVal)
		tokenVal := e.evalExpression(n.WebhookToken, env)
		token := fmt.Sprintf("%v", tokenVal)
		e.discordClient.SendWebhook(id, token, content)

	case *ast.SendDMCommand:
		targetIdVal := e.evalExpression(n.TargetID, env)
		targetID := fmt.Sprintf("%v", targetIdVal)
		msgVal := e.evalExpression(n.Message, env)
		msgText := fmt.Sprintf("%v", msgVal)
		e.discordClient.SendDM(targetID, msgText)

	case *ast.GetBotInfoCommand:
		info, err := e.discordClient.GetApplicationInfo()
		if err == nil {
			env.Set("bot_info", info)
		}
		return nil

	case *ast.ExpressionStatement:
		e.evalExpression(n.Expression, env)
	
	default:
		e.evalExtendedStatement(node, env)
		e.evalComponentsV2Statement(node, env)
	}
	return nil
}

func (e *Engine) evalBlock(block *ast.BlockStatement, env *Environment) error {
	for _, stmt := range block.Statements {
		if err := e.evalStatement(stmt, env); err != nil {
			return err
		}
	}
	return nil
}

func toFloat(v interface{}) (float64, bool) {
	switch val := v.(type) {
	case float64:
		return val, true
	case int:
		return float64(val), true
	case string:
		var f float64
		fmt.Sscanf(val, "%f", &f)
		return f, true
	}
	return 0, false
}

func (e *Engine) evalExpression(node ast.Expression, env *Environment) interface{} {
	switch n := node.(type) {
	case *ast.StringLiteral:
		return n.Value
	case *ast.NumberLiteral:
		return n.Value
	case *ast.Identifier:
		if val, ok := env.Get(n.Value); ok {
			return val
		}
		return n.Value
	case *ast.BinaryExpression:
		left := e.evalExpression(n.Left, env)
		right := e.evalExpression(n.Right, env)

		switch n.Operator {
		case "+":
			if l, ok := left.(float64); ok {
				if r, ok := right.(float64); ok {
					return l + r
				}
			}
			return fmt.Sprintf("%v%v", left, right)
		case "==":
			return fmt.Sprintf("%v", left) == fmt.Sprintf("%v", right)
		case "!=":
			return fmt.Sprintf("%v", left) != fmt.Sprintf("%v", right)
		case "<":
			l, _ := toFloat(left)
			r, _ := toFloat(right)
			return l < r
		case ">":
			l, _ := toFloat(left)
			r, _ := toFloat(right)
			return l > r
		}
	case *ast.MemberExpression:
		obj := e.evalExpression(n.Object, env)
		prop := ""
		if ident, ok := n.Property.(*ast.Identifier); ok {
			prop = ident.Value
		} else {
			prop = fmt.Sprintf("%v", e.evalExpression(n.Property, env))
		}
		return resolveMember(obj, prop)

	case *ast.ArrayLiteral:
		var elements []interface{}
		for _, el := range n.Elements {
			elements = append(elements, e.evalExpression(el, env))
		}
		return elements

	case *ast.ObjectLiteral:
		obj := make(map[string]interface{})
		for k, v := range n.Pairs {
			obj[k] = e.evalExpression(v, env)
		}
		return obj

	case *ast.CallExpression:
		funcVal := e.evalExpression(n.Function, env)
		
		// INTERCEPT DIRECT NPM PROXY CALLS (e.g. moment())
		if proxy, ok := funcVal.(npmProxy); ok {
			var args []interface{}
			for _, argExpr := range n.Args {
				args = append(args, e.evalExpression(argExpr, env))
			}
			params := append([]interface{}{proxy.name, "__direct_call__"}, args...)
			res, err := e.bridgeRequest("call", params)
			if err != nil {
				logger.Error("Bridge direct call failed: %v", err)
				return nil
			}
			return res
		}

		if f, ok := funcVal.(func(...interface{}) interface{}); ok {
			var args []interface{}
			for _, argExpr := range n.Args {
				args = append(args, e.evalExpression(argExpr, env))
			}
			return f(args...)
		}
		// Handle methods
		if n.Function != nil {
			if member, ok := n.Function.(*ast.MemberExpression); ok {
				obj := e.evalExpression(member.Object, env)
				
				// INTERCEPT NPM PROXY CALLS
				if proxy, ok := obj.(npmProxy); ok {
					methodName := ""
					if ident, ok := member.Property.(*ast.Identifier); ok {
						methodName = ident.Value
					}
					var args []interface{}
					for _, argExpr := range n.Args {
						args = append(args, e.evalExpression(argExpr, env))
					}
					
					params := append([]interface{}{proxy.name, methodName}, args...)
					res, err := e.bridgeRequest("call", params)
					if err != nil {
						logger.Error("Bridge call failed: %v", err)
						return nil
					}
					return res
				}

				methodName := ""
				if ident, ok := member.Property.(*ast.Identifier); ok {
					methodName = ident.Value
				}
				var args []interface{}
				for _, argExpr := range n.Args {
					args = append(args, e.evalExpression(argExpr, env))
				}
				return callMethod(obj, methodName, args)
			}
		}
	}
	return nil
}

func resolveMember(obj interface{}, prop string) interface{} {
	if obj == nil {
		return nil
	}

	// Handle maps (for Discord objects often represented as maps)
	if m, ok := obj.(map[string]interface{}); ok {
		return m[prop]
	}

	// Handle slices/arrays if prop is an index
	if s, ok := obj.([]string); ok {
		var idx int
		_, err := fmt.Sscanf(prop, "%d", &idx)
		if err == nil && idx >= 0 && idx < len(s) {
			return s[idx]
		}
		if prop == "length" {
			return len(s)
		}
	}
	if s, ok := obj.([]interface{}); ok {
		var idx int
		_, err := fmt.Sscanf(prop, "%d", &idx)
		if err == nil && idx >= 0 && idx < len(s) {
			return s[idx]
		}
		if prop == "length" {
			return len(s)
		}
	}
	
	// Handle Discord types specifically if they are not maps
	switch v := obj.(type) {
	case *discord.Message:
		switch prop {
		case "id": return v.ID
		case "content": return v.Content
		case "author": return v.Author
		case "guildId": return v.GuildID
		case "channelId": return v.ChannelID
		}
	case discord.User:
		switch prop {
		case "id": return v.ID
		case "username": return v.Username
		case "avatarURL": return fmt.Sprintf("https://cdn.discordapp.com/avatars/%s/avatar.png", v.ID)
		}
	case discord.Member:
		switch prop {
		case "user": return v.User
		case "id": return v.User.ID
		case "roles": return v.Roles
		}
	}

	return nil
}

func callMethod(obj interface{}, method string, args []interface{}) interface{} {
	if obj == nil {
		return nil
	}
	// Basic string/array methods for REAPER-2.0
	if s, ok := obj.([]string); ok {
		if method == "join" {
			sep := " "
			if len(args) > 0 {
				sep = fmt.Sprintf("%v", args[0])
			}
			return strings.Join(s, sep)
		}
		if method == "slice" {
			start := 0
			if len(args) > 0 {
				fmt.Sscanf(fmt.Sprintf("%v", args[0]), "%d", &start)
			}
			if start >= len(s) { return []string{} }
			return s[start:]
		}
	}
	if str, ok := obj.(string); ok {
		if method == "startsWith" {
			if len(args) > 0 {
				return strings.HasPrefix(str, fmt.Sprintf("%v", args[0]))
			}
		}
		if method == "includes" || method == "match" {
			if len(args) > 0 {
				return strings.Contains(str, fmt.Sprintf("%v", args[0]))
			}
		}
	}
	return nil
}

func (e *Engine) HasActiveBot() bool {
	return e.discordClient != nil && e.discordClient.IsRunning()
}

func (e *Engine) WaitForInterrupt() {
	sc := make(chan os.Signal, 1)
	signal.Notify(sc, syscall.SIGINT, syscall.SIGTERM, os.Interrupt)
	<-sc
	if e.discordClient != nil {
		e.discordClient.Stop()
	}
}
