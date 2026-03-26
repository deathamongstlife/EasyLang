package parser

import (
	"fmt"
	"github.com/ezlang/ezbot/internal/ast"
	"github.com/ezlang/ezbot/internal/lexer"
)

type Parser struct {
	tokens  []lexer.Token
	current int
}

func New(tokens []lexer.Token) *Parser {
	return &Parser{tokens: tokens, current: 0}
}

func (p *Parser) Parse() (*ast.Program, error) {
	program := &ast.Program{}
	program.Statements = []ast.Statement{}

	for !p.isAtEnd() {
		stmt, err := p.parseStatement()
		if err != nil {
			return nil, err
		}
		if stmt != nil {
			program.Statements = append(program.Statements, stmt)
		}
	}

	return program, nil
}

func (p *Parser) parseStatement() (ast.Statement, error) {
	tok := p.peek()

	if tok.Type == lexer.TokenInclude || tok.Literal == "include" {
		return p.parseIncludeCommand()
	}
	if tok.Type == lexer.TokenLoad || tok.Literal == "load" {
		return p.parseLoadPackageCommand()
	}
	if tok.Type == lexer.TokenStart {
		return p.parseStartBotCommand()
	}
	if tok.Type == lexer.TokenWhen {
		return p.parseWhenCommand()
	}
	if tok.Type == lexer.TokenReply {
		return p.parseReplyCommand()
	}
	if tok.Type == lexer.TokenBan {
		return p.parseBanCommand()
	}
	if tok.Type == lexer.TokenUnban {
		return p.parseUnbanCommand()
	}
	if tok.Type == lexer.TokenKick {
		return p.parseKickCommand()
	}
	if tok.Type == lexer.TokenPurge {
		return p.parsePurgeCommand()
	}
	if tok.Type == lexer.TokenTimeout {
		return p.parseTimeoutCommand()
	}
	if tok.Type == lexer.TokenAdd {
		return p.parseAddRoleCommand()
	}
	if tok.Type == lexer.TokenRemove {
		return p.parseRemoveRoleCommand()
	}
	if tok.Type == lexer.TokenIf {
		return p.parseIfCommand()
	}
	if tok.Type == lexer.TokenSet || tok.Literal == "set" {
		return p.parseSetCommand()
	}
	if tok.Type == lexer.TokenCreate {
		return p.parseCreateCommand()
	}
	if tok.Type == lexer.TokenDelete {
		return p.parseDeleteCommand()
	}
	if tok.Type == lexer.TokenEdit {
		return p.parseEditCommand()
	}
	if tok.Type == lexer.TokenDefer {
		return p.parseDeferReplyCommand()
	}
	if tok.Type == lexer.TokenSend || tok.Literal == "send" {
		return p.parseSendCommand()
	}
	if tok.Type == lexer.TokenGet || tok.Literal == "get" {
		return p.parseGetCommand()
	}
	if tok.Literal == "register" {
		if p.peekNext() != nil && p.peekNext().Literal == "slash" {
			return p.parseRegisterSlashCommand()
		}
		if p.peekNext() != nil && p.peekNext().Type == lexer.TokenContext {
			return p.parseRegisterContextCommand()
		}
		if p.peekNext() != nil && p.peekNext().Type == lexer.TokenUser || p.peekNext().Type == lexer.TokenMessage {
			return p.parseRegisterContextCommand()
		}
	}
	if tok.Type == lexer.TokenJoin || tok.Literal == "join" {
		return p.parseJoinVoiceCommand()
	}
	if tok.Type == lexer.TokenPlay || tok.Literal == "play" {
		return p.parsePlayAudioCommand()
	}

	if tok.Type == lexer.TokenIdent {
		expr := p.parseExpression()
		if expr != nil {
			return &ast.ExpressionStatement{Expression: expr}, nil
		}
	}

	// For now skip unknown top level tokens
	p.advance()
	return nil, nil
}



func (p *Parser) parseJoinVoiceCommand() (ast.Statement, error) {
	p.advance() // consume 'join'
	if p.peek().Type != lexer.TokenVoice && p.peek().Literal != "voice" {
		return nil, fmt.Errorf("Expected 'voice' after 'join'")
	}
	p.advance() // consume 'voice'
	
	if p.peek().Type == lexer.TokenChannel || p.peek().Literal == "channel" {
		p.advance() // consume 'channel' optionally
	}
	
	channelId := p.parseExpression()
	return &ast.JoinVoiceCommand{ChannelID: channelId}, nil
}

