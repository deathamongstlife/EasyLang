/**
 * Extended Discord Features for EasyLang
 * Scheduled Events, Forums, Stages, Stickers, Presence, and more
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
  isBoolean,
  isObject,
  isArray,
} from './values';
import { RuntimeError, TypeError } from '../utils/errors';
import {
  Guild,
  GuildScheduledEvent,
  GuildScheduledEventEntityType,
  GuildScheduledEventPrivacyLevel,
  GuildScheduledEventStatus,
  ForumChannel,
  StageChannel,
  GuildMember,
  ThreadChannel,
  ActivityType,
  PresenceUpdateStatus,
  GuildEmoji,
  Sticker,
} from 'discord.js';

/**
 * Extract raw Discord.js object from RuntimeValue
 */
function getRawValue(value: RuntimeValue): any {
  if (isObject(value)) {
    const rawProp = value.properties.get('__raw');
    if (rawProp && isObject(rawProp)) {
      return (rawProp as any).__rawValue;
    }
  }
  return null;
}

/**
 * Get Discord client from global context
 */
function getDiscordClient(): any {
  return (global as any).__discordClient;
}

// ==================== SCHEDULED EVENTS ====================

/**
 * Convert scheduled event to RuntimeValue
 */
function convertScheduledEventToRuntime(event: GuildScheduledEvent): RuntimeValue {
  const properties = new Map<string, RuntimeValue>();
  properties.set('__raw', { __rawValue: event } as any);
  properties.set('id', makeString(event.id));
  properties.set('name', makeString(event.name));
  properties.set('description', makeString(event.description || ''));
  properties.set('scheduled_start_time', makeString(event.scheduledStartAt?.toISOString() || ''));
  properties.set('scheduled_end_time', makeString(event.scheduledEndAt?.toISOString() || ''));
  properties.set('status', makeNumber(event.status));
  properties.set('entity_type', makeNumber(event.entityType));
  properties.set('creator_id', makeString(event.creatorId || ''));
  properties.set('user_count', makeNumber(event.userCount || 0));

  if (event.channelId) {
    properties.set('channel_id', makeString(event.channelId));
  }

  return makeObject(properties);
}

/**
 * create_scheduled_event(guild, options)
 * Create a scheduled event
 */
export const createScheduledEvent = makeNativeFunction('create_scheduled_event', async (args: RuntimeValue[]) => {
  if (args.length !== 2) {
    throw new RuntimeError(`create_scheduled_event() expects 2 arguments (guild, options), got ${args.length}`);
  }

  const guild = getRawValue(args[0]) as Guild;
  if (!guild || !guild.scheduledEvents) {
    throw new TypeError('First argument must be a Guild object');
  }

  if (!isObject(args[1])) {
    throw new TypeError('Second argument must be an options object');
  }

  const options = args[1];

  const nameProp = options.properties.get('name');
  if (!nameProp || !isString(nameProp)) {
    throw new RuntimeError('name is required');
  }

  const descriptionProp = options.properties.get('description');
  const startTimeProp = options.properties.get('scheduled_start_time');
  if (!startTimeProp || !isString(startTimeProp)) {
    throw new RuntimeError('scheduled_start_time is required');
  }

  const entityTypeProp = options.properties.get('entity_type');
  const entityTypeStr = entityTypeProp && isString(entityTypeProp) ? entityTypeProp.value : 'VOICE';

  const entityTypeMap: { [key: string]: GuildScheduledEventEntityType } = {
    STAGE_INSTANCE: GuildScheduledEventEntityType.StageInstance,
    VOICE: GuildScheduledEventEntityType.Voice,
    EXTERNAL: GuildScheduledEventEntityType.External,
  };

  const entityType = entityTypeMap[entityTypeStr.toUpperCase()] || GuildScheduledEventEntityType.Voice;

  const eventOptions: any = {
    name: nameProp.value,
    scheduledStartTime: new Date(startTimeProp.value),
    privacyLevel: GuildScheduledEventPrivacyLevel.GuildOnly,
    entityType,
  };

  if (descriptionProp && isString(descriptionProp)) {
    eventOptions.description = descriptionProp.value;
  }

  const endTimeProp = options.properties.get('scheduled_end_time');
  if (endTimeProp && isString(endTimeProp)) {
    eventOptions.scheduledEndTime = new Date(endTimeProp.value);
  }

  const channelIdProp = options.properties.get('channel_id');
  if (channelIdProp && isString(channelIdProp)) {
    eventOptions.channel = channelIdProp.value;
  }

  const imageProp = options.properties.get('image');
  if (imageProp && isString(imageProp)) {
    eventOptions.image = imageProp.value;
  }

  try {
    const event = await guild.scheduledEvents.create(eventOptions);
    return convertScheduledEventToRuntime(event);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    throw new RuntimeError(`Failed to create scheduled event: ${errorMsg}`);
  }
});

