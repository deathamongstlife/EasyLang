package parser

import (
	"github.com/ezlang/ezbot/internal/ast"
	"github.com/ezlang/ezbot/internal/lexer"
)

func (p *Parser) parseLoadPackageCommand() (ast.Statement, error) {
	p.advance() // consume 'load'
	
	manager := "npm"
	if p.peek().Type == lexer.TokenNpm || p.peek().Literal == "npm" {
		manager = "npm"
		p.advance()
	} else if p.peek().Type == lexer.TokenPython || p.peek().Literal == "python" {
		manager = "python"
		p.advance()
	}

	if p.peek().Type == lexer.TokenPackage || p.peek().Literal == "package" {
		p.advance()
	}

	pkgName := p.parseExpression()

	alias := ""
	if p.peek().Type == lexer.TokenAs || p.peek().Literal == "as" {
		p.advance()
		if p.peek().Type == lexer.TokenIdent {
			alias = p.peek().Literal
			p.advance()
		}
	}

	return &ast.LoadPackageCommand{
		PackageManager: manager,
		PackageName:    pkgName,
		Alias:          alias,
	}, nil
}
