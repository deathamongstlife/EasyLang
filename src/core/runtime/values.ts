/**
 * Runtime value types for EzLang
 * These represent values during program execution
 */

import { BlockStatement } from '../parser/ast';
import { Environment } from './environment';

/**
 * Base interface for all runtime values
 */
export interface RuntimeValue {
  type: string;
}

/**
 * Numeric value
 */
export interface NumberValue extends RuntimeValue {
  type: 'number';
  value: number;
}

/**
 * String value
 */
export interface StringValue extends RuntimeValue {
  type: 'string';
  value: string;
}

/**
 * Boolean value
 */
export interface BooleanValue extends RuntimeValue {
  type: 'boolean';
  value: boolean;
}

/**
 * Null value
 */
export interface NullValue extends RuntimeValue {
  type: 'null';
  value: null;
}

/**
 * Array value
 */
export interface ArrayValue extends RuntimeValue {
  type: 'array';
  elements: RuntimeValue[];
}

/**
 * Object value (for future use with member expressions)
 */
export interface ObjectValue extends RuntimeValue {
  type: 'object';
  properties: Map<string, RuntimeValue>;
}

/**
 * User-defined function value
 */
export interface FunctionValue extends RuntimeValue {
  type: 'function';
  name: string;
  parameters: string[];
  body: BlockStatement;
  closure: Environment; // Captured environment for closures
}

/**
 * Native (built-in) function value
 */
export interface NativeFunctionValue extends RuntimeValue {
  type: 'native-function';
  name: string;
  call: (args: RuntimeValue[], env: Environment) => Promise<RuntimeValue>;
}

/**
 * Special value used internally for return statements
 */
export interface ReturnValue extends RuntimeValue {
  type: 'return';
  value: RuntimeValue;
}

/**
 * Python module proxy value
 */
export interface PythonValue extends RuntimeValue {
  type: 'python';
  moduleName: string;
  proxy: ObjectValue;
}

/**
 * Helper functions to create runtime values
 */

export function makeNumber(value: number): NumberValue {
  return { type: 'number', value };
}

export function makeString(value: string): StringValue {
  return { type: 'string', value };
}

export function makeBoolean(value: boolean): BooleanValue {
  return { type: 'boolean', value };
}

export function makeNull(): NullValue {
  return { type: 'null', value: null };
}

export function makeArray(elements: RuntimeValue[]): ArrayValue {
  return { type: 'array', elements };
}

export function makeObject(properties: Map<string, RuntimeValue> = new Map()): ObjectValue {
  return { type: 'object', properties };
}

/**
 * Helper function to create an ObjectValue from an array of key-value pairs
 * This avoids TypeScript inference issues when creating Maps with mixed RuntimeValue types
 */
export function makeRuntimeObject(entries: [string, RuntimeValue][]): ObjectValue {
  return makeObject(new Map(entries) as Map<string, RuntimeValue>);
}

export function makeFunction(
  name: string,
  parameters: string[],
  body: BlockStatement,
  closure: Environment
): FunctionValue {
  return { type: 'function', name, parameters, body, closure };
}

export function makeNativeFunction(
  name: string,
  call: (args: RuntimeValue[], env: Environment) => Promise<RuntimeValue>
): NativeFunctionValue {
  return { type: 'native-function', name, call };
}

export function makeReturn(value: RuntimeValue): ReturnValue {
  return { type: 'return', value };
}

export function makePython(moduleName: string, proxy: ObjectValue): PythonValue {
  return { type: 'python', moduleName, proxy };
}

/**
 * Type guard functions
 */

export function isNumber(value: RuntimeValue): value is NumberValue {
  return value.type === 'number';
}

export function isString(value: RuntimeValue): value is StringValue {
  return value.type === 'string';
}

export function isBoolean(value: RuntimeValue): value is BooleanValue {
  return value.type === 'boolean';
}

export function isNull(value: RuntimeValue): value is NullValue {
  return value.type === 'null';
}

