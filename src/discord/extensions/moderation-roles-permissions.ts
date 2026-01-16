/**
 * Moderation, Roles, and Permissions
 * Complete moderation, role management, and permission operations
 */

import {
  Client,
  GuildChannel,
  PermissionsBitField,
  AuditLogEvent,
} from 'discord.js';
import { RuntimeValue, makeNativeFunction, makeBoolean, makeNull, makeString, makeNumber, makeArray, makeRuntimeObject, isString, isNumber, isObject, isArray } from '../../core/runtime/values';
import { RuntimeError, TypeError } from '../../utils/errors';

// ==================== MODERATION FUNCTIONS ====================

/**
 * Ban a member from a guild
 */
export const banMember = makeNativeFunction('ban_member', async (args: RuntimeValue[]) => {
  if (args.length < 2) {
    throw new RuntimeError('ban_member() expects at least 2 arguments: guild, user_id, [reason], [delete_message_days]');
  }

  if (!isObject(args[0])) {
    throw new TypeError('Guild must be an object');
  }

  if (!isString(args[1])) {
    throw new TypeError('User ID must be a string');
  }

  const guildObj = (args[0] as any).properties;
  const guildId = guildObj.get('id');
  const client = guildObj.get('_client');

  if (!guildId || !client || client.type !== 'native') {
    throw new RuntimeError('Invalid guild object');
  }

  const discordClient = client.value as Client;
  const guild = await discordClient.guilds.fetch((guildId as any).value);
  const userId = (args[1] as any).value;
  const reason = args.length > 2 && isString(args[2]) ? (args[2] as any).value : 'No reason provided';
  const deleteMessageDays = args.length > 3 && isNumber(args[3]) ? (args[3] as any).value : 0;

  try {
    await guild.members.ban(userId, {
      reason,
      deleteMessageSeconds: deleteMessageDays * 86400, // Convert days to seconds
    });

    return makeBoolean(true);
  } catch (error) {
    throw new RuntimeError(`Failed to ban member: ${error instanceof Error ? error.message : String(error)}`);
  }
});

/**
 * Unban a member from a guild
 */
export const unbanMember = makeNativeFunction('unban_member', async (args: RuntimeValue[]) => {
  if (args.length < 2) {
    throw new RuntimeError('unban_member() expects at least 2 arguments: guild, user_id, [reason]');
  }

  if (!isObject(args[0])) {
    throw new TypeError('Guild must be an object');
  }

  if (!isString(args[1])) {
    throw new TypeError('User ID must be a string');
  }

  const guildObj = (args[0] as any).properties;
  const guildId = guildObj.get('id');
  const client = guildObj.get('_client');

  if (!guildId || !client || client.type !== 'native') {
    throw new RuntimeError('Invalid guild object');
  }

  const discordClient = client.value as Client;
  const guild = await discordClient.guilds.fetch((guildId as any).value);
  const userId = (args[1] as any).value;
  const reason = args.length > 2 && isString(args[2]) ? (args[2] as any).value : 'No reason provided';

  try {
    await guild.members.unban(userId, reason);
    return makeBoolean(true);
  } catch (error) {
    throw new RuntimeError(`Failed to unban member: ${error instanceof Error ? error.message : String(error)}`);
  }
});

/**
 * Get a specific ban from a guild
 */
export const getBan = makeNativeFunction('get_ban', async (args: RuntimeValue[]) => {
  if (args.length !== 2) {
    throw new RuntimeError('get_ban() expects 2 arguments: guild, user_id');
  }

  if (!isObject(args[0])) {
    throw new TypeError('Guild must be an object');
  }

  if (!isString(args[1])) {
    throw new TypeError('User ID must be a string');
  }

  const guildObj = (args[0] as any).properties;
  const guildId = guildObj.get('id');
  const client = guildObj.get('_client');

  if (!guildId || !client || client.type !== 'native') {
    throw new RuntimeError('Invalid guild object');
  }

  const discordClient = client.value as Client;
  const guild = await discordClient.guilds.fetch((guildId as any).value);
  const userId = (args[1] as any).value;

  try {
    const ban = await guild.bans.fetch(userId);

    return makeRuntimeObject([
      ['user_id', makeString(ban.user.id)],
      ['username', makeString(ban.user.username)],
      ['reason', makeString(ban.reason || 'No reason provided')],
    ]);
  } catch (error) {
    throw new RuntimeError(`Failed to get ban: ${error instanceof Error ? error.message : String(error)}`);
  }
});

