package lexer

type Lexer struct {
	input        string
	position     int
	readPosition int
	ch           byte
	line         int
	column       int
}

func New(input string) *Lexer {
	l := &Lexer{input: input, line: 1, column: 0}
	l.readChar()
	return l
}

func (l *Lexer) Tokenize() []Token {
	var tokens []Token
	for {
		tok := l.NextToken()
		tokens = append(tokens, tok)
		if tok.Type == TokenEOF {
			break
		}
	}
	return tokens
}

func (l *Lexer) readChar() {
	if l.readPosition >= len(l.input) {
		l.ch = 0
	} else {
		l.ch = l.input[l.readPosition]
	}
	l.position = l.readPosition
	l.readPosition++
	l.column++
}

func (l *Lexer) NextToken() Token {
	var tok Token

	l.skipWhitespace()

	switch l.ch {
	case '/':
		if l.peekChar() == '/' {
			// Single line comment
			for l.ch != '\n' && l.ch != 0 {
				l.readChar()
			}
			return l.NextToken()
		}
		tok = newToken(TokenSlash, l.ch, l.line, l.column)
	case '=':
		if l.peekChar() == '=' {
			ch := l.ch
			l.readChar()
			literal := string(ch) + string(l.ch)
			tok = Token{Type: TokenEq, Literal: literal, Line: l.line, Column: l.column}
		} else {
			tok = newToken(TokenAssign, l.ch, l.line, l.column)
		}
	case '+':
		tok = newToken(TokenPlus, l.ch, l.line, l.column)
	case '-':
		tok = newToken(TokenMinus, l.ch, l.line, l.column)
	case '<':
		tok = newToken(TokenLT, l.ch, l.line, l.column)
	case '>':
		tok = newToken(TokenGT, l.ch, l.line, l.column)
	case '!':
	        if l.peekChar() == '=' {
	                ch := l.ch
	                l.readChar()
	                literal := string(ch) + string(l.ch)
	                tok = Token{Type: TokenNotEq, Literal: literal, Line: l.line, Column: l.column}
	        } else {
	                tok = newToken(TokenBang, l.ch, l.line, l.column)
	        }
	case '[':
	        tok = newToken(TokenLBracket, l.ch, l.line, l.column)
	case ']':
	        tok = newToken(TokenRBracket, l.ch, l.line, l.column)
	case '{':
	        tok = newToken(TokenLBrace, l.ch, l.line, l.column)
	case '}':
	        tok = newToken(TokenRBrace, l.ch, l.line, l.column)
	case ':':
	        tok = newToken(TokenColon, l.ch, l.line, l.column)
	case ',':
	        tok = newToken(TokenComma, l.ch, l.line, l.column)
	case '.':
	        tok = Token{Type: TokenDot, Literal: string(l.ch), Line: l.line, Column: l.column}
	case '"':
	        tok.Type = TokenString
	        tok.Literal = l.readString()
	        tok.Line = l.line
	        tok.Column = l.column
	case 0:
		tok.Literal = ""
		tok.Type = TokenEOF
		tok.Line = l.line
		tok.Column = l.column
	default:
		if isLetter(l.ch) {
			tok.Literal = l.readIdentifier()
			tok.Type = LookupIdent(tok.Literal)
			tok.Line = l.line
			tok.Column = l.column - len(tok.Literal)
			return tok
		} else if isDigit(l.ch) {
			tok.Literal = l.readNumber()
			tok.Type = TokenNumber
			tok.Line = l.line
			tok.Column = l.column - len(tok.Literal)
			return tok
		} else {
			tok = newToken(TokenIllegal, l.ch, l.line, l.column)
		}
	}

	l.readChar()
	return tok
}

func newToken(tokenType TokenType, ch byte, line int, col int) Token {
	return Token{Type: tokenType, Literal: string(ch), Line: line, Column: col}
}

func (l *Lexer) readIdentifier() string {
	position := l.position
	for isLetter(l.ch) || isDigit(l.ch) {
		l.readChar()
	}
	return l.input[position:l.position]
}

func (l *Lexer) readNumber() string {
	position := l.position
	for isDigit(l.ch) {
		l.readChar()
	}
	return l.input[position:l.position]
}

func (l *Lexer) readString() string {
	position := l.position + 1
	for {
		l.readChar()
		if l.ch == '"' || l.ch == 0 {
			break
		}
	}
	return l.input[position:l.position]
}

func (l *Lexer) skipWhitespace() {
	for l.ch == ' ' || l.ch == '\t' || l.ch == '\n' || l.ch == '\r' {
		if l.ch == '\n' {
			l.line++
			l.column = 0
		}
		l.readChar()
	}
}

func (l *Lexer) peekChar() byte {
	if l.readPosition >= len(l.input) {
		return 0
	}
	return l.input[l.readPosition]
}

func isLetter(ch byte) bool {
	return 'a' <= ch && ch <= 'z' || 'A' <= ch && ch <= 'Z' || ch == '_'
}


func isDigit(ch byte) bool {
	return '0' <= ch && ch <= '9'
}
