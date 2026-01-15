---
layout: default
title: Advanced Bot Example
---

# Advanced Bot Example

Comprehensive bot combining all features with proper structure.

## Features

- Command handler
- Error handling
- Cooldowns
- Permission system
- Logging
- Database (via Python bridge)
- All Discord features

## Code Structure

```ezlang
// advanced-bot.ezlang

// Configuration
let config = {
    "prefix": "!",
    "owner_id": "YOUR_USER_ID",
    "log_channel": "LOG_CHANNEL_ID"
}

// Command cooldowns
let cooldowns = {}

// Command handler
function handle_command(message, command, args) {
    // Check cooldown
    if is_on_cooldown("cmd_" + command, message.author.id) {
        let remaining = get_cooldown_remaining("cmd_" + command, message.author.id)
        reply(message, "⏱️ Cooldown: " + to_string(remaining) + "s")
        return
    }

    // Execute command
    if command == "ping" {
        add_cooldown("cmd_ping", message.author.id, 5)
        reply(message, "Pong!")
    }

    // Add more commands...
}

listen("messageCreate", function(message) {
    if message.author.bot { return }
    if not starts_with(message.content, config.prefix) { return }

    let parts = split(message.content, " ")
    let command = slice_string(parts[0], 1)
    let args = slice(parts, 1)

    try {
        handle_command(message, command, args)
    } catch error {
        reply(message, "❌ Error: " + error)
        log_error(error, message)
    }
})

function log_error(error, message) {
    let embed = create_embed({
        "title": "❌ Error",
        "description": error,
        "color": "#ED4245"
    })
    send_message(config.log_channel, "", embed)
}

bot_start(get_env("BOT_TOKEN"))
```

This example shows best practices for structuring larger bots.

[← Back to Examples](/EasyLang/examples/)
