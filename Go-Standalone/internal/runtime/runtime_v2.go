package runtime

import (
	"fmt"
	"github.com/ezlang/ezbot/internal/ast"
	"github.com/ezlang/ezbot/internal/discord"
	"github.com/ezlang/ezbot/internal/logger"
)

func (e *Engine) evalComponentsV2Statement(node ast.Statement, env *Environment) error {
	switch n := node.(type) {
	case *ast.ReplyWithUserMenuCommand:
		menuIdVal := e.evalExpression(n.MenuID, env)
		menuIdStr := fmt.Sprintf("%v", menuIdVal)
		menu := discord.CreateUserSelectMenu(menuIdStr)
		e.replyWithComponent(menu, env)

	case *ast.ReplyWithRoleMenuCommand:
		menuIdVal := e.evalExpression(n.MenuID, env)
		menuIdStr := fmt.Sprintf("%v", menuIdVal)
		menu := discord.CreateRoleSelectMenu(menuIdStr)
		e.replyWithComponent(menu, env)

	case *ast.ReplyWithChannelMenuCommand:
		menuIdVal := e.evalExpression(n.MenuID, env)
		menuIdStr := fmt.Sprintf("%v", menuIdVal)
		menu := discord.CreateChannelSelectMenu(menuIdStr)
		e.replyWithComponent(menu, env)

	case *ast.ReplyWithMentionableMenuCommand:
		menuIdVal := e.evalExpression(n.MenuID, env)
		menuIdStr := fmt.Sprintf("%v", menuIdVal)
		menu := discord.CreateMentionableSelectMenu(menuIdStr)
		e.replyWithComponent(menu, env)

	case *ast.RegisterContextCommand:
		nameVal := e.evalExpression(n.Name, env)
		nameStr := fmt.Sprintf("%v", nameVal)
		cmdType := 2 // USER
		if n.Type == "message" {
			cmdType = 3 // MESSAGE
		}

		cmd := discord.AppCommand{
			Name: nameStr,
			Type: cmdType,
		}

		if e.discordClient.AppID == "" {
			info, err := e.discordClient.GetApplicationInfo()
			if err == nil && info["id"] != nil {
				e.discordClient.AppID = info["id"].(string)
			}
		}

		err := e.discordClient.RegisterGlobalSlashCommand(e.discordClient.AppID, cmd)
		if err != nil {
			logger.Error("Failed to register context command '%s': %v\n", nameStr, err)
		} else {
			logger.Info("Registered context command: %s\n", nameStr)
		}

	case *ast.WhenContextUsedCommand:
		expectedNameVal := e.evalExpression(n.Name, env)
		expectedName := fmt.Sprintf("%v", expectedNameVal)

		e.discordClient.Handlers.InteractionCreate = append(e.discordClient.Handlers.InteractionCreate, func(interaction *discord.Interaction) {
			if (interaction.Type == 2) && interaction.Data.Name == expectedName {
				// Type 2 Application Command (User/Message context menus arrive as App Commands)
				handlerEnv := NewEnclosedEnvironment(env)
				handlerEnv.Set("__context_interaction", interaction)
				// For User/Message context menus, the target ID is in TargetID (we'd need to parse it in InteractionData)
				e.evalBlock(n.Body, handlerEnv)
			}
		})
	}
	return nil
}

func (e *Engine) replyWithComponent(comp discord.Component, env *Environment) {
	row := discord.CreateActionRow(comp)
	if contextMsg, ok := env.Get("__context_message"); ok {
		if msgObj, isMsg := contextMsg.(*discord.Message); isMsg {
			e.discordClient.ReplyToMessage(msgObj.ChannelID, msgObj.ID, "", nil, []discord.Component{row}, nil)
		}
	} else if contextInteraction, ok := env.Get("__context_interaction"); ok {
		if intObj, isInt := contextInteraction.(*discord.Interaction); isInt {
			e.discordClient.ReplyToInteraction(intObj.ID, intObj.Token, 4, "", nil, []discord.Component{row}, nil)
		}
	}
}
