package ast

type CallExpression struct {
	Function Expression
	Args     []Expression
}
func (e *CallExpression) expressionNode() {}
func (e *CallExpression) TokenLiteral() string { return "" }
