/**
 * Complete Discord Event System - All 79 Discord.js Events
 * This file adds support for all missing Discord events
 */

import {
  Client,
  AutoModerationRule,
  AutoModerationActionExecution,
  GuildBan,
  GuildEmoji,
  GuildScheduledEvent,
  Invite,
  Message,
  PartialMessage,
  MessageReaction,
  PartialMessageReaction,
  User,
  PartialUser,
  Presence,
  StageInstance,
  Sticker,
  ThreadChannel,
  ThreadMember,
  Typing,
  GuildMember,
  PartialGuildMember,
} from 'discord.js';

import { RuntimeValue, makeString, makeBoolean, makeObject, makeNumber, makeArray, makeNull } from '../../core/runtime/values';
import { logger } from '../../utils/logger';

/**
 * Extended EventManager with support for all 79 Discord.js events
 */
export class CompleteEventManager {
  /**
   * Convert Discord.js event arguments to RuntimeValues for all 79 events
   * @param eventName - Event name
   * @param args - Raw Discord.js event arguments
   * @returns Array of RuntimeValues
   */
  convertCompleteEventArgs(eventName: string, args: any[]): RuntimeValue[] {
    switch (eventName) {
      // ========== AUTOMOD EVENTS (4) ==========
      case 'autoModerationActionExecution':
        return [this.autoModActionExecutionToRuntimeValue(args[0])];

      case 'autoModerationRuleCreate':
      case 'autoModerationRuleUpdate':
      case 'autoModerationRuleDelete':
        return [this.autoModRuleToRuntimeValue(args[0])];

      // ========== APPLICATION COMMAND EVENTS (1) ==========
      case 'applicationCommandPermissionsUpdate':
        return [this.convertToRuntimeValue(args[0])];

      // ========== AUDIT LOG EVENTS (1) ==========
      case 'guildAuditLogEntryCreate':
        return [this.auditLogEntryToRuntimeValue(args[0])];

      // ========== BAN EVENTS (2) ==========
      case 'guildBanAdd':
      case 'guildBanRemove':
        return [this.guildBanToRuntimeValue(args[0])];

      // ========== CHANNEL EVENTS (1) ==========
      case 'channelPinsUpdate':
        return [
          this.convertToRuntimeValue(args[0]), // channel
          args[1] ? makeString(args[1].toISOString()) : makeNull(), // time
        ];

      // ========== EMOJI & STICKER EVENTS (6) ==========
      case 'emojiCreate':
      case 'emojiUpdate':
      case 'emojiDelete':
        return [this.emojiToRuntimeValue(args[0])];

      case 'stickerCreate':
      case 'stickerUpdate':
      case 'stickerDelete':
        return [this.stickerToRuntimeValue(args[0])];

      // ========== ENTITLEMENT EVENTS (3) ==========
      case 'entitlementCreate':
      case 'entitlementUpdate':
      case 'entitlementDelete':
        return [this.entitlementToRuntimeValue(args[0])];

      // ========== GUILD EVENTS (5) ==========
      case 'guildAvailable':
      case 'guildUnavailable':
        return [this.convertToRuntimeValue(args[0])];

      case 'guildIntegrationsUpdate':
        return [this.convertToRuntimeValue(args[0])];

      case 'guildMembersChunk':
        const chunkInfo = new Map<string, RuntimeValue>();
        chunkInfo.set('count', makeNumber(args[2]?.count || 0));
        chunkInfo.set('index', makeNumber(args[2]?.index || 0));
        chunkInfo.set('nonce', args[2]?.nonce ? makeString(args[2].nonce) : makeNull());
        return [
          makeArray((args[0] as GuildMember[]).map((m) => this.memberToRuntimeValue(m))),
          this.convertToRuntimeValue(args[1]), // guild
          makeObject(chunkInfo),
        ];

      case 'guildMemberAvailable':
        return [this.memberToRuntimeValue(args[0])];

      // ========== SCHEDULED EVENTS (5) ==========
      case 'guildScheduledEventCreate':
      case 'guildScheduledEventUpdate':
      case 'guildScheduledEventDelete':
        return [this.scheduledEventToRuntimeValue(args[0])];

      case 'guildScheduledEventUserAdd':
      case 'guildScheduledEventUserRemove':
        return [
          this.scheduledEventToRuntimeValue(args[0]),
          this.convertToRuntimeValue(args[1]), // user
        ];

      // ========== INVITE EVENTS (2) ==========
      case 'inviteCreate':
      case 'inviteDelete':
        return [this.inviteToRuntimeValue(args[0])];

      // ========== MESSAGE EVENTS (6) ==========
      case 'messageDeleteBulk':
        return [
          makeArray(Array.from((args[0] as Map<string, Message>).values()).map((m) => this.messageToRuntimeValue(m))),
          this.convertToRuntimeValue(args[1]), // channel
        ];

      case 'messageReactionRemoveAll':
        return [
          this.messageToRuntimeValue(args[0]),
          makeArray(Array.from((args[1] as Map<string, MessageReaction>).values()).map((r) => this.reactionToRuntimeValue(r))),
        ];

      case 'messageReactionRemoveEmoji':
        return [this.reactionToRuntimeValue(args[0])];

      case 'messagePollVoteAdd':
      case 'messagePollVoteRemove':
        return [
          this.convertToRuntimeValue(args[0]), // pollAnswer
          makeString(args[1]), // userId
        ];

      // ========== PRESENCE EVENTS (1) ==========
      case 'presenceUpdate':
        return [
          args[0] ? this.presenceToRuntimeValue(args[0]) : makeNull(),
          this.presenceToRuntimeValue(args[1]),
        ];

      // ========== SOUNDBOARD EVENTS (5) ==========
      case 'soundboardSounds':
        return [makeArray(args[0].map((s: any) => this.soundToRuntimeValue(s)))];

      case 'guildSoundboardSoundCreate':
      case 'guildSoundboardSoundUpdate':
      case 'guildSoundboardSoundDelete':
        return [this.soundToRuntimeValue(args[0])];

      case 'guildSoundboardSoundsUpdate':
        return [
          this.convertToRuntimeValue(args[0]), // guild
          makeArray(args[1].map((s: any) => this.soundToRuntimeValue(s))),
        ];

      // ========== STAGE INSTANCE EVENTS (3) ==========
      case 'stageInstanceCreate':
      case 'stageInstanceUpdate':
      case 'stageInstanceDelete':
        return [this.stageInstanceToRuntimeValue(args[0])];

      // ========== SUBSCRIPTION EVENTS (3) ==========
      case 'subscriptionCreate':
      case 'subscriptionUpdate':
      case 'subscriptionDelete':
        return [this.subscriptionToRuntimeValue(args[0])];

      // ========== THREAD EVENTS (6) ==========
      case 'threadListSync':
        return [
          makeArray(args[0].map((t: ThreadChannel) => this.threadToRuntimeValue(t))),
          this.convertToRuntimeValue(args[1]), // guild
        ];

      case 'threadMembersUpdate':
        return [
          makeArray(args[0].map((m: ThreadMember) => this.threadMemberToRuntimeValue(m))),
          makeArray(args[1].map((m: ThreadMember) => this.threadMemberToRuntimeValue(m))),
          this.threadToRuntimeValue(args[2]),
        ];

      case 'threadMemberUpdate':
        return [
          this.threadMemberToRuntimeValue(args[0]),
          this.threadMemberToRuntimeValue(args[1]),
        ];

      // ========== TYPING EVENTS (1) ==========
      case 'typingStart':
        return [this.typingToRuntimeValue(args[0])];

      // ========== USER EVENTS (1) ==========
      case 'userUpdate':
        return [
          this.userToRuntimeValue(args[0]),
          this.userToRuntimeValue(args[1]),
        ];

      // ========== VOICE EVENTS (3) ==========
      case 'voiceServerUpdate':
        return [
          makeObject(new Map([
            ['token', makeString(args[0].token)],
            ['guild', this.convertToRuntimeValue(args[0].guild)],
            ['endpoint', args[0].endpoint ? makeString(args[0].endpoint) : makeNull()],
          ])),
        ];

      case 'voiceChannelEffectSend':
        return [
          this.convertToRuntimeValue(args[0]), // channel
          this.userToRuntimeValue(args[1]),
          makeObject(new Map([
            ['emoji', args[2].emoji ? this.emojiToRuntimeValue(args[2].emoji) : makeNull()],
            ['animationType', args[2].animationType ? makeNumber(args[2].animationType) : makeNull()],
            ['animationId', args[2].animationId ? makeString(args[2].animationId) : makeNull()],
          ])),
        ];

      // ========== WEBHOOK EVENTS (1) ==========
      case 'webhooksUpdate':
        return [this.convertToRuntimeValue(args[0])]; // channel

      // ========== SYSTEM EVENTS (3) ==========
      case 'invalidated':
        return [];

      case 'cacheSweep':
        return [makeString(args[0])]; // message describing what was swept

      case 'debug':
      case 'warn':
        return [makeString(args[0])]; // debug/warning message

      default:
        // Fallback to generic conversion
        return args.map((arg) => this.convertToRuntimeValue(arg));
    }
  }

