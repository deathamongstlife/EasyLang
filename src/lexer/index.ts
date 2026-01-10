import { Token, TokenType } from './token';
import { isKeyword } from './keywords';
import { LexerError } from '../utils/errors';
import { logger } from '../utils/logger';

/**
 * Lexer for EzLang - converts source code into tokens
 */
export class Lexer {
  private source: string;
  private position: number = 0;
  private line: number = 1;
  private column: number = 1;
  private tokens: Token[] = [];

  constructor(source: string) {
    this.source = source;
  }

  /**
   * Tokenize the source code
   */
  tokenize(): Token[] {
    this.tokens = [];
    this.position = 0;
    this.line = 1;
    this.column = 1;

    while (!this.isAtEnd()) {
      this.scanToken();
    }

    this.tokens.push(new Token(TokenType.EOF, '', this.line, this.column));
    logger.debug(`Lexer produced ${this.tokens.length} tokens`);
    return this.tokens;
  }

  /**
   * Scan a single token
   */
  private scanToken(): void {
    const char = this.advance();

    // Skip whitespace (but not newlines)
    if (char === ' ' || char === '\r' || char === '\t') {
      return;
    }

    // Newlines
    if (char === '\n') {
      this.tokens.push(new Token(TokenType.NEWLINE, '\\n', this.line - 1, this.column));
      return;
    }

    // Comments
    if (char === '/' && this.peek() === '/') {
      this.scanComment();
      return;
    }

    // Strings
    if (char === '"' || char === "'") {
      this.scanString(char);
      return;
    }

    // Numbers
    if (this.isDigit(char)) {
      this.scanNumber(char);
      return;
    }

    // Identifiers and keywords
    if (this.isAlpha(char)) {
      this.scanIdentifier(char);
      return;
    }

    // Operators and delimiters
    this.scanOperator(char);
  }

  /**
   * Scan a comment
   */
  private scanComment(): void {
    const startLine = this.line;
    const startColumn = this.column - 1;

    // Skip the second '/'
    this.advance();

    const start = this.position;
    while (!this.isAtEnd() && this.peek() !== '\n') {
      this.advance();
    }

    const value = this.source.substring(start, this.position);
    this.tokens.push(new Token(TokenType.COMMENT, value, startLine, startColumn));
  }

  /**
   * Scan a string literal
   */
  private scanString(quote: string): void {
    const startLine = this.line;
    const startColumn = this.column - 1;
    let value = '';

    while (!this.isAtEnd() && this.peek() !== quote) {
      if (this.peek() === '\\') {
        this.advance(); // Skip backslash
        const escaped = this.advance();
        // Handle escape sequences
        switch (escaped) {
          case 'n':
            value += '\n';
            break;
          case 't':
            value += '\t';
            break;
          case 'r':
            value += '\r';
            break;
          case '\\':
            value += '\\';
            break;
          case quote:
            value += quote;
            break;
          default:
            value += escaped;
        }
      } else {
        value += this.advance();
      }
    }

    if (this.isAtEnd()) {
      throw new LexerError('Unterminated string', startLine, startColumn);
    }

    // Consume closing quote
    this.advance();

    this.tokens.push(new Token(TokenType.STRING, value, startLine, startColumn));
  }

  /**
   * Scan a number literal
   */
  private scanNumber(firstDigit: string): void {
    const startLine = this.line;
    const startColumn = this.column - 1;
    let value = firstDigit;

    while (!this.isAtEnd() && this.isDigit(this.peek())) {
      value += this.advance();
    }

    // Handle decimal numbers
    if (this.peek() === '.' && this.isDigit(this.peekNext())) {
      value += this.advance(); // Consume '.'

      while (!this.isAtEnd() && this.isDigit(this.peek())) {
        value += this.advance();
      }
    }

    this.tokens.push(new Token(TokenType.NUMBER, value, startLine, startColumn));
  }

  /**
   * Scan an identifier or keyword
   */
  private scanIdentifier(firstChar: string): void {
    const startLine = this.line;
    const startColumn = this.column - 1;
    let value = firstChar;

    while (!this.isAtEnd() && this.isAlphaNumeric(this.peek())) {
      value += this.advance();
    }

    const type = isKeyword(value) ? TokenType.KEYWORD : TokenType.IDENTIFIER;
    this.tokens.push(new Token(type, value, startLine, startColumn));
  }