func (p *Parser) parsePlayAudioCommand() (ast.Statement, error) {
	p.advance() // consume 'play'
	if p.peek().Type != lexer.TokenAudio && p.peek().Literal != "audio" {
		return nil, fmt.Errorf("Expected 'audio' after 'play'")
	}
	p.advance() // consume 'audio'
	
	if p.peek().Literal == "from" {
	    p.advance() // consume 'from' optionally
	}
	
	audioURL := p.parseExpression()
	return &ast.PlayAudioCommand{AudioURL: audioURL}, nil
}

func (p *Parser) parseStartBotCommand() (ast.Statement, error) {
	p.advance() // consume 'start'
	if p.peek().Type != lexer.TokenBot {
		return nil, fmt.Errorf("Expected 'bot' after 'start'")
	}
	p.advance() // consume 'bot'
	if p.peek().Type != lexer.TokenWith {
		return nil, fmt.Errorf("Expected 'with' after 'start bot'")
	}
	p.advance() // consume 'with'
	if p.peek().Type != lexer.TokenToken {
		return nil, fmt.Errorf("Expected 'token' after 'start bot with'")
	}
	p.advance() // consume 'token'

	tokenExpr := p.parseExpression()
	return &ast.StartBotCommand{Token: tokenExpr}, nil
}

func (p *Parser) parseWhenCommand() (ast.Statement, error) {
	p.advance() // consume 'when'

	if p.peek().Literal == "discord" {
		p.advance()
		if p.peek().Type == lexer.TokenEvent || p.peek().Literal == "event" {
			p.advance()
			eventName := p.parseExpression()
			if p.peek().Literal == "occurs" || p.peek().Literal == "happens" || p.peek().Literal == "triggers" {
				p.advance()
			}
			body := p.parseBlockUntilEndWhen()
			return &ast.WhenDiscordEventCommand{EventName: eventName, Body: body}, nil
		}
	}

	if p.peek().Type == lexer.TokenBot {
		p.advance()
		if p.peek().Type != lexer.TokenStarts {
			return nil, fmt.Errorf("Expected 'starts' after 'when bot'")
		}
		p.advance()
		body := p.parseBlockUntilEndWhen()
		return &ast.WhenBotStartsCommand{Body: body}, nil
	}

	if p.peek().Type == lexer.TokenMessage {
		p.advance()
		if p.peek().Type == lexer.TokenSays || p.peek().Literal == "says" {
			p.advance()
			condition := p.parseExpression()
			body := p.parseBlockUntilEndWhen()
			return &ast.WhenMessageCommand{Condition: condition, Body: body}, nil
		}
		if p.peek().Type == lexer.TokenStarts || p.peek().Literal == "starts" {
			p.advance() // consume 'starts'
			if p.peek().Type == lexer.TokenWith || p.peek().Literal == "with" {
				p.advance() // consume 'with'
			}
			condition := p.parseExpression()
			body := p.parseBlockUntilEndWhen()
			return &ast.WhenMessageCommand{Condition: condition, Body: body}, nil
		}
		if p.peek().Literal == "is" {
			p.advance()
			if p.peek().Literal == "sent" {
				p.advance()
				body := p.parseBlockUntilEndWhen()
				return &ast.WhenMessageSentCommand{Body: body}, nil
			}
		}
		return nil, fmt.Errorf("Expected 'says' or 'is sent' after 'when message'")
	}

	if p.peek().Type == lexer.TokenChannel {
		p.advance()
		if p.peek().Literal == "is" {
			p.advance()
			if p.peek().Type == lexer.TokenCreated || p.peek().Literal == "created" {
				p.advance()
				body := p.parseBlockUntilEndWhen()
				return &ast.WhenChannelCreatedCommand{Body: body}, nil
			}
		}
	}

	if p.peek().Type == lexer.TokenMember || p.peek().Literal == "member" {
		p.advance()
		if p.peek().Type == lexer.TokenJoins || p.peek().Literal == "joins" {
			p.advance()
			body := p.parseBlockUntilEndWhen()
			return &ast.WhenMemberJoinsCommand{Body: body}, nil
		}
		if p.peek().Type == lexer.TokenLeaves || p.peek().Literal == "leaves" {
			p.advance()
			body := p.parseBlockUntilEndWhen()
			return &ast.WhenMemberLeavesCommand{Body: body}, nil
		}
	}

	if p.peek().Type == lexer.TokenContext {
		p.advance()
		if p.peek().Literal == "command" || p.peek().Literal == "menu" {
			p.advance()
		}
		name := p.parseExpression()
		if p.peek().Literal == "is" {
			p.advance()
			if p.peek().Type == lexer.TokenUsed || p.peek().Literal == "used" {
				p.advance()
			}
		}
		body := p.parseBlockUntilEndWhen()
		return &ast.WhenContextUsedCommand{Name: name, Body: body, Type: "any"}, nil
	}

	if p.peek().Type == lexer.TokenUser && p.peekNext() != nil && p.peekNext().Type == lexer.TokenContext {
		p.advance()
		p.advance()
		name := p.parseExpression()
		if p.peek().Literal == "is" {
			p.advance()
			if p.peek().Type == lexer.TokenUsed || p.peek().Literal == "used" {
				p.advance()
			}
		}
		body := p.parseBlockUntilEndWhen()
		return &ast.WhenContextUsedCommand{Name: name, Body: body, Type: "user"}, nil
	}

	if p.peek().Type == lexer.TokenMessage && p.peekNext() != nil && p.peekNext().Type == lexer.TokenContext {
		p.advance()
		p.advance()
		name := p.parseExpression()
		if p.peek().Literal == "is" {
			p.advance()
			if p.peek().Type == lexer.TokenUsed || p.peek().Literal == "used" {
				p.advance()
			}
		}
		body := p.parseBlockUntilEndWhen()
		return &ast.WhenContextUsedCommand{Name: name, Body: body, Type: "message"}, nil
	}

	if p.peek().Literal == "slash" {
		p.advance()
		if p.peek().Literal != "command" {
			return nil, fmt.Errorf("Expected 'command' after 'when slash'")
		}
		p.advance()
		
		name := p.parseExpression()
		
		if p.peek().Literal == "is" {
			p.advance()
			if p.peek().Literal == "used" {
				p.advance()
			}
		}

		body := p.parseBlockUntilEndWhen()
		return &ast.WhenCommandUsedCommand{CommandName: name, Body: body}, nil
	}

	if p.peek().Literal == "button" {
		p.advance()
		buttonId := p.parseExpression()
		if p.peek().Literal == "is" {
			p.advance()
			if p.peek().Literal == "clicked" {
				p.advance()
			}
		}
		body := p.parseBlockUntilEndWhen()
		return &ast.WhenButtonClickedCommand{ButtonID: buttonId, Body: body}, nil
	}

	if p.peek().Type == lexer.TokenMenu {
		p.advance()
		menuId := p.parseExpression()
		if p.peek().Type == lexer.TokenIs || p.peek().Literal == "is" {
			p.advance()
			if p.peek().Type == lexer.TokenUsed || p.peek().Literal == "used" {
				p.advance()
			}
		}
		body := p.parseBlockUntilEndWhen()
		return &ast.WhenMenuUsedCommand{MenuID: menuId, Body: body}, nil
	}

	if (p.peek().Type == lexer.TokenUser || p.peek().Type == lexer.TokenRole || p.peek().Type == lexer.TokenChannel || p.peek().Type == lexer.TokenMentionable) && p.peekNext() != nil && p.peekNext().Type == lexer.TokenMenu {
		p.advance() // consume type
		p.advance() // consume menu
		menuId := p.parseExpression()
		if p.peek().Type == lexer.TokenIs || p.peek().Literal == "is" {
			p.advance()
			if p.peek().Type == lexer.TokenUsed || p.peek().Literal == "used" {
				p.advance()
			}
		}
		body := p.parseBlockUntilEndWhen()
		return &ast.WhenMenuUsedCommand{MenuID: menuId, Body: body}, nil
	}

	return nil, fmt.Errorf("Unknown when command pattern")
}

