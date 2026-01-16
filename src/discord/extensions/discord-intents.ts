/**
 * Gateway Intents Configuration for EasyLang
 * Provides gateway intents management for Discord bot
 */

import {
  RuntimeValue,
  makeNativeFunction,
  makeObject,
  makeString,
  makeNumber,
  makeBoolean,
  makeArray,
  isString,
  isArray,
} from '../../core/runtime/values';
import { RuntimeError, TypeError } from '../../utils/errors';
import { GatewayIntentBits } from 'discord.js';

/**
 * Intent configuration storage
 */
let configuredIntents: bigint = 0n;
let intentsList: string[] = [];

/**
 * Intent name to bit mapping
 */
const INTENT_BITS: { [key: string]: bigint } = {
  GUILDS: BigInt(GatewayIntentBits.Guilds),
  GUILD_MEMBERS: BigInt(GatewayIntentBits.GuildMembers),
  GUILD_MODERATION: BigInt(GatewayIntentBits.GuildModeration),
  GUILD_EMOJIS_AND_STICKERS: BigInt(GatewayIntentBits.GuildEmojisAndStickers),
  GUILD_INTEGRATIONS: BigInt(GatewayIntentBits.GuildIntegrations),
  GUILD_WEBHOOKS: BigInt(GatewayIntentBits.GuildWebhooks),
  GUILD_INVITES: BigInt(GatewayIntentBits.GuildInvites),
  GUILD_VOICE_STATES: BigInt(GatewayIntentBits.GuildVoiceStates),
  GUILD_PRESENCES: BigInt(GatewayIntentBits.GuildPresences),
  GUILD_MESSAGES: BigInt(GatewayIntentBits.GuildMessages),
  GUILD_MESSAGE_REACTIONS: BigInt(GatewayIntentBits.GuildMessageReactions),
  GUILD_MESSAGE_TYPING: BigInt(GatewayIntentBits.GuildMessageTyping),
  DIRECT_MESSAGES: BigInt(GatewayIntentBits.DirectMessages),
  DIRECT_MESSAGE_REACTIONS: BigInt(GatewayIntentBits.DirectMessageReactions),
  DIRECT_MESSAGE_TYPING: BigInt(GatewayIntentBits.DirectMessageTyping),
  MESSAGE_CONTENT: BigInt(GatewayIntentBits.MessageContent),
  GUILD_SCHEDULED_EVENTS: BigInt(GatewayIntentBits.GuildScheduledEvents),
  AUTO_MODERATION_CONFIGURATION: BigInt(GatewayIntentBits.AutoModerationConfiguration),
  AUTO_MODERATION_EXECUTION: BigInt(GatewayIntentBits.AutoModerationExecution),
};

/**
 * Privileged intents that require approval
 */
const PRIVILEGED_INTENTS = [
  'GUILD_MEMBERS',
  'GUILD_PRESENCES',
  'MESSAGE_CONTENT',
];

/**
 * configure_intents(intents_array)
 * Set gateway intents for the bot
 * intents_array: array of intent names (strings)
 */
export const configureIntents = makeNativeFunction('configure_intents', async (args: RuntimeValue[]) => {
  if (args.length !== 1) {
    throw new RuntimeError(`configure_intents() expects 1 argument (intents_array), got ${args.length}`);
  }

  if (!isArray(args[0])) {
    throw new TypeError('Intents must be an array of strings');
  }

  const intentsArg = args[0];
  const intents: string[] = [];

  // Extract intent names from array
  for (const intent of intentsArg.elements) {
    if (!isString(intent)) {
      throw new TypeError('Intent names must be strings');
    }
    intents.push(intent.value.toUpperCase());
  }

  // Validate and convert to bitfield
  let intentBits = 0n;
  const validIntents: string[] = [];
  const privilegedUsed: string[] = [];

  for (const intentName of intents) {
    const intentBit = INTENT_BITS[intentName];
    if (intentBit === undefined) {
      throw new RuntimeError(`Unknown intent: ${intentName}`);
    }

    intentBits |= intentBit;
    validIntents.push(intentName);

    // Track privileged intents
    if (PRIVILEGED_INTENTS.includes(intentName)) {
      privilegedUsed.push(intentName);
    }
  }

  // Store configuration
  configuredIntents = intentBits;
  intentsList = validIntents;

  // Store in global for bot_start to use
  (global as any).__ezlangIntents = Number(intentBits);

  // Build result
  const result = new Map<string, RuntimeValue>();
  result.set('configured', makeBoolean(true));
  result.set('intent_count', makeNumber(validIntents.length));
  result.set('intents', makeArray(validIntents.map(i => makeString(i))));
  result.set('bitfield', makeString(intentBits.toString()));
  result.set('privileged_intents', makeArray(privilegedUsed.map(i => makeString(i))));
  result.set('has_privileged', makeBoolean(privilegedUsed.length > 0));

  if (privilegedUsed.length > 0) {
    result.set('warning', makeString('Privileged intents require approval in Discord Developer Portal'));
  }

  return makeObject(result);
});

