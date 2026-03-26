import sys

path = '/root/EZLang/Go-Standalone/internal/parser/parser.go'
with open(path, 'r') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    new_lines.append(line)
    if 'if tok.Type == lexer.TokenCreate {' in line:
        indent = line[:line.find('if')]
        new_lines.insert(-1, indent + 'if tok.Type == lexer.TokenIf {\n' + indent + '\treturn p.parseIfCommand()\n' + indent + '}\n')

# Find parseCreateCommand
start_idx = -1
for i, line in enumerate(new_lines):
    if 'func (p *Parser) parseCreateCommand()' in line:
        start_idx = i
        break

if start_idx != -1:
    # Insert before the last return
    for i in range(start_idx, len(new_lines)):
        if 'return nil, fmt.Errorf("Expected \'thread\' or \'channel\' after \'create\'")' in new_lines[i]:
            insert_idx = i
            indent = new_lines[i][:new_lines[i].find('return')]
            automod_code = f"""{indent}if p.peek().Type == lexer.TokenAutomod || p.peek().Literal == "automod" {{
{indent}	p.advance()
{indent}	if p.peek().Type != lexer.TokenRule && p.peek().Literal != "rule" {{
{indent}		return nil, fmt.Errorf("Expected 'rule' after 'automod'")
{indent}	}}
{indent}	p.advance()
{indent}	name := p.parseExpression()
{indent}	if p.peek().Type != lexer.TokenBlocking && p.peek().Literal != "blocking" {{
{indent}		return nil, fmt.Errorf("Expected 'blocking' after automod rule name")
{indent}	}}
{indent}	p.advance()
{indent}	keyword := p.parseExpression()
{indent}	return &ast.CreateAutoModRuleCommand{{Name: name, KeywordFilter: keyword}}, nil
{indent}}}
"""
            new_lines.insert(insert_idx, automod_code)
            break

# Add parseIfCommand function
parse_if_func = """
func (p *Parser) parseIfCommand() (ast.Statement, error) {
	p.advance() // consume 'if'
	if p.peek().Type != lexer.TokenUser && p.peek().Literal != "user" {
		return nil, fmt.Errorf("Expected 'user' after 'if'")
	}
	p.advance()
	if p.peek().Type != lexer.TokenHas && p.peek().Literal != "has" {
		return nil, fmt.Errorf("Expected 'has' after 'if user'")
	}
	p.advance()
	if p.peek().Type != lexer.TokenPermission && p.peek().Literal != "permission" {
		return nil, fmt.Errorf("Expected 'permission' after 'if user has'")
	}
	p.advance()
	perm := p.parseExpression()
	body := p.parseBlockUntilEndWhen()
	return &ast.IfUserHasPermissionStatement{Permission: perm, Body: body}, nil
}
"""
new_lines.append(parse_if_func)

with open(path, 'w') as f:
    f.writelines(new_lines)
