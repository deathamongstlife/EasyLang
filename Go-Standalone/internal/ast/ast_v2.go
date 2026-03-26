package ast

// Components v2 AST Nodes

type ReplyWithUserMenuCommand struct {
	Message Expression
	MenuID  Expression
}
func (s *ReplyWithUserMenuCommand) statementNode()       {}
func (s *ReplyWithUserMenuCommand) TokenLiteral() string { return "reply with user menu" }

type ReplyWithRoleMenuCommand struct {
	Message Expression
	MenuID  Expression
}
func (s *ReplyWithRoleMenuCommand) statementNode()       {}
func (s *ReplyWithRoleMenuCommand) TokenLiteral() string { return "reply with role menu" }

type ReplyWithChannelMenuCommand struct {
	Message Expression
	MenuID  Expression
}
func (s *ReplyWithChannelMenuCommand) statementNode()       {}
func (s *ReplyWithChannelMenuCommand) TokenLiteral() string { return "reply with channel menu" }

type ReplyWithMentionableMenuCommand struct {
	Message Expression
	MenuID  Expression
}
func (s *ReplyWithMentionableMenuCommand) statementNode()       {}
func (s *ReplyWithMentionableMenuCommand) TokenLiteral() string { return "reply with mentionable menu" }

// Context Menus
type RegisterContextCommand struct {
	Name Expression
	Type string // "user" or "message"
}
func (s *RegisterContextCommand) statementNode()       {}
func (s *RegisterContextCommand) TokenLiteral() string { return "register context command" }

type WhenContextUsedCommand struct {
	Name Expression
	Type string
	Body *BlockStatement
}
func (s *WhenContextUsedCommand) statementNode()       {}
func (s *WhenContextUsedCommand) TokenLiteral() string { return "when context used" }
