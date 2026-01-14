# Organized Bot Example

Complete multi-file Discord bot demonstrating EzLang 2.0's organized architecture with 27 Discord functions, file system operations, and professional bot structure.

## Overview

This bot showcases:

- ✅ **Multi-file Architecture** - Organized directory structure
- ✅ **Handler Registry System** - Centralized command management
- ✅ **Event Routing** - Clean event handling
- ✅ **27 Discord Functions** - Full Discord.js v14 API
- ✅ **File System Operations** - Dynamic command loading
- ✅ **Utility Modules** - Logging, permissions, cooldowns, database
- ✅ **Component Handlers** - Buttons, selects, modals
- ✅ **Context Menus** - User and message commands

## Project Structure

```
organized-bot/
├── main.ez                          # Entry point
├── config.ez                        # Configuration
│
├── utils/                           # Utility modules
│   ├── logger.ez                   # Logging system
│   ├── database.ez                 # Simple key-value storage
│   ├── permissions.ez              # Role-based permissions
│   └── cooldowns.ez                # Command cooldown management
│
├── handlers/                        # Core handlers
│   ├── command-registry.ez         # Command registration system
│   └── event-router.ez             # Event routing logic
│
├── commands/                        # Bot commands
│   ├── slash/                      # Slash commands (/)
│   │   ├── ping.ez                # Latency check
│   │   ├── help.ez                # Command list
│   │   ├── userinfo.ez            # User information
│   │   ├── serverinfo.ez          # Server statistics
│   │   ├── components.ez          # UI components demo
│   │   └── show-modal.ez          # Modal form demo
│   │
│   ├── message/                    # Prefix commands (!)
│   │   ├── ping.ez                # Text version of ping
│   │   ├── help.ez                # Text version of help
│   │   └── set.ez                 # Database set command
│   │
│   └── context/                    # Context menu commands
│       ├── userinfo.ez            # User right-click info
│       └── messageinfo.ez         # Message right-click info
│
├── components/                      # UI component handlers
│   ├── buttons.ez                  # Button click handlers
│   ├── selects.ez                  # Select menu handlers
│   └── modals.ez                   # Modal submission handlers
│
└── events/                          # Discord events
    ├── ready.ez                    # Bot startup
    ├── messageCreate.ez            # Message events
    └── interactionCreate.ez        # Interaction events
```

## Quick Start

### Prerequisites

- Node.js 16 or higher
- Discord bot token
- EzLang 2.0 installed

### Setup

1. **Clone/Download the bot**:
```bash
cd examples/organized-bot
```

2. **Configure the bot**:

Edit `config.ez`:
```ezlang
var BOT_TOKEN = "your_bot_token_here"
var GUILD_ID = "your_guild_id_here"
```

Or use environment variables:
```bash
ezlang main.ez TOKEN=your_bot_token_here GUILD_ID=your_guild_id_here
```

3. **Run the bot**:
```bash
ezlang main.ez
```

4. **Invite bot to server**:

Required permissions:
- Send Messages
- Send Messages in Threads
- Embed Links
- Read Message History
- Use Slash Commands
- Add Reactions
- Manage Messages (for bulk delete)

## Features

### Slash Commands

| Command | Description | Demo |
|---------|-------------|------|
| `/ping` | Check bot latency | Basic interaction response |
| `/help` | Show all commands | Rich embed with fields |
| `/userinfo` | Get user information | User data, roles, join date |
| `/serverinfo` | Server statistics | Member count, channels, roles |
| `/components` | UI components demo | Buttons and select menus |
| `/show-modal` | Modal form demo | Text input fields |

### Message Commands (Prefix: !)

| Command | Description | Usage |
|---------|-------------|-------|
| `!ping` | Text-based ping | `!ping` |
| `!help` | Text-based help | `!help` |
| `!set` | Set database value | `!set key value` |

### Context Menu Commands

| Command | Type | Description |
|---------|------|-------------|
| User Info | User | Right-click user → Apps → User Info |
| Message Info | Message | Right-click message → Apps → Message Info |

### UI Components

#### Buttons
- Primary (Blue)
- Secondary (Grey)
- Success (Green)
- Danger (Red)
- Link (External URL)

#### Select Menus
- String Select (dropdown options)
- User Select (pick users)
- Role Select (pick roles)
- Channel Select (pick channels)

#### Modals
- Short text input
- Paragraph text input
- Required/optional fields
- Form validation

## How It Works

### 1. Import System

`main.ez` imports all modules in the correct order:

