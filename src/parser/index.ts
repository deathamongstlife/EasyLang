import { Token, TokenType } from '../lexer/token';
import {
  Program,
  Statement,
  Expression,
  VariableDeclaration,
  FunctionDeclaration,
  IfStatement,
  ForStatement,
  WhileStatement,
  ReturnStatement,
  BlockStatement,
  ExpressionStatement,
  ListenStatement,
  UseStatement,
  ImportStatement,
  SendCommand,
  ReplyCommand,
  ReactCommand,
  UnaryExpression,
  CallExpression,
  MemberExpression,
  Identifier,
  Literal,
  ArrayLiteral,
  ObjectLiteral,
  ObjectProperty,
} from './ast';
import { getPrecedence, getOperatorString, isRightAssociative, Precedence } from './precedence';
import { ParserError } from '../utils/errors';
import { logger } from '../utils/logger';

/**
 * Parser for EzLang - converts tokens into an Abstract Syntax Tree
 */
export class Parser {
  private tokens: Token[];
  private current: number = 0;

  constructor(tokens: Token[]) {
    // Filter out comments and newlines for easier parsing
    this.tokens = tokens.filter(
      (token) => token.type !== TokenType.COMMENT && token.type !== TokenType.NEWLINE
    );
  }

  /**
   * Parse the tokens into an AST
   */
  parse(): Program {
    const statements: Statement[] = [];

    while (!this.isAtEnd()) {
      try {
        const stmt = this.parseStatement();
        if (stmt) {
          statements.push(stmt);
        }
      } catch (error) {
        if (error instanceof ParserError) {
          logger.error(error.formatError());
          // Try to recover by skipping to the next statement
          this.synchronize();
        } else {
          throw error;
        }
      }
    }

    logger.debug(`Parser produced AST with ${statements.length} statements`);
    return {
      type: 'Program',
      body: statements,
    };
  }

  /**
   * Parse a statement
   */
  private parseStatement(): Statement | null {
    const token = this.peek();

    if (token.isKeyword('var')) {
      return this.parseVariableDeclaration();
    }

    if (token.isKeyword('function')) {
      return this.parseFunctionDeclaration();
    }

    if (token.isKeyword('if')) {
      return this.parseIfStatement();
    }

    if (token.isKeyword('for')) {
      return this.parseForStatement();
    }

    if (token.isKeyword('while')) {
      return this.parseWhileStatement();
    }

    if (token.isKeyword('return')) {
      return this.parseReturnStatement();
    }

    if (token.isKeyword('listen')) {
      return this.parseListenStatement();
    }

    if (token.isKeyword('use')) {
      return this.parseUseStatement();
    }

    if (token.isKeyword('import')) {
      return this.parseImportStatement();
    }

    if (token.isKeyword('send')) {
      return this.parseSendCommand();
    }

    if (token.isKeyword('reply')) {
      return this.parseReplyCommand();
    }

    if (token.isKeyword('react')) {
      return this.parseReactCommand();
    }

    if (token.is(TokenType.LBRACE)) {
      return this.parseBlockStatement();
    }

    // Expression statement
    return this.parseExpressionStatement();
  }

  /**
   * Parse a variable declaration: var name = value
   */
  private parseVariableDeclaration(): VariableDeclaration {
    const position = this.peek().position;
    this.consume(TokenType.KEYWORD, "Expected 'var'");

    const nameToken = this.consume(TokenType.IDENTIFIER, 'Expected variable name');
    const name = nameToken.value;

    let initializer: Expression | null = null;
    if (this.match(TokenType.ASSIGN)) {
      initializer = this.parseExpression();
    }

    return {
      type: 'VariableDeclaration',
      name,
      initializer,
      position,
    };
  }

