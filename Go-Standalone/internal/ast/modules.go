package ast

type IncludeCommand struct {
	FilePath Expression
}
func (s *IncludeCommand) statementNode()       {}
func (s *IncludeCommand) TokenLiteral() string { return "include" }
