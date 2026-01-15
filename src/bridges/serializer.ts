/**
 * Advanced Serializer for IPC Communication
 * Handles complex types, circular references, and large data
 */

import { SerializedValue } from './types';
import { TypeConverter } from './converter';
import { BridgeError, BridgeErrorType } from './errors';

/**
 * Serialization options
 */
export interface SerializationOptions {
  maxDepth?: number; // Maximum object depth (default: 20)
  maxSize?: number; // Maximum serialized size in bytes (default: 10MB)
  includeCircular?: boolean; // Handle circular references (default: true)
  includeNonEnumerable?: boolean; // Include non-enumerable properties (default: false)
}

/**
 * Advanced serializer for complex data structures
 */
export class Serializer {
  private static readonly DEFAULT_MAX_DEPTH = 20;
  private static readonly DEFAULT_MAX_SIZE = 10 * 1024 * 1024; // 10MB

  /**
   * Serialize value with advanced options
   */
  static serialize(value: any, options: SerializationOptions = {}): string {
    const {
      maxDepth = this.DEFAULT_MAX_DEPTH,
      maxSize = this.DEFAULT_MAX_SIZE,
      includeCircular = true,
      includeNonEnumerable = false,
    } = options;

    const seen = new Map<any, string>(); // Track circular references
    let refCounter = 0;

    const serializeRecursive = (val: any, depth: number): any => {
      // Check depth limit
      if (depth > maxDepth) {
        return { __type__: 'max-depth', __value__: '[Max Depth Exceeded]' };
      }

      // Handle primitives and null/undefined
      if (val === null || val === undefined) {
        return val;
      }

      const primitiveTypes = ['number', 'string', 'boolean', 'symbol'];
      if (primitiveTypes.includes(typeof val)) {
        return typeof val === 'symbol' ? { __type__: 'symbol', __value__: val.toString() } : val;
      }

      // Handle circular references
      if (includeCircular && typeof val === 'object') {
        if (seen.has(val)) {
          return { __type__: 'circular', __ref__: seen.get(val) };
        }
        const ref = `#ref${refCounter++}`;
        seen.set(val, ref);
      }

      // Handle special types
      if (val instanceof Date) {
        return { __type__: 'date', __value__: val.toISOString() };
      }

      if (val instanceof RegExp) {
        return {
          __type__: 'regexp',
          __source__: val.source,
          __flags__: val.flags,
        };
      }

      if (Buffer.isBuffer(val)) {
        return {
          __type__: 'buffer',
          __value__: val.toString('base64'),
        };
      }

      if (val instanceof Error) {
        return {
          __type__: 'error',
          __name__: val.name,
          __message__: val.message,
          __stack__: val.stack,
        };
      }

      if (val instanceof Set) {
        return {
          __type__: 'set',
          __value__: Array.from(val).map((item) => serializeRecursive(item, depth + 1)),
        };
      }

      if (val instanceof Map) {
        return {
          __type__: 'map',
          __value__: Array.from(val.entries()).map(([k, v]) => [
            serializeRecursive(k, depth + 1),
            serializeRecursive(v, depth + 1),
          ]),
        };
      }

      // Handle Arrays
      if (Array.isArray(val)) {
        return val.map((item) => serializeRecursive(item, depth + 1));
      }

      // Handle Functions
      if (typeof val === 'function') {
        const ref = TypeConverter['createRef'](val);
        return {
          __type__: 'function',
          __ref__: ref,
          __name__: val.name || 'anonymous',
        };
      }

      // Handle Promises
      if (val instanceof Promise) {
        const ref = TypeConverter['createRef'](val);
        return {
          __type__: 'promise',
          __ref__: ref,
        };
      }

      // Handle plain objects
      if (typeof val === 'object') {
        const result: any = {};

        const keys = includeNonEnumerable
          ? Object.getOwnPropertyNames(val)
          : Object.keys(val);

        for (const key of keys) {
          try {
            const descriptor = Object.getOwnPropertyDescriptor(val, key);
            if (descriptor && descriptor.enumerable !== false) {
              result[key] = serializeRecursive(val[key], depth + 1);
            }
          } catch (error) {
            // Skip properties that throw on access
            result[key] = { __type__: 'inaccessible' };
          }
        }

        return result;
      }

      // Fallback
      return String(val);
    };

    try {
      const serialized = serializeRecursive(value, 0);
      const json = JSON.stringify(serialized);

      // Check size limit
      if (json.length > maxSize) {
        throw new BridgeError(
          `Serialized data exceeds maximum size (${json.length} > ${maxSize})`,
          BridgeErrorType.SERIALIZATION
        );
      }

      return json;
    } catch (error) {
      if (error instanceof BridgeError) throw error;
      throw new BridgeError(
        `Serialization failed: ${error instanceof Error ? error.message : String(error)}`,
        BridgeErrorType.SERIALIZATION,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Deserialize JSON string back to value
   */
  static deserialize(json: string): any {
    try {
      const parsed = JSON.parse(json);
      return this.reconstructValue(parsed, new Map());
    } catch (error) {
      throw new BridgeError(
        `Deserialization failed: ${error instanceof Error ? error.message : String(error)}`,
        BridgeErrorType.SERIALIZATION,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Reconstruct value from serialized format
   */
  private static reconstructValue(val: any, refs: Map<string, any>): any {
    if (val === null || val === undefined) {
      return val;
    }

    if (typeof val !== 'object') {
      return val;
    }

    // Handle special types
    if (val.__type__) {
      switch (val.__type__) {
        case 'date':
          return new Date(val.__value__);

        case 'regexp':
          return new RegExp(val.__source__, val.__flags__);

        case 'buffer':
          return Buffer.from(val.__value__, 'base64');

        case 'error':
          const error = new Error(val.__message__);
          error.name = val.__name__;
          error.stack = val.__stack__;
          return error;

        case 'set':
          return new Set(val.__value__.map((item: any) => this.reconstructValue(item, refs)));

        case 'map':
          return new Map(
            val.__value__.map(([k, v]: [any, any]) => [
              this.reconstructValue(k, refs),
              this.reconstructValue(v, refs),
            ])
          );

        case 'symbol':
          return Symbol(val.__value__);

        case 'circular':
          return refs.get(val.__ref__) || null;

        case 'function':
          return TypeConverter['getRef'](val.__ref__);

        case 'promise':
          return TypeConverter['getRef'](val.__ref__);

        case 'max-depth':
        case 'inaccessible':
          return val.__value__ || null;

        default:
          // Unknown type, return as-is
          return val;
      }
    }

    // Handle Arrays
    if (Array.isArray(val)) {
      return val.map((item) => this.reconstructValue(item, refs));
    }

    // Handle plain objects
    const result: any = {};
    for (const key in val) {
      if (Object.prototype.hasOwnProperty.call(val, key)) {
        result[key] = this.reconstructValue(val[key], refs);
      }
    }
    return result;
  }

  /**
   * Serialize for Python (convert to Python-compatible format)
   */
  static serializeForPython(value: any): any {
    return TypeConverter.toPython(value);
  }

  /**
   * Deserialize from Python
   */
  static deserializeFromPython(value: any): any {
    return TypeConverter.fromPython(value);
  }

  /**
   * Estimate size of serialized data
   */
  static estimateSize(value: any): number {
    try {
      return JSON.stringify(this.serialize(value)).length;
    } catch {
      return -1; // Cannot estimate
    }
  }

  /**
   * Check if value can be safely serialized
   */
  static canSerialize(value: any, maxDepth = 20): boolean {
    try {
      this.serialize(value, { maxDepth });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Clone value using serialization (deep clone)
   */
  static clone<T>(value: T): T {
    const serialized = this.serialize(value);
    return this.deserialize(serialized) as T;
  }
}