/**
 * Get all bans from a guild
 */
export const getBans = makeNativeFunction('get_bans', async (args: RuntimeValue[]) => {
  if (args.length < 1) {
    throw new RuntimeError('get_bans() expects at least 1 argument: guild, [options]');
  }

  if (!isObject(args[0])) {
    throw new TypeError('Guild must be an object');
  }

  const guildObj = (args[0] as any).properties;
  const guildId = guildObj.get('id');
  const client = guildObj.get('_client');

  if (!guildId || !client || client.type !== 'native') {
    throw new RuntimeError('Invalid guild object');
  }

  const discordClient = client.value as Client;
  const guild = await discordClient.guilds.fetch((guildId as any).value);

  try {
    const bans = await guild.bans.fetch();
    const bansArray: RuntimeValue[] = [];

    for (const ban of bans.values()) {
      bansArray.push(makeRuntimeObject([
        ['user_id', makeString(ban.user.id)],
        ['username', makeString(ban.user.username)],
        ['reason', makeString(ban.reason || 'No reason provided')],
      ]));
    }

    return makeArray(bansArray);
  } catch (error) {
    throw new RuntimeError(`Failed to get bans: ${error instanceof Error ? error.message : String(error)}`);
  }
});

/**
 * Bulk ban multiple members
 */
export const bulkBanMembers = makeNativeFunction('bulk_ban_members', async (args: RuntimeValue[]) => {
  if (args.length < 2) {
    throw new RuntimeError('bulk_ban_members() expects at least 2 arguments: guild, user_ids[], [reason]');
  }

  if (!isObject(args[0])) {
    throw new TypeError('Guild must be an object');
  }

  if (!isArray(args[1])) {
    throw new TypeError('User IDs must be an array');
  }

  const guildObj = (args[0] as any).properties;
  const guildId = guildObj.get('id');
  const client = guildObj.get('_client');

  if (!guildId || !client || client.type !== 'native') {
    throw new RuntimeError('Invalid guild object');
  }

  const discordClient = client.value as Client;
  const guild = await discordClient.guilds.fetch((guildId as any).value);
  const userIds = (args[1] as any).elements;
  const reason = args.length > 2 && isString(args[2]) ? (args[2] as any).value : 'Bulk ban';

  const results: RuntimeValue[] = [];

  for (const userIdVal of userIds) {
    if (!isString(userIdVal)) {
      continue;
    }

    const userId = (userIdVal as any).value;

    try {
      await guild.members.ban(userId, { reason });
      results.push(makeRuntimeObject([
        ['user_id', makeString(userId)],
        ['success', makeBoolean(true)],
        ['error', makeNull()],
      ]));
    } catch (error) {
      results.push(makeRuntimeObject([
        ['user_id', makeString(userId)],
        ['success', makeBoolean(false)],
        ['error', makeString(error instanceof Error ? error.message : String(error))],
      ]));
    }
  }

  return makeArray(results);
});

/**
 * Timeout a member
 */
export const timeoutMember = makeNativeFunction('timeout_member', async (args: RuntimeValue[]) => {
  if (args.length < 3) {
    throw new RuntimeError('timeout_member() expects at least 3 arguments: guild, user_id, duration, [reason]');
  }

  if (!isObject(args[0])) {
    throw new TypeError('Guild must be an object');
  }

  if (!isString(args[1])) {
    throw new TypeError('User ID must be a string');
  }

  if (!isNumber(args[2])) {
    throw new TypeError('Duration must be a number (in seconds)');
  }

  const guildObj = (args[0] as any).properties;
  const guildId = guildObj.get('id');
  const client = guildObj.get('_client');

  if (!guildId || !client || client.type !== 'native') {
    throw new RuntimeError('Invalid guild object');
  }

  const discordClient = client.value as Client;
  const guild = await discordClient.guilds.fetch((guildId as any).value);
  const userId = (args[1] as any).value;
  const duration = (args[2] as any).value * 1000; // Convert seconds to milliseconds
  const reason = args.length > 3 && isString(args[3]) ? (args[3] as any).value : 'No reason provided';

  try {
    const member = await guild.members.fetch(userId);
    await member.timeout(duration, reason);

    return makeBoolean(true);
  } catch (error) {
    throw new RuntimeError(`Failed to timeout member: ${error instanceof Error ? error.message : String(error)}`);
  }
});

