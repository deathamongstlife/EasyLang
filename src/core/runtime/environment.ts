/**
 * Environment for variable scoping in EzLang
 * Manages variable storage with support for nested scopes
 */

import { RuntimeValue } from './values';
import { UndefinedVariableError, RuntimeError } from '../../utils/errors';

export class Environment {
  private variables: Map<string, RuntimeValue>;
  private parent: Environment | null;

  constructor(parent: Environment | null = null) {
    this.variables = new Map();
    this.parent = parent;
  }

  /**
   * Declare a new variable in the current scope
   * Throws an error if the variable is already declared in this scope
   */
  declare(name: string, value: RuntimeValue): void {
    if (this.variables.has(name)) {
      throw new RuntimeError(`Variable '${name}' is already declared in this scope`);
    }
    this.variables.set(name, value);
  }

  /**
   * Assign a value to an existing variable
   * Searches up the parent chain to find the variable
   * Throws an error if the variable is not found
   */
  assign(name: string, value: RuntimeValue): void {
    if (this.variables.has(name)) {
      this.variables.set(name, value);
      return;
    }

    // Search in parent environment
    if (this.parent) {
      this.parent.assign(name, value);
      return;
    }

    // Variable not found
    throw new UndefinedVariableError(name);
  }

  /**
   * Look up a variable's value
   * Searches up the parent chain to find the variable
   * Throws an error if the variable is not found
   */
  lookup(name: string): RuntimeValue {
    if (this.variables.has(name)) {
      return this.variables.get(name)!;
    }

    // Search in parent environment
    if (this.parent) {
      return this.parent.lookup(name);
    }

    // Variable not found
    throw new UndefinedVariableError(name);
  }

  /**
   * Check if a variable is declared in the current scope or any parent scope
   */
  isDeclared(name: string): boolean {
    if (this.variables.has(name)) {
      return true;
    }

    if (this.parent) {
      return this.parent.isDeclared(name);
    }

    return false;
  }

  /**
   * Create a new child environment (for function scopes)
   * The child environment can access variables from this environment
   */
  extend(): Environment {
    return new Environment(this);
  }

  /**
   * Get the parent environment
   */
  getParent(): Environment | null {
    return this.parent;
  }

  /**
   * Get all variables in the current scope (for debugging)
   */
  getVariables(): Map<string, RuntimeValue> {
    return new Map(this.variables);
  }

  /**
   * Set a variable in the current scope without checking if it exists
   * Used internally for function parameters
   */
  define(name: string, value: RuntimeValue): void {
    this.variables.set(name, value);
  }

  /**
   * Get all variables from current scope and all parent scopes
   * Used for REPL .vars command
   */
  getAll(): Record<string, RuntimeValue> {
    const result: Record<string, RuntimeValue> = {};

    // Get variables from parent first (so current scope can override)
    if (this.parent) {
      Object.assign(result, this.parent.getAll());
    }

    // Add variables from current scope
    for (const [name, value] of this.variables.entries()) {
      result[name] = value;
    }

    return result;
  }
}
