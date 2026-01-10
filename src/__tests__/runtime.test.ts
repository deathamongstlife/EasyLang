/**
 * Jest tests for the Runtime
 */

import { Lexer } from '../lexer';
import { Parser } from '../parser';
import { Runtime } from '../runtime';

describe('Runtime', () => {
  describe('Variables', () => {
    it('should execute variable declarations', async () => {
      const code = 'var x = 10';
      const lexer = new Lexer(code);
      const tokens = lexer.tokenize();
      const parser = new Parser(tokens);
      const ast = parser.parse();
      const runtime = new Runtime(ast);

      await runtime.execute();

      const value = runtime.getVariable('x');
      expect(value.type).toBe('number');
      expect((value as any).value).toBe(10);
    });

    it('should execute string assignments', async () => {
      const code = 'var name = "Alice"';
      const lexer = new Lexer(code);
      const tokens = lexer.tokenize();
      const parser = new Parser(tokens);
      const ast = parser.parse();
      const runtime = new Runtime(ast);

      await runtime.execute();

      const value = runtime.getVariable('name');
      expect(value.type).toBe('string');
      expect((value as any).value).toBe('Alice');
    });
  });

  describe('Arithmetic', () => {
    it('should evaluate addition', async () => {
      const code = 'var result = 10 + 20';
      const lexer = new Lexer(code);
      const tokens = lexer.tokenize();
      const parser = new Parser(tokens);
      const ast = parser.parse();
      const runtime = new Runtime(ast);

      await runtime.execute();

      const value = runtime.getVariable('result');
      expect((value as any).value).toBe(30);
    });

    it('should evaluate subtraction', async () => {
      const code = 'var result = 50 - 20';
      const lexer = new Lexer(code);
      const tokens = lexer.tokenize();
      const parser = new Parser(tokens);
      const ast = parser.parse();
      const runtime = new Runtime(ast);

      await runtime.execute();

      const value = runtime.getVariable('result');
      expect((value as any).value).toBe(30);
    });

    it('should evaluate multiplication', async () => {
      const code = 'var result = 5 * 6';
      const lexer = new Lexer(code);
      const tokens = lexer.tokenize();
      const parser = new Parser(tokens);
      const ast = parser.parse();
      const runtime = new Runtime(ast);

      await runtime.execute();

      const value = runtime.getVariable('result');
      expect((value as any).value).toBe(30);
    });

    it('should respect operator precedence', async () => {
      const code = 'var result = 2 + 3 * 4';
      const lexer = new Lexer(code);
      const tokens = lexer.tokenize();
      const parser = new Parser(tokens);
      const ast = parser.parse();
      const runtime = new Runtime(ast);

      await runtime.execute();

      const value = runtime.getVariable('result');
      expect((value as any).value).toBe(14); // 2 + (3 * 4) = 14
    });
  });

  describe('Comparisons', () => {
    it('should evaluate equality', async () => {
      const code = 'var result = 10 == 10';
      const lexer = new Lexer(code);
      const tokens = lexer.tokenize();
      const parser = new Parser(tokens);
      const ast = parser.parse();
      const runtime = new Runtime(ast);

      await runtime.execute();

      const value = runtime.getVariable('result');
      expect((value as any).value).toBe(true);
    });

    it('should evaluate less than', async () => {
      const code = 'var result = 5 < 10';
      const lexer = new Lexer(code);
      const tokens = lexer.tokenize();
      const parser = new Parser(tokens);
      const ast = parser.parse();
      const runtime = new Runtime(ast);

      await runtime.execute();

      const value = runtime.getVariable('result');
      expect((value as any).value).toBe(true);
    });
  });

  describe('Functions', () => {
    it('should declare and call functions', async () => {
      const code = `
        function add(a, b) {
          return a + b
        }
        var result = add(5, 3)
      `;
      const lexer = new Lexer(code);
      const tokens = lexer.tokenize();
      const parser = new Parser(tokens);
      const ast = parser.parse();
      const runtime = new Runtime(ast);

      await runtime.execute();

      const value = runtime.getVariable('result');
      expect((value as any).value).toBe(8);
    });

    it('should support closures', async () => {
      const code = `
        function outer(x) {
          function inner(y) {
            return x + y
          }
          return inner
        }
        var fn = outer(10)
        var result = fn(5)
      `;
      const lexer = new Lexer(code);
      const tokens = lexer.tokenize();
      const parser = new Parser(tokens);
      const ast = parser.parse();
      const runtime = new Runtime(ast);

      await runtime.execute();

      const value = runtime.getVariable('result');
      expect((value as any).value).toBe(15);
    });
  });

  describe('Control Flow', () => {
    it('should execute if statements', async () => {
      const code = `
        var x = 10
        var result = 0
        if x > 5 {
          result = 1
        }
      `;
      const lexer = new Lexer(code);
      const tokens = lexer.tokenize();
      const parser = new Parser(tokens);
      const ast = parser.parse();
      const runtime = new Runtime(ast);

      await runtime.execute();

      const value = runtime.getVariable('result');
      expect((value as any).value).toBe(1);
    });

    it('should execute else branches', async () => {
      const code = `
        var x = 3
        var result = 0
        if x > 5 {
          result = 1
        } else {
          result = 2
        }
      `;
      const lexer = new Lexer(code);
      const tokens = lexer.tokenize();
      const parser = new Parser(tokens);
      const ast = parser.parse();
      const runtime = new Runtime(ast);

      await runtime.execute();

      const value = runtime.getVariable('result');
      expect((value as any).value).toBe(2);
    });

    it('should execute while loops', async () => {
      const code = `
        var count = 0
        while count < 5 {
          count = count + 1
        }
      `;
      const lexer = new Lexer(code);
      const tokens = lexer.tokenize();
      const parser = new Parser(tokens);
      const ast = parser.parse();
      const runtime = new Runtime(ast);

      await runtime.execute();

      const value = runtime.getVariable('count');
      expect((value as any).value).toBe(5);
    });
  });

  describe('Arrays', () => {
    it('should create arrays', async () => {
      const code = 'var items = [1, 2, 3]';
      const lexer = new Lexer(code);
      const tokens = lexer.tokenize();
      const parser = new Parser(tokens);
      const ast = parser.parse();
      const runtime = new Runtime(ast);

      await runtime.execute();

      const value = runtime.getVariable('items');
      expect(value.type).toBe('array');
      expect((value as any).elements).toHaveLength(3);
    });

    it('should access array elements', async () => {
      const code = `
        var items = [10, 20, 30]
        var first = items[0]
      `;
      const lexer = new Lexer(code);
      const tokens = lexer.tokenize();
      const parser = new Parser(tokens);
      const ast = parser.parse();
      const runtime = new Runtime(ast);

      await runtime.execute();

      const value = runtime.getVariable('first');
      expect((value as any).value).toBe(10);
    });
  });

  describe('String Operations', () => {
    it('should concatenate strings', async () => {
      const code = 'var greeting = "Hello" + " " + "World"';
      const lexer = new Lexer(code);
      const tokens = lexer.tokenize();
      const parser = new Parser(tokens);
      const ast = parser.parse();
      const runtime = new Runtime(ast);

      await runtime.execute();

      const value = runtime.getVariable('greeting');
      expect((value as any).value).toBe('Hello World');
    });
  });
});
