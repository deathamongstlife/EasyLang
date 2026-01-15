---
layout: default
title: Getting Started
description: Learn how to install EasyLang and create your first Discord bot
---

# Getting Started with EasyLang

Welcome to EasyLang! This guide will help you get started with creating Discord bots using our beginner-friendly programming language.

## What You'll Learn

In this section, you'll learn everything you need to know to create your first Discord bot:

### 1. [Installation](/EasyLang/getting-started/installation)
Learn how to install EasyLang and set up your development environment.

- Prerequisites (Node.js, Python)
- Installing EasyLang via npm
- Setting up the Python bridge
- Verifying your installation

### 2. [Your First Bot](/EasyLang/getting-started/first-bot)
Create your first working Discord bot step-by-step.

- Getting a Discord bot token
- Writing your first bot code
- Running your bot
- Adding basic commands
- Common troubleshooting

### 3. [Basic Concepts](/EasyLang/getting-started/basic-concepts)
Understand the core concepts of EasyLang programming.

- Variables and data types
- Functions and control flow
- Discord events with `listen`
- Discord commands (`send`, `reply`, `react`)
- Working with Discord objects

---

## Quick Start

If you're eager to jump right in, here's a 2-minute quick start:

### 1. Install EasyLang

```bash
npm install -g easylang
```

### 2. Create a bot file

Create a file called `bot.ezlang`:

```ezlang
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

### 3. Run your bot

```bash
easylang bot.ezlang
```

That's it! You've created your first Discord bot.

---

## Learning Path

We recommend following this learning path for the best experience:

1. **Installation** → Set up your environment (5 minutes)
2. **First Bot** → Create a working bot (15 minutes)
3. **Basic Concepts** → Learn the fundamentals (30 minutes)
4. **Explore Features** → Learn about specific Discord features
5. **Build Projects** → Create your own bots

---

## What Makes EasyLang Different?

### Designed for Beginners
EasyLang uses simple, intuitive syntax that's easy to understand:

```ezlang
// EasyLang - Simple and clear
if message.content == "!hello" {
    reply(message, "Hi there!")
}
```

Compare this to Discord.js:

```javascript
// Discord.js - More complex
if (message.content === '!hello') {
    message.reply('Hi there!');
}
```

### Discord-First Design
Every function is built specifically for Discord. No need to learn complex APIs:

```ezlang
// Create an embed - EasyLang way
let embed = create_embed({
    "title": "Hello",
    "description": "This is easy!",
    "color": "#5865F2"
})
send_message(channel_id, "", embed)
```

### Powerful Yet Simple
Access advanced Discord features without the complexity:

```ezlang
// Create a button with interaction
let button = create_button({
    "customId": "click_me",
    "label": "Click Me!",
    "style": 1
})

let row = create_action_row([button])
send_message(channel_id, "Check out this button!", null, [row])
```

---

## Prerequisites

Before you begin, make sure you have:

- Basic understanding of programming concepts (variables, functions, if statements)
- A Discord account
- A computer with internet access

Don't worry if you're new to programming - EasyLang is designed to be beginner-friendly!

---

## Getting Help

If you get stuck, here are some resources:

- **Documentation**: Browse our [complete feature guide](/EasyLang/features/)
- **API Reference**: Look up specific functions in the [API reference](/EasyLang/api/)
- **Examples**: Check out [complete bot examples](/EasyLang/examples/)
- **GitHub Issues**: Report bugs or ask questions on [GitHub](https://github.com/deathamongstlife/EasyLang/issues)

---

## Next Steps

Ready to get started? Begin with the installation guide:

[Installation Guide →](/EasyLang/getting-started/installation){: .btn .btn-primary}

Already have EasyLang installed? Jump to creating your first bot:

[Your First Bot →](/EasyLang/getting-started/first-bot){: .btn .btn-secondary}

---

## What You Can Build

With EasyLang, you can build any type of Discord bot:

- **Moderation Bots**: Automate server moderation with kicks, bans, and AutoMod
- **Music Bots**: Play music from YouTube and other sources
- **Utility Bots**: Create polls, reminders, and information commands
- **Game Bots**: Build interactive games with buttons and components
- **Custom Bots**: Anything you can imagine!

[View Example Bots →](/EasyLang/examples/)
