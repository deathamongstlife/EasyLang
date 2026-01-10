# EzLang Implementation Guide

## Architecture Overview

EzLang is implemented as a multi-phase compiler/interpreter system:

```
Source Code → Lexer → Tokens → Parser → AST → Interpreter → Output
```

## Phase 1: Lexer and Parser (IMPLEMENTED)

### Lexer Architecture

**File**: `src/lexer/index.ts`

The lexer performs lexical analysis, converting raw source code into tokens.

**Key Components:**

1. **Token**: Represents a single lexical unit
   - Type (keyword, identifier, number, string, operator, etc.)
   - Value (the actual text)
   - Position (line and column for error reporting)

2. **Lexer Class**:
   - `tokenize()`: Main entry point
   - `scanToken()`: Processes one token
   - `scanString()`, `scanNumber()`, `scanIdentifier()`: Specialized scanners
   - Position tracking for error messages

**Supported Token Types:**

```typescript
enum TokenType {
  // Literals
  NUMBER, STRING, IDENTIFIER,

  // Keywords
  KEYWORD,

  // Operators
  PLUS, MINUS, MULTIPLY, DIVIDE, MODULO,
  EQUAL, NOT_EQUAL, LESS_THAN, GREATER_THAN,
  AND, OR, NOT, ASSIGN,

  // Delimiters
  LPAREN, RPAREN, LBRACE, RBRACE,
  LBRACKET, RBRACKET, COMMA, DOT, COLON,

  // Special
  NEWLINE, EOF, COMMENT
}
```

### Parser Architecture

**File**: `src/parser/index.ts`

The parser converts tokens into an Abstract Syntax Tree using recursive descent parsing.

**Key Components:**

1. **Parser Class**:
   - `parse()`: Main entry point, returns Program AST node
   - `parseStatement()`: Dispatches to specific statement parsers
   - `parseExpression()`: Handles expressions with precedence climbing
   - `parsePrimaryExpression()`: Parses literals, identifiers, groupings

2. **Precedence Handling**:
   - Uses precedence climbing algorithm
   - Supports right-associative operators (assignment)
   - Handles postfix operators (calls, member access)

**Statement Parsers:**

- `parseVariableDeclaration()`: var declarations
- `parseFunctionDeclaration()`: function definitions
- `parseIfStatement()`: if/else conditionals
- `parseForStatement()`: for loops
- `parseWhileStatement()`: while loops
- `parseReturnStatement()`: return statements
- `parseListenStatement()`: Discord event listeners
- `parseUseStatement()`: Python imports
- `parseSendCommand()`: Discord send command
- `parseReplyCommand()`: Discord reply command
- `parseReactCommand()`: Discord react command

**Expression Parsers:**

- `parsePrimaryExpression()`: Literals, identifiers, arrays
- `parseExpression()`: Binary/unary operations with precedence
- `parseCallExpression()`: Function calls
- `parseMemberExpression()`: Object property access
- `parseComputedMemberExpression()`: Array indexing

### AST Node Types

**File**: `src/parser/ast.ts`

All AST nodes extend the base `ASTNode` interface with a `type` field for discrimination.

**Statement Nodes:**

```typescript
interface VariableDeclaration {
  type: 'VariableDeclaration';
  name: string;
  initializer: Expression | null;
}

interface FunctionDeclaration {
  type: 'FunctionDeclaration';
  name: string;
  parameters: string[];
  body: BlockStatement;
}

interface IfStatement {
  type: 'IfStatement';
  condition: Expression;
  consequent: BlockStatement;
  alternate: BlockStatement | null;
}

// ... more statement types
```

**Expression Nodes:**

```typescript
interface BinaryExpression {
  type: 'BinaryExpression';
  operator: string;
  left: Expression;
  right: Expression;
}

interface CallExpression {
  type: 'CallExpression';
  callee: Expression;
  arguments: Expression[];
}

interface MemberExpression {
  type: 'MemberExpression';
  object: Expression;
  property: Expression;
  computed: boolean; // true for obj[prop], false for obj.prop
}

// ... more expression types
```

### Error Handling

**File**: `src/utils/errors.ts`

Custom error classes with position information:

```typescript
class LexerError extends EzLangError {
  constructor(message: string, line: number, column: number)
}

class ParserError extends EzLangError {
  constructor(message: string, line?: number, column?: number)
}

class RuntimeError extends EzLangError {
  constructor(message: string, line?: number, column?: number)
}
```

All errors include:
- Descriptive message
- Line and column numbers
- `formatError()` method for pretty printing

### Operator Precedence

**File**: `src/parser/precedence.ts`

Precedence levels (lowest to highest):