/**
 * Remove timeout from a member
 */
export const removeTimeout = makeNativeFunction('remove_timeout', async (args: RuntimeValue[]) => {
  if (args.length < 2) {
    throw new RuntimeError('remove_timeout() expects at least 2 arguments: guild, user_id, [reason]');
  }

  if (!isObject(args[0])) {
    throw new TypeError('Guild must be an object');
  }

  if (!isString(args[1])) {
    throw new TypeError('User ID must be a string');
  }

  const guildObj = (args[0] as any).properties;
  const guildId = guildObj.get('id');
  const client = guildObj.get('_client');

  if (!guildId || !client || client.type !== 'native') {
    throw new RuntimeError('Invalid guild object');
  }

  const discordClient = client.value as Client;
  const guild = await discordClient.guilds.fetch((guildId as any).value);
  const userId = (args[1] as any).value;
  const reason = args.length > 2 && isString(args[2]) ? (args[2] as any).value : 'No reason provided';

  try {
    const member = await guild.members.fetch(userId);
    await member.timeout(null, reason);

    return makeBoolean(true);
  } catch (error) {
    throw new RuntimeError(`Failed to remove timeout: ${error instanceof Error ? error.message : String(error)}`);
  }
});

/**
 * Kick a member from a guild
 */
export const kickMember = makeNativeFunction('kick_member', async (args: RuntimeValue[]) => {
  if (args.length < 2) {
    throw new RuntimeError('kick_member() expects at least 2 arguments: guild, user_id, [reason]');
  }

  if (!isObject(args[0])) {
    throw new TypeError('Guild must be an object');
  }

  if (!isString(args[1])) {
    throw new TypeError('User ID must be a string');
  }

  const guildObj = (args[0] as any).properties;
  const guildId = guildObj.get('id');
  const client = guildObj.get('_client');

  if (!guildId || !client || client.type !== 'native') {
    throw new RuntimeError('Invalid guild object');
  }

  const discordClient = client.value as Client;
  const guild = await discordClient.guilds.fetch((guildId as any).value);
  const userId = (args[1] as any).value;
  const reason = args.length > 2 && isString(args[2]) ? (args[2] as any).value : 'No reason provided';

  try {
    const member = await guild.members.fetch(userId);
    await member.kick(reason);

    return makeBoolean(true);
  } catch (error) {
    throw new RuntimeError(`Failed to kick member: ${error instanceof Error ? error.message : String(error)}`);
  }
});

/**
 * Get filtered audit logs
 */
