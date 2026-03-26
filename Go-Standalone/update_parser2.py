import sys

with open("internal/parser/parser.go", "r") as f:
    content = f.read()

# Insert into parseStatement
parse_statement_replacement = """	if tok.Literal == "register" {
		return p.parseRegisterSlashCommand()
	}
	if tok.Type == lexer.TokenJoin || tok.Literal == "join" {
		return p.parseJoinVoiceCommand()
	}
	if tok.Type == lexer.TokenPlay || tok.Literal == "play" {
		return p.parsePlayAudioCommand()
	}"""
content = content.replace('	if tok.Literal == "register" {\n		return p.parseRegisterSlashCommand()\n	}', parse_statement_replacement)

# Insert new parse functions
new_parse_funcs = """

func (p *Parser) parseJoinVoiceCommand() (ast.Statement, error) {
	p.advance() // consume 'join'
	if p.peek().Type != lexer.TokenVoice && p.peek().Literal != "voice" {
		return nil, fmt.Errorf("Expected 'voice' after 'join'")
	}
	p.advance() // consume 'voice'
	
	if p.peek().Type == lexer.TokenChannel || p.peek().Literal == "channel" {
		p.advance() // consume 'channel' optionally
	}
	
	channelId := p.parseExpression()
	return &ast.JoinVoiceCommand{ChannelID: channelId}, nil
}

func (p *Parser) parsePlayAudioCommand() (ast.Statement, error) {
	p.advance() // consume 'play'
	if p.peek().Type != lexer.TokenAudio && p.peek().Literal != "audio" {
		return nil, fmt.Errorf("Expected 'audio' after 'play'")
	}
	p.advance() // consume 'audio'
	
	if p.peek().Literal == "from" {
	    p.advance() // consume 'from' optionally
	}
	
	audioURL := p.parseExpression()
	return &ast.PlayAudioCommand{AudioURL: audioURL}, nil
}

"""
content = content.replace("func (p *Parser) parseStartBotCommand()", new_parse_funcs + "func (p *Parser) parseStartBotCommand()")

# Insert into parseReplyCommand
reply_file_code = """
	if p.peek().Type == lexer.TokenFile || p.peek().Type == lexer.TokenAttachment || p.peek().Literal == "file" || p.peek().Literal == "attachment" {
		p.advance()
		filePath := p.parseExpression()
		return &ast.ReplyWithAttachmentCommand{FilePath: filePath}, nil
	}
"""
content = content.replace('	if p.peek().Type == lexer.TokenEmbed {', reply_file_code + '\n	if p.peek().Type == lexer.TokenEmbed {')

with open("internal/parser/parser.go", "w") as f:
    f.write(content)