/**
 * add_intent(intent)
 * Add a single intent to current configuration
 */
export const addIntent = makeNativeFunction('add_intent', async (args: RuntimeValue[]) => {
  if (args.length !== 1) {
    throw new RuntimeError(`add_intent() expects 1 argument (intent), got ${args.length}`);
  }

  if (!isString(args[0])) {
    throw new TypeError('Intent must be a string');
  }

  const intentName = args[0].value.toUpperCase();
  const intentBit = INTENT_BITS[intentName];

  if (intentBit === undefined) {
    throw new RuntimeError(`Unknown intent: ${intentName}`);
  }

  // Add to bitfield if not already present
  if ((configuredIntents & intentBit) === 0n) {
    configuredIntents |= intentBit;
    intentsList.push(intentName);
    (global as any).__ezlangIntents = Number(configuredIntents);
  }

  const result = new Map<string, RuntimeValue>();
  result.set('added', makeString(intentName));
  result.set('already_present', makeBoolean((configuredIntents & intentBit) !== 0n));
  result.set('total_intents', makeNumber(intentsList.length));
  result.set('is_privileged', makeBoolean(PRIVILEGED_INTENTS.includes(intentName)));

  return makeObject(result);
});

/**
 * remove_intent(intent)
 * Remove a single intent from current configuration
 */
export const removeIntent = makeNativeFunction('remove_intent', async (args: RuntimeValue[]) => {
  if (args.length !== 1) {
    throw new RuntimeError(`remove_intent() expects 1 argument (intent), got ${args.length}`);
  }

  if (!isString(args[0])) {
    throw new TypeError('Intent must be a string');
  }

  const intentName = args[0].value.toUpperCase();
  const intentBit = INTENT_BITS[intentName];

  if (intentBit === undefined) {
    throw new RuntimeError(`Unknown intent: ${intentName}`);
  }

  // Remove from bitfield
  const wasPresent = (configuredIntents & intentBit) !== 0n;
  if (wasPresent) {
    configuredIntents &= ~intentBit;
    intentsList = intentsList.filter(i => i !== intentName);
    (global as any).__ezlangIntents = Number(configuredIntents);
  }

  const result = new Map<string, RuntimeValue>();
  result.set('removed', makeString(intentName));
  result.set('was_present', makeBoolean(wasPresent));
  result.set('total_intents', makeNumber(intentsList.length));

  return makeObject(result);
});

/**
 * get_intents()
 * Get current intents configuration
 */
export const getIntents = makeNativeFunction('get_intents', async (args: RuntimeValue[]) => {
  if (args.length !== 0) {
    throw new RuntimeError(`get_intents() expects 0 arguments, got ${args.length}`);
  }

  // Count privileged intents in use
  const privilegedUsed = intentsList.filter(i => PRIVILEGED_INTENTS.includes(i));

  const result = new Map<string, RuntimeValue>();
  result.set('intents', makeArray(intentsList.map(i => makeString(i))));
  result.set('count', makeNumber(intentsList.length));
  result.set('bitfield', makeString(configuredIntents.toString()));
  result.set('privileged_intents', makeArray(privilegedUsed.map(i => makeString(i))));
  result.set('has_privileged', makeBoolean(privilegedUsed.length > 0));

  return makeObject(result);
});

/**
 * reset_intents()
 * Reset to default intents (GUILDS, GUILD_MESSAGES, GUILD_MESSAGE_REACTIONS)
 */
export const resetIntents = makeNativeFunction('reset_intents', async (args: RuntimeValue[]) => {
  if (args.length !== 0) {
    throw new RuntimeError(`reset_intents() expects 0 arguments, got ${args.length}`);
  }

  // Default intents for a basic bot
  const defaultIntents = [
    'GUILDS',
    'GUILD_MESSAGES',
    'GUILD_MESSAGE_REACTIONS',
  ];

  configuredIntents = 0n;
  intentsList = [];

  for (const intentName of defaultIntents) {
    const intentBit = INTENT_BITS[intentName];
    configuredIntents |= intentBit;
    intentsList.push(intentName);
  }

  (global as any).__ezlangIntents = Number(configuredIntents);

  const result = new Map<string, RuntimeValue>();
  result.set('reset', makeBoolean(true));
  result.set('intents', makeArray(intentsList.map(i => makeString(i))));
  result.set('count', makeNumber(intentsList.length));

  return makeObject(result);
});

/**
 * list_all_intents()
 * Get a list of all available intents with descriptions
 */
