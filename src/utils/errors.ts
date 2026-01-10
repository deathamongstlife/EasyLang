/**
 * Base error class for EzLang errors
 */
export class EzLangError extends Error {
  constructor(
    message: string,
    public readonly line?: number,
    public readonly column?: number
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Format the error message with location information
   */
  formatError(): string {
    if (this.line !== undefined && this.column !== undefined) {
      return `${this.name} at line ${this.line}, column ${this.column}: ${this.message}`;
    }
    return `${this.name}: ${this.message}`;
  }
}

/**
 * Error thrown during lexical analysis
 */
export class LexerError extends EzLangError {
  constructor(message: string, line: number, column: number) {
    super(message, line, column);
  }
}

/**
 * Error thrown during parsing
 */
export class ParserError extends EzLangError {
  constructor(message: string, line?: number, column?: number) {
    super(message, line, column);
  }
}

/**
 * Error thrown during runtime execution
 */
export class RuntimeError extends EzLangError {
  constructor(message: string, line?: number, column?: number) {
    super(message, line, column);
  }
}

/**
 * Error thrown when a variable is not found
 */
export class UndefinedVariableError extends RuntimeError {
  constructor(variableName: string, line?: number, column?: number) {
    super(`Undefined variable: ${variableName}`, line, column);
  }
}

/**
 * Error thrown when a function is not found
 */
export class UndefinedFunctionError extends RuntimeError {
  constructor(functionName: string, line?: number, column?: number) {
    super(`Undefined function: ${functionName}`, line, column);
  }
}

/**
 * Error thrown for type mismatches
 */
export class TypeError extends RuntimeError {
  constructor(message: string, line?: number, column?: number) {
    super(message, line, column);
  }
}