  // ========== CONVERTER METHODS ==========

  private autoModRuleToRuntimeValue(rule: AutoModerationRule): RuntimeValue {
    const props = new Map<string, RuntimeValue>();
    props.set('id', makeString(rule.id));
    props.set('name', makeString(rule.name));
    props.set('creatorId', makeString(rule.creatorId));
    props.set('eventType', makeNumber(rule.eventType));
    props.set('triggerType', makeNumber(rule.triggerType));
    props.set('enabled', makeBoolean(rule.enabled));

    if (rule.actions) {
      props.set('actions', makeArray(rule.actions.map(a => this.convertToRuntimeValue(a))));
    }

    if (rule.exemptRoles) {
      props.set('exemptRoles', makeArray(Array.from(rule.exemptRoles.values()).map(r => makeString(typeof r === 'string' ? r : r.id))));
    }

    if (rule.exemptChannels) {
      props.set('exemptChannels', makeArray(Array.from(rule.exemptChannels.values()).map(c => makeString(typeof c === 'string' ? c : c.id))));
    }

    return makeObject(props);
  }

  private autoModActionExecutionToRuntimeValue(execution: AutoModerationActionExecution): RuntimeValue {
    const props = new Map<string, RuntimeValue>();
    props.set('action', this.convertToRuntimeValue(execution.action));
    props.set('ruleId', makeString(execution.ruleId));
    props.set('ruleTriggerType', makeNumber(execution.ruleTriggerType));
    props.set('userId', makeString(execution.userId));
    props.set('channelId', execution.channelId ? makeString(execution.channelId) : makeNull());
    props.set('messageId', execution.messageId ? makeString(execution.messageId) : makeNull());
    props.set('alertSystemMessageId', execution.alertSystemMessageId ? makeString(execution.alertSystemMessageId) : makeNull());
    props.set('content', makeString(execution.content));
    props.set('matchedContent', execution.matchedContent ? makeString(execution.matchedContent) : makeNull());
    props.set('matchedKeyword', execution.matchedKeyword ? makeString(execution.matchedKeyword) : makeNull());
    return makeObject(props);
  }

