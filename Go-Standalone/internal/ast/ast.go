package ast

import "fmt"

type Node interface {
	TokenLiteral() string
}

type Statement interface {
	Node
	statementNode()
}

type Expression interface {
	Node
	expressionNode()
}

type Program struct {
	Statements []Statement
}

func (p *Program) TokenLiteral() string {
	if len(p.Statements) > 0 {
		return p.Statements[0].TokenLiteral()
	}
	return ""
}

type BlockStatement struct {
	Statements []Statement
}

func (bs *BlockStatement) statementNode()       {}
func (bs *BlockStatement) TokenLiteral() string { return "" }

type SetCommand struct {
	Variable string
	Value    Expression
}

func (s *SetCommand) statementNode() {}
func (s *SetCommand) TokenLiteral() string { return "set" }

type SetNicknameCommand struct {
	User     Expression
	Nickname Expression
}

func (s *SetNicknameCommand) statementNode() {}
func (s *SetNicknameCommand) TokenLiteral() string { return "set nickname" }

type IfStatement struct {
	Condition Expression
	Then      *BlockStatement
	Else      *BlockStatement
}

func (i *IfStatement) statementNode() {}
func (i *IfStatement) TokenLiteral() string { return "if" }


type StartBotCommand struct {
	Token Expression
}

func (s *StartBotCommand) statementNode() {}
func (s *StartBotCommand) TokenLiteral() string { return "start" }

type WhenBotStartsCommand struct {
	Body *BlockStatement
}

func (s *WhenBotStartsCommand) statementNode()       {}
func (s *WhenBotStartsCommand) TokenLiteral() string { return "when bot starts" }

type WhenMessageCommand struct {
	Condition Expression
	Body      *BlockStatement
}

func (s *WhenMessageCommand) statementNode()       {}
func (s *WhenMessageCommand) TokenLiteral() string { return "when message" }

type WhenMessageSentCommand struct {
	Body *BlockStatement
}

func (s *WhenMessageSentCommand) statementNode()       {}
func (s *WhenMessageSentCommand) TokenLiteral() string { return "when message is sent" }

type WhenMemberJoinsCommand struct {
	Body *BlockStatement
}

func (s *WhenMemberJoinsCommand) statementNode()       {}
func (s *WhenMemberJoinsCommand) TokenLiteral() string { return "when member joins" }

type WhenMemberLeavesCommand struct {
	Body *BlockStatement
}

func (s *WhenMemberLeavesCommand) statementNode()       {}
func (s *WhenMemberLeavesCommand) TokenLiteral() string { return "when member leaves" }

type WhenDiscordEventCommand struct {
	EventName Expression
	Body      *BlockStatement
}

func (s *WhenDiscordEventCommand) statementNode()       {}
func (s *WhenDiscordEventCommand) TokenLiteral() string { return "when discord event" }

type ReplyWithCommand struct {
	Message Expression
}

func (s *ReplyWithCommand) statementNode()       {}
func (s *ReplyWithCommand) TokenLiteral() string { return "reply with" }

type ReplyWithEmbedCommand struct {
	Title       Expression
	Description Expression
}

func (s *ReplyWithEmbedCommand) statementNode()       {}
func (s *ReplyWithEmbedCommand) TokenLiteral() string { return "reply with embed" }

type BanCommand struct {
	User   Expression
	Reason Expression
}

func (s *BanCommand) statementNode()       {}
func (s *BanCommand) TokenLiteral() string { return "ban user" }

type UnbanCommand struct {
	User   Expression
}

func (s *UnbanCommand) statementNode()       {}
func (s *UnbanCommand) TokenLiteral() string { return "unban user" }

type KickCommand struct {
	User   Expression
	Reason Expression
}

func (s *KickCommand) statementNode()       {}
func (s *KickCommand) TokenLiteral() string { return "kick user" }

type TimeoutCommand struct {
	User     Expression
	Duration Expression
}

