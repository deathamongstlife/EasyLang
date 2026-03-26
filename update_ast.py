with open('/root/EZLang/Go-Standalone/internal/ast/ast.go', 'r') as f:
    content = f.read()

append_nodes = """
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
"""

with open('/root/EZLang/Go-Standalone/internal/ast/ast.go', 'w') as f:
    f.write(content + "\n" + append_nodes)
