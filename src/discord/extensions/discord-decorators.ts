/**
 * Command Decorators for EasyLang
 * Provides decorators/checks for command validation
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
  makeNull,
} from '../../core/runtime/values';
import { RuntimeError, TypeError } from '../../utils/errors';
import { PermissionFlagsBits } from 'discord.js';

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
 * Command checks registry
 */
interface CommandCheck {
  name: string;
  checkFunction: FunctionValue;
}

const commandChecks = new Map<string, CommandCheck>();

/**
 * Store command metadata for decorators
 */
interface CommandMetadata {
  name: string;
  checks: string[];
  requiredPermissions?: string[];
  requiredRoles?: string[];
  guildOnly?: boolean;
  ownerOnly?: boolean;
}

const commandMetadata = new Map<string, CommandMetadata>();

/**
 * require_permission(permission)
 * Create a decorator that checks if user has a specific permission
 * Returns a check function that can be registered
 */
export const requirePermission = makeNativeFunction('require_permission', async (args: RuntimeValue[]) => {
  if (args.length !== 1) {
    throw new RuntimeError(`require_permission() expects 1 argument (permission), got ${args.length}`);
  }

  if (!isString(args[0])) {
    throw new TypeError('Permission must be a string');
  }

  const permission = args[0].value.toUpperCase();

  // Map permission names to flags
  const permissionMap: { [key: string]: bigint } = {
    ADMINISTRATOR: PermissionFlagsBits.Administrator,
    MANAGE_GUILD: PermissionFlagsBits.ManageGuild,
    MANAGE_CHANNELS: PermissionFlagsBits.ManageChannels,
    MANAGE_ROLES: PermissionFlagsBits.ManageRoles,
    MANAGE_MESSAGES: PermissionFlagsBits.ManageMessages,
    KICK_MEMBERS: PermissionFlagsBits.KickMembers,
    BAN_MEMBERS: PermissionFlagsBits.BanMembers,
    SEND_MESSAGES: PermissionFlagsBits.SendMessages,
    EMBED_LINKS: PermissionFlagsBits.EmbedLinks,
    ATTACH_FILES: PermissionFlagsBits.AttachFiles,
    MANAGE_WEBHOOKS: PermissionFlagsBits.ManageWebhooks,
    MANAGE_NICKNAMES: PermissionFlagsBits.ManageNicknames,
    MODERATE_MEMBERS: PermissionFlagsBits.ModerateMembers,
  };

  const permFlag = permissionMap[permission];
  if (!permFlag) {
    throw new RuntimeError(`Unknown permission: ${permission}`);
  }

  // Create check function metadata
  const checkName = `permission_${permission.toLowerCase()}`;
  const result = new Map<string, RuntimeValue>();
  result.set('check_name', makeString(checkName));
  result.set('type', makeString('permission'));
  result.set('permission', makeString(permission));

  // Store the check logic (to be executed later)
  const checkData = {
    name: checkName,
    type: 'permission',
    permission: permission,
    flag: permFlag,
  };
  (global as any).__ezlangCommandChecks = (global as any).__ezlangCommandChecks || new Map();
  (global as any).__ezlangCommandChecks.set(checkName, checkData);

  return makeObject(result);
});

/**
 * require_role(role_id)
 * Create a decorator that checks if user has a specific role
 */
export const requireRole = makeNativeFunction('require_role', async (args: RuntimeValue[]) => {
  if (args.length !== 1) {
    throw new RuntimeError(`require_role() expects 1 argument (role_id), got ${args.length}`);
  }

  if (!isString(args[0])) {
    throw new TypeError('Role ID must be a string');
  }

  const roleId = args[0].value;
  const checkName = `role_${roleId}`;

  const result = new Map<string, RuntimeValue>();
  result.set('check_name', makeString(checkName));
  result.set('type', makeString('role'));
  result.set('role_id', makeString(roleId));

  // Store the check logic
  const checkData = {
    name: checkName,
    type: 'role',
    roleId: roleId,
  };
  (global as any).__ezlangCommandChecks = (global as any).__ezlangCommandChecks || new Map();
  (global as any).__ezlangCommandChecks.set(checkName, checkData);

  return makeObject(result);
});

/**
 * guild_only()
 * Create a decorator that restricts command to guild channels only
 */
