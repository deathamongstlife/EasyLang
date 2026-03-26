package ast

type PinMessageCommand struct {
	MessageID Expression
}
func (s *PinMessageCommand) statementNode()       {}
func (s *PinMessageCommand) TokenLiteral() string { return "pin message" }

type UnpinMessageCommand struct {
	MessageID Expression
}
func (s *UnpinMessageCommand) statementNode()       {}
func (s *UnpinMessageCommand) TokenLiteral() string { return "unpin message" }

type AddReactionCommand struct {
	MessageID Expression
	Emoji     Expression
}
func (s *AddReactionCommand) statementNode()       {}
func (s *AddReactionCommand) TokenLiteral() string { return "react with" }

type CreateInviteCommand struct {
	ChannelID Expression
}
func (s *CreateInviteCommand) statementNode()       {}
func (s *CreateInviteCommand) TokenLiteral() string { return "create invite" }

type LeaveGuildCommand struct {
	GuildID Expression
}
func (s *LeaveGuildCommand) statementNode()       {}
func (s *LeaveGuildCommand) TokenLiteral() string { return "leave server" }

// Events
type WhenReactionAddedCommand struct {
	Emoji Expression
	Body  *BlockStatement
}
func (s *WhenReactionAddedCommand) statementNode()       {}
func (s *WhenReactionAddedCommand) TokenLiteral() string { return "when reaction" }

type WhenChannelCreatedCommand struct {
	Body *BlockStatement
}
func (s *WhenChannelCreatedCommand) statementNode()       {}
func (s *WhenChannelCreatedCommand) TokenLiteral() string { return "when channel created" }

type WhenRoleCreatedCommand struct {
	Body *BlockStatement
}
func (s *WhenRoleCreatedCommand) statementNode()       {}
func (s *WhenRoleCreatedCommand) TokenLiteral() string { return "when role created" }
