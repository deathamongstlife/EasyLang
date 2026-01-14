# Import System Example: Organized Discord Bot

This example demonstrates how to use the import system to create a well-organized Discord bot with multiple files.

## Project Structure

```
organized-bot/
├── main.ez                  # Entry point
├── config.ez               # Bot configuration
├── utils/
│   ├── logger.ez          # Logging utilities
│   └── permissions.ez     # Permission checks
├── commands/
│   ├── ping.ez           # Ping command
│   ├── help.ez           # Help command
│   └── moderation.ez     # Moderation commands
└── events/
    ├── ready.ez          # Bot ready event
    └── messageCreate.ez  # Message handler
```

## File Contents

### main.ez
```ezlang
// Main entry point - imports everything and starts the bot

import "config.ez"
import "utils/logger.ez"
import "utils/permissions.ez"
import "commands/ping.ez"
import "commands/help.ez"
import "commands/moderation.ez"
import "events/ready.ez"
import "events/messageCreate.ez"

log_info("Bot configuration loaded")
log_info("All modules imported successfully")
```

### config.ez
```ezlang
// Bot configuration

var bot_token = "YOUR_BOT_TOKEN_HERE"
var prefix = "!"
var admin_role = "Admin"
var moderator_role = "Moderator"
var log_channel_id = "123456789"

var allowed_commands = ["ping", "help", "kick", "ban", "mute"]
```

### utils/logger.ez
```ezlang
// Logging utilities

function log_info(message) {
    print("[INFO] " + message)
}

function log_error(message) {
    print("[ERROR] " + message)
}

function log_warn(message) {
    print("[WARN] " + message)
}

function log_debug(message) {
    print("[DEBUG] " + message)
}
```

### utils/permissions.ez
```ezlang
// Permission checking utilities

import "../config.ez"

function is_admin(member) {
    var roles = member.roles.cache
    for role in roles {
        if role.name == admin_role {
            return true
        }
    }
    return false
}

function is_moderator(member) {
    var roles = member.roles.cache
    for role in roles {
        if role.name == moderator_role {
            return true
        }
        if role.name == admin_role {
            return true
        }
    }
    return false
}

function has_permission(member, required_level) {
    if required_level == "admin" {
        return is_admin(member)
    }
    if required_level == "moderator" {
        return is_moderator(member)
    }
    return true
}
```

### commands/ping.ez
```ezlang
// Ping command

import "../utils/logger.ez"

function handle_ping(message) {
    log_debug("Ping command executed by: " + message.author.username)
    message.reply("Pong!")
}
```

### commands/help.ez
```ezlang
// Help command

import "../config.ez"
import "../utils/logger.ez"

function handle_help(message) {
    log_debug("Help command executed")

    var help_text = "**Available Commands:**\n"
    help_text = help_text + prefix + "ping - Check if bot is responsive\n"
    help_text = help_text + prefix + "help - Show this help message\n"
    help_text = help_text + prefix + "kick <user> - Kick a user (Moderator)\n"
    help_text = help_text + prefix + "ban <user> - Ban a user (Admin)\n"

    message.reply(help_text)
}
```

### commands/moderation.ez
```ezlang
// Moderation commands

import "../config.ez"
import "../utils/logger.ez"
import "../utils/permissions.ez"

function handle_kick(message, args) {
    if !is_moderator(message.member) {
        log_warn("Unauthorized kick attempt by: " + message.author.username)
        message.reply("You don't have permission to use this command!")
        return
    }

    if length(args) < 1 {
        message.reply("Usage: " + prefix + "kick <user>")
        return
    }

    var target = args[0]
    log_info("User kicked: " + target + " by " + message.author.username)
    message.reply("User " + target + " has been kicked!")
}

function handle_ban(message, args) {
    if !is_admin(message.member) {
        log_warn("Unauthorized ban attempt by: " + message.author.username)
        message.reply("You don't have permission to use this command!")
        return
    }

    if length(args) < 1 {
        message.reply("Usage: " + prefix + "ban <user>")
        return
    }

    var target = args[0]
    log_info("User banned: " + target + " by " + message.author.username)
    message.reply("User " + target + " has been banned!")
}
```