export const guildOnly = makeNativeFunction('guild_only', async (args: RuntimeValue[]) => {
  if (args.length !== 0) {
    throw new RuntimeError(`guild_only() expects 0 arguments, got ${args.length}`);
  }

  const checkName = 'guild_only';
  const result = new Map<string, RuntimeValue>();
  result.set('check_name', makeString(checkName));
  result.set('type', makeString('guild_only'));

  // Store the check logic
  const checkData = {
    name: checkName,
    type: 'guild_only',
  };
  (global as any).__ezlangCommandChecks = (global as any).__ezlangCommandChecks || new Map();
  (global as any).__ezlangCommandChecks.set(checkName, checkData);

  return makeObject(result);
});

/**
 * owner_only()
 * Create a decorator that restricts command to bot owner only
 */
export const ownerOnly = makeNativeFunction('owner_only', async (args: RuntimeValue[]) => {
  if (args.length !== 0) {
    throw new RuntimeError(`owner_only() expects 0 arguments, got ${args.length}`);
  }

  const checkName = 'owner_only';
  const result = new Map<string, RuntimeValue>();
  result.set('check_name', makeString(checkName));
  result.set('type', makeString('owner_only'));

  // Store the check logic
  const checkData = {
    name: checkName,
    type: 'owner_only',
  };
  (global as any).__ezlangCommandChecks = (global as any).__ezlangCommandChecks || new Map();
  (global as any).__ezlangCommandChecks.set(checkName, checkData);

  return makeObject(result);
});

/**
 * register_command_check(name, check_function)
 * Register a custom check function
 * check_function should take (interaction/message) and return boolean
 */
export const registerCommandCheck = makeNativeFunction('register_command_check', async (args: RuntimeValue[]) => {
  if (args.length !== 2) {
    throw new RuntimeError(`register_command_check() expects 2 arguments (name, check_function), got ${args.length}`);
  }

  if (!isString(args[0])) {
    throw new TypeError('Check name must be a string');
  }

  if (!isFunction(args[1])) {
    throw new TypeError('Check function must be a function');
  }

  const checkName = args[0].value;
  const checkFunction = args[1] as FunctionValue;

  // Store the custom check
  commandChecks.set(checkName, {
    name: checkName,
    checkFunction: checkFunction,
  });

  // Also store in global registry
  const checkData = {
    name: checkName,
    type: 'custom',
    function: checkFunction,
  };
  (global as any).__ezlangCommandChecks = (global as any).__ezlangCommandChecks || new Map();
  (global as any).__ezlangCommandChecks.set(checkName, checkData);

  return makeBoolean(true);
});

/**
 * apply_checks(command_name, checks)
 * Apply checks to a command
 * checks: array of check objects returned from decorator functions
 */
export const applyChecks = makeNativeFunction('apply_checks', async (args: RuntimeValue[]) => {
  if (args.length !== 2) {
    throw new RuntimeError(`apply_checks() expects 2 arguments (command_name, checks), got ${args.length}`);
  }

  if (!isString(args[0])) {
    throw new TypeError('Command name must be a string');
  }

  const commandName = args[0].value;
  const checksArg = args[1];

  // Get or create command metadata
  let metadata = commandMetadata.get(commandName);
  if (!metadata) {
    metadata = {
      name: commandName,
      checks: [],
    };
    commandMetadata.set(commandName, metadata);
  }

  // Process checks
  if (checksArg.type === 'array') {
    for (const check of (checksArg as any).elements) {
      if (check.type === 'object') {
        const checkNameProp = (check as any).properties.get('check_name');
        if (checkNameProp && checkNameProp.type === 'string') {
          metadata.checks.push((checkNameProp as any).value);
        }
      }
    }
  } else if (checksArg.type === 'object') {
    const checkNameProp = (checksArg as any).properties.get('check_name');
    if (checkNameProp && checkNameProp.type === 'string') {
      metadata.checks.push((checkNameProp as any).value);
    }
  }

  return makeBoolean(true);
});

/**
 * run_checks(command_name, context)
 * Run all checks for a command against a context (message or interaction)
 * context: object with user_id, guild_id, channel_id, member properties
 * Returns: { passed: boolean, failed_check: string or null, reason: string }
 */