export const getAuditLogsFiltered = makeNativeFunction('get_audit_logs_filtered', async (args: RuntimeValue[]) => {
  if (args.length < 1) {
    throw new RuntimeError('get_audit_logs_filtered() expects at least 1 argument: guild, [options]');
  }

  if (!isObject(args[0])) {
    throw new TypeError('Guild must be an object');
  }

  const guildObj = (args[0] as any).properties;
  const guildId = guildObj.get('id');
  const client = guildObj.get('_client');

  if (!guildId || !client || client.type !== 'native') {
    throw new RuntimeError('Invalid guild object');
  }

  const discordClient = client.value as Client;
  const guild = await discordClient.guilds.fetch((guildId as any).value);

  const options = args.length > 1 && isObject(args[1]) ? (args[1] as any).properties : new Map();

  const fetchOptions: any = {};

  const limit = options.get('limit');
  if (limit && isNumber(limit)) {
    fetchOptions.limit = (limit as any).value;
  }

  const userId = options.get('user_id');
  if (userId && isString(userId)) {
    fetchOptions.user = (userId as any).value;
  }

  const actionType = options.get('action_type');
  if (actionType && isString(actionType)) {
    const actionTypeStr = (actionType as any).value.toUpperCase();
    // Map common action types to AuditLogEvent enum
    const actionMap: { [key: string]: AuditLogEvent } = {
      'MEMBER_BAN_ADD': AuditLogEvent.MemberBanAdd,
      'MEMBER_BAN_REMOVE': AuditLogEvent.MemberBanRemove,
      'MEMBER_KICK': AuditLogEvent.MemberKick,
      'MEMBER_UPDATE': AuditLogEvent.MemberUpdate,
      'MEMBER_ROLE_UPDATE': AuditLogEvent.MemberRoleUpdate,
      'CHANNEL_CREATE': AuditLogEvent.ChannelCreate,
      'CHANNEL_DELETE': AuditLogEvent.ChannelDelete,
      'CHANNEL_UPDATE': AuditLogEvent.ChannelUpdate,
      'MESSAGE_DELETE': AuditLogEvent.MessageDelete,
    };

    if (actionMap[actionTypeStr]) {
      fetchOptions.type = actionMap[actionTypeStr];
    }
  }

  try {
    const auditLogs = await guild.fetchAuditLogs(fetchOptions);
    const logsArray: RuntimeValue[] = [];

    for (const entry of auditLogs.entries.values()) {
      logsArray.push(makeRuntimeObject([
        ['id', makeString(entry.id)],
        ['action', makeString(entry.action.toString())],
        ['executor_id', makeString(entry.executor?.id || '')],
        ['executor_name', makeString(entry.executor?.username || 'Unknown')],
        ['target_id', makeString(entry.targetId || '')],
        ['reason', makeString(entry.reason || 'No reason provided')],
        ['created_timestamp', makeNumber(entry.createdTimestamp)],
      ]));
    }

    return makeArray(logsArray);
  } catch (error) {
    throw new RuntimeError(`Failed to get audit logs: ${error instanceof Error ? error.message : String(error)}`);
  }
});

// ==================== ROLE FUNCTIONS ====================

/**
 * Create a role with optional icon
 */
export const createRoleWithIcon = makeNativeFunction('create_role_with_icon', async (args: RuntimeValue[]) => {
  if (args.length < 2) {
    throw new RuntimeError('create_role_with_icon() expects at least 2 arguments: guild, name, [color], [icon]');
  }

  if (!isObject(args[0])) {
    throw new TypeError('Guild must be an object');
  }

  if (!isString(args[1])) {
    throw new TypeError('Role name must be a string');
  }

  const guildObj = (args[0] as any).properties;
  const guildId = guildObj.get('id');
  const client = guildObj.get('_client');

  if (!guildId || !client || client.type !== 'native') {
    throw new RuntimeError('Invalid guild object');
  }

  const discordClient = client.value as Client;
  const guild = await discordClient.guilds.fetch((guildId as any).value);
  const name = (args[1] as any).value;

  const roleData: any = { name };

  if (args.length > 2 && isNumber(args[2])) {
    roleData.color = (args[2] as any).value;
  }

  if (args.length > 3 && isString(args[3])) {
    roleData.icon = (args[3] as any).value;
  }

  try {
    const role = await guild.roles.create({
      ...roleData,
      reason: 'Created via EzLang',
    });

    return makeRuntimeObject([
      ['id', makeString(role.id)],
      ['name', makeString(role.name)],
      ['color', makeNumber(role.color)],
      ['position', makeNumber(role.position)],
      ['_client', { type: 'native', value: discordClient } as any],
    ]);
  } catch (error) {
    throw new RuntimeError(`Failed to create role: ${error instanceof Error ? error.message : String(error)}`);
  }
});

/**
 * Set role position
 */
export const setRolePosition = makeNativeFunction('set_role_position', async (args: RuntimeValue[]) => {
  if (args.length !== 3) {
    throw new RuntimeError('set_role_position() expects 3 arguments: guild, role_id, position');
  }

  if (!isObject(args[0])) {
    throw new TypeError('Guild must be an object');
  }

  if (!isString(args[1])) {
    throw new TypeError('Role ID must be a string');
  }

  if (!isNumber(args[2])) {
    throw new TypeError('Position must be a number');
  }

  const guildObj = (args[0] as any).properties;
  const guildId = guildObj.get('id');
  const client = guildObj.get('_client');

  if (!guildId || !client || client.type !== 'native') {
    throw new RuntimeError('Invalid guild object');
  }

  const discordClient = client.value as Client;
  const guild = await discordClient.guilds.fetch((guildId as any).value);
  const roleId = (args[1] as any).value;
  const position = (args[2] as any).value;

  try {
    const role = await guild.roles.fetch(roleId);
    if (!role) {
      throw new RuntimeError('Role not found');
    }

    await role.setPosition(position);
    return makeBoolean(true);
  } catch (error) {
    throw new RuntimeError(`Failed to set role position: ${error instanceof Error ? error.message : String(error)}`);
  }
});