  /**
   * Scan an operator or delimiter
   */
  private scanOperator(char: string): void {
    const startLine = this.line;
    const startColumn = this.column - 1;

    switch (char) {
      case '+':
        this.tokens.push(new Token(TokenType.PLUS, '+', startLine, startColumn));
        break;
      case '-':
        this.tokens.push(new Token(TokenType.MINUS, '-', startLine, startColumn));
        break;
      case '*':
        this.tokens.push(new Token(TokenType.MULTIPLY, '*', startLine, startColumn));
        break;
      case '/':
        this.tokens.push(new Token(TokenType.DIVIDE, '/', startLine, startColumn));
        break;
      case '%':
        this.tokens.push(new Token(TokenType.MODULO, '%', startLine, startColumn));
        break;
      case '(':
        this.tokens.push(new Token(TokenType.LPAREN, '(', startLine, startColumn));
        break;
      case ')':
        this.tokens.push(new Token(TokenType.RPAREN, ')', startLine, startColumn));
        break;
      case '{':
        this.tokens.push(new Token(TokenType.LBRACE, '{', startLine, startColumn));
        break;
      case '}':
        this.tokens.push(new Token(TokenType.RBRACE, '}', startLine, startColumn));
        break;
      case '[':
        this.tokens.push(new Token(TokenType.LBRACKET, '[', startLine, startColumn));
        break;
      case ']':
        this.tokens.push(new Token(TokenType.RBRACKET, ']', startLine, startColumn));
        break;
      case ',':
        this.tokens.push(new Token(TokenType.COMMA, ',', startLine, startColumn));
        break;
      case '.':
        this.tokens.push(new Token(TokenType.DOT, '.', startLine, startColumn));
        break;
      case ':':
        this.tokens.push(new Token(TokenType.COLON, ':', startLine, startColumn));
        break;
      case '=':
        if (this.peek() === '=') {
          this.advance();
          this.tokens.push(new Token(TokenType.EQUAL, '==', startLine, startColumn));
        } else {
          this.tokens.push(new Token(TokenType.ASSIGN, '=', startLine, startColumn));
        }
        break;
      case '!':
        if (this.peek() === '=') {
          this.advance();
          this.tokens.push(new Token(TokenType.NOT_EQUAL, '!=', startLine, startColumn));
        } else {
          this.tokens.push(new Token(TokenType.NOT, '!', startLine, startColumn));
        }
        break;
      case '<':
        if (this.peek() === '=') {
          this.advance();
          this.tokens.push(new Token(TokenType.LESS_THAN_EQUAL, '<=', startLine, startColumn));
        } else {
          this.tokens.push(new Token(TokenType.LESS_THAN, '<', startLine, startColumn));
        }
        break;
      case '>':
        if (this.peek() === '=') {
          this.advance();
          this.tokens.push(new Token(TokenType.GREATER_THAN_EQUAL, '>=', startLine, startColumn));
        } else {
          this.tokens.push(new Token(TokenType.GREATER_THAN, '>', startLine, startColumn));
        }
        break;
      case '&':
        if (this.peek() === '&') {
          this.advance();
          this.tokens.push(new Token(TokenType.AND, '&&', startLine, startColumn));
        } else {
          throw new LexerError(`Unexpected character: ${char}`, startLine, startColumn);
        }
        break;
      case '|':
        if (this.peek() === '|') {
          this.advance();
          this.tokens.push(new Token(TokenType.OR, '||', startLine, startColumn));
        } else {
          throw new LexerError(`Unexpected character: ${char}`, startLine, startColumn);
        }
        break;
      default:
        throw new LexerError(`Unexpected character: ${char}`, startLine, startColumn);
    }
  }

  /**
   * Advance to the next character
   */
  private advance(): string {
    const char = this.source[this.position];
    this.position++;
    this.column++;

    if (char === '\n') {
      this.line++;
      this.column = 1;
    }

    return char;
  }

  /**
   * Peek at the current character without advancing
   */
  private peek(): string {
    if (this.isAtEnd()) {
      return '\0';
    }
    return this.source[this.position];
  }

  /**
   * Peek at the next character without advancing
   */
  private peekNext(): string {
    if (this.position + 1 >= this.source.length) {
      return '\0';
    }
    return this.source[this.position + 1];
  }

  /**
   * Check if we've reached the end of the source
   */
  private isAtEnd(): boolean {
    return this.position >= this.source.length;
  }

  /**
   * Check if a character is a digit
   */
  private isDigit(char: string): boolean {
    return char >= '0' && char <= '9';
  }

  /**
   * Check if a character is alphabetic or underscore
   */
  private isAlpha(char: string): boolean {
    return (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z') || char === '_';
  }

  /**
   * Check if a character is alphanumeric or underscore
   */
  private isAlphaNumeric(char: string): boolean {
    return this.isAlpha(char) || this.isDigit(char);
  }
}
