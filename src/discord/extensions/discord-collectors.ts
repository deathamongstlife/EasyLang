/**
 * Discord Collectors for EasyLang
 * Provides message, reaction, and interaction collectors
 */

import {
  RuntimeValue,
  makeString,
  makeBoolean,
  makeObject,
  makeNativeFunction,
  makeArray,
  makeNumber,
  isString,
  isNumber,
  isObject,
  isFunction,
  FunctionValue,
} from '../../core/runtime/values';
import { RuntimeError, TypeError } from '../../utils/errors';
import {
  MessageCollector,
  ReactionCollector,
  InteractionCollector,
  Message,
  MessageReaction,
  Interaction,
  User,
  TextChannel,
  ComponentType,
} from 'discord.js';

/**
 * Get the Discord client from global context
 */
function getDiscordClient(): any {
  return (global as any).__discordClient;
}

/**
 * Convert Discord.js User to RuntimeValue
 */
function convertUserToRuntime(user: User): RuntimeValue {
  const properties = new Map<string, RuntimeValue>();
  properties.set('__raw', { __rawValue: user } as any);
  properties.set('id', makeString(user.id));
  properties.set('username', makeString(user.username));
  properties.set('tag', makeString(user.tag));
  properties.set('bot', makeBoolean(user.bot));
  properties.set('discriminator', makeString(user.discriminator));

  if (user.avatar) {
    properties.set('avatar', makeString(user.avatar));
    properties.set('avatarURL', makeString(user.displayAvatarURL()));
  }

  return makeObject(properties);
}

/**
 * Convert Discord.js Message to RuntimeValue
 */
function convertMessageToRuntime(message: Message): RuntimeValue {
  const properties = new Map<string, RuntimeValue>();
  properties.set('__raw', { __rawValue: message } as any);
  properties.set('id', makeString(message.id));
  properties.set('content', makeString(message.content));
  properties.set('channelId', makeString(message.channelId));
  properties.set('guildId', makeString(message.guildId || ''));
  properties.set('created_at', makeString(message.createdAt.toISOString()));
  properties.set('created_timestamp', makeNumber(message.createdTimestamp));
  properties.set('pinned', makeBoolean(message.pinned));
  properties.set('type', makeNumber(message.type));

  if (message.author) {
    properties.set('author', convertUserToRuntime(message.author));
  }

  return makeObject(properties);
}

/**
 * Convert Discord.js MessageReaction to RuntimeValue
 */
function convertReactionToRuntime(reaction: MessageReaction, user: User): RuntimeValue {
  const properties = new Map<string, RuntimeValue>();
  properties.set('__raw', { __rawValue: reaction } as any);
  properties.set('emoji', makeString(reaction.emoji.name || ''));
  properties.set('emoji_id', makeString(reaction.emoji.id || ''));
  properties.set('count', makeNumber(reaction.count || 0));
  properties.set('me', makeBoolean(reaction.me));
  properties.set('message_id', makeString(reaction.message.id));
  properties.set('user', convertUserToRuntime(user));

  return makeObject(properties);
}

/**
 * Convert Discord.js Interaction to RuntimeValue
 */
function convertInteractionToRuntime(interaction: Interaction): RuntimeValue {
  const properties = new Map<string, RuntimeValue>();
  properties.set('__raw', { __rawValue: interaction } as any);
  properties.set('id', makeString(interaction.id));
  properties.set('type', makeNumber(interaction.type));
  properties.set('channelId', makeString(interaction.channelId || ''));
  properties.set('guildId', makeString(interaction.guildId || ''));

  if (interaction.user) {
    properties.set('user', convertUserToRuntime(interaction.user));
  }

  if (interaction.isButton()) {
    properties.set('customId', makeString(interaction.customId));
    properties.set('component_type', makeString('button'));
  } else if (interaction.isStringSelectMenu()) {
    properties.set('customId', makeString(interaction.customId));
    properties.set('values', makeArray(interaction.values.map(v => makeString(v))));
    properties.set('component_type', makeString('select_menu'));
  } else if (interaction.isUserSelectMenu()) {
    properties.set('customId', makeString(interaction.customId));
    properties.set('values', makeArray(interaction.values.map(v => makeString(v))));
    properties.set('component_type', makeString('user_select'));
  } else if (interaction.isRoleSelectMenu()) {
    properties.set('customId', makeString(interaction.customId));
    properties.set('values', makeArray(interaction.values.map(v => makeString(v))));
    properties.set('component_type', makeString('role_select'));
  } else if (interaction.isChannelSelectMenu()) {
    properties.set('customId', makeString(interaction.customId));
    properties.set('values', makeArray(interaction.values.map(v => makeString(v))));
    properties.set('component_type', makeString('channel_select'));
  }

  return makeObject(properties);
}