func (s *TimeoutCommand) statementNode()       {}
func (s *TimeoutCommand) TokenLiteral() string { return "timeout user" }

type AddRoleCommand struct {
	Role Expression
	User Expression
}

func (s *AddRoleCommand) statementNode()       {}
func (s *AddRoleCommand) TokenLiteral() string { return "add role" }

type RemoveRoleCommand struct {
	Role Expression
	User Expression
}

func (s *RemoveRoleCommand) statementNode()       {}
func (s *RemoveRoleCommand) TokenLiteral() string { return "remove role" }

type CreateThreadCommand struct {
	Name Expression
}

func (s *CreateThreadCommand) statementNode()       {}
func (s *CreateThreadCommand) TokenLiteral() string { return "create thread" }

type PurgeCommand struct {
	Amount Expression
}

func (s *PurgeCommand) statementNode()       {}
func (s *PurgeCommand) TokenLiteral() string { return "purge messages" }

type StringLiteral struct {
	Value string
}

func (s *StringLiteral) expressionNode()      {}
func (s *StringLiteral) TokenLiteral() string { return s.Value }

type NumberLiteral struct {
	Value float64
}

func (n *NumberLiteral) expressionNode()      {}
func (n *NumberLiteral) TokenLiteral() string { return fmt.Sprintf("%v", n.Value) }

type Identifier struct {
	Value string
}

func (i *Identifier) expressionNode()      {}
func (i *Identifier) TokenLiteral() string { return i.Value }

type RegisterSlashCommand struct {
	Name        Expression
	Description Expression
	Options     Expression // Should resolve to an array of objects
}

func (s *RegisterSlashCommand) statementNode()       {}
func (s *RegisterSlashCommand) TokenLiteral() string { return "register slash command" }

type WhenCommandUsedCommand struct {
	CommandName Expression
	Body        *BlockStatement
}

func (s *WhenCommandUsedCommand) statementNode()       {}
func (s *WhenCommandUsedCommand) TokenLiteral() string { return "when command used" }

type MemberExpression struct {
	Object   Expression
	Property Expression
}

func (m *MemberExpression) expressionNode()      {}
func (m *MemberExpression) TokenLiteral() string { return "." }

type BinaryExpression struct {
	Left     Expression
	Operator string
	Right    Expression
}

func (b *BinaryExpression) expressionNode()      {}
func (b *BinaryExpression) TokenLiteral() string { return b.Operator }

type DeferReplyCommand struct{}

func (s *DeferReplyCommand) statementNode()       {}
func (s *DeferReplyCommand) TokenLiteral() string { return "defer reply" }

type EditReplyCommand struct {
	Message Expression
}

func (s *EditReplyCommand) statementNode()       {}
func (s *EditReplyCommand) TokenLiteral() string { return "edit reply with" }

type ReplyWithModalCommand struct {
	ModalID Expression
	Title   Expression
}

func (s *ReplyWithModalCommand) statementNode()       {}
func (s *ReplyWithModalCommand) TokenLiteral() string { return "reply with modal" }

type WhenModalSubmittedCommand struct {
	ModalID Expression
	Body    *BlockStatement
}

func (s *WhenModalSubmittedCommand) statementNode()       {}
func (s *WhenModalSubmittedCommand) TokenLiteral() string { return "when modal submitted" }


type DeleteMessageCommand struct{}

func (s *DeleteMessageCommand) statementNode()       {}
func (s *DeleteMessageCommand) TokenLiteral() string { return "delete message" }

type EditMessageCommand struct {
	NewText Expression
}

func (s *EditMessageCommand) statementNode()       {}
func (s *EditMessageCommand) TokenLiteral() string { return "edit message to" }

type CreateChannelCommand struct {
	Name Expression
	Type Expression
}

func (s *CreateChannelCommand) statementNode()       {}
func (s *CreateChannelCommand) TokenLiteral() string { return "create channel" }

type CreateRoleCommand struct {
	Name  Expression
	Color Expression
}