  /**
   * Parse a function declaration: function name(params) { body }
   */
  private parseFunctionDeclaration(): FunctionDeclaration {
    const position = this.peek().position;
    this.consume(TokenType.KEYWORD, "Expected 'function'");

    const nameToken = this.consume(TokenType.IDENTIFIER, 'Expected function name');
    const name = nameToken.value;

    this.consume(TokenType.LPAREN, "Expected '(' after function name");

    const parameters: string[] = [];
    if (!this.check(TokenType.RPAREN)) {
      do {
        const param = this.consume(TokenType.IDENTIFIER, 'Expected parameter name');
        parameters.push(param.value);
      } while (this.match(TokenType.COMMA));
    }

    this.consume(TokenType.RPAREN, "Expected ')' after parameters");

    const body = this.parseBlockStatement();

    return {
      type: 'FunctionDeclaration',
      name,
      parameters,
      body,
      position,
    };
  }

  /**
   * Parse an if statement: if condition { consequent } else if condition { alternate } else { alternate }
   */
  private parseIfStatement(): IfStatement {
    const position = this.peek().position;
    this.consume(TokenType.KEYWORD, "Expected 'if'");

    const condition = this.parseExpression();
    const consequent = this.parseBlockStatement();

    let alternate: BlockStatement | null = null;
    if (this.peek().isKeyword('else')) {
      this.advance();

      // Check for 'else if' pattern
      if (this.peek().isKeyword('if')) {
        // Parse the 'else if' as a nested if statement
        // Wrap it in a block statement to maintain AST structure
        const nestedIf = this.parseIfStatement();
        alternate = {
          type: 'BlockStatement',
          statements: [nestedIf],
          position: nestedIf.position,
        };
      } else {
        // Regular else block
        alternate = this.parseBlockStatement();
      }
    }

    return {
      type: 'IfStatement',
      condition,
      consequent,
      alternate,
      position,
    };
  }

  /**
   * Parse a for statement: for variable in iterable { body }
   */
  private parseForStatement(): ForStatement {
    const position = this.peek().position;
    this.consume(TokenType.KEYWORD, "Expected 'for'");

    const varToken = this.consume(TokenType.IDENTIFIER, 'Expected variable name');
    const variable = varToken.value;

    this.consume(TokenType.KEYWORD, "Expected 'in'");

    const iterable = this.parseExpression();
    const body = this.parseBlockStatement();

    return {
      type: 'ForStatement',
      variable,
      iterable,
      body,
      position,
    };
  }

  /**
   * Parse a while statement: while condition { body }
   */
  private parseWhileStatement(): WhileStatement {
    const position = this.peek().position;
    this.consume(TokenType.KEYWORD, "Expected 'while'");

    const condition = this.parseExpression();
    const body = this.parseBlockStatement();

    return {
      type: 'WhileStatement',
      condition,
      body,
      position,
    };
  }

  /**
   * Parse a return statement: return value
   */
  private parseReturnStatement(): ReturnStatement {
    const position = this.peek().position;
    this.consume(TokenType.KEYWORD, "Expected 'return'");

    let value: Expression | null = null;
    if (!this.check(TokenType.RBRACE) && !this.isAtEnd()) {
      value = this.parseExpression();
    }

    return {
      type: 'ReturnStatement',
      value,
      position,
    };
  }

  /**
   * Parse a block statement: { statements }
   */
  private parseBlockStatement(): BlockStatement {
    const position = this.peek().position;
    this.consume(TokenType.LBRACE, "Expected '{'");

    const statements: Statement[] = [];
    while (!this.check(TokenType.RBRACE) && !this.isAtEnd()) {
      const stmt = this.parseStatement();
      if (stmt) {
        statements.push(stmt);
      }
    }

    this.consume(TokenType.RBRACE, "Expected '}'");

    return {
      type: 'BlockStatement',
      statements,
      position,
    };
  }

  /**
   * Parse an expression statement
   */
  private parseExpressionStatement(): ExpressionStatement {
    const position = this.peek().position;
    const expression = this.parseExpression();

    return {
      type: 'ExpressionStatement',
      expression,
      position,
    };
  }

  /**
   * Parse a listen statement: listen "event" (param) { body }
   */
  private parseListenStatement(): ListenStatement {
    const position = this.peek().position;
    this.consume(TokenType.KEYWORD, "Expected 'listen'");

    const eventToken = this.consume(TokenType.STRING, 'Expected event name');
    const event = eventToken.value;

    this.consume(TokenType.LPAREN, "Expected '(' after event name");
    const paramToken = this.consume(TokenType.IDENTIFIER, 'Expected parameter name');
    const parameter = paramToken.value;
    this.consume(TokenType.RPAREN, "Expected ')' after parameter");

    const body = this.parseBlockStatement();

    return {
      type: 'ListenStatement',
      event,
      parameter,
      body,
      position,
    };
  }