export function isArray(value: RuntimeValue): value is ArrayValue {
  return value.type === 'array';
}

export function isObject(value: RuntimeValue): value is ObjectValue {
  return value.type === 'object';
}

export function isFunction(value: RuntimeValue): value is FunctionValue {
  return value.type === 'function';
}

export function isNativeFunction(value: RuntimeValue): value is NativeFunctionValue {
  return value.type === 'native-function';
}

export function isReturn(value: RuntimeValue): value is ReturnValue {
  return value.type === 'return';
}

export function isPython(value: RuntimeValue): value is PythonValue {
  return value.type === 'python';
}

/**
 * Check if a value is truthy (for if statements and logical operators)
 * False values: null, false, 0, empty string
 * Everything else is truthy
 */
export function isTruthy(value: RuntimeValue): boolean {
  if (isNull(value)) return false;
  if (isBoolean(value)) return value.value;
  if (isNumber(value)) return value.value !== 0;
  if (isString(value)) return value.value !== '';
  return true; // Arrays, objects, functions are always truthy
}

/**
 * Check if two values are equal (for == operator)
 * Performs type coercion similar to JavaScript
 */
export function valuesEqual(a: RuntimeValue, b: RuntimeValue): boolean {
  // Same type comparison
  if (a.type === b.type) {
    if (isNull(a)) return true;
    if (isNumber(a) && isNumber(b)) return a.value === b.value;
    if (isString(a) && isString(b)) return a.value === b.value;
    if (isBoolean(a) && isBoolean(b)) return a.value === b.value;
    if (isArray(a) && isArray(b)) {
      // Array equality by deep comparison
      if (a.elements.length !== b.elements.length) return false;
      for (let i = 0; i < a.elements.length; i++) {
        if (!valuesEqual(a.elements[i], b.elements[i])) return false;
      }
      return true;
    }
    if (isObject(a) && isObject(b)) {
      // Object equality by reference (for now, deep comparison is complex)
      return a === b;
    }
    if (isFunction(a) && isFunction(b)) {
      // Function equality by reference
      return a === b;
    }
    return false;
  }

  // Type coercion
  // null == false, null == 0
  if (isNull(a)) {
    return isBoolean(b) && !b.value || isNumber(b) && b.value === 0;
  }
  if (isNull(b)) {
    return isBoolean(a) && !a.value || isNumber(a) && a.value === 0;
  }

  // Number and string comparison
  if (isNumber(a) && isString(b)) {
    const numB = parseFloat(b.value);
    return !isNaN(numB) && a.value === numB;
  }
  if (isString(a) && isNumber(b)) {
    const numA = parseFloat(a.value);
    return !isNaN(numA) && numA === b.value;
  }

  // Boolean coercion to number
  if (isBoolean(a) && isNumber(b)) {
    return (a.value ? 1 : 0) === b.value;
  }
  if (isNumber(a) && isBoolean(b)) {
    return a.value === (b.value ? 1 : 0);
  }

  return false;
}

/**
 * Convert a runtime value to a display string (for debugging)
 */
export function valueToString(value: RuntimeValue): string {
  if (isNull(value)) return 'null';
  if (isNumber(value)) return value.value.toString();
  if (isString(value)) return value.value;
  if (isBoolean(value)) return value.value.toString();
  if (isArray(value)) {
    const elements = value.elements.map(valueToString).join(', ');
    return `[${elements}]`;
  }
  if (isObject(value)) {
    const props = Array.from(value.properties.entries())
      .map(([key, val]) => `${key}: ${valueToString(val)}`)
      .join(', ');
    return `{${props}}`;
  }
  if (isFunction(value)) {
    return `<function ${value.name}>`;
  }
  if (isNativeFunction(value)) {
    return `<native function ${value.name}>`;
  }
  if (isPython(value)) {
    return `<Python module ${value.moduleName}>`;
  }
  return '<unknown>';
}
