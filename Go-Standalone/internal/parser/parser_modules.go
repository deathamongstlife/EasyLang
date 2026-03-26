package parser

import (
	"fmt"
	"github.com/ezlang/ezbot/internal/ast"
)

func (p *Parser) parseIncludeCommand() (ast.Statement, error) {
	p.advance() // consume 'include'

	pathExpr := p.parseExpression()
	fmt.Printf("DEBUG: parseIncludeCommand pathExpr: %+v\n", pathExpr)
	if pathExpr == nil {

		return nil, fmt.Errorf("Expected string literal after 'include'")
	}

	return &ast.IncludeCommand{
		FilePath: pathExpr,
	}, nil
}