/**
 * Reorder multiple roles
 */
export const reorderRoles = makeNativeFunction('reorder_roles', async (args: RuntimeValue[]) => {
  if (args.length !== 2) {
    throw new RuntimeError('reorder_roles() expects 2 arguments: guild, role_positions[]');
  }

  if (!isObject(args[0])) {
    throw new TypeError('Guild must be an object');
  }

  if (!isArray(args[1])) {
    throw new TypeError('Role positions must be an array');
  }

  const guildObj = (args[0] as any).properties;
  const guildId = guildObj.get('id');
  const client = guildObj.get('_client');

  if (!guildId || !client || client.type !== 'native') {
    throw new RuntimeError('Invalid guild object');
  }

  const discordClient = client.value as Client;
  const guild = await discordClient.guilds.fetch((guildId as any).value);
  const rolePositions = (args[1] as any).elements;

  const positionData: any[] = [];

  for (const posItem of rolePositions) {
    if (!isObject(posItem)) {
      continue;
    }

    const posObj = (posItem as any).properties;
    const roleId = posObj.get('role_id');
    const position = posObj.get('position');

    if (roleId && isString(roleId) && position && isNumber(position)) {
      positionData.push({
        role: (roleId as any).value,
        position: (position as any).value,
      });
    }
  }

  try {
    await guild.roles.setPositions(positionData);
    return makeBoolean(true);
  } catch (error) {
    throw new RuntimeError(`Failed to reorder roles: ${error instanceof Error ? error.message : String(error)}`);
  }
});

/**
 * Add role to member
 */
export const addRoleToMember = makeNativeFunction('add_role_to_member', async (args: RuntimeValue[]) => {
  if (args.length !== 3) {
    throw new RuntimeError('add_role_to_member() expects 3 arguments: guild, user_id, role_id');
  }

  if (!isObject(args[0])) {
    throw new TypeError('Guild must be an object');
  }

  if (!isString(args[1])) {
    throw new TypeError('User ID must be a string');
  }

  if (!isString(args[2])) {
    throw new TypeError('Role ID must be a string');
  }

  const guildObj = (args[0] as any).properties;
  const guildId = guildObj.get('id');
  const client = guildObj.get('_client');

  if (!guildId || !client || client.type !== 'native') {
    throw new RuntimeError('Invalid guild object');
  }

  const discordClient = client.value as Client;
  const guild = await discordClient.guilds.fetch((guildId as any).value);
  const userId = (args[1] as any).value;
  const roleId = (args[2] as any).value;

  try {
    const member = await guild.members.fetch(userId);
    await member.roles.add(roleId);

    return makeBoolean(true);
  } catch (error) {
    throw new RuntimeError(`Failed to add role to member: ${error instanceof Error ? error.message : String(error)}`);
  }
});

/**
 * Remove role from member
 */
export const removeRoleFromMember = makeNativeFunction('remove_role_from_member', async (args: RuntimeValue[]) => {
  if (args.length !== 3) {
    throw new RuntimeError('remove_role_from_member() expects 3 arguments: guild, user_id, role_id');
  }

  if (!isObject(args[0])) {
    throw new TypeError('Guild must be an object');
  }

  if (!isString(args[1])) {
    throw new TypeError('User ID must be a string');
  }

  if (!isString(args[2])) {
    throw new TypeError('Role ID must be a string');
  }

  const guildObj = (args[0] as any).properties;
  const guildId = guildObj.get('id');
  const client = guildObj.get('_client');

  if (!guildId || !client || client.type !== 'native') {
    throw new RuntimeError('Invalid guild object');
  }

  const discordClient = client.value as Client;
  const guild = await discordClient.guilds.fetch((guildId as any).value);
  const userId = (args[1] as any).value;
  const roleId = (args[2] as any).value;

  try {
    const member = await guild.members.fetch(userId);
    await member.roles.remove(roleId);

    return makeBoolean(true);
  } catch (error) {
    throw new RuntimeError(`Failed to remove role from member: ${error instanceof Error ? error.message : String(error)}`);
  }
});