```typescript
enum Precedence {
  NONE = 0,
  ASSIGNMENT = 1,  // =
  OR = 2,          // ||
  AND = 3,         // &&
  EQUALITY = 4,    // == !=
  COMPARISON = 5,  // < > <= >=
  TERM = 6,        // + -
  FACTOR = 7,      // * / %
  UNARY = 8,       // ! -
  CALL = 9,        // () []
  MEMBER = 10,     // .
}
```

## Testing Strategy

### Unit Tests

**File**: `src/test.ts`

Tests cover:
1. Variable declarations (primitive types, arrays)
2. Control flow statements (if/else, loops)
3. Function declarations
4. Discord commands (listen, send, reply, react)
5. Complex expressions with operator precedence
6. Member access and method calls
7. Python integration (use statements)

### Integration Tests

**File**: `src/test-example.ts`

Full program parsing test using `examples/basic.ezlang`:
- 790 characters of source code
- 195 tokens generated
- 15 statements in AST

### Running Tests

```bash
# Run all lexer/parser tests
npm run test:lexer

# Parse example file
npx ts-node src/test-example.ts

# Build project
npm run build
```

## Code Organization

```
src/
├── lexer/
│   ├── token.ts         # Token types and class
│   ├── keywords.ts      # Reserved keywords
│   └── index.ts         # Lexer implementation
│
├── parser/
│   ├── ast.ts          # AST node definitions
│   ├── precedence.ts   # Operator precedence
│   └── index.ts        # Parser implementation
│
├── utils/
│   ├── errors.ts       # Error classes
│   └── logger.ts       # Logging utilities
│
└── types/
    └── index.ts        # Shared TypeScript types
```

## Design Patterns

### Recursive Descent Parsing

The parser uses recursive descent, where each grammar rule has a corresponding function:

```typescript
parseIfStatement() {
  consume('if')
  condition = parseExpression()
  consequent = parseBlockStatement()
  if (peek() == 'else') {
    alternate = parseBlockStatement()
  }
  return IfStatement(condition, consequent, alternate)
}
```

### Precedence Climbing

For expressions, we use precedence climbing to handle operator precedence:

```typescript
parseExpression(minPrecedence = 0) {
  left = parsePrimaryExpression()

  while (getPrecedence(peek()) > minPrecedence) {
    operator = advance()
    right = parseExpression(getPrecedence(operator) + 1)
    left = BinaryExpression(operator, left, right)
  }

  return left
}
```

### Visitor Pattern (Future)

The AST is designed to support the visitor pattern for tree traversal:

```typescript
interface ASTVisitor {
  visitVariableDeclaration(node: VariableDeclaration): any;
  visitFunctionDeclaration(node: FunctionDeclaration): any;
  visitBinaryExpression(node: BinaryExpression): any;
  // ... more visitors
}
```

## Performance Considerations

1. **Single Pass Lexing**: The lexer processes the source in one pass
2. **No Backtracking**: Parser uses lookahead(1) without backtracking
3. **Token Filtering**: Comments and newlines filtered before parsing
4. **Position Tracking**: Efficient position tracking for error reporting

## Future Phases

### Phase 2: Interpreter

- Environment/Scope management
- Expression evaluation
- Statement execution
- Function calls
- Built-in functions

### Phase 3: Discord Integration

- Event system
- Message handling
- Discord.js integration
- Command processing

### Phase 4: Python Bridge

- IPC communication
- Python subprocess management
- Module importing
- Data serialization

### Phase 5: CLI & REPL

- Command-line interface
- File execution
- Interactive REPL
- Debugging tools

## Contributing Guidelines

When contributing to the lexer/parser:

1. **Add Tests**: Every new feature needs test coverage
2. **Update AST**: Add new node types to ast.ts
3. **Handle Errors**: Provide clear error messages with positions
4. **Document**: Add JSDoc comments to all public APIs
5. **Type Safety**: Maintain strict TypeScript typing

## Common Pitfalls

1. **Operator Precedence**: Always check precedence table
2. **Position Tracking**: Update line/column on every advance()
3. **Error Recovery**: Parser should recover from errors gracefully
4. **Token Filtering**: Don't forget to filter newlines/comments
5. **Type Narrowing**: Use type guards for AST node types

## Debugging Tips

1. **Enable Debug Logging**:
   ```typescript
   import { logger, LogLevel } from './utils/logger';
   logger.setLevel(LogLevel.DEBUG);
   ```

2. **Print Tokens**:
   ```typescript
   const tokens = lexer.tokenize();
   tokens.forEach(t => console.log(t.toString()));
   ```

3. **Print AST**:
   ```typescript
   const ast = parser.parse();
   console.log(JSON.stringify(ast, null, 2));
   ```

4. **Check Position Info**:
   Always verify error messages include line and column numbers

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Crafting Interpreters](http://craftinginterpreters.com/)
- [Discord.js Documentation](https://discord.js.org/)
- [Node.js IPC](https://nodejs.org/api/child_process.html)