func (p *Parser) parseDeferReplyCommand() (ast.Statement, error) {
        p.advance() // consume 'defer'
        if p.peek().Type != lexer.TokenReply && p.peek().Literal != "reply" {
                return nil, fmt.Errorf("Expected 'reply' after 'defer'")
        }
        p.advance() // consume 'reply'
        return &ast.DeferReplyCommand{}, nil
}

func (p *Parser) parseEditCommand() (ast.Statement, error) {
	p.advance() // consume 'edit'
	if p.peek().Type == lexer.TokenReply || p.peek().Literal == "reply" {
		p.advance() // consume 'reply'
		if p.peek().Type != lexer.TokenWith && p.peek().Literal != "with" {
			return nil, fmt.Errorf("Expected 'with' after 'edit reply'")
		}
		p.advance() // consume 'with'
		msg := p.parseExpression()
		return &ast.EditReplyCommand{Message: msg}, nil
	}
	if p.peek().Type == lexer.TokenMessage {
		p.advance() // consume 'message'
		if p.peek().Type != lexer.TokenTo && p.peek().Literal != "to" {
			return nil, fmt.Errorf("Expected 'to' after 'edit message'")
		}
		p.advance() // consume 'to'
		msg := p.parseExpression()
		return &ast.EditMessageCommand{NewText: msg}, nil
	}
	return nil, fmt.Errorf("Expected 'reply' or 'message' after 'edit'")
}