/**
 * Get all members with a specific role
 */
export const getRoleMembers = makeNativeFunction('get_role_members', async (args: RuntimeValue[]) => {
  if (args.length !== 2) {
    throw new RuntimeError('get_role_members() expects 2 arguments: guild, role_id');
  }

  if (!isObject(args[0])) {
    throw new TypeError('Guild must be an object');
  }

  if (!isString(args[1])) {
    throw new TypeError('Role ID must be a string');
  }

  const guildObj = (args[0] as any).properties;
  const guildId = guildObj.get('id');
  const client = guildObj.get('_client');

  if (!guildId || !client || client.type !== 'native') {
    throw new RuntimeError('Invalid guild object');
  }

  const discordClient = client.value as Client;
  const guild = await discordClient.guilds.fetch((guildId as any).value);
  const roleId = (args[1] as any).value;

  try {
    const role = await guild.roles.fetch(roleId);
    if (!role) {
      throw new RuntimeError('Role not found');
    }

    const membersArray: RuntimeValue[] = [];

    for (const member of role.members.values()) {
      membersArray.push(makeRuntimeObject([
        ['id', makeString(member.id)],
        ['username', makeString(member.user.username)],
        ['nickname', makeString(member.nickname || member.user.username)],
        ['joined_at', makeNumber(member.joinedTimestamp || 0)],
      ]));
    }

    return makeArray(membersArray);
  } catch (error) {
    throw new RuntimeError(`Failed to get role members: ${error instanceof Error ? error.message : String(error)}`);
  }
});

// ==================== PERMISSION FUNCTIONS ====================

/**
 * Calculate permissions for a member in a channel
 */
export const calculatePermissions = makeNativeFunction('calculate_permissions', async (args: RuntimeValue[]) => {
  if (args.length !== 2) {
    throw new RuntimeError('calculate_permissions() expects 2 arguments: member, channel');
  }

  if (!isObject(args[0])) {
    throw new TypeError('Member must be an object');
  }

  if (!isObject(args[1])) {
    throw new TypeError('Channel must be an object');
  }

  const memberObj = (args[0] as any).properties;
  const memberId = memberObj.get('id');
  const guildId = memberObj.get('guild_id');
  const client = memberObj.get('_client');

  const channelObj = (args[1] as any).properties;
  const channelId = channelObj.get('id');

  if (!memberId || !guildId || !channelId || !client || client.type !== 'native') {
    throw new RuntimeError('Invalid member or channel object');
  }

  const discordClient = client.value as Client;

  try {
    const guild = await discordClient.guilds.fetch((guildId as any).value);
    const member = await guild.members.fetch((memberId as any).value);
    const channel = await discordClient.channels.fetch((channelId as any).value) as GuildChannel;

    const permissions = channel.permissionsFor(member);
    if (!permissions) {
      throw new RuntimeError('Could not calculate permissions');
    }

    return makeRuntimeObject([
      ['bitfield', makeString(permissions.bitfield.toString())],
      ['administrator', makeBoolean(permissions.has(PermissionsBitField.Flags.Administrator))],
      ['manage_channels', makeBoolean(permissions.has(PermissionsBitField.Flags.ManageChannels))],
      ['manage_roles', makeBoolean(permissions.has(PermissionsBitField.Flags.ManageRoles))],
      ['manage_messages', makeBoolean(permissions.has(PermissionsBitField.Flags.ManageMessages))],
      ['send_messages', makeBoolean(permissions.has(PermissionsBitField.Flags.SendMessages))],
      ['view_channel', makeBoolean(permissions.has(PermissionsBitField.Flags.ViewChannel))],
    ]);
  } catch (error) {
    throw new RuntimeError(`Failed to calculate permissions: ${error instanceof Error ? error.message : String(error)}`);
  }
});

/**
 * Check if member has a specific permission
 */
