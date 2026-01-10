/**
 * Jest tests for the Lexer
 */

import { Lexer } from '../lexer';
import { TokenType } from '../lexer/token';

describe('Lexer', () => {
  describe('Basic Tokens', () => {
    it('should tokenize variable declarations', () => {
      const code = 'var x = 10';
      const lexer = new Lexer(code);
      const tokens = lexer.tokenize();

      expect(tokens).toHaveLength(5); // var, x, =, 10, EOF
      expect(tokens[0].type).toBe(TokenType.KEYWORD);
      expect(tokens[0].value).toBe('var');
      expect(tokens[1].type).toBe(TokenType.IDENTIFIER);
      expect(tokens[1].value).toBe('x');
      expect(tokens[2].type).toBe(TokenType.ASSIGN);
      expect(tokens[2].value).toBe('=');
      expect(tokens[3].type).toBe(TokenType.NUMBER);
      expect(tokens[3].value).toBe('10');
    });

    it('should tokenize strings', () => {
      const code = 'var name = "Alice"';
      const lexer = new Lexer(code);
      const tokens = lexer.tokenize();

      expect(tokens[3].type).toBe(TokenType.STRING);
      expect(tokens[3].value).toBe('Alice');
    });

    it('should tokenize numbers', () => {
      const code = 'var pi = 3.14';
      const lexer = new Lexer(code);
      const tokens = lexer.tokenize();

      expect(tokens[3].type).toBe(TokenType.NUMBER);
      expect(tokens[3].value).toBe('3.14');
    });

    it('should tokenize booleans', () => {
      const code = 'var isActive = true';
      const lexer = new Lexer(code);
      const tokens = lexer.tokenize();

      expect(tokens[3].type).toBe(TokenType.KEYWORD);
      expect(tokens[3].value).toBe('true');
    });

    it('should tokenize arrays', () => {
      const code = 'var items = [1, 2, 3]';
      const lexer = new Lexer(code);
      const tokens = lexer.tokenize();

      expect(tokens[3].type).toBe(TokenType.LBRACKET);
      expect(tokens[4].type).toBe(TokenType.NUMBER);
      expect(tokens[5].type).toBe(TokenType.COMMA);
    });
  });

  describe('Operators', () => {
    it('should tokenize arithmetic operators', () => {
      const code = 'x + y - z * w / v';
      const lexer = new Lexer(code);
      const tokens = lexer.tokenize();

      expect(tokens[1].type).toBe(TokenType.PLUS);
      expect(tokens[1].value).toBe('+');
      expect(tokens[3].type).toBe(TokenType.MINUS);
      expect(tokens[3].value).toBe('-');
      expect(tokens[5].type).toBe(TokenType.MULTIPLY);
      expect(tokens[5].value).toBe('*');
      expect(tokens[7].type).toBe(TokenType.DIVIDE);
      expect(tokens[7].value).toBe('/');
    });

    it('should tokenize comparison operators', () => {
      const code = 'x == y != z < w > v <= a >= b';
      const lexer = new Lexer(code);
      const tokens = lexer.tokenize();

      expect(tokens[1].type).toBe(TokenType.EQUAL);
      expect(tokens[1].value).toBe('==');
      expect(tokens[3].type).toBe(TokenType.NOT_EQUAL);
      expect(tokens[3].value).toBe('!=');
      expect(tokens[5].type).toBe(TokenType.LESS_THAN);
      expect(tokens[5].value).toBe('<');
      expect(tokens[7].type).toBe(TokenType.GREATER_THAN);
      expect(tokens[7].value).toBe('>');
      expect(tokens[9].type).toBe(TokenType.LESS_THAN_EQUAL);
      expect(tokens[9].value).toBe('<=');
      expect(tokens[11].type).toBe(TokenType.GREATER_THAN_EQUAL);
      expect(tokens[11].value).toBe('>=');
    });

    it('should tokenize logical operators', () => {
      const code = 'x && y || z';
      const lexer = new Lexer(code);
      const tokens = lexer.tokenize();

      expect(tokens[1].type).toBe(TokenType.AND);
      expect(tokens[1].value).toBe('&&');
      expect(tokens[3].type).toBe(TokenType.OR);
      expect(tokens[3].value).toBe('||');
    });
  });

  describe('Keywords', () => {
    it('should recognize control flow keywords', () => {
      const code = 'if else while for function return';
      const lexer = new Lexer(code);
      const tokens = lexer.tokenize();

      tokens.slice(0, -1).forEach(token => {
        expect(token.type).toBe(TokenType.KEYWORD);
      });
    });

    it('should recognize Discord keywords', () => {
      const code = 'listen send reply react';
      const lexer = new Lexer(code);
      const tokens = lexer.tokenize();

      expect(tokens[0].type).toBe(TokenType.KEYWORD);
      expect(tokens[0].value).toBe('listen');
      expect(tokens[1].type).toBe(TokenType.KEYWORD);
      expect(tokens[1].value).toBe('send');
      expect(tokens[2].type).toBe(TokenType.KEYWORD);
      expect(tokens[2].value).toBe('reply');
      expect(tokens[3].type).toBe(TokenType.KEYWORD);
      expect(tokens[3].value).toBe('react');
    });
  });

  describe('Comments', () => {
    it('should tokenize single-line comments', () => {
      const code = 'var x = 10 // This is a comment\nvar y = 20';
      const lexer = new Lexer(code);
      const tokens = lexer.tokenize();

      // Should create a COMMENT token
      const commentToken = tokens.find(t => t.type === TokenType.COMMENT);
      expect(commentToken).toBeDefined();
      expect(commentToken?.value).toBe(' This is a comment');
    });

    it('should handle code after comments', () => {
      const code = 'var x = 10 // comment\nvar y = 20';
      const lexer = new Lexer(code);
      const tokens = lexer.tokenize();

      // Should have tokens for both var statements
      const varTokens = tokens.filter(t => t.type === TokenType.KEYWORD && t.value === 'var');
      expect(varTokens).toHaveLength(2);
    });
  });

  describe('Error Handling', () => {
    it('should handle unterminated strings', () => {
      const code = 'var name = "Alice';
      const lexer = new Lexer(code);

      expect(() => lexer.tokenize()).toThrow();
    });
  });
});