  private guildBanToRuntimeValue(ban: GuildBan): RuntimeValue {
    const props = new Map<string, RuntimeValue>();
    props.set('user', this.userToRuntimeValue(ban.user));
    props.set('reason', ban.reason ? makeString(ban.reason) : makeNull());
    props.set('guild', this.convertToRuntimeValue(ban.guild));
    return makeObject(props);
  }

  private emojiToRuntimeValue(emoji: GuildEmoji): RuntimeValue {
    const props = new Map<string, RuntimeValue>();
    props.set('id', makeString(emoji.id!));
    props.set('name', makeString(emoji.name!));
    props.set('animated', makeBoolean(emoji.animated || false));
    props.set('available', makeBoolean(emoji.available || true));
    props.set('managed', makeBoolean(emoji.managed || false));
    props.set('requireColons', makeBoolean(emoji.requiresColons || true));

    if (emoji.url) {
      props.set('url', makeString(emoji.url));
    }

    if (emoji.roles) {
      if (emoji.roles) props.set('roles', makeArray(Array.from(emoji.roles.cache.keys()).map(id => makeString(id))));
    }

    return makeObject(props);
  }

  private stickerToRuntimeValue(sticker: Sticker): RuntimeValue {
    const props = new Map<string, RuntimeValue>();
    props.set('id', makeString(sticker.id));
    props.set('name', makeString(sticker.name));
    props.set('description', sticker.description ? makeString(sticker.description) : makeNull());
    props.set('format', makeNumber(sticker.format));
    props.set('available', makeBoolean(sticker.available || true));

    if (sticker.tags) {
      props.set('tags', makeString(sticker.tags));
    }

    if (sticker.url) {
      props.set('url', makeString(sticker.url));
    }

    return makeObject(props);
  }

