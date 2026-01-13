# Quick Start Guide

Get your organized EzLang Discord bot up and running in 5 minutes!

## Prerequisites

- EzLang interpreter installed
- Discord bot token
- Discord Developer Portal access

## Step 1: Create Discord Bot

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application"
3. Give it a name and click "Create"
4. Go to "Bot" tab
5. Click "Add Bot"
6. Copy the bot token (keep it secret!)
7. Enable these intents:
   - ✅ Presence Intent
   - ✅ Server Members Intent
   - ✅ Message Content Intent

## Step 2: Configure Bot

1. Open `config.ez`
2. Find and update these values:

```ezlang
# Your Discord user ID (get from Discord: Settings > Advanced > Developer Mode, then right-click yourself)
let BOT_OWNERS = ["YOUR_USER_ID_HERE"]

# For faster testing, use a development guild
let DEV_GUILD_ID = "YOUR_DEV_GUILD_ID"
```

## Step 3: Set Token

```bash
export DISCORD_TOKEN="your_bot_token_here"
```

Or create a `.env` file:
```
DISCORD_TOKEN=your_bot_token_here
```

## Step 4: Invite Bot to Server

Create an invite URL:
1. In Developer Portal, go to OAuth2 > URL Generator
2. Select scopes:
   - ✅ bot
   - ✅ applications.commands
3. Select bot permissions:
   - ✅ Send Messages
   - ✅ Embed Links
   - ✅ Use Slash Commands
   - ✅ Read Messages/View Channels
4. Copy the generated URL
5. Open it in browser and invite bot to your server

## Step 5: Run Bot

```bash
cd examples/organized-bot
ezlang main.ez
```

You should see:
```
========================================
  EzLang Organized Bot
  Multi-File Bot Architecture
========================================

[MAIN] Loading configuration...
[MAIN] Utilities initialized
[MAIN] Event handlers loaded
...
[MAIN] Bot started successfully!
```

## Step 6: Test Commands

In your Discord server, try these commands:

### Slash Commands
```
/ping          - Check bot latency
/help          - Show all commands
/userinfo      - Get your info
/serverinfo    - Get server info
/components    - Test buttons and selects
/show-modal    - Show a modal form
```

### Message Commands
```
!ping          - Check latency
!help          - Show help
!setprefix $   - Change prefix to $
```

### Context Menus
- Right-click a user → Apps → User Info
- Right-click a message → Apps → Message Info

## Common Issues

### Bot not responding to slash commands
**Solution**: Commands need to be registered. In development mode, they register to your dev guild instantly. In production mode, they can take up to 1 hour to register globally.

**Quick fix**: Make sure `DEVELOPMENT_MODE = true` and `DEV_GUILD_ID` is set in config.ez

### Bot not responding to message commands
**Solution**: Check that Message Content Intent is enabled in Discord Developer Portal.

### Permission errors
**Solution**: Make sure bot has these permissions in your server:
- Send Messages
- Embed Links
- Use Application Commands
- Read Message History

### "DISCORD_TOKEN not found"
**Solution**: Set the environment variable:
```bash
export DISCORD_TOKEN="your_token"
```

## Next Steps

### Add Your First Command

1. **Create the file**: `commands/slash/mycommand.ez`

```ezlang
let command_data = {
    "name": "mycommand",
    "description": "My first command!",
    "type": 1,
    "cooldown": 5000
}

function execute_mycommand(interaction) {
    interaction_reply(interaction, "Hello from my command!", {
        "ephemeral": false
    })
    return true
}

function register_mycommand_command(client) {
    if ENABLE_SLASH_COMMANDS {
        register_slash_handler(command_data["name"], execute_mycommand, command_data)
        log_success("Registered slash command: /mycommand")
    }
}

print("[COMMANDS/SLASH] Mycommand loaded")
```

2. **Add to main.ez**:

```ezlang
# In the imports section:
# import "commands/slash/mycommand.ez"

# In the registration section:
# register_mycommand_command(client)
```

3. **Restart the bot**

4. **Test it**: `/mycommand`

### Customize Configuration

Edit `config.ez` to customize:

```ezlang
# Change default prefix
let DEFAULT_PREFIX = ">"

# Change default cooldown
let DEFAULT_COOLDOWN = 3000

# Change embed colors
let DEFAULT_EMBED_COLOR = 0xFF0000  # Red

# Add status messages
let STATUS_MESSAGES = [
    {
        "type": "PLAYING",
        "text": "with EzLang"
    },
    {
        "type": "WATCHING",
        "text": "the server"
    }
]
```

### Enable Features

Toggle features in `config.ez`:

```ezlang
# Disable message commands (slash only)
let ENABLE_MESSAGE_COMMANDS = false

# Enable debug logging
let DEBUG_MODE = true

# Log all commands
let LOG_COMMANDS = true
```

## Example Use Cases

### Gaming Community Bot
- Add game stats commands
- Leaderboard system
- Event scheduling
- Tournament brackets

### Moderation Bot
- Add kick/ban commands
- Warning system
- Auto-mod rules
- Audit log

### Utility Bot
- Reminder system
- Poll creator
- Calculator
- Unit converter

### Economy Bot
- Currency system
- Shop and inventory
- Daily rewards
- Mini-games

## Learning Path

1. ✅ **Start here**: Run the bot and test all commands
2. **Modify existing commands**: Change messages, add fields to embeds
3. **Create simple command**: Make a `/hello` command
4. **Add command with options**: Make `/say <message>` command
5. **Add database usage**: Store user data
6. **Add permissions**: Restrict commands to admins
7. **Add cooldowns**: Prevent spam
8. **Create complex command**: Multi-step interaction with buttons

## Resources

- **README.md** - Complete documentation
- **FEATURES.md** - All implemented features
- **config.ez** - All configuration options
- Individual command files - Examples and templates

## Support

### Debug Mode

Enable verbose logging:
```ezlang
let DEBUG_MODE = true
```

This will show:
- All command executions
- All interactions
- All database operations
- All errors with context

### Check Logs

Look for these patterns:
```
[INFO] - General information
[SUCCESS] - Something worked
[ERROR] - Something failed
[WARN] - Potential issue
[DEBUG] - Detailed info (when DEBUG_MODE = true)
```

## Production Deployment

When ready for production:

1. **Set production mode**:
```ezlang
let DEVELOPMENT_MODE = false
```

2. **Use global commands**:
```ezlang
let USE_GUILD_COMMANDS = false
```

3. **Disable debug logging**:
```ezlang
let DEBUG_MODE = false
```

4. **Set up proper hosting**:
   - Use a VPS or cloud provider
   - Set up systemd service (Linux)
   - Use PM2 or similar process manager
   - Set up automatic restarts

5. **Implement file-based database**:
   - Replace in-memory storage
   - Add data persistence
   - Set up backups

6. **Monitor logs**:
   - Set up log rotation
   - Monitor error rates
   - Track command usage

## Tips & Tricks

### Faster Development
- Keep `DEVELOPMENT_MODE = true`
- Use a test server
- Test commands before deploying

### Better UX
- Use ephemeral messages for errors
- Add helpful error messages
- Use embeds for better formatting
- Add reaction confirmation

### Performance
- Cache frequently accessed data
- Use cooldowns appropriately
- Clean up expired cooldowns
- Optimize database queries

### Security
- Never commit bot token
- Validate all user input
- Check permissions thoroughly
- Use ephemeral for sensitive data

## Congratulations!

You now have a fully functional, organized Discord bot! 🎉

Start customizing and adding your own commands. The modular structure makes it easy to extend without breaking existing functionality.

Happy coding! 🚀
