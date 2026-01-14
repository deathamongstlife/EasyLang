/**
 * JavaScript Object Proxy
 * Creates EzLang-compatible proxies for JavaScript objects
 */

import {
  RuntimeValue,
  ObjectValue,
  makeObject,
  makeNativeFunction,
  makeNumber,
  makeString,
  makeBoolean,
  makeNull,
  makeArray,
} from '../runtime/values';
import { JavaScriptLoader } from './loader';
import { EventListenerRef } from './types';
import { logger } from '../utils/logger';

/**
 * JavaScript object proxy for EzLang integration
 */
export class JavaScriptProxy {
  private packageName: string;
  private loader: JavaScriptLoader;
  private eventListeners: Map<string, EventListenerRef> = new Map();
  private refCounter = 0;

  constructor(packageName: string) {
    this.packageName = packageName;
    this.loader = JavaScriptLoader.getInstance();
  }

  /**
   * Create proxy object for the JavaScript package
   */
  createProxy(): ObjectValue {
    const proxy = makeObject();

    // Add special metadata
    proxy.properties.set('__package__', makeString(this.packageName));
    proxy.properties.set('__type__', makeString('javascript-package'));

    // Note: Properties are accessed dynamically via member expressions
    // The runtime will call getAttribute when accessing properties

    return proxy;
  }