// Collector storage
interface CollectorData {
  id: string;
  type: 'message' | 'reaction' | 'interaction';
  collector: MessageCollector | ReactionCollector | InteractionCollector<any>;
  collectHandler?: FunctionValue;
  endHandler?: FunctionValue;
}

const collectors = new Map<string, CollectorData>();
let collectorIdCounter = 0;

/**
 * Generate unique collector ID
 */
function generateCollectorId(): string {
  return `collector_${++collectorIdCounter}_${Date.now()}`;
}

/**
 * create_message_collector(channel_id, options)
 * Create a message collector for a channel
 * Options: filter (function), time (ms), max (count), idle (ms)
 */
export const createMessageCollector = makeNativeFunction('create_message_collector', async (args: RuntimeValue[]) => {
  if (args.length < 1) {
    throw new RuntimeError(`create_message_collector() expects at least 1 argument (channel_id), got ${args.length}`);
  }

  if (!isString(args[0])) {
    throw new TypeError('Channel ID must be a string');
  }

  const channelId = args[0].value;
  const client = getDiscordClient();
  if (!client) {
    throw new RuntimeError('Discord client not initialized');
  }

  const channel = await client.channels.fetch(channelId);
  if (!channel || !(channel instanceof TextChannel)) {
    throw new RuntimeError('Invalid or non-text channel');
  }

  // Parse options
  let filterFunc: FunctionValue | null = null;
  let time: number | undefined;
  let max: number | undefined;
  let idle: number | undefined;

  if (args.length >= 2 && isObject(args[1])) {
    const options = args[1];

    const filterProp = options.properties.get('filter');
    if (filterProp && isFunction(filterProp)) {
      filterFunc = filterProp as FunctionValue;
    }

    const timeProp = options.properties.get('time');
    if (timeProp && isNumber(timeProp)) {
      time = timeProp.value;
    }

    const maxProp = options.properties.get('max');
    if (maxProp && isNumber(maxProp)) {
      max = maxProp.value;
    }

    const idleProp = options.properties.get('idle');
    if (idleProp && isNumber(idleProp)) {
      idle = idleProp.value;
    }
  }

  // Create collector
  const collectorOptions: any = {};
  if (time !== undefined) collectorOptions.time = time;
  if (max !== undefined) collectorOptions.max = max;
  if (idle !== undefined) collectorOptions.idle = idle;

  // If filter function provided, we'll apply it in the collect event
  // For now, create a collector that accepts all messages
  const collector = channel.createMessageCollector(collectorOptions);

  const collectorId = generateCollectorId();
  const collectorData: CollectorData = {
    id: collectorId,
    type: 'message',
    collector,
  };

  // Store filter function to apply later
  if (filterFunc) {
    (collector as any).__ezlangFilter = filterFunc;
  }

  collectors.set(collectorId, collectorData);

  // Return collector object
  const properties = new Map<string, RuntimeValue>();
  properties.set('id', makeString(collectorId));
  properties.set('type', makeString('message'));
  properties.set('channel_id', makeString(channelId));

  return makeObject(properties);
});

/**
 * create_reaction_collector(message_id, options)
 * Create a reaction collector for a message
 * Options: filter (function), time (ms), max (count)
 */
