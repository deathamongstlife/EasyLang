/**
 * Permission Calculator for EasyLang
 * Provides advanced permission calculation and management
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
import { PermissionFlagsBits, PermissionsBitField } from 'discord.js';

/**
 * Get the Discord client from global context
 */
function getDiscordClient(): any {
  const client = (global as any).__discordClient;
  if (!client) {
    throw new RuntimeError('Discord client not initialized. Call bot_start() first.');
  }
  return client;
}

/**
 * Permission name to flag mapping
 */
const PERMISSION_FLAGS: { [key: string]: bigint } = {
  CREATE_INSTANT_INVITE: PermissionFlagsBits.CreateInstantInvite,
  KICK_MEMBERS: PermissionFlagsBits.KickMembers,
  BAN_MEMBERS: PermissionFlagsBits.BanMembers,
  ADMINISTRATOR: PermissionFlagsBits.Administrator,
  MANAGE_CHANNELS: PermissionFlagsBits.ManageChannels,
  MANAGE_GUILD: PermissionFlagsBits.ManageGuild,
  ADD_REACTIONS: PermissionFlagsBits.AddReactions,
  VIEW_AUDIT_LOG: PermissionFlagsBits.ViewAuditLog,
  PRIORITY_SPEAKER: PermissionFlagsBits.PrioritySpeaker,
  STREAM: PermissionFlagsBits.Stream,
  VIEW_CHANNEL: PermissionFlagsBits.ViewChannel,
  SEND_MESSAGES: PermissionFlagsBits.SendMessages,
  SEND_TTS_MESSAGES: PermissionFlagsBits.SendTTSMessages,
  MANAGE_MESSAGES: PermissionFlagsBits.ManageMessages,
  EMBED_LINKS: PermissionFlagsBits.EmbedLinks,
  ATTACH_FILES: PermissionFlagsBits.AttachFiles,
  READ_MESSAGE_HISTORY: PermissionFlagsBits.ReadMessageHistory,
  MENTION_EVERYONE: PermissionFlagsBits.MentionEveryone,
  USE_EXTERNAL_EMOJIS: PermissionFlagsBits.UseExternalEmojis,
  VIEW_GUILD_INSIGHTS: PermissionFlagsBits.ViewGuildInsights,
  CONNECT: PermissionFlagsBits.Connect,
  SPEAK: PermissionFlagsBits.Speak,
  MUTE_MEMBERS: PermissionFlagsBits.MuteMembers,
  DEAFEN_MEMBERS: PermissionFlagsBits.DeafenMembers,
  MOVE_MEMBERS: PermissionFlagsBits.MoveMembers,
  USE_VAD: PermissionFlagsBits.UseVAD,
  CHANGE_NICKNAME: PermissionFlagsBits.ChangeNickname,
  MANAGE_NICKNAMES: PermissionFlagsBits.ManageNicknames,
  MANAGE_ROLES: PermissionFlagsBits.ManageRoles,
  MANAGE_WEBHOOKS: PermissionFlagsBits.ManageWebhooks,
  MANAGE_GUILD_EXPRESSIONS: PermissionFlagsBits.ManageGuildExpressions,
  USE_APPLICATION_COMMANDS: PermissionFlagsBits.UseApplicationCommands,
  REQUEST_TO_SPEAK: PermissionFlagsBits.RequestToSpeak,
  MANAGE_EVENTS: PermissionFlagsBits.ManageEvents,
  MANAGE_THREADS: PermissionFlagsBits.ManageThreads,
  CREATE_PUBLIC_THREADS: PermissionFlagsBits.CreatePublicThreads,
  CREATE_PRIVATE_THREADS: PermissionFlagsBits.CreatePrivateThreads,
  USE_EXTERNAL_STICKERS: PermissionFlagsBits.UseExternalStickers,
  SEND_MESSAGES_IN_THREADS: PermissionFlagsBits.SendMessagesInThreads,
  USE_EMBEDDED_ACTIVITIES: PermissionFlagsBits.UseEmbeddedActivities,
  MODERATE_MEMBERS: PermissionFlagsBits.ModerateMembers,
  VIEW_CREATOR_MONETIZATION_ANALYTICS: PermissionFlagsBits.ViewCreatorMonetizationAnalytics,
  USE_SOUNDBOARD: PermissionFlagsBits.UseSoundboard,
  USE_EXTERNAL_SOUNDS: PermissionFlagsBits.UseExternalSounds,
  SEND_VOICE_MESSAGES: PermissionFlagsBits.SendVoiceMessages,
};

