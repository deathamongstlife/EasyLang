package parser

import (
	"fmt"
	"github.com/ezlang/ezbot/internal/ast"
)

func (p *Parser) parsePinCommand() (ast.Statement, error) {
	p.advance() // consume 'pin'
	if p.peek().Literal != "message" {
		return nil, fmt.Errorf("Expected 'message' after 'pin'")
	}
	p.advance()
	msg := p.parseExpression()
	return &ast.PinMessageCommand{MessageID: msg}, nil
}

func (p *Parser) parseUnpinCommand() (ast.Statement, error) {
	p.advance() // consume 'unpin'
	if p.peek().Literal != "message" {
		return nil, fmt.Errorf("Expected 'message' after 'unpin'")
	}
	p.advance()
	msg := p.parseExpression()
	return &ast.UnpinMessageCommand{MessageID: msg}, nil
}

func (p *Parser) parseLeaveCommand() (ast.Statement, error) {
	p.advance() // consume 'leave'
	if p.peek().Literal != "server" {
		return nil, fmt.Errorf("Expected 'server' after 'leave'")
	}
	p.advance()
	guild := p.parseExpression()
	return &ast.LeaveGuildCommand{GuildID: guild}, nil
}