func (p *Parser) parseReplyCommand() (ast.Statement, error) {
	p.advance() // consume 'reply'
	if p.peek().Type != lexer.TokenWith {
		return nil, fmt.Errorf("Expected 'with' after 'reply'")
	}
	p.advance() // consume 'with'


	if p.peek().Type == lexer.TokenFile || p.peek().Type == lexer.TokenAttachment || p.peek().Literal == "file" || p.peek().Literal == "attachment" {
		p.advance()
		filePath := p.parseExpression()
		return &ast.ReplyWithAttachmentCommand{FilePath: filePath}, nil
	}

	if p.peek().Type == lexer.TokenEmbed {
	        p.advance() // consume 'embed'
	        title := p.parseExpression()
	        desc := p.parseExpression()
	        return &ast.ReplyWithEmbedCommand{Title: title, Description: desc}, nil
	}
	if p.peek().Type == lexer.TokenSticker || p.peek().Literal == "sticker" {
		p.advance()
		stickerId := p.parseExpression()
		return &ast.ReplyWithStickerCommand{StickerID: stickerId}, nil
	}

	if p.peek().Type == lexer.TokenPoll || p.peek().Literal == "poll" {
	        p.advance() // consume 'poll'
	        title := p.parseExpression()
	        if p.peek().Type != lexer.TokenOptions && p.peek().Literal != "options" {
	                return nil, fmt.Errorf("Expected 'options' after poll title")
	        }
	        p.advance()
	        optionsExpr := p.parseExpression()
	        var opts []ast.Expression
	        if arrayLiteral, ok := optionsExpr.(*ast.ArrayLiteral); ok {
	                opts = arrayLiteral.Elements
	        } else {
	                return nil, fmt.Errorf("Expected array literal for poll options")
	        }
	        return &ast.SendPollCommand{Title: title, Options: opts}, nil
	}

	if p.peek().Literal == "button" {		p.advance() // consume 'button'
		btnId := p.parseExpression()
		if p.peek().Literal != "labeled" {
			return nil, fmt.Errorf("Expected 'labeled' after button ID")
		}
		p.advance()
		label := p.parseExpression()

		style := "primary"
		if p.peek().Literal == "style" {
			p.advance()
			styleExpr := p.parseExpression()
			if s, ok := styleExpr.(*ast.StringLiteral); ok {
				style = s.Value
			}
		}

		return &ast.ReplyWithButtonCommand{
			Message:  &ast.Identifier{Value: "__context_message"}, // default targeting
			ButtonID: btnId,
			Label:    label,
			Style:    style,
		}, nil
	}

	if p.peek().Type == lexer.TokenMenu || p.peek().Literal == "menu" {
		p.advance()
		menuId := p.parseExpression()
		if p.peek().Type != lexer.TokenOptions && p.peek().Literal != "options" {
			return nil, fmt.Errorf("Expected 'options' after menu ID")
		}
		p.advance()
		options, err := p.parseMenuOptions()
		if err != nil {
			return nil, err
		}
		return &ast.ReplyWithMenuCommand{
			Message: &ast.Identifier{Value: "__context_message"}, // default targeting
			MenuID:  menuId,
			Options: options,
		}, nil
	}

	if p.peek().Type == lexer.TokenUser && p.peekNext() != nil && p.peekNext().Literal == "menu" {
		p.advance() // consume user
		p.advance() // consume menu
		menuId := p.parseExpression()
		return &ast.ReplyWithUserMenuCommand{
			Message: &ast.Identifier{Value: "__context_message"},
			MenuID:  menuId,
		}, nil
	}

	if p.peek().Type == lexer.TokenRole && p.peekNext() != nil && p.peekNext().Literal == "menu" {
		p.advance() // consume role
		p.advance() // consume menu
		menuId := p.parseExpression()
		return &ast.ReplyWithRoleMenuCommand{
			Message: &ast.Identifier{Value: "__context_message"},
			MenuID:  menuId,
		}, nil
	}

	if p.peek().Type == lexer.TokenChannel && p.peekNext() != nil && p.peekNext().Literal == "menu" {
		p.advance() // consume channel
		p.advance() // consume menu
		menuId := p.parseExpression()
		return &ast.ReplyWithChannelMenuCommand{
			Message: &ast.Identifier{Value: "__context_message"},
			MenuID:  menuId,
		}, nil
	}

	if p.peek().Type == lexer.TokenMentionable && p.peekNext() != nil && p.peekNext().Literal == "menu" {
		p.advance() // consume mentionable
		p.advance() // consume menu
		menuId := p.parseExpression()
		return &ast.ReplyWithMentionableMenuCommand{
			Message: &ast.Identifier{Value: "__context_message"},
			MenuID:  menuId,
		}, nil
	}

	msg := p.parseExpression()
	return &ast.ReplyWithCommand{Message: msg}, nil
}
func (p *Parser) parseBanCommand() (ast.Statement, error) {
	p.advance() // consume 'ban'
	if p.peek().Type != lexer.TokenUser {
		return nil, fmt.Errorf("Expected 'user' after 'ban'")
	}
	p.advance()

	user := p.parseExpression()
	var reason ast.Expression

	if p.peek().Type == lexer.TokenFor {
		p.advance()
		reason = p.parseExpression()
	}

	return &ast.BanCommand{User: user, Reason: reason}, nil
}