func (s *CreateRoleCommand) statementNode()       {}
func (s *CreateRoleCommand) TokenLiteral() string { return "create role" }

type DeleteRoleCommand struct {
	RoleID Expression
}

func (s *DeleteRoleCommand) statementNode()       {}
func (s *DeleteRoleCommand) TokenLiteral() string { return "delete role" }

type DeleteChannelCommand struct {
	ChannelID Expression
}

func (s *DeleteChannelCommand) statementNode()       {}
func (s *DeleteChannelCommand) TokenLiteral() string { return "delete channel" }

type JoinVoiceCommand struct {
	ChannelID Expression
}

func (s *JoinVoiceCommand) statementNode()       {}
func (s *JoinVoiceCommand) TokenLiteral() string { return "join voice channel" }

type PlayAudioCommand struct {
	AudioURL Expression
}

func (s *PlayAudioCommand) statementNode()       {}
func (s *PlayAudioCommand) TokenLiteral() string { return "play audio" }

type ReplyWithAttachmentCommand struct {
	FilePath Expression
}

func (s *ReplyWithAttachmentCommand) statementNode()       {}
func (s *ReplyWithAttachmentCommand) TokenLiteral() string { return "reply with file" }


type IfUserHasPermissionStatement struct {
        Permission Expression
        Body       *BlockStatement
}

func (s *IfUserHasPermissionStatement) statementNode()       {}
func (s *IfUserHasPermissionStatement) TokenLiteral() string { return "if user has permission" }

type CreateAutoModRuleCommand struct {
        Name          Expression
        KeywordFilter Expression
}

func (s *CreateAutoModRuleCommand) statementNode()       {}
func (s *CreateAutoModRuleCommand) TokenLiteral() string { return "create automod rule" }

type SendPollCommand struct {
	Title   Expression
	Options []Expression
}
func (s *SendPollCommand) statementNode()       {}
func (s *SendPollCommand) TokenLiteral() string { return "reply with poll" }

type CreateScheduledEventCommand struct {
	Name      Expression
	StartTime Expression
}
func (s *CreateScheduledEventCommand) statementNode()       {}
func (s *CreateScheduledEventCommand) TokenLiteral() string { return "create scheduled event" }

type CreateEmojiCommand struct {
	Name Expression
	Path Expression
}
func (s *CreateEmojiCommand) statementNode()       {}
func (s *CreateEmojiCommand) TokenLiteral() string { return "create emoji" }

type ArrayLiteral struct {
        Elements []Expression
}

func (a *ArrayLiteral) expressionNode()      {}
func (a *ArrayLiteral) TokenLiteral() string { return "[" }

type ObjectLiteral struct {
	Pairs map[string]Expression
}

func (o *ObjectLiteral) expressionNode()      {}
func (o *ObjectLiteral) TokenLiteral() string { return "{" }


type CreateWebhookCommand struct {
	Name Expression
}
func (s *CreateWebhookCommand) statementNode()       {}
func (s *CreateWebhookCommand) TokenLiteral() string { return "create webhook" }
type SendViaWebhookCommand struct {
	WebhookID    Expression
	WebhookToken Expression
	Content      Expression
}

func (s *SendViaWebhookCommand) statementNode()       {}
func (s *SendViaWebhookCommand) TokenLiteral() string { return "send via webhook" }

type SendDMCommand struct {
	TargetID Expression
	Message  Expression
}

func (s *SendDMCommand) statementNode()       {}
func (s *SendDMCommand) TokenLiteral() string { return "send dm" }


type ReplyWithStickerCommand struct {
	StickerID Expression
}
func (s *ReplyWithStickerCommand) statementNode()       {}
func (s *ReplyWithStickerCommand) TokenLiteral() string { return "reply with sticker" }

type GetBotInfoCommand struct {}
func (s *GetBotInfoCommand) statementNode()       {}
func (s *GetBotInfoCommand) TokenLiteral() string { return "get bot info" }