export const createReactionCollector = makeNativeFunction('create_reaction_collector', async (args: RuntimeValue[]) => {
  if (args.length < 1) {
    throw new RuntimeError(`create_reaction_collector() expects at least 1 argument (message_id), got ${args.length}`);
  }

  if (!isString(args[0])) {
    throw new TypeError('Message ID must be a string');
  }

  const messageId = args[0].value;
  const client = getDiscordClient();
  if (!client) {
    throw new RuntimeError('Discord client not initialized');
  }

  // Parse options to get channel_id
  let channelId: string | undefined;
  let filterFunc: FunctionValue | null = null;
  let time: number | undefined;
  let max: number | undefined;

  if (args.length >= 2 && isObject(args[1])) {
    const options = args[1];

    const channelIdProp = options.properties.get('channel_id');
    if (channelIdProp && isString(channelIdProp)) {
      channelId = channelIdProp.value;
    }

    const filterProp = options.properties.get('filter');
    if (filterProp && isFunction(filterProp)) {
      filterFunc = filterProp as FunctionValue;
    }

    const timeProp = options.properties.get('time');
    if (timeProp && isNumber(timeProp)) {
      time = timeProp.value;
    }

    const maxProp = options.properties.get('max');
    if (maxProp && isNumber(maxProp)) {
      max = maxProp.value;
    }
  }

  if (!channelId) {
    throw new RuntimeError('channel_id is required in options for reaction collector');
  }

  // Fetch the message
  const channel = await client.channels.fetch(channelId);
  if (!channel || !(channel instanceof TextChannel)) {
    throw new RuntimeError('Invalid or non-text channel');
  }

  const message = await channel.messages.fetch(messageId);
  if (!message) {
    throw new RuntimeError('Message not found');
  }

  // Create collector
  const collectorOptions: any = {};
  if (time !== undefined) collectorOptions.time = time;
  if (max !== undefined) collectorOptions.max = max;

  const collector = message.createReactionCollector(collectorOptions);

  const collectorId = generateCollectorId();
  const collectorData: CollectorData = {
    id: collectorId,
    type: 'reaction',
    collector,
  };

  // Store filter function to apply later
  if (filterFunc) {
    (collector as any).__ezlangFilter = filterFunc;
  }

  collectors.set(collectorId, collectorData);

  // Return collector object
  const properties = new Map<string, RuntimeValue>();
  properties.set('id', makeString(collectorId));
  properties.set('type', makeString('reaction'));
  properties.set('message_id', makeString(messageId));

  return makeObject(properties);
});

/**
 * create_interaction_collector(message_id, options)
 * Create an interaction collector for a message
 * Options: filter (function), time (ms), max (count), componentType
 */
export const createInteractionCollector = makeNativeFunction('create_interaction_collector', async (args: RuntimeValue[]) => {
  if (args.length < 1) {
    throw new RuntimeError(`create_interaction_collector() expects at least 1 argument (message_id), got ${args.length}`);
  }

  if (!isString(args[0])) {
    throw new TypeError('Message ID must be a string');
  }

  const messageId = args[0].value;
  const client = getDiscordClient();
  if (!client) {
    throw new RuntimeError('Discord client not initialized');
  }

  // Parse options
  let channelId: string | undefined;
  let filterFunc: FunctionValue | null = null;
  let time: number | undefined;
  let max: number | undefined;
  let componentType: ComponentType | undefined;

  if (args.length >= 2 && isObject(args[1])) {
    const options = args[1];

    const channelIdProp = options.properties.get('channel_id');
    if (channelIdProp && isString(channelIdProp)) {
      channelId = channelIdProp.value;
    }

    const filterProp = options.properties.get('filter');
    if (filterProp && isFunction(filterProp)) {
      filterFunc = filterProp as FunctionValue;
    }

    const timeProp = options.properties.get('time');
    if (timeProp && isNumber(timeProp)) {
      time = timeProp.value;
    }

    const maxProp = options.properties.get('max');
    if (maxProp && isNumber(maxProp)) {
      max = maxProp.value;
    }

    const componentTypeProp = options.properties.get('componentType');
    if (componentTypeProp && isNumber(componentTypeProp)) {
      componentType = componentTypeProp.value as ComponentType;
    }
  }

  if (!channelId) {
    throw new RuntimeError('channel_id is required in options for interaction collector');
  }

  // Fetch the message
  const channel = await client.channels.fetch(channelId);
  if (!channel || !(channel instanceof TextChannel)) {
    throw new RuntimeError('Invalid or non-text channel');
  }

  const message = await channel.messages.fetch(messageId);
  if (!message) {
    throw new RuntimeError('Message not found');
  }

  // Create collector
  const collectorOptions: any = {};
  if (time !== undefined) collectorOptions.time = time;
  if (max !== undefined) collectorOptions.max = max;
  if (componentType !== undefined) collectorOptions.componentType = componentType;

  const collector = message.createMessageComponentCollector(collectorOptions);

  const collectorId = generateCollectorId();
  const collectorData: CollectorData = {
    id: collectorId,
    type: 'interaction',
    collector,
  };

  // Store filter function to apply later
  if (filterFunc) {
    (collector as any).__ezlangFilter = filterFunc;
  }

  collectors.set(collectorId, collectorData);

  // Return collector object
  const properties = new Map<string, RuntimeValue>();
  properties.set('id', makeString(collectorId));
  properties.set('type', makeString('interaction'));
  properties.set('message_id', makeString(messageId));

  return makeObject(properties);
});