  /**
   * Get attribute from JavaScript package
   */
  async getAttribute(propertyPath: string[]): Promise<RuntimeValue> {
    try {
      const value = this.loader.getProperty(this.packageName, propertyPath);
      return this.convertToRuntime(value, propertyPath);
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Call JavaScript function
   */
  async callFunction(
    functionPath: string[],
    args: RuntimeValue[],
    options: { isConstructor?: boolean } = {}
  ): Promise<RuntimeValue> {
    try {
      // Convert EzLang arguments to JavaScript
      const jsArgs = args.map((arg) => this.convertToJavaScript(arg));

      // Call the function
      const result = await this.loader.callFunction(
        this.packageName,
        functionPath,
        jsArgs,
        options
      );

      // Convert result back to RuntimeValue
      return this.convertToRuntime(result, functionPath);
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Convert JavaScript value to EzLang RuntimeValue
   */
  private convertToRuntime(value: any, path: string[]): RuntimeValue {
    // Handle null/undefined
    if (value === null || value === undefined) {
      return makeNull();
    }

    // Handle primitives
    if (typeof value === 'number') {
      return makeNumber(value);
    }
    if (typeof value === 'string') {
      return makeString(value);
    }
    if (typeof value === 'boolean') {
      return makeBoolean(value);
    }

    // Handle Arrays
    if (Array.isArray(value)) {
      const elements = value.map((item) => this.convertToRuntime(item, path));
      return makeArray(elements);
    }

    // Handle Promises
    if (value && typeof value.then === 'function') {
      // Return a native function that resolves the promise
      return makeNativeFunction('promise_result', async () => {
        const resolved = await value;
        return this.convertToRuntime(resolved, path);
      });
    }

    // Handle Functions
    if (typeof value === 'function') {
      const functionName = value.name || path.join('.');

      // Check if it's a constructor (class)
      const isConstructor = /^class\s/.test(value.toString()) || value.prototype?.constructor === value;

      return makeNativeFunction(functionName, async (args: RuntimeValue[]) => {
        return this.callFunction(path, args, { isConstructor });
      });
    }

    // Handle Error objects
    if (value instanceof Error) {
      const errorObj = makeObject();
      errorObj.properties.set('name', makeString(value.name));
      errorObj.properties.set('message', makeString(value.message));
      if (value.stack) {
        errorObj.properties.set('stack', makeString(value.stack));
      }
      return errorObj;
    }

    // Handle Date objects
    if (value instanceof Date) {
      return makeString(value.toISOString());
    }

    // Handle Buffer
    if (Buffer.isBuffer(value)) {
      // Convert Buffer to array of numbers
      const bytes = Array.from(value).map((byte) => makeNumber(byte));
      return makeArray(bytes);
    }

    // Handle RegExp
    if (value instanceof RegExp) {
      return makeString(value.toString());
    }

    // Handle Set
    if (value instanceof Set) {
      const elements = Array.from(value).map((item) => this.convertToRuntime(item, path));
      return makeArray(elements);
    }

    // Handle Map
    if (value instanceof Map) {
      const obj = makeObject();
      for (const [key, val] of value.entries()) {
        const keyStr = String(key);
        obj.properties.set(keyStr, this.convertToRuntime(val, [...path, keyStr]));
      }
      return obj;
    }

    // Handle EventEmitter or objects with 'on' method
    if (value && typeof value.on === 'function') {
      const obj = this.convertObjectToRuntime(value, path);

      // Add special event handling methods
      obj.properties.set(
        'on',
        makeNativeFunction('on', async (args: RuntimeValue[]) => {
          if (args.length < 2) {
            throw new Error('on() requires event name and handler function');
          }

          const eventName = (args[0] as any).value;
          const handler = args[1];

          if (typeof handler !== 'object' || handler.type !== 'native-function') {
            throw new Error('Second argument must be a function');
          }

          // Register event listener
          const listenerId = `${this.packageName}_${++this.refCounter}`;
          const jsHandler = (...jsArgs: any[]) => {
            const runtimeArgs = jsArgs.map((arg) => this.convertToRuntime(arg, path));
            return (handler as any).call(runtimeArgs);
          };

          value.on(eventName, jsHandler);

          this.eventListeners.set(listenerId, {
            id: listenerId,
            emitter: value,
            event: eventName,
            handler: jsHandler,
          });

          return makeString(listenerId);
        })
      );

      return obj;
    }

    // Handle plain objects
    if (typeof value === 'object' && value !== null) {
      return this.convertObjectToRuntime(value, path);
    }

    // Fallback to string representation
    return makeString(String(value));
  }

  /**
   * Convert plain JavaScript object to RuntimeValue object
   */
  private convertObjectToRuntime(obj: any, path: string[]): ObjectValue {
    const runtimeObj = makeObject();

    try {
      // Get all enumerable properties
      for (const key in obj) {
        try {
          const value = obj[key];
          runtimeObj.properties.set(key, this.convertToRuntime(value, [...path, key]));
        } catch (error) {
          // Skip properties that throw on access
          logger.debug(`Skipped inaccessible property: ${key}`);
        }
      }

      // Get prototype methods if available
      const proto = Object.getPrototypeOf(obj);
      if (proto && proto !== Object.prototype) {
        const propNames = Object.getOwnPropertyNames(proto);
        for (const propName of propNames) {
          if (propName !== 'constructor' && typeof obj[propName] === 'function') {
            const bound = obj[propName].bind(obj);
            runtimeObj.properties.set(
              propName,
              makeNativeFunction(propName, async (args: RuntimeValue[]) => {
                const jsArgs = args.map((arg) => this.convertToJavaScript(arg));
                const result = await bound(...jsArgs);
                return this.convertToRuntime(result, [...path, propName]);
              })
            );
          }
        }
      }
    } catch (error) {
      logger.warn(`Error converting object to runtime: ${error}`);
    }

    return runtimeObj;
  }

  /**
   * Convert EzLang RuntimeValue to JavaScript
   */
  private convertToJavaScript(value: RuntimeValue): any {
    switch (value.type) {
      case 'null':
        return null;

      case 'number':
        return (value as any).value;

      case 'string':
        return (value as any).value;

      case 'boolean':
        return (value as any).value;

      case 'array':
        return (value as any).elements.map((item: RuntimeValue) =>
          this.convertToJavaScript(item)
        );

      case 'object':
        const obj: any = {};
        const objValue = value as ObjectValue;
        for (const [key, val] of objValue.properties.entries()) {
          // Skip internal metadata
          if (key.startsWith('__')) continue;
          obj[key] = this.convertToJavaScript(val);
        }
        return obj;

      case 'native-function':
      case 'function':
        // Return a JavaScript function that calls back to EzLang
        return (...args: any[]) => {
          const runtimeArgs = args.map((arg) => this.convertToRuntime(arg, []));
          return (value as any).call(runtimeArgs);
        };

      default:
        // For other types, try to convert to string
        return String((value as any).value || value);
    }
  }

  /**
   * Remove event listener
   */
  removeEventListener(listenerId: string): boolean {
    const listener = this.eventListeners.get(listenerId);
    if (!listener) return false;

    try {
      listener.emitter.removeListener(listener.event, listener.handler);
      this.eventListeners.delete(listenerId);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Remove all event listeners
   */
  removeAllEventListeners(): void {
    for (const listener of this.eventListeners.values()) {
      try {
        listener.emitter.removeListener(listener.event, listener.handler);
      } catch {
        // Ignore errors
      }
    }
    this.eventListeners.clear();
  }

  /**
   * Cleanup
   */
  cleanup(): void {
    this.removeAllEventListeners();
  }
}
