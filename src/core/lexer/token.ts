/**
 * Token types for the EzLang lexer
 */
export enum TokenType {
  // Literals
  NUMBER = 'NUMBER',
  STRING = 'STRING',
  IDENTIFIER = 'IDENTIFIER',

  // Keywords
  KEYWORD = 'KEYWORD',

  // Operators
  PLUS = 'PLUS',
  MINUS = 'MINUS',
  MULTIPLY = 'MULTIPLY',
  DIVIDE = 'DIVIDE',
  MODULO = 'MODULO',
  ASSIGN = 'ASSIGN',
  EQUAL = 'EQUAL',
  NOT_EQUAL = 'NOT_EQUAL',
  LESS_THAN = 'LESS_THAN',
  LESS_THAN_EQUAL = 'LESS_THAN_EQUAL',
  GREATER_THAN = 'GREATER_THAN',
  GREATER_THAN_EQUAL = 'GREATER_THAN_EQUAL',
  AND = 'AND',
  OR = 'OR',
  NOT = 'NOT',

  // Delimiters
  LPAREN = 'LPAREN',
  RPAREN = 'RPAREN',
  LBRACE = 'LBRACE',
  RBRACE = 'RBRACE',
  LBRACKET = 'LBRACKET',
  RBRACKET = 'RBRACKET',
  COMMA = 'COMMA',
  DOT = 'DOT',
  COLON = 'COLON',

  // Special
  NEWLINE = 'NEWLINE',
  EOF = 'EOF',
  COMMENT = 'COMMENT',
}

/**
 * Position information for a token
 */
export interface Position {
  line: number;
  column: number;
}

/**
 * Represents a single token in the source code
 */
export class Token {
  constructor(
    public readonly type: TokenType,
    public readonly value: string,
    public readonly line: number,
    public readonly column: number
  ) {}

  /**
   * Get the position of this token
   */
  get position(): Position {
    return { line: this.line, column: this.column };
  }

  /**
   * Check if this token is of a specific type
   */
  is(type: TokenType): boolean {
    return this.type === type;
  }

  /**
   * Check if this token is one of multiple types
   */
  isOneOf(...types: TokenType[]): boolean {
    return types.includes(this.type);
  }

  /**
   * Check if this token is a keyword with a specific value
   */
  isKeyword(keyword: string): boolean {
    return this.type === TokenType.KEYWORD && this.value === keyword;
  }

  /**
   * Check if this token is an operator
   */
  isOperator(): boolean {
    return [
      TokenType.PLUS,
      TokenType.MINUS,
      TokenType.MULTIPLY,
      TokenType.DIVIDE,
      TokenType.MODULO,
      TokenType.EQUAL,
      TokenType.NOT_EQUAL,
      TokenType.LESS_THAN,
      TokenType.LESS_THAN_EQUAL,
      TokenType.GREATER_THAN,
      TokenType.GREATER_THAN_EQUAL,
      TokenType.AND,
      TokenType.OR,
      TokenType.NOT,
    ].includes(this.type);
  }

  /**
   * Check if this token is a comparison operator
   */
  isComparisonOperator(): boolean {
    return [
      TokenType.EQUAL,
      TokenType.NOT_EQUAL,
      TokenType.LESS_THAN,
      TokenType.LESS_THAN_EQUAL,
      TokenType.GREATER_THAN,
      TokenType.GREATER_THAN_EQUAL,
    ].includes(this.type);
  }

  /**
   * String representation of the token
   */
  toString(): string {
    return `Token(${this.type}, '${this.value}', ${this.line}:${this.column})`;
  }
}
