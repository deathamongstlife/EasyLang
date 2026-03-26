package parser

import (
	"fmt"
	"github.com/ezlang/ezbot/internal/ast"
)

// We split parser functions due to length

func (p *Parser) parseRegisterSlashCommand() (ast.Statement, error) {
	p.advance() // consume 'register'
	if p.peek().Literal != "slash" {
		return nil, fmt.Errorf("Expected 'slash' after register")
	}
	p.advance()
	if p.peek().Literal != "command" {
		return nil, fmt.Errorf("Expected 'command' after slash")
	}
	p.advance()

	name := p.parseExpression()

	if p.peek().Literal == "with" {
		p.advance()
	}

	if p.peek().Literal != "description" {
		return nil, fmt.Errorf("Expected 'description' for slash command")
	}
	p.advance()

	desc := p.parseExpression()

	var options ast.Expression
	if p.peek().Literal == "with" {
		p.advance()
		if p.peek().Literal == "options" {
			p.advance()
			options = p.parseExpression()
		}
	}

	return &ast.RegisterSlashCommand{
		Name:        name,
		Description: desc,
		Options:     options,
	}, nil
	}

