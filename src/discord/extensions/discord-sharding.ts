/**
 * Discord Sharding Support for EasyLang
 * Enables horizontal scaling for bots serving 2,500+ servers
 */

import {
  RuntimeValue,
  makeString,
  makeBoolean,
  makeObject,
  makeNativeFunction,
  makeArray,
  makeNumber,
  makeNull,
  isString,
  isNumber,
  isObject,
} from '../../core/runtime/values';
import { RuntimeError, TypeError } from '../../utils/errors';
import { ShardingManager, Shard, Client } from 'discord.js';

// Global shard manager storage
let globalShardManager: ShardingManager | null = null;

/**
 * Get the Discord client from global context
 */
function getDiscordClient(): Client | null {
  return (global as any).__discordClient || null;
}

/**
 * create_shard_manager(bot_file, options)
 * Create and configure a shard manager
 *
 * @param bot_file - Path to the main bot file (.ez or .js)
 * @param options - Configuration options:
 *   - total_shards: Number of shards or "auto" (default: "auto")
 *   - token: Discord bot token (optional if provided elsewhere)
 *   - shard_list: Array of specific shard IDs to spawn (optional)
 *   - respawn: Auto-respawn shards on crash (default: true)
 */
export const createShardManager = makeNativeFunction('create_shard_manager', async (args: RuntimeValue[]) => {
  if (args.length < 1) {
    throw new RuntimeError(`create_shard_manager() expects at least 1 argument (bot_file), got ${args.length}`);
  }

  if (!isString(args[0])) {
    throw new TypeError('Bot file path must be a string');
  }

  const botFile = args[0].value;

  // Parse options
  let totalShards: number | 'auto' = 'auto';
  let token: string | undefined;
  let shardList: number[] | undefined;
  let respawn = true;

  if (args.length >= 2 && isObject(args[1])) {
    const options = args[1];

    // total_shards
    const totalShardsProp = options.properties.get('total_shards');
    if (totalShardsProp) {
      if (isString(totalShardsProp)) {
        if (totalShardsProp.value === 'auto') {
          totalShards = 'auto';
        } else {
          throw new TypeError('total_shards must be a number or "auto"');
        }
      } else if (isNumber(totalShardsProp)) {
        totalShards = Math.floor(totalShardsProp.value);
        if (totalShards < 1) {
          throw new RuntimeError('total_shards must be at least 1');
        }
      } else {
        throw new TypeError('total_shards must be a number or "auto"');
      }
    }

    // token
    const tokenProp = options.properties.get('token');
    if (tokenProp && isString(tokenProp)) {
      token = tokenProp.value;
    }

    // shard_list
    const shardListProp = options.properties.get('shard_list');
    if (shardListProp) {
      if (!shardListProp || shardListProp.type !== 'array') {
        throw new TypeError('shard_list must be an array');
      }
      shardList = (shardListProp as any).elements.map((elem: RuntimeValue) => {
        if (!isNumber(elem)) {
          throw new TypeError('shard_list must contain only numbers');
        }
        return Math.floor(elem.value);
      });
    }

    // respawn
    const respawnProp = options.properties.get('respawn');
    if (respawnProp) {
      if (respawnProp.type !== 'boolean') {
        throw new TypeError('respawn must be a boolean');
      }
      respawn = (respawnProp as any).value;
    }
  }

  if (!token) {
    throw new RuntimeError('Token is required. Provide it in options: { token: "YOUR_BOT_TOKEN" }');
  }

  try {
    // Create ShardingManager
    const managerOptions: any = {
      totalShards: totalShards,
      respawn: respawn,
    };

    if (shardList) {
      managerOptions.shardList = shardList;
    }

    const manager = new ShardingManager(botFile, {
      token: token,
      ...managerOptions,
    });

    // Store globally
    globalShardManager = manager;

    // Set up event listeners
    manager.on('shardCreate', (shard: Shard) => {
      console.log(`[ShardManager] Launched shard ${shard.id}`);
    });

    // Return manager object
    const properties = new Map<string, RuntimeValue>();
    properties.set('bot_file', makeString(botFile));
    properties.set('total_shards', typeof totalShards === 'string'
      ? makeString(totalShards)
      : makeNumber(totalShards)
    );
    properties.set('respawn', makeBoolean(respawn));

    if (shardList) {
      properties.set('shard_list', makeArray(shardList.map(id => makeNumber(id))));
    }

    return makeObject(properties);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    throw new RuntimeError(`Failed to create shard manager: ${errorMsg}`);
  }
});

/**
 * spawn_shards()
 * Spawn all shards from the shard manager
 * Returns an array of shard objects
 */