func (p *Parser) parseUnbanCommand() (ast.Statement, error) {
	p.advance() // consume 'unban'
	if p.peek().Type != lexer.TokenUser {
		return nil, fmt.Errorf("Expected 'user' after 'unban'")
	}
	p.advance()

	user := p.parseExpression()
	return &ast.UnbanCommand{User: user}, nil
}

func (p *Parser) parsePurgeCommand() (ast.Statement, error) {
	p.advance() // consume 'purge'
	if p.peek().Type == lexer.TokenMessages {
		p.advance() // consume 'messages'
	}
	amount := p.parseExpression()
	return &ast.PurgeCommand{Amount: amount}, nil
}

func (p *Parser) parseKickCommand() (ast.Statement, error) {
	p.advance() // consume 'kick'
	if p.peek().Type != lexer.TokenUser {
		return nil, fmt.Errorf("Expected 'user' after 'kick'")
	}
	p.advance()

	user := p.parseExpression()
	var reason ast.Expression

	if p.peek().Type == lexer.TokenFor {
		p.advance()
		reason = p.parseExpression()
	}

	return &ast.KickCommand{User: user, Reason: reason}, nil
}

func (p *Parser) parseTimeoutCommand() (ast.Statement, error) {
	p.advance() // consume 'timeout'
	if p.peek().Type != lexer.TokenUser {
		return nil, fmt.Errorf("Expected 'user' after 'timeout'")
	}
	p.advance()

	user := p.parseExpression()

	if p.peek().Type != lexer.TokenFor {
		return nil, fmt.Errorf("Expected 'for' after timeout user expression")
	}
	p.advance()

	duration := p.parseExpression()

	if p.peek().Type == lexer.TokenMinutes || p.peek().Literal == "minute" {
		p.advance()
	}

	return &ast.TimeoutCommand{User: user, Duration: duration}, nil
}

func (p *Parser) parseAddRoleCommand() (ast.Statement, error) {
	p.advance() // consume 'add'
	if p.peek().Type != lexer.TokenRole {
		return nil, fmt.Errorf("Expected 'role' after 'add'")
	}
	p.advance()

	role := p.parseExpression()

	if p.peek().Type != lexer.TokenTo {
		return nil, fmt.Errorf("Expected 'to' after role expression")
	}
	p.advance()

	if p.peek().Type != lexer.TokenUser {
		return nil, fmt.Errorf("Expected 'user' after 'to'")
	}
	p.advance()

	user := p.parseExpression()

	return &ast.AddRoleCommand{Role: role, User: user}, nil
}

func (p *Parser) parseRemoveRoleCommand() (ast.Statement, error) {
	p.advance() // consume 'remove'
	if p.peek().Type != lexer.TokenRole {
		return nil, fmt.Errorf("Expected 'role' after 'remove'")
	}
	p.advance()

	role := p.parseExpression()

	if p.peek().Type != lexer.TokenFrom {
		return nil, fmt.Errorf("Expected 'from' after role expression")
	}
	p.advance()

	if p.peek().Type != lexer.TokenUser {
		return nil, fmt.Errorf("Expected 'user' after 'from'")
	}
	p.advance()

	user := p.parseExpression()

	return &ast.RemoveRoleCommand{Role: role, User: user}, nil
}

