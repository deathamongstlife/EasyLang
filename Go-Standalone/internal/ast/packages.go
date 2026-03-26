package ast

type LoadPackageCommand struct {
	PackageManager string // "npm" or "python"
	PackageName    Expression
	Alias          string
}

func (s *LoadPackageCommand) statementNode()       {}
func (s *LoadPackageCommand) TokenLiteral() string { return "load" }