/**
 * Convert permission names array to permission flags
 */
function permissionsToFlags(permissions: string[]): bigint {
  let flags = 0n;
  for (const perm of permissions) {
    const flag = PERMISSION_FLAGS[perm.toUpperCase()];
    if (flag === undefined) {
      throw new RuntimeError(`Unknown permission: ${perm}`);
    }
    flags |= flag;
  }
  return flags;
}

/**
 * get_channel_permissions(channel_id, member_id)
 * Get effective permissions for a member in a channel
 */
export const getChannelPermissions = makeNativeFunction('get_channel_permissions', async (args: RuntimeValue[]) => {
  if (args.length !== 2) {
    throw new RuntimeError(`get_channel_permissions() expects 2 arguments (channel_id, member_id), got ${args.length}`);
  }

  if (!isString(args[0]) || !isString(args[1])) {
    throw new TypeError('Channel ID and member ID must be strings');
  }

  const channelId = args[0].value;
  const memberId = args[1].value;
  const client = getDiscordClient();

  const channel = await client.channels.fetch(channelId);
  if (!channel) {
    throw new RuntimeError('Channel not found');
  }

  if (!channel.guild) {
    throw new RuntimeError('Channel is not in a guild');
  }

  const member = await channel.guild.members.fetch(memberId);
  if (!member) {
    throw new RuntimeError('Member not found');
  }

  const permissions = channel.permissionsFor(member);
  if (!permissions) {
    throw new RuntimeError('Could not calculate permissions');
  }

  // Convert permissions to array of permission names
  const permissionArray: RuntimeValue[] = [];
  for (const [name, flag] of Object.entries(PERMISSION_FLAGS)) {
    if (permissions.has(flag)) {
      permissionArray.push(makeString(name));
    }
  }

  const result = new Map<string, RuntimeValue>();
  result.set('permissions', makeArray(permissionArray));
  result.set('bitfield', makeString(permissions.bitfield.toString()));
  result.set('has_administrator', makeBoolean(permissions.has(PermissionFlagsBits.Administrator)));

  return makeObject(result);
});

/**
 * calculate_permissions(member_id, channel_id)
 * Calculate permissions with overwrites
 */
export const calculatePermissions = makeNativeFunction('calculate_permissions', async (args: RuntimeValue[]) => {
  if (args.length !== 2) {
    throw new RuntimeError(`calculate_permissions() expects 2 arguments (member_id, channel_id), got ${args.length}`);
  }

  if (!isString(args[0]) || !isString(args[1])) {
    throw new TypeError('Member ID and channel ID must be strings');
  }

  const memberId = args[0].value;
  const channelId = args[1].value;
  const client = getDiscordClient();

  const channel = await client.channels.fetch(channelId);
  if (!channel || !channel.guild) {
    throw new RuntimeError('Channel not found or not in a guild');
  }

  const member = await channel.guild.members.fetch(memberId);
  if (!member) {
    throw new RuntimeError('Member not found');
  }

  // Get base permissions from roles
  const basePermissions = member.permissions;

  // Get channel-specific permissions
  const channelPermissions = channel.permissionsFor(member);

  // Build result
  const result = new Map<string, RuntimeValue>();

  // Base permissions (from roles)
  const basePermArray: RuntimeValue[] = [];
  for (const [name, flag] of Object.entries(PERMISSION_FLAGS)) {
    if (basePermissions.has(flag)) {
      basePermArray.push(makeString(name));
    }
  }
  result.set('base_permissions', makeArray(basePermArray));

  // Channel permissions (with overwrites)
  const channelPermArray: RuntimeValue[] = [];
  if (channelPermissions) {
    for (const [name, flag] of Object.entries(PERMISSION_FLAGS)) {
      if (channelPermissions.has(flag)) {
        channelPermArray.push(makeString(name));
      }
    }
  }
  result.set('channel_permissions', makeArray(channelPermArray));

  // Overwrites info
  const overwrites = channel.permissionOverwrites?.cache;
  const overwritesArray: RuntimeValue[] = [];
  if (overwrites) {
    overwrites.forEach((overwrite: any) => {
      const owData = new Map<string, RuntimeValue>();
      owData.set('id', makeString(overwrite.id));
      owData.set('type', makeNumber(overwrite.type));
      owData.set('allow', makeString(overwrite.allow.bitfield.toString()));
      owData.set('deny', makeString(overwrite.deny.bitfield.toString()));
      overwritesArray.push(makeObject(owData));
    });
  }
  result.set('overwrites', makeArray(overwritesArray));

  return makeObject(result);
});

