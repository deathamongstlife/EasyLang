/**
 * Discord Cooldown Management for EzLang
 * Provides comprehensive cooldown system with multiple bucket types
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
} from '../../core/runtime/values';
import { RuntimeError, TypeError } from '../../utils/errors';

interface Cooldown {
  userId: string;
  commandName: string;
  expiresAt: number;
  bucket: 'user' | 'channel' | 'guild' | 'global';
  channelId?: string;
  guildId?: string;
}

// Global cooldown storage
const cooldowns = new Map<string, Cooldown>();

/**
 * Generate cooldown key based on bucket type
 */
function generateCooldownKey(
  userId: string,
  commandName: string,
  bucket: 'user' | 'channel' | 'guild' | 'global' = 'user',
  channelId?: string,
  guildId?: string
): string {
  switch (bucket) {
    case 'user':
      return `user:${userId}:${commandName}`;
    case 'channel':
      return `channel:${channelId}:${commandName}`;
    case 'guild':
      return `guild:${guildId}:${commandName}`;
    case 'global':
      return `global:${commandName}`;
    default:
      return `user:${userId}:${commandName}`;
  }
}

/**
 * Clean expired cooldowns
 */
function cleanExpiredCooldowns(): void {
  const now = Date.now();
  const toDelete: string[] = [];

  cooldowns.forEach((cooldown, key) => {
    if (cooldown.expiresAt <= now) {
      toDelete.push(key);
    }
  });

  toDelete.forEach(key => cooldowns.delete(key));
}

// Run cleanup every minute
setInterval(cleanExpiredCooldowns, 60000);

/**
 * add_cooldown(user_id, command_name, duration_seconds, options?)
 * Add a cooldown for a user and command
 *
 * Options:
 * - bucket: "user" | "channel" | "guild" | "global" (default: "user")
 * - channel_id: Channel ID (required for channel bucket)
 * - guild_id: Guild ID (required for guild bucket)
 */
export const addCooldown = makeNativeFunction('add_cooldown', async (args: RuntimeValue[]) => {
  if (args.length < 3) {
    throw new RuntimeError(`add_cooldown() expects at least 3 arguments (user_id, command_name, duration_seconds), got ${args.length}`);
  }

  if (!isString(args[0]) || !isString(args[1]) || !isNumber(args[2])) {
    throw new TypeError('add_cooldown() expects (string, string, number)');
  }

  const userId = args[0].value;
  const commandName = args[1].value;
  const durationSeconds = args[2].value;

  if (durationSeconds <= 0) {
    throw new RuntimeError('Duration must be greater than 0');
  }

  let bucket: 'user' | 'channel' | 'guild' | 'global' = 'user';
  let channelId: string | undefined;
  let guildId: string | undefined;

  // Parse options if provided
  if (args.length >= 4 && isObject(args[3])) {
    const options = args[3];

    const bucketProp = options.properties.get('bucket');
    if (bucketProp && isString(bucketProp)) {
      const bucketValue = bucketProp.value;
      if (['user', 'channel', 'guild', 'global'].includes(bucketValue)) {
        bucket = bucketValue as 'user' | 'channel' | 'guild' | 'global';
      }
    }

    const channelIdProp = options.properties.get('channel_id');
    if (channelIdProp && isString(channelIdProp)) {
      channelId = channelIdProp.value;
    }

    const guildIdProp = options.properties.get('guild_id');
    if (guildIdProp && isString(guildIdProp)) {
      guildId = guildIdProp.value;
    }
  }

  // Validate required IDs for bucket types
  if (bucket === 'channel' && !channelId) {
    throw new RuntimeError('channel_id is required for channel bucket');
  }
  if (bucket === 'guild' && !guildId) {
    throw new RuntimeError('guild_id is required for guild bucket');
  }

  const key = generateCooldownKey(userId, commandName, bucket, channelId, guildId);
  const expiresAt = Date.now() + (durationSeconds * 1000);

  cooldowns.set(key, {
    userId,
    commandName,
    expiresAt,
    bucket,
    channelId,
    guildId,
  });

  return makeBoolean(true);
});

/**
 * is_on_cooldown(user_id, command_name, options?)
 * Check if a user is on cooldown for a command
 */
