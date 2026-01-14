# Tier 1 Discord Features - Implementation Guide

This document describes all Tier 1 essential Discord features implemented in EzLang, providing comprehensive Discord.js v14 and discord.py parity.

---

## 📋 Table of Contents

1. [Enhanced Embed Functions](#1-enhanced-embed-functions)
2. [Message Reactions](#2-message-reactions)
3. [Pin Management](#3-pin-management)
4. [Ban Management](#4-ban-management)
5. [Bulk Message Operations](#5-bulk-message-operations)
6. [Context Menu Commands](#6-context-menu-commands)
7. [File System Built-ins](#7-file-system-built-ins)
8. [Complete Examples](#8-complete-examples)

---

## 1. Enhanced Embed Functions

Create rich, professional embeds with all Discord.js v14 features.

### `embed_set_author(embed, name, iconURL?, url?)`

Set the author section of an embed.

**Parameters:**
- `embed` - The embed object
- `name` (string) - Author name
- `iconURL` (string, optional) - Author icon URL
- `url` (string, optional) - Author URL (clickable name)

**Example:**
```ezlang
let embed = create_embed("Title", "Description", 0x5865F2)
embed_set_author(embed, "Bot Name", "https://example.com/icon.png", "https://example.com")
```

---

### `embed_set_footer(embed, text, iconURL?)`

Set the footer section of an embed.

**Parameters:**
- `embed` - The embed object
- `text` (string) - Footer text
- `iconURL` (string, optional) - Footer icon URL

**Example:**
```ezlang
let embed = create_embed("Title", "Description", 0x5865F2)
embed_set_footer(embed, "Powered by EzLang", "https://example.com/icon.png")
```

---

### `embed_set_image(embed, url)`

Set the large image of an embed (appears at bottom).

**Parameters:**
- `embed` - The embed object
- `url` (string) - Image URL

**Example:**
```ezlang
let embed = create_embed("Gallery", "Check out this image!", 0x3498DB)
embed_set_image(embed, "https://example.com/large-image.png")
```

---

### `embed_set_thumbnail(embed, url)`

Set the thumbnail image of an embed (appears at top-right).

**Parameters:**
- `embed` - The embed object
- `url` (string) - Thumbnail URL

**Example:**
```ezlang
let embed = create_embed("User Profile", "Profile information", 0xE91E63)
embed_set_thumbnail(embed, "https://example.com/avatar.png")
```

---

### `embed_set_timestamp(embed, timestamp?)`

Set the timestamp of an embed (appears in footer).

**Parameters:**
- `embed` - The embed object
- `timestamp` (number/string, optional) - Unix timestamp or ISO date string. Defaults to current time if omitted.

**Example:**
```ezlang
let embed = create_embed("Event", "Event details", 0x9B59B6)

# Use current time
embed_set_timestamp(embed)

# Use specific timestamp
embed_set_timestamp(embed, 1699999999000)

# Use ISO date string
embed_set_timestamp(embed, "2024-01-01T00:00:00Z")
```

---

### `embed_set_url(embed, url)`

Set the URL of an embed (makes title clickable).

**Parameters:**
- `embed` - The embed object
- `url` (string) - URL to link to

**Example:**
```ezlang
let embed = create_embed("Documentation", "Read the docs", 0x2ECC71)
embed_set_url(embed, "https://docs.example.com")
```

---

## 2. Message Reactions

Add, remove, and manage reactions on messages.

### `add_reaction(message, emoji)`

Add a reaction to a message.

**Parameters:**
- `message` - The message object
- `emoji` (string) - Emoji to react with (Unicode or custom emoji format)

**Example:**
```ezlang
let msg = send_message(channel, "React to this!")
add_reaction(msg, "👍")
add_reaction(msg, "❤️")
add_reaction(msg, "<:custom:123456789>")  # Custom emoji
```

---

### `remove_reaction(message, emoji, user?)`

Remove a reaction from a message.

**Parameters:**
- `message` - The message object
- `emoji` (string) - Emoji to remove
- `user` (object, optional) - User whose reaction to remove. If omitted, removes bot's reaction.

**Example:**
```ezlang
# Remove bot's reaction
remove_reaction(msg, "👍")

# Remove specific user's reaction
remove_reaction(msg, "👍", user)
```

---

### `clear_reactions(message)`

Remove all reactions from a message.

**Parameters:**
- `message` - The message object

**Example:**
```ezlang
clear_reactions(msg)
```

---

### `fetch_reactions(message, emoji)`

Get all users who reacted with a specific emoji.

**Parameters:**
- `message` - The message object
- `emoji` (string) - Emoji to check

**Returns:** Array of user objects with `id`, `username`, and `tag` properties

**Example:**
```ezlang
let users = fetch_reactions(msg, "👍")
print("Users who reacted: " + str(length(users)))

for let i = 0; i < length(users); i = i + 1 {
    let user = users[i]
    print("  - " + user.tag)
}
```

---

## 3. Pin Management

Pin and manage pinned messages in channels.

### `pin_message(message)`

Pin a message in its channel.

**Parameters:**
- `message` - The message object to pin

**Example:**
```ezlang
let msg = send_message(channel, "📌 Important announcement!")
pin_message(msg)
```

---

### `unpin_message(message)`

Unpin a message.

**Parameters:**
- `message` - The message object to unpin

**Example:**
```ezlang
unpin_message(msg)
```

---

### `fetch_pinned_messages(channel)`

Get all pinned messages in a channel.

**Parameters:**
- `channel` - The channel object

**Returns:** Array of message objects

**Example:**
```ezlang
let pinned = fetch_pinned_messages(channel)
print("Total pinned messages: " + str(length(pinned)))

for let i = 0; i < length(pinned); i = i + 1 {
    let msg = pinned[i]
    print("📌 " + msg.content + " by " + msg.author)
}
```

---

## 4. Ban Management

Manage guild bans (requires appropriate permissions).

### `unban_user(guild, userId, reason?)`

Unban a user from the guild.

**Parameters:**
- `guild` - The guild object
- `userId` (string) - User ID to unban
- `reason` (string, optional) - Reason for unbanning

**Example:**
```ezlang
unban_user(guild, "123456789012345678", "Appeal accepted")
```

---

### `fetch_bans(guild)`

Get all bans in the guild.

**Parameters:**
- `guild` - The guild object

**Returns:** Array of ban objects with `userId`, `username`, `tag`, and `reason` properties

**Example:**
```ezlang
let bans = fetch_bans(guild)
print("Total bans: " + str(length(bans)))

for let i = 0; i < length(bans); i = i + 1 {
    let ban = bans[i]
    print("🔨 " + ban.tag + " - Reason: " + ban.reason)
}
```

---

### `fetch_ban(guild, userId)`

Get specific ban information for a user.

**Parameters:**
- `guild` - The guild object
- `userId` (string) - User ID to check

**Returns:** Ban object with `userId`, `username`, `tag`, and `reason` properties

**Example:**
```ezlang
let ban = fetch_ban(guild, "123456789012345678")
print("User: " + ban.tag)
print("Reason: " + ban.reason)
```

---

## 5. Bulk Message Operations

Efficiently manage multiple messages at once.

### `bulk_delete(channel, amount)`

Delete multiple messages at once.

**Parameters:**
- `channel` - The channel object
- `amount` (number) - Number of messages to delete (2-100)

**Returns:** Number of messages actually deleted

**Limitations:**
- Can only delete 2-100 messages at a time
- Messages must be less than 14 days old
- Requires `MANAGE_MESSAGES` permission

**Example:**
```ezlang
# Delete last 10 messages
let deleted = bulk_delete(channel, 10)
print("Deleted " + str(deleted) + " messages")
```

---

### `fetch_messages(channel, limit?)`

Fetch message history from a channel.

**Parameters:**
- `channel` - The channel object
- `limit` (number, optional) - Number of messages to fetch (1-100, default 50)

**Returns:** Array of message objects with `id`, `content`, and `author` properties

**Example:**
```ezlang
# Fetch last 20 messages
let messages = fetch_messages(channel, 20)

for let i = 0; i < length(messages); i = i + 1 {
    let msg = messages[i]
    print(msg.author + ": " + msg.content)
}
```

---

## 6. Context Menu Commands

Register right-click context menu commands (requires slash command setup).

### `register_user_context_menu(name, callback)`

Register a user context menu command (right-click on users).

**Parameters:**
- `name` (string) - Command name (shown in context menu)
- `callback` (function) - Function to call when command is used (receives interaction and user)

**Example:**
```ezlang
register_user_context_menu("User Info", function(interaction, user) {
    let embed = create_embed("User Info", "Details about " + user.tag, 0x3498DB)
    embed_add_field(embed, "User ID", user.id, true)
    embed_add_field(embed, "Username", user.username, true)
    interaction_reply(interaction, "", {
        embeds: [embed],
        ephemeral: true
    })
})
```

---

### `register_message_context_menu(name, callback)`

Register a message context menu command (right-click on messages).

**Parameters:**
- `name` (string) - Command name (shown in context menu)
- `callback` (function) - Function to call when command is used (receives interaction and message)

**Example:**
```ezlang
register_message_context_menu("Pin Message", function(interaction, message) {
    pin_message(message)
    interaction_reply(interaction, "Message pinned!", { ephemeral: true })
})
```

---

## 7. File System Built-ins

Read, write, and navigate the file system for dynamic bot loading.

### `fs_read_dir(path)`

List files and directories in a directory.

**Parameters:**
- `path` (string) - Directory path

**Returns:** Array of file/directory names (strings)

**Example:**
```ezlang
let files = fs_read_dir("./bots")
print("Files in bots directory:")
for let i = 0; i < length(files); i = i + 1 {
    print("  - " + files[i])
}
```

---

### `fs_exists(path)`

Check if a file or directory exists.

**Parameters:**
- `path` (string) - Path to check

**Returns:** Boolean (true if exists, false otherwise)

**Example:**
```ezlang
if fs_exists("./config.json") {
    print("Config file found!")
} else {
    print("Config file not found!")
}
```

---

### `fs_is_file(path)`

Check if a path is a file.

**Parameters:**
- `path` (string) - Path to check

**Returns:** Boolean (true if it's a file, false otherwise)

**Example:**
```ezlang
if fs_is_file("./bot.ez") {
    print("It's a file!")
}
```

---

### `fs_is_dir(path)`

Check if a path is a directory.

**Parameters:**
- `path` (string) - Path to check

**Returns:** Boolean (true if it's a directory, false otherwise)

**Example:**
```ezlang
if fs_is_dir("./commands") {
    print("It's a directory!")
}
```

---

### `path_join(...parts)`

Join path segments into a normalized path.

**Parameters:**
- `...parts` (strings) - Path segments to join

**Returns:** Joined path string

**Example:**
```ezlang
let full_path = path_join(".", "bots", "my_bot.ez")
print(full_path)  # ./bots/my_bot.ez
```

---

### `fs_read_file(path)`

Read a file as a string.

**Parameters:**
- `path` (string) - File path

**Returns:** File contents as string

**Example:**
```ezlang
let content = fs_read_file("./config.json")
print("Config content:")
print(content)
```

---

### `fs_write_file(path, content)`

Write content to a file (creates or overwrites).

**Parameters:**
- `path` (string) - File path
- `content` (string) - Content to write

**Returns:** Boolean (true on success)

**Example:**
```ezlang
let config = "{ \"prefix\": \"!\", \"color\": 0x5865F2 }"
fs_write_file("./config.json", config)
print("Config saved!")
```

---

## 8. Complete Examples

### Example 1: Rich Announcement System

```ezlang
function post_announcement(channel, title, message, author_name, author_icon) {
    # Create rich embed
    let embed = create_embed(title, message, 0xF1C40F)

    # Set author
    embed_set_author(embed, author_name, author_icon)

    # Set footer with timestamp
    embed_set_footer(embed, "Official Announcement")
    embed_set_timestamp(embed)

    # Set thumbnail
    embed_set_thumbnail(embed, "https://example.com/logo.png")

    # Send and pin
    let msg = send_message(channel, "@everyone", {
        embeds: [embed]
    })

    pin_message(msg)

    # Add reactions for feedback
    add_reaction(msg, "✅")
    add_reaction(msg, "❓")

    return msg
}
```

---

### Example 2: Moderation Dashboard

```ezlang
function show_mod_dashboard(channel, guild) {
    # Fetch bans
    let bans = fetch_bans(guild)

    # Create dashboard embed
    let embed = create_embed(
        "🛡️ Moderation Dashboard",
        "Server moderation overview",
        0xE74C3C
    )

    embed_add_field(embed, "Total Bans", str(length(bans)), true)

    # List recent bans
    let ban_list = ""
    for let i = 0; i < 5 && i < length(bans); i = i + 1 {
        let ban = bans[i]
        ban_list = ban_list + ban.tag + "\n"
    }

    if length(ban_list) > 0 {
        embed_add_field(embed, "Recent Bans", ban_list, false)
    }

    embed_set_footer(embed, "Use context menus for more actions")
    embed_set_timestamp(embed)

    send_message(channel, "", { embeds: [embed] })
}
```

---

### Example 3: Dynamic Bot Loader

```ezlang
function load_bot_modules(bot_dir) {
    if !fs_exists(bot_dir) {
        print("Bot directory not found!")
        return
    }

    let files = fs_read_dir(bot_dir)
    print("Loading bot modules...")

    for let i = 0; i < length(files); i = i + 1 {
        let file = files[i]
        let full_path = path_join(bot_dir, file)

        # Check if it's an .ez file
        if fs_is_file(full_path) {
            if ends_with(file, ".ez") {
                print("  Loading: " + file)
                # Load and execute module here
            }
        }
    }

    print("All modules loaded!")
}
```

---

### Example 4: Message Cleanup System

```ezlang
function cleanup_spam(channel, keyword) {
    # Fetch recent messages
    let messages = fetch_messages(channel, 100)
    let spam_count = 0

    # Count spam messages
    for let i = 0; i < length(messages); i = i + 1 {
        let msg = messages[i]
        if contains(msg.content, keyword) {
            spam_count = spam_count + 1
        }
    }

    if spam_count > 0 {
        print("Found " + str(spam_count) + " spam messages")

        # Bulk delete (max 100 messages, less than 14 days old)
        let deleted = bulk_delete(channel, spam_count)

        # Announce cleanup
        let embed = create_embed(
            "🧹 Channel Cleaned",
            "Removed " + str(deleted) + " spam messages",
            0x2ECC71
        )
        embed_set_timestamp(embed)

        let announcement = send_message(channel, "", { embeds: [embed] })

        # Auto-delete announcement after 10 seconds
        wait(10)
        delete_message(announcement)
    }
}
```

---

## Summary

All Tier 1 features are now fully implemented and tested:

✅ **Enhanced Embeds** (6 functions) - Complete embed customization
✅ **Message Reactions** (4 functions) - Full reaction management
✅ **Pin Management** (3 functions) - Pin/unpin/fetch pins
✅ **Ban Management** (3 functions) - Unban and fetch ban info
✅ **Bulk Operations** (2 functions) - Bulk delete and message history
✅ **Context Menus** (2 functions) - User and message context menus
✅ **File System** (7 functions) - Complete file system access

**Total: 27 new functions** providing comprehensive Discord.js v14 feature parity!

---

For more examples, see `examples/tier1-features-demo.ez`.