### events/ready.ez
```ezlang
// Bot ready event

import "../config.ez"
import "../utils/logger.ez"

listen "ready" (client) {
    log_info("Bot is online and ready!")
    log_info("Logged in as: " + client.user.tag)
    log_info("Serving " + client.guilds.cache.size + " guilds")

    // Set bot status
    client.user.setActivity("Type " + prefix + "help")
}
```

### events/messageCreate.ez
```ezlang
// Message create event - handles all incoming messages

import "../config.ez"
import "../utils/logger.ez"
import "../commands/ping.ez"
import "../commands/help.ez"
import "../commands/moderation.ez"

listen "messageCreate" (message) {
    // Ignore bot messages
    if message.author.bot {
        return
    }

    // Check if message starts with prefix
    var content = message.content
    if !content.startsWith(prefix) {
        return
    }

    // Parse command and arguments
    var args_string = content.substring(length(prefix))
    var parts = args_string.split(" ")
    var command = parts[0]

    log_debug("Command received: " + command + " from " + message.author.username)

    // Route to appropriate command handler
    if command == "ping" {
        handle_ping(message)
        return
    }

    if command == "help" {
        handle_help(message)
        return
    }

    if command == "kick" {
        // Remove command from parts to get arguments
        var args = []
        var i = 1
        for part in parts {
            if i > 0 {
                args = args.push(part)
            }
            i = i + 1
        }
        handle_kick(message, args)
        return
    }

    if command == "ban" {
        var args = []
        var i = 1
        for part in parts {
            if i > 0 {
                args = args.push(part)
            }
            i = i + 1
        }
        handle_ban(message, args)
        return
    }

    // Unknown command
    log_warn("Unknown command: " + command)
    message.reply("Unknown command! Type " + prefix + "help for available commands.")
}
```

## Key Features Demonstrated

### 1. Modular Organization
- Each feature has its own file
- Related functionality is grouped in directories
- Clear separation of concerns

### 2. Relative Imports
- `import "../config.ez"` - Import from parent directory
- `import "utils/logger.ez"` - Import from subdirectory
- Imports work from any location

### 3. Shared State
- `config.ez` defines variables used across the project
- `prefix`, `admin_role` etc. are accessible everywhere
- Functions can call each other across modules

### 4. Circular Import Prevention
- Events import commands
- Commands import utils
- Utils import config
- No circular dependency issues

### 5. Code Reusability
- `log_info()` used throughout the project
- Permission checks centralized in one file
- Configuration in one place

## Running the Bot

```bash
# Navigate to the bot directory
cd organized-bot/

# Run the bot
ezlang run main.ez
```

## Benefits of This Approach

1. **Maintainability**: Easy to find and update specific features
2. **Scalability**: Adding new commands is as simple as creating a new file
3. **Readability**: Each file has a single, clear purpose
4. **Collaboration**: Multiple developers can work on different files
5. **Testing**: Individual modules can be tested separately
6. **Organization**: Clear structure makes the project easy to navigate

## Extending the Bot

To add a new command:

1. Create a new file in `commands/` directory
2. Import necessary utilities (logger, permissions, config)
3. Define your command handler function
4. Import your command file in `events/messageCreate.ez`
5. Add routing logic in the message handler

Example - adding a `commands/music.ez`:

```ezlang
// commands/music.ez
import "../utils/logger.ez"

function handle_play(message, args) {
    if length(args) < 1 {
        message.reply("Usage: !play <song>")
        return
    }

    var song = args[0]
    log_info("Playing: " + song)
    message.reply("Now playing: " + song)
}
```

Then add to `events/messageCreate.ez`:
```ezlang
import "../commands/music.ez"

// In the command routing section:
if command == "play" {
    var args = get_args_from_parts(parts)
    handle_play(message, args)
    return
}
```

This import system makes building and maintaining complex Discord bots much easier!
