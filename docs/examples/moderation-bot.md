---
layout: default
title: Moderation Bot Example
---

# Moderation Bot Example

Complete moderation system with AutoMod.

## Complete Code

```ezlang
// moderation-bot.ezlang

let log_channel = "YOUR_LOG_CHANNEL_ID"

listen("ready", function() {
    print("🛡️ Moderation Bot Online!")

    // Setup AutoMod rules
    setup_automod()
})

function setup_automod() {
    // Bad words filter
    create_automod_rule(guild_id, {
        "name": "Bad Words Filter",
        "eventType": 1,
        "triggerType": 1,
        "triggerMetadata": {
            "keywordFilter": ["badword1", "badword2"]
        },
        "actions": [
            {"type": 1},  // Block message
            {"type": 2, "metadata": {"channel": log_channel}}
        ]
    })
}

listen("messageCreate", function(message) {
    if message.author.bot { return }

    // Check for mod permissions
    let member = get_member(message.guild.id, message.author.id)
    let is_mod = has_permission(member, "MODERATE_MEMBERS")

    // Kick command
    if message.content starts_with "!kick " and is_mod {
        if length(message.mentions) > 0 {
            let target = message.mentions[0]
            kick_member(message.guild.id, target.id, "Kicked by moderator")
            reply(message, "✅ Kicked " + target.username)

            // Log action
            let embed = create_embed({
                "title": "👢 User Kicked",
                "color": "#FEE75C"
            })
            embed_add_field(embed, "User", target.username, true)
            embed_add_field(embed, "Moderator", message.author.username, true)
            send_message(log_channel, "", embed)
        }
    }

    // Ban command
    if message.content starts_with "!ban " and is_mod {
        if length(message.mentions) > 0 {
            let target = message.mentions[0]
            let parts = split(message.content, " ")
            let reason = join(slice(parts, 2), " ") or "No reason provided"

            ban_member(message.guild.id, target.id, reason)
            reply(message, "✅ Banned " + target.username)

            // Log action
            let embed = create_embed({
                "title": "🔨 User Banned",
                "color": "#ED4245"
            })
            embed_add_field(embed, "User", target.username, true)
            embed_add_field(embed, "Moderator", message.author.username, true)
            embed_add_field(embed, "Reason", reason, false)
            send_message(log_channel, "", embed)
        }
    }

    // Timeout command
    if message.content starts_with "!timeout " and is_mod {
        if length(message.mentions) > 0 {
            let target = message.mentions[0]
            let parts = split(message.content, " ")
            let minutes = to_number(parts[2]) or 10

            timeout_member(message.guild.id, target.id, minutes * 60000)
            reply(message, "✅ Timed out " + target.username + " for " + to_string(minutes) + " minutes")
        }
    }

    // Clear command
    if message.content starts_with "!clear " and is_mod {
        let parts = split(message.content, " ")
        let count = to_number(parts[1])

        if count > 0 and count <= 100 {
            let messages = fetch_messages(message.channel.id, {"limit": count})
            let ids = []
            for msg in messages {
                push(ids, msg.id)
            }
            bulk_delete(message.channel.id, ids)
            reply(message, "✅ Cleared " + to_string(count) + " messages")
        }
    }
})

bot_start(get_env("BOT_TOKEN"))
```

## Features

- Kick, ban, timeout
- AutoMod rules
- Message bulk delete
- Audit logging
- Permission checks

[← Back to Examples](/EasyLang/examples/)
