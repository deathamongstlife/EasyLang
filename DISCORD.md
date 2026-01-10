# Discord.js Integration for EzLang

EzLang provides first-class support for creating Discord bots with simple, intuitive syntax. This document explains how to use Discord features in your EzLang programs.

## Table of Contents

- [Getting Started](#getting-started)
- [Bot Setup](#bot-setup)
- [Event Listeners](#event-listeners)
- [Commands](#commands)
- [Complete Example](#complete-example)
- [Error Handling](#error-handling)
- [Best Practices](#best-practices)

## Getting Started

### Prerequisites

1. Create a Discord bot at [Discord Developer Portal](https://discord.com/developers/applications)
2. Enable the following intents in the Bot settings:
   - **Server Members Intent** (optional)
   - **Message Content Intent** (required)
3. Copy your bot token

### Required Intents

EzLang bots automatically configure these Discord.js intents:
- `Guilds` - Access to guild information
- `GuildMessages` - Receive message events
- `MessageContent` - Read message content

## Bot Setup

### Starting a Bot

Use the `bot_start()` function to initialize and start your Discord bot:

```ezlang
var token = "YOUR_BOT_TOKEN"
bot_start(token)
```

**Security Note:** Never hardcode tokens in your code! Use environment variables or command-line arguments:

```ezlang
var token = get_argument("DISCORD_TOKEN", "")

if token == "" {
    print("Error: Please provide DISCORD_TOKEN")
} else {
    bot_start(token)
}
```

Run with:
```bash
ezlang mybot.ezlang DISCORD_TOKEN=your_token_here
```

## Event Listeners

### Listen Statement

The `listen` statement registers event handlers for Discord events:

```ezlang
listen "eventName" (parameter) {
    // Event handler code
}
```

### Supported Events

#### ready Event

Fires when the bot successfully connects to Discord:

```ezlang
listen "ready" (client) {
    print("Bot is online!")
    print("Logged in as:", client.user.tag)
}
```

**Client Object Properties:**
- `client.user.tag` - Bot's username with discriminator (e.g., "MyBot#1234")
- `client.user.username` - Bot's username
- `client.user.id` - Bot's user ID
- `client.ready` - Boolean, always true in ready event
- `client.guildCount` - Number of servers the bot is in (as string)

#### messageCreate Event

Fires when a message is sent in a channel the bot can see:

```ezlang
listen "messageCreate" (message) {
    print("Received:", message.content)

    if message.content == "!hello" {
        reply message "Hi there!"
    }
}
```

**Message Object Properties:**
- `message.content` - The message text
- `message.id` - Unique message ID
- `message.channelId` - Channel where message was sent
- `message.guildId` - Server ID (empty string for DMs)
- `message.author` - User object who sent the message
- `message.channel` - Channel object

**Author Object Properties:**
- `message.author.id` - User's unique ID
- `message.author.username` - User's username
- `message.author.tag` - Username with discriminator
- `message.author.bot` - Boolean, true if user is a bot
- `message.author.discriminator` - User's discriminator (e.g., "1234")

#### interactionCreate Event

Fires when a user interacts with the bot (slash commands, buttons, etc.):

```ezlang
listen "interactionCreate" (interaction) {
    print("Interaction received:", interaction.type)
}
```

**Note:** Full slash command support is planned for a future update.

## Commands

EzLang provides three Discord commands for bot interactions:

### reply Command

Reply to a message:

```ezlang
reply message "Your reply text"
```

**Example:**
```ezlang
listen "messageCreate" (message) {
    if message.content == "!ping" {
        reply message "Pong! 🏓"
    }
}
```

The reply will mention the original user and show as a reply in Discord.

### react Command

Add an emoji reaction to a message:

```ezlang
react message "emoji"
```

**Examples:**
```ezlang
// Single reaction
react message "👍"

// Multiple reactions
react message "👍"
react message "🎉"
react message "✨"
```

**Supported Emoji Formats:**
- Unicode emoji: `"👍"`, `"🎉"`, `"❤️"`
- Custom emoji: `"<:emojiname:123456789>"`
- Emoji names: `"👍"` (unicode only)

### send Command

Send a message to a channel:

```ezlang
send channel "Message text"
```

**Example:**
```ezlang
listen "messageCreate" (message) {
    send message.channel "This is a new message"
}
```

**Note:** `send` creates a new message, while `reply` responds to an existing message.

## Complete Example

Here's a complete Discord bot with multiple features:

```ezlang
// Get token from command line
var token = get_argument("DISCORD_TOKEN", "")

if token == "" {
    print("Error: Please provide DISCORD_TOKEN")
} else {
    // Bot ready event
    listen "ready" (client) {
        print("✅ Bot is online!")
        print("Logged in as:", client.user.tag)
        print("")
        print("Available commands:")
        print("  !hello  - Get a greeting")
        print("  !ping   - Test response time")
        print("  !help   - Show this help")
        print("  !react  - Get reactions")
    }

    // Message handler
    listen "messageCreate" (message) {
        // Ignore messages from bots (including ourselves)
        if message.author.bot == false {

            // Hello command
            if message.content == "!hello" {
                reply message "Hello! I'm an EzLang bot! 👋"
            }

            // Ping command
            if message.content == "!ping" {
                reply message "Pong! 🏓"
            }

            // Help command
            if message.content == "!help" {
                var helpText = "Available commands: !hello, !ping, !help, !react"
                reply message helpText
            }

            // React command
            if message.content == "!react" {
                react message "👍"
                react message "🎉"
                react message "✨"
                reply message "Added some reactions!"
            }

            // Echo command (demonstrates string manipulation)
            if message.content == "!echo" {
                reply message "Please use: !echo your message here"
            }
        }
    }

    print("Starting Discord bot...")
    print("Press Ctrl+C to stop")
    print("")

    // Start the bot
    bot_start(token)
}
```

## Error Handling

### Common Errors

#### Invalid Token
```
RuntimeError: Invalid Discord token. Please check your bot token.
```
**Solution:** Verify your token in Discord Developer Portal.

#### Missing Permissions
```
RuntimeError: Missing required intents. Enable "Message Content Intent" in Discord Developer Portal.
```
**Solution:** Enable the Message Content Intent in your bot settings.

#### Bot Not Initialized
```
RuntimeError: Discord bot not initialized. Call initialize(token) first.
```
**Solution:** Ensure `bot_start()` is called before event listeners can trigger.

### Try-Catch Pattern

Currently, errors in event handlers are logged but don't crash the bot:

```ezlang
listen "messageCreate" (message) {
    // If this fails, error is logged and bot continues
    reply message "Response"
}
```

## Best Practices

### 1. Always Ignore Bot Messages

Prevent infinite loops by ignoring messages from bots:

```ezlang
listen "messageCreate" (message) {
    if message.author.bot == false {
        // Handle user messages only
    }
}
```

### 2. Use Environment Variables for Tokens

Never commit tokens to version control:

```ezlang
var token = get_argument("DISCORD_TOKEN", "")
if token == "" {
    print("Error: Please provide DISCORD_TOKEN")
} else {
    bot_start(token)
}
```

### 3. Provide Clear Error Messages

Help users understand what went wrong:

```ezlang
if token == "" {
    print("Error: Please provide DISCORD_TOKEN")
    print("Usage: ezlang bot.ezlang DISCORD_TOKEN=your_token")
}
```

### 4. Register Listeners Before Starting

Define all `listen` statements before calling `bot_start()`:

```ezlang
// ✅ Good
listen "ready" (client) { ... }
listen "messageCreate" (message) { ... }
bot_start(token)

// ❌ Bad
bot_start(token)
listen "messageCreate" (message) { ... }  // May miss early events
```

### 5. Use Reactions for Acknowledgment

Use reactions to show the bot received a command:

```ezlang
listen "messageCreate" (message) {
    if message.content == "!process" {
        react message "⏳"  // Show we're working
        // Do processing...
        react message "✅"  // Show we're done
    }
}
```

### 6. Keep Event Handlers Simple

For complex logic, use functions:

```ezlang
function handleHelloCommand(message) {
    reply message "Hello! I'm a bot!"
}

listen "messageCreate" (message) {
    if message.content == "!hello" {
        handleHelloCommand(message)
    }
}
```

## Troubleshooting

### Bot Doesn't Respond to Messages

1. Check Message Content Intent is enabled
2. Verify bot has permission to read messages in the channel
3. Confirm bot is online (check `ready` event fires)
4. Ensure you're not ignoring the message (check `message.author.bot`)

### Bot Can't React to Messages

1. Verify bot has "Add Reactions" permission
2. Check emoji is valid (try a simple unicode emoji like "👍")
3. Ensure message object is valid

### Bot Crashes on Startup

1. Verify token is correct
2. Check internet connection
3. Review error message for specific issue

## API Reference

### Functions

#### bot_start(token)
Initialize and start the Discord bot.
- **Parameters:** `token` (string) - Bot token from Discord Developer Portal
- **Returns:** Boolean - true if started successfully
- **Throws:** RuntimeError if token is invalid or connection fails

### Commands

#### reply target message
Reply to a message.
- **Parameters:**
  - `target` (message object) - Message to reply to
  - `message` (string) - Reply text
- **Returns:** null
- **Throws:** RuntimeError if reply fails

#### react target emoji
Add reaction to a message.
- **Parameters:**
  - `target` (message object) - Message to react to
  - `emoji` (string) - Emoji to react with
- **Returns:** Boolean - true if reaction succeeded
- **Throws:** RuntimeError if reaction fails

#### send target message
Send a message to a channel.
- **Parameters:**
  - `target` (channel object) - Channel to send to
  - `message` (string) - Message text
- **Returns:** null
- **Throws:** RuntimeError if send fails

### Events

#### listen "ready" (client)
Bot connected and ready.
- **Parameter:** `client` - Client object with bot information

#### listen "messageCreate" (message)
Message received.
- **Parameter:** `message` - Message object

#### listen "interactionCreate" (interaction)
Interaction received (buttons, slash commands, etc.).
- **Parameter:** `interaction` - Interaction object

## Examples

See the `examples/` directory for more Discord bot examples:
- `discord-hello-bot.ezlang` - Basic command bot
- More examples coming soon!

## Discord.js Version

EzLang uses Discord.js v14 for Discord integration. For advanced features not yet supported by EzLang, refer to the [Discord.js documentation](https://discord.js.org/).

## Future Features

Planned Discord features for future releases:
- Slash command support
- Embed messages
- Button and select menu interactions
- Voice channel support
- Direct message handling
- Role and permission checks
- More event listeners

## Contributing

Found a bug or want to suggest a feature? Open an issue on the EzLang GitHub repository!
