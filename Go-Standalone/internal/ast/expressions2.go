package ast

type ExpressionStatement struct {
	Expression Expression
}
func (s *ExpressionStatement) statementNode() {}
func (s *ExpressionStatement) TokenLiteral() string { return "" }
