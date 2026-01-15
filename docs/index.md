---
layout: default
title: Home
description: EasyLang - A beginner-friendly programming language for Discord bot development
---

# EasyLang

## Discord Bot Programming Made Easy

EasyLang is a beginner-friendly programming language specifically designed for creating Discord bots. Write powerful bots with simple, readable code that anyone can understand.

```ezlang
// A complete Discord bot in just a few lines!
listen("ready", function() {
    print("Bot is online!")
})

listen("messageCreate", function(message) {
    if message.content == "!hello" {
        reply(message, "Hello! I'm a bot made with EasyLang!")
    }
})

bot_start("YOUR_TOKEN_HERE")
```

[Get Started →](/EasyLang/getting-started/){: .btn .btn-primary .btn-lg}
[View Examples →](/EasyLang/examples/){: .btn .btn-secondary .btn-lg}

---

## Why EasyLang?

### 🎯 Beginner-Friendly Syntax
No complex syntax or confusing patterns. Write code that reads like English and makes sense from day one.

```ezlang
// Simple and intuitive
if message.content == "!ping" {
    reply(message, "Pong!")
}
```

### 🤖 Discord-First Design
Every function is built specifically for Discord. No need to learn complex Discord.js APIs or wrapper libraries.

```ezlang
// Create embeds with ease
let embed = create_embed({
    "title": "Welcome!",
    "description": "Thanks for joining our server",
    "color": "#5865F2"
})
send_message(channel_id, "", embed)
```

### 🔧 Powerful Bridge System
Access thousands of Python and npm packages seamlessly. Use any library you need without leaving EasyLang.

```ezlang
// Use Python packages
use_python_package("requests")
let response = python_call("requests.get", "https://api.example.com")

// Use npm packages
use_npm_package("axios")
let data = await npm_call("axios.get", "https://api.example.com")
```

### 🎵 Built-in Voice Support
Play music and audio with simple commands. No complex setup or external dependencies.

```ezlang
listen("messageCreate", function(message) {
    if message.content == "!play" {
        let voice_channel = get_user_voice_channel(message.author.id)
        let connection = join_voice_channel(voice_channel)
        play_youtube(connection, "https://youtube.com/watch?v=...")
    }
})
```

---

## Feature Categories

<div class="feature-grid">

### 📨 Messaging & Communication
- Send, edit, and delete messages
- Rich embeds with images and fields
- Reactions and emoji support
- Direct messages and replies
[Learn more →](/EasyLang/features/messaging)

### 🎮 Interactive Components
- Buttons and link buttons
- Select menus (string, role, user, channel)
- Modal forms
- Action rows
[Learn more →](/EasyLang/features/components)

### ⚡ Slash Commands
- Register global and guild commands
- Command options and choices
- Autocomplete support
- Ephemeral responses
[Learn more →](/EasyLang/features/slash-commands)

### 🎵 Voice & Audio
- Join voice channels
- Play audio files and YouTube videos
- Queue management
- Volume control and filters
[Learn more →](/EasyLang/features/voice)

### 🔨 Moderation Tools
- Kick, ban, and timeout users
- Bulk message deletion
- Role and permission management
- AutoMod rules and filters
[Learn more →](/EasyLang/features/moderation)

### 📊 Polls & Voting
- Create polls with multiple choices
- Set duration and allow multi-select
- Fetch results programmatically
- End polls early
[Learn more →](/EasyLang/features/polls)

### ⏰ Tasks & Loops
- Background tasks
- Scheduled jobs
- Periodic loops
- Cron-like scheduling
[Learn more →](/EasyLang/features/tasks)

### 🛡️ AutoMod
- Keyword filters
- Spam protection
- Mention spam limits
- Custom AutoMod rules
[Learn more →](/EasyLang/features/automod)

### 🔗 Webhooks
- Create and manage webhooks
- Send messages as webhooks
- Custom avatars and usernames
- Edit and delete webhook messages
[Learn more →](/EasyLang/features/webhooks)

### 💬 Advanced Communication
- Thread and forum support
- Stage channels
- Scheduled events
- Invite management
[Learn more →](/EasyLang/features/)

### 📝 Audit Logs
- Track server changes
- Monitor moderation actions
- Filter by action type
- Fetch detailed logs
[Learn more →](/EasyLang/features/audit-logs)

### ⏱️ Cooldowns
- Per-user cooldowns
- Global cooldowns
- Channel-specific limits
- Custom cooldown messages
[Learn more →](/EasyLang/features/cooldowns)

</div>