  /**
   * Parse a use statement: use "module" as name
   */
  private parseUseStatement(): UseStatement {
    const position = this.peek().position;
    this.consume(TokenType.KEYWORD, "Expected 'use'");

    const moduleToken = this.consume(TokenType.STRING, 'Expected module name');
    const module = moduleToken.value;

    this.consume(TokenType.KEYWORD, "Expected 'as'");

    const aliasToken = this.consume(TokenType.IDENTIFIER, 'Expected alias name');
    const alias = aliasToken.value;

    return {
      type: 'UseStatement',
      module,
      alias,
      position,
    };
  }

  /**
   * Parse an import statement: import "path/to/file.ez"
   */
  private parseImportStatement(): ImportStatement {
    const position = this.peek().position;
    this.consume(TokenType.KEYWORD, "Expected 'import'");

    const pathToken = this.consume(TokenType.STRING, 'Expected file path');
    const path = pathToken.value;

    return {
      type: 'ImportStatement',
      path,
      position,
    };
  }

  /**
   * Parse a send command: send channel message
   */
  private parseSendCommand(): SendCommand {
    const position = this.peek().position;
    this.consume(TokenType.KEYWORD, "Expected 'send'");

    const target = this.parsePrimaryExpression();
    const message = this.parseExpression();

    return {
      type: 'SendCommand',
      target,
      message,
      position,
    };
  }

  /**
   * Parse a reply command: reply message response
   */
  private parseReplyCommand(): ReplyCommand {
    const position = this.peek().position;
    this.consume(TokenType.KEYWORD, "Expected 'reply'");

    const target = this.parsePrimaryExpression();
    const message = this.parseExpression();

    return {
      type: 'ReplyCommand',
      target,
      message,
      position,
    };
  }

  /**
   * Parse a react command: react message emoji
   */
  private parseReactCommand(): ReactCommand {
    const position = this.peek().position;
    this.consume(TokenType.KEYWORD, "Expected 'react'");

    const target = this.parsePrimaryExpression();
    const emoji = this.parseExpression();

    return {
      type: 'ReactCommand',
      target,
      emoji,
      position,
    };
  }

  /**
   * Parse an expression with precedence climbing
   */
  private parseExpression(minPrecedence: number = 0): Expression {
    let left = this.parsePrimaryExpression();

    while (true) {
      const token = this.peek();
      const precedence = getPrecedence(token.type, token.value);

      if (precedence < minPrecedence) {
        break;
      }

      // Handle assignment
      if (token.is(TokenType.ASSIGN)) {
        this.advance();
        const value = this.parseExpression(precedence);

        if (left.type !== 'Identifier' && left.type !== 'MemberExpression') {
          throw new ParserError(
            'Invalid assignment target',
            token.line,
            token.column
          );
        }

        left = {
          type: 'AssignmentExpression',
          target: left as Identifier | MemberExpression,
          value,
          position: token.position,
        } as Expression;
        continue;
      }

      // Handle 'in' operator as binary operator
      if (token.isKeyword('in')) {
        this.advance();
        const nextPrecedence = precedence + 1;
        const right = this.parseExpression(nextPrecedence);

        left = {
          type: 'BinaryExpression',
          operator: 'in',
          left,
          right,
          position: token.position,
        } as Expression;
        continue;
      }

      // Handle binary operators
      if (token.isOperator()) {
        this.advance();
        const nextPrecedence = isRightAssociative(token.type)
          ? precedence
          : precedence + 1;
        const right = this.parseExpression(nextPrecedence);

        left = {
          type: 'BinaryExpression',
          operator: getOperatorString(token.type),
          left,
          right,
          position: token.position,
        } as Expression;
        continue;
      }

      // Handle postfix operators (call, member access)
      if (token.is(TokenType.LPAREN)) {
        left = this.parseCallExpression(left);
        continue;
      }

      if (token.is(TokenType.LBRACKET)) {
        left = this.parseComputedMemberExpression(left);
        continue;
      }

      if (token.is(TokenType.DOT)) {
        left = this.parseMemberExpression(left);
        continue;
      }

      break;
    }

    return left;
  }