func (p *Parser) parseCreateCommand() (ast.Statement, error) {
	p.advance() // consume 'create'
	if p.peek().Type == lexer.TokenThread {
		p.advance()
		name := p.parseExpression()
		return &ast.CreateThreadCommand{Name: name}, nil
	}
	if p.peek().Type == lexer.TokenChannel {
		p.advance()
		name := p.parseExpression()
		var chanType ast.Expression
		if p.peek().Literal == "type" {
			p.advance()
			chanType = p.parseExpression()
		}
		return &ast.CreateChannelCommand{Name: name, Type: chanType}, nil
	}
	if p.peek().Type == lexer.TokenRole {
		p.advance()
		name := p.parseExpression()
		var color ast.Expression
		if p.peek().Literal == "color" {
			p.advance()
			color = p.parseExpression()
		}
		return &ast.CreateRoleCommand{Name: name, Color: color}, nil
	}
	if p.peek().Type == lexer.TokenWebhook || p.peek().Literal == "webhook" {
		p.advance()
		name := p.parseExpression()
		return &ast.CreateWebhookCommand{Name: name}, nil
	}
	if p.peek().Type == lexer.TokenAutomod || p.peek().Literal == "automod" {
		p.advance()
		if p.peek().Type != lexer.TokenRule && p.peek().Literal != "rule" {
			return nil, fmt.Errorf("Expected 'rule' after 'automod'")
		}
		p.advance()
		name := p.parseExpression()
		if p.peek().Type != lexer.TokenBlocking && p.peek().Literal != "blocking" {
			return nil, fmt.Errorf("Expected 'blocking' after automod rule name")
		}
		p.advance()
		keyword := p.parseExpression()
		return &ast.CreateAutoModRuleCommand{Name: name, KeywordFilter: keyword}, nil
	}
	return nil, fmt.Errorf("Expected 'thread' or 'channel' after 'create'")
}

func (p *Parser) parseDeleteCommand() (ast.Statement, error) {
	p.advance() // consume 'delete'
	if p.peek().Type == lexer.TokenMessage {
		p.advance()
		return &ast.DeleteMessageCommand{}, nil
	}
	if p.peek().Type == lexer.TokenChannel {
		p.advance()
		id := p.parseExpression()
		return &ast.DeleteChannelCommand{ChannelID: id}, nil
	}
	if p.peek().Type == lexer.TokenRole {
		p.advance()
		id := p.parseExpression()
		return &ast.DeleteRoleCommand{RoleID: id}, nil
	}
	if p.peek().Type == lexer.TokenWebhook || p.peek().Literal == "webhook" {
		p.advance()
		name := p.parseExpression()
		return &ast.CreateWebhookCommand{Name: name}, nil
	}
	return nil, fmt.Errorf("Expected 'message' or 'channel' after 'delete'")
}

func (p *Parser) parseBlockUntilEndWhen() *ast.BlockStatement {
        block := &ast.BlockStatement{Statements: []ast.Statement{}}

        for !p.isAtEnd() {
                if p.peek().Type == lexer.TokenEnd {
                        p.advance()
                        if p.peek().Type == lexer.TokenWhen {
                                p.advance()
                        }
                        break
                }

                stmt, _ := p.parseStatement()
                if stmt != nil {
                        block.Statements = append(block.Statements, stmt)
                }
        }

        return block
}

func (p *Parser) parseMenuOptions() ([]ast.MenuOption, error) {
        options := []ast.MenuOption{}

        if p.peek().Type != lexer.TokenLBracket {
                return nil, fmt.Errorf("Expected '[' after options")
        }
        p.advance() // consume '['

        for p.peek().Type != lexer.TokenRBracket && !p.isAtEnd() {
                if p.peek().Type == lexer.TokenLBrace {
                        p.advance() // consume '{'
                        opt := ast.MenuOption{}

                        for p.peek().Type != lexer.TokenRBrace && !p.isAtEnd() {
                                keyTok := p.advance()
                                if keyTok.Type != lexer.TokenIdent && keyTok.Type != lexer.TokenString {
                                        return nil, fmt.Errorf("Expected key in menu option, got %v", keyTok.Type)
                                }
                                if p.peek().Type != lexer.TokenColon {
                                        return nil, fmt.Errorf("Expected ':' after key %s, got %v", keyTok.Literal, p.peek().Type)
                                }
                                p.advance() // consume ':'

                                val := p.parseExpression()

                                if keyTok.Literal == "label" {
                                        opt.Label = val
                                } else if keyTok.Literal == "value" {
                                        opt.Value = val
                                } else if keyTok.Literal == "description" {
                                        opt.Description = val
                                }

                                if p.peek().Type == lexer.TokenComma {
                                        p.advance()
                                }
                        }

                        if p.peek().Type != lexer.TokenRBrace {
                                return nil, fmt.Errorf("Expected '}' after menu option")
                        }
                        p.advance() // consume '}'
                        options = append(options, opt)
                }

                if p.peek().Type == lexer.TokenComma {
                        p.advance()
                }
        }

        if p.peek().Type != lexer.TokenRBracket {
                return nil, fmt.Errorf("Expected ']' after menu options")
        }
        p.advance() // consume ']'

        return options, nil
}
func (p *Parser) parseExpression() ast.Expression {
	return p.parseBinaryExpression(0)
}

