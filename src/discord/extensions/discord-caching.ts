/**
 * Advanced Caching Configuration for EasyLang
 * Provides cache management and statistics for Discord.js managers
 */

import {
  RuntimeValue,
  makeNativeFunction,
  makeObject,
  makeNumber,
  makeBoolean,
  isString,
  isNumber,
  isObject,
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
 * configure_cache(options)
 * Set cache limits per manager
 * Options: {
 *   messages: number,
 *   users: number,
 *   members: number,
 *   guilds: number,
 *   channels: number,
 *   roles: number,
 *   emojis: number,
 *   presences: number,
 *   voice_states: number,
 *   threads: number
 * }
 */
export const configureCache = makeNativeFunction('configure_cache', async (args: RuntimeValue[]) => {
  if (args.length !== 1) {
    throw new RuntimeError(`configure_cache() expects 1 argument (options), got ${args.length}`);
  }

  if (!isObject(args[0])) {
    throw new TypeError('Options must be an object');
  }

  const options = args[0];
  const client = getDiscordClient();

  // Extract cache limits
  const cacheConfig: any = {};

  const messagesProp = options.properties.get('messages');
  if (messagesProp && isNumber(messagesProp)) {
    cacheConfig.messages = messagesProp.value;
  }

  const usersProp = options.properties.get('users');
  if (usersProp && isNumber(usersProp)) {
    cacheConfig.users = usersProp.value;
  }

  const membersProp = options.properties.get('members');
  if (membersProp && isNumber(membersProp)) {
    cacheConfig.members = membersProp.value;
  }

  const guildsProp = options.properties.get('guilds');
  if (guildsProp && isNumber(guildsProp)) {
    cacheConfig.guilds = guildsProp.value;
  }

  const channelsProp = options.properties.get('channels');
  if (channelsProp && isNumber(channelsProp)) {
    cacheConfig.channels = channelsProp.value;
  }

  const rolesProp = options.properties.get('roles');
  if (rolesProp && isNumber(rolesProp)) {
    cacheConfig.roles = rolesProp.value;
  }

  const emojisProp = options.properties.get('emojis');
  if (emojisProp && isNumber(emojisProp)) {
    cacheConfig.emojis = emojisProp.value;
  }

  const presencesProp = options.properties.get('presences');
  if (presencesProp && isNumber(presencesProp)) {
    cacheConfig.presences = presencesProp.value;
  }

  const voiceStatesProp = options.properties.get('voice_states');
  if (voiceStatesProp && isNumber(voiceStatesProp)) {
    cacheConfig.voiceStates = voiceStatesProp.value;
  }

  const threadsProp = options.properties.get('threads');
  if (threadsProp && isNumber(threadsProp)) {
    cacheConfig.threads = threadsProp.value;
  }

  // Apply cache configuration
  // Note: Discord.js cache limits are set during client creation
  // This stores the config for future reference
  if (!client.__ezlangCacheConfig) {
    client.__ezlangCacheConfig = {};
  }
  Object.assign(client.__ezlangCacheConfig, cacheConfig);

  return makeBoolean(true);
});

/**
 * get_cache_stats()
 * Get cache statistics for all managers
 * Returns object with cache sizes for each manager
 */
export const getCacheStats = makeNativeFunction('get_cache_stats', async (args: RuntimeValue[]) => {
  if (args.length !== 0) {
    throw new RuntimeError(`get_cache_stats() expects 0 arguments, got ${args.length}`);
  }

  const client = getDiscordClient();
  const stats = new Map<string, RuntimeValue>();

  // Guilds
  stats.set('guilds', makeNumber(client.guilds.cache.size));

  // Users
  stats.set('users', makeNumber(client.users.cache.size));

  // Channels
  stats.set('channels', makeNumber(client.channels.cache.size));

  // Calculate total messages across all channels
  let totalMessages = 0;
  client.channels.cache.forEach((channel: any) => {
    if (channel.messages) {
      totalMessages += channel.messages.cache.size;
    }
  });
  stats.set('messages', makeNumber(totalMessages));

  // Calculate total members across all guilds
  let totalMembers = 0;
  client.guilds.cache.forEach((guild: any) => {
    totalMembers += guild.members.cache.size;
  });
  stats.set('members', makeNumber(totalMembers));

  // Calculate total roles across all guilds
  let totalRoles = 0;
  client.guilds.cache.forEach((guild: any) => {
    totalRoles += guild.roles.cache.size;
  });
  stats.set('roles', makeNumber(totalRoles));

  // Calculate total emojis across all guilds
  let totalEmojis = 0;
  client.guilds.cache.forEach((guild: any) => {
    totalEmojis += guild.emojis.cache.size;
  });
  stats.set('emojis', makeNumber(totalEmojis));

  // Calculate total presences across all guilds
  let totalPresences = 0;
  client.guilds.cache.forEach((guild: any) => {
    if (guild.presences) {
      totalPresences += guild.presences.cache.size;
    }
  });
  stats.set('presences', makeNumber(totalPresences));

  // Calculate total voice states across all guilds
  let totalVoiceStates = 0;
  client.guilds.cache.forEach((guild: any) => {
    totalVoiceStates += guild.voiceStates.cache.size;
  });
  stats.set('voice_states', makeNumber(totalVoiceStates));

  // Calculate total threads
  let totalThreads = 0;
  client.channels.cache.forEach((channel: any) => {
    if (channel.threads) {
      totalThreads += channel.threads.cache.size;
    }
  });
  stats.set('threads', makeNumber(totalThreads));

  // Add memory usage if available
  const usage = process.memoryUsage();
  const memoryStats = new Map<string, RuntimeValue>();
  memoryStats.set('heap_used_mb', makeNumber(Math.round(usage.heapUsed / 1024 / 1024)));
  memoryStats.set('heap_total_mb', makeNumber(Math.round(usage.heapTotal / 1024 / 1024)));
  memoryStats.set('external_mb', makeNumber(Math.round(usage.external / 1024 / 1024)));
  memoryStats.set('rss_mb', makeNumber(Math.round(usage.rss / 1024 / 1024)));
  stats.set('memory', makeObject(memoryStats));

  return makeObject(stats);
});

/**
 * clear_cache(type)
 * Clear specific caches
 * Types: "messages", "users", "members", "all"
 */
export const clearCache = makeNativeFunction('clear_cache', async (args: RuntimeValue[]) => {
  if (args.length !== 1) {
    throw new RuntimeError(`clear_cache() expects 1 argument (type), got ${args.length}`);
  }

  if (!isString(args[0])) {
    throw new TypeError('Cache type must be a string');
  }

  const cacheType = args[0].value.toLowerCase();
  const client = getDiscordClient();
  let cleared = 0;

  switch (cacheType) {
    case 'messages':
      client.channels.cache.forEach((channel: any) => {
        if (channel.messages) {
          cleared += channel.messages.cache.size;
          channel.messages.cache.clear();
        }
      });
      break;

    case 'users':
      cleared = client.users.cache.size;
      // Don't clear the bot's own user
      const botId = client.user?.id;
      client.users.cache.clear();
      if (botId) {
        client.users.fetch(botId).catch(() => {});
      }
      break;

    case 'members':
      client.guilds.cache.forEach((guild: any) => {
        cleared += guild.members.cache.size;
        // Keep the bot's own member
        const botMember = guild.members.cache.get(client.user?.id);
        guild.members.cache.clear();
        if (botMember) {
          guild.members.cache.set(botMember.id, botMember);
        }
      });
      break;

    case 'presences':
      client.guilds.cache.forEach((guild: any) => {
        if (guild.presences) {
          cleared += guild.presences.cache.size;
          guild.presences.cache.clear();
        }
      });
      break;

    case 'voice_states':
      client.guilds.cache.forEach((guild: any) => {
        cleared += guild.voiceStates.cache.size;
        guild.voiceStates.cache.clear();
      });
      break;

    case 'threads':
      client.channels.cache.forEach((channel: any) => {
        if (channel.threads) {
          cleared += channel.threads.cache.size;
          channel.threads.cache.clear();
        }
      });
      break;

    case 'all':
      // Clear all caches
      client.channels.cache.forEach((channel: any) => {
        if (channel.messages) {
          cleared += channel.messages.cache.size;
          channel.messages.cache.clear();
        }
      });

      client.guilds.cache.forEach((guild: any) => {
        cleared += guild.members.cache.size;
        const botMember = guild.members.cache.get(client.user?.id);
        guild.members.cache.clear();
        if (botMember) {
          guild.members.cache.set(botMember.id, botMember);
        }

        if (guild.presences) {
          cleared += guild.presences.cache.size;
          guild.presences.cache.clear();
        }

        cleared += guild.voiceStates.cache.size;
        guild.voiceStates.cache.clear();
      });
      break;

    default:
      throw new RuntimeError(`Unknown cache type: ${cacheType}. Valid types: messages, users, members, presences, voice_states, threads, all`);
  }

  return makeNumber(cleared);
});

/**
 * set_cache_sweep(interval, lifetime)
 * Configure automatic cache sweeping
 * interval: sweep interval in seconds
 * lifetime: max item lifetime in seconds
 */
export const setCacheSweep = makeNativeFunction('set_cache_sweep', async (args: RuntimeValue[]) => {
  if (args.length !== 2) {
    throw new RuntimeError(`set_cache_sweep() expects 2 arguments (interval, lifetime), got ${args.length}`);
  }

  if (!isNumber(args[0]) || !isNumber(args[1])) {
    throw new TypeError('Interval and lifetime must be numbers (in seconds)');
  }

  const interval = args[0].value * 1000; // Convert to milliseconds
  const lifetime = args[1].value * 1000; // Convert to milliseconds
  const client = getDiscordClient();

  // Clear any existing sweep interval
  if (client.__ezlangSweepInterval) {
    clearInterval(client.__ezlangSweepInterval);
  }

  // Set up new sweep interval
  client.__ezlangSweepInterval = setInterval(() => {
    const now = Date.now();

    // Sweep messages
    client.channels.cache.forEach((channel: any) => {
      if (channel.messages) {
        const oldSize = channel.messages.cache.size;
        channel.messages.cache = channel.messages.cache.filter((msg: any) => {
          return now - msg.createdTimestamp < lifetime;
        });
        const newSize = channel.messages.cache.size;
        if (oldSize !== newSize) {
          console.log(`[Cache Sweep] Cleared ${oldSize - newSize} messages from channel ${channel.id}`);
        }
      }
    });

    // Sweep presences
    client.guilds.cache.forEach((guild: any) => {
      if (guild.presences) {
        const oldSize = guild.presences.cache.size;
        guild.presences.cache.clear();
        if (oldSize > 0) {
          console.log(`[Cache Sweep] Cleared ${oldSize} presences from guild ${guild.id}`);
        }
      }
    });

    console.log('[Cache Sweep] Completed sweep cycle');
  }, interval);

  return makeBoolean(true);
});

// Export all caching functions
export const cachingBuiltins = {
  configure_cache: configureCache,
  get_cache_stats: getCacheStats,
  clear_cache: clearCache,
  set_cache_sweep: setCacheSweep,
};