export const hasPermission = makeNativeFunction('has_permission', async (args: RuntimeValue[]) => {
  if (args.length !== 2) {
    throw new RuntimeError('has_permission() expects 2 arguments: member, permission');
  }

  if (!isObject(args[0])) {
    throw new TypeError('Member must be an object');
  }

  if (!isString(args[1])) {
    throw new TypeError('Permission must be a string');
  }

  const memberObj = (args[0] as any).properties;
  const memberId = memberObj.get('id');
  const guildId = memberObj.get('guild_id');
  const client = memberObj.get('_client');
  const permissionName = (args[1] as any).value.toUpperCase();

  if (!memberId || !guildId || !client || client.type !== 'native') {
    throw new RuntimeError('Invalid member object');
  }

  const discordClient = client.value as Client;

  try {
    const guild = await discordClient.guilds.fetch((guildId as any).value);
    const member = await guild.members.fetch((memberId as any).value);

    // Map permission name to flag
    const permissionMap: { [key: string]: bigint } = {
      'ADMINISTRATOR': PermissionsBitField.Flags.Administrator,
      'MANAGE_CHANNELS': PermissionsBitField.Flags.ManageChannels,
      'MANAGE_ROLES': PermissionsBitField.Flags.ManageRoles,
      'MANAGE_MESSAGES': PermissionsBitField.Flags.ManageMessages,
      'SEND_MESSAGES': PermissionsBitField.Flags.SendMessages,
      'VIEW_CHANNEL': PermissionsBitField.Flags.ViewChannel,
      'BAN_MEMBERS': PermissionsBitField.Flags.BanMembers,
      'KICK_MEMBERS': PermissionsBitField.Flags.KickMembers,
      'MANAGE_GUILD': PermissionsBitField.Flags.ManageGuild,
    };

    const flag = permissionMap[permissionName];
    if (!flag) {
      throw new RuntimeError(`Unknown permission: ${permissionName}`);
    }

    return makeBoolean(member.permissions.has(flag));
  } catch (error) {
    throw new RuntimeError(`Failed to check permission: ${error instanceof Error ? error.message : String(error)}`);
  }
});

/**
 * Create permission overwrite for a channel
 */
export const createPermissionOverwrite = makeNativeFunction('create_permission_overwrite', async (args: RuntimeValue[]) => {
  if (args.length !== 4) {
    throw new RuntimeError('create_permission_overwrite() expects 4 arguments: channel, target, allow, deny');
  }

  if (!isObject(args[0])) {
    throw new TypeError('Channel must be an object');
  }

  if (!isString(args[1])) {
    throw new TypeError('Target must be a string (user/role ID)');
  }

  if (!isArray(args[2])) {
    throw new TypeError('Allow must be an array of permission strings');
  }

  if (!isArray(args[3])) {
    throw new TypeError('Deny must be an array of permission strings');
  }

  const channelObj = (args[0] as any).properties;
  const channelId = channelObj.get('id');
  const client = channelObj.get('_client');
  const target = (args[1] as any).value;
  const allowArray = (args[2] as any).elements;
  const denyArray = (args[3] as any).elements;

  if (!channelId || !client || client.type !== 'native') {
    throw new RuntimeError('Invalid channel object');
  }

  const discordClient = client.value as Client;

  // Convert permission names to bitfield
  const permissionMap: { [key: string]: bigint } = {
    'VIEW_CHANNEL': PermissionsBitField.Flags.ViewChannel,
    'SEND_MESSAGES': PermissionsBitField.Flags.SendMessages,
    'MANAGE_MESSAGES': PermissionsBitField.Flags.ManageMessages,
    'READ_MESSAGE_HISTORY': PermissionsBitField.Flags.ReadMessageHistory,
    'ATTACH_FILES': PermissionsBitField.Flags.AttachFiles,
    'CONNECT': PermissionsBitField.Flags.Connect,
    'SPEAK': PermissionsBitField.Flags.Speak,
  };

  const allowPerms: bigint[] = [];
  const denyPerms: bigint[] = [];

  for (const perm of allowArray) {
    if (isString(perm)) {
      const permName = (perm as any).value.toUpperCase();
      if (permissionMap[permName]) {
        allowPerms.push(permissionMap[permName]);
      }
    }
  }

  for (const perm of denyArray) {
    if (isString(perm)) {
      const permName = (perm as any).value.toUpperCase();
      if (permissionMap[permName]) {
        denyPerms.push(permissionMap[permName]);
      }
    }
  }

  try {
    const channel = await discordClient.channels.fetch((channelId as any).value) as GuildChannel;

    const permissions: any = {};
    allowPerms.forEach(perm => {
      permissions[perm.toString()] = true;
    });
    denyPerms.forEach(perm => {
      permissions[perm.toString()] = false;
    });

    await channel.permissionOverwrites.create(target, permissions);

    return makeBoolean(true);
  } catch (error) {
    throw new RuntimeError(`Failed to create permission overwrite: ${error instanceof Error ? error.message : String(error)}`);
  }
});

