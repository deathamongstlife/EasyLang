# EzLang Example Programs

This directory contains example programs written in EzLang to help you get started.

## Available Examples

### 1. test-bot.ez
A minimal Discord bot example showing the basic structure of a bot.

**Features:**
- Bot initialization
- Token configuration
- Basic startup

**Usage:**
```bash
ezlang examples/test-bot.ez
```

### 2. advanced-bot.ez
A more comprehensive Discord bot example with command handling and helper functions.

**Features:**
- Command prefix system
- Multiple command handlers (ping, help, info, random)
- Helper functions for bot logic
- Command testing without requiring a Discord connection
- Demonstrates loops, functions, and string manipulation

**Usage:**
```bash
ezlang examples/advanced-bot.ez
```

## Setting Up a Discord Bot

To use these examples with a real Discord bot:

1. **Create a Discord Application**
   - Go to [Discord Developer Portal](https://discord.com/developers/applications)
   - Click "New Application"
   - Give your application a name

2. **Create a Bot**
   - In your application, go to the "Bot" section
   - Click "Add Bot"
   - Copy your bot token (keep it secret!)

3. **Configure Bot Permissions**
   - In the "Bot" section, enable these Privileged Gateway Intents:
     - Presence Intent
     - Server Members Intent
     - Message Content Intent

4. **Invite Bot to Server**
   - Go to "OAuth2" → "URL Generator"
   - Select scopes: `bot`
   - Select permissions: `Send Messages`, `Read Messages`, `Read Message History`
   - Copy the generated URL and open it in your browser
   - Select a server to add the bot to

5. **Run Your Bot**
   - Replace `YOUR_DISCORD_BOT_TOKEN_HERE` in the example file with your actual token
   - Run the bot: `ezlang examples/advanced-bot.ez`
   - Your bot should now be online in your Discord server!

## Security Note

⚠️ **Never commit your bot token to version control!**

Consider using environment variables or a separate config file:
```bash
# Set environment variable
export DISCORD_BOT_TOKEN="your_token_here"

# Then modify the script to read from environment
```

## Learning Path

1. Start with `test-bot.ez` to understand the basic structure
2. Move to `advanced-bot.ez` to learn about command handling
3. Experiment by adding your own commands and features
4. Check the main documentation for more language features

## Need Help?

- Check the main [README.md](../README.md) for language documentation
- Review the [test files](../src/__tests__/) for more examples
- Look at the [source code](../src/) to understand built-in functions

## Contributing

Found a bug or want to add more examples? Feel free to contribute!