  /**
   * Parse a primary expression (literals, identifiers, unary, grouping)
   */
  private parsePrimaryExpression(): Expression {
    const token = this.peek();

    // Literals
    if (token.is(TokenType.NUMBER)) {
      return this.parseNumberLiteral();
    }

    if (token.is(TokenType.STRING)) {
      return this.parseStringLiteral();
    }

    if (token.isKeyword('true') || token.isKeyword('false')) {
      return this.parseBooleanLiteral();
    }

    if (token.isKeyword('null')) {
      return this.parseNullLiteral();
    }

    // Unary 'not' operator (as identifier)
    if (token.is(TokenType.IDENTIFIER) && token.value === 'not') {
      return this.parseUnaryExpression();
    }

    // Identifiers
    if (token.is(TokenType.IDENTIFIER)) {
      return this.parseIdentifier();
    }

    // Array literals
    if (token.is(TokenType.LBRACKET)) {
      return this.parseArrayLiteral();
    }

    // Object literals
    if (token.is(TokenType.LBRACE)) {
      return this.parseObjectLiteral();
    }

    // Grouping
    if (token.is(TokenType.LPAREN)) {
      return this.parseGrouping();
    }

    // Unary operators
    if (token.is(TokenType.NOT) || token.is(TokenType.MINUS)) {
      return this.parseUnaryExpression();
    }

    throw new ParserError(
      `Unexpected token: ${token.value}`,
      token.line,
      token.column
    );
  }

  /**
   * Parse a number literal
   */
  private parseNumberLiteral(): Literal {
    const token = this.advance();
    return {
      type: 'Literal',
      value: parseFloat(token.value),
      raw: token.value,
      position: token.position,
    };
  }

  /**
   * Parse a string literal
   */
  private parseStringLiteral(): Literal {
    const token = this.advance();
    return {
      type: 'Literal',
      value: token.value,
      raw: token.value,
      position: token.position,
    };
  }

  /**
   * Parse a boolean literal
   */
  private parseBooleanLiteral(): Literal {
    const token = this.advance();
    return {
      type: 'Literal',
      value: token.value === 'true',
      raw: token.value,
      position: token.position,
    };
  }

  /**
   * Parse a null literal
   */
  private parseNullLiteral(): Literal {
    const token = this.advance();
    return {
      type: 'Literal',
      value: null,
      raw: token.value,
      position: token.position,
    };
  }

  /**
   * Parse an identifier
   */
  private parseIdentifier(): Identifier {
    const token = this.advance();
    return {
      type: 'Identifier',
      name: token.value,
      position: token.position,
    };
  }

  /**
   * Parse an array literal: [elements]
   */
  private parseArrayLiteral(): ArrayLiteral {
    const position = this.peek().position;
    this.consume(TokenType.LBRACKET, "Expected '['");

    const elements: Expression[] = [];
    if (!this.check(TokenType.RBRACKET)) {
      do {
        elements.push(this.parseExpression());
      } while (this.match(TokenType.COMMA));
    }

    this.consume(TokenType.RBRACKET, "Expected ']'");

    return {
      type: 'ArrayLiteral',
      elements,
      position,
    };
  }

  /**
   * Parse an object literal: {key: value, ...}
   */
  private parseObjectLiteral(): ObjectLiteral {
    const position = this.peek().position;
    this.consume(TokenType.LBRACE, "Expected '{'");

    const properties: ObjectProperty[] = [];

    while (!this.check(TokenType.RBRACE) && !this.isAtEnd()) {
      // Parse key (must be identifier or string)
      let key: string;
      const keyToken = this.peek();

      if (keyToken.is(TokenType.IDENTIFIER)) {
        key = keyToken.value;
        this.advance();
      } else if (keyToken.is(TokenType.STRING)) {
        key = keyToken.value;
        this.advance();
      } else {
        throw new ParserError(
          `Expected property key, got ${keyToken.type}`,
          keyToken.line,
          keyToken.column
        );
      }

      this.consume(TokenType.COLON, "Expected ':' after property key");

      const value = this.parseExpression();

      properties.push({
        type: 'ObjectProperty',
        key,
        value,
        position: keyToken.position,
      });

      if (this.match(TokenType.COMMA)) {
        // Continue to next property
      } else if (!this.check(TokenType.RBRACE)) {
        throw new ParserError(
          "Expected ',' or '}' in object literal",
          this.peek().line,
          this.peek().column
        );
      }
    }

    this.consume(TokenType.RBRACE, "Expected '}'");

    return {
      type: 'ObjectLiteral',
      properties,
      position,
    };
  }

