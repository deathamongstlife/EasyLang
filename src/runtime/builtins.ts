/**
 * Built-in functions for EzLang
 */

import { Environment } from './environment';
import {
  RuntimeValue,
  makeNumber,
  makeString,
  makeNull,
  makeArray,
  makeBoolean,
  makeNativeFunction,
  isString,
  isArray,
  isNumber,
  valueToString,
} from './values';
import { RuntimeError, TypeError } from '../utils/errors';
import { DiscordManager } from '../discord';

/**
 * print(...args) - Print values to console
 */
const printFunction = makeNativeFunction('print', async (args: RuntimeValue[]) => {
  const output = args.map(valueToString).join(' ');
  console.log(output);
  return makeNull();
});

/**
 * length(collection) - Get length of string or array
 */
const lengthFunction = makeNativeFunction('length', async (args: RuntimeValue[]) => {
  if (args.length !== 1) {
    throw new RuntimeError(`length() expects 1 argument, got ${args.length}`);
  }

  const arg = args[0];
  if (isString(arg)) {
    return makeNumber(arg.value.length);
  }
  if (isArray(arg)) {
    return makeNumber(arg.elements.length);
  }

  throw new TypeError(`length() expects a string or array, got ${arg.type}`);
});

/**
 * random(min, max) - Generate random number between min and max (inclusive)
 * random() - Generate random number between 0 and 1
 */
const randomFunction = makeNativeFunction('random', async (args: RuntimeValue[]) => {
  if (args.length === 0) {
    // random() - return 0 to 1
    return makeNumber(Math.random());
  }

  if (args.length === 2) {
    // random(min, max)
    const minArg = args[0];
    const maxArg = args[1];

    if (!isNumber(minArg) || !isNumber(maxArg)) {
      throw new TypeError('random(min, max) expects two numbers');
    }

    const min = minArg.value;
    const max = maxArg.value;
    const randomValue = Math.floor(Math.random() * (max - min + 1)) + min;
    return makeNumber(randomValue);
  }

  throw new RuntimeError(`random() expects 0 or 2 arguments, got ${args.length}`);
});

/**
 * wait(seconds) - Async delay
 */
const waitFunction = makeNativeFunction('wait', async (args: RuntimeValue[]) => {
  if (args.length !== 1) {
    throw new RuntimeError(`wait() expects 1 argument, got ${args.length}`);
  }

  const arg = args[0];
  if (!isNumber(arg)) {
    throw new TypeError(`wait() expects a number, got ${arg.type}`);
  }

  const milliseconds = arg.value * 1000;
  await new Promise((resolve) => setTimeout(resolve, milliseconds));
  return makeNull();
});

/**
 * range(start, end) - Generate array of numbers from start to end (exclusive)
 * range(end) - Generate array of numbers from 0 to end (exclusive)
 */
const rangeFunction = makeNativeFunction('range', async (args: RuntimeValue[]) => {
  let start = 0;
  let end = 0;

  if (args.length === 1) {
    // range(end)
    const endArg = args[0];
    if (!isNumber(endArg)) {
      throw new TypeError(`range() expects a number, got ${endArg.type}`);
    }
    end = endArg.value;
  } else if (args.length === 2) {
    // range(start, end)
    const startArg = args[0];
    const endArg = args[1];

    if (!isNumber(startArg) || !isNumber(endArg)) {
      throw new TypeError('range(start, end) expects two numbers');
    }

    start = startArg.value;
    end = endArg.value;
  } else {
    throw new RuntimeError(`range() expects 1 or 2 arguments, got ${args.length}`);
  }

  // Generate array
  const elements: RuntimeValue[] = [];
  for (let i = start; i < end; i++) {
    elements.push(makeNumber(i));
  }

  return makeArray(elements);
});

/**
 * get_argument(name, default) - Get command-line argument
 * Parses command-line arguments in KEY=VALUE format from process.argv
 */
const getArgumentFunction = makeNativeFunction('get_argument', async (args: RuntimeValue[]) => {
  if (args.length < 1 || args.length > 2) {
    throw new RuntimeError(`get_argument() expects 1 or 2 arguments, got ${args.length}`);
  }

  const nameArg = args[0];
  if (!isString(nameArg)) {
    throw new TypeError(`get_argument() expects a string as first argument, got ${nameArg.type}`);
  }

  const key = nameArg.value;
  const defaultValue = args.length === 2 ? args[1] : makeNull();

  // Search through process.argv for KEY=VALUE arguments
  // Skip the first two args (node executable and script path)
  for (let i = 2; i < process.argv.length; i++) {
    const arg = process.argv[i];

    // Check if argument contains '='
    const equalIndex = arg.indexOf('=');
    if (equalIndex === -1) {
      continue; // Skip arguments without '='
    }

    // Split into key and value
    const argKey = arg.substring(0, equalIndex);
    const argValue = arg.substring(equalIndex + 1);

    // Match the key (case-sensitive)
    if (argKey === key) {
      // Return the value, even if it's empty
      return makeString(argValue);
    }
  }

  // Key not found, return default value
  return defaultValue;
});

