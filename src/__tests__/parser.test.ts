/**
 * Jest tests for the Parser
 */

import { Lexer } from '../lexer';
import { Parser } from '../parser';

describe('Parser', () => {
  describe('Variable Declarations', () => {
    it('should parse variable declarations', () => {
      const code = 'var x = 10';
      const lexer = new Lexer(code);
      const tokens = lexer.tokenize();
      const parser = new Parser(tokens);
      const ast = parser.parse();

      expect(ast.type).toBe('Program');
      expect(ast.body).toHaveLength(1);
      expect(ast.body[0].type).toBe('VariableDeclaration');
    });

    it('should parse string variables', () => {
      const code = 'var name = "Alice"';
      const lexer = new Lexer(code);
      const tokens = lexer.tokenize();
      const parser = new Parser(tokens);
      const ast = parser.parse();

      const varDecl = ast.body[0] as any;
      expect(varDecl.name).toBe('name');
      expect(varDecl.initializer.type).toBe('Literal');
    });
  });

  describe('Expressions', () => {
    it('should parse binary expressions', () => {
      const code = 'var result = 10 + 20';
      const lexer = new Lexer(code);
      const tokens = lexer.tokenize();
      const parser = new Parser(tokens);
      const ast = parser.parse();

      const varDecl = ast.body[0] as any;
      expect(varDecl.initializer.type).toBe('BinaryExpression');
      expect(varDecl.initializer.operator).toBe('+');
    });

    it('should parse nested expressions with correct precedence', () => {
      const code = 'var result = 2 + 3 * 4';
      const lexer = new Lexer(code);
      const tokens = lexer.tokenize();
      const parser = new Parser(tokens);
      const ast = parser.parse();

      const varDecl = ast.body[0] as any;
      expect(varDecl.initializer.type).toBe('BinaryExpression');
      expect(varDecl.initializer.operator).toBe('+');
      // Right side should be multiplication (higher precedence)
      expect(varDecl.initializer.right.type).toBe('BinaryExpression');
      expect(varDecl.initializer.right.operator).toBe('*');
    });

    it('should parse function calls', () => {
      const code = 'print("Hello")';
      const lexer = new Lexer(code);
      const tokens = lexer.tokenize();
      const parser = new Parser(tokens);
      const ast = parser.parse();

      expect(ast.body[0].type).toBe('ExpressionStatement');
      const expr = (ast.body[0] as any).expression;
      expect(expr.type).toBe('CallExpression');
      expect(expr.callee.name).toBe('print');
    });
  });

  describe('Control Flow', () => {
    it('should parse if statements', () => {
      const code = 'if x > 10 { print("big") }';
      const lexer = new Lexer(code);
      const tokens = lexer.tokenize();
      const parser = new Parser(tokens);
      const ast = parser.parse();

      expect(ast.body[0].type).toBe('IfStatement');
      const ifStmt = ast.body[0] as any;
      expect(ifStmt.condition.type).toBe('BinaryExpression');
      expect(ifStmt.consequent.statements).toHaveLength(1);
    });

    it('should parse if-else statements', () => {
      const code = 'if x > 10 { print("big") } else { print("small") }';
      const lexer = new Lexer(code);
      const tokens = lexer.tokenize();
      const parser = new Parser(tokens);
      const ast = parser.parse();

      const ifStmt = ast.body[0] as any;
      expect(ifStmt.alternate).toBeDefined();
      expect(ifStmt.alternate.statements).toHaveLength(1);
    });

    it('should parse while loops', () => {
      const code = 'while x < 10 { x = x + 1 }';
      const lexer = new Lexer(code);
      const tokens = lexer.tokenize();
      const parser = new Parser(tokens);
      const ast = parser.parse();

      expect(ast.body[0].type).toBe('WhileStatement');
      const whileStmt = ast.body[0] as any;
      expect(whileStmt.condition.type).toBe('BinaryExpression');
      expect(whileStmt.body.statements).toHaveLength(1);
    });

    it('should parse for loops', () => {
      const code = 'for i in range(5) { print(i) }';
      const lexer = new Lexer(code);
      const tokens = lexer.tokenize();
      const parser = new Parser(tokens);
      const ast = parser.parse();

      expect(ast.body[0].type).toBe('ForStatement');
      const forStmt = ast.body[0] as any;
      expect(forStmt.variable).toBe('i');
      expect(forStmt.iterable.type).toBe('CallExpression');
    });
  });

  describe('Functions', () => {
    it('should parse function declarations', () => {
      const code = 'function add(a, b) { return a + b }';
      const lexer = new Lexer(code);
      const tokens = lexer.tokenize();
      const parser = new Parser(tokens);
      const ast = parser.parse();

      expect(ast.body[0].type).toBe('FunctionDeclaration');
      const funcDecl = ast.body[0] as any;
      expect(funcDecl.name).toBe('add');
      expect(funcDecl.parameters).toHaveLength(2);
      expect(funcDecl.parameters).toEqual(['a', 'b']);
    });

    it('should parse return statements', () => {
      const code = 'function test() { return 42 }';
      const lexer = new Lexer(code);
      const tokens = lexer.tokenize();
      const parser = new Parser(tokens);
      const ast = parser.parse();

      const funcDecl = ast.body[0] as any;
      expect(funcDecl.body.statements[0].type).toBe('ReturnStatement');
    });
  });

  describe('Discord Syntax', () => {
    it('should parse listen statements', () => {
      const code = 'listen "messageCreate" (msg) { print(msg) }';
      const lexer = new Lexer(code);
      const tokens = lexer.tokenize();
      const parser = new Parser(tokens);
      const ast = parser.parse();

      expect(ast.body[0].type).toBe('ListenStatement');
      const listenStmt = ast.body[0] as any;
      expect(listenStmt.event).toBe('messageCreate');
      expect(listenStmt.parameter).toBe('msg');
    });
  });

  describe('Arrays', () => {
    it('should parse array literals', () => {
      const code = 'var items = [1, 2, 3]';
      const lexer = new Lexer(code);
      const tokens = lexer.tokenize();
      const parser = new Parser(tokens);
      const ast = parser.parse();

      const varDecl = ast.body[0] as any;
      expect(varDecl.initializer.type).toBe('ArrayLiteral');
      expect(varDecl.initializer.elements).toHaveLength(3);
    });

    it('should parse member expressions', () => {
      const code = 'var x = obj.property';
      const lexer = new Lexer(code);
      const tokens = lexer.tokenize();
      const parser = new Parser(tokens);
      const ast = parser.parse();

      const varDecl = ast.body[0] as any;
      expect(varDecl.initializer.type).toBe('MemberExpression');
      expect(varDecl.initializer.property.name).toBe('property');
    });
  });

  describe('Error Handling', () => {
    it('should handle incomplete variable declarations', () => {
      const code = 'var x =';
      const lexer = new Lexer(code);
      const tokens = lexer.tokenize();
      const parser = new Parser(tokens);

      // Parser catches errors and tries to recover, producing an AST
      const ast = parser.parse();
      expect(ast.type).toBe('Program');
      // The statement may be incomplete or missing
    });

    it('should handle mismatched braces', () => {
      const code = 'if x > 10 { print("test")';
      const lexer = new Lexer(code);
      const tokens = lexer.tokenize();
      const parser = new Parser(tokens);

      // Parser catches errors and tries to recover
      const ast = parser.parse();
      expect(ast.type).toBe('Program');
    });
  });
});