export const isOnCooldown = makeNativeFunction('is_on_cooldown', async (args: RuntimeValue[]) => {
  if (args.length < 2) {
    throw new RuntimeError(`is_on_cooldown() expects at least 2 arguments (user_id, command_name), got ${args.length}`);
  }

  if (!isString(args[0]) || !isString(args[1])) {
    throw new TypeError('is_on_cooldown() expects (string, string)');
  }

  const userId = args[0].value;
  const commandName = args[1].value;

  let bucket: 'user' | 'channel' | 'guild' | 'global' = 'user';
  let channelId: string | undefined;
  let guildId: string | undefined;

  // Parse options if provided
  if (args.length >= 3 && isObject(args[2])) {
    const options = args[2];

    const bucketProp = options.properties.get('bucket');
    if (bucketProp && isString(bucketProp)) {
      const bucketValue = bucketProp.value;
      if (['user', 'channel', 'guild', 'global'].includes(bucketValue)) {
        bucket = bucketValue as 'user' | 'channel' | 'guild' | 'global';
      }
    }

    const channelIdProp = options.properties.get('channel_id');
    if (channelIdProp && isString(channelIdProp)) {
      channelId = channelIdProp.value;
    }

    const guildIdProp = options.properties.get('guild_id');
    if (guildIdProp && isString(guildIdProp)) {
      guildId = guildIdProp.value;
    }
  }

  const key = generateCooldownKey(userId, commandName, bucket, channelId, guildId);
  const cooldown = cooldowns.get(key);

  if (!cooldown) {
    return makeBoolean(false);
  }

  const now = Date.now();
  if (cooldown.expiresAt <= now) {
    cooldowns.delete(key);
    return makeBoolean(false);
  }

  return makeBoolean(true);
});

/**
 * get_cooldown_remaining(user_id, command_name, options?)
 * Get remaining cooldown time in seconds
 * Returns 0 if not on cooldown
 */
export const getCooldownRemaining = makeNativeFunction('get_cooldown_remaining', async (args: RuntimeValue[]) => {
  if (args.length < 2) {
    throw new RuntimeError(`get_cooldown_remaining() expects at least 2 arguments (user_id, command_name), got ${args.length}`);
  }

  if (!isString(args[0]) || !isString(args[1])) {
    throw new TypeError('get_cooldown_remaining() expects (string, string)');
  }

  const userId = args[0].value;
  const commandName = args[1].value;

  let bucket: 'user' | 'channel' | 'guild' | 'global' = 'user';
  let channelId: string | undefined;
  let guildId: string | undefined;

  // Parse options if provided
  if (args.length >= 3 && isObject(args[2])) {
    const options = args[2];

    const bucketProp = options.properties.get('bucket');
    if (bucketProp && isString(bucketProp)) {
      const bucketValue = bucketProp.value;
      if (['user', 'channel', 'guild', 'global'].includes(bucketValue)) {
        bucket = bucketValue as 'user' | 'channel' | 'guild' | 'global';
      }
    }

    const channelIdProp = options.properties.get('channel_id');
    if (channelIdProp && isString(channelIdProp)) {
      channelId = channelIdProp.value;
    }

    const guildIdProp = options.properties.get('guild_id');
    if (guildIdProp && isString(guildIdProp)) {
      guildId = guildIdProp.value;
    }
  }

  const key = generateCooldownKey(userId, commandName, bucket, channelId, guildId);
  const cooldown = cooldowns.get(key);

  if (!cooldown) {
    return makeNumber(0);
  }

  const now = Date.now();
  const remainingMs = cooldown.expiresAt - now;

  if (remainingMs <= 0) {
    cooldowns.delete(key);
    return makeNumber(0);
  }

  const remainingSeconds = Math.ceil(remainingMs / 1000);
  return makeNumber(remainingSeconds);
});

/**
 * reset_cooldown(user_id, command_name, options?)
 * Clear a specific cooldown
 */
export const resetCooldown = makeNativeFunction('reset_cooldown', async (args: RuntimeValue[]) => {
  if (args.length < 2) {
    throw new RuntimeError(`reset_cooldown() expects at least 2 arguments (user_id, command_name), got ${args.length}`);
  }

  if (!isString(args[0]) || !isString(args[1])) {
    throw new TypeError('reset_cooldown() expects (string, string)');
  }

  const userId = args[0].value;
  const commandName = args[1].value;

  let bucket: 'user' | 'channel' | 'guild' | 'global' = 'user';
  let channelId: string | undefined;
  let guildId: string | undefined;

  // Parse options if provided
  if (args.length >= 3 && isObject(args[2])) {
    const options = args[2];

    const bucketProp = options.properties.get('bucket');
    if (bucketProp && isString(bucketProp)) {
      const bucketValue = bucketProp.value;
      if (['user', 'channel', 'guild', 'global'].includes(bucketValue)) {
        bucket = bucketValue as 'user' | 'channel' | 'guild' | 'global';
      }
    }

    const channelIdProp = options.properties.get('channel_id');
    if (channelIdProp && isString(channelIdProp)) {
      channelId = channelIdProp.value;
    }

    const guildIdProp = options.properties.get('guild_id');
    if (guildIdProp && isString(guildIdProp)) {
      guildId = guildIdProp.value;
    }
  }

  const key = generateCooldownKey(userId, commandName, bucket, channelId, guildId);
  const existed = cooldowns.has(key);
  cooldowns.delete(key);

  return makeBoolean(existed);
});