  private scheduledEventToRuntimeValue(event: GuildScheduledEvent): RuntimeValue {
    const props = new Map<string, RuntimeValue>();
    props.set('id', makeString(event.id));
    props.set('name', makeString(event.name));
    props.set('description', event.description ? makeString(event.description) : makeNull());
    props.set('scheduledStartAt', makeString(event.scheduledStartAt ? event.scheduledStartAt.toISOString() : new Date().toISOString()));

    if (event.scheduledEndAt) {
      props.set('scheduledEndAt', makeString(event.scheduledEndAt.toISOString()));
    }

    props.set('privacyLevel', makeNumber(event.privacyLevel));
    props.set('status', makeNumber(event.status));
    props.set('entityType', makeNumber(event.entityType));
    props.set('userCount', makeNumber(event.userCount || 0));

    if (event.creator) {
      props.set('creator', this.userToRuntimeValue(event.creator));
    }

    if (event.channelId) {
      props.set('channelId', makeString(event.channelId));
    }

    if (event.entityMetadata) {
      props.set('location', event.entityMetadata.location ? makeString(event.entityMetadata.location) : makeNull());
    }

    return makeObject(props);
  }

  private inviteToRuntimeValue(invite: Invite): RuntimeValue {
    const props = new Map<string, RuntimeValue>();
    props.set('code', makeString(invite.code));
    props.set('url', makeString(invite.url));
    props.set('uses', makeNumber(invite.uses || 0));
    props.set('maxUses', makeNumber(invite.maxUses || 0));
    props.set('maxAge', makeNumber(invite.maxAge || 0));
    props.set('temporary', makeBoolean(invite.temporary || false));
    props.set('createdAt', invite.createdAt ? makeString(invite.createdAt.toISOString()) : makeNull());
    props.set('expiresAt', invite.expiresAt ? makeString(invite.expiresAt.toISOString()) : makeNull());

    if (invite.inviter) {
      props.set('inviter', this.userToRuntimeValue(invite.inviter));
    }

    if (invite.channel) {
      if (invite.channel) props.set('channel', this.convertToRuntimeValue(invite.channel));
    }

    return makeObject(props);
  }