func (p *Parser) parseBinaryExpression(precedence int) ast.Expression {
	left := p.parsePrimaryExpression()
	if left == nil {
		return nil
	}

	for {
		opPrecedence := p.getPrecedence(p.peek().Type)
		if opPrecedence <= precedence {
			break
		}

		tok := p.advance()
		right := p.parseBinaryExpression(opPrecedence)
		left = &ast.BinaryExpression{
			Left:     left,
			Operator: tok.Literal,
			Right:    right,
		}
	}

	return left
}

func (p *Parser) getPrecedence(tokType lexer.TokenType) int {
	switch tokType {
	case lexer.TokenPlus, lexer.TokenMinus:
		return 2
	case lexer.TokenEq, lexer.TokenNotEq, lexer.TokenLT, lexer.TokenGT:
		return 1
	}
	return 0
}

func (p *Parser) parsePrimaryExpression() ast.Expression {
	tok := p.advance()
	var left ast.Expression

	if tok.Type == lexer.TokenString {
		left = &ast.StringLiteral{Value: tok.Literal}
	} else if tok.Type == lexer.TokenIdent || p.isKeyword(tok.Type) {
		left = &ast.Identifier{Value: tok.Literal}
	} else if tok.Type == lexer.TokenNumber {
		var val float64
		fmt.Sscanf(tok.Literal, "%f", &val)
		left = &ast.NumberLiteral{Value: val}
	} else if tok.Type == lexer.TokenLBracket {
		left = p.parseArrayLiteral()
	} else if tok.Type == lexer.TokenLBrace {
		left = p.parseObjectLiteral()
	} else {
		return nil
	}

	for p.peek().Literal == "." || p.peek().Literal == "(" {
		if p.peek().Literal == "." {
			p.advance() // consume '.'
			propTok := p.advance()
			left = &ast.MemberExpression{
				Object:   left,
				Property: &ast.Identifier{Value: propTok.Literal},
			}
		} else if p.peek().Literal == "(" {
			p.advance() // consume '('
			var args []ast.Expression
			for p.peek().Literal != ")" && !p.isAtEnd() {
				if p.peek().Literal == "," {
					p.advance()
					continue
				}
				arg := p.parseExpression()
				if arg != nil {
					args = append(args, arg)
				}
			}
			if p.peek().Literal == ")" {
				p.advance()
			}
			left = &ast.CallExpression{
				Function: left,
				Args:     args,
			}
		}
	}

	return left
}

func (p *Parser) parseArrayLiteral() ast.Expression {
	elements := []ast.Expression{}
	for p.peek().Type != lexer.TokenRBracket && !p.isAtEnd() {
		el := p.parseExpression()
		if el != nil {
			elements = append(elements, el)
		}
		if p.peek().Type == lexer.TokenComma {
			p.advance()
		}
	}
	if p.peek().Type == lexer.TokenRBracket {
		p.advance()
	}
	return &ast.ArrayLiteral{Elements: elements}
}
func (p *Parser) parseObjectLiteral() ast.Expression {
	obj := &ast.ObjectLiteral{Pairs: make(map[string]ast.Expression)}
	for p.peek().Type != lexer.TokenRBrace && !p.isAtEnd() {
		key := p.advance().Literal
		if p.peek().Type == lexer.TokenColon {
			p.advance()
		}
		val := p.parseExpression()
		obj.Pairs[key] = val
		if p.peek().Type == lexer.TokenComma {
			p.advance()
		}
	}
	if p.peek().Type == lexer.TokenRBrace {
		p.advance()
	}
	return obj
}

func (p *Parser) isKeyword(tokType lexer.TokenType) bool {
	// Most tokens starting with Token are keywords
	// Just return true if it's not EOF or symbols we want to exclude
	switch tokType {
	case lexer.TokenEOF, lexer.TokenIllegal, lexer.TokenString, lexer.TokenNumber,
		lexer.TokenAssign, lexer.TokenPlus, lexer.TokenMinus, lexer.TokenBang,
		lexer.TokenEq, lexer.TokenNotEq, lexer.TokenLT, lexer.TokenGT,
		lexer.TokenComma, lexer.TokenColon, lexer.TokenDot, lexer.TokenSlash,
		lexer.TokenLBrace, lexer.TokenRBrace, lexer.TokenLBracket, lexer.TokenRBracket:
		return false
	}
	return true
}

func (p *Parser) isAtEnd() bool {
	return p.peek().Type == lexer.TokenEOF
}

func (p *Parser) peek() lexer.Token {
	if p.current >= len(p.tokens) {
		return lexer.Token{Type: lexer.TokenEOF}
	}
	return p.tokens[p.current]
}

func (p *Parser) advance() lexer.Token {
	tok := p.peek()
	p.current++
	return tok
}