/**
 * on_collect(collector_id, handler)
 * Register a collect event handler
 */
export const onCollect = makeNativeFunction('on_collect', async (args: RuntimeValue[]) => {
  if (args.length !== 2) {
    throw new RuntimeError(`on_collect() expects 2 arguments (collector_id, handler), got ${args.length}`);
  }

  let collectorId: string;
  if (isString(args[0])) {
    collectorId = args[0].value;
  } else if (isObject(args[0])) {
    const idProp = args[0].properties.get('id');
    if (!idProp || !isString(idProp)) {
      throw new RuntimeError('Invalid collector object: missing or invalid id property');
    }
    collectorId = idProp.value;
  } else {
    throw new TypeError('Collector ID must be a string or collector object');
  }

  if (!isFunction(args[1])) {
    throw new TypeError('Handler must be a function');
  }

  const handler = args[1] as FunctionValue;
  const collectorData = collectors.get(collectorId);

  if (!collectorData) {
    throw new RuntimeError(`Collector not found: ${collectorId}`);
  }

  collectorData.collectHandler = handler;

  // Set up the collect event listener
  const collector = collectorData.collector;

  if (collectorData.type === 'message') {
    (collector as MessageCollector).on('collect', async (message: Message) => {
      // Apply filter if present
      const filterFunc = (collector as any).__ezlangFilter;
      if (filterFunc) {
        // Note: In a real implementation, we would need to call the EasyLang function
        // For now, we'll just proceed without filtering
        // This would require access to the interpreter/evaluator
      }

      // Convert message to RuntimeValue
      // Note: This would be passed to the handler function in a complete implementation
      convertMessageToRuntime(message);

      // Call the handler
      // Note: This would need to be executed by the interpreter
      // Store it for now - the runtime would need to execute it
      console.log(`[Collector ${collectorId}] Collected message: ${message.id}`);
    });
  } else if (collectorData.type === 'reaction') {
    (collector as ReactionCollector).on('collect', async (reaction: MessageReaction, user: User) => {
      // Convert reaction to RuntimeValue
      // Note: This would be passed to the handler function in a complete implementation
      convertReactionToRuntime(reaction, user);
      console.log(`[Collector ${collectorId}] Collected reaction: ${reaction.emoji.name}`);
    });
  } else if (collectorData.type === 'interaction') {
    (collector as InteractionCollector<any>).on('collect', async (interaction: Interaction) => {
      // Convert interaction to RuntimeValue
      // Note: This would be passed to the handler function in a complete implementation
      convertInteractionToRuntime(interaction);
      console.log(`[Collector ${collectorId}] Collected interaction: ${interaction.id}`);
    });
  }

  return makeBoolean(true);
});

