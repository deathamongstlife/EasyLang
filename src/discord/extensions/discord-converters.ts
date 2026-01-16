/**
 * Type Converter System for EasyLang
 * Provides automatic type conversion for Discord objects
 */

import {
  RuntimeValue,
  makeNativeFunction,
  makeObject,
  makeString,
  makeBoolean,
  makeNumber,
  isString,
  isFunction,
  FunctionValue,
} from '../../core/runtime/values';
import { RuntimeError, TypeError } from '../../utils/errors';

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
 * Custom converter registry
 */
interface CustomConverter {
  type: string;
  converter: FunctionValue;
}

const customConverters = new Map<string, CustomConverter>();

/**
 * Convert user/member object to RuntimeValue
 */
function memberToRuntime(member: any): RuntimeValue {
  const properties = new Map<string, RuntimeValue>();
  properties.set('__raw', { __rawValue: member } as any);
  properties.set('id', makeString(member.id || member.user?.id || ''));
  properties.set('user_id', makeString(member.user?.id || member.id || ''));
  properties.set('username', makeString(member.user?.username || member.username || ''));
  properties.set('discriminator', makeString(member.user?.discriminator || member.discriminator || '0'));
  properties.set('tag', makeString(member.user?.tag || member.tag || ''));
  properties.set('bot', makeBoolean(member.user?.bot || member.bot || false));

  if (member.nickname) {
    properties.set('nickname', makeString(member.nickname));
  }

  if (member.displayName) {
    properties.set('display_name', makeString(member.displayName));
  }

  if (member.joinedTimestamp) {
    properties.set('joined_at', makeNumber(member.joinedTimestamp));
  }

  if (member.roles) {
    const roleIds: RuntimeValue[] = [];
    if (member.roles.cache) {
      member.roles.cache.forEach((role: any) => {
        roleIds.push(makeString(role.id));
      });
    }
    properties.set('role_ids', makeString(JSON.stringify(roleIds.map((r: any) => r.value))));
  }

  return makeObject(properties);
}

/**
 * Convert channel object to RuntimeValue
 */
function channelToRuntime(channel: any): RuntimeValue {
  const properties = new Map<string, RuntimeValue>();
  properties.set('__raw', { __rawValue: channel } as any);
  properties.set('id', makeString(channel.id));
  properties.set('name', makeString(channel.name || ''));
  properties.set('type', makeNumber(channel.type));

  if (channel.guildId) {
    properties.set('guild_id', makeString(channel.guildId));
  }

  if (channel.parentId) {
    properties.set('parent_id', makeString(channel.parentId));
  }

  if (channel.topic) {
    properties.set('topic', makeString(channel.topic));
  }

  if (channel.nsfw !== undefined) {
    properties.set('nsfw', makeBoolean(channel.nsfw));
  }

  if (channel.position !== undefined) {
    properties.set('position', makeNumber(channel.position));
  }

  return makeObject(properties);
}

/**
 * Convert role object to RuntimeValue
 */
function roleToRuntime(role: any): RuntimeValue {
  const properties = new Map<string, RuntimeValue>();
  properties.set('__raw', { __rawValue: role } as any);
  properties.set('id', makeString(role.id));
  properties.set('name', makeString(role.name));
  properties.set('color', makeNumber(role.color));
  properties.set('position', makeNumber(role.position));
  properties.set('hoist', makeBoolean(role.hoist));
  properties.set('managed', makeBoolean(role.managed));
  properties.set('mentionable', makeBoolean(role.mentionable));

  if (role.permissions) {
    properties.set('permissions', makeString(role.permissions.bitfield.toString()));
  }

  return makeObject(properties);
}

/**
 * convert_to_member(value, guild_id)
 * Convert string (ID, mention, username) to Member object
 */
export const convertToMember = makeNativeFunction('convert_to_member', async (args: RuntimeValue[]) => {
  if (args.length !== 2) {
    throw new RuntimeError(`convert_to_member() expects 2 arguments (value, guild_id), got ${args.length}`);
  }

  if (!isString(args[0]) || !isString(args[1])) {
    throw new TypeError('Value and guild ID must be strings');
  }

  const value = args[0].value;
  const guildId = args[1].value;
  const client = getDiscordClient();

  const guild = await client.guilds.fetch(guildId);
  if (!guild) {
    throw new RuntimeError('Guild not found');
  }

  let member: any = null;

  // Try to parse as mention (<@!123456789> or <@123456789>)
  const mentionMatch = value.match(/^<@!?(\d+)>$/);
  if (mentionMatch) {
    const userId = mentionMatch[1];
    member = await guild.members.fetch(userId).catch(() => null);
  }

  // Try as direct ID
  if (!member && /^\d+$/.test(value)) {
    member = await guild.members.fetch(value).catch(() => null);
  }

  // Try as username or display name
  if (!member) {
    await guild.members.fetch();
    member = guild.members.cache.find((m: any) =>
      m.user.username.toLowerCase() === value.toLowerCase() ||
      m.displayName.toLowerCase() === value.toLowerCase()
    );
  }

  if (!member) {
    throw new RuntimeError(`Could not convert "${value}" to a member`);
  }

  return memberToRuntime(member);
});