  private presenceToRuntimeValue(presence: Presence): RuntimeValue {
    const props = new Map<string, RuntimeValue>();
    props.set('userId', makeString(presence.userId!));
    props.set('status', makeString(presence.status));

    if (presence.activities && presence.activities.length > 0) {
      props.set('activities', makeArray(presence.activities.map(a => {
        const actProps = new Map<string, RuntimeValue>();
        actProps.set('name', makeString(a.name));
        actProps.set('type', makeNumber(a.type));
        if (a.url) actProps.set('url', makeString(a.url));
        if (a.details) actProps.set('details', makeString(a.details));
        if (a.state) actProps.set('state', makeString(a.state));
        return makeObject(actProps);
      })));
    }

    if (presence.clientStatus) {
      const clientProps = new Map<string, RuntimeValue>();
      if (presence.clientStatus.desktop) clientProps.set('desktop', makeString(presence.clientStatus.desktop));
      if (presence.clientStatus.mobile) clientProps.set('mobile', makeString(presence.clientStatus.mobile));
      if (presence.clientStatus.web) clientProps.set('web', makeString(presence.clientStatus.web));
      props.set('clientStatus', makeObject(clientProps));
    }

    return makeObject(props);
  }

  private stageInstanceToRuntimeValue(stage: StageInstance): RuntimeValue {
    const props = new Map<string, RuntimeValue>();
    props.set('id', makeString(stage.id));
    props.set('channelId', makeString(stage.channelId));
    props.set('topic', makeString(stage.topic));
    props.set('privacyLevel', makeNumber(stage.privacyLevel));
    props.set('discoverableDisabled', makeBoolean(stage.discoverableDisabled ?? false));
    return makeObject(props);
  }

  private soundToRuntimeValue(sound: any): RuntimeValue {
    const props = new Map<string, RuntimeValue>();
    if (sound.soundId) props.set('soundId', makeString(sound.soundId));
    if (sound.name) props.set('name', makeString(sound.name));
    if (sound.volume) props.set('volume', makeNumber(sound.volume));
    if (sound.emojiId) props.set('emojiId', makeString(sound.emojiId));
    if (sound.emojiName) props.set('emojiName', makeString(sound.emojiName));
    return makeObject(props);
  }

  private threadToRuntimeValue(thread: ThreadChannel): RuntimeValue {
    const props = new Map<string, RuntimeValue>();
    props.set('id', makeString(thread.id));
    props.set('name', makeString(thread.name));
    props.set('type', makeNumber(thread.type));
    props.set('parentId', thread.parentId ? makeString(thread.parentId) : makeNull());
    props.set('ownerId', thread.ownerId ? makeString(thread.ownerId) : makeNull());
    props.set('archived', makeBoolean(thread.archived ?? false));
    props.set('locked', makeBoolean(thread.locked || false));
    props.set('memberCount', makeNumber(thread.memberCount || 0));
    props.set('messageCount', makeNumber(thread.messageCount || 0));
    return makeObject(props);
  }

  private threadMemberToRuntimeValue(member: ThreadMember): RuntimeValue {
    const props = new Map<string, RuntimeValue>();
    props.set('id', makeString(member.id!));
    props.set('id', makeString(member.id));
    props.set('joinedAt', makeString(member.joinedTimestamp ? member.joinedTimestamp.toString() : new Date().toString()));
    props.set('flags', makeNumber(member.flags.bitfield));
    return makeObject(props);
  }

  private typingToRuntimeValue(typing: Typing): RuntimeValue {
    const props = new Map<string, RuntimeValue>();
    props.set('user', this.userToRuntimeValue(typing.user));
    props.set('channel', this.convertToRuntimeValue(typing.channel));
    props.set('startedAt', makeString(typing.startedAt.toISOString()));

    if (typing.member) {
      props.set('member', this.memberToRuntimeValue(typing.member));
    }

    return makeObject(props);
  }

  private entitlementToRuntimeValue(entitlement: any): RuntimeValue {
    const props = new Map<string, RuntimeValue>();
    if (entitlement.id) props.set('id', makeString(entitlement.id));
    if (entitlement.skuId) props.set('skuId', makeString(entitlement.skuId));
    if (entitlement.userId) props.set('userId', makeString(entitlement.userId));
    if (entitlement.guildId) props.set('guildId', makeString(entitlement.guildId));
    if (entitlement.applicationId) props.set('applicationId', makeString(entitlement.applicationId));
    if (entitlement.type) props.set('type', makeNumber(entitlement.type));
    if (entitlement.deleted) props.set('deleted', makeBoolean(entitlement.deleted));
    return makeObject(props);
  }

