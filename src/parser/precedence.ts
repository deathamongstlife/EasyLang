/**
 * Operator precedence levels for EzLang
 * Higher number = higher precedence
 */

import { TokenType } from '../lexer/token';

export enum Precedence {
  NONE = 0,
  ASSIGNMENT = 1, // =
  OR = 2, // ||
  AND = 3, // &&
  EQUALITY = 4, // == !=
  COMPARISON = 5, // < > <= >=
  TERM = 6, // + -
  FACTOR = 7, // * / %
  UNARY = 8, // ! -
  CALL = 9, // () []
  MEMBER = 10, // .
}

/**
 * Get the precedence level for a token type
 */
export function getPrecedence(tokenType: TokenType): Precedence {
  switch (tokenType) {
    case TokenType.ASSIGN:
      return Precedence.ASSIGNMENT;
    case TokenType.OR:
      return Precedence.OR;
    case TokenType.AND:
      return Precedence.AND;
    case TokenType.EQUAL:
    case TokenType.NOT_EQUAL:
      return Precedence.EQUALITY;
    case TokenType.LESS_THAN:
    case TokenType.LESS_THAN_EQUAL:
    case TokenType.GREATER_THAN:
    case TokenType.GREATER_THAN_EQUAL:
      return Precedence.COMPARISON;
    case TokenType.PLUS:
    case TokenType.MINUS:
      return Precedence.TERM;
    case TokenType.MULTIPLY:
    case TokenType.DIVIDE:
    case TokenType.MODULO:
      return Precedence.FACTOR;
    case TokenType.NOT:
      return Precedence.UNARY;
    case TokenType.LPAREN:
    case TokenType.LBRACKET:
      return Precedence.CALL;
    case TokenType.DOT:
      return Precedence.MEMBER;
    default:
      return Precedence.NONE;
  }
}

/**
 * Get the operator string for a token type
 */
export function getOperatorString(tokenType: TokenType): string {
  switch (tokenType) {
    case TokenType.PLUS:
      return '+';
    case TokenType.MINUS:
      return '-';
    case TokenType.MULTIPLY:
      return '*';
    case TokenType.DIVIDE:
      return '/';
    case TokenType.MODULO:
      return '%';
    case TokenType.EQUAL:
      return '==';
    case TokenType.NOT_EQUAL:
      return '!=';
    case TokenType.LESS_THAN:
      return '<';
    case TokenType.LESS_THAN_EQUAL:
      return '<=';
    case TokenType.GREATER_THAN:
      return '>';
    case TokenType.GREATER_THAN_EQUAL:
      return '>=';
    case TokenType.AND:
      return '&&';
    case TokenType.OR:
      return '||';
    case TokenType.NOT:
      return '!';
    case TokenType.ASSIGN:
      return '=';
    default:
      return '';
  }
}

/**
 * Check if an operator is right-associative
 */
export function isRightAssociative(tokenType: TokenType): boolean {
  return tokenType === TokenType.ASSIGN;
}
