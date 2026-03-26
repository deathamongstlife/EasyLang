package runtime

import (
	"fmt"
	"github.com/ezlang/ezbot/internal/ast"
	"github.com/ezlang/ezbot/internal/discord"
)

func (e *Engine) evalExtendedStatement(node ast.Statement, env *Environment) error {
	switch n := node.(type) {
	case *ast.PinMessageCommand:
		msgIDVal := e.evalExpression(n.MessageID, env)
		msgID := fmt.Sprintf("%v", msgIDVal)
		if contextMsg, ok := env.Get("__context_message"); ok {
			if msgObj, isMsg := contextMsg.(*discord.Message); isMsg {
				e.discordClient.PinMessage(msgObj.ChannelID, msgID)
			}
		}
	case *ast.UnpinMessageCommand:
		msgIDVal := e.evalExpression(n.MessageID, env)
		msgID := fmt.Sprintf("%v", msgIDVal)
		if contextMsg, ok := env.Get("__context_message"); ok {
			if msgObj, isMsg := contextMsg.(*discord.Message); isMsg {
				e.discordClient.UnpinMessage(msgObj.ChannelID, msgID)
			}
		}
	case *ast.LeaveGuildCommand:
		guildIDVal := e.evalExpression(n.GuildID, env)
		guildID := fmt.Sprintf("%v", guildIDVal)
		e.discordClient.LeaveGuild(guildID)

	case *ast.AddReactionCommand:
		emojiVal := e.evalExpression(n.Emoji, env)
		emojiStr := fmt.Sprintf("%v", emojiVal)
		msgIDVal := e.evalExpression(n.MessageID, env)
		msgID := fmt.Sprintf("%v", msgIDVal)
		if contextMsg, ok := env.Get("__context_message"); ok {
			if msgObj, isMsg := contextMsg.(*discord.Message); isMsg {
				e.discordClient.AddReaction(msgObj.ChannelID, msgID, emojiStr)
			}
		}

	case *ast.CreateInviteCommand:
		if contextMsg, ok := env.Get("__context_message"); ok {
			if msgObj, isMsg := contextMsg.(*discord.Message); isMsg {
				e.discordClient.CreateInvite(msgObj.ChannelID, 86400, 0) // default 24h
			}
		}

	case *ast.WhenReactionAddedCommand:
		expectedEmojiVal := e.evalExpression(n.Emoji, env)
		expectedEmoji := fmt.Sprintf("%v", expectedEmojiVal)
		e.discordClient.Handlers.MessageReactionAdd = append(e.discordClient.Handlers.MessageReactionAdd, func(evt *discord.ReactionEvent) {
			if evt.Emoji.Name == expectedEmoji {
				handlerEnv := NewEnclosedEnvironment(env)
				handlerEnv.Set("user_id", evt.UserID)
				handlerEnv.Set("channel_id", evt.ChannelID)
				e.evalBlock(n.Body, handlerEnv)
			}
		})

	case *ast.WhenChannelCreatedCommand:
		e.discordClient.Handlers.ChannelCreate = append(e.discordClient.Handlers.ChannelCreate, func(ch *discord.Channel) {
			handlerEnv := NewEnclosedEnvironment(env)
			handlerEnv.Set("__context_channel", ch)
			e.evalBlock(n.Body, handlerEnv)
		})

	case *ast.WhenRoleCreatedCommand:
		e.discordClient.Handlers.GuildRoleCreate = append(e.discordClient.Handlers.GuildRoleCreate, func(data map[string]interface{}) {
			handlerEnv := NewEnclosedEnvironment(env)
			e.evalBlock(n.Body, handlerEnv)
		})
	case *ast.WhenBotStartsCommand:
		e.discordClient.Handlers.Ready = append(e.discordClient.Handlers.Ready, func(data map[string]interface{}) {
			handlerEnv := NewEnclosedEnvironment(env)
			e.evalBlock(n.Body, handlerEnv)
		})
	}
	return nil
}