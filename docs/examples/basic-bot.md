---
layout: default
title: Basic Bot Example
description: Simple Discord bot with commands and embeds
---

# Basic Bot Example

A simple bot with commands, embeds, and reactions.

## Features

- Ping/pong command
- Server information embed
- User information command
- Help command
- Reaction responses
- Welcome messages

## Complete Source Code

```ezlang
// basic-bot.ezlang
// A beginner-friendly Discord bot

// Bot configuration
let prefix = "!"

// Welcome channel ID (replace with your channel)
let welcome_channel = "YOUR_WELCOME_CHANNEL_ID"

// Bot ready event
listen("ready", function() {
    print("✅ Bot is online!")
    print("Logged in as: " + bot_user().username)

    // Set bot presence
    set_presence({
        "activities": [{
            "name": prefix + "help for commands",
            "type": 3  // Watching
        }],
        "status": "online"
    })
})

// Message handler
listen("messageCreate", function(message) {
    // Ignore bot messages
    if message.author.bot {
        return
    }

    // Auto-react to keywords
    if contains(lower(message.content), "awesome") {
        react(message, "😎")
    }
    if contains(lower(message.content), "pizza") {
        react(message, "🍕")
    }

    // Check if message starts with prefix
    if not starts_with(message.content, prefix) {
        return
    }

    // Parse command and arguments
    let parts = split(message.content, " ")
    let command = lower(slice_string(parts[0], 1))  // Remove prefix
    let args = slice(parts, 1)

    // Ping command
    if command == "ping" {
        let start = now()
        let response = reply(message, "🏓 Pong!")
        let latency = now() - start
        edit_message(response.id, message.channel.id,
            "🏓 Pong! Latency: " + to_string(latency) + "ms")
    }

    // Help command
    else if command == "help" {
        let embed = create_embed({
            "title": "📚 Bot Commands",
            "description": "Here are all available commands:",
            "color": "#5865F2"
        })

        embed_add_field(embed, prefix + "ping", "Check bot latency", false)
        embed_add_field(embed, prefix + "help", "Show this message", false)
        embed_add_field(embed, prefix + "info", "Server information", false)
        embed_add_field(embed, prefix + "userinfo [@user]", "User information", false)
        embed_add_field(embed, prefix + "avatar [@user]", "Show user avatar", false)
        embed_add_field(embed, prefix + "invite", "Get bot invite link", false)

        embed_set_footer(embed, "Use " + prefix + "help <command> for more info")

        send_message(message.channel.id, "", embed)
    }

    // Server info command
    else if command == "info" or command == "serverinfo" {
        let guild = message.guild

        let embed = create_embed({
            "title": "📊 " + guild.name,
            "description": "Server Information",
            "color": "#57F287"
        })

        if guild.iconURL != null {
            embed_set_thumbnail(embed, guild.iconURL)
        }

        embed_add_field(embed, "👥 Members", to_string(guild.memberCount), true)
        embed_add_field(embed, "📝 Channels", to_string(length(guild.channels)), true)
        embed_add_field(embed, "🎭 Roles", to_string(length(guild.roles)), true)
        embed_add_field(embed, "👑 Owner", mention_user(guild.ownerId), true)
        embed_add_field(embed, "📅 Created", guild.createdAt, false)

        embed_set_footer(embed, "Server ID: " + guild.id)

        send_message(message.channel.id, "", embed)
    }

    // User info command
    else if command == "userinfo" {
        let target_user = null

        // Check if user mentioned
        if length(message.mentions) > 0 {
            target_user = message.mentions[0]
        } else {
            target_user = message.author
        }

        let member = get_member(message.guild.id, target_user.id)

        let embed = create_embed({
            "title": "👤 User Information",
            "color": "#5865F2"
        })

        embed_set_thumbnail(embed, target_user.avatarURL)

        embed_add_field(embed, "Username", target_user.username, true)
        embed_add_field(embed, "ID", target_user.id, true)
        embed_add_field(embed, "Bot", to_string(target_user.bot), true)

        if member != null {
            embed_add_field(embed, "Nickname", member.nickname or "None", true)
            embed_add_field(embed, "Joined Server", member.joinedAt, false)
            embed_add_field(embed, "Roles", to_string(length(member.roles)), true)
        }

        embed_set_footer(embed, "Account created")
        embed_set_timestamp(embed, target_user.createdAt)

        send_message(message.channel.id, "", embed)
    }

    // Avatar command
    else if command == "avatar" {
        let target_user = message.author

        if length(message.mentions) > 0 {
            target_user = message.mentions[0]
        }

        let embed = create_embed({
            "title": target_user.username + "'s Avatar",
            "color": "#5865F2"
        })

        embed_set_image(embed, target_user.avatarURL)

        send_message(message.channel.id, "", embed)
    }

    // Invite command
    else if command == "invite" {
        let bot = bot_user()
        let invite_url = "https://discord.com/api/oauth2/authorize?client_id=" + bot.id + "&permissions=8&scope=bot%20applications.commands"

        let embed = create_embed({
            "title": "🔗 Invite Me!",
            "description": "[Click here to invite me to your server!](" + invite_url + ")",
            "color": "#5865F2"
        })

        send_message(message.channel.id, "", embed)
    }
})

// Welcome new members
listen("guildMemberAdd", function(member) {
    let embed = create_embed({
        "title": "👋 Welcome!",
        "description": mention_user(member.user.id) + " just joined the server!",
        "color": "#57F287"
    })

    embed_set_thumbnail(embed, member.user.avatarURL)
    embed_set_footer(embed, "Member #" + to_string(member.guild.memberCount))
    embed_set_timestamp(embed)

    send_message(welcome_channel, "", embed)
})

// Member leave
listen("guildMemberRemove", function(member) {
    let embed = create_embed({
        "title": "👋 Goodbye",
        "description": member.user.username + " has left the server.",
        "color": "#ED4245"
    })

    embed_set_footer(embed, "We now have " + to_string(member.guild.memberCount) + " members")

    send_message(welcome_channel, "", embed)
})

// Start the bot
bot_start(get_env("BOT_TOKEN"))
```

## Setup Instructions

1. **Install EasyLang:**
   ```bash
   npm install -g easylang
   ```

2. **Create `.env` file:**
   ```
   BOT_TOKEN=your_bot_token_here
   ```

3. **Configure:**
   - Replace `YOUR_WELCOME_CHANNEL_ID` with your welcome channel ID
   - Customize the prefix if desired

4. **Run:**
   ```bash
   easylang basic-bot.ezlang
   ```

## Customization Ideas

- Add more commands (roll dice, 8ball, coin flip)
- Add custom prefix per server
- Add reaction roles
- Add logging system
- Add command cooldowns

[← Back to Examples](/EasyLang/examples/)
