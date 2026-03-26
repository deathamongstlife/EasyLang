import re

with open("internal/parser/parser.go", "r") as f:
    content = f.read()

# Add defer and edit to parseStatement
new_parse_statement = """func (p *Parser) parseStatement() (ast.Statement, error) {
        tok := p.peek()

        if tok.Type == lexer.TokenStart {
                return p.parseStartBotCommand()
        }
        if tok.Type == lexer.TokenWhen {
                return p.parseWhenCommand()
        }
        if tok.Type == lexer.TokenDefer {
                return p.parseDeferReplyCommand()
        }
        if tok.Type == lexer.TokenEdit {
                return p.parseEditReplyCommand()
        }
        if tok.Type == lexer.TokenReply {
                return p.parseReplyCommand()
        }"""
content = re.sub(r'func \(p \*Parser\) parseStatement\(\) \(ast\.Statement, error\) \{\n        tok := p\.peek\(\)\n\n        if tok\.Type == lexer\.TokenStart \{\n                return p\.parseStartBotCommand\(\)\n        \}\n        if tok\.Type == lexer\.TokenWhen \{\n                return p\.parseWhenCommand\(\)\n        \}\n        if tok\.Type == lexer\.TokenReply \{', new_parse_statement, content)


# Add new commands
new_commands = """func (p *Parser) parseDeferReplyCommand() (ast.Statement, error) {
        p.advance() // consume 'defer'
        if p.peek().Type != lexer.TokenReply && p.peek().Literal != "reply" {
                return nil, fmt.Errorf("Expected 'reply' after 'defer'")
        }
        p.advance() // consume 'reply'
        return &ast.DeferReplyCommand{}, nil
}

func (p *Parser) parseEditReplyCommand() (ast.Statement, error) {
        p.advance() // consume 'edit'
        if p.peek().Type != lexer.TokenReply && p.peek().Literal != "reply" {
                return nil, fmt.Errorf("Expected 'reply' after 'edit'")
        }
        p.advance() // consume 'reply'
        if p.peek().Type != lexer.TokenWith && p.peek().Literal != "with" {
                return nil, fmt.Errorf("Expected 'with' after 'edit reply'")
        }
        p.advance() // consume 'with'
        msg := p.parseExpression()
        return &ast.EditReplyCommand{Message: msg}, nil
}

func (p *Parser) parseReplyCommand() (ast.Statement, error) {"""
content = content.replace("func (p *Parser) parseReplyCommand() (ast.Statement, error) {", new_commands)

# Update parseReplyCommand to handle modal
reply_with = """        p.advance() // consume 'with'

        if p.peek().Type == lexer.TokenModal || p.peek().Literal == "modal" {
                p.advance() // consume 'modal'
                modalId := p.parseExpression()
                if p.peek().Type != lexer.TokenTitled && p.peek().Literal != "titled" {
                        return nil, fmt.Errorf("Expected 'titled' after modal ID")
                }
                p.advance() // consume 'titled'
                title := p.parseExpression()
                return &ast.ReplyWithModalCommand{ModalID: modalId, Title: title}, nil
        }

        if p.peek().Type == lexer.TokenEmbed {"""
content = content.replace("        p.advance() // consume 'with'\n\n        if p.peek().Type == lexer.TokenEmbed {", reply_with)

# Update parseWhenCommand to handle modal
when_modal = """        if p.peek().Literal == "button" {
                p.advance()
                buttonId := p.parseExpression()
                if p.peek().Literal == "is" {
                        p.advance()
                        if p.peek().Literal == "clicked" {
                                p.advance()
                        }
                }
                body := p.parseBlockUntilEndWhen()
                return &ast.WhenButtonClickedCommand{ButtonID: buttonId, Body: body}, nil
        }

        if p.peek().Type == lexer.TokenModal || p.peek().Literal == "modal" {
                p.advance() // consume 'modal'
                modalId := p.parseExpression()
                if p.peek().Literal == "is" {
                        p.advance() // consume 'is'
                }
                if p.peek().Type == lexer.TokenSubmitted || p.peek().Literal == "submitted" {
                        p.advance() // consume 'submitted'
                }
                body := p.parseBlockUntilEndWhen()
                return &ast.WhenModalSubmittedCommand{ModalID: modalId, Body: body}, nil
        }"""
content = content.replace("""        if p.peek().Literal == "button" {
                p.advance()
                buttonId := p.parseExpression()
                if p.peek().Literal == "is" {
                        p.advance()
                        if p.peek().Literal == "clicked" {
                                p.advance()
                        }
                }
                body := p.parseBlockUntilEndWhen()
                return &ast.WhenButtonClickedCommand{ButtonID: buttonId, Body: body}, nil
        }""", when_modal)

with open("internal/parser/parser.go", "w") as f:
    f.write(content)
