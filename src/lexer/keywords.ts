/**
 * Reserved keywords in EzLang
 */
export const KEYWORDS = new Set([
  // Variable and function declarations
  'var',
  'function',
  'return',

  // Control flow
  'if',
  'else',
  'for',
  'while',
  'in',

  // Discord-specific
  'listen',
  'send',
  'reply',
  'react',

  // Python integration
  'use',
  'as',

  // Module system
  'import',

  // Boolean literals
  'true',
  'false',
  'null',
]);

/**
 * Built-in functions in EzLang
 */
export const BUILT_IN_FUNCTIONS = new Set([
  'print',
  'length',
  'random',
  'wait',
  'range',
  'get_argument',
]);

/**
 * Discord-specific commands
 */
export const DISCORD_COMMANDS = new Set([
  'send',
  'reply',
  'react',
  'listen',
]);

/**
 * Control flow keywords
 */
export const CONTROL_FLOW_KEYWORDS = new Set([
  'if',
  'else',
  'for',
  'while',
  'return',
]);

/**
 * Check if a string is a keyword
 */
export function isKeyword(word: string): boolean {
  return KEYWORDS.has(word);
}

/**
 * Check if a string is a built-in function
 */
export function isBuiltInFunction(word: string): boolean {
  return BUILT_IN_FUNCTIONS.has(word);
}

/**
 * Check if a string is a Discord command
 */
export function isDiscordCommand(word: string): boolean {
  return DISCORD_COMMANDS.has(word);
}

/**
 * Check if a string is a control flow keyword
 */
export function isControlFlowKeyword(word: string): boolean {
  return CONTROL_FLOW_KEYWORDS.has(word);
}