export const runChecks = makeNativeFunction('run_checks', async (args: RuntimeValue[]) => {
  if (args.length !== 2) {
    throw new RuntimeError(`run_checks() expects 2 arguments (command_name, context), got ${args.length}`);
  }

  if (!isString(args[0])) {
    throw new TypeError('Command name must be a string');
  }

  const commandName = args[0].value;
  const context = args[1];

  if (context.type !== 'object') {
    throw new TypeError('Context must be an object');
  }

  const metadata = commandMetadata.get(commandName);
  if (!metadata || metadata.checks.length === 0) {
    // No checks, pass by default
    const result = new Map<string, RuntimeValue>();
    result.set('passed', makeBoolean(true));
    result.set('failed_check', makeNull());
    result.set('reason', makeString(''));
    return makeObject(result);
  }

  // Get context properties
  const contextProps = (context as any).properties;
  const userId = contextProps.get('user_id')?.value;
  const guildId = contextProps.get('guild_id')?.value;
  const channelId = contextProps.get('channel_id')?.value;

  const client = getDiscordClient();
  const checksRegistry = (global as any).__ezlangCommandChecks || new Map();

  // Run each check
  for (const checkName of metadata.checks) {
    const checkData = checksRegistry.get(checkName);
    if (!checkData) {
      continue;
    }

    // Execute check based on type
    if (checkData.type === 'guild_only') {
      if (!guildId) {
        const result = new Map<string, RuntimeValue>();
        result.set('passed', makeBoolean(false));
        result.set('failed_check', makeString(checkName));
        result.set('reason', makeString('This command can only be used in a guild'));
        return makeObject(result);
      }
    } else if (checkData.type === 'owner_only') {
      const application = await client.application.fetch();
      const ownerId = application.owner?.id;
      if (userId !== ownerId) {
        const result = new Map<string, RuntimeValue>();
        result.set('passed', makeBoolean(false));
        result.set('failed_check', makeString(checkName));
        result.set('reason', makeString('This command can only be used by the bot owner'));
        return makeObject(result);
      }
    } else if (checkData.type === 'permission') {
      if (!guildId || !channelId) {
        const result = new Map<string, RuntimeValue>();
        result.set('passed', makeBoolean(false));
        result.set('failed_check', makeString(checkName));
        result.set('reason', makeString('Permission checks require a guild context'));
        return makeObject(result);
      }

      const guild = await client.guilds.fetch(guildId);
      const member = await guild.members.fetch(userId);
      const channel = await client.channels.fetch(channelId);
      const permissions = channel.permissionsFor(member);

      if (!permissions.has(checkData.flag)) {
        const result = new Map<string, RuntimeValue>();
        result.set('passed', makeBoolean(false));
        result.set('failed_check', makeString(checkName));
        result.set('reason', makeString(`Missing required permission: ${checkData.permission}`));
        return makeObject(result);
      }
    } else if (checkData.type === 'role') {
      if (!guildId) {
        const result = new Map<string, RuntimeValue>();
        result.set('passed', makeBoolean(false));
        result.set('failed_check', makeString(checkName));
        result.set('reason', makeString('Role checks require a guild context'));
        return makeObject(result);
      }

      const guild = await client.guilds.fetch(guildId);
      const member = await guild.members.fetch(userId);

      if (!member.roles.cache.has(checkData.roleId)) {
        const result = new Map<string, RuntimeValue>();
        result.set('passed', makeBoolean(false));
        result.set('failed_check', makeString(checkName));
        result.set('reason', makeString(`Missing required role: ${checkData.roleId}`));
        return makeObject(result);
      }
    }
    // Custom checks would be executed here
    // This would require interpreter integration to call the FunctionValue
  }

  // All checks passed
  const result = new Map<string, RuntimeValue>();
  result.set('passed', makeBoolean(true));
  result.set('failed_check', makeNull());
  result.set('reason', makeString(''));
  return makeObject(result);
});

/**
 * get_command_checks(command_name)
 * Get all checks registered for a command
 */
export const getCommandChecks = makeNativeFunction('get_command_checks', async (args: RuntimeValue[]) => {
  if (args.length !== 1) {
    throw new RuntimeError(`get_command_checks() expects 1 argument (command_name), got ${args.length}`);
  }

  if (!isString(args[0])) {
    throw new TypeError('Command name must be a string');
  }

  const commandName = args[0].value;
  const metadata = commandMetadata.get(commandName);

  if (!metadata) {
    const resultMap = new Map<string, RuntimeValue>();
    resultMap.set('checks', makeString('[]'));
    resultMap.set('count', makeNumber(0));
    return makeObject(resultMap);
  }

  const resultMap = new Map<string, RuntimeValue>();
  resultMap.set('checks', makeString(JSON.stringify(metadata.checks)));
  resultMap.set('count', makeNumber(metadata.checks.length));
  return makeObject(resultMap);
});

// Export all decorator functions
export const decoratorBuiltins = {
  require_permission: requirePermission,
  require_role: requireRole,
  guild_only: guildOnly,
  owner_only: ownerOnly,
  register_command_check: registerCommandCheck,
  apply_checks: applyChecks,
  run_checks: runChecks,
  get_command_checks: getCommandChecks,
};

// Export for testing
export { commandChecks, commandMetadata };
