---
layout: default
title: Messaging
description: Send, edit, delete, and manage Discord messages
---

# Messaging

Learn how to send, edit, delete, and manage messages in Discord channels.

## Overview

Messaging is the foundation of any Discord bot. EasyLang provides simple yet powerful functions to handle all message operations, from sending basic text to complex embeds with components.

## Available Functions

| Function | Parameters | Returns | Description |
|----------|-----------|---------|-------------|
| `send_message` | channel_id, content, embed?, components? | Message | Send a message to a channel |
| `reply` | message, content, embed?, components? | Message | Reply to a message |
| `edit_message` | message_id, channel_id, new_content, embed? | Message | Edit an existing message |
| `delete_message` | message_id, channel_id | Boolean | Delete a message |
| `bulk_delete` | channel_id, message_ids | Boolean | Delete multiple messages |
| `fetch_message` | channel_id, message_id | Message | Fetch a specific message |
| `fetch_messages` | channel_id, options? | Array | Fetch multiple messages |
| `pin_message` | channel_id, message_id | Boolean | Pin a message |
| `unpin_message` | channel_id, message_id | Boolean | Unpin a message |
| `fetch_pinned_messages` | channel_id | Array | Get all pinned messages |
| `crosspost_message` | channel_id, message_id | Message | Crosspost to following channels |
| `react` | message, emoji | Boolean | Add a reaction to a message |
| `remove_reaction` | message_id, channel_id, emoji, user_id? | Boolean | Remove a reaction |
| `remove_all_reactions` | message_id, channel_id | Boolean | Remove all reactions |

## Examples

### Basic Message Sending

Send a simple text message:

```ezlang
listen("messageCreate", function(message) {
    if message.content == "!hello" {
        send_message(message.channel.id, "Hello, world!")
    }
})
```

### Reply to Messages

Reply directly to a user's message:

```ezlang
listen("messageCreate", function(message) {
    if message.content == "!ping" {
        reply(message, "Pong! 🏓")
    }
})
```

### Send with Mentions

Mention users in your messages:

```ezlang
listen("messageCreate", function(message) {
    if message.content == "!greet" {
        let greeting = "Hello, " + mention_user(message.author.id) + "!"
        send_message(message.channel.id, greeting)
    }
})
```

### Edit Messages

Edit a message after sending:

```ezlang
listen("messageCreate", function(message) {
    if message.content == "!countdown" {
        let msg = send_message(message.channel.id, "3...")

        sleep(1000)
        edit_message(msg.id, message.channel.id, "2...")

        sleep(1000)
        edit_message(msg.id, message.channel.id, "1...")

        sleep(1000)
        edit_message(msg.id, message.channel.id, "Go! 🚀")
    }
})
```

### Delete Messages

Delete messages programmatically:

```ezlang
listen("messageCreate", function(message) {
    // Delete messages containing bad words
    if contains(lower(message.content), "badword") {
        delete_message(message.id, message.channel.id)

        let warning = send_message(message.channel.id,
            message.author.username + ", please don't use inappropriate language!")

        // Delete warning after 5 seconds
        sleep(5000)
        delete_message(warning.id, message.channel.id)
    }
})
```

### Bulk Delete Messages

Delete multiple messages at once:

```ezlang
listen("messageCreate", function(message) {
    if message.content starts_with "!clear " {
        let parts = split(message.content, " ")
        let count = to_number(parts[1])

        // Fetch recent messages
        let messages = fetch_messages(message.channel.id, {"limit": count})

        // Get message IDs
        let ids = []
        for msg in messages {
            push(ids, msg.id)
        }

        // Bulk delete
        bulk_delete(message.channel.id, ids)
        reply(message, "Deleted " + to_string(count) + " messages!")
    }
})
```

### Fetch Message History

Retrieve previous messages:

```ezlang
listen("messageCreate", function(message) {
    if message.content == "!history" {
        // Get last 10 messages
        let messages = fetch_messages(message.channel.id, {"limit": 10})

        let history = "**Recent Messages:**\n"
        for msg in messages {
            history = history + msg.author.username + ": " + msg.content + "\n"
        }

        send_message(message.channel.id, history)
    }
})
```

### Pin Messages

Pin important messages:

```ezlang
listen("messageCreate", function(message) {
    if message.content == "!pin" {
        // Pin the message this command is replying to
        if message.reference != null {
            let reply_id = message.reference.messageId
            pin_message(message.channel.id, reply_id)
            reply(message, "Message pinned! 📌")
        }
    }

    if message.content == "!unpin" {
        if message.reference != null {
            let reply_id = message.reference.messageId
            unpin_message(message.channel.id, reply_id)
            reply(message, "Message unpinned!")
        }
    }
})
```

### Reactions

Add reactions to messages:

```ezlang
listen("messageCreate", function(message) {
    // React to specific keywords
    if contains(lower(message.content), "pizza") {
        react(message, "🍕")
    }

    if contains(lower(message.content), "awesome") {
        react(message, "😎")
    }

    // React with multiple emojis
    if message.content == "!vote" {
        react(message, "👍")
        react(message, "👎")
    }
})
```

### Advanced Reactions

Handle reaction events:

```ezlang
listen("messageReactionAdd", function(reaction, user) {
    // Ignore bot reactions
    if user.bot {
        return
    }

    // Check if reaction is thumbs up
    if reaction.emoji.name == "👍" {
        let channel = reaction.message.channel
        send_message(channel.id, user.username + " liked this message!")
    }
})

listen("messageReactionRemove", function(reaction, user) {
    if user.bot {
        return
    }

    if reaction.emoji.name == "👍" {
        let channel = reaction.message.channel
        send_message(channel.id, user.username + " unliked this message!")
    }
})
```

### Crossposting (Announcement Channels)

Publish messages to following channels:

```ezlang
listen("messageCreate", function(message) {
    // Auto-crosspost in announcement channels
    if message.channel.type == 5 {  // News channel
        crosspost_message(message.channel.id, message.id)
    }
})
```

## Common Patterns

### Auto-Delete Command Messages

Delete command messages for clean channels:

```ezlang
listen("messageCreate", function(message) {
    if starts_with(message.content, "!") {
        // Process command
        let response = handle_command(message)

        // Delete command message
        delete_message(message.id, message.channel.id)

        // Send response
        send_message(message.channel.id, response)
    }
})
```

### Temporary Messages

Send messages that auto-delete:

```ezlang
function send_temporary(channel_id, content, seconds) {
    let msg = send_message(channel_id, content)

    // Delete after specified seconds
    sleep(seconds * 1000)
    delete_message(msg.id, channel_id)
}

// Usage
send_temporary(channel_id, "This will disappear in 5 seconds!", 5)
```

### Message Pagination

Paginate long content:

```ezlang
function paginate(content, page_size) {
    let pages = []
    let current_page = ""
    let lines = split(content, "\n")

    for line in lines {
        if length(current_page + line) > page_size {
            push(pages, current_page)
            current_page = line + "\n"
        } else {
            current_page = current_page + line + "\n"
        }
    }

    if length(current_page) > 0 {
        push(pages, current_page)
    }

    return pages
}

// Usage
let pages = paginate(long_text, 2000)
for page in pages {
    send_message(channel_id, page)
    sleep(500)
}
```

### Quote Messages

Create a quote system:

```ezlang
listen("messageCreate", function(message) {
    if message.content == "!quote" and message.reference != null {
        let quoted_id = message.reference.messageId
        let quoted = fetch_message(message.channel.id, quoted_id)

        let quote = "💬 **Quote from " + quoted.author.username + ":**\n"
        quote = quote + "> " + quoted.content + "\n"
        quote = quote + "*Quoted by " + message.author.username + "*"

        send_message(message.channel.id, quote)
    }
})
```

## Tips and Best Practices

### Rate Limiting

Be mindful of Discord's rate limits:

```ezlang
// Bad: Sending too quickly
for i in range(1, 100) {
    send_message(channel_id, "Message " + to_string(i))
}

// Good: Add delays
for i in range(1, 100) {
    send_message(channel_id, "Message " + to_string(i))
    sleep(1000)  // Wait 1 second
}
```

### Message Length

Discord messages have a 2000 character limit:

```ezlang
function safe_send(channel_id, content) {
    if length(content) > 2000 {
        // Split into chunks
        let chunk1 = slice_string(content, 0, 2000)
        let chunk2 = slice_string(content, 2000)
        send_message(channel_id, chunk1)
        send_message(channel_id, chunk2)
    } else {
        send_message(channel_id, content)
    }
}
```

### Check Permissions

Verify bot has permissions before operations:

```ezlang
function can_manage_messages(channel_id) {
    let permissions = get_bot_permissions(channel_id)
    return has_permission(permissions, "MANAGE_MESSAGES")
}

// Use before bulk delete
if can_manage_messages(channel_id) {
    bulk_delete(channel_id, message_ids)
} else {
    reply(message, "I don't have permission to manage messages!")
}
```

## Related Features

- [Embeds](/EasyLang/features/embeds) - Create rich embed messages
- [Components](/EasyLang/features/components) - Add buttons and menus to messages
- [Moderation](/EasyLang/features/moderation) - Advanced message management
- [Channels](/EasyLang/features/channels) - Channel management

## See Also

- [API: Discord Functions](/EasyLang/api/discord-functions)
- [Example: Basic Bot](/EasyLang/examples/basic-bot)

[← Back to Features](/EasyLang/features/)
