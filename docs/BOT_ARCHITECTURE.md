# Bot Architecture Guide

Complete guide to building organized, scalable Discord bots with EzLang's multi-file architecture.

## Table of Contents

- [Overview](#overview)
- [Multi-file Structure](#multi-file-structure)
- [Import System](#import-system)
- [Handler Registry](#handler-registry)
- [Event Routing](#event-routing)
- [Component Handlers](#component-handlers)
- [Extending the Bot](#extending-the-bot)
- [Best Practices](#best-practices)
- [Migration Guide](#migration-guide)

---

## Overview

EzLang 2.0 introduces a powerful multi-file bot architecture that enables:

- **Modular Organization** - Separate files for different functionality
- **Easy Maintenance** - Find and update code quickly
- **Team Collaboration** - Multiple developers can work on different files
- **Scalability** - Add features without touching existing code
- **Reusability** - Share utility functions across commands

### Architecture Benefits

| Single File | Multi-file |
|-------------|------------|
| Hard to navigate | Well organized |
| All code in one place | Logical file structure |
| Difficult to collaborate | Easy team development |
| Hard to test individual parts | Test components separately |
| Grows unwieldy over time | Scales indefinitely |

---

## Multi-file Structure

### Recommended Directory Layout

```
organized-bot/
├── main.ez                          # Entry point - imports all modules
├── config.ez                        # Configuration and constants
│
├── utils/                           # Utility functions
│   ├── logger.ez                   # Logging system
│   ├── database.ez                 # Database operations
│   ├── permissions.ez              # Permission checking
│   └── cooldowns.ez                # Command cooldowns
│
├── handlers/                        # Core bot handlers
│   ├── command-registry.ez         # Command registration system
│   └── event-router.ez             # Event routing logic
│
├── commands/                        # Bot commands
│   ├── slash/                      # Slash commands (/)
│   │   ├── ping.ez
│   │   ├── help.ez
│   │   ├── userinfo.ez
│   │   └── serverinfo.ez
│   │
│   ├── message/                    # Prefix commands (!)
│   │   ├── ping.ez
│   │   ├── help.ez
│   │   └── set.ez
│   │
│   └── context/                    # Context menu commands
│       ├── userinfo.ez
│       └── messageinfo.ez
│
├── components/                      # UI component handlers
│   ├── buttons.ez                  # Button click handlers
│   ├── selects.ez                  # Select menu handlers
│   └── modals.ez                   # Modal submission handlers
│
└── events/                          # Discord event handlers
    ├── ready.ez                    # Bot ready event
    ├── messageCreate.ez            # Message events
    └── interactionCreate.ez        # Interaction events
```

### File Responsibilities

#### main.ez
Entry point that imports all modules and starts the bot.

```ezlang
// Import configuration
import "config.ez"

// Import utilities
import "utils/logger.ez"
import "utils/database.ez"
import "utils/permissions.ez"
import "utils/cooldowns.ez"

// Import handlers
import "handlers/command-registry.ez"
import "handlers/event-router.ez"

// Import commands
import "commands/slash/ping.ez"
import "commands/slash/help.ez"

// Import components
import "components/buttons.ez"
import "components/selects.ez"

// Import events
import "events/ready.ez"
import "events/interactionCreate.ez"

// Start bot
bot_start(BOT_TOKEN)
```

#### config.ez
Centralized configuration and constants.

```ezlang
// Bot Configuration
var BOT_TOKEN = get_argument("TOKEN", "")
var PREFIX = "!"
var GUILD_ID = "123456789"

// Colors
var COLOR_PRIMARY = 0x5865f2
var COLOR_SUCCESS = 0x57f287
var COLOR_ERROR = 0xed4245
var COLOR_WARNING = 0xfee75c

// Permissions
var ADMIN_ROLE_ID = "987654321"
var MOD_ROLE_ID = "123123123"

// Features
var ENABLE_LOGGING = true
var ENABLE_COOLDOWNS = true
var COOLDOWN_TIME = 5000

print("[CONFIG] Configuration loaded")
```

#### utils/logger.ez
Logging system with different log levels.

```ezlang
// Logging utility
var LOG_LEVELS = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
}

var CURRENT_LOG_LEVEL = LOG_LEVELS.info

function log_debug(message) {
    if CURRENT_LOG_LEVEL <= LOG_LEVELS.debug {
        print("[DEBUG] " + message)
    }
}

function log_info(message) {
    if CURRENT_LOG_LEVEL <= LOG_LEVELS.info {
        print("[INFO] " + message)
    }
}

function log_warn(message) {
    if CURRENT_LOG_LEVEL <= LOG_LEVELS.warn {
        print("[WARN] " + message)
    }
}

function log_error(message) {
    if CURRENT_LOG_LEVEL <= LOG_LEVELS.error {
        print("[ERROR] " + message)
    }
}

function log_command(type, name, user_id) {
    log_info("CMD: [" + type + "] " + name + " by " + user_id)
}

print("[LOGGER] Logger utility loaded")
```

---

## Import System

### How Import Works

The `import` statement loads and executes another EzLang file:

```ezlang
import "path/to/file.ez"
```

**Key Features:**
- Files are executed in order
- All imports share the same global scope
- Variables and functions from imported files are available
- Circular imports are prevented
- Relative paths are supported

### Import Examples

```ezlang
// Import from same directory
import "config.ez"

// Import from subdirectory
import "utils/logger.ez"
import "commands/slash/ping.ez"

// Import with relative path
import "./utils/database.ez"

// Import order matters
import "config.ez"         // Define constants
import "utils/logger.ez"   // Use constants
import "commands/ping.ez"  // Use logger
```

### Shared Global Scope

All imported files share variables and functions:

```ezlang
// config.ez
var PREFIX = "!"

// commands/ping.ez (imported after config.ez)
function handle_ping(message) {
    print("Prefix is: " + PREFIX)  // Can access PREFIX
}
```

### Import Best Practices

1. **Import Order Matters**
```ezlang
// Good - dependencies first
import "config.ez"
import "utils/logger.ez"
import "commands/ping.ez"

// Bad - wrong order
import "commands/ping.ez"  // Uses logger before it's imported
import "utils/logger.ez"
```

2. **Use Relative Paths**
```ezlang
// Good
import "./config.ez"
import "./utils/logger.ez"

// Works but less clear
import "config.ez"
```

3. **Organize by Category**
```ezlang
// Import in logical groups
// 1. Configuration
import "config.ez"

// 2. Utilities
import "utils/logger.ez"
import "utils/database.ez"

// 3. Handlers
import "handlers/registry.ez"

// 4. Commands
import "commands/ping.ez"
import "commands/help.ez"
```

---

## Handler Registry

The handler registry system centralizes command management.

### Command Storage Maps

```ezlang
// handlers/command-registry.ez

// Global storage for all command handlers
var slash_commands = {}
var message_commands = {}
var context_commands = {}
```

### Registration Functions

#### register_slash_handler()

Register a slash command handler.

```ezlang
function register_slash_handler(name, callback) {
    slash_commands[name] = callback
    log_debug("Registered slash handler: " + name)
}
```

**Usage:**
```ezlang
// In commands/slash/ping.ez
function execute_ping(interaction) {
    interaction_reply(interaction, "Pong!", {})
}

register_slash_handler("ping", execute_ping)
```

#### register_message_handler()

Register a prefix command handler.

```ezlang
function register_message_handler(name, callback) {
    message_commands[name] = callback
    log_debug("Registered message handler: " + name)
}
```

**Usage:**
```ezlang
// In commands/message/help.ez
function execute_help(message, args) {
    message.reply("Help information here")
}

register_message_handler("help", execute_help)
```

#### register_context_handler()

Register a context menu handler.

```ezlang
function register_context_handler(name, callback) {
    context_commands[name] = callback
    log_debug("Registered context handler: " + name)
}
```

**Usage:**
```ezlang
// In commands/context/userinfo.ez
function show_user_info(interaction) {
    var user = interaction.targetUser
    interaction_reply(interaction, "User: " + user.tag, {})
}

register_context_handler("User Info", show_user_info)
```

### Handler Execution Functions

```ezlang
// Execute a slash command
function handle_slash_command(name, interaction) {
    if name in slash_commands {
        log_command("SLASH", name, interaction.user.id)
        var handler = slash_commands[name]
        handler(interaction)
        return true
    }
    return false
}

// Execute a message command
function handle_message_command(name, message, args) {
    if name in message_commands {
        log_command("MESSAGE", name, message.author.id)
        var handler = message_commands[name]
        handler(message, args)
        return true
    }
    return false
}

// Execute a context menu command
function handle_context_command(name, interaction) {
    if name in context_commands {
        log_command("CONTEXT", name, interaction.user.id)
        var handler = context_commands[name]
        handler(interaction)
        return true
    }
    return false
}
```

---

## Event Routing

The event router handles all Discord events and routes them to appropriate handlers.

### Main Event: interactionCreate

```ezlang
// events/interactionCreate.ez

function on_interaction_create(interaction) {
    // Slash commands
    if interaction.isChatInputCommand() {
        var command_name = interaction.commandName
        if not handle_slash_command(command_name, interaction) {
            interaction_reply(interaction, "Unknown command", {ephemeral: true})
        }
    }

    // Button clicks
    else if interaction.isButton() {
        handle_button_click(interaction)
    }

    // Select menus
    else if interaction.isStringSelectMenu() {
        handle_select_menu(interaction)
    }

    // Modal submissions
    else if interaction.isModalSubmit() {
        handle_modal_submit(interaction)
    }

    // User context menu
    else if interaction.isUserContextMenuCommand() {
        var command_name = interaction.commandName
        handle_context_command(command_name, interaction)
    }

    // Message context menu
    else if interaction.isMessageContextMenuCommand() {
        var command_name = interaction.commandName
        handle_context_command(command_name, interaction)
    }
}

print("[EVENT] Interaction router loaded")
```

### Message Event: messageCreate

```ezlang
// events/messageCreate.ez

function on_message_create(message) {
    // Ignore bot messages
    if message.author.bot {
        return
    }

    // Check for prefix
    if not starts_with(message.content, PREFIX) {
        return
    }

    // Parse command and arguments
    var content = substr(message.content, length(PREFIX), length(message.content))
    var parts = split(content, " ")
    var command_name = parts[0]
    var args = []

    for var i in range(1, length(parts)) {
        push(args, parts[i])
    }

    // Execute command
    if not handle_message_command(command_name, message, args) {
        message.reply("Unknown command: " + command_name)
    }
}

print("[EVENT] Message router loaded")
```

### Ready Event

```ezlang
// events/ready.ez

function on_ready() {
    log_info("Bot is ready!")
    log_info("Logged in as: " + bot.user.tag)
    log_info("Serving " + str(bot.guilds.cache.size) + " guilds")

    // Set bot status
    set_status("online", "playing", "EzLang Bot v2.0")
}

print("[EVENT] Ready event loaded")
```

---

## Component Handlers

### Button Handlers

```ezlang
// components/buttons.ez

function handle_button_click(interaction) {
    var button_id = interaction.customId

    if button_id == "accept" {
        interaction_reply(interaction, "✅ Accepted!", {ephemeral: true})
    }
    else if button_id == "decline" {
        interaction_reply(interaction, "❌ Declined", {ephemeral: true})
    }
    else if button_id == "toggle" {
        interaction_update(interaction, "Toggled!", {components: []})
    }
    else {
        log_warn("Unknown button: " + button_id)
        interaction_reply(interaction, "Unknown button", {ephemeral: true})
    }
}

print("[COMPONENTS] Button handlers loaded")
```

### Select Menu Handlers

```ezlang
// components/selects.ez

function handle_select_menu(interaction) {
    var menu_id = interaction.customId
    var selected = interaction.values[0]

    if menu_id == "color_select" {
        var embed = create_embed("Color Selected", "You chose: " + selected, 0x5865f2)
        interaction_reply(interaction, "", {embeds: [embed], ephemeral: true})
    }
    else if menu_id == "role_select" {
        interaction_reply(interaction, "Role assigned: " + selected, {ephemeral: true})
    }
    else {
        log_warn("Unknown select menu: " + menu_id)
        interaction_reply(interaction, "Unknown menu", {ephemeral: true})
    }
}

print("[COMPONENTS] Select menu handlers loaded")
```

### Modal Handlers

```ezlang
// components/modals.ez

function handle_modal_submit(interaction) {
    var modal_id = interaction.customId

    if modal_id == "feedback_form" {
        var name = get_modal_field(interaction, "name_input")
        var feedback = get_modal_field(interaction, "feedback_input")

        var embed = create_embed("Feedback Received", "Thank you!", 0x57f287)
        embed_add_field(embed, "Name", name, false)
        embed_add_field(embed, "Feedback", feedback, false)

        interaction_reply(interaction, "", {embeds: [embed], ephemeral: true})

        log_info("Feedback from " + name + ": " + feedback)
    }
    else {
        log_warn("Unknown modal: " + modal_id)
        interaction_reply(interaction, "Unknown form", {ephemeral: true})
    }
}

print("[COMPONENTS] Modal handlers loaded")
```

---

## Extending the Bot

### Adding a New Slash Command

1. **Create command file**: `commands/slash/newcommand.ez`

```ezlang
// commands/slash/newcommand.ez

function execute_newcommand(interaction) {
    // Check permissions
    if not has_permission(interaction.member, ADMIN_ROLE_ID) {
        interaction_reply(interaction, "❌ Admin only", {ephemeral: true})
        return
    }

    // Check cooldown
    var cooldown = check_cooldown("newcommand", interaction.user.id, 10000)
    if cooldown > 0 {
        interaction_reply(interaction, "Please wait " + format_cooldown(cooldown), {ephemeral: true})
        return
    }

    // Execute command logic
    var embed = create_embed("New Command", "This is a new command!", COLOR_PRIMARY)
    interaction_reply(interaction, "", {embeds: [embed]})
}

// Register handler
register_slash_handler("newcommand", execute_newcommand)

print("[COMMANDS/SLASH] New command loaded")
```

2. **Import in main.ez**:

```ezlang
import "commands/slash/newcommand.ez"
```

3. **Register with Discord** (if needed):

```ezlang
var command_data = {
    name: "newcommand",
    description: "A new command",
    options: []
}
register_slash_command(client, GUILD_ID, command_data)
```

### Adding a New Button Handler

1. **Add to button handlers**:

```ezlang
// components/buttons.ez

function handle_button_click(interaction) {
    var button_id = interaction.customId

    // ... existing handlers ...

    else if button_id == "new_button" {
        interaction_reply(interaction, "New button clicked!", {ephemeral: true})
    }
}
```

2. **Create button in command**:

```ezlang
var button = create_button("New Action", "primary", "new_button")
var row = create_action_row(button)
interaction_reply(interaction, "Click the button:", {components: [row]})
```

### Adding a New Utility Function

1. **Create utility file**: `utils/newutil.ez`

```ezlang
// utils/newutil.ez

function calculate_something(value) {
    return value * 2 + 10
}

function format_date(timestamp) {
    // Format logic here
    return str(timestamp)
}

print("[UTILS] New utility loaded")
```

2. **Import in main.ez**:

```ezlang
import "utils/newutil.ez"
```

3. **Use in commands**:

```ezlang
var result = calculate_something(5)
var date = format_date(time())
```

---

## Best Practices

### 1. One Responsibility Per File

```ezlang
// Good - focused files
commands/slash/ping.ez         // Only ping command
commands/slash/help.ez         // Only help command
utils/logger.ez                // Only logging

// Bad - mixed responsibilities
commands/all_commands.ez       // All commands in one file
```

### 2. Use Descriptive Names

```ezlang
// Good
commands/slash/userinfo.ez
utils/permission_checker.ez
handlers/command-registry.ez

// Bad
commands/slash/ui.ez
utils/utils.ez
handlers/h1.ez
```

### 3. Document Each File

```ezlang
// ========================================
// COMMANDS/SLASH/PING.EZ - Ping Command
// ========================================
// Checks bot latency and responds with pong
//
// Usage: /ping
// Permissions: None
// Cooldown: 5 seconds
// ========================================

function execute_ping(interaction) {
    // Implementation
}
```

### 4. Keep Related Files Together

```
// Good structure
commands/
  slash/
    ping.ez
    help.ez
  message/
    ping.ez
    help.ez

// Bad structure
commands/
  ping_slash.ez
  help_slash.ez
  ping_message.ez
  help_message.ez
```

### 5. Import Order

```ezlang
// Good - logical order
import "config.ez"              // 1. Config first
import "utils/logger.ez"        // 2. Utilities
import "handlers/registry.ez"  // 3. Handlers
import "commands/ping.ez"       // 4. Commands
import "events/ready.ez"        // 5. Events

// Bad - random order
import "commands/ping.ez"
import "config.ez"
import "events/ready.ez"
import "utils/logger.ez"
```

### 6. Avoid Circular Dependencies

```ezlang
// Bad - circular dependency
// file1.ez
import "file2.ez"
function func1() { func2() }

// file2.ez
import "file1.ez"
function func2() { func1() }

// Good - shared utilities
// utils.ez
function shared_func() { }

// file1.ez
import "utils.ez"
function func1() { shared_func() }

// file2.ez
import "utils.ez"
function func2() { shared_func() }
```

### 7. Centralize Configuration

```ezlang
// config.ez - single source of truth
var COLOR_PRIMARY = 0x5865f2
var COOLDOWN_TIME = 5000

// All files use config values
import "config.ez"
var cooldown = check_cooldown("cmd", user.id, COOLDOWN_TIME)
```

### 8. Use Consistent Naming

```ezlang
// Functions
execute_ping()      // Command executors
handle_button()     // Event handlers
check_permission()  // Utility functions

// Variables
var slash_commands  // Command storage
var COLOR_PRIMARY   // Constants (uppercase)
var user_id         // Local variables (lowercase)
```

---

## Migration Guide

### From Single File to Multi-file

#### Before (Single File)

```ezlang
// bot.ez - everything in one file
var TOKEN = "..."
var PREFIX = "!"

function execute_ping(interaction) {
    interaction_reply(interaction, "Pong!", {})
}

function execute_help(interaction) {
    interaction_reply(interaction, "Help info", {})
}

var slash_commands = {}
slash_commands["ping"] = execute_ping
slash_commands["help"] = execute_help

bot_start(TOKEN)
```

#### After (Multi-file)

```ezlang
// config.ez
var BOT_TOKEN = "..."
var PREFIX = "!"

// handlers/command-registry.ez
var slash_commands = {}

function register_slash_handler(name, callback) {
    slash_commands[name] = callback
}

// commands/slash/ping.ez
function execute_ping(interaction) {
    interaction_reply(interaction, "Pong!", {})
}
register_slash_handler("ping", execute_ping)

// commands/slash/help.ez
function execute_help(interaction) {
    interaction_reply(interaction, "Help info", {})
}
register_slash_handler("help", execute_help)

// main.ez
import "config.ez"
import "handlers/command-registry.ez"
import "commands/slash/ping.ez"
import "commands/slash/help.ez"

bot_start(BOT_TOKEN)
```

### Migration Steps

1. **Create directory structure**
```bash
mkdir -p commands/slash commands/message
mkdir -p utils handlers events components
```

2. **Extract configuration**
- Move constants to `config.ez`
- Move token, prefix, colors, etc.

3. **Extract utilities**
- Move helper functions to `utils/*.ez`
- Logger, database, permissions, etc.

4. **Extract command handlers**
- One file per command in `commands/slash/*.ez`
- Register each with handler registry

5. **Create handler registry**
- Create `handlers/command-registry.ez`
- Add registration functions

6. **Create event handlers**
- Move event logic to `events/*.ez`
- Route to command handlers

7. **Create main entry point**
- Create `main.ez`
- Import all modules
- Call `bot_start()`

8. **Test incrementally**
- Test after each file extraction
- Verify commands still work

---

## Complete Example

See `examples/organized-bot/` for a complete, working implementation of this architecture with:

- ✅ Multi-file structure
- ✅ Handler registry system
- ✅ Event routing
- ✅ Slash commands
- ✅ Message commands
- ✅ Context menus
- ✅ Button handlers
- ✅ Select menu handlers
- ✅ Modal handlers
- ✅ Utility functions
- ✅ Logging system
- ✅ Permission checks
- ✅ Cooldown management

---

## Troubleshooting

### Import Not Found

```
Error: Could not import file: commands/ping.ez
```

**Solution**: Check file path is correct and file exists.

### Function Not Defined

```
Error: execute_ping is not defined
```

**Solution**: Ensure file defining the function is imported before it's used.

### Variable Not Found

```
Error: PREFIX is not defined
```

**Solution**: Import `config.ez` before files that use PREFIX.

### Circular Import

```
Error: Circular import detected
```

**Solution**: Restructure to use shared utilities instead of circular imports.

---

## See Also

- [Discord API Reference](./DISCORD_API.md) - All Discord functions
- [File System Reference](./FILE_SYSTEM.md) - File operations
- [Example Bots](../examples/) - Complete working examples