/**
 * Delete permission overwrite for a channel
 */
export const deletePermissionOverwrite = makeNativeFunction('delete_permission_overwrite', async (args: RuntimeValue[]) => {
  if (args.length !== 2) {
    throw new RuntimeError('delete_permission_overwrite() expects 2 arguments: channel, target');
  }

  if (!isObject(args[0])) {
    throw new TypeError('Channel must be an object');
  }

  if (!isString(args[1])) {
    throw new TypeError('Target must be a string (user/role ID)');
  }

  const channelObj = (args[0] as any).properties;
  const channelId = channelObj.get('id');
  const client = channelObj.get('_client');
  const target = (args[1] as any).value;

  if (!channelId || !client || client.type !== 'native') {
    throw new RuntimeError('Invalid channel object');
  }

  const discordClient = client.value as Client;

  try {
    const channel = await discordClient.channels.fetch((channelId as any).value) as GuildChannel;
    await channel.permissionOverwrites.delete(target);

    return makeBoolean(true);
  } catch (error) {
    throw new RuntimeError(`Failed to delete permission overwrite: ${error instanceof Error ? error.message : String(error)}`);
  }
});

/**
 * Get all permission overwrites for a channel
 */
export const getPermissionOverwrites = makeNativeFunction('get_permission_overwrites', async (args: RuntimeValue[]) => {
  if (args.length !== 1) {
    throw new RuntimeError('get_permission_overwrites() expects 1 argument: channel');
  }

  if (!isObject(args[0])) {
    throw new TypeError('Channel must be an object');
  }

  const channelObj = (args[0] as any).properties;
  const channelId = channelObj.get('id');
  const client = channelObj.get('_client');

  if (!channelId || !client || client.type !== 'native') {
    throw new RuntimeError('Invalid channel object');
  }

  const discordClient = client.value as Client;

  try {
    const channel = await discordClient.channels.fetch((channelId as any).value) as GuildChannel;
    const overwrites = channel.permissionOverwrites.cache;
    const overwritesArray: RuntimeValue[] = [];

    for (const overwrite of overwrites.values()) {
      overwritesArray.push(makeRuntimeObject([
        ['id', makeString(overwrite.id)],
        ['type', makeString(overwrite.type.toString())],
        ['allow', makeString(overwrite.allow.bitfield.toString())],
        ['deny', makeString(overwrite.deny.bitfield.toString())],
      ]));
    }

    return makeArray(overwritesArray);
  } catch (error) {
    throw new RuntimeError(`Failed to get permission overwrites: ${error instanceof Error ? error.message : String(error)}`);
  }
});

export const moderationRolesPermissionsBuiltins = {
  // Moderation functions
  ban_member: banMember,
  unban_member: unbanMember,
  get_ban: getBan,
  get_bans: getBans,
  bulk_ban_members: bulkBanMembers,
  timeout_member: timeoutMember,
  remove_timeout: removeTimeout,
  kick_member: kickMember,
  get_audit_logs_filtered: getAuditLogsFiltered,

  // Role functions
  create_role_with_icon: createRoleWithIcon,
  set_role_position: setRolePosition,
  reorder_roles: reorderRoles,
  add_role_to_member: addRoleToMember,
  remove_role_from_member: removeRoleFromMember,
  get_role_members: getRoleMembers,

  // Permission functions
  calculate_permissions: calculatePermissions,
  has_permission: hasPermission,
  create_permission_overwrite: createPermissionOverwrite,
  delete_permission_overwrite: deletePermissionOverwrite,
  get_permission_overwrites: getPermissionOverwrites,
};
