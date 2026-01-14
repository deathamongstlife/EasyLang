/**
 * JavaScript Bridge Type Definitions
 * Type-safe interfaces for npm package integration
 */

/**
 * JavaScript object reference
 */
export interface JsObjectRef {
  id: string;
  type: 'function' | 'class' | 'object' | 'promise' | 'proxy';
  packageName: string;
  path: string[]; // Property access path
  isAsync?: boolean;
  isConstructor?: boolean;
}

/**
 * JavaScript function call options
 */
export interface JsCallOptions {
  context?: any; // 'this' binding
  isConstructor?: boolean; // Use 'new' keyword
  isAsync?: boolean; // Force async handling
}

/**
 * JavaScript package export structure
 */
export interface JsPackageExports {
  default?: any;
  named: { [key: string]: any };
}

/**
 * Event listener registration
 */
export interface EventListenerRef {
  id: string;
  emitter: any;
  event: string;
  handler: (...args: any[]) => void;
}

/**
 * Stream handler for Node.js streams
 */
export interface StreamHandler {
  id: string;
  stream: any;
  type: 'readable' | 'writable' | 'duplex' | 'transform';
  handlers: {
    data?: (...args: any[]) => void;
    end?: (...args: any[]) => void;
    error?: (...args: any[]) => void;
  };
}
