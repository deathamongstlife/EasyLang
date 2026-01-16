# Discord Sharding - Quick Reference

## When to Use Sharding
- **Required**: 2,500+ servers
- **Recommended**: 2,000+ servers
- **Optional**: Any size for better performance

## 7 Core Functions

### 1. Create Shard Manager
```easylang
let manager = create_shard_manager("bot.ez", {
  token: "YOUR_TOKEN",
  total_shards: "auto",  // or number
  shard_list: [0, 1, 2], // optional
  respawn: true
})
```

### 2. Spawn Shards
```easylang
let shards = spawn_shards()
// Returns: Array of shard objects
```

### 3. Get Shard Info (from shard process)
```easylang
let info = get_shard_info()
// Returns: { shard_id, total_shards, guild_count, sharded }
```

### 4. Broadcast Eval
```easylang
let results = broadcast_eval("return client.guilds.cache.size")
// Executes code on all shards
```

### 5. Fetch Client Values
```easylang
let guilds = fetch_client_values("guilds.cache.size")
let users = fetch_client_values("users.cache.size")
let pings = fetch_client_values("ws.ping")
```

### 6. Respawn Shard
```easylang
let success = respawn_shard(0)
// Restarts shard ID 0
```

### 7. Get Shard Stats
```easylang
let stats = get_shard_stats()
// Returns: Array of { shard_id, guild_count, user_count, ping, memory_mb, uptime_ms, ready }
```

## Minimal Setup

**manager.ez:**
```easylang
let manager = create_shard_manager("bot.ez", {
  token: get_argument("TOKEN"),
  total_shards: "auto",
  respawn: true
})
spawn_shards()
```

**bot.ez:**
```easylang
on_ready(func() {
  let info = get_shard_info()
  print("Shard " + str(info.shard_id) + " ready!")
})

on_message(func(message) {
  // Your bot logic here
})

bot_start(get_argument("TOKEN"))
```

**Run:**
```bash
easylang manager.ez TOKEN=YOUR_BOT_TOKEN
```

## Common Patterns

### Total Guild Count
```easylang
let counts = fetch_client_values("guilds.cache.size")
let total = 0
for i in range(length(counts)) {
  total = total + counts[i]
}
```

### Monitor All Shards
```easylang
let stats = get_shard_stats()
for i in range(length(stats)) {
  print("Shard " + str(stats[i].shard_id) + ": " +
        str(stats[i].guild_count) + " guilds, " +
        str(stats[i].ping) + "ms")
}
```

### Check Shard Health
```easylang
let stats = get_shard_stats()
for i in range(length(stats)) {
  if not stats[i].ready {
    print("Shard " + str(stats[i].shard_id) + " down!")
    respawn_shard(stats[i].shard_id)
  }
}
```

## Distributed Hosting

**Server 1:**
```easylang
create_shard_manager("bot.ez", {
  token: "TOKEN",
  total_shards: 8,
  shard_list: [0, 1, 2, 3]
})
```

**Server 2:**
```easylang
create_shard_manager("bot.ez", {
  token: "TOKEN",
  total_shards: 8,
  shard_list: [4, 5, 6, 7]
})
```

## Files & Documentation

- **Implementation**: `src/discord/extensions/discord-sharding.ts`
- **Examples**: `examples/sharding-example.ez`
- **Full Docs**: `docs/SHARDING.md`
- **Tests**: `tests/sharding-test.ez`

## Key Points

- Use `"auto"` for shard count (Discord calculates optimal)
- Always enable `respawn: true` for reliability
- Monitor shards regularly with `get_shard_stats()`
- Each shard needs ~100-200 MB of memory
- Shards start sequentially with 5-second delays
- Maximum 16 shards per token (default)

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Shard won't start | Check token, intents, network |
| High memory | Reduce cache, increase shard count |
| Uneven distribution | Normal - guilds distributed by ID |
| Manager not found error | Call `create_shard_manager()` first |