/**
 * has_permissions(member_id, permissions, channel_id)
 * Check if member has all specified permissions
 * permissions: array of permission names
 */
export const hasPermissions = makeNativeFunction('has_permissions', async (args: RuntimeValue[]) => {
  if (args.length < 2 || args.length > 3) {
    throw new RuntimeError(`has_permissions() expects 2-3 arguments (member_id, permissions, [channel_id]), got ${args.length}`);
  }

  if (!isString(args[0])) {
    throw new TypeError('Member ID must be a string');
  }

  if (!isArray(args[1])) {
    throw new TypeError('Permissions must be an array');
  }

  const memberId = args[0].value;
  const permissionsArg = args[1];
  const channelId = args.length === 3 && isString(args[2]) ? args[2].value : null;
  const client = getDiscordClient();

  // Convert permissions array to permission names
  const permissionNames: string[] = [];
  for (const perm of permissionsArg.elements) {
    if (!isString(perm)) {
      throw new TypeError('Permission names must be strings');
    }
    permissionNames.push(perm.value);
  }

  let permissions: any;

  if (channelId) {
    // Check channel permissions
    const channel = await client.channels.fetch(channelId);
    if (!channel || !channel.guild) {
      throw new RuntimeError('Channel not found or not in a guild');
    }

    const member = await channel.guild.members.fetch(memberId);
    if (!member) {
      throw new RuntimeError('Member not found');
    }

    permissions = channel.permissionsFor(member);
  } else {
    // Check guild permissions (need to find member in any guild)
    let member: any = null;
    for (const [, guild] of client.guilds.cache) {
      try {
        member = await guild.members.fetch(memberId);
        if (member) {
          permissions = member.permissions;
          break;
        }
      } catch {
        continue;
      }
    }

    if (!member) {
      throw new RuntimeError('Member not found in any guild');
    }
  }

  // Check if member has all permissions
  const flags = permissionsToFlags(permissionNames);
  const hasAll = permissions.has(flags);

  // Build detailed result
  const result = new Map<string, RuntimeValue>();
  result.set('has_all', makeBoolean(hasAll));

  const detailsMap = new Map<string, RuntimeValue>();
  for (const permName of permissionNames) {
    const flag = PERMISSION_FLAGS[permName.toUpperCase()];
    detailsMap.set(permName, makeBoolean(permissions.has(flag)));
  }
  result.set('details', makeObject(detailsMap));

  return makeObject(result);
});

/**
 * create_permission_bitfield(permissions)
 * Create a permission bitfield from permission names
 */
export const createPermissionBitfield = makeNativeFunction('create_permission_bitfield', async (args: RuntimeValue[]) => {
  if (args.length !== 1) {
    throw new RuntimeError(`create_permission_bitfield() expects 1 argument (permissions), got ${args.length}`);
  }

  if (!isArray(args[0])) {
    throw new TypeError('Permissions must be an array');
  }

  const permissionsArg = args[0];
  const permissionNames: string[] = [];

  for (const perm of permissionsArg.elements) {
    if (!isString(perm)) {
      throw new TypeError('Permission names must be strings');
    }
    permissionNames.push(perm.value);
  }

  const flags = permissionsToFlags(permissionNames);
  const bitfield = new PermissionsBitField(flags);

  const result = new Map<string, RuntimeValue>();
  result.set('bitfield', makeString(bitfield.bitfield.toString()));
  result.set('value', makeString(flags.toString()));

  // List of permissions
  const permArray: RuntimeValue[] = [];
  for (const [name, flag] of Object.entries(PERMISSION_FLAGS)) {
    if (bitfield.has(flag)) {
      permArray.push(makeString(name));
    }
  }
  result.set('permissions', makeArray(permArray));

  return makeObject(result);
});