/**
 * on_collector_end(collector_id, handler)
 * Register an end event handler
 */
export const onCollectorEnd = makeNativeFunction('on_collector_end', async (args: RuntimeValue[]) => {
  if (args.length !== 2) {
    throw new RuntimeError(`on_collector_end() expects 2 arguments (collector_id, handler), got ${args.length}`);
  }

  let collectorId: string;
  if (isString(args[0])) {
    collectorId = args[0].value;
  } else if (isObject(args[0])) {
    const idProp = args[0].properties.get('id');
    if (!idProp || !isString(idProp)) {
      throw new RuntimeError('Invalid collector object: missing or invalid id property');
    }
    collectorId = idProp.value;
  } else {
    throw new TypeError('Collector ID must be a string or collector object');
  }

  if (!isFunction(args[1])) {
    throw new TypeError('Handler must be a function');
  }

  const handler = args[1] as FunctionValue;
  const collectorData = collectors.get(collectorId);

  if (!collectorData) {
    throw new RuntimeError(`Collector not found: ${collectorId}`);
  }

  collectorData.endHandler = handler;

  // Set up the end event listener based on collector type
  if (collectorData.type === 'message') {
    (collectorData.collector as MessageCollector).on('end', async (collected: any, reason: string) => {
      const collectedArray: RuntimeValue[] = [];
      collected.forEach((message: Message) => {
        collectedArray.push(convertMessageToRuntime(message));
      });
      console.log(`[Collector ${collectorId}] Ended with reason: ${reason}, collected ${collectedArray.length} items`);
      collectors.delete(collectorId);
    });
  } else if (collectorData.type === 'reaction') {
    (collectorData.collector as ReactionCollector).on('end', async (collected: any, reason: string) => {
      const collectedArray: RuntimeValue[] = [];
      collected.forEach((reaction: MessageReaction) => {
        const props = new Map<string, RuntimeValue>();
        props.set('emoji', makeString(reaction.emoji.name || ''));
        props.set('count', makeNumber(reaction.count || 0));
        collectedArray.push(makeObject(props));
      });
      console.log(`[Collector ${collectorId}] Ended with reason: ${reason}, collected ${collectedArray.length} items`);
      collectors.delete(collectorId);
    });
  } else if (collectorData.type === 'interaction') {
    (collectorData.collector as InteractionCollector<any>).on('end', async (collected: any, reason: string) => {
      const collectedArray: RuntimeValue[] = [];
      collected.forEach((interaction: Interaction) => {
        collectedArray.push(convertInteractionToRuntime(interaction));
      });
      console.log(`[Collector ${collectorId}] Ended with reason: ${reason}, collected ${collectedArray.length} items`);
      collectors.delete(collectorId);
    });
  }

  return makeBoolean(true);
});

/**
 * stop_collector(collector_id)
 * Manually stop a collector
 */
export const stopCollector = makeNativeFunction('stop_collector', async (args: RuntimeValue[]) => {
  if (args.length !== 1) {
    throw new RuntimeError(`stop_collector() expects 1 argument (collector_id), got ${args.length}`);
  }

  let collectorId: string;
  if (isString(args[0])) {
    collectorId = args[0].value;
  } else if (isObject(args[0])) {
    const idProp = args[0].properties.get('id');
    if (!idProp || !isString(idProp)) {
      throw new RuntimeError('Invalid collector object: missing or invalid id property');
    }
    collectorId = idProp.value;
  } else {
    throw new TypeError('Collector ID must be a string or collector object');
  }

  const collectorData = collectors.get(collectorId);
  if (!collectorData) {
    throw new RuntimeError(`Collector not found: ${collectorId}`);
  }

  collectorData.collector.stop('manual');
  return makeBoolean(true);
});

// Export all collector functions
export const collectorBuiltins = {
  create_message_collector: createMessageCollector,
  create_reaction_collector: createReactionCollector,
  create_interaction_collector: createInteractionCollector,
  on_collect: onCollect,
  on_collector_end: onCollectorEnd,
  stop_collector: stopCollector,
};

// Export for testing and internal use
export { collectors };