/**
 * convert_to_channel(value, guild_id)
 * Convert string (ID, mention, name) to Channel object
 */
export const convertToChannel = makeNativeFunction('convert_to_channel', async (args: RuntimeValue[]) => {
  if (args.length !== 2) {
    throw new RuntimeError(`convert_to_channel() expects 2 arguments (value, guild_id), got ${args.length}`);
  }

  if (!isString(args[0]) || !isString(args[1])) {
    throw new TypeError('Value and guild ID must be strings');
  }

  const value = args[0].value;
  const guildId = args[1].value;
  const client = getDiscordClient();

  const guild = await client.guilds.fetch(guildId);
  if (!guild) {
    throw new RuntimeError('Guild not found');
  }

  let channel: any = null;

  // Try to parse as mention (<#123456789>)
  const mentionMatch = value.match(/^<#(\d+)>$/);
  if (mentionMatch) {
    const channelId = mentionMatch[1];
    channel = await guild.channels.fetch(channelId).catch(() => null);
  }

  // Try as direct ID
  if (!channel && /^\d+$/.test(value)) {
    channel = await guild.channels.fetch(value).catch(() => null);
  }

  // Try as channel name
  if (!channel) {
    channel = guild.channels.cache.find((c: any) =>
      c.name.toLowerCase() === value.toLowerCase() ||
      c.name.toLowerCase() === value.replace('#', '').toLowerCase()
    );
  }

  if (!channel) {
    throw new RuntimeError(`Could not convert "${value}" to a channel`);
  }

  return channelToRuntime(channel);
});

/**
 * convert_to_role(value, guild_id)
 * Convert string (ID, mention, name) to Role object
 */
export const convertToRole = makeNativeFunction('convert_to_role', async (args: RuntimeValue[]) => {
  if (args.length !== 2) {
    throw new RuntimeError(`convert_to_role() expects 2 arguments (value, guild_id), got ${args.length}`);
  }

  if (!isString(args[0]) || !isString(args[1])) {
    throw new TypeError('Value and guild ID must be strings');
  }

  const value = args[0].value;
  const guildId = args[1].value;
  const client = getDiscordClient();

  const guild = await client.guilds.fetch(guildId);
  if (!guild) {
    throw new RuntimeError('Guild not found');
  }

  let role: any = null;

  // Try to parse as mention (<@&123456789>)
  const mentionMatch = value.match(/^<@&(\d+)>$/);
  if (mentionMatch) {
    const roleId = mentionMatch[1];
    role = await guild.roles.fetch(roleId).catch(() => null);
  }

  // Try as direct ID
  if (!role && /^\d+$/.test(value)) {
    role = await guild.roles.fetch(value).catch(() => null);
  }

  // Try as role name
  if (!role) {
    role = guild.roles.cache.find((r: any) =>
      r.name.toLowerCase() === value.toLowerCase() ||
      r.name.toLowerCase() === value.replace('@', '').toLowerCase()
    );
  }

  if (!role) {
    throw new RuntimeError(`Could not convert "${value}" to a role`);
  }

  return roleToRuntime(role);
});

/**
 * convert_to_user(value)
 * Convert string (ID, mention, username) to User object
 */
export const convertToUser = makeNativeFunction('convert_to_user', async (args: RuntimeValue[]) => {
  if (args.length !== 1) {
    throw new RuntimeError(`convert_to_user() expects 1 argument (value), got ${args.length}`);
  }

  if (!isString(args[0])) {
    throw new TypeError('Value must be a string');
  }

  const value = args[0].value;
  const client = getDiscordClient();

  let user: any = null;

  // Try to parse as mention (<@!123456789> or <@123456789>)
  const mentionMatch = value.match(/^<@!?(\d+)>$/);
  if (mentionMatch) {
    const userId = mentionMatch[1];
    user = await client.users.fetch(userId).catch(() => null);
  }

  // Try as direct ID
  if (!user && /^\d+$/.test(value)) {
    user = await client.users.fetch(value).catch(() => null);
  }

  // Try as username
  if (!user) {
    user = client.users.cache.find((u: any) =>
      u.username.toLowerCase() === value.toLowerCase() ||
      u.tag.toLowerCase() === value.toLowerCase()
    );
  }

  if (!user) {
    throw new RuntimeError(`Could not convert "${value}" to a user`);
  }

  const properties = new Map<string, RuntimeValue>();
  properties.set('__raw', { __rawValue: user } as any);
  properties.set('id', makeString(user.id));
  properties.set('username', makeString(user.username));
  properties.set('discriminator', makeString(user.discriminator));
  properties.set('tag', makeString(user.tag));
  properties.set('bot', makeBoolean(user.bot));

  if (user.avatar) {
    properties.set('avatar', makeString(user.avatar));
    properties.set('avatar_url', makeString(user.displayAvatarURL()));
  }

  return makeObject(properties);
});

/**
 * register_converter(type, converter_function)
 * Register a custom converter function
 * converter_function should take (value, context) and return converted object
 */
export const registerConverter = makeNativeFunction('register_converter', async (args: RuntimeValue[]) => {
  if (args.length !== 2) {
    throw new RuntimeError(`register_converter() expects 2 arguments (type, converter_function), got ${args.length}`);
  }

  if (!isString(args[0])) {
    throw new TypeError('Type must be a string');
  }

  if (!isFunction(args[1])) {
    throw new TypeError('Converter must be a function');
  }

  const type = args[0].value;
  const converter = args[1] as FunctionValue;

  customConverters.set(type, {
    type,
    converter,
  });

  return makeBoolean(true);
});

/**
 * auto_convert(value, type, context)
 * Automatically convert value to specified type
 * type: "member", "channel", "role", "user", or custom type
 * context: object with guild_id if needed
 */
export const autoConvert = makeNativeFunction('auto_convert', async (args: RuntimeValue[]) => {
  if (args.length < 2 || args.length > 3) {
    throw new RuntimeError(`auto_convert() expects 2-3 arguments (value, type, [context]), got ${args.length}`);
  }

  if (!isString(args[0]) || !isString(args[1])) {
    throw new TypeError('Value and type must be strings');
  }

  const value = args[0].value;
  const type = args[1].value.toLowerCase();
  const context = args.length === 3 ? args[2] : null;

  // Extract guild_id from context if available
  let guildId: string | null = null;
  if (context && context.type === 'object') {
    const guildIdProp = (context as any).properties.get('guild_id');
    if (guildIdProp && isString(guildIdProp)) {
      guildId = guildIdProp.value;
    }
  }

  // Use built-in converters
  switch (type) {
    case 'member':
      if (!guildId) {
        throw new RuntimeError('guild_id required in context for member conversion');
      }
      return await (convertToMember as any).call(null, [makeString(value), makeString(guildId)]);

    case 'channel':
      if (!guildId) {
        throw new RuntimeError('guild_id required in context for channel conversion');
      }
      return await (convertToChannel as any).call(null, [makeString(value), makeString(guildId)]);

    case 'role':
      if (!guildId) {
        throw new RuntimeError('guild_id required in context for role conversion');
      }
      return await (convertToRole as any).call(null, [makeString(value), makeString(guildId)]);

    case 'user':
      return await (convertToUser as any).call(null, [makeString(value)]);

    default:
      // Check for custom converter
      const customConverter = customConverters.get(type);
      if (customConverter) {
        // Note: This would need to be executed by the interpreter
        // For now, return a placeholder
        throw new RuntimeError(`Custom converter "${type}" registered but execution not yet implemented`);
      }

      throw new RuntimeError(`Unknown conversion type: ${type}`);
  }
});

/**
 * list_converters()
 * Get list of all registered converters
 */
export const listConverters = makeNativeFunction('list_converters', async (args: RuntimeValue[]) => {
  if (args.length !== 0) {
    throw new RuntimeError(`list_converters() expects 0 arguments, got ${args.length}`);
  }

  const converters = new Map<string, RuntimeValue>();

  // Built-in converters
  converters.set('member', makeString('Built-in: Convert to guild member'));
  converters.set('channel', makeString('Built-in: Convert to channel'));
  converters.set('role', makeString('Built-in: Convert to role'));
  converters.set('user', makeString('Built-in: Convert to user'));

  // Custom converters
  for (const [type, ] of customConverters) {
    converters.set(type, makeString('Custom converter'));
  }

  return makeObject(converters);
});

// Export all converter functions
export const converterBuiltins = {
  convert_to_member: convertToMember,
  convert_to_channel: convertToChannel,
  convert_to_role: convertToRole,
  convert_to_user: convertToUser,
  register_converter: registerConverter,
  auto_convert: autoConvert,
  list_converters: listConverters,
};

// Export for testing
export { customConverters };
