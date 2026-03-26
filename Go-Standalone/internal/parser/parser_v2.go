package parser

import (
	"fmt"

	"github.com/ezlang/ezbot/internal/ast"
	"github.com/ezlang/ezbot/internal/lexer"
)

func (p *Parser) parseRegisterContextCommand() (ast.Statement, error) {
	p.advance() // consume 'register'
	
	contextType := "message"
	if p.peek().Type == lexer.TokenUser {
		contextType = "user"
		p.advance()
	} else if p.peek().Type == lexer.TokenMessage {
		contextType = "message"
		p.advance()
	}

	if p.peek().Type != lexer.TokenContext {
		return nil, fmt.Errorf("Expected 'context' after type")
	}
	p.advance()

	if p.peek().Literal != "command" && p.peek().Literal != "menu" {
		// optional 'command' or 'menu'
	} else {
		p.advance()
	}

	name := p.parseExpression()

	return &ast.RegisterContextCommand{
		Name: name,
		Type: contextType,
	}, nil
}
