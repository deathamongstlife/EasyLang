/**
 * Common type definitions for bridge systems
 * Provides type-safe interfaces for Python and JavaScript bridges
 */

/**
 * Supported value types that can be bridged
 */
export type BridgeableType =
  | 'null'
  | 'undefined'
  | 'number'
  | 'string'
  | 'boolean'
  | 'array'
  | 'object'
  | 'function'
  | 'class'
  | 'promise'
  | 'buffer'
  | 'date'
  | 'error'
  | 'symbol'
  | 'regexp';

/**
 * Serializable value for IPC transmission
 */
export interface SerializedValue {
  type: BridgeableType;
  value?: any;
  __ref?: string; // Reference ID for complex objects
  __proto?: string; // Prototype chain info
  __callable?: boolean; // Is this callable?
  __async?: boolean; // Is this async?
  __class?: string; // Class name if applicable
  __module?: string; // Module name for Python objects
}

/**
 * Package type enumeration
 */
export enum PackageType {
  PYTHON = 'python',
  NPM = 'npm',
  AUTO = 'auto',
}

/**
 * Package metadata
 */
export interface PackageMetadata {
  name: string;
  type: PackageType;
  version?: string;
  installed: boolean;
  path?: string;
  dependencies?: string[];
}

/**
 * Bridge configuration
 */
export interface BridgeConfig {
  timeout?: number; // Request timeout in ms
  maxRetries?: number; // Max retry attempts
  cacheEnabled?: boolean; // Enable package caching
  autoInstall?: boolean; // Auto-install missing packages
  pythonPath?: string; // Custom Python executable path
  nodeModulesPath?: string; // Custom node_modules path
}

/**
 * Package import options
 */
export interface ImportOptions {
  type?: PackageType; // Package type (auto-detect if not specified)
  version?: string; // Specific version to import
  alias?: string; // Alias for the imported module
  forceReload?: boolean; // Force reload even if cached
}

/**
 * Function call options
 */
export interface CallOptions {
  timeout?: number; // Override default timeout
  async?: boolean; // Force async execution
  context?: any; // Execution context (this binding)
}

/**
 * Bridge error types
 */
export enum BridgeErrorType {
  CONNECTION = 'CONNECTION_ERROR',
  IMPORT = 'IMPORT_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  TYPE_ERROR = 'TYPE_ERROR',
  TIMEOUT = 'TIMEOUT_ERROR',
  SERIALIZATION = 'SERIALIZATION_ERROR',
  EXECUTION = 'EXECUTION_ERROR',
  INSTALLATION = 'INSTALLATION_ERROR',
}

/**
 * Object reference for tracking complex objects across bridge
 */
export interface ObjectReference {
  id: string; // Unique reference ID
  type: BridgeableType;
  module?: string; // Source module
  properties?: string[]; // Known properties
  methods?: string[]; // Known methods
  callable?: boolean; // Is callable
  iterable?: boolean; // Is iterable
}

/**
 * Callback registration for handling callbacks from other side
 */
export interface CallbackRegistration {
  id: string;
  handler: (...args: any[]) => any;
  once?: boolean; // Remove after first call
}

/**
 * Stream data for handling iterators/generators
 */
export interface StreamData {
  id: string;
  done: boolean;
  value?: any;
  error?: string;
}

/**
 * Context manager state for Python 'with' statements
 */
export interface ContextManager {
  id: string;
  entered: boolean;
  exitHandler?: () => Promise<void>;
}
