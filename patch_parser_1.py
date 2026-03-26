import re

with open("/root/EZLang/Go-Standalone/internal/parser/parser.go", "r") as f:
    code = f.read()

# 1. Add parseStatement checks
stmt_re = re.compile(r'(if tok\.Type == lexer\.TokenDefer \{.*?^\s*\})', re.MULTILINE | re.DOTALL)
new_stmts = """\\1
	if tok.Type == lexer.TokenSend || tok.Literal == "send" {
		return p.parseSendCommand()
	}
	if tok.Type == lexer.TokenGet || tok.Literal == "get" {
		return p.parseGetCommand()
	}"""
code = stmt_re.sub(new_stmts, code)

# 2. Add sticker to parseReplyCommand
reply_re = re.compile(r'(if p\.peek\(\)\.Type == lexer\.TokenEmbed \{.*?^\s*\})', re.MULTILINE | re.DOTALL)
new_reply = """\\1
	if p.peek().Type == lexer.TokenSticker || p.peek().Literal == "sticker" {
		p.advance()
		stickerId := p.parseExpression()
		return &ast.ReplyWithStickerCommand{StickerID: stickerId}, nil
	}"""
code = reply_re.sub(new_reply, code)

# 3. Add webhook to parseCreateCommand
create_re = re.compile(r'(if p\.peek\(\)\.Type == lexer\.TokenChannel \{.*?^\s*\})', re.MULTILINE | re.DOTALL)
new_create = """\\1
	if p.peek().Type == lexer.TokenWebhook || p.peek().Literal == "webhook" {
		p.advance()
		name := p.parseExpression()
		return &ast.CreateWebhookCommand{Name: name}, nil
	}"""
code = create_re.sub(new_create, code)

# 4. Add parseSendCommand and parseGetCommand
new_funcs = """

func (p *Parser) parseSendCommand() (ast.Statement, error) {
	p.advance() // consume 'send'
	content := p.parseExpression()
	
	if p.peek().Literal != "via" {
		return nil, fmt.Errorf("Expected 'via' after send content")
	}
	p.advance() // consume 'via'
	
	if p.peek().Type != lexer.TokenWebhook && p.peek().Literal != "webhook" {
		return nil, fmt.Errorf("Expected 'webhook' after 'via'")
	}
	p.advance() // consume 'webhook'
	
	webhookID := p.parseExpression()
	
	if p.peek().Type != lexer.TokenWith && p.peek().Literal != "with" {
		return nil, fmt.Errorf("Expected 'with' after webhook id")
	}
	p.advance() // consume 'with'
	
	if p.peek().Literal != "token" {
		return nil, fmt.Errorf("Expected 'token' after 'with'")
	}
	p.advance() // consume 'token'
	
	webhookToken := p.parseExpression()
	
	return &ast.SendViaWebhookCommand{Content: content, WebhookID: webhookID, WebhookToken: webhookToken}, nil
}

func (p *Parser) parseGetCommand() (ast.Statement, error) {
	p.advance() // consume 'get'
	if p.peek().Literal != "bot" {
		return nil, fmt.Errorf("Expected 'bot' after 'get'")
	}
	p.advance() // consume 'bot'
	
	if p.peek().Literal != "info" {
		return nil, fmt.Errorf("Expected 'info' after 'bot'")
	}
	p.advance() // consume 'info'
	
	return &ast.GetBotInfoCommand{}, nil
}
"""

with open("/root/EZLang/Go-Standalone/internal/parser/parser.go", "w") as f:
    f.write(code + new_funcs)