/**
 * fetch_scheduled_events(guild)
 * Fetch all scheduled events
 */
export const fetchScheduledEvents = makeNativeFunction('fetch_scheduled_events', async (args: RuntimeValue[]) => {
  if (args.length !== 1) {
    throw new RuntimeError(`fetch_scheduled_events() expects 1 argument (guild), got ${args.length}`);
  }

  const guild = getRawValue(args[0]) as Guild;
  if (!guild || !guild.scheduledEvents) {
    throw new TypeError('Argument must be a Guild object');
  }

  try {
    const events = await guild.scheduledEvents.fetch();
    const eventArray = Array.from(events.values()).map(event => convertScheduledEventToRuntime(event));
    return makeArray(eventArray);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    throw new RuntimeError(`Failed to fetch scheduled events: ${errorMsg}`);
  }
});

/**
 * delete_scheduled_event(guild, event_id)
 * Delete a scheduled event
 */
export const deleteScheduledEvent = makeNativeFunction('delete_scheduled_event', async (args: RuntimeValue[]) => {
  if (args.length !== 2) {
    throw new RuntimeError(`delete_scheduled_event() expects 2 arguments (guild, event_id), got ${args.length}`);
  }

  const guild = getRawValue(args[0]) as Guild;
  if (!guild || !guild.scheduledEvents) {
    throw new TypeError('First argument must be a Guild object');
  }

  if (!isString(args[1])) {
    throw new TypeError('event_id must be a string');
  }

  try {
    await guild.scheduledEvents.delete(args[1].value);
    return makeBoolean(true);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    throw new RuntimeError(`Failed to delete scheduled event: ${errorMsg}`);
  }
});

// ==================== FORUM CHANNELS ====================

/**
 * create_forum_post(forum_channel, options)
 * Create a forum post (thread)
 */
export const createForumPost = makeNativeFunction('create_forum_post', async (args: RuntimeValue[]) => {
  if (args.length !== 2) {
    throw new RuntimeError(`create_forum_post() expects 2 arguments (forum_channel, options), got ${args.length}`);
  }

  const forumChannel = getRawValue(args[0]) as ForumChannel;
  if (!forumChannel || !forumChannel.threads) {
    throw new TypeError('First argument must be a ForumChannel object');
  }

  if (!isObject(args[1])) {
    throw new TypeError('Second argument must be an options object');
  }

  const options = args[1];

  const nameProp = options.properties.get('name');
  if (!nameProp || !isString(nameProp)) {
    throw new RuntimeError('name is required');
  }

  const messageProp = options.properties.get('message');
  if (!messageProp || !isObject(messageProp)) {
    throw new RuntimeError('message is required');
  }

  const message = messageProp;
  const contentProp = message.properties.get('content');
  if (!contentProp || !isString(contentProp)) {
    throw new RuntimeError('message.content is required');
  }

  const threadOptions: any = {
    name: nameProp.value,
    message: {
      content: contentProp.value,
    },
  };

  const appliedTagsProp = options.properties.get('applied_tags');
  if (appliedTagsProp && isArray(appliedTagsProp)) {
    threadOptions.appliedTags = appliedTagsProp.elements.filter(isString).map(s => s.value);
  }

  try {
    const thread = await forumChannel.threads.create(threadOptions);

    const properties = new Map<string, RuntimeValue>();
    properties.set('__raw', { __rawValue: thread } as any);
    properties.set('id', makeString(thread.id));
    properties.set('name', makeString(thread.name));
    return makeObject(properties);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    throw new RuntimeError(`Failed to create forum post: ${errorMsg}`);
  }
});

/**
 * create_forum_tag(forum_channel, options)
 * Create a forum tag
 */
