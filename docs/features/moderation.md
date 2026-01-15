---
layout: default
title: Moderation
description: Kick, ban, timeout, and moderate users
---

# Moderation

Essential moderation functions to manage your server.

## Functions

- `kick_member` - Kick a member
- `ban_member` - Ban a member
- `unban_user` - Unban a user
- `timeout_member` - Timeout (mute) member
- `remove_timeout` - Remove timeout
- `fetch_bans` - Get list of bans

## Examples

### Kick Command

```ezlang
listen("messageCreate", function(message) {
    if message.content starts_with "!kick " {
        let parts = split(message.content, " ")
        let user_id = parts[1]

        kick_member(message.guild.id, user_id, "Kicked by moderator")
        reply(message, "User kicked successfully")
    }
})
```

### Ban Command

```ezlang
if message.content starts_with "!ban " {
    let parts = split(message.content, " ")
    let user_id = parts[1]
    let reason = join(slice(parts, 2), " ")

    ban_member(message.guild.id, user_id, reason)
    reply(message, "User banned")
}
```

### Timeout Command

```ezlang
// Timeout for 10 minutes
timeout_member(guild_id, user_id, 600000, "Spamming")
```

[← Back to Features](/EasyLang/features/)
