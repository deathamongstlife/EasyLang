/**
 * Discord Error Handling Framework for EzLang
 * Provides comprehensive error classes and handling utilities
 */

import {
  RuntimeValue,
  makeString,
  makeBoolean,
  makeObject,
  makeNativeFunction,
  makeNumber,
  isString,
  isObject,
} from './values';
import { RuntimeError } from '../utils/errors';

/**
 * Custom error class for Discord API errors
 */
export class DiscordAPIErrorWrapper extends Error {
  constructor(
    message: string,
    public code: number,
    public method: string,
    public path: string,
    public status: number
  ) {
    super(message);
    this.name = 'DiscordAPIError';
  }
}

/**
 * Missing permissions error
 */
export class MissingPermissionsError extends Error {
  constructor(
    message: string,
    public required: string[],
    public userId?: string,
    public guildId?: string
  ) {
    super(message);
    this.name = 'MissingPermissionsError';
  }
}

/**
 * Command on cooldown error
 */
export class CommandOnCooldownError extends Error {
  constructor(
    message: string,
    public commandName: string,
    public remaining: number,
    public userId: string
  ) {
    super(message);
    this.name = 'CommandOnCooldownError';
  }
}

/**
 * Missing required argument error
 */
export class MissingRequiredArgumentError extends Error {
  constructor(
    message: string,
    public argumentName: string,
    public commandName: string
  ) {
    super(message);
    this.name = 'MissingRequiredArgumentError';
  }
}

/**
 * Invalid argument error
 */
export class InvalidArgumentError extends Error {
  constructor(
    message: string,
    public argumentName: string,
    public expectedType: string,
    public receivedValue: string
  ) {
    super(message);
    this.name = 'InvalidArgumentError';
  }
}

/**
 * Rate limit error
 */
export class RateLimitError extends Error {
  constructor(
    message: string,
    public timeout: number,
    public limit: number,
    public method: string,
    public path: string
  ) {
    super(message);
    this.name = 'RateLimitError';
  }
}

/**
 * Not found error
 */
export class NotFoundError extends Error {
  constructor(
    message: string,
    public resourceType: string,
    public resourceId: string
  ) {
    super(message);
    this.name = 'NotFoundError';
  }
}

/**
 * Convert error to RuntimeValue object
 */
function errorToRuntimeValue(error: Error): RuntimeValue {
  const properties = new Map<string, RuntimeValue>();
  properties.set('name', makeString(error.name));
  properties.set('message', makeString(error.message));
  properties.set('stack', makeString(error.stack || ''));

  // Add specific error properties
  if (error instanceof DiscordAPIErrorWrapper) {
    properties.set('code', makeNumber(error.code));
    properties.set('method', makeString(error.method));
    properties.set('path', makeString(error.path));
    properties.set('status', makeNumber(error.status));
  } else if (error instanceof MissingPermissionsError) {
    properties.set('required', makeString(error.required.join(', ')));
    if (error.userId) properties.set('user_id', makeString(error.userId));
    if (error.guildId) properties.set('guild_id', makeString(error.guildId));
  } else if (error instanceof CommandOnCooldownError) {
    properties.set('command_name', makeString(error.commandName));
    properties.set('remaining', makeNumber(error.remaining));
    properties.set('user_id', makeString(error.userId));
  } else if (error instanceof MissingRequiredArgumentError) {
    properties.set('argument_name', makeString(error.argumentName));
    properties.set('command_name', makeString(error.commandName));
  } else if (error instanceof InvalidArgumentError) {
    properties.set('argument_name', makeString(error.argumentName));
    properties.set('expected_type', makeString(error.expectedType));
    properties.set('received_value', makeString(error.receivedValue));
  } else if (error instanceof RateLimitError) {
    properties.set('timeout', makeNumber(error.timeout));
    properties.set('limit', makeNumber(error.limit));
    properties.set('method', makeString(error.method));
    properties.set('path', makeString(error.path));
  } else if (error instanceof NotFoundError) {
    properties.set('resource_type', makeString(error.resourceType));
    properties.set('resource_id', makeString(error.resourceId));
  }

  return makeObject(properties);
}

/**
 * handle_discord_error(error, context?)
 * Default error handler for Discord operations
 * Returns an object with error information
 */
export const handleDiscordError = makeNativeFunction('handle_discord_error', async (args: RuntimeValue[]) => {
  if (args.length < 1) {
    throw new RuntimeError(`handle_discord_error() expects at least 1 argument (error), got ${args.length}`);
  }

  const errorArg = args[0];
  let contextMessage = 'Discord operation';

  if (args.length >= 2 && isString(args[1])) {
    contextMessage = args[1].value;
  }

  // If it's already a RuntimeValue error object
  if (isObject(errorArg)) {
    const nameProp = errorArg.properties.get('name');
    const messageProp = errorArg.properties.get('message');

    if (nameProp && isString(nameProp) && messageProp && isString(messageProp)) {
      console.error(`[${contextMessage}] ${nameProp.value}: ${messageProp.value}`);
      return errorArg;
    }
  }

  // If it's a string error message
  if (isString(errorArg)) {
    const error = new Error(errorArg.value);
    const errorObj = errorToRuntimeValue(error);
    console.error(`[${contextMessage}] ${errorArg.value}`);
    return errorObj;
  }

  // Unknown error type
  const properties = new Map<string, RuntimeValue>();
  properties.set('name', makeString('UnknownError'));
  properties.set('message', makeString('An unknown error occurred'));
  properties.set('context', makeString(contextMessage));

  return makeObject(properties);
});

/**
 * format_error_message(error)
 * Format an error into a user-friendly message
 */