export const createForumTag = makeNativeFunction('create_forum_tag', async (args: RuntimeValue[]) => {
  if (args.length !== 2) {
    throw new RuntimeError(`create_forum_tag() expects 2 arguments (forum_channel, options), got ${args.length}`);
  }

  const forumChannel = getRawValue(args[0]) as ForumChannel;
  if (!forumChannel || !forumChannel.availableTags) {
    throw new TypeError('First argument must be a ForumChannel object');
  }

  if (!isObject(args[1])) {
    throw new TypeError('Second argument must be an options object');
  }

  const options = args[1];

  const nameProp = options.properties.get('name');
  if (!nameProp || !isString(nameProp)) {
    throw new RuntimeError('name is required');
  }

  const tagOptions: any = {
    name: nameProp.value,
  };

  const emojiProp = options.properties.get('emoji');
  if (emojiProp && isString(emojiProp)) {
    tagOptions.emoji = emojiProp.value;
  }

  const moderatedProp = options.properties.get('moderated');
  if (moderatedProp && isBoolean(moderatedProp)) {
    tagOptions.moderated = moderatedProp.value;
  }

  try {
    const tags = [...forumChannel.availableTags, tagOptions];
    await forumChannel.edit({ availableTags: tags });
    return makeBoolean(true);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    throw new RuntimeError(`Failed to create forum tag: ${errorMsg}`);
  }
});

// ==================== STAGE CHANNELS ====================

/**
 * create_stage_instance(stage_channel, options)
 * Start a stage instance
 */
export const createStageInstance = makeNativeFunction('create_stage_instance', async (args: RuntimeValue[]) => {
  if (args.length !== 2) {
    throw new RuntimeError(`create_stage_instance() expects 2 arguments (stage_channel, options), got ${args.length}`);
  }

  const stageChannel = getRawValue(args[0]) as StageChannel;
  if (!stageChannel || !stageChannel.createStageInstance) {
    throw new TypeError('First argument must be a StageChannel object');
  }

  if (!isObject(args[1])) {
    throw new TypeError('Second argument must be an options object');
  }

  const options = args[1];

  const topicProp = options.properties.get('topic');
  if (!topicProp || !isString(topicProp)) {
    throw new RuntimeError('topic is required');
  }

  const instanceOptions: any = {
    topic: topicProp.value,
  };

  try {
    const instance = await stageChannel.createStageInstance(instanceOptions);

    const properties = new Map<string, RuntimeValue>();
    properties.set('__raw', { __rawValue: instance } as any);
    properties.set('id', makeString(instance.id));
    properties.set('topic', makeString(instance.topic));
    return makeObject(properties);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    throw new RuntimeError(`Failed to create stage instance: ${errorMsg}`);
  }
});

/**
 * delete_stage_instance(stage_channel)
 * End a stage instance
 */
export const deleteStageInstance = makeNativeFunction('delete_stage_instance', async (args: RuntimeValue[]) => {
  if (args.length !== 1) {
    throw new RuntimeError(`delete_stage_instance() expects 1 argument (stage_channel), got ${args.length}`);
  }

  const stageChannel = getRawValue(args[0]) as StageChannel;
  if (!stageChannel || !stageChannel.stageInstance) {
    throw new TypeError('Argument must be a StageChannel object with an active stage');
  }

  try {
    await stageChannel.stageInstance?.delete();
    return makeBoolean(true);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    throw new RuntimeError(`Failed to delete stage instance: ${errorMsg}`);
  }
});

/**
 * become_speaker(member, stage_channel)
 * Make member a speaker on stage
 */
export const becomeSpeaker = makeNativeFunction('become_speaker', async (args: RuntimeValue[]) => {
  if (args.length !== 2) {
    throw new RuntimeError(`become_speaker() expects 2 arguments (member, stage_channel), got ${args.length}`);
  }

  const member = getRawValue(args[0]) as GuildMember;
  if (!member || !member.voice) {
    throw new TypeError('First argument must be a GuildMember object');
  }

  try {
    await member.voice.setSuppressed(false);
    return makeBoolean(true);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    throw new RuntimeError(`Failed to make member speaker: ${errorMsg}`);
  }
});

/**
 * move_to_audience(member, stage_channel)
 * Move member to audience on stage
 */
export const moveToAudience = makeNativeFunction('move_to_audience', async (args: RuntimeValue[]) => {
  if (args.length !== 2) {
    throw new RuntimeError(`move_to_audience() expects 2 arguments (member, stage_channel), got ${args.length}`);
  }

  const member = getRawValue(args[0]) as GuildMember;
  if (!member || !member.voice) {
    throw new TypeError('First argument must be a GuildMember object');
  }

  try {
    await member.voice.setSuppressed(true);
    return makeBoolean(true);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    throw new RuntimeError(`Failed to move member to audience: ${errorMsg}`);
  }
});