export const listAllIntents = makeNativeFunction('list_all_intents', async (args: RuntimeValue[]) => {
  if (args.length !== 0) {
    throw new RuntimeError(`list_all_intents() expects 0 arguments, got ${args.length}`);
  }

  const intentDescriptions: { [key: string]: string } = {
    GUILDS: 'Guild information (required for most bots)',
    GUILD_MEMBERS: 'Guild member events (privileged)',
    GUILD_MODERATION: 'Moderation events (bans, kicks)',
    GUILD_EMOJIS_AND_STICKERS: 'Emoji and sticker events',
    GUILD_INTEGRATIONS: 'Integration events',
    GUILD_WEBHOOKS: 'Webhook events',
    GUILD_INVITES: 'Invite events',
    GUILD_VOICE_STATES: 'Voice state events',
    GUILD_PRESENCES: 'Presence updates (privileged)',
    GUILD_MESSAGES: 'Guild message events',
    GUILD_MESSAGE_REACTIONS: 'Message reaction events in guilds',
    GUILD_MESSAGE_TYPING: 'Typing indicator events in guilds',
    DIRECT_MESSAGES: 'Direct message events',
    DIRECT_MESSAGE_REACTIONS: 'Reaction events in DMs',
    DIRECT_MESSAGE_TYPING: 'Typing indicator events in DMs',
    MESSAGE_CONTENT: 'Access to message content (privileged)',
    GUILD_SCHEDULED_EVENTS: 'Scheduled event updates',
    AUTO_MODERATION_CONFIGURATION: 'AutoMod configuration changes',
    AUTO_MODERATION_EXECUTION: 'AutoMod action execution',
  };

  const intentsArray: RuntimeValue[] = [];

  for (const [intentName, description] of Object.entries(intentDescriptions)) {
    const intentObj = new Map<string, RuntimeValue>();
    intentObj.set('name', makeString(intentName));
    intentObj.set('description', makeString(description));
    intentObj.set('privileged', makeBoolean(PRIVILEGED_INTENTS.includes(intentName)));
    intentObj.set('enabled', makeBoolean(intentsList.includes(intentName)));

    intentsArray.push(makeObject(intentObj));
  }

  return makeArray(intentsArray);
});

/**
 * has_intent(intent)
 * Check if a specific intent is enabled
 */
export const hasIntent = makeNativeFunction('has_intent', async (args: RuntimeValue[]) => {
  if (args.length !== 1) {
    throw new RuntimeError(`has_intent() expects 1 argument (intent), got ${args.length}`);
  }

  if (!isString(args[0])) {
    throw new TypeError('Intent must be a string');
  }

  const intentName = args[0].value.toUpperCase();
  const intentBit = INTENT_BITS[intentName];

  if (intentBit === undefined) {
    throw new RuntimeError(`Unknown intent: ${intentName}`);
  }

  const enabled = (configuredIntents & intentBit) !== 0n;

  const result = new Map<string, RuntimeValue>();
  result.set('intent', makeString(intentName));
  result.set('enabled', makeBoolean(enabled));
  result.set('privileged', makeBoolean(PRIVILEGED_INTENTS.includes(intentName)));

  return makeObject(result);
});

/**
 * configure_all_intents()
 * Enable all available intents (useful for development)
 * WARNING: Requires all privileged intents to be approved
 */
export const configureAllIntents = makeNativeFunction('configure_all_intents', async (args: RuntimeValue[]) => {
  if (args.length !== 0) {
    throw new RuntimeError(`configure_all_intents() expects 0 arguments, got ${args.length}`);
  }

  configuredIntents = 0n;
  intentsList = [];

  for (const [intentName, intentBit] of Object.entries(INTENT_BITS)) {
    configuredIntents |= intentBit;
    intentsList.push(intentName);
  }

  (global as any).__ezlangIntents = Number(configuredIntents);

  const privilegedUsed = intentsList.filter(i => PRIVILEGED_INTENTS.includes(i));

  const result = new Map<string, RuntimeValue>();
  result.set('configured', makeBoolean(true));
  result.set('intent_count', makeNumber(intentsList.length));
  result.set('privileged_intents', makeArray(privilegedUsed.map(i => makeString(i))));
  result.set('warning', makeString('All privileged intents enabled - requires approval in Developer Portal'));

  return makeObject(result);
});

// Export all intent functions
export const intentBuiltins = {
  configure_intents: configureIntents,
  add_intent: addIntent,
  remove_intent: removeIntent,
  get_intents: getIntents,
  reset_intents: resetIntents,
  list_all_intents: listAllIntents,
  has_intent: hasIntent,
  configure_all_intents: configureAllIntents,
};

// Export for testing and internal use
export { configuredIntents, intentsList, INTENT_BITS, PRIVILEGED_INTENTS };
