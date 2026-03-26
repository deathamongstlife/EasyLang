package ast

type ReplyWithButtonCommand struct {
	Message  Expression
	ButtonID Expression
	Label    Expression
	Style    string
}

func (s *ReplyWithButtonCommand) statementNode()       {}
func (s *ReplyWithButtonCommand) TokenLiteral() string { return "reply with button" }

type ReplyWithMenuCommand struct {
	Message Expression
	MenuID  Expression
	Options []MenuOption
}

type MenuOption struct {
	Label       Expression
	Value       Expression
	Description Expression
}

func (s *ReplyWithMenuCommand) statementNode()       {}
func (s *ReplyWithMenuCommand) TokenLiteral() string { return "reply with menu" }

type WhenButtonClickedCommand struct {
	ButtonID Expression
	Body     *BlockStatement
}

func (s *WhenButtonClickedCommand) statementNode()       {}
func (s *WhenButtonClickedCommand) TokenLiteral() string { return "when button clicked" }

type WhenMenuUsedCommand struct {
        MenuID Expression
        Body   *BlockStatement
}

func (s *WhenMenuUsedCommand) statementNode()       {}
func (s *WhenMenuUsedCommand) TokenLiteral() string { return "when menu is used" }

