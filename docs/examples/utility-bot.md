---
layout: default
title: Utility Bot Example
---

# Utility Bot Example

Useful utilities like polls, reminders, and info commands.

## Code

```ezlang
// utility-bot.ezlang

listen("messageCreate", function(message) {
    if message.author.bot { return }

    // Poll command
    if message.content starts_with "!poll " {
        let parts = split(message.content, " ")
        let question = parts[1]

        let poll = create_poll({
            "question": question,
            "answers": ["Yes", "No", "Maybe"],
            "duration": 24
        })

        send_poll(message.channel.id, poll)
    }

    // Remind command
    if message.content starts_with "!remind " {
        let parts = split(message.content, " ")
        let minutes = to_number(parts[1])
        let text = join(slice(parts, 2), " ")

        reply(message, "✅ I'll remind you in " + to_string(minutes) + " minutes")

        let task = create_scheduled_task(function() {
            send_message(message.channel.id, mention_user(message.author.id) + " Reminder: " + text)
        }, now() + (minutes * 60000))

        start_task(task)
    }

    // Invite command
    if message.content == "!createinvite" {
        let invite = create_invite(message.channel.id, {
            "maxAge": 3600,
            "maxUses": 10
        })
        reply(message, "Invite created: " + invite.url)
    }
})

bot_start(get_env("BOT_TOKEN"))
```

[← Back to Examples](/EasyLang/examples/)
