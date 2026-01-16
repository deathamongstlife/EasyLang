# Discord Sharding Support

Discord sharding is a method of horizontally scaling your bot by splitting it across multiple processes. This is **required** for bots serving 2,500+ servers and is recommended for bots approaching this limit.

## What is Sharding?

Sharding splits your bot into multiple separate processes (called "shards"), where each shard handles a subset of your bot's servers. This allows your bot to:

- Handle more than 2,500 servers (Discord's requirement)
- Distribute load across multiple processes
- Improve performance and reliability
- Scale horizontally across multiple machines

## When Do You Need Sharding?

- **Required**: Your bot is in 2,500+ servers
- **Recommended**: Your bot is approaching 2,000 servers
- **Optional**: You want to improve performance even with fewer servers

## Available Functions

### Shard Manager Functions

#### `create_shard_manager(bot_file, options)`

Creates a shard manager that will spawn and manage multiple bot processes.

**Parameters:**
- `bot_file` (string): Path to your main bot file (.ez or .js)
- `options` (object):
  - `token` (string): Your Discord bot token
  - `total_shards` (number | "auto"): Number of shards to spawn (default: "auto")
  - `shard_list` (array): Specific shard IDs to spawn (optional)
  - `respawn` (boolean): Auto-respawn crashed shards (default: true)

**Returns:** Shard manager object

**Example:**
```easylang
let manager = create_shard_manager("bot.js", {
  token: "YOUR_BOT_TOKEN",
  total_shards: "auto",
  respawn: true
})
```

**Custom Shard Count:**
```easylang
let manager = create_shard_manager("bot.js", {
  token: "YOUR_BOT_TOKEN",
  total_shards: 4  // Spawn exactly 4 shards
})
```

**Specific Shard List (for distributed hosting):**
```easylang
// Server 1 runs shards 0-3
let manager1 = create_shard_manager("bot.js", {
  token: "YOUR_BOT_TOKEN",
  total_shards: 8,
  shard_list: [0, 1, 2, 3]
})

// Server 2 runs shards 4-7
let manager2 = create_shard_manager("bot.js", {
  token: "YOUR_BOT_TOKEN",
  total_shards: 8,
  shard_list: [4, 5, 6, 7]
})
```

---

#### `spawn_shards()`

Spawns all shards configured in the shard manager.

**Parameters:** None

**Returns:** Array of shard objects

**Example:**
```easylang
let shards = spawn_shards()
print("Spawned " + str(length(shards)) + " shard(s)")
```

---

#### `get_shard_info()`

Gets information about the current shard (called from within a shard process).

**Parameters:** None

**Returns:** Object with:
- `shard_id` (number | null): Current shard ID
- `total_shards` (number): Total number of shards
- `guild_count` (number): Guilds on this shard
- `sharded` (boolean): Whether running in sharded mode

**Example:**
```easylang
let info = get_shard_info()

if info.sharded {
  print("Shard " + str(info.shard_id) + "/" + str(info.total_shards))
  print("Guilds: " + str(info.guild_count))
} else {
  print("Not running in sharded mode")
}
```

---

#### `broadcast_eval(code)`

Executes JavaScript code on all shards and returns the results.

**Parameters:**
- `code` (string): JavaScript code to execute

**Returns:** Array of results from each shard

**Example:**
```easylang
// Get guild count from each shard
let guild_counts = broadcast_eval("return client.guilds.cache.size")
print("Guilds per shard: " + str(guild_counts))

// Calculate total guilds
let total = 0
for i in range(length(guild_counts)) {
  total = total + guild_counts[i]
}
print("Total guilds: " + str(total))

// Get bot username
let usernames = broadcast_eval("return client.user.username")
print("Bot: " + usernames[0])
```

---

#### `fetch_client_values(property)`

Fetches a specific property value from all shard clients.

**Parameters:**
- `property` (string): Property path to fetch (e.g., "guilds.cache.size")

**Returns:** Array of values from each shard

**Example:**
```easylang
// Get guild counts
let guilds = fetch_client_values("guilds.cache.size")
print("Guilds: " + str(guilds))

// Get user counts
let users = fetch_client_values("users.cache.size")
print("Users: " + str(users))

// Get websocket pings
let pings = fetch_client_values("ws.ping")
print("Pings: " + str(pings))
```

---

#### `respawn_shard(shard_id)`

Respawns a specific shard (useful if it crashes or needs a restart).

**Parameters:**
- `shard_id` (number): ID of the shard to respawn

**Returns:** Boolean indicating success

**Example:**
```easylang
// Respawn shard 0
let success = respawn_shard(0)

if success {
  print("Shard respawned successfully")
  wait(5)  // Wait for it to be ready
}
```

---

#### `get_shard_stats()`

Gets detailed statistics for all shards.

**Parameters:** None

**Returns:** Array of stat objects with:
- `shard_id` (number): Shard ID
- `guild_count` (number): Number of guilds
- `user_count` (number): Number of users
- `ping` (number): WebSocket ping in ms
- `memory_mb` (number): Memory usage in MB
- `uptime_ms` (number): Uptime in milliseconds
- `ready` (boolean): Whether shard is ready

**Example:**
```easylang
let stats = get_shard_stats()

for i in range(length(stats)) {
  let stat = stats[i]
  print("Shard " + str(stat.shard_id) + ":")
  print("  Guilds: " + str(stat.guild_count))
  print("  Users: " + str(stat.user_count))
  print("  Ping: " + str(stat.ping) + "ms")
  print("  Memory: " + str(stat.memory_mb) + "MB")
  print("  Ready: " + str(stat.ready))
}
```

---

## Complete Example

### 1. Shard Manager File (`manager.ez`)

```easylang
// manager.ez - Manages all shards

// Create shard manager
let manager = create_shard_manager("bot.ez", {
  token: get_argument("TOKEN", "YOUR_BOT_TOKEN"),
  total_shards: "auto",
  respawn: true
})

print("Shard manager created")

// Spawn all shards
let shards = spawn_shards()
print("Spawned " + str(length(shards)) + " shard(s)")

// Wait for shards to be ready
wait(10)

// Display initial stats
print("\nInitial Statistics:")
let stats = get_shard_stats()

for i in range(length(stats)) {
  let stat = stats[i]
  print("Shard " + str(stat.shard_id) + ": " +
        str(stat.guild_count) + " guilds, " +
        str(stat.ping) + "ms ping")
}

// Periodic stats monitoring
print("\nMonitoring shards...")
while true {
  wait(60)  // Every minute

  let current_stats = get_shard_stats()
  let total_guilds = 0
  let total_users = 0

  for i in range(length(current_stats)) {
    total_guilds = total_guilds + current_stats[i].guild_count
    total_users = total_users + current_stats[i].user_count
  }

  print("Total: " + str(total_guilds) + " guilds, " +
        str(total_users) + " users across " +
        str(length(current_stats)) + " shards")
}
```

### 2. Bot File (`bot.ez`)

```easylang
// bot.ez - Bot code that runs on each shard

on_ready(func() {
  let info = get_shard_info()

  print("Bot ready on shard " + str(info.shard_id) + "/" + str(info.total_shards))
  print("Handling " + str(info.guild_count) + " guilds")

  set_status("online")
  set_activity("watching", "Shard " + str(info.shard_id))
})

on_message(func(message) {
  // Ignore bot messages
  if message.author.bot {
    return
  }

  // !shardinfo - Show current shard info
  if message.content == "!shardinfo" {
    let info = get_shard_info()

    send_message(message.channel_id,
      "**Shard Information**\n" +
      "Shard ID: " + str(info.shard_id) + "\n" +
      "Total Shards: " + str(info.total_shards) + "\n" +
      "Guilds on this shard: " + str(info.guild_count))
  }

  // !ping - Show shard latency
  if message.content == "!ping" {
    let info = get_shard_info()
    send_message(message.channel_id,
      "Pong! Shard " + str(info.shard_id) + " is responding.")
  }

  // Other bot commands...
})

// Start the bot
let token = get_argument("TOKEN", "YOUR_BOT_TOKEN")
bot_start(token)
```

### 3. Running the Bot

```bash
# Method 1: Run manager directly
easylang manager.ez TOKEN=YOUR_BOT_TOKEN

# Method 2: Set token in environment
export TOKEN=YOUR_BOT_TOKEN
easylang manager.ez
```

---

## Best Practices

### 1. Shard Count Selection

- **"auto"**: Let Discord calculate optimal shard count (recommended)
- **Custom count**: Use when you need specific distribution
- **Formula**: `shards = guilds / 1000` (rounded up)

### 2. Resource Allocation

Each shard needs:
- **Memory**: ~100-200 MB
- **CPU**: Minimal, scales with activity
- **Network**: One WebSocket connection per shard

### 3. Distributed Hosting

You can run different shards on different servers:

**Server 1:**
```easylang
create_shard_manager("bot.ez", {
  token: "TOKEN",
  total_shards: 8,
  shard_list: [0, 1, 2, 3]  // First half
})
```

**Server 2:**
```easylang
create_shard_manager("bot.ez", {
  token: "TOKEN",
  total_shards: 8,
  shard_list: [4, 5, 6, 7]  // Second half
})
```

### 4. Error Handling

Always enable auto-respawn:
```easylang
create_shard_manager("bot.ez", {
  token: "TOKEN",
  respawn: true  // Crucial for reliability
})
```

### 5. Monitoring

Monitor your shards regularly:
```easylang
// Every 5 minutes
while true {
  wait(300)

  let stats = get_shard_stats()
  for i in range(length(stats)) {
    if not stats[i].ready {
      print("WARNING: Shard " + str(stats[i].shard_id) + " is not ready!")
      respawn_shard(stats[i].shard_id)
    }
  }
}
```

---

## Common Patterns

### Aggregate Data Across Shards

```easylang
// Get total guild count
let guild_counts = fetch_client_values("guilds.cache.size")
let total = 0
for i in range(length(guild_counts)) {
  total = total + guild_counts[i]
}
print("Total guilds: " + str(total))
```

### Find a Guild's Shard

```easylang
// Guild ID determines which shard it's on
// Formula: (guild_id >> 22) % total_shards

func get_guild_shard_id(guild_id, total_shards) {
  // Note: This is a simplified example
  // In practice, you'd use the actual formula
  return guild_id % total_shards
}
```

### Broadcast a Message to All Shards

```easylang
// Send announcement to all shards
let channel_id = "1234567890"
broadcast_eval(
  "client.channels.cache.get('" + channel_id + "')?.send('Announcement!')"
)
```

---

## Troubleshooting

### Shard Not Starting

**Symptom**: Shard stays in "not ready" state

**Solutions**:
1. Check bot token is valid
2. Verify bot has proper intents enabled
3. Check network connectivity
4. Review shard logs for errors

### High Memory Usage

**Symptom**: Shards using too much memory

**Solutions**:
1. Reduce cache sizes in bot code
2. Increase shard count to distribute load
3. Implement cache sweeping
4. Consider dedicated hosting

### Uneven Guild Distribution

**Symptom**: Some shards have many more guilds than others

**Solutions**:
1. This is normal - Discord distributes guilds by ID
2. Consider increasing shard count if some are overloaded
3. Monitor shard stats to identify issues

---

## Limits and Considerations

- **Minimum Shards**: 1 (no sharding)
- **Maximum Shards**: 16 per token (contact Discord for more)
- **Shard Scaling**: Add shards before reaching 2,500 servers per shard
- **Startup Time**: Shards start sequentially with 5-second delays
- **Memory**: ~100-200 MB per shard baseline

---

## Additional Resources

- [Discord Sharding Guide](https://discord.com/developers/docs/topics/gateway#sharding)
- [Discord.js Sharding](https://discordjs.guide/sharding/)
- See `examples/sharding-example.ez` for more examples
