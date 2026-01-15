---
layout: default
title: Your First Bot
description: Create your first Discord bot with EasyLang step-by-step
---

# Your First Bot

In this guide, you'll create your first working Discord bot with EasyLang. By the end, you'll have a bot that responds to commands and interacts with users.

## What We'll Build

We're going to create a simple bot that:
- Responds to a `!ping` command
- Shows server information with `!info`
- Reacts to messages with emojis
- Welcomes new members

---

## Step 1: Create Your Discord Bot

Before writing any code, you need to create a bot in the Discord Developer Portal.

### 1. Go to Discord Developer Portal

Visit [https://discord.com/developers/applications](https://discord.com/developers/applications)

### 2. Create a New Application

1. Click "New Application"
2. Enter a name (e.g., "My First Bot")
3. Click "Create"

### 3. Create a Bot User

1. Click on the "Bot" tab in the left sidebar
2. Click "Add Bot"
3. Confirm by clicking "Yes, do it!"

### 4. Get Your Bot Token

1. Under the bot's username, click "Reset Token"
2. Click "Yes, do it!" to confirm
3. Copy the token and save it somewhere safe
   - ⚠️ **Never share your token with anyone!**
   - ⚠️ **Never commit your token to GitHub!**

### 5. Enable Intents

Discord bots need permissions called "intents" to receive certain events:

1. Scroll down to "Privileged Gateway Intents"
2. Enable these three intents:
   - ✅ **Presence Intent**
   - ✅ **Server Members Intent**
   - ✅ **Message Content Intent**
3. Click "Save Changes"

### 6. Invite Your Bot to a Server

1. Go to the "OAuth2" tab
2. Click "URL Generator"
3. Under "Scopes", select:
   - ✅ `bot`
   - ✅ `applications.commands`
4. Under "Bot Permissions", select:
   - ✅ Send Messages
   - ✅ Read Message History
   - ✅ Add Reactions
   - ✅ Embed Links
   - Or simply select "Administrator" for testing
5. Copy the generated URL at the bottom
6. Open the URL in your browser
7. Select a server and click "Authorize"

---

## Step 2: Create Your Bot File

Create a new file called `first-bot.ezlang`:

```ezlang
// first-bot.ezlang
// My first Discord bot with EasyLang!

// Listen for when the bot is ready
listen("ready", function() {
    print("🤖 Bot is online and ready!")
    print("Logged in as: " + bot_user().username)
})

// Listen for messages
listen("messageCreate", function(message) {
    // Ignore messages from bots (including ourselves)
    if message.author.bot {
        return
    }

    // Ping command
    if message.content == "!ping" {
        reply(message, "🏓 Pong!")
    }

    // Hello command
    if message.content == "!hello" {
        reply(message, "Hello, " + message.author.username + "! 👋")
    }

    // Info command
    if message.content == "!info" {
        let guild = message.guild
        let info = "📊 **Server Info**\n"
        info = info + "Name: " + guild.name + "\n"
        info = info + "Members: " + to_string(guild.memberCount) + "\n"
        info = info + "Created: " + guild.createdAt
        reply(message, info)
    }
})

// Welcome new members
listen("guildMemberAdd", function(member) {
    // Find the first text channel
    let channels = member.guild.channels
    let welcome_channel = null

    for channel in channels {
        if channel.type == 0 {  // Text channel
            welcome_channel = channel
            break
        }
    }

    if welcome_channel != null {
        let welcome_msg = "Welcome to the server, " + member.user.username + "! 🎉"
        send_message(welcome_channel.id, welcome_msg)
    }
})

// Start the bot (replace with your token)
bot_start("YOUR_TOKEN_HERE")
```

---

## Step 3: Configure Your Token

For security, let's use an environment variable for the token.

### Create a .env file

Create a file called `.env` in the same directory:

```
BOT_TOKEN=your_token_here
```

Replace `your_token_here` with the token you copied earlier.

### Update bot code

Change the last line of your bot to:

```ezlang
// Start the bot using environment variable
bot_start(get_env("BOT_TOKEN"))
```

---

## Step 4: Run Your Bot

Open your terminal in the directory with your bot file and run:

```bash
easylang first-bot.ezlang
```

You should see:
```
🤖 Bot is online and ready!
Logged in as: My First Bot
```

Congratulations! Your bot is now running!

---

## Step 5: Test Your Bot

Go to your Discord server and try these commands:

### Test !ping

Type: `!ping`

Your bot should reply: `🏓 Pong!`

### Test !hello

Type: `!hello`

Your bot should reply: `Hello, YourUsername! 👋`

### Test !info

Type: `!info`

Your bot should reply with server information:
```
📊 Server Info
Name: My Server
Members: 5
Created: 2023-01-15T12:00:00.000Z
```

### Test Member Welcome

Ask a friend to join the server, or leave and rejoin yourself. The bot should welcome the new member!

---

## Understanding the Code

Let's break down what each part does:

### Event Listeners

```ezlang
listen("ready", function() {
    print("Bot is online!")
})
```

The `listen` function registers an event handler. When the event fires, your function runs.

Common events:
- `ready` - Bot has logged in
- `messageCreate` - New message sent
- `guildMemberAdd` - Someone joins the server

### Checking Message Content

```ezlang
if message.content == "!ping" {
    reply(message, "Pong!")
}
```

- `message.content` - The text of the message
- `==` - Check if equal
- `reply(message, text)` - Reply to the message

### Ignoring Bot Messages

```ezlang
if message.author.bot {
    return
}
```

This prevents your bot from responding to itself or other bots.

### Accessing Discord Objects

```ezlang
message.author.username  // Get username
message.guild.name       // Get server name
message.channel.id       // Get channel ID
```

Discord objects have many properties you can access.

---

## Adding More Commands

Let's add a few more useful commands:

### Dice Roll Command

```ezlang
// Add this to your messageCreate listener
if message.content == "!roll" {
    let roll = random_int(1, 6)
    reply(message, "🎲 You rolled a " + to_string(roll) + "!")
}
```

### User Info Command

```ezlang
if message.content == "!me" {
    let user = message.author
    let info = "👤 **Your Info**\n"
    info = info + "Username: " + user.username + "\n"
    info = info + "ID: " + user.id + "\n"
    info = info + "Joined Discord: " + user.createdAt
    reply(message, info)
}
```

### Help Command

```ezlang
if message.content == "!help" {
    let help_text = "📚 **Available Commands**\n"
    help_text = help_text + "`!ping` - Check if bot is alive\n"
    help_text = help_text + "`!hello` - Get a greeting\n"
    help_text = help_text + "`!info` - Server information\n"
    help_text = help_text + "`!roll` - Roll a dice\n"
    help_text = help_text + "`!me` - Your user info\n"
    help_text = help_text + "`!help` - Show this message"
    reply(message, help_text)
}
```

---

## Enhanced Version with Embeds

Let's make the info command prettier using embeds:

```ezlang
if message.content == "!info" {
    let guild = message.guild

    // Create an embed
    let embed = create_embed({
        "title": "📊 Server Information",
        "description": "Information about " + guild.name,
        "color": "#5865F2",
        "thumbnail": guild.iconURL
    })

    // Add fields
    embed_add_field(embed, "Members", to_string(guild.memberCount), true)
    embed_add_field(embed, "Channels", to_string(length(guild.channels)), true)
    embed_add_field(embed, "Roles", to_string(length(guild.roles)), true)
    embed_add_field(embed, "Created", guild.createdAt, false)

    // Set footer
    embed_set_footer(embed, "Requested by " + message.author.username, message.author.avatarURL)

    // Send the embed
    send_message(message.channel.id, "", embed)
}
```

---

## Adding Reactions

Make your bot react to certain messages:

```ezlang
listen("messageCreate", function(message) {
    if message.author.bot {
        return
    }

    // React to messages containing "awesome"
    if contains(message.content, "awesome") {
        react(message, "😎")
    }

    // React to messages containing "hello"
    if contains(message.content, "hello") {
        react(message, "👋")
    }

    // React to questions
    if ends_with(message.content, "?") {
        react(message, "❓")
    }

    // Your other commands here...
})
```

---

## Complete Enhanced Bot

Here's the complete enhanced version:

```ezlang
// Enhanced first bot with embeds and more features

listen("ready", function() {
    print("🤖 Bot is online and ready!")
    print("Logged in as: " + bot_user().username)

    // Set bot status
    set_presence({
        "activities": [{"name": "!help for commands", "type": 3}],
        "status": "online"
    })
})

listen("messageCreate", function(message) {
    if message.author.bot {
        return
    }

    // React to keywords
    if contains(lower(message.content), "awesome") {
        react(message, "😎")
    }

    // Ping command
    if message.content == "!ping" {
        let start = now()
        let msg = send_message(message.channel.id, "🏓 Pong!")
        let latency = now() - start
        edit_message(msg.id, message.channel.id, "🏓 Pong! Latency: " + to_string(latency) + "ms")
    }

    // Hello command
    if message.content == "!hello" {
        reply(message, "Hello, " + mention_user(message.author.id) + "! 👋")
    }

    // Info command with embed
    if message.content == "!info" {
        let guild = message.guild
        let embed = create_embed({
            "title": "📊 Server Information",
            "description": "Information about " + guild.name,
            "color": "#5865F2"
        })
        embed_add_field(embed, "Members", to_string(guild.memberCount), true)
        embed_add_field(embed, "Channels", to_string(length(guild.channels)), true)
        embed_add_field(embed, "Roles", to_string(length(guild.roles)), true)
        embed_set_footer(embed, "Requested by " + message.author.username, message.author.avatarURL)
        send_message(message.channel.id, "", embed)
    }

    // Roll command
    if message.content == "!roll" {
        let roll = random_int(1, 6)
        reply(message, "🎲 You rolled a **" + to_string(roll) + "**!")
    }

    // Help command
    if message.content == "!help" {
        let embed = create_embed({
            "title": "📚 Bot Commands",
            "description": "Here are all available commands:",
            "color": "#57F287"
        })
        embed_add_field(embed, "!ping", "Check bot latency", false)
        embed_add_field(embed, "!hello", "Get a friendly greeting", false)
        embed_add_field(embed, "!info", "View server information", false)
        embed_add_field(embed, "!roll", "Roll a dice (1-6)", false)
        embed_add_field(embed, "!help", "Show this help message", false)
        send_message(message.channel.id, "", embed)
    }
})

listen("guildMemberAdd", function(member) {
    let channels = member.guild.channels
    let welcome_channel = null

    for channel in channels {
        if channel.type == 0 {
            welcome_channel = channel
            break
        }
    }

    if welcome_channel != null {
        let embed = create_embed({
            "title": "👋 Welcome!",
            "description": mention_user(member.user.id) + " just joined the server!",
            "color": "#57F287",
            "thumbnail": member.user.avatarURL
        })
        embed_set_footer(embed, "Member #" + to_string(member.guild.memberCount))
        send_message(welcome_channel.id, "", embed)
    }
})

bot_start(get_env("BOT_TOKEN"))
```

---

## Common Issues

### Bot Doesn't Respond

**Check these:**
- Is the bot online in Discord?
- Did you enable Message Content Intent?
- Are you typing the command exactly right?
- Check the console for errors

### "Invalid Token" Error

**Solutions:**
- Make sure you copied the entire token
- Check for spaces in your .env file
- Reset your token in Developer Portal

### Bot Can't Send Messages

**Solutions:**
- Check bot permissions in server settings
- Make sure bot has "Send Messages" permission
- Check role hierarchy

### Welcome Message Doesn't Work

**Solutions:**
- Enable "Server Members Intent" in Developer Portal
- Make sure bot has permission to send in the channel
- Check if there are any text channels

---

## Next Steps

Congratulations! You've created your first Discord bot!

### Learn More Features

- [Embeds](/EasyLang/features/embeds) - Create beautiful embeds
- [Components](/EasyLang/features/components) - Add buttons and menus
- [Slash Commands](/EasyLang/features/slash-commands) - Modern Discord commands
- [Voice](/EasyLang/features/voice) - Add music features

### Explore Examples

- [Basic Bot](/EasyLang/examples/basic-bot) - More command examples
- [Moderation Bot](/EasyLang/examples/moderation-bot) - Moderation features
- [Music Bot](/EasyLang/examples/music-bot) - Build a music bot

### Learn Concepts

- [Basic Concepts](/EasyLang/getting-started/basic-concepts) - Understand EasyLang fundamentals

[Learn Basic Concepts →](/EasyLang/getting-started/basic-concepts){: .btn .btn-primary}
[Explore Features →](/EasyLang/features/){: .btn .btn-secondary}

---

[← Back to Getting Started](/EasyLang/getting-started/)