  private subscriptionToRuntimeValue(subscription: any): RuntimeValue {
    const props = new Map<string, RuntimeValue>();
    if (subscription.id) props.set('id', makeString(subscription.id));
    if (subscription.userId) props.set('userId', makeString(subscription.userId));
    if (subscription.status) props.set('status', makeString(subscription.status));
    return makeObject(props);
  }

  private auditLogEntryToRuntimeValue(entry: any): RuntimeValue {
    const props = new Map<string, RuntimeValue>();
    props.set('id', makeString(entry.id));
    props.set('actionType', makeNumber(entry.actionType));
    props.set('targetId', entry.targetId ? makeString(entry.targetId) : makeNull());
    props.set('executorId', entry.executorId ? makeString(entry.executorId) : makeNull());
    props.set('reason', entry.reason ? makeString(entry.reason) : makeNull());

    if (entry.changes) {
      props.set('changes', makeArray(entry.changes.map((c: any) => this.convertToRuntimeValue(c))));
    }

    return makeObject(props);
  }

  private messageToRuntimeValue(message: Message | PartialMessage): RuntimeValue {
    const props = new Map<string, RuntimeValue>();
    props.set('id', makeString(message.id));
    props.set('channelId', makeString(message.channelId));

    if (message.partial) {
      props.set('partial', makeBoolean(true));
    } else {
      props.set('content', makeString((message as Message).content));
      props.set('author', this.userToRuntimeValue((message as Message).author));
    }

    return makeObject(props);
  }

  private userToRuntimeValue(user: User | PartialUser): RuntimeValue {
    const props = new Map<string, RuntimeValue>();
    props.set('id', makeString(user.id ?? 'unknown'));
    props.set('username', makeString(user.username ?? 'unknown'));
    props.set('discriminator', makeString(user.discriminator ?? '0'));
    props.set('bot', makeBoolean(user.bot || false));

    if (user.avatar) {
      props.set('avatar', makeString(user.avatar));
      props.set('avatarURL', makeString(user.displayAvatarURL()));
    }

    return makeObject(props);
  }

  private memberToRuntimeValue(member: GuildMember | PartialGuildMember): RuntimeValue {
    const props = new Map<string, RuntimeValue>();
    props.set('id', makeString(member.id));
    props.set('user', this.userToRuntimeValue(member.user));

    if (!member.partial) {
      props.set('nickname', member.nickname ? makeString(member.nickname) : makeNull());
      props.set('roles', makeArray(Array.from(member.roles.cache.keys()).map(id => makeString(id))));
      props.set('joinedAt', member.joinedAt ? makeString(member.joinedAt.toISOString()) : makeNull());
    }

    return makeObject(props);
  }

  private reactionToRuntimeValue(reaction: MessageReaction | PartialMessageReaction): RuntimeValue {
    const props = new Map<string, RuntimeValue>();
    props.set('count', makeNumber(reaction.count || 0));
    props.set('me', makeBoolean(reaction.me));

    if (reaction.emoji) {
      props.set('emoji', this.convertToRuntimeValue(reaction.emoji));
    }

    return makeObject(props);
  }