/**
 * add_permissions(bitfield, permissions)
 * Add permissions to a bitfield
 */
export const addPermissions = makeNativeFunction('add_permissions', async (args: RuntimeValue[]) => {
  if (args.length !== 2) {
    throw new RuntimeError(`add_permissions() expects 2 arguments (bitfield, permissions), got ${args.length}`);
  }

  if (!isString(args[0])) {
    throw new TypeError('Bitfield must be a string');
  }

  if (!isArray(args[1])) {
    throw new TypeError('Permissions must be an array');
  }

  const bitfieldStr = args[0].value;
  const permissionsArg = args[1];

  // Parse existing bitfield
  let existingBits: bigint;
  try {
    existingBits = BigInt(bitfieldStr);
  } catch {
    throw new RuntimeError('Invalid bitfield string');
  }

  // Convert permissions to add
  const permissionNames: string[] = [];
  for (const perm of permissionsArg.elements) {
    if (!isString(perm)) {
      throw new TypeError('Permission names must be strings');
    }
    permissionNames.push(perm.value);
  }

  const addFlags = permissionsToFlags(permissionNames);
  const newBits = existingBits | addFlags;
  const newBitfield = new PermissionsBitField(newBits);

  const result = new Map<string, RuntimeValue>();
  result.set('bitfield', makeString(newBitfield.bitfield.toString()));
  result.set('value', makeString(newBits.toString()));

  // List all permissions
  const permArray: RuntimeValue[] = [];
  for (const [name, flag] of Object.entries(PERMISSION_FLAGS)) {
    if (newBitfield.has(flag)) {
      permArray.push(makeString(name));
    }
  }
  result.set('permissions', makeArray(permArray));

  return makeObject(result);
});

/**
 * remove_permissions(bitfield, permissions)
 * Remove permissions from a bitfield
 */
export const removePermissions = makeNativeFunction('remove_permissions', async (args: RuntimeValue[]) => {
  if (args.length !== 2) {
    throw new RuntimeError(`remove_permissions() expects 2 arguments (bitfield, permissions), got ${args.length}`);
  }

  if (!isString(args[0])) {
    throw new TypeError('Bitfield must be a string');
  }

  if (!isArray(args[1])) {
    throw new TypeError('Permissions must be an array');
  }

  const bitfieldStr = args[0].value;
  const permissionsArg = args[1];

  // Parse existing bitfield
  let existingBits: bigint;
  try {
    existingBits = BigInt(bitfieldStr);
  } catch {
    throw new RuntimeError('Invalid bitfield string');
  }

  // Convert permissions to remove
  const permissionNames: string[] = [];
  for (const perm of permissionsArg.elements) {
    if (!isString(perm)) {
      throw new TypeError('Permission names must be strings');
    }
    permissionNames.push(perm.value);
  }

  const removeFlags = permissionsToFlags(permissionNames);
  const newBits = existingBits & ~removeFlags;
  const newBitfield = new PermissionsBitField(newBits);

  const result = new Map<string, RuntimeValue>();
  result.set('bitfield', makeString(newBitfield.bitfield.toString()));
  result.set('value', makeString(newBits.toString()));

  // List all permissions
  const permArray: RuntimeValue[] = [];
  for (const [name, flag] of Object.entries(PERMISSION_FLAGS)) {
    if (newBitfield.has(flag)) {
      permArray.push(makeString(name));
    }
  }
  result.set('permissions', makeArray(permArray));

  return makeObject(result);
});

// Export all permission functions
export const permissionBuiltins = {
  get_channel_permissions: getChannelPermissions,
  calculate_permissions: calculatePermissions,
  has_permissions: hasPermissions,
  create_permission_bitfield: createPermissionBitfield,
  add_permissions: addPermissions,
  remove_permissions: removePermissions,
};