---

## Quick Examples

### Simple Command Bot

```ezlang
listen("messageCreate", function(message) {
    // Ignore bot messages
    if message.author.bot {
        return
    }

    // Ping command
    if message.content == "!ping" {
        reply(message, "Pong! 🏓")
    }

    // Info command
    if message.content == "!info" {
        let embed = create_embed({
            "title": "Server Info",
            "description": "Information about this server",
            "color": "#5865F2"
        })
        embed_add_field(embed, "Members", to_string(message.guild.memberCount), true)
        embed_add_field(embed, "Channels", to_string(length(message.guild.channels)), true)
        send_message(message.channel.id, "", embed)
    }
})

bot_start(get_env("BOT_TOKEN"))
```

### Interactive Button Example

```ezlang
listen("messageCreate", function(message) {
    if message.content == "!button" {
        let button1 = create_button({
            "customId": "yes_button",
            "label": "Yes",
            "style": 3  // Green
        })

        let button2 = create_button({
            "customId": "no_button",
            "label": "No",
            "style": 4  // Red
        })

        let row = create_action_row([button1, button2])

        send_message(message.channel.id, "Do you like EasyLang?", null, [row])
    }
})

listen("interactionCreate", function(interaction) {
    if interaction.customId == "yes_button" {
        interaction_reply(interaction, "Great! 🎉", true)
    } else if interaction.customId == "no_button" {
        interaction_reply(interaction, "That's okay! 😊", true)
    }
})

bot_start(get_env("BOT_TOKEN"))
```

### Music Bot Example

```ezlang
let queue = []

listen("messageCreate", function(message) {
    if message.content starts_with "!play " {
        let url = split(message.content, " ")[1]
        let voice_channel = get_user_voice_channel(message.author.id)

        if voice_channel == null {
            reply(message, "You need to be in a voice channel!")
            return
        }

        let connection = join_voice_channel(voice_channel)
        play_youtube(connection, url)
        reply(message, "Now playing! 🎵")
    }

    if message.content == "!stop" {
        let voice_channel = get_user_voice_channel(message.author.id)
        if voice_channel != null {
            leave_voice_channel(voice_channel)
            reply(message, "Stopped and left voice channel!")
        }
    }
})

bot_start(get_env("BOT_TOKEN"))
```

---

## 148+ Built-in Functions

EasyLang provides over 148 functions covering every aspect of Discord bot development:

- **Core Functions**: 20+ functions for basic operations
- **Messaging**: 15+ functions for messages and embeds
- **Components**: 10+ functions for buttons and menus
- **Voice**: 12+ functions for audio playback
- **Moderation**: 15+ functions for server management
- **Advanced Features**: 75+ functions for AutoMod, polls, tasks, webhooks, threads, forums, and more

[View Complete API Reference →](/EasyLang/api/)

---

## Get Started Today

Ready to create your first Discord bot? Follow our step-by-step guide and have a working bot in minutes.

[Installation Guide →](/EasyLang/getting-started/installation){: .btn .btn-primary}
[Your First Bot →](/EasyLang/getting-started/first-bot){: .btn .btn-secondary}

---

## Community & Support

- **GitHub**: [Report issues and contribute](https://github.com/deathamongstlife/EasyLang)
- **Examples**: [Browse complete bot examples](/EasyLang/examples/)
- **API Docs**: [Comprehensive API reference](/EasyLang/api/)

---

## Features at a Glance

| Feature | Description |
|---------|-------------|
| Simple Syntax | Easy to learn, Python-like syntax |
| Discord Integration | Built specifically for Discord bots |
| Voice Support | Play music and audio out of the box |
| Slash Commands | Full support for Discord's slash commands |
| Components | Buttons, select menus, and modals |
| AutoMod | Powerful moderation automation |
| Tasks & Loops | Background jobs and scheduled tasks |
| Bridge System | Access Python and npm packages |
| Rich Embeds | Beautiful message embeds |
| Webhooks | Custom webhook integration |
| Threads & Forums | Full support for Discord's newest features |
| No Compilation | Run directly with Node.js |

[Explore All Features →](/EasyLang/features/)

---

<div class="footer-cta">

## Ready to Build Amazing Bots?

Join developers creating powerful Discord bots with EasyLang's simple and intuitive syntax.

[Get Started Now →](/EasyLang/getting-started/){: .btn .btn-primary .btn-lg}

</div>

---

<small>EasyLang is an open-source project. Contributions welcome on [GitHub](https://github.com/deathamongstlife/EasyLang).</small>
