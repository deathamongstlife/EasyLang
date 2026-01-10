/**
 * Shared TypeScript types and interfaces for EzLang
 */

/**
 * Position in source code
 */
export interface Position {
  line: number;
  column: number;
}

/**
 * Source location with start and end positions
 */
export interface SourceLocation {
  start: Position;
  end: Position;
}

/**
 * Value types in EzLang runtime
 */
export type EzLangValue =
  | string
  | number
  | boolean
  | null
  | EzLangValue[]
  | { [key: string]: EzLangValue }
  | Function;

/**
 * Variable scope
 */
export interface Scope {
  [key: string]: EzLangValue;
}

/**
 * Function signature
 */
export interface FunctionSignature {
  name: string;
  parameters: string[];
  body: any; // AST node
}