func (p *Parser) parseIfCommand() (ast.Statement, error) {
	p.advance() // consume 'if'
	
	// Legacy support for "if user has permission"
	if p.peek().Type == lexer.TokenUser || p.peek().Literal == "user" {
		p.advance()
		if p.peek().Type == lexer.TokenHas || p.peek().Literal == "has" {
			p.advance()
			if p.peek().Type == lexer.TokenPermission || p.peek().Literal == "permission" {
				p.advance()
				perm := p.parseExpression()
				body := p.parseBlockUntilEndIf()
				return &ast.IfUserHasPermissionStatement{Permission: perm, Body: body}, nil
			}
		}
	}

	condition := p.parseExpression()
	if p.peek().Literal == "then" {
		p.advance()
	}
	body := p.parseBlockUntilEndIf()
	
	var elseBody *ast.BlockStatement
	if p.peek().Literal == "else" {
		p.advance()
		elseBody = p.parseBlockUntilEndIf()
	}

	return &ast.IfStatement{Condition: condition, Then: body, Else: elseBody}, nil
}

func (p *Parser) parseSetCommand() (ast.Statement, error) {
	p.advance() // consume 'set'
	
	if p.peek().Type == lexer.TokenNickname {
		p.advance() // consume 'nickname'
		user := p.parseExpression()
		if p.peek().Type != lexer.TokenTo && p.peek().Literal != "to" {
			return nil, fmt.Errorf("Expected 'to' after set nickname user")
		}
		p.advance() // consume 'to'
		nick := p.parseExpression()
		return &ast.SetNicknameCommand{User: user, Nickname: nick}, nil
	}

	if p.peek().Type != lexer.TokenIdent {
		return nil, fmt.Errorf("Expected identifier after 'set'")
	}
	name := p.advance().Literal
	if p.peek().Type != lexer.TokenTo && p.peek().Literal != "to" {
		return nil, fmt.Errorf("Expected 'to' after variable name")
	}
	p.advance() // consume 'to'
	val := p.parseExpression()
	return &ast.SetCommand{Variable: name, Value: val}, nil
}

func (p *Parser) parseBlockUntilEndIf() *ast.BlockStatement {
	block := &ast.BlockStatement{Statements: []ast.Statement{}}

	for !p.isAtEnd() {
		if p.peek().Type == lexer.TokenEnd {
			p.advance()
			if p.peek().Type == lexer.TokenIf || p.peek().Literal == "if" {
				p.advance()
			}
			break
		}
		if p.peek().Literal == "else" {
			break
		}

		stmt, _ := p.parseStatement()
		if stmt != nil {
			block.Statements = append(block.Statements, stmt)
		}
	}

	return block
}


func (p *Parser) parseSendCommand() (ast.Statement, error) {
	p.advance() // consume 'send'
	
	if p.peek().Type == lexer.TokenDM || p.peek().Type == lexer.TokenUser {
		p.advance()
		targetId := p.parseExpression()
		content := p.parseExpression()
		return &ast.SendDMCommand{TargetID: targetId, Message: content}, nil
	}

	content := p.parseExpression()
	
	if p.peek().Literal != "via" {
		return nil, fmt.Errorf("Expected 'via' after send content")
	}
	p.advance() // consume 'via'
	
	if p.peek().Type != lexer.TokenWebhook && p.peek().Literal != "webhook" {
		return nil, fmt.Errorf("Expected 'webhook' after 'via'")
	}
	p.advance() // consume 'webhook'
	
	webhookID := p.parseExpression()
	
	if p.peek().Type != lexer.TokenWith && p.peek().Literal != "with" {
		return nil, fmt.Errorf("Expected 'with' after webhook id")
	}
	p.advance() // consume 'with'
	
	if p.peek().Literal != "token" {
		return nil, fmt.Errorf("Expected 'token' after 'with'")
	}
	p.advance() // consume 'token'
	
	webhookToken := p.parseExpression()
	
	return &ast.SendViaWebhookCommand{Content: content, WebhookID: webhookID, WebhookToken: webhookToken}, nil
}

func (p *Parser) parseGetCommand() (ast.Statement, error) {
	p.advance() // consume 'get'
	if p.peek().Literal != "bot" {
		return nil, fmt.Errorf("Expected 'bot' after 'get'")
	}
	p.advance() // consume 'bot'
	
	if p.peek().Literal != "info" {
		return nil, fmt.Errorf("Expected 'info' after 'bot'")
	}
	p.advance() // consume 'info'
	
	return &ast.GetBotInfoCommand{}, nil
}

func (p *Parser) peekNext() *lexer.Token {
	if p.current+1 >= len(p.tokens) {
		return nil
	}
	return &p.tokens[p.current+1]
}

