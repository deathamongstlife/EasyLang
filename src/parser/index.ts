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
  StartBotCommand,
  LoadPackageCommand,
  ReplyWithCommand,
  ReplyWithEmbedCommand,
  ReactWithCommand,
  SendToCommand,
  SetVariableCommand,
  BanCommand,
  KickCommand,
  TimeoutCommand,
  AddRoleCommand,
  RemoveRoleCommand,
  CreateThreadCommand,
  JoinVoiceCommand,
  PlayAudioCommand,
  RegisterSlashCommand,
  SlashCommandOption,
  ReplyWithButtonCommand,
  ReplyWithMenuCommand,
  MenuOption,
  IfUserHasRoleStatement,
  IfUserHasPermissionStatement,
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

    if (token.isKeyword('start')) {
      return this.parseStartBotCommand();
    }

    if (token.isKeyword('load')) {
      return this.parseLoadPackageCommand();
    }

    if (token.isKeyword('when')) {
      return this.parseWhenCommand();
    }

    if (token.isKeyword('set')) {
      return this.parseSetVariableCommand();
    }

    if (token.isKeyword('ban')) {
      return this.parseBanCommand();
    }

    if (token.isKeyword('kick')) {
      return this.parseKickCommand();
    }

    if (token.isKeyword('timeout')) {
      return this.parseTimeoutCommand();
    }

    if (token.isKeyword('add')) {
      return this.parseAddCommand();
    }

    if (token.isKeyword('remove')) {
      return this.parseRemoveCommand();
    }

    if (token.isKeyword('create')) {
      return this.parseCreateCommand();
    }

    if (token.isKeyword('join')) {
      return this.parseJoinCommand();
    }

    if (token.isKeyword('play')) {
      return this.parsePlayCommand();
    }

    if (token.isKeyword('register')) {
      return this.parseRegisterSlashCommand();
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
  private parseIfStatement(): IfStatement | IfUserHasRoleStatement | IfUserHasPermissionStatement {
    const position = this.peek().position;
    this.consume(TokenType.KEYWORD, "Expected 'if'");

    // Check for NLP condition: if user has role "X" or if user has permission "X"
    if (this.peek().isKeyword('user') && this.peekNext()?.isKeyword('has')) {
      this.advance(); // consume 'user'
      this.advance(); // consume 'has'
      
      let isRole = false;
      let isPermission = false;

      if (this.peek().isKeyword('role')) {
        isRole = true;
        this.advance();
      } else if (this.peek().isKeyword('permission')) {
        isPermission = true;
        this.advance();
      } else {
        throw new ParserError("Expected 'role' or 'permission' after 'if user has'", this.peek().line, this.peek().column);
      }

      const target = this.parseExpression(); // the role or permission name

      // Check for 'then' keyword (optional)
      if (this.peek().isKeyword('then')) {
        this.advance();
      }

      // If it's a block, use block parser. Otherwise, we might parse until 'end if'
      let consequent: BlockStatement;
      if (this.peek().is(TokenType.LBRACE)) {
        consequent = this.parseBlockStatement();
      } else {
        const statements = this.parseStatementsUntilEndIf();
        consequent = { type: 'BlockStatement', statements, position };
      }

      // 'else' logic not yet fully modeled for NLP ends, assuming standard blocks if we wanted them
      if (isRole) {
        return {
          type: 'IfUserHasRoleStatement',
          user: { type: 'Identifier', name: '__context_message', position }, // defaulting to message author
          role: target,
          consequent,
          alternate: null,
          position
        };
      } else {
        return {
          type: 'IfUserHasPermissionStatement',
          user: { type: 'Identifier', name: '__context_message', position },
          permission: target,
          consequent,
          alternate: null,
          position
        };
      }
    }

    const condition = this.parseExpression();
    const consequent = this.parseBlockStatement();

    let alternate: BlockStatement | null = null;
    if (this.peek().isKeyword('else')) {
      this.advance();

      // Check for 'else if' pattern
      if (this.peek().isKeyword('if')) {
        // Parse the 'else if' as a nested if statement
        // Wrap it in a block statement to maintain AST structure
        const nestedIf = this.parseIfStatement() as Statement;
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

  private parseStatementsUntilEndIf(): Statement[] {
    const statements: Statement[] = [];
    while (!this.isAtEnd() && !this.peek().isKeyword('end')) {
      const stmt = this.parseStatement();
      if (stmt) {
        statements.push(stmt);
      }
    }

    if (!this.isAtEnd()) {
      this.consume(TokenType.KEYWORD, "Expected 'end'");
      if (!this.isAtEnd() && this.peek().isKeyword('if')) {
        this.advance();
      }
    }
    return statements;
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
   * Parse register slash command: register slash command "name" with description "desc"
   */
  private parseRegisterSlashCommand(): RegisterSlashCommand {
    const position = this.peek().position;
    this.consume(TokenType.KEYWORD, "Expected 'register'");
    this.consume(TokenType.KEYWORD, "Expected 'slash' after register");
    this.consume(TokenType.KEYWORD, "Expected 'command' after slash");

    const name = this.parseExpression();

    this.consume(TokenType.KEYWORD, "Expected 'with' after name");
    this.consume(TokenType.KEYWORD, "Expected 'description' after with");

    const description = this.parseExpression();
    const options: SlashCommandOption[] = [];

    // Optional options: with options [{name: "x", description: "y", type: "string", required: true}]
    if (!this.isAtEnd() && this.peek().isKeyword('with') && this.peekNext()?.isKeyword('options')) {
      this.advance(); // consume with
      this.advance(); // consume options
      
      this.consume(TokenType.LBRACKET, "Expected '[' for options array");
      while (!this.isAtEnd() && !this.check(TokenType.RBRACKET)) {
        this.consume(TokenType.LBRACE, "Expected '{' for option object");
        
        let optName: Expression | null = null;
        let optDesc: Expression | null = null;
        let optType = 'string';
        let optReq = false;

        while (!this.isAtEnd() && !this.check(TokenType.RBRACE)) {
          const keyToken = this.consume(TokenType.IDENTIFIER, "Expected option key");
          this.consume(TokenType.COLON, "Expected ':'");
          const val = this.parseExpression();

          if (keyToken.value === 'name') optName = val;
          else if (keyToken.value === 'description') optDesc = val;
          else if (keyToken.value === 'type') {
            if (val.type === 'Literal' && typeof val.value === 'string') {
              optType = val.value;
            }
          }
          else if (keyToken.value === 'required') {
            if (val.type === 'Literal' && typeof val.value === 'boolean') {
              optReq = val.value;
            }
          }

          if (this.check(TokenType.COMMA)) this.advance();
        }
        this.consume(TokenType.RBRACE, "Expected '}' for option object");

        if (!optName || !optDesc) {
           throw new ParserError("Option must have 'name' and 'description'", this.peek().line, this.peek().column);
        }

        options.push({ name: optName, description: optDesc, type: optType, required: optReq });
        if (this.check(TokenType.COMMA)) this.advance();
      }
      this.consume(TokenType.RBRACKET, "Expected ']' after options array");
    }

    return { type: 'RegisterSlashCommand', name, description, options, position };
  }

  /**
   * Parse a send command: send channel message OR send "message" to channel "id"
   */
  private parseSendCommand(): SendCommand | SendToCommand {
    const position = this.peek().position;
    this.consume(TokenType.KEYWORD, "Expected 'send'");

    const firstExpr = this.parseExpression();

    if (this.peek().isKeyword('to')) {
      this.advance(); // consume 'to'
      if (!this.peek().isKeyword('channel')) {
        throw new ParserError("Expected 'channel' after 'to'", this.peek().line, this.peek().column);
      }
      this.advance(); // consume 'channel'
      
      const target = this.parseExpression();
      return {
        type: 'SendToCommand',
        message: firstExpr,
        target,
        position,
      };
    }

    // Fallback to old: send channel message
    const message = this.parseExpression();

    return {
      type: 'SendCommand',
      target: firstExpr,
      message,
      position,
    };
  }

  /**
   * Parse a reply command: reply message response
   */
  private parseReplyCommand(): ReplyCommand | ReplyWithCommand | ReplyWithEmbedCommand | ReplyWithButtonCommand | ReplyWithMenuCommand {
    const position = this.peek().position;
    this.consume(TokenType.KEYWORD, "Expected 'reply'");

    if (this.peek().isKeyword('with')) {
      this.advance(); // consume 'with'
      
      if (this.peek().isKeyword('embed')) {
        this.advance(); // consume 'embed'
        const title = this.parseExpression();
        const description = this.parseExpression();
        return {
          type: 'ReplyWithEmbedCommand',
          title,
          description,
          position,
        };
      } else if (this.peek().isKeyword('button')) {
        this.advance(); // consume 'button'
        const buttonId = this.parseExpression();
        this.consume(TokenType.KEYWORD, "Expected 'labeled' after button id");
        const label = this.parseExpression();
        let style = "primary";
        if (this.peek().isKeyword('style')) {
          this.advance();
          const styleToken = this.consume(TokenType.STRING, "Expected style string (primary, secondary, success, danger)");
          style = styleToken.value;
        }
        return {
          type: 'ReplyWithButtonCommand',
          message: { type: 'Identifier', name: '__context_message', position },
          buttonId,
          label,
          style,
          position
        };
      } else if (this.peek().isKeyword('menu')) {
        this.advance(); // consume 'menu'
        const menuId = this.parseExpression();
        this.consume(TokenType.KEYWORD, "Expected 'with'");
        this.consume(TokenType.KEYWORD, "Expected 'options'");
        this.consume(TokenType.LBRACKET, "Expected '[' to start options list");
        
        const options: MenuOption[] = [];
        while (!this.isAtEnd() && !this.check(TokenType.RBRACKET)) {
          // Expected option structure: { label: "A", value: "a" }
          this.consume(TokenType.LBRACE, "Expected '{' for option");
          
          let label: Expression | null = null;
          let value: Expression | null = null;
          let description: Expression | undefined = undefined;

          while (!this.isAtEnd() && !this.check(TokenType.RBRACE)) {
            const keyToken = this.consume(TokenType.IDENTIFIER, "Expected option key (label, value, description)");
            this.consume(TokenType.COLON, "Expected ':'");
            const val = this.parseExpression();
            if (keyToken.value === 'label') label = val;
            else if (keyToken.value === 'value') value = val;
            else if (keyToken.value === 'description') description = val;
            
            if (this.check(TokenType.COMMA)) this.advance();
          }
          this.consume(TokenType.RBRACE, "Expected '}' for option");
          
          if (!label || !value) {
             throw new ParserError("Menu option requires 'label' and 'value'", this.peek().line, this.peek().column);
          }
          
          options.push({ label, value, description });
          if (this.check(TokenType.COMMA)) this.advance();
        }
        this.consume(TokenType.RBRACKET, "Expected ']' to end options list");

        return {
          type: 'ReplyWithMenuCommand',
          message: { type: 'Identifier', name: '__context_message', position },
          menuId,
          options,
          position
        };
      }
      
      const message = this.parseExpression();
      return {
        type: 'ReplyWithCommand',
        message,
        position,
      };
    }

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
   * Parse a react command: react message emoji OR react with "emoji"
   */
  private parseReactCommand(): ReactCommand | ReactWithCommand {
    const position = this.peek().position;
    this.consume(TokenType.KEYWORD, "Expected 'react'");

    if (this.peek().isKeyword('with')) {
      this.advance(); // consume 'with'
      const emoji = this.parseExpression();
      return {
        type: 'ReactWithCommand',
        emoji,
        position,
      };
    }

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
   * Parse a start bot command: start bot with token <expression>
   */
  private parseStartBotCommand(): StartBotCommand {
    const position = this.peek().position;
    this.consume(TokenType.KEYWORD, "Expected 'start'");
    
    // Expect 'bot'
    if (!this.peek().isKeyword('bot')) {
      throw new ParserError("Expected 'bot' after 'start'", this.peek().line, this.peek().column);
    }
    this.advance();

    // Expect 'with'
    if (!this.peek().isKeyword('with')) {
      throw new ParserError("Expected 'with' after 'start bot'", this.peek().line, this.peek().column);
    }
    this.advance();

    // Expect 'token'
    if (!this.peek().isKeyword('token')) {
      throw new ParserError("Expected 'token' after 'start bot with'", this.peek().line, this.peek().column);
    }
    this.advance();

    const token = this.parseExpression();

    return {
      type: 'StartBotCommand',
      token,
      position,
    };
  }

  /**
   * Parse a load package command: load [npm|python] package "xyz" as xyz
   */
  private parseLoadPackageCommand(): LoadPackageCommand {
    const position = this.peek().position;
    this.consume(TokenType.KEYWORD, "Expected 'load'");

    let packageManager: 'npm' | 'python';
    if (this.peek().isKeyword('npm')) {
      packageManager = 'npm';
    } else if (this.peek().isKeyword('python')) {
      packageManager = 'python';
    } else {
      throw new ParserError("Expected 'npm' or 'python' after 'load'", this.peek().line, this.peek().column);
    }
    this.advance();

    if (!this.peek().isKeyword('package')) {
      throw new ParserError("Expected 'package' after package manager", this.peek().line, this.peek().column);
    }
    this.advance();

    const packageNameToken = this.consume(TokenType.STRING, 'Expected package name');
    const packageName = packageNameToken.value;

    this.consume(TokenType.KEYWORD, "Expected 'as'");
    const aliasToken = this.consume(TokenType.IDENTIFIER, 'Expected alias for package');
    const alias = aliasToken.value;

    return {
      type: 'LoadPackageCommand',
      packageManager,
      packageName,
      alias,
      position
    };
  }

  /**
   * Parse a set variable command: set <var> to <expr>
   */
  private parseSetVariableCommand(): SetVariableCommand {
    const position = this.peek().position;
    this.consume(TokenType.KEYWORD, "Expected 'set'");

    const nameToken = this.consume(TokenType.IDENTIFIER, 'Expected variable name');
    const name = nameToken.value;

    this.consume(TokenType.KEYWORD, "Expected 'to'");
    const value = this.parseExpression();

    return {
      type: 'SetVariableCommand',
      name,
      value,
      position,
    };
  }

  /**
   * Parse moderation command: ban user "name" [for "reason"]
   */
  private parseBanCommand(): BanCommand {
    const position = this.peek().position;
    this.consume(TokenType.KEYWORD, "Expected 'ban'");
    if (!this.peek().isKeyword('user')) {
      throw new ParserError("Expected 'user' after 'ban'", this.peek().line, this.peek().column);
    }
    this.advance();

    const user = this.parseExpression();
    let reason: Expression | undefined;

    if (!this.isAtEnd() && this.peek().isKeyword('for')) {
      this.advance(); // consume 'for'
      reason = this.parseExpression();
    }

    return { type: 'BanCommand', user, reason, position };
  }

  /**
   * Parse moderation command: kick user "name" [for "reason"]
   */
  private parseKickCommand(): KickCommand {
    const position = this.peek().position;
    this.consume(TokenType.KEYWORD, "Expected 'kick'");
    if (!this.peek().isKeyword('user')) {
      throw new ParserError("Expected 'user' after 'kick'", this.peek().line, this.peek().column);
    }
    this.advance();

    const user = this.parseExpression();
    let reason: Expression | undefined;

    if (!this.isAtEnd() && this.peek().isKeyword('for')) {
      this.advance(); // consume 'for'
      reason = this.parseExpression();
    }

    return { type: 'KickCommand', user, reason, position };
  }

  /**
   * Parse moderation command: timeout user "name" for <number> minutes
   */
  private parseTimeoutCommand(): TimeoutCommand {
    const position = this.peek().position;
    this.consume(TokenType.KEYWORD, "Expected 'timeout'");
    if (!this.peek().isKeyword('user')) {
      throw new ParserError("Expected 'user' after 'timeout'", this.peek().line, this.peek().column);
    }
    this.advance();

    const user = this.parseExpression();
    
    if (!this.peek().isKeyword('for')) {
      throw new ParserError("Expected 'for' to specify timeout duration", this.peek().line, this.peek().column);
    }
    this.advance();
    
    const duration = this.parseExpression();
    
    // consume optional "minutes" or "minute" keyword
    if (!this.isAtEnd() && (this.peek().isKeyword('minutes') || this.peek().isKeyword('minute'))) {
      this.advance();
    }

    return { type: 'TimeoutCommand', user, duration, position };
  }

  /**
   * Parse role command: add role "Admin" to user "Bob"
   */
  private parseAddCommand(): AddRoleCommand {
    const position = this.peek().position;
    this.consume(TokenType.KEYWORD, "Expected 'add'");
    if (!this.peek().isKeyword('role')) {
      throw new ParserError("Expected 'role' after 'add'", this.peek().line, this.peek().column);
    }
    this.advance();

    const role = this.parseExpression();
    
    if (!this.peek().isKeyword('to')) {
      throw new ParserError("Expected 'to' after role expression", this.peek().line, this.peek().column);
    }
    this.advance();
    if (!this.peek().isKeyword('user')) {
      throw new ParserError("Expected 'user' after 'to'", this.peek().line, this.peek().column);
    }
    this.advance();

    const user = this.parseExpression();

    return { type: 'AddRoleCommand', role, user, position };
  }

  /**
   * Parse role command: remove role "Admin" from user "Bob"
   */
  private parseRemoveCommand(): RemoveRoleCommand {
    const position = this.peek().position;
    this.consume(TokenType.KEYWORD, "Expected 'remove'");
    if (!this.peek().isKeyword('role')) {
      throw new ParserError("Expected 'role' after 'remove'", this.peek().line, this.peek().column);
    }
    this.advance();

    const role = this.parseExpression();
    
    if (!this.peek().isKeyword('from')) {
      throw new ParserError("Expected 'from' after role expression", this.peek().line, this.peek().column);
    }
    this.advance();
    if (!this.peek().isKeyword('user')) {
      throw new ParserError("Expected 'user' after 'from'", this.peek().line, this.peek().column);
    }
    this.advance();

    const user = this.parseExpression();

    return { type: 'RemoveRoleCommand', role, user, position };
  }

  /**
   * Parse create command: create thread "Help"
   */
  private parseCreateCommand(): CreateThreadCommand {
    const position = this.peek().position;
    this.consume(TokenType.KEYWORD, "Expected 'create'");
    if (!this.peek().isKeyword('thread')) {
      throw new ParserError("Expected 'thread' after 'create'", this.peek().line, this.peek().column);
    }
    this.advance();

    const name = this.parseExpression();

    return { type: 'CreateThreadCommand', name, position };
  }

  /**
   * Parse join voice command: join voice channel "id"
   */
  private parseJoinCommand(): JoinVoiceCommand {
    const position = this.peek().position;
    this.consume(TokenType.KEYWORD, "Expected 'join'");
    if (!this.peek().isKeyword('voice')) {
      throw new ParserError("Expected 'voice' after 'join'", this.peek().line, this.peek().column);
    }
    this.advance();
    if (!this.peek().isKeyword('channel')) {
      throw new ParserError("Expected 'channel' after 'join voice'", this.peek().line, this.peek().column);
    }
    this.advance();

    const channel = this.parseExpression();

    return { type: 'JoinVoiceCommand', channel, position };
  }

  /**
   * Parse play audio command: play audio "music.mp3"
   */
  private parsePlayCommand(): PlayAudioCommand {
    const position = this.peek().position;
    this.consume(TokenType.KEYWORD, "Expected 'play'");
    if (!this.peek().isKeyword('audio')) {
      throw new ParserError("Expected 'audio' after 'play'", this.peek().line, this.peek().column);
    }
    this.advance();

    const file = this.parseExpression();

    return { type: 'PlayAudioCommand', file, position };
  }

  /**
   * Parse a when command: when message says <expression> \n ... \n end when
   */
  private parseWhenCommand(): Statement {
    const position = this.peek().position;
    this.consume(TokenType.KEYWORD, "Expected 'when'");

    // Check for 'bot starts'
    if (this.peek().isKeyword('bot')) {
      this.advance(); // consume 'bot'
      if (!this.peek().isKeyword('starts')) {
        throw new ParserError("Expected 'starts' after 'when bot'", this.peek().line, this.peek().column);
      }
      this.advance(); // consume 'starts'
      
      const statements = this.parseStatementsUntilEndWhen();
      
      const cmd: any = {
        type: 'WhenBotStartsCommand',
        body: { type: 'BlockStatement', statements, position },
        position,
      };
      return cmd;
    }

    // Check for 'user joins server'
    if (this.peek().isKeyword('user')) {
      this.advance(); // consume 'user'
      if (!this.peek().isKeyword('joins')) {
        throw new ParserError("Expected 'joins' after 'when user'", this.peek().line, this.peek().column);
      }
      this.advance(); // consume 'joins'
      if (!this.peek().isKeyword('server')) {
        throw new ParserError("Expected 'server' after 'when user joins'", this.peek().line, this.peek().column);
      }
      this.advance(); // consume 'server'

      const statements = this.parseStatementsUntilEndWhen();
      
      const cmd: any = {
        type: 'WhenUserJoinsCommand',
        body: { type: 'BlockStatement', statements, position },
        position,
      };
      return cmd;
    }

    // Check for 'button <id> is clicked'
    if (this.peek().isKeyword('button')) {
      this.advance(); // consume 'button'
      const buttonId = this.parseExpression();
      if (!this.peek().isKeyword('is')) {
        throw new ParserError("Expected 'is' after button id", this.peek().line, this.peek().column);
      }
      this.advance();
      if (!this.peek().isKeyword('clicked')) {
        throw new ParserError("Expected 'clicked' after 'is'", this.peek().line, this.peek().column);
      }
      this.advance();

      const statements = this.parseStatementsUntilEndWhen();
      
      const cmd: any = {
        type: 'WhenButtonClickedCommand',
        buttonId,
        body: { type: 'BlockStatement', statements, position },
        position,
      };
      return cmd;
    }

    // Check for 'command'
    if (this.peek().isKeyword('command')) {
      this.advance(); // consume 'command'
      
      const commandName = this.parseExpression();
      
      if (!this.peek().isKeyword('is')) {
        throw new ParserError("Expected 'is' after command name", this.peek().line, this.peek().column);
      }
      this.advance();
      
      if (!this.peek().isKeyword('used')) {
        throw new ParserError("Expected 'used' after 'is'", this.peek().line, this.peek().column);
      }
      this.advance();

      const statements = this.parseStatementsUntilEndWhen();

      const cmd: any = {
        type: 'WhenCommandUsedCommand',
        commandName,
        body: {
          type: 'BlockStatement',
          statements,
          position,
        },
        position,
      };
      return cmd;
    }

    if (!this.peek().isKeyword('message')) {
      throw new ParserError("Expected 'message', 'command', 'bot', 'user', or 'button' after 'when'", this.peek().line, this.peek().column);
    }
    this.advance(); // consume 'message'

    // Check for 'starts with' vs 'says'
    if (this.peek().isKeyword('starts')) {
      this.advance(); // consume 'starts'
      if (!this.peek().isKeyword('with')) {
        throw new ParserError("Expected 'with' after 'starts'", this.peek().line, this.peek().column);
      }
      this.advance(); // consume 'with'

      const condition = this.parseExpression();
      const statements = this.parseStatementsUntilEndWhen();

      const cmd: any = {
        type: 'WhenMessageStartsWithCommand',
        condition,
        body: { type: 'BlockStatement', statements, position },
        position,
      };
      return cmd;
    } else if (this.peek().isKeyword('says')) {
      this.advance(); // consume 'says'
      const condition = this.parseExpression();
      const statements = this.parseStatementsUntilEndWhen();

      const cmd: any = {
        type: 'WhenMessageCommand',
        condition,
        body: {
          type: 'BlockStatement',
          statements,
          position,
        },
        position,
      };
      return cmd;
    } else {
      throw new ParserError("Expected 'says' or 'starts with' after 'when message'", this.peek().line, this.peek().column);
    }
  }

  private parseStatementsUntilEndWhen(): Statement[] {
    const statements: Statement[] = [];
    while (!this.isAtEnd() && !this.peek().isKeyword('end')) {
      const stmt = this.parseStatement();
      if (stmt) {
        statements.push(stmt);
      }
    }

    if (!this.isAtEnd()) {
      this.consume(TokenType.KEYWORD, "Expected 'end'");
      if (!this.isAtEnd() && this.peek().isKeyword('when')) {
        this.advance();
      }
    }
    return statements;
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

    // Allow soft keywords to be used as identifiers (like message, user, role)
    if (token.is(TokenType.KEYWORD)) {
      const hardKeywords = new Set(['true', 'false', 'null', 'if', 'else', 'for', 'while', 'return', 'var', 'function', 'import', 'use']);
      if (!hardKeywords.has(token.value)) {
        return this.parseIdentifier();
      }
    }

    // Array literals
    if (token.is(TokenType.LBRACKET)) {      return this.parseArrayLiteral();
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

  private peekNext(): Token | null {
    if (this.current + 1 >= this.tokens.length) return null;
    return this.tokens[this.current + 1];
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
