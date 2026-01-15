---
layout: default
title: Cooldowns
description: Implement command cooldowns and rate limiting
---

# Cooldowns

Prevent command spam with per-user, channel, or global cooldowns.

## Functions

- `add_cooldown` - Add cooldown to command
- `is_on_cooldown` - Check if on cooldown
- `get_cooldown_remaining` - Get remaining time
- `reset_cooldown` - Reset user's cooldown
- `clear_all_cooldowns` - Clear all cooldowns

## Example

```ezlang
listen("messageCreate", function(message) {
    if message.content == "!daily" {
        if is_on_cooldown("daily", message.author.id) {
            let remaining = get_cooldown_remaining("daily", message.author.id)
            reply(message, "Cooldown active: " + to_string(remaining) + "s remaining")
            return
        }

        add_cooldown("daily", message.author.id, 86400)  // 24 hours
        reply(message, "Daily reward claimed! 🎁")
    }
})
```

[← Back to Features](/EasyLang/features/)