/**
 * type(value) - Get the type of a value as a string
 */
const typeFunction = makeNativeFunction('type', async (args: RuntimeValue[]) => {
  if (args.length !== 1) {
    throw new RuntimeError(`type() expects 1 argument, got ${args.length}`);
  }

  return makeString(args[0].type);
});

/**
 * str(value) - Convert value to string
 */
const strFunction = makeNativeFunction('str', async (args: RuntimeValue[]) => {
  if (args.length !== 1) {
    throw new RuntimeError(`str() expects 1 argument, got ${args.length}`);
  }

  return makeString(valueToString(args[0]));
});

/**
 * num(value) - Convert value to number
 */
const numFunction = makeNativeFunction('num', async (args: RuntimeValue[]) => {
  if (args.length !== 1) {
    throw new RuntimeError(`num() expects 1 argument, got ${args.length}`);
  }

  const arg = args[0];
  if (isNumber(arg)) {
    return arg;
  }
  if (isString(arg)) {
    const num = parseFloat(arg.value);
    if (isNaN(num)) {
      throw new TypeError(`Cannot convert '${arg.value}' to number`);
    }
    return makeNumber(num);
  }

  throw new TypeError(`Cannot convert ${arg.type} to number`);
});

/**
 * push(array, value) - Add value to end of array (mutates array)
 */
const pushFunction = makeNativeFunction('push', async (args: RuntimeValue[]) => {
  if (args.length !== 2) {
    throw new RuntimeError(`push() expects 2 arguments, got ${args.length}`);
  }

  const arrayArg = args[0];
  const value = args[1];

  if (!isArray(arrayArg)) {
    throw new TypeError(`push() expects an array as first argument, got ${arrayArg.type}`);
  }

  arrayArg.elements.push(value);
  return makeNull();
});

/**
 * pop(array) - Remove and return last element from array (mutates array)
 */
const popFunction = makeNativeFunction('pop', async (args: RuntimeValue[]) => {
  if (args.length !== 1) {
    throw new RuntimeError(`pop() expects 1 argument, got ${args.length}`);
  }

  const arrayArg = args[0];
  if (!isArray(arrayArg)) {
    throw new TypeError(`pop() expects an array, got ${arrayArg.type}`);
  }

  if (arrayArg.elements.length === 0) {
    throw new RuntimeError('Cannot pop from empty array');
  }

  return arrayArg.elements.pop()!;
});

/**
 * Create bot_start function with access to Discord manager
 */
function createBotStartFunction(discordManager: DiscordManager) {
  return makeNativeFunction('bot_start', async (args: RuntimeValue[]) => {
    if (args.length !== 1) {
      throw new RuntimeError(`bot_start() expects 1 argument (token), got ${args.length}`);
    }

    const tokenArg = args[0];
    if (!isString(tokenArg)) {
      throw new TypeError(`bot_start() expects a string token, got ${tokenArg.type}`);
    }

    try {
      // Initialize and start the Discord bot
      discordManager.initialize(tokenArg.value);
      await discordManager.start();

      // Keep the process running
      // The bot will run until the process is terminated
      return makeBoolean(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new RuntimeError(`Failed to start bot: ${errorMessage}`);
    }
  });
}

/**
 * Create and populate the global environment with built-in functions
 */
export function createGlobalEnvironment(discordManager: DiscordManager): Environment {
  const env = new Environment();

  // Register all built-in functions
  env.define('print', printFunction);
  env.define('length', lengthFunction);
  env.define('random', randomFunction);
  env.define('wait', waitFunction);
  env.define('range', rangeFunction);
  env.define('get_argument', getArgumentFunction);
  env.define('type', typeFunction);
  env.define('str', strFunction);
  env.define('num', numFunction);
  env.define('push', pushFunction);
  env.define('pop', popFunction);

  // Discord bot functions
  env.define('bot_start', createBotStartFunction(discordManager));

  return env;
}
