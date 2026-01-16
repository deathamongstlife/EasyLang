/**
 * Bidirectional Type Converter
 * Handles conversion between JavaScript/TypeScript and Python types
 */

import { BridgeableType, SerializedValue } from './types';
import { TypeConversionError } from './errors';

/**
 * Type Converter for bidirectional conversion
 */
export class TypeConverter {
  private static refCounter = 0;
  private static objectRefs = new Map<string, any>();

  /**
   * Convert JavaScript value to serializable format
   */
  static toSerializable(value: any): SerializedValue {
    // Handle null and undefined
    if (value === null) {
      return { type: 'null' };
    }
    if (value === undefined) {
      return { type: 'undefined' };
    }

    // Handle primitives
    if (typeof value === 'number') {
      return { type: 'number', value };
    }
    if (typeof value === 'string') {
      return { type: 'string', value };
    }
    if (typeof value === 'boolean') {
      return { type: 'boolean', value };
    }
    if (typeof value === 'symbol') {
      return { type: 'symbol', value: value.toString() };
    }

    // Handle Date
    if (value instanceof Date) {
      return { type: 'date', value: value.toISOString() };
    }

    // Handle RegExp
    if (value instanceof RegExp) {
      return {
        type: 'regexp',
        value: {
          source: value.source,
          flags: value.flags,
        },
      };
    }

    // Handle Buffer
    if (Buffer.isBuffer(value)) {
      return {
        type: 'buffer',
        value: value.toString('base64'),
      };
    }

    // Handle Error
    if (value instanceof Error) {
      return {
        type: 'error',
        value: {
          name: value.name,
          message: value.message,
          stack: value.stack,
        },
      };
    }

    // Handle Array
    if (Array.isArray(value)) {
      return {
        type: 'array',
        value: value.map((item) => this.toSerializable(item)),
      };
    }

    // Handle Promise
    if (value instanceof Promise) {
      const ref = this.createRef(value);
      return {
        type: 'promise',
        __ref: ref,
        __async: true,
      };
    }

    // Handle Function
    if (typeof value === 'function') {
      const ref = this.createRef(value);
      const isClass = /^class\s/.test(value.toString());
      return {
        type: isClass ? 'class' : 'function',
        __ref: ref,
        __callable: true,
        __async: value.constructor.name === 'AsyncFunction',
        __class: isClass ? value.name : undefined,
      };
    }

    // Handle Plain Object
    if (typeof value === 'object') {
      const serialized: any = {};
      for (const key in value) {
        if (Object.prototype.hasOwnProperty.call(value, key)) {
          serialized[key] = this.toSerializable(value[key]);
        }
      }
      return {
        type: 'object',
        value: serialized,
      };
    }

    // Fallback
    return {
      type: 'string',
      value: String(value),
    };
  }

  /**
   * Convert serialized value back to JavaScript
   */
  static fromSerializable(serialized: SerializedValue): any {
    switch (serialized.type) {
      case 'null':
        return null;

      case 'undefined':
        return undefined;

      case 'number':
      case 'string':
      case 'boolean':
        return serialized.value;

      case 'symbol':
        return Symbol(serialized.value);

      case 'date':
        return new Date(serialized.value);

      case 'regexp':
        return new RegExp(serialized.value.source, serialized.value.flags);

      case 'buffer':
        return Buffer.from(serialized.value, 'base64');

      case 'error':
        const error = new Error(serialized.value.message);
        error.name = serialized.value.name;
        error.stack = serialized.value.stack;
        return error;

      case 'array':
        return serialized.value.map((item: SerializedValue) =>
          this.fromSerializable(item)
        );

      case 'object':
        const obj: any = {};
        for (const key in serialized.value) {
          obj[key] = this.fromSerializable(serialized.value[key]);
        }
        return obj;

      case 'promise':
        return this.getRef(serialized.__ref!);

      case 'function':
      case 'class':
        return this.getRef(serialized.__ref!);

      default:
        throw new TypeConversionError(
          serialized.type,
          'javascript',
          serialized,
          `Unknown serialized type: ${serialized.type}`
        );
    }
  }

  /**
   * Convert JavaScript value to Python-compatible format
   */
  static toPython(value: any): any {
    if (value === null || value === undefined) {
      return null;
    }

    if (typeof value === 'number' || typeof value === 'string' || typeof value === 'boolean') {
      return value;
    }

    if (value instanceof Date) {
      return value.toISOString();
    }

    if (Buffer.isBuffer(value)) {
      return Array.from(value);
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.toPython(item));
    }

    if (typeof value === 'object') {
      const result: any = {};
      for (const key in value) {
        if (Object.prototype.hasOwnProperty.call(value, key)) {
          result[key] = this.toPython(value[key]);
        }
      }
      return result;
    }

    if (typeof value === 'function') {
      // Return a reference that can be called back
      const ref = this.createRef(value);
      return {
        __type__: 'callback',
        __ref__: ref,
      };
    }

    // Fallback to string representation
    return String(value);
  }

  /**
   * Convert Python value to JavaScript
   */
  static fromPython(value: any): any {
    if (value === null || value === undefined) {
      return null;
    }

    if (typeof value === 'number' || typeof value === 'string' || typeof value === 'boolean') {
      return value;
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.fromPython(item));
    }

    if (typeof value === 'object') {
      // Handle special Python types
      if (value.__type__ === 'bytes') {
        return Buffer.from(value.__value__);
      }

      if (value.__type__ === 'datetime') {
        return new Date(value.__value__);
      }

      if (value.__type__ === 'function' || value.__type__ === 'method') {
        // Return a proxy function that calls back to Python
        return (..._args: any[]) => {
          // This will be handled by the bridge
          throw new Error('Python function calls must go through bridge');
        };
      }

      // Convert plain object
      const result: any = {};
      for (const key in value) {
        if (Object.prototype.hasOwnProperty.call(value, key) && !key.startsWith('__')) {
          result[key] = this.fromPython(value[key]);
        }
      }
      return result;
    }

    return value;
  }

  /**
   * Detect type of value
   */
  static detectType(value: any): BridgeableType {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'string') return 'string';
    if (typeof value === 'boolean') return 'boolean';
    if (typeof value === 'symbol') return 'symbol';
    if (value instanceof Date) return 'date';
    if (value instanceof RegExp) return 'regexp';
    if (Buffer.isBuffer(value)) return 'buffer';
    if (value instanceof Error) return 'error';
    if (Array.isArray(value)) return 'array';
    if (value instanceof Promise) return 'promise';

    if (typeof value === 'function') {
      return /^class\s/.test(value.toString()) ? 'class' : 'function';
    }

    if (typeof value === 'object') return 'object';

    return 'string'; // Fallback
  }

  /**
   * Create a reference for complex objects
   */
  private static createRef(value: any): string {
    const ref = `ref_${++this.refCounter}_${Date.now()}`;
    this.objectRefs.set(ref, value);
    return ref;
  }

  /**
   * Get object by reference
   */
  private static getRef(ref: string): any {
    if (!this.objectRefs.has(ref)) {
      throw new Error(`Invalid reference: ${ref}`);
    }
    return this.objectRefs.get(ref);
  }

  /**
   * Delete reference
   */
  static deleteRef(ref: string): void {
    this.objectRefs.delete(ref);
  }

  /**
   * Clear all references
   */
  static clearRefs(): void {
    this.objectRefs.clear();
  }

  /**
   * Check if value is serializable
   */
  static isSerializable(value: any): boolean {
    try {
      this.toSerializable(value);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get size of references map
   */
  static getRefCount(): number {
    return this.objectRefs.size;
  }
}