export const spawnShards = makeNativeFunction('spawn_shards', async (args: RuntimeValue[]) => {
  if (args.length !== 0) {
    throw new RuntimeError(`spawn_shards() expects 0 arguments, got ${args.length}`);
  }

  if (!globalShardManager) {
    throw new RuntimeError('Shard manager not initialized. Call create_shard_manager() first.');
  }

  try {
    const shards = await globalShardManager.spawn();

    // Convert shards to RuntimeValue array
    const shardArray: RuntimeValue[] = [];

    for (const shard of shards.values()) {
      const shardProps = new Map<string, RuntimeValue>();
      shardProps.set('id', makeNumber(shard.id));
      shardProps.set('ready', makeBoolean(shard.ready));
      shardProps.set('__raw', { __rawValue: shard } as any);
      shardArray.push(makeObject(shardProps));
    }

    console.log(`[ShardManager] Spawned ${shardArray.length} shard(s)`);

    return makeArray(shardArray);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    throw new RuntimeError(`Failed to spawn shards: ${errorMsg}`);
  }
});

/**
 * get_shard_info()
 * Get current shard information
 * Returns object with shard ID, total shards, and guild count
 */
export const getShardInfo = makeNativeFunction('get_shard_info', async (args: RuntimeValue[]) => {
  if (args.length !== 0) {
    throw new RuntimeError(`get_shard_info() expects 0 arguments, got ${args.length}`);
  }

  const client = getDiscordClient();
  if (!client) {
    throw new RuntimeError('Discord client not initialized');
  }

  if (!client.shard) {
    // Not running in sharded mode
    const properties = new Map<string, RuntimeValue>();
    properties.set('shard_id', makeNull());
    properties.set('total_shards', makeNumber(1));
    properties.set('guild_count', makeNumber(client.guilds.cache.size));
    properties.set('sharded', makeBoolean(false));
    return makeObject(properties);
  }

  const shardId = client.shard.ids[0]; // First shard ID (usually only one per process)
  const totalShards = client.shard.count;
  const guildCount = client.guilds.cache.size;

  const properties = new Map<string, RuntimeValue>();
  properties.set('shard_id', makeNumber(shardId));
  properties.set('total_shards', makeNumber(totalShards));
  properties.set('guild_count', makeNumber(guildCount));
  properties.set('sharded', makeBoolean(true));

  return makeObject(properties);
});

/**
 * broadcast_eval(code)
 * Execute code on all shards and return results
 *
 * @param code - JavaScript code to execute on each shard
 * @returns Array of results from each shard
 */
export const broadcastEval = makeNativeFunction('broadcast_eval', async (args: RuntimeValue[]) => {
  if (args.length !== 1) {
    throw new RuntimeError(`broadcast_eval() expects 1 argument (code), got ${args.length}`);
  }

  if (!isString(args[0])) {
    throw new TypeError('Code must be a string');
  }

  const code = args[0].value;

  if (!globalShardManager) {
    throw new RuntimeError('Shard manager not initialized. This function only works with a shard manager.');
  }

  try {
    // Broadcast eval to all shards
    const results = await globalShardManager.broadcastEval((client) => {
      // Execute the code in the context of each shard's client
      // Note: Using Function constructor is necessary for dynamic code execution
      // eslint-disable-next-line no-new-func
      return new Function('client', code)(client);
    });

    // Convert results to RuntimeValue array
    const resultArray: RuntimeValue[] = results.map((result: any) => {
      if (result === null || result === undefined) {
        return makeNull();
      } else if (typeof result === 'string') {
        return makeString(result);
      } else if (typeof result === 'number') {
        return makeNumber(result);
      } else if (typeof result === 'boolean') {
        return makeBoolean(result);
      } else if (Array.isArray(result)) {
        return makeArray(result.map((item: any) => {
          if (typeof item === 'string') return makeString(item);
          if (typeof item === 'number') return makeNumber(item);
          if (typeof item === 'boolean') return makeBoolean(item);
          return makeString(String(item));
        }));
      } else {
        return makeString(JSON.stringify(result));
      }
    });

    return makeArray(resultArray);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    throw new RuntimeError(`Failed to broadcast eval: ${errorMsg}`);
  }
});

/**
 * fetch_client_values(property)
 * Fetch a property value from all shard clients
 *
 * @param property - Property path (e.g., "guilds.cache.size", "users.cache.size")
 * @returns Array of values from each shard
 */
