---
layout: default
title: Event Bot Example
---

# Event Bot Example

Scheduled events and reminder system.

## Code

```ezlang
// event-bot.ezlang

listen("messageCreate", function(message) {
    // Create event
    if message.content starts_with "!createevent " {
        let event = create_scheduled_event(message.guild.id, {
            "name": "Community Game Night",
            "scheduledStartTime": "2024-12-25T20:00:00Z",
            "scheduledEndTime": "2024-12-25T23:00:00Z",
            "privacyLevel": 2,
            "entityType": 2,
            "description": "Let's play games together!"
        })

        reply(message, "✅ Event created!")
    }
})

// Daily reminder task
let reminder = create_loop(function() {
    send_message(channel_id, "📢 Daily reminder: Stay hydrated! 💧")
}, 86400000)  // 24 hours

start_task(reminder)

bot_start(get_env("BOT_TOKEN"))
```

[← Back to Examples](/EasyLang/examples/)