// ==================== STICKERS & EMOJI ====================

/**
 * create_guild_emoji(guild, options)
 * Create a custom emoji
 */
export const createGuildEmoji = makeNativeFunction('create_guild_emoji', async (args: RuntimeValue[]) => {
  if (args.length !== 2) {
    throw new RuntimeError(`create_guild_emoji() expects 2 arguments (guild, options), got ${args.length}`);
  }

  const guild = getRawValue(args[0]) as Guild;
  if (!guild || !guild.emojis) {
    throw new TypeError('First argument must be a Guild object');
  }

  if (!isObject(args[1])) {
    throw new TypeError('Second argument must be an options object');
  }

  const options = args[1];

  const nameProp = options.properties.get('name');
  const imageProp = options.properties.get('image');

  if (!nameProp || !isString(nameProp) || !imageProp || !isString(imageProp)) {
    throw new RuntimeError('name and image are required');
  }

  try {
    const emoji = await guild.emojis.create({
      attachment: imageProp.value,
      name: nameProp.value,
    });

    const properties = new Map<string, RuntimeValue>();
    properties.set('__raw', { __rawValue: emoji } as any);
    properties.set('id', makeString(emoji.id));
    properties.set('name', makeString(emoji.name || ''));
    return makeObject(properties);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    throw new RuntimeError(`Failed to create emoji: ${errorMsg}`);
  }
});

/**
 * delete_guild_emoji(guild, emoji_id)
 * Delete a custom emoji
 */
export const deleteGuildEmoji = makeNativeFunction('delete_guild_emoji', async (args: RuntimeValue[]) => {
  if (args.length !== 2) {
    throw new RuntimeError(`delete_guild_emoji() expects 2 arguments (guild, emoji_id), got ${args.length}`);
  }

  const guild = getRawValue(args[0]) as Guild;
  if (!guild || !guild.emojis) {
    throw new TypeError('First argument must be a Guild object');
  }

  if (!isString(args[1])) {
    throw new TypeError('emoji_id must be a string');
  }

  try {
    await guild.emojis.delete(args[1].value);
    return makeBoolean(true);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    throw new RuntimeError(`Failed to delete emoji: ${errorMsg}`);
  }
});

/**
 * create_guild_sticker(guild, options)
 * Create a custom sticker
 */
export const createGuildSticker = makeNativeFunction('create_guild_sticker', async (args: RuntimeValue[]) => {
  if (args.length !== 2) {
    throw new RuntimeError(`create_guild_sticker() expects 2 arguments (guild, options), got ${args.length}`);
  }

  const guild = getRawValue(args[0]) as Guild;
  if (!guild || !guild.stickers) {
    throw new TypeError('First argument must be a Guild object');
  }

  if (!isObject(args[1])) {
    throw new TypeError('Second argument must be an options object');
  }

  const options = args[1];

  const nameProp = options.properties.get('name');
  const fileProp = options.properties.get('file');
  const tagsProp = options.properties.get('tags');

  if (!nameProp || !isString(nameProp) || !fileProp || !isString(fileProp) || !tagsProp || !isString(tagsProp)) {
    throw new RuntimeError('name, file, and tags are required');
  }

  try {
    const sticker = await guild.stickers.create({
      file: fileProp.value,
      name: nameProp.value,
      tags: tagsProp.value,
    });

    const properties = new Map<string, RuntimeValue>();
    properties.set('__raw', { __rawValue: sticker } as any);
    properties.set('id', makeString(sticker.id));
    properties.set('name', makeString(sticker.name));
    return makeObject(properties);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    throw new RuntimeError(`Failed to create sticker: ${errorMsg}`);
  }
});

// ==================== PRESENCE & ACTIVITIES ====================

/**
 * set_presence(options)
 * Set bot presence
 */
