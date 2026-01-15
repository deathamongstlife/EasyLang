/**
 * Bridge Error Classes
 * Specialized error types for bridge operations
 */

import { BridgeErrorType } from './types';

/**
 * Base class for all bridge errors
 */
export class BridgeError extends Error {
  public readonly type: BridgeErrorType;
  public readonly originalError?: Error;
  public readonly details?: any;

  constructor(
    message: string,
    type: BridgeErrorType = BridgeErrorType.EXECUTION,
    originalError?: Error,
    details?: any
  ) {
    super(message);
    this.name = 'BridgeError';
    this.type = type;
    this.originalError = originalError;
    this.details = details;

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }

    // Include original error stack if available
    if (originalError?.stack) {
      this.stack = `${this.stack}\n\nCaused by:\n${originalError.stack}`;
    }
  }

  /**
   * Get user-friendly error message
   */
  getUserMessage(): string {
    switch (this.type) {
      case BridgeErrorType.CONNECTION:
        return `Bridge connection error: ${this.message}`;
      case BridgeErrorType.IMPORT:
        return `Failed to import package: ${this.message}`;
      case BridgeErrorType.NOT_FOUND:
        return `Package or module not found: ${this.message}`;
      case BridgeErrorType.TYPE_ERROR:
        return `Type conversion error: ${this.message}`;
      case BridgeErrorType.TIMEOUT:
        return `Operation timeout: ${this.message}`;
      case BridgeErrorType.SERIALIZATION:
        return `Serialization error: ${this.message}`;
      case BridgeErrorType.INSTALLATION:
        return `Package installation failed: ${this.message}`;
      default:
        return `Bridge error: ${this.message}`;
    }
  }

  /**
   * Convert to JSON for logging
   */
  toJSON(): object {
    return {
      name: this.name,
      type: this.type,
      message: this.message,
      details: this.details,
      stack: this.stack,
      originalError: this.originalError?.message,
    };
  }
}

/**
 * Python-specific bridge errors
 */
export class PythonBridgeError extends BridgeError {
  constructor(
    message: string,
    type: BridgeErrorType = BridgeErrorType.EXECUTION,
    originalError?: Error,
    details?: any
  ) {
    super(message, type, originalError, details);
    this.name = 'PythonBridgeError';
  }
}

/**
 * JavaScript/npm-specific bridge errors
 */
export class JavaScriptBridgeError extends BridgeError {
  constructor(
    message: string,
    type: BridgeErrorType = BridgeErrorType.EXECUTION,
    originalError?: Error,
    details?: any
  ) {
    super(message, type, originalError, details);
    this.name = 'JavaScriptBridgeError';
  }
}

/**
 * Package not found error
 */
export class PackageNotFoundError extends BridgeError {
  public readonly packageName: string;
  public readonly packageType: 'python' | 'npm';

  constructor(packageName: string, packageType: 'python' | 'npm', details?: any) {
    const suggestion =
      packageType === 'python'
        ? `Install with: pip install ${packageName}`
        : `Install with: npm install ${packageName}`;

    super(
      `Package '${packageName}' not found. ${suggestion}`,
      BridgeErrorType.NOT_FOUND,
      undefined,
      details
    );

    this.name = 'PackageNotFoundError';
    this.packageName = packageName;
    this.packageType = packageType;
  }
}

/**
 * Import error
 */
export class ImportError extends BridgeError {
  public readonly moduleName: string;

  constructor(moduleName: string, message: string, originalError?: Error) {
    super(message, BridgeErrorType.IMPORT, originalError);
    this.name = 'ImportError';
    this.moduleName = moduleName;
  }
}

/**
 * Type conversion error
 */
export class TypeConversionError extends BridgeError {
  public readonly fromType: string;
  public readonly toType: string;
  public readonly value: any;

  constructor(fromType: string, toType: string, value: any, message?: string) {
    const defaultMessage = `Cannot convert ${fromType} to ${toType}`;
    super(message || defaultMessage, BridgeErrorType.TYPE_ERROR);
    this.name = 'TypeConversionError';
    this.fromType = fromType;
    this.toType = toType;
    this.value = value;
  }
}

/**
 * Timeout error
 */
export class TimeoutError extends BridgeError {
  public readonly operation: string;
  public readonly timeoutMs: number;

  constructor(operation: string, timeoutMs: number) {
    super(
      `Operation '${operation}' timed out after ${timeoutMs}ms`,
      BridgeErrorType.TIMEOUT
    );
    this.name = 'TimeoutError';
    this.operation = operation;
    this.timeoutMs = timeoutMs;
  }
}

/**
 * Connection error
 */
export class ConnectionError extends BridgeError {
  public readonly bridgeType: 'python' | 'javascript';

  constructor(bridgeType: 'python' | 'javascript', message: string, originalError?: Error) {
    super(message, BridgeErrorType.CONNECTION, originalError);
    this.name = 'ConnectionError';
    this.bridgeType = bridgeType;
  }
}

/**
 * Installation error
 */
export class InstallationError extends BridgeError {
  public readonly packageName: string;
  public readonly packageType: 'python' | 'npm';

  constructor(packageName: string, packageType: 'python' | 'npm', originalError?: Error) {
    super(
      `Failed to install ${packageType} package '${packageName}'`,
      BridgeErrorType.INSTALLATION,
      originalError
    );
    this.name = 'InstallationError';
    this.packageName = packageName;
    this.packageType = packageType;
  }
}