/**
 * reset_all_cooldowns(user_id)
 * Clear all cooldowns for a specific user
 */
export const resetAllCooldowns = makeNativeFunction('reset_all_cooldowns', async (args: RuntimeValue[]) => {
  if (args.length !== 1) {
    throw new RuntimeError(`reset_all_cooldowns() expects 1 argument (user_id), got ${args.length}`);
  }

  if (!isString(args[0])) {
    throw new TypeError('User ID must be a string');
  }

  const userId = args[0].value;
  const toDelete: string[] = [];

  cooldowns.forEach((cooldown, key) => {
    if (cooldown.userId === userId) {
      toDelete.push(key);
    }
  });

  toDelete.forEach(key => cooldowns.delete(key));

  return makeNumber(toDelete.length);
});

/**
 * get_user_cooldowns(user_id)
 * Get all active cooldowns for a user
 */
export const getUserCooldowns = makeNativeFunction('get_user_cooldowns', async (args: RuntimeValue[]) => {
  if (args.length !== 1) {
    throw new RuntimeError(`get_user_cooldowns() expects 1 argument (user_id), got ${args.length}`);
  }

  if (!isString(args[0])) {
    throw new TypeError('User ID must be a string');
  }

  const userId = args[0].value;
  const now = Date.now();
  const userCooldowns: RuntimeValue[] = [];

  cooldowns.forEach((cooldown) => {
    if (cooldown.userId === userId && cooldown.expiresAt > now) {
      const remainingSeconds = Math.ceil((cooldown.expiresAt - now) / 1000);

      const properties = new Map<string, RuntimeValue>();
      properties.set('command_name', makeString(cooldown.commandName));
      properties.set('remaining_seconds', makeNumber(remainingSeconds));
      properties.set('expires_at', makeNumber(cooldown.expiresAt));
      properties.set('bucket', makeString(cooldown.bucket));

      if (cooldown.channelId) {
        properties.set('channel_id', makeString(cooldown.channelId));
      }
      if (cooldown.guildId) {
        properties.set('guild_id', makeString(cooldown.guildId));
      }

      userCooldowns.push(makeObject(properties));
    }
  });

  return makeArray(userCooldowns);
});

/**
 * clear_all_cooldowns()
 * Clear all cooldowns (admin function)
 */
export const clearAllCooldowns = makeNativeFunction('clear_all_cooldowns', async (args: RuntimeValue[]) => {
  if (args.length !== 0) {
    throw new RuntimeError(`clear_all_cooldowns() expects 0 arguments, got ${args.length}`);
  }

  const count = cooldowns.size;
  cooldowns.clear();

  return makeNumber(count);
});

/**
 * get_cooldown_stats()
 * Get statistics about cooldowns
 */
export const getCooldownStats = makeNativeFunction('get_cooldown_stats', async (args: RuntimeValue[]) => {
  if (args.length !== 0) {
    throw new RuntimeError(`get_cooldown_stats() expects 0 arguments, got ${args.length}`);
  }

  const now = Date.now();
  let activeCount = 0;
  let expiredCount = 0;

  const bucketCounts = {
    user: 0,
    channel: 0,
    guild: 0,
    global: 0,
  };

  cooldowns.forEach(cooldown => {
    if (cooldown.expiresAt > now) {
      activeCount++;
      bucketCounts[cooldown.bucket]++;
    } else {
      expiredCount++;
    }
  });

  const properties = new Map<string, RuntimeValue>();
  properties.set('total', makeNumber(cooldowns.size));
  properties.set('active', makeNumber(activeCount));
  properties.set('expired', makeNumber(expiredCount));
  properties.set('user_bucket', makeNumber(bucketCounts.user));
  properties.set('channel_bucket', makeNumber(bucketCounts.channel));
  properties.set('guild_bucket', makeNumber(bucketCounts.guild));
  properties.set('global_bucket', makeNumber(bucketCounts.global));

  return makeObject(properties);
});

// Export all cooldown functions
export const cooldownBuiltins = {
  add_cooldown: addCooldown,
  is_on_cooldown: isOnCooldown,
  get_cooldown_remaining: getCooldownRemaining,
  reset_cooldown: resetCooldown,
  reset_all_cooldowns: resetAllCooldowns,
  get_user_cooldowns: getUserCooldowns,
  clear_all_cooldowns: clearAllCooldowns,
  get_cooldown_stats: getCooldownStats,
};

// Export for testing
export { cooldowns };
