/**
 * Discord event system for EzLang
 * Converts Discord.js events to EzLang RuntimeValues
 */

import {
  Client,
  Message,
  User,
  Channel,
  Interaction,
  Guild,
  GuildMember,
  Role,
  VoiceState,
  MessageReaction,
  ThreadChannel,
} from 'discord.js';
import { RuntimeValue, makeString, makeBoolean, makeObject, makeNumber, ObjectValue, makeArray } from '../runtime/values';
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
  convertEventArgs(eventName: string, args: any[]): RuntimeValue[] {
    switch (eventName) {
      // Message Events
      case 'messageCreate':
      case 'messageUpdate':
      case 'messageDelete':
        return [this.messageToRuntimeValue(args[0])];

      // Interaction Events
      case 'interactionCreate':
        return [this.interactionToRuntimeValue(args[0])];

      // Guild Events
      case 'guildCreate':
      case 'guildUpdate':
      case 'guildDelete':
        return [this.guildToRuntimeValue(args[0])];

      // Member Events
      case 'guildMemberAdd':
      case 'guildMemberUpdate':
      case 'guildMemberRemove':
        return [this.memberToRuntimeValue(args[0])];

      // Role Events
      case 'roleCreate':
      case 'roleUpdate':
      case 'roleDelete':
        return [this.roleToRuntimeValue(args[0])];

      // Channel Events
      case 'channelCreate':
      case 'channelUpdate':
      case 'channelDelete':
        return [this.channelToRuntimeValue(args[0])];

      // Voice Events
      case 'voiceStateUpdate':
        return [this.voiceStateToRuntimeValue(args[0]), this.voiceStateToRuntimeValue(args[1])];

      // Reaction Events
      case 'messageReactionAdd':
      case 'messageReactionRemove':
        return [this.reactionToRuntimeValue(args[0]), this.userToRuntimeValue(args[1])];

      // Thread Events
      case 'threadCreate':
      case 'threadUpdate':
      case 'threadDelete':
        return [this.threadToRuntimeValue(args[0])];

      // Ready Event
      case 'ready':
        return [this.clientToRuntimeValue(args[0])];

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

    // Timestamps
    properties.set('created_at', makeString(message.createdAt.toISOString()));
    properties.set('created_timestamp', makeNumber(message.createdTimestamp));

    if (message.editedAt) {
      properties.set('edited_at', makeString(message.editedAt.toISOString()));
      properties.set('edited_timestamp', makeNumber(message.editedTimestamp || 0));
    }

    properties.set('pinned', makeBoolean(message.pinned));
    properties.set('type', makeNumber(message.type));

    // Author information
    if (message.author) {
      properties.set('author', this.userToRuntimeValue(message.author));
    }

    // Channel information
    if (message.channel) {
      properties.set('channel', this.channelToRuntimeValue(message.channel));
    }

    // Member information (if in guild)
    if (message.member) {
      properties.set('member', this.memberToRuntimeValue(message.member));
    }

    // Mentions
    const mentionedUsers = Array.from(message.mentions.users.values()).map(user => this.userToRuntimeValue(user));
    properties.set('mentioned_users', makeArray(mentionedUsers));

    const mentionedRoles = Array.from(message.mentions.roles.values()).map(role => this.roleToRuntimeValue(role));
    properties.set('mentioned_roles', makeArray(mentionedRoles));

    properties.set('mentions_everyone', makeBoolean(message.mentions.everyone));

    // Reference (reply info)
    if (message.reference) {
      const refProps = new Map<string, RuntimeValue>();
      if (message.reference.messageId) refProps.set('message_id', makeString(message.reference.messageId));
      if (message.reference.channelId) refProps.set('channel_id', makeString(message.reference.channelId));
      if (message.reference.guildId) refProps.set('guild_id', makeString(message.reference.guildId));
      properties.set('reference', makeObject(refProps));
    }

    // Embeds
    if (message.embeds.length > 0) {
      const embeds = message.embeds.map(embed => {
        const embedProps = new Map<string, RuntimeValue>();
        if (embed.title) embedProps.set('title', makeString(embed.title));
        if (embed.description) embedProps.set('description', makeString(embed.description));
        if (embed.color) embedProps.set('color', makeNumber(embed.color));
        return makeObject(embedProps);
      });
      properties.set('embeds', makeArray(embeds));
    }

    // Attachments
    if (message.attachments.size > 0) {
      const attachments = Array.from(message.attachments.values()).map(att => {
        const attProps = new Map<string, RuntimeValue>();
        attProps.set('id', makeString(att.id));
        attProps.set('name', makeString(att.name));
        attProps.set('url', makeString(att.url));
        attProps.set('size', makeNumber(att.size));
        return makeObject(attProps);
      });
      properties.set('attachments', makeArray(attachments));
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
      properties.set('avatarURL', makeString(user.displayAvatarURL()));
    }

    // Store raw user
    const rawValue: any = { __rawValue: user };
    properties.set('__raw', rawValue as any);

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
    properties.set('type', makeNumber(channel.type));

    // Add channel name if available
    if ('name' in channel && channel.name) {
      properties.set('name', makeString(channel.name));
    }

    // Add guild ID if available
    if ('guildId' in channel && channel.guildId) {
      properties.set('guildId', makeString(channel.guildId));
    }

    // Add parent ID if available (for threads)
    if ('parentId' in channel && channel.parentId) {
      properties.set('parentId', makeString(channel.parentId));
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
      properties.set('guildCount', makeNumber(client.guilds.cache.size));
    }

    if (client.users) {
      properties.set('userCount', makeNumber(client.users.cache.size));
    }

    // Store raw client
    const rawValue: any = { __rawValue: client };
    properties.set('__raw', rawValue as any);

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
    properties.set('type', makeNumber(interaction.type));

    if (interaction.user) {
      properties.set('user', this.userToRuntimeValue(interaction.user));
    }

    if (interaction.channelId) {
      properties.set('channelId', makeString(interaction.channelId));
    }

    if (interaction.guildId) {
      properties.set('guildId', makeString(interaction.guildId));
    }

    // Add interaction type booleans for convenience
    properties.set('isCommand', makeBoolean(interaction.isChatInputCommand()));
    properties.set('isButton', makeBoolean(interaction.isButton()));
    properties.set('isSelectMenu', makeBoolean(interaction.isAnySelectMenu()));
    properties.set('isModal', makeBoolean(interaction.isModalSubmit()));
    properties.set('isAutocomplete', makeBoolean(interaction.isAutocomplete()));
    properties.set('isContextMenu', makeBoolean(interaction.isContextMenuCommand()));

    // Add command-specific properties
    if (interaction.isChatInputCommand()) {
      properties.set('commandName', makeString(interaction.commandName));

      // Add options as an object
      const optionsMap = new Map<string, RuntimeValue>();
      interaction.options.data.forEach(option => {
        if (option.value !== undefined) {
          if (typeof option.value === 'string') {
            optionsMap.set(option.name, makeString(option.value));
          } else if (typeof option.value === 'number') {
            optionsMap.set(option.name, makeNumber(option.value));
          } else if (typeof option.value === 'boolean') {
            optionsMap.set(option.name, makeBoolean(option.value));
          }
        }
      });
      properties.set('options', makeObject(optionsMap));
    }

    // Add button/select menu customId
    if (interaction.isButton() || interaction.isAnySelectMenu()) {
      properties.set('customId', makeString(interaction.customId));
    }

    // Add select menu values
    if (interaction.isStringSelectMenu()) {
      const values = interaction.values.map(v => makeString(v));
      properties.set('values', makeArray(values));
    }

    // Add modal fields
    if (interaction.isModalSubmit()) {
      properties.set('customId', makeString(interaction.customId));
      const fieldsMap = new Map<string, RuntimeValue>();
      interaction.fields.fields.forEach((field, id) => {
        if ('value' in field) {
          fieldsMap.set(id, makeString(field.value));
        }
      });
      properties.set('fields', makeObject(fieldsMap));
    }

    // Store raw interaction for future slash command support
    const rawValue: any = { __rawValue: interaction };
    properties.set('__raw', rawValue as any);

    return makeObject(properties);
  }

  /**
   * Convert a Discord Guild to RuntimeValue
   */
  private guildToRuntimeValue(guild: Guild): ObjectValue {
    const properties = new Map<string, RuntimeValue>();

    properties.set('id', makeString(guild.id));
    properties.set('name', makeString(guild.name));
    properties.set('memberCount', makeNumber(guild.memberCount));
    properties.set('ownerId', makeString(guild.ownerId));

    if (guild.icon) {
      properties.set('icon', makeString(guild.icon));
      properties.set('iconURL', makeString(guild.iconURL() || ''));
    }

    // Store raw guild
    const rawValue: any = { __rawValue: guild };
    properties.set('__raw', rawValue as any);

    return makeObject(properties);
  }

  /**
   * Convert a Discord GuildMember to RuntimeValue
   */
  private memberToRuntimeValue(member: GuildMember): ObjectValue {
    const properties = new Map<string, RuntimeValue>();

    properties.set('id', makeString(member.id));
    properties.set('user', this.userToRuntimeValue(member.user));
    properties.set('nickname', makeString(member.nickname || ''));
    properties.set('joinedAt', makeString(member.joinedAt?.toISOString() || ''));

    // Roles
    const roles = Array.from(member.roles.cache.values()).map(role => this.roleToRuntimeValue(role));
    properties.set('roles', makeArray(roles));

    // Permissions
    properties.set('permissions', makeString(member.permissions.bitfield.toString()));

    // Store raw member
    const rawValue: any = { __rawValue: member };
    properties.set('__raw', rawValue as any);

    return makeObject(properties);
  }

  /**
   * Convert a Discord Role to RuntimeValue
   */
  private roleToRuntimeValue(role: Role): ObjectValue {
    const properties = new Map<string, RuntimeValue>();

    properties.set('id', makeString(role.id));
    properties.set('name', makeString(role.name));
    properties.set('color', makeNumber(role.color));
    properties.set('position', makeNumber(role.position));
    properties.set('permissions', makeString(role.permissions.bitfield.toString()));
    properties.set('mentionable', makeBoolean(role.mentionable));
    properties.set('hoist', makeBoolean(role.hoist));

    // Store raw role
    const rawValue: any = { __rawValue: role };
    properties.set('__raw', rawValue as any);

    return makeObject(properties);
  }

  /**
   * Convert a Discord VoiceState to RuntimeValue
   */
  private voiceStateToRuntimeValue(voiceState: VoiceState): ObjectValue {
    const properties = new Map<string, RuntimeValue>();

    properties.set('channelId', makeString(voiceState.channelId || ''));
    properties.set('guildId', makeString(voiceState.guild.id));
    properties.set('mute', makeBoolean(voiceState.mute || false));
    properties.set('deaf', makeBoolean(voiceState.deaf || false));
    properties.set('selfMute', makeBoolean(voiceState.selfMute || false));
    properties.set('selfDeaf', makeBoolean(voiceState.selfDeaf || false));

    if (voiceState.member) {
      properties.set('member', this.memberToRuntimeValue(voiceState.member));
    }

    // Store raw voice state
    const rawValue: any = { __rawValue: voiceState };
    properties.set('__raw', rawValue as any);

    return makeObject(properties);
  }

  /**
   * Convert a Discord MessageReaction to RuntimeValue
   */
  private reactionToRuntimeValue(reaction: MessageReaction): ObjectValue {
    const properties = new Map<string, RuntimeValue>();

    properties.set('emoji', makeString(reaction.emoji.name || ''));
    properties.set('count', makeNumber(reaction.count));
    properties.set('me', makeBoolean(reaction.me));

    if (reaction.message) {
      properties.set('message', this.messageToRuntimeValue(reaction.message as Message));
    }

    // Store raw reaction
    const rawValue: any = { __rawValue: reaction };
    properties.set('__raw', rawValue as any);

    return makeObject(properties);
  }

  /**
   * Convert a Discord ThreadChannel to RuntimeValue
   */
  private threadToRuntimeValue(thread: ThreadChannel): ObjectValue {
    const properties = new Map<string, RuntimeValue>();

    properties.set('id', makeString(thread.id));
    properties.set('name', makeString(thread.name));
    properties.set('parentId', makeString(thread.parentId || ''));
    properties.set('ownerId', makeString(thread.ownerId || ''));
    properties.set('archived', makeBoolean(thread.archived || false));
    properties.set('locked', makeBoolean(thread.locked || false));

    // Store raw thread
    const rawValue: any = { __rawValue: thread };
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

    if (typeof value === 'number') {
      return makeNumber(value);
    }

    if (typeof value === 'boolean') {
      return makeBoolean(value);
    }

    // For complex objects, just return empty object
    // Handler can access properties as needed
    return makeObject();
  }
}