export const formatErrorMessage = makeNativeFunction('format_error_message', async (args: RuntimeValue[]) => {
  if (args.length !== 1) {
    throw new RuntimeError(`format_error_message() expects 1 argument (error), got ${args.length}`);
  }

  const errorArg = args[0];

  if (!isObject(errorArg)) {
    return makeString('An error occurred');
  }

  const nameProp = errorArg.properties.get('name');
  const messageProp = errorArg.properties.get('message');

  if (!nameProp || !isString(nameProp) || !messageProp || !isString(messageProp)) {
    return makeString('An error occurred');
  }

  const name = nameProp.value;
  const message = messageProp.value;

  // Format based on error type
  switch (name) {
    case 'MissingPermissionsError': {
      const requiredProp = errorArg.properties.get('required');
      const required = requiredProp && isString(requiredProp) ? requiredProp.value : 'required permissions';
      return makeString(`❌ Missing permissions: ${required}`);
    }

    case 'CommandOnCooldownError': {
      const remainingProp = errorArg.properties.get('remaining');
      const remaining = remainingProp && isString(remainingProp) ? remainingProp.value : '?';
      return makeString(`⏰ This command is on cooldown. Try again in ${remaining} seconds.`);
    }

    case 'MissingRequiredArgumentError': {
      const argProp = errorArg.properties.get('argument_name');
      const argName = argProp && isString(argProp) ? argProp.value : 'argument';
      return makeString(`❌ Missing required argument: ${argName}`);
    }

    case 'InvalidArgumentError': {
      const argProp = errorArg.properties.get('argument_name');
      const typeProp = errorArg.properties.get('expected_type');
      const argName = argProp && isString(argProp) ? argProp.value : 'argument';
      const expectedType = typeProp && isString(typeProp) ? typeProp.value : 'valid value';
      return makeString(`❌ Invalid ${argName}: expected ${expectedType}`);
    }

    case 'RateLimitError': {
      const timeoutProp = errorArg.properties.get('timeout');
      const timeout = timeoutProp && isString(timeoutProp) ? timeoutProp.value : '?';
      return makeString(`⏳ Rate limited. Try again in ${timeout}ms.`);
    }

    case 'NotFoundError': {
      const resourceProp = errorArg.properties.get('resource_type');
      const resource = resourceProp && isString(resourceProp) ? resourceProp.value : 'resource';
      return makeString(`❌ ${resource} not found`);
    }

    case 'DiscordAPIError': {
      const statusProp = errorArg.properties.get('status');
      if (statusProp && isString(statusProp)) {
        const status = statusProp.value;
        if (status === '403') {
          return makeString('❌ Missing permissions to perform this action');
        } else if (status === '404') {
          return makeString('❌ Resource not found');
        } else if (status === '429') {
          return makeString('⏳ Rate limited by Discord. Please try again later.');
        } else if (status === '500' || status === '502' || status === '503') {
          return makeString('❌ Discord is experiencing issues. Please try again later.');
        }
      }
      return makeString(`❌ Discord API error: ${message}`);
    }

    default:
      return makeString(`❌ Error: ${message}`);
  }
});

/**
 * log_error(error, context?)
 * Log an error with optional context
 */
export const logError = makeNativeFunction('log_error', async (args: RuntimeValue[]) => {
  if (args.length < 1) {
    throw new RuntimeError(`log_error() expects at least 1 argument (error), got ${args.length}`);
  }

  const errorArg = args[0];
  let context = 'Unknown';

  if (args.length >= 2 && isString(args[1])) {
    context = args[1].value;
  }

  const timestamp = new Date().toISOString();

  if (isObject(errorArg)) {
    const nameProp = errorArg.properties.get('name');
    const messageProp = errorArg.properties.get('message');
    const stackProp = errorArg.properties.get('stack');

    const name = nameProp && isString(nameProp) ? nameProp.value : 'Error';
    const message = messageProp && isString(messageProp) ? messageProp.value : 'Unknown error';
    const stack = stackProp && isString(stackProp) ? stackProp.value : '';

    console.error(`[${timestamp}] [${context}] ${name}: ${message}`);
    if (stack) {
      console.error(stack);
    }
  } else if (isString(errorArg)) {
    console.error(`[${timestamp}] [${context}] ${errorArg.value}`);
  } else {
    console.error(`[${timestamp}] [${context}] Unknown error`);
  }

  return makeBoolean(true);
});

/**
 * create_error(name, message, properties?)
 * Create a custom error object
 */
export const createError = makeNativeFunction('create_error', async (args: RuntimeValue[]) => {
  if (args.length < 2) {
    throw new RuntimeError(`create_error() expects at least 2 arguments (name, message), got ${args.length}`);
  }

  if (!isString(args[0]) || !isString(args[1])) {
    throw new RuntimeError('Error name and message must be strings');
  }

  const name = args[0].value;
  const message = args[1].value;

  const properties = new Map<string, RuntimeValue>();
  properties.set('name', makeString(name));
  properties.set('message', makeString(message));
  properties.set('stack', makeString(new Error().stack || ''));

  // Add custom properties if provided
  if (args.length >= 3 && isObject(args[2])) {
    const customProps = args[2];
    customProps.properties.forEach((value, key) => {
      if (key !== 'name' && key !== 'message' && key !== 'stack') {
        properties.set(key, value);
      }
    });
  }

  return makeObject(properties);
});

// Export all error handling functions
export const errorBuiltins = {
  handle_discord_error: handleDiscordError,
  format_error_message: formatErrorMessage,
  log_error: logError,
  create_error: createError,
};