```ezlang
// Configuration first
import "config.ez"

// Utilities next
import "utils/logger.ez"
import "utils/database.ez"
import "utils/permissions.ez"
import "utils/cooldowns.ez"

// Then handlers
import "handlers/command-registry.ez"
import "handlers/event-router.ez"

// Then commands (which register themselves)
import "commands/slash/ping.ez"
import "commands/slash/help.ez"

// Components
import "components/buttons.ez"
import "components/selects.ez"

// Events last
import "events/ready.ez"
import "events/interactionCreate.ez"

// Start bot
bot_start(BOT_TOKEN)
```

### 2. Handler Registry

Commands register themselves using the registry system:

```ezlang
// handlers/command-registry.ez defines:
var slash_commands = {}

function register_slash_handler(name, callback) {
    slash_commands[name] = callback
}

// commands/slash/ping.ez uses it:
function execute_ping(interaction) {
    interaction_reply(interaction, "Pong!", {})
}

register_slash_handler("ping", execute_ping)
```

### 3. Event Routing

Events route to appropriate handlers:

```ezlang
// events/interactionCreate.ez
function on_interaction_create(interaction) {
    if interaction.isChatInputCommand() {
        handle_slash_command(interaction.commandName, interaction)
    }
    else if interaction.isButton() {
        handle_button_click(interaction)
    }
    else if interaction.isStringSelectMenu() {
        handle_select_menu(interaction)
    }
    // ... etc
}
```

### 4. Component Handling

UI components have dedicated handlers:

```ezlang
// components/buttons.ez
function handle_button_click(interaction) {
    if interaction.customId == "accept" {
        interaction_reply(interaction, "Accepted!", {ephemeral: true})
    }
    else if interaction.customId == "decline" {
        interaction_reply(interaction, "Declined", {ephemeral: true})
    }
}
```

## Adding New Commands

### Add a Slash Command

1. **Create command file**: `commands/slash/mycommand.ez`

```ezlang
// ========================================
// COMMANDS/SLASH/MYCOMMAND.EZ - My Command
// ========================================

function execute_mycommand(interaction) {
    // Check permissions
    if not has_permission(interaction.member, ADMIN_ROLE_ID) {
        interaction_reply(interaction, "❌ Admin only!", {ephemeral: true})
        return
    }

    // Check cooldown
    var cooldown = check_cooldown("mycommand", interaction.user.id, 10000)
    if cooldown > 0 {
        interaction_reply(interaction, "Please wait...", {ephemeral: true})
        return
    }

    // Command logic
    var embed = create_embed("My Command", "This is my command!", COLOR_PRIMARY)
    interaction_reply(interaction, "", {embeds: [embed]})
}

// Register handler
register_slash_handler("mycommand", execute_mycommand)

print("[COMMANDS/SLASH/MYCOMMAND] My command loaded")
```

2. **Import in main.ez**:

```ezlang
import "commands/slash/mycommand.ez"
```

3. **Done!** The command is automatically registered and ready to use.

### Add a Button Handler

1. **Add to button handlers** (`components/buttons.ez`):

```ezlang
function handle_button_click(interaction) {
    // ... existing handlers ...

    else if interaction.customId == "my_button" {
        interaction_reply(interaction, "My button clicked!", {ephemeral: true})
    }
}
```

2. **Create button in command**:

```ezlang
var button = create_button("My Button", "primary", "my_button")
var row = create_action_row(button)
interaction_reply(interaction, "Click it:", {components: [row]})
```

### Add a Utility Function

1. **Create or edit utility file** (`utils/myutil.ez`):

```ezlang
// ========================================
// UTILS/MYUTIL.EZ - My Utility Functions
// ========================================

function calculate_something(value) {
    return value * 2
}

function format_text(text) {
    return "**" + text + "**"
}

print("[UTILS/MYUTIL] My utility loaded")
```

2. **Import in main.ez**:

```ezlang
import "utils/myutil.ez"
```

3. **Use in commands**:

```ezlang
var result = calculate_something(10)
var formatted = format_text("Hello")
```

## Utility Modules

### Logger (utils/logger.ez)

Structured logging with levels:

```ezlang
log_debug("Debug message")       // Only in debug mode
log_info("Info message")         // General information
log_warn("Warning message")      // Warnings
log_error("Error message")       // Errors
log_command("SLASH", "ping", user.id)  // Command execution
```

### Database (utils/database.ez)

Simple key-value storage:

```ezlang
// Set value
db_set("user_123", "John Doe")

// Get value
var name = db_get("user_123")

// Check if exists
if db_has("user_123") {
    print("User exists")
}

// List all keys
var keys = db_keys()
```

### Permissions (utils/permissions.ez)

Role-based permission checking:

```ezlang
// Check if user has role
if has_permission(member, ADMIN_ROLE_ID) {
    print("User is admin")
}

// Check multiple roles
if has_any_role(member, [ADMIN_ROLE_ID, MOD_ROLE_ID]) {
    print("User is staff")
}
```

### Cooldowns (utils/cooldowns.ez)

Command cooldown management:

```ezlang
// Check cooldown (returns milliseconds remaining)
var remaining = check_cooldown("command_name", user_id, 5000)

if remaining > 0 {
    print("Please wait " + format_cooldown(remaining))
} else {
    // Execute command
    print("Command executed")
}
```

## Configuration

### config.ez

```ezlang
// Bot Configuration
var BOT_TOKEN = get_argument("TOKEN", "")
var GUILD_ID = get_argument("GUILD_ID", "")
var PREFIX = "!"

// Colors (Discord standard colors)
var COLOR_PRIMARY = 0x5865f2   // Blurple
var COLOR_SUCCESS = 0x57f287   // Green
var COLOR_ERROR = 0xed4245     // Red
var COLOR_WARNING = 0xfee75c   // Yellow

// Role IDs
var ADMIN_ROLE_ID = "123456789"
var MOD_ROLE_ID = "987654321"

// Feature Flags
var ENABLE_LOGGING = true
var ENABLE_COOLDOWNS = true
var ENABLE_DATABASE = true

// Settings
var COOLDOWN_TIME = 5000        // 5 seconds
var LOG_LEVEL = "info"          // debug, info, warn, error
```

### Command-line Arguments

Override config with command-line arguments:

```bash
ezlang main.ez TOKEN=abc123 GUILD_ID=456789
```

## Testing

### Test Commands

```
/ping           - Test slash command
/help           - Test embed formatting
/userinfo       - Test user data access
/serverinfo     - Test server data access
/components     - Test buttons and selects
/show-modal     - Test modal forms

!ping           - Test message command
!set key val    - Test database
```

### Test Components

1. **Buttons**: Use `/components` command
2. **Select Menus**: Use `/components` command
3. **Modals**: Use `/show-modal` command
4. **Context Menus**: Right-click user or message

### Test Utilities

```ezlang
// Test logging
log_info("Test message")

// Test database
db_set("test", "value")
print(db_get("test"))

// Test permissions
print(has_permission(member, ADMIN_ROLE_ID))

// Test cooldowns
print(check_cooldown("test", "123", 5000))
```

## Best Practices

### 1. Keep Files Focused

Each file should have one clear responsibility:
- One command per file
- Related utilities together
- Component handlers by type

### 2. Use Descriptive Names

```ezlang
// Good
commands/slash/userinfo.ez
utils/permission-checker.ez

// Bad
commands/slash/ui.ez
utils/util1.ez
```

### 3. Document Your Code

```ezlang
// ========================================
// COMMANDS/SLASH/PING.EZ - Ping Command
// ========================================
// Checks bot latency
//
// Usage: /ping
// Permissions: None
// Cooldown: 5 seconds
// ========================================
```

### 4. Check Permissions First

```ezlang
function execute_admin_command(interaction) {
    if not has_permission(interaction.member, ADMIN_ROLE_ID) {
        interaction_reply(interaction, "❌ Admin only!", {ephemeral: true})
        return
    }

    // Command logic here
}
```

### 5. Use Cooldowns

```ezlang
var cooldown = check_cooldown("command", interaction.user.id, 5000)
if cooldown > 0 {
    interaction_reply(interaction, "Please wait...", {ephemeral: true})
    return
}
```

### 6. Handle Errors

```ezlang
function safe_command(interaction) {
    try {
        // Risky operation
        var result = some_operation()
        interaction_reply(interaction, "Success!", {})
    } catch error {
        log_error("Command failed: " + error.message)
        interaction_reply(interaction, "❌ Error occurred", {ephemeral: true})
    }
}
```

### 7. Use Ephemeral for Private Messages

```ezlang
// Private responses
interaction_reply(interaction, "Error message", {ephemeral: true})

// Public responses
interaction_reply(interaction, "Success!", {ephemeral: false})
```

## Resources

- [EzLang Discord API Reference](../../docs/DISCORD_API.md)
- [File System Functions](../../docs/FILE_SYSTEM.md)
- [Bot Architecture Guide](../../docs/BOT_ARCHITECTURE.md)
- [Discord.js Guide](https://discordjs.guide/)
- [Discord Developer Portal](https://discord.com/developers/docs)

## Contributing

Feel free to use this as a template for your own bots! Modify, extend, and customize as needed.

## License

This example is part of EzLang and is provided as-is for educational and development purposes.

---

**Happy botting with EzLang 2.0!** 🚀
