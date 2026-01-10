/**
 * Python Object Proxy
 * Creates EzLang objects that proxy to Python modules
 */

import { PythonBridge } from './index';
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

export class PythonProxy {
  private moduleName: string;
  private bridge: PythonBridge;

  constructor(moduleName: string, bridge: PythonBridge) {
    this.moduleName = moduleName;
    this.bridge = bridge;
  }

  /**
   * Create a proxy object for the Python module
   */
  createProxy(): ObjectValue {
    const proxy = makeObject();

    // Add a special property to identify this as a Python module proxy
    proxy.properties.set('__module__', makeString(this.moduleName));
    proxy.properties.set('__type__', makeString('python-module'));

    // Note: We can't enumerate Python module attributes ahead of time,
    // so we'll handle attribute access dynamically in the runtime
    // when member expressions are evaluated

    return proxy;
  }

  /**
   * Get an attribute from the Python module
   */
  async getAttribute(attrPath: string[]): Promise<RuntimeValue> {
    try {
      const result = await this.bridge.getAttribute(this.moduleName, attrPath);
      return this.convertPythonToRuntime(result, attrPath);
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Call a Python function
   */
  async callFunction(functionName: string, args: RuntimeValue[]): Promise<RuntimeValue> {
    try {
      // Convert EzLang arguments to Python-compatible format
      const pythonArgs = args.map((arg) => this.convertRuntimeToPython(arg));

      // Call the function
      const result = await this.bridge.callFunction(this.moduleName, functionName, pythonArgs);

      // Convert result back to RuntimeValue
      return this.convertPythonToRuntime(result, [functionName]);
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Convert Python result to EzLang RuntimeValue
   */
  private convertPythonToRuntime(value: any, attrPath: string[]): RuntimeValue {
    // Handle null/undefined
    if (value === null || value === undefined) {
      return makeNull();
    }

    // Handle basic types
    if (typeof value === 'number') {
      return makeNumber(value);
    }
    if (typeof value === 'string') {
      return makeString(value);
    }
    if (typeof value === 'boolean') {
      return makeBoolean(value);
    }

    // Handle arrays
    if (Array.isArray(value)) {
      const elements = value.map((item) => this.convertPythonToRuntime(item, attrPath));
      return makeArray(elements);
    }

    // Handle objects with special types
    if (typeof value === 'object' && value.__type__) {
      if (value.__type__ === 'function') {
        // Create a native function that calls back to Python
        const functionName = attrPath.join('.');
        return makeNativeFunction(
          value.__name__ || functionName,
          async (args: RuntimeValue[]) => {
            const pythonArgs = args.map((arg) => this.convertRuntimeToPython(arg));
            const result = await this.bridge.callFunction(
              this.moduleName,
              functionName,
              pythonArgs
            );
            return this.convertPythonToRuntime(result, attrPath);
          }
        );
      }

      if (value.__type__ === 'object') {
        // Return a string representation for complex objects
        return makeString(value.__repr__ || '<Python object>');
      }
    }

    // Handle plain objects (convert to ObjectValue)
    if (typeof value === 'object') {
      const obj = makeObject();
      for (const [key, val] of Object.entries(value)) {
        obj.properties.set(key, this.convertPythonToRuntime(val, [...attrPath, key]));
      }
      return obj;
    }

    // Fallback to string representation
    return makeString(String(value));
  }

  /**
   * Convert EzLang RuntimeValue to Python-compatible format
   */
  private convertRuntimeToPython(value: RuntimeValue): any {
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
          this.convertRuntimeToPython(item)
        );
      case 'object':
        const obj: any = {};
        const objValue = value as ObjectValue;
        for (const [key, val] of objValue.properties.entries()) {
          obj[key] = this.convertRuntimeToPython(val);
        }
        return obj;
      default:
        // For functions and other types, return string representation
        return String(value);
    }
  }
}