export const fetchClientValues = makeNativeFunction('fetch_client_values', async (args: RuntimeValue[]) => {
  if (args.length !== 1) {
    throw new RuntimeError(`fetch_client_values() expects 1 argument (property), got ${args.length}`);
  }

  if (!isString(args[0])) {
    throw new TypeError('Property must be a string');
  }

  const property = args[0].value;

  if (!globalShardManager) {
    throw new RuntimeError('Shard manager not initialized. This function only works with a shard manager.');
  }

  try {
    // Fetch property from all shards
    const results = await globalShardManager.fetchClientValues(property);

    // Convert results to RuntimeValue array
    const resultArray: RuntimeValue[] = results.map((result: any) => {
      if (result === null || result === undefined) {
        return makeNull();
      } else if (typeof result === 'string') {
        return makeString(result);
      } else if (typeof result === 'number') {
        return makeNumber(result);
      } else if (typeof result === 'boolean') {
        return makeBoolean(result);
      } else if (Array.isArray(result)) {
        return makeArray(result.map((item: any) => {
          if (typeof item === 'string') return makeString(item);
          if (typeof item === 'number') return makeNumber(item);
          if (typeof item === 'boolean') return makeBoolean(item);
          return makeString(String(item));
        }));
      } else {
        return makeString(JSON.stringify(result));
      }
    });

    return makeArray(resultArray);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    throw new RuntimeError(`Failed to fetch client values: ${errorMsg}`);
  }
});

/**
 * respawn_shard(shard_id)
 * Respawn a specific shard
 *
 * @param shard_id - The ID of the shard to respawn
 * @returns true on success
 */
export const respawnShard = makeNativeFunction('respawn_shard', async (args: RuntimeValue[]) => {
  if (args.length !== 1) {
    throw new RuntimeError(`respawn_shard() expects 1 argument (shard_id), got ${args.length}`);
  }

  if (!isNumber(args[0])) {
    throw new TypeError('Shard ID must be a number');
  }

  const shardId = Math.floor(args[0].value);

  if (!globalShardManager) {
    throw new RuntimeError('Shard manager not initialized. This function only works with a shard manager.');
  }

  try {
    const shard = globalShardManager.shards.get(shardId);

    if (!shard) {
      throw new RuntimeError(`Shard ${shardId} not found`);
    }

    await shard.respawn();
    console.log(`[ShardManager] Respawned shard ${shardId}`);

    return makeBoolean(true);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    throw new RuntimeError(`Failed to respawn shard: ${errorMsg}`);
  }
});

/**
 * get_shard_stats()
 * Get statistics for all shards
 * Returns array of shard stat objects with:
 *   - shard_id: Shard ID
 *   - guild_count: Number of guilds
 *   - user_count: Number of users
 *   - ping: Websocket ping
 *   - memory: Memory usage
 */
export const getShardStats = makeNativeFunction('get_shard_stats', async (args: RuntimeValue[]) => {
  if (args.length !== 0) {
    throw new RuntimeError(`get_shard_stats() expects 0 arguments, got ${args.length}`);
  }

  if (!globalShardManager) {
    throw new RuntimeError('Shard manager not initialized. This function only works with a shard manager.');
  }

  try {
    // Fetch stats from all shards
    const statsArray: RuntimeValue[] = [];

    for (const [shardId, shard] of globalShardManager.shards) {
      try {
        // Fetch detailed stats from each shard
        const shardStats = await shard.eval((client) => {
          return {
            guild_count: client.guilds.cache.size,
            user_count: client.users.cache.size,
            ping: client.ws.ping,
            memory: process.memoryUsage().heapUsed / 1024 / 1024, // MB
            uptime: client.uptime,
            ready: client.isReady(),
          };
        });

        const properties = new Map<string, RuntimeValue>();
        properties.set('shard_id', makeNumber(shardId));
        properties.set('guild_count', makeNumber(shardStats.guild_count));
        properties.set('user_count', makeNumber(shardStats.user_count));
        properties.set('ping', makeNumber(shardStats.ping));
        properties.set('memory_mb', makeNumber(Math.round(shardStats.memory * 100) / 100));
        properties.set('uptime_ms', makeNumber(shardStats.uptime || 0));
        properties.set('ready', makeBoolean(shardStats.ready));

        statsArray.push(makeObject(properties));
      } catch (error) {
        // If shard is not ready or has an error, add basic info
        const properties = new Map<string, RuntimeValue>();
        properties.set('shard_id', makeNumber(shardId));
        properties.set('ready', makeBoolean(shard.ready));
        properties.set('error', makeString('Unable to fetch stats'));
        statsArray.push(makeObject(properties));
      }
    }

    return makeArray(statsArray);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    throw new RuntimeError(`Failed to get shard stats: ${errorMsg}`);
  }
});

// Export all sharding functions
export const shardingBuiltins = {
  create_shard_manager: createShardManager,
  spawn_shards: spawnShards,
  get_shard_info: getShardInfo,
  broadcast_eval: broadcastEval,
  fetch_client_values: fetchClientValues,
  respawn_shard: respawnShard,
  get_shard_stats: getShardStats,
};