  private convertToRuntimeValue(value: any): RuntimeValue {
    if (value === null || value === undefined) {
      return makeNull();
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

    if (Array.isArray(value)) {
      return makeArray(value.map(v => this.convertToRuntimeValue(v)));
    }

    if (typeof value === 'object') {
      // Try to extract basic properties
      const props = new Map<string, RuntimeValue>();

      if (value.id) props.set('id', makeString(value.id));
      if (value.name) props.set('name', makeString(value.name));
      if (value.type !== undefined) props.set('type', makeNumber(value.type));

      return makeObject(props);
    }

    return makeNull();
  }
}

/**
 * Setup all 79 Discord events on the client
 */
export function setupCompleteEvents(client: Client, handlers: Map<string, Function[]>): void {
  const eventManager = new CompleteEventManager();

  // List of all 79 Discord.js events
  const allEvents = [
    // Core events (already handled)
    'ready', 'messageCreate', 'messageUpdate', 'messageDelete',
    'interactionCreate', 'guildCreate', 'guildUpdate', 'guildDelete',
    'guildMemberAdd', 'guildMemberUpdate', 'guildMemberRemove',
    'channelCreate', 'channelUpdate', 'channelDelete',
    'roleCreate', 'roleUpdate', 'roleDelete',

    // AutoMod events (4)
    'autoModerationActionExecution', 'autoModerationRuleCreate',
    'autoModerationRuleUpdate', 'autoModerationRuleDelete',

    // Application command events (1)
    'applicationCommandPermissionsUpdate',

    // Audit log events (1)
    'guildAuditLogEntryCreate',

    // Ban events (2)
    'guildBanAdd', 'guildBanRemove',

    // Channel events (1)
    'channelPinsUpdate',

    // Emoji & sticker events (6)
    'emojiCreate', 'emojiUpdate', 'emojiDelete',
    'stickerCreate', 'stickerUpdate', 'stickerDelete',

    // Entitlement events (3)
    'entitlementCreate', 'entitlementUpdate', 'entitlementDelete',

    // Guild events (5)
    'guildAvailable', 'guildUnavailable', 'guildIntegrationsUpdate',
    'guildMembersChunk', 'guildMemberAvailable',

    // Scheduled events (5)
    'guildScheduledEventCreate', 'guildScheduledEventUpdate',
    'guildScheduledEventDelete', 'guildScheduledEventUserAdd',
    'guildScheduledEventUserRemove',

    // Invite events (2)
    'inviteCreate', 'inviteDelete',

    // Message events (6)
    'messageDeleteBulk', 'messageReactionAdd', 'messageReactionRemove',
    'messageReactionRemoveAll', 'messageReactionRemoveEmoji',
    'messagePollVoteAdd', 'messagePollVoteRemove',

    // Presence events (1)
    'presenceUpdate',

    // Soundboard events (5)
    'soundboardSounds', 'guildSoundboardSoundCreate',
    'guildSoundboardSoundUpdate', 'guildSoundboardSoundDelete',
    'guildSoundboardSoundsUpdate',

    // Stage instance events (3)
    'stageInstanceCreate', 'stageInstanceUpdate', 'stageInstanceDelete',

    // Subscription events (3)
    'subscriptionCreate', 'subscriptionUpdate', 'subscriptionDelete',

    // Thread events (6)
    'threadCreate', 'threadUpdate', 'threadDelete',
    'threadListSync', 'threadMembersUpdate', 'threadMemberUpdate',

    // Typing events (1)
    'typingStart',

    // User events (1)
    'userUpdate',

    // Voice events (3)
    'voiceStateUpdate', 'voiceServerUpdate', 'voiceChannelEffectSend',

    // Webhook events (1)
    'webhooksUpdate',

    // System events (5)
    'invalidated', 'cacheSweep', 'debug', 'warn', 'error',
  ];

  // Setup listeners for all registered events
  for (const eventName of allEvents) {
    const eventHandlers = handlers.get(eventName);

    if (eventHandlers && eventHandlers.length > 0) {
      client.on(eventName, async (...args: any[]) => {
        try {
          const runtimeArgs = eventManager.convertCompleteEventArgs(eventName, args);

          for (const handler of eventHandlers) {
            try {
              await handler(...runtimeArgs);
            } catch (error: any) {
              logger.error(`Error in ${eventName} handler: ${error.message}`);
            }
          }
        } catch (error: any) {
          logger.error(`Error dispatching ${eventName} event: ${error.message}`);
        }
      });

      logger.debug(`Setup event listener for '${eventName}'`);
    }
  }
}
