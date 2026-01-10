/**
 * Discord event system for EzLang
 * Converts Discord.js events to EzLang RuntimeValues
 */

import { Client, Message, User, Channel, Interaction } from 'discord.js';
import { RuntimeValue, makeString, makeBoolean, makeObject, ObjectValue } from '../runtime/values';
import { logger } from '../utils/logger';

/**
 * EventManager - Handles Discord event conversion and dispatching
 */
export class EventManager {
  /**
   * Setup all event listeners on the Discord client
   * @param client - Discord.js client
   * @param handlers - Map of event names to handler functions
   */
  setupEventListeners(client: Client, handlers: Map<string, Function[]>): void {
    // Setup each registered event
    for (const [eventName, eventHandlers] of handlers) {
      if (eventName === 'ready') {
        // Ready event is handled specially in DiscordManager
        continue;
      }

      // Setup the event listener
      client.on(eventName, (...args: any[]) => {
        this.dispatchEvent(eventName, eventHandlers, ...args);
      });

      logger.debug(`Setup event listener for '${eventName}'`);
    }
  }

  /**
   * Create a callback function for an event that executes all handlers
   * @param event - Event name
   * @param handlers - Array of handler functions
   * @returns Callback function
   */
  createEventCallback(event: string, handlers: Function[]): Function {
    return async (...args: any[]) => {
      await this.dispatchEvent(event, handlers, ...args);
    };
  }

  /**
   * Dispatch an event to all registered handlers
   * @param eventName - Event name
   * @param handlers - Array of handler functions
   * @param args - Event arguments from Discord.js
   */
  private async dispatchEvent(
    eventName: string,
    handlers: Function[],
    ...args: any[]
  ): Promise<void> {
    try {
      // Convert Discord.js event arguments to RuntimeValues
      const runtimeArgs = this.convertEventArgs(eventName, args);

      // Execute each handler
      for (const handler of handlers) {
        try {
          await handler(...runtimeArgs);
        } catch (error: any) {
          logger.error(`Error in ${eventName} handler: ${error.message}`);
        }
      }
    } catch (error: any) {
      logger.error(`Error dispatching ${eventName} event: ${error.message}`);
    }
  }

  /**
   * Convert Discord.js event arguments to RuntimeValues
   * @param eventName - Event name
   * @param args - Raw Discord.js event arguments
   * @returns Array of RuntimeValues
   */
  private convertEventArgs(eventName: string, args: any[]): RuntimeValue[] {
    switch (eventName) {
      case 'messageCreate':
        return [this.messageToRuntimeValue(args[0])];
      case 'ready':
        return [this.clientToRuntimeValue(args[0])];
      case 'interactionCreate':
        return [this.interactionToRuntimeValue(args[0])];
      default:
        // For unknown events, try to convert each argument
        return args.map((arg) => this.convertToRuntimeValue(arg));
    }
  }

  /**
   * Convert a Discord Message to RuntimeValue
   * @param message - Discord.js Message object
   * @returns ObjectValue with message properties
   */
  private messageToRuntimeValue(message: Message): ObjectValue {
    const properties = new Map<string, RuntimeValue>();

    // Basic message properties
    properties.set('content', makeString(message.content));
    properties.set('id', makeString(message.id));
    properties.set('channelId', makeString(message.channelId));
    properties.set('guildId', makeString(message.guildId || ''));

    // Author information
    if (message.author) {
      properties.set('author', this.userToRuntimeValue(message.author));
    }

    // Channel information
    if (message.channel) {
      properties.set('channel', this.channelToRuntimeValue(message.channel));
    }

    // Store the raw message for commands (reply, react)
    // We need to preserve the actual Discord.js object
    const rawValue: any = { __rawValue: message };
    properties.set('__raw', rawValue as any);

    return makeObject(properties);
  }

  /**
   * Convert a Discord User to RuntimeValue
   * @param user - Discord.js User object
   * @returns ObjectValue with user properties
   */
  private userToRuntimeValue(user: User): ObjectValue {
    const properties = new Map<string, RuntimeValue>();

    properties.set('id', makeString(user.id));
    properties.set('username', makeString(user.username));
    properties.set('tag', makeString(user.tag));
    properties.set('bot', makeBoolean(user.bot));
    properties.set('discriminator', makeString(user.discriminator));

    if (user.avatar) {
      properties.set('avatar', makeString(user.avatar));
    }

    return makeObject(properties);
  }

  /**
   * Convert a Discord Channel to RuntimeValue
   * @param channel - Discord.js Channel object
   * @returns ObjectValue with channel properties
   */
  private channelToRuntimeValue(channel: Channel): ObjectValue {
    const properties = new Map<string, RuntimeValue>();

    properties.set('id', makeString(channel.id));
    properties.set('type', makeString(String(channel.type)));

    // Add channel name if available
    if ('name' in channel && channel.name) {
      properties.set('name', makeString(channel.name));
    }

    // Store raw channel for send command
    const rawValue: any = { __rawValue: channel };
    properties.set('__raw', rawValue as any);

    return makeObject(properties);
  }

  /**
   * Convert a Discord Client to RuntimeValue
   * @param client - Discord.js Client object
   * @returns ObjectValue with client properties
   */
  private clientToRuntimeValue(client: Client): ObjectValue {
    const properties = new Map<string, RuntimeValue>();

    if (client.user) {
      properties.set('user', this.userToRuntimeValue(client.user));
    }

    // Add useful client info
    properties.set('ready', makeBoolean(client.isReady()));

    if (client.guilds) {
      properties.set('guildCount', makeString(String(client.guilds.cache.size)));
    }

    return makeObject(properties);
  }

  /**
   * Convert a Discord Interaction to RuntimeValue
   * @param interaction - Discord.js Interaction object
   * @returns ObjectValue with interaction properties
   */
  private interactionToRuntimeValue(interaction: Interaction): ObjectValue {
    const properties = new Map<string, RuntimeValue>();

    properties.set('id', makeString(interaction.id));
    properties.set('type', makeString(String(interaction.type)));

    if (interaction.user) {
      properties.set('user', this.userToRuntimeValue(interaction.user));
    }

    if (interaction.channelId) {
      properties.set('channelId', makeString(interaction.channelId));
    }

    if (interaction.guildId) {
      properties.set('guildId', makeString(interaction.guildId));
    }

    // Store raw interaction for future slash command support
    const rawValue: any = { __rawValue: interaction };
    properties.set('__raw', rawValue as any);

    return makeObject(properties);
  }

  /**
   * Generic conversion for unknown types
   * @param value - Any value to convert
   * @returns RuntimeValue
   */
  private convertToRuntimeValue(value: any): RuntimeValue {
    if (value === null || value === undefined) {
      return makeObject();
    }

    if (typeof value === 'string') {
      return makeString(value);
    }

    if (typeof value === 'boolean') {
      return makeBoolean(value);
    }

    // For complex objects, just return empty object
    // Handler can access properties as needed
    return makeObject();
  }
}