  /**
   * Parse a grouping expression: (expression)
   */
  private parseGrouping(): Expression {
    this.consume(TokenType.LPAREN, "Expected '('");
    const expr = this.parseExpression();
    this.consume(TokenType.RPAREN, "Expected ')'");
    return expr;
  }

  /**
   * Parse a unary expression: !expr, -expr, or not expr
   */
  private parseUnaryExpression(): UnaryExpression {
    const token = this.advance();
    const operand = this.parseExpression(Precedence.UNARY);

    // Handle 'not' identifier as operator
    const operator = (token.is(TokenType.IDENTIFIER) && token.value === 'not') ? '!' : getOperatorString(token.type);

    return {
      type: 'UnaryExpression',
      operator,
      operand,
      position: token.position,
    };
  }

  /**
   * Parse a call expression: callee(arguments)
   */
  private parseCallExpression(callee: Expression): CallExpression {
    const position = this.peek().position;
    this.consume(TokenType.LPAREN, "Expected '('");

    const args: Expression[] = [];
    if (!this.check(TokenType.RPAREN)) {
      do {
        args.push(this.parseExpression());
      } while (this.match(TokenType.COMMA));
    }

    this.consume(TokenType.RPAREN, "Expected ')'");

    return {
      type: 'CallExpression',
      callee,
      arguments: args,
      position,
    };
  }

  /**
   * Parse a member expression: object.property
   */
  private parseMemberExpression(object: Expression): MemberExpression {
    const position = this.peek().position;
    this.consume(TokenType.DOT, "Expected '.'");

    const propertyToken = this.consume(TokenType.IDENTIFIER, 'Expected property name');
    const property: Identifier = {
      type: 'Identifier',
      name: propertyToken.value,
      position: propertyToken.position,
    };

    return {
      type: 'MemberExpression',
      object,
      property,
      computed: false,
      position,
    };
  }

  /**
   * Parse a computed member expression: object[property]
   */
  private parseComputedMemberExpression(object: Expression): MemberExpression {
    const position = this.peek().position;
    this.consume(TokenType.LBRACKET, "Expected '['");

    const property = this.parseExpression();

    this.consume(TokenType.RBRACKET, "Expected ']'");

    return {
      type: 'MemberExpression',
      object,
      property,
      computed: true,
      position,
    };
  }

  /**
   * Utility methods
   */

  private peek(): Token {
    return this.tokens[this.current];
  }

  private previous(): Token {
    return this.tokens[this.current - 1];
  }

  private advance(): Token {
    if (!this.isAtEnd()) {
      this.current++;
    }
    return this.previous();
  }

  private check(type: TokenType): boolean {
    if (this.isAtEnd()) {
      return false;
    }
    return this.peek().is(type);
  }

  private match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  private consume(type: TokenType, message: string): Token {
    if (this.check(type)) {
      return this.advance();
    }

    const token = this.peek();
    throw new ParserError(message, token.line, token.column);
  }

  private isAtEnd(): boolean {
    return this.peek().is(TokenType.EOF);
  }

  private synchronize(): void {
    this.advance();

    while (!this.isAtEnd()) {
      // Look for statement boundaries
      const token = this.peek();
      if (
        token.isKeyword('var') ||
        token.isKeyword('function') ||
        token.isKeyword('if') ||
        token.isKeyword('for') ||
        token.isKeyword('while') ||
        token.isKeyword('return')
      ) {
        return;
      }

      this.advance();
    }
  }
}
