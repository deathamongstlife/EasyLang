/**
 * Advanced Discord functions for EzLang - Guild Management, Permissions, Threads, Voice, etc.
 */

import {
  RuntimeValue,
  makeString,
  makeBoolean,
  makeObject,
  makeNativeFunction,
  isString,
  isNumber,
  isBoolean,
  isObject,
} from './values';
import { RuntimeError, TypeError } from '../utils/errors';
import {
  Guild,
  GuildMember,
  Role,
  TextChannel,
  ThreadChannel,
  PermissionFlagsBits,
  ChannelType,
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

// ==================== PERMISSION FUNCTIONS ====================

/**
 * has_permission(member, permission)
 * Check if a member has a specific permission
 * Permissions: "Administrator", "ManageGuild", "ManageRoles", "ManageChannels",
 *              "KickMembers", "BanMembers", "ManageMessages", "SendMessages", etc.
 */
export const hasPermission = makeNativeFunction('has_permission', async (args: RuntimeValue[]) => {
  if (args.length !== 2) {
    throw new RuntimeError(`has_permission() expects 2 arguments, got ${args.length}`);
  }

  const member = getRawValue(args[0]) as GuildMember;
  if (!member || !member.permissions) {
    throw new RuntimeError('Invalid member object');
  }

  if (!isString(args[1])) {
    throw new TypeError('Permission name must be a string');
  }

  const permissionName = args[1].value;

  // Map permission names to PermissionFlagsBits
  const permissionMap: { [key: string]: bigint } = {
    Administrator: PermissionFlagsBits.Administrator,
    ManageGuild: PermissionFlagsBits.ManageGuild,
    ManageRoles: PermissionFlagsBits.ManageRoles,
    ManageChannels: PermissionFlagsBits.ManageChannels,
    KickMembers: PermissionFlagsBits.KickMembers,
    BanMembers: PermissionFlagsBits.BanMembers,
    ManageMessages: PermissionFlagsBits.ManageMessages,
    SendMessages: PermissionFlagsBits.SendMessages,
    EmbedLinks: PermissionFlagsBits.EmbedLinks,
    AttachFiles: PermissionFlagsBits.AttachFiles,
    ReadMessageHistory: PermissionFlagsBits.ReadMessageHistory,
    MentionEveryone: PermissionFlagsBits.MentionEveryone,
    UseExternalEmojis: PermissionFlagsBits.UseExternalEmojis,
    ViewChannel: PermissionFlagsBits.ViewChannel,
    Connect: PermissionFlagsBits.Connect,
    Speak: PermissionFlagsBits.Speak,
    MuteMembers: PermissionFlagsBits.MuteMembers,
    DeafenMembers: PermissionFlagsBits.DeafenMembers,
    MoveMembers: PermissionFlagsBits.MoveMembers,
    ManageNicknames: PermissionFlagsBits.ManageNicknames,
    ManageWebhooks: PermissionFlagsBits.ManageWebhooks,
    ManageEmojisAndStickers: PermissionFlagsBits.ManageEmojisAndStickers,
    ManageThreads: PermissionFlagsBits.ManageThreads,
    CreatePublicThreads: PermissionFlagsBits.CreatePublicThreads,
    CreatePrivateThreads: PermissionFlagsBits.CreatePrivateThreads,
    SendMessagesInThreads: PermissionFlagsBits.SendMessagesInThreads,
    ModerateMembers: PermissionFlagsBits.ModerateMembers,
  };

  const permission = permissionMap[permissionName];
  if (!permission) {
    throw new RuntimeError(`Unknown permission: ${permissionName}`);
  }

  return makeBoolean(member.permissions.has(permission));
});

// ==================== ROLE MANAGEMENT FUNCTIONS ====================

/**
 * create_role(guild, name, options)
 * Create a new role
 * options = {color: number, hoist: bool, mentionable: bool, permissions: array}
 */
export const createRole = makeNativeFunction('create_role', async (args: RuntimeValue[]) => {
  if (args.length < 2) {
    throw new RuntimeError(`create_role() expects at least 2 arguments, got ${args.length}`);
  }

  const guild = getRawValue(args[0]) as Guild;
  if (!guild || !guild.roles) {
    throw new RuntimeError('Invalid guild object');
  }

  if (!isString(args[1])) {
    throw new TypeError('Role name must be a string');
  }

  const name = args[1].value;
  const roleOptions: any = { name };

  // Parse options if provided
  if (args.length >= 3 && isObject(args[2])) {
    const options = args[2];

    const color = options.properties.get('color');
    if (color && isNumber(color)) {
      roleOptions.color = color.value;
    }

    const hoist = options.properties.get('hoist');
    if (hoist && isBoolean(hoist)) {
      roleOptions.hoist = hoist.value;
    }

    const mentionable = options.properties.get('mentionable');
    if (mentionable && isBoolean(mentionable)) {
      roleOptions.mentionable = mentionable.value;
    }
  }

  const role = await guild.roles.create(roleOptions);

  const properties = new Map<string, RuntimeValue>();
  properties.set('__raw', { __rawValue: role } as any);
  properties.set('id', makeString(role.id));
  properties.set('name', makeString(role.name));

  return makeObject(properties);
});

/**
 * edit_role(role, options)
 * Edit a role
 * options = {name: string, color: number, hoist: bool, mentionable: bool}
 */
export const editRole = makeNativeFunction('edit_role', async (args: RuntimeValue[]) => {
  if (args.length !== 2) {
    throw new RuntimeError(`edit_role() expects 2 arguments, got ${args.length}`);
  }

  const role = getRawValue(args[0]) as Role;
  if (!role || !role.edit) {
    throw new RuntimeError('Invalid role object');
  }

  if (!isObject(args[1])) {
    throw new TypeError('Options must be an object');
  }

  const options = args[1];
  const editOptions: any = {};

  const name = options.properties.get('name');
  if (name && isString(name)) {
    editOptions.name = name.value;
  }

  const color = options.properties.get('color');
  if (color && isNumber(color)) {
    editOptions.color = color.value;
  }

  const hoist = options.properties.get('hoist');
  if (hoist && isBoolean(hoist)) {
    editOptions.hoist = hoist.value;
  }

  const mentionable = options.properties.get('mentionable');
  if (mentionable && isBoolean(mentionable)) {
    editOptions.mentionable = mentionable.value;
  }

  await role.edit(editOptions);
  return makeBoolean(true);
});

/**
 * delete_role(role)
 * Delete a role
 */
export const deleteRole = makeNativeFunction('delete_role', async (args: RuntimeValue[]) => {
  if (args.length !== 1) {
    throw new RuntimeError(`delete_role() expects 1 argument, got ${args.length}`);
  }

  const role = getRawValue(args[0]) as Role;
  if (!role || !role.delete) {
    throw new RuntimeError('Invalid role object');
  }

  await role.delete();
  return makeBoolean(true);
});

/**
 * add_role_to_member(member, role)
 * Add a role to a member
 */
export const addRoleToMember = makeNativeFunction('add_role_to_member', async (args: RuntimeValue[]) => {
  if (args.length !== 2) {
    throw new RuntimeError(`add_role_to_member() expects 2 arguments, got ${args.length}`);
  }

  const member = getRawValue(args[0]) as GuildMember;
  const role = getRawValue(args[1]) as Role;

  if (!member || !member.roles) {
    throw new RuntimeError('Invalid member object');
  }
  if (!role) {
    throw new RuntimeError('Invalid role object');
  }

  await member.roles.add(role);
  return makeBoolean(true);
});

/**
 * remove_role_from_member(member, role)
 * Remove a role from a member
 */
export const removeRoleFromMember = makeNativeFunction('remove_role_from_member', async (args: RuntimeValue[]) => {
  if (args.length !== 2) {
    throw new RuntimeError(`remove_role_from_member() expects 2 arguments, got ${args.length}`);
  }

  const member = getRawValue(args[0]) as GuildMember;
  const role = getRawValue(args[1]) as Role;

  if (!member || !member.roles) {
    throw new RuntimeError('Invalid member object');
  }
  if (!role) {
    throw new RuntimeError('Invalid role object');
  }

  await member.roles.remove(role);
  return makeBoolean(true);
});

// ==================== MEMBER MANAGEMENT FUNCTIONS ====================

/**
 * kick_member(member, reason)
 * Kick a member from the guild
 */
export const kickMember = makeNativeFunction('kick_member', async (args: RuntimeValue[]) => {
  if (args.length < 1) {
    throw new RuntimeError(`kick_member() expects at least 1 argument, got ${args.length}`);
  }

  const member = getRawValue(args[0]) as GuildMember;
  if (!member || !member.kick) {
    throw new RuntimeError('Invalid member object');
  }

  const reason = args.length >= 2 && isString(args[1]) ? args[1].value : undefined;

  await member.kick(reason);
  return makeBoolean(true);
});

/**
 * ban_member(member, reason, deleteMessageDays)
 * Ban a member from the guild
 */
export const banMember = makeNativeFunction('ban_member', async (args: RuntimeValue[]) => {
  if (args.length < 1) {
    throw new RuntimeError(`ban_member() expects at least 1 argument, got ${args.length}`);
  }

  const member = getRawValue(args[0]) as GuildMember;
  if (!member || !member.ban) {
    throw new RuntimeError('Invalid member object');
  }

  const reason = args.length >= 2 && isString(args[1]) ? args[1].value : undefined;
  const deleteMessageDays = args.length >= 3 && isNumber(args[2]) ? args[2].value : 0;

  await member.ban({ reason, deleteMessageDays });
  return makeBoolean(true);
});

/**
 * timeout_member(member, duration, reason)
 * Timeout a member (duration in seconds)
 */
export const timeoutMember = makeNativeFunction('timeout_member', async (args: RuntimeValue[]) => {
  if (args.length < 2) {
    throw new RuntimeError(`timeout_member() expects at least 2 arguments, got ${args.length}`);
  }

  const member = getRawValue(args[0]) as GuildMember;
  if (!member || !member.timeout) {
    throw new RuntimeError('Invalid member object');
  }

  if (!isNumber(args[1])) {
    throw new TypeError('Duration must be a number');
  }

  const duration = args[1].value * 1000; // Convert to milliseconds
  const reason = args.length >= 3 && isString(args[2]) ? args[2].value : undefined;

  await member.timeout(duration, reason);
  return makeBoolean(true);
});

/**
 * fetch_member(guild, userId)
 * Fetch a member by user ID
 */
export const fetchMember = makeNativeFunction('fetch_member', async (args: RuntimeValue[]) => {
  if (args.length !== 2) {
    throw new RuntimeError(`fetch_member() expects 2 arguments, got ${args.length}`);
  }

  const guild = getRawValue(args[0]) as Guild;
  if (!guild || !guild.members) {
    throw new RuntimeError('Invalid guild object');
  }

  if (!isString(args[1])) {
    throw new TypeError('User ID must be a string');
  }

  const member = await guild.members.fetch(args[1].value);

  const properties = new Map<string, RuntimeValue>();
  properties.set('__raw', { __rawValue: member } as any);
  properties.set('id', makeString(member.id));
  properties.set('nickname', makeString(member.nickname || ''));

  return makeObject(properties);
});

// ==================== CHANNEL MANAGEMENT FUNCTIONS ====================

/**
 * create_channel(guild, name, type, options)
 * Create a new channel
 * type: "text" | "voice" | "announcement" | "category"
 * options = {parent: categoryId, topic: string, nsfw: bool}
 */
export const createChannel = makeNativeFunction('create_channel', async (args: RuntimeValue[]) => {
  if (args.length < 3) {
    throw new RuntimeError(`create_channel() expects at least 3 arguments, got ${args.length}`);
  }

  const guild = getRawValue(args[0]) as Guild;
  if (!guild || !guild.channels) {
    throw new RuntimeError('Invalid guild object');
  }

  if (!isString(args[1]) || !isString(args[2])) {
    throw new TypeError('Name and type must be strings');
  }

  const name = args[1].value;
  const typeStr = args[2].value.toLowerCase();

  // Map type string to ChannelType
  const typeMap: { [key: string]: ChannelType } = {
    text: ChannelType.GuildText,
    voice: ChannelType.GuildVoice,
    announcement: ChannelType.GuildAnnouncement,
    category: ChannelType.GuildCategory,
    stage: ChannelType.GuildStageVoice,
    forum: ChannelType.GuildForum,
  };

  const type = typeMap[typeStr];
  if (type === undefined) {
    throw new RuntimeError(`Invalid channel type: ${typeStr}`);
  }

  const channelOptions: any = { name, type };

  // Parse options if provided
  if (args.length >= 4 && isObject(args[3])) {
    const options = args[3];

    const parent = options.properties.get('parent');
    if (parent && isString(parent)) {
      channelOptions.parent = parent.value;
    }

    const topic = options.properties.get('topic');
    if (topic && isString(topic)) {
      channelOptions.topic = topic.value;
    }

    const nsfw = options.properties.get('nsfw');
    if (nsfw && isBoolean(nsfw)) {
      channelOptions.nsfw = nsfw.value;
    }
  }

  const channel = await guild.channels.create(channelOptions);

  const properties = new Map<string, RuntimeValue>();
  properties.set('__raw', { __rawValue: channel } as any);
  properties.set('id', makeString(channel.id));
  properties.set('name', makeString(channel.name));

  return makeObject(properties);
});

/**
 * edit_channel(channel, options)
 * Edit a channel
 * options = {name: string, topic: string, nsfw: bool}
 */
export const editChannel = makeNativeFunction('edit_channel', async (args: RuntimeValue[]) => {
  if (args.length !== 2) {
    throw new RuntimeError(`edit_channel() expects 2 arguments, got ${args.length}`);
  }

  const channel = getRawValue(args[0]);
  if (!channel || !channel.edit) {
    throw new RuntimeError('Invalid channel object');
  }

  if (!isObject(args[1])) {
    throw new TypeError('Options must be an object');
  }

  const options = args[1];
  const editOptions: any = {};

  const name = options.properties.get('name');
  if (name && isString(name)) {
    editOptions.name = name.value;
  }

  const topic = options.properties.get('topic');
  if (topic && isString(topic)) {
    editOptions.topic = topic.value;
  }

  const nsfw = options.properties.get('nsfw');
  if (nsfw && isBoolean(nsfw)) {
    editOptions.nsfw = nsfw.value;
  }

  await channel.edit(editOptions);
  return makeBoolean(true);
});

/**
 * delete_channel(channel)
 * Delete a channel
 */
export const deleteChannel = makeNativeFunction('delete_channel', async (args: RuntimeValue[]) => {
  if (args.length !== 1) {
    throw new RuntimeError(`delete_channel() expects 1 argument, got ${args.length}`);
  }

  const channel = getRawValue(args[0]);
  if (!channel || !channel.delete) {
    throw new RuntimeError('Invalid channel object');
  }

  await channel.delete();
  return makeBoolean(true);
});

// ==================== THREAD FUNCTIONS ====================

/**
 * create_thread(channel, name, options)
 * Create a thread in a channel
 * options = {autoArchiveDuration: number, reason: string}
 */
export const createThread = makeNativeFunction('create_thread', async (args: RuntimeValue[]) => {
  if (args.length < 2) {
    throw new RuntimeError(`create_thread() expects at least 2 arguments, got ${args.length}`);
  }

  const channel = getRawValue(args[0]) as TextChannel;
  if (!channel || !channel.threads) {
    throw new RuntimeError('Invalid channel object');
  }

  if (!isString(args[1])) {
    throw new TypeError('Thread name must be a string');
  }

  const name = args[1].value;
  const threadOptions: any = { name };

  // Parse options if provided
  if (args.length >= 3 && isObject(args[2])) {
    const options = args[2];

    const autoArchiveDuration = options.properties.get('autoArchiveDuration');
    if (autoArchiveDuration && isNumber(autoArchiveDuration)) {
      threadOptions.autoArchiveDuration = autoArchiveDuration.value;
    }

    const reason = options.properties.get('reason');
    if (reason && isString(reason)) {
      threadOptions.reason = reason.value;
    }
  }

  const thread = await channel.threads.create(threadOptions);

  const properties = new Map<string, RuntimeValue>();
  properties.set('__raw', { __rawValue: thread } as any);
  properties.set('id', makeString(thread.id));
  properties.set('name', makeString(thread.name));

  return makeObject(properties);
});

/**
 * archive_thread(thread)
 * Archive a thread
 */
export const archiveThread = makeNativeFunction('archive_thread', async (args: RuntimeValue[]) => {
  if (args.length !== 1) {
    throw new RuntimeError(`archive_thread() expects 1 argument, got ${args.length}`);
  }

  const thread = getRawValue(args[0]) as ThreadChannel;
  if (!thread || !thread.setArchived) {
    throw new RuntimeError('Invalid thread object');
  }

  await thread.setArchived(true);
  return makeBoolean(true);
});

/**
 * unarchive_thread(thread)
 * Unarchive a thread
 */
export const unarchiveThread = makeNativeFunction('unarchive_thread', async (args: RuntimeValue[]) => {
  if (args.length !== 1) {
    throw new RuntimeError(`unarchive_thread() expects 1 argument, got ${args.length}`);
  }

  const thread = getRawValue(args[0]) as ThreadChannel;
  if (!thread || !thread.setArchived) {
    throw new RuntimeError('Invalid thread object');
  }

  await thread.setArchived(false);
  return makeBoolean(true);
});

/**
 * lock_thread(thread)
 * Lock a thread
 */
export const lockThread = makeNativeFunction('lock_thread', async (args: RuntimeValue[]) => {
  if (args.length !== 1) {
    throw new RuntimeError(`lock_thread() expects 1 argument, got ${args.length}`);
  }

  const thread = getRawValue(args[0]) as ThreadChannel;
  if (!thread || !thread.setLocked) {
    throw new RuntimeError('Invalid thread object');
  }

  await thread.setLocked(true);
  return makeBoolean(true);
});

// Export all advanced Discord functions
export const advancedDiscordBuiltins = {
  // Permissions
  has_permission: hasPermission,

  // Role Management
  create_role: createRole,
  edit_role: editRole,
  delete_role: deleteRole,
  add_role_to_member: addRoleToMember,
  remove_role_from_member: removeRoleFromMember,

  // Member Management
  kick_member: kickMember,
  ban_member: banMember,
  timeout_member: timeoutMember,
  fetch_member: fetchMember,

  // Channel Management
  create_channel: createChannel,
  edit_channel: editChannel,
  delete_channel: deleteChannel,

  // Thread Management
  create_thread: createThread,
  archive_thread: archiveThread,
  unarchive_thread: unarchiveThread,
  lock_thread: lockThread,
};