export const setPresence = makeNativeFunction('set_presence', async (args: RuntimeValue[]) => {
  if (args.length !== 1) {
    throw new RuntimeError(`set_presence() expects 1 argument (options), got ${args.length}`);
  }

  if (!isObject(args[0])) {
    throw new TypeError('Argument must be an options object');
  }

  const client = getDiscordClient();
  if (!client || !client.user) {
    throw new RuntimeError('Discord client not initialized');
  }

  const options = args[0];

  const statusProp = options.properties.get('status');
  const status = statusProp && isString(statusProp) ? statusProp.value : 'online';

  const activitiesProp = options.properties.get('activities');
  const activities: any[] = [];

  if (activitiesProp && isArray(activitiesProp)) {
    for (const activityObj of activitiesProp.elements) {
      if (!isObject(activityObj)) continue;

      const nameProp = activityObj.properties.get('name');
      const typeProp = activityObj.properties.get('type');

      if (!nameProp || !isString(nameProp)) continue;

      const activityTypeMap: { [key: string]: ActivityType } = {
        PLAYING: ActivityType.Playing,
        STREAMING: ActivityType.Streaming,
        LISTENING: ActivityType.Listening,
        WATCHING: ActivityType.Watching,
        COMPETING: ActivityType.Competing,
      };

      const typeStr = typeProp && isString(typeProp) ? typeProp.value.toUpperCase() : 'PLAYING';
      const type = activityTypeMap[typeStr] || ActivityType.Playing;

      const activity: any = {
        name: nameProp.value,
        type,
      };

      const urlProp = activityObj.properties.get('url');
      if (urlProp && isString(urlProp)) {
        activity.url = urlProp.value;
      }

      activities.push(activity);
    }
  }

  try {
    await client.user.setPresence({
      status: status as PresenceUpdateStatus,
      activities,
    });
    return makeBoolean(true);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    throw new RuntimeError(`Failed to set presence: ${errorMsg}`);
  }
});

/**
 * set_activity(name, type, options?)
 * Set bot activity
 */
export const setActivity = makeNativeFunction('set_activity', async (args: RuntimeValue[]) => {
  if (args.length < 2) {
    throw new RuntimeError(`set_activity() expects at least 2 arguments (name, type), got ${args.length}`);
  }

  if (!isString(args[0]) || !isString(args[1])) {
    throw new TypeError('name and type must be strings');
  }

  const client = getDiscordClient();
  if (!client || !client.user) {
    throw new RuntimeError('Discord client not initialized');
  }

  const name = args[0].value;
  const typeStr = args[1].value.toUpperCase();

  const activityTypeMap: { [key: string]: ActivityType } = {
    PLAYING: ActivityType.Playing,
    STREAMING: ActivityType.Streaming,
    LISTENING: ActivityType.Listening,
    WATCHING: ActivityType.Watching,
    COMPETING: ActivityType.Competing,
  };

  const type = activityTypeMap[typeStr] || ActivityType.Playing;

  const activity: any = { name, type };

  if (args.length >= 3 && isObject(args[2])) {
    const options = args[2];
    const urlProp = options.properties.get('url');
    if (urlProp && isString(urlProp)) {
      activity.url = urlProp.value;
    }
  }

  try {
    await client.user.setActivity(activity);
    return makeBoolean(true);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    throw new RuntimeError(`Failed to set activity: ${errorMsg}`);
  }
});

/**
 * set_streaming(name, url)
 * Set streaming status
 */
export const setStreaming = makeNativeFunction('set_streaming', async (args: RuntimeValue[]) => {
  if (args.length !== 2) {
    throw new RuntimeError(`set_streaming() expects 2 arguments (name, url), got ${args.length}`);
  }

  if (!isString(args[0]) || !isString(args[1])) {
    throw new TypeError('name and url must be strings');
  }

  const client = getDiscordClient();
  if (!client || !client.user) {
    throw new RuntimeError('Discord client not initialized');
  }

  try {
    await client.user.setActivity({
      name: args[0].value,
      type: ActivityType.Streaming,
      url: args[1].value,
    });
    return makeBoolean(true);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    throw new RuntimeError(`Failed to set streaming: ${errorMsg}`);
  }
});

// Export all extended Discord functions
export const extendedDiscordBuiltins = {
  // Scheduled Events
  create_scheduled_event: createScheduledEvent,
  fetch_scheduled_events: fetchScheduledEvents,
  delete_scheduled_event: deleteScheduledEvent,

  // Forum Channels
  create_forum_post: createForumPost,
  create_forum_tag: createForumTag,

  // Stage Channels
  create_stage_instance: createStageInstance,
  delete_stage_instance: deleteStageInstance,
  become_speaker: becomeSpeaker,
  move_to_audience: moveToAudience,

  // Stickers & Emoji
  create_guild_emoji: createGuildEmoji,
  delete_guild_emoji: deleteGuildEmoji,
  create_guild_sticker: createGuildSticker,

  // Presence & Activities
  set_presence: setPresence,
  set_activity: setActivity,
  set_streaming: setStreaming,
};
