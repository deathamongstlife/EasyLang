# Organized Bot Structure Documentation

## Overview

This document describes the multi-file architecture of the EzLang Organized Bot, following Discord.js v14 best practices.

## Directory Structure

```
organized-bot/
├── main.ez                      # Entry point with imports
├── config.ez                    # Configuration variables
├── handlers/
│   ├── command-registry.ez     # Command registration system
│   └── event-router.ez         # Event routing system
├── utils/
│   ├── logger.ez               # Logging functions
│   ├── database.ez             # Database/storage functions
│   ├── permissions.ez          # Permission checking
│   └── cooldowns.ez            # Cooldown management
├── commands/
│   ├── slash/
│   │   ├── ping.ez             # /ping command
│   │   ├── help.ez             # /help command
│   │   ├── userinfo.ez         # /userinfo command
│   │   ├── serverinfo.ez       # /serverinfo command
│   │   ├── components.ez       # /components command
│   │   └── show-modal.ez       # /show-modal command
│   ├── message/
│   │   ├── ping.ez             # !ping command
│   │   ├── help.ez             # !help command
│   │   └── set.ez              # !set command (with subcommands)
│   └── context/
│       ├── userinfo.ez         # User context menu
│       └── messageinfo.ez      # Message context menu
├── components/
│   ├── buttons.ez              # Button handlers
│   ├── selects.ez              # Select menu handlers
│   └── modals.ez               # Modal handlers
└── events/
    ├── ready.ez                # Ready event
    ├── messageCreate.ez        # Message event
    └── interactionCreate.ez    # Interaction event
```

## File Descriptions

### Entry Point

**main.ez**
- Imports all modules in the correct order
- Starts the bot with `bot_start(BOT_TOKEN)`
- Contains no logic, only imports and initialization

### Configuration

**config.ez**
- Bot token, owner ID, and settings
- Global storage maps (guild_prefixes, cooldowns)
- Feature flags and constants
- Status messages

### Handlers

**handlers/command-registry.ez**
- Command storage maps (slash_commands, message_commands, context_commands)
- Registration functions (register_slash_handler, register_message_handler, etc.)
- Handler execution functions (handle_slash_command, handle_message_command, etc.)
- Interaction reply helpers (reply_interaction, send_interaction_message)

**handlers/event-router.ez**
- Message command parsing (parse_message_command)
- Interaction routing (route_interaction)
- Event delegation logic

### Utilities

**utils/logger.ez**
- Logging functions (log_info, log_warn, log_error, log_debug)
- Command logging (log_command)

**utils/database.ez**
- Prefix management (get_prefix, set_prefix)
- Data validation (is_valid_prefix)

**utils/permissions.ez**
- Owner checking (is_bot_owner)
- Developer checking (is_developer)
- Permission level verification (has_permission_level)

**utils/cooldowns.ez**
- Cooldown checking and application (check_cooldown)
- Cooldown formatting (format_cooldown)
- Cooldown clearing (clear_cooldown)

### Commands

#### Slash Commands

Each slash command file follows this structure:

```ezlang
// Execute function
function execute_<command>(interaction) {
    // Check cooldown
    // Command logic
    // Reply to interaction
}

// Register function
function register_<command>() {
    register_slash_handler("<command>", execute_<command>)
    register_command({...})
}

// Auto-register
register_<command>()
```

**Available Slash Commands:**
- `ping.ez` - Latency check
- `help.ez` - Command list
- `userinfo.ez` - User information
- `serverinfo.ez` - Server information
- `components.ez` - Interactive components (developer only)
- `show-modal.ez` - Modal form (developer only)

#### Message Commands

Each message command file follows this structure:

```ezlang
// Execute function
function execute_msg_<command>(message, args) {
    // Check cooldown
    // Parse arguments
    // Command logic
    // Reply to message
}

// Register function
function register_msg_<command>() {
    register_message_handler("<command>", execute_msg_<command>)
}

// Auto-register
register_msg_<command>()
```

**Available Message Commands:**
- `ping.ez` - Latency check
- `help.ez` - Command list with prefix
- `set.ez` - Settings management (subcommands: prefix)

#### Context Menu Commands

Each context menu file follows this structure:

```ezlang
// Execute function
function execute_ctx_<command>(interaction) {
    // Check cooldown
    // Get target (targetUser or targetMessage)
    // Command logic
    // Reply to interaction
}

// Register function
function register_ctx_<command>() {
    register_context_handler("<name>", execute_ctx_<command>)
    register_command({...})
}

// Auto-register
register_ctx_<command>()
```

**Available Context Menus:**
- `userinfo.ez` - User Information (right-click user)
- `messageinfo.ez` - Message Information (right-click message)

### Components

Each component handler file provides a handler function that returns true if handled:

**buttons.ez**
```ezlang
function handle_button_interaction(interaction) {
    var custom_id = interaction.customId
    if custom_id == "example-button-id" {
        // Handle button
        return true
    }
    return false
}
```

**selects.ez**
```ezlang
function handle_select_interaction(interaction) {
    var custom_id = interaction.customId
    if custom_id == "example-menu-id" {
        var selected = interaction.values[0]
        // Handle selection
        return true
    }
    return false
}
```

**modals.ez**
```ezlang
function handle_modal_interaction(interaction) {
    var custom_id = interaction.customId
    if custom_id == "example-modal-id" {
        var field_value = get_modal_field(interaction, "field-id")
        // Handle submission
        return true
    }
    return false
}
```

### Events

**ready.ez**
- Fires when bot connects to Discord
- Logs bot information
- Sets initial status

**messageCreate.ez**
- Handles incoming messages
- Parses prefix commands
- Routes to message command handlers

**interactionCreate.ez**
- Handles all Discord interactions
- Routes to appropriate handlers:
  - Slash commands → handle_slash_command
  - Context menus → handle_context_command
  - Buttons → handle_button_interaction
  - Select menus → handle_select_interaction
  - Modals → handle_modal_interaction

## Import Order

The import order in main.ez is critical:

1. **Configuration** - Must be first (defines global variables)
2. **Utilities** - Required by handlers and commands
3. **Handlers** - Provide registration and routing functions
4. **Commands** - Auto-register when imported
5. **Components** - Provide component handlers
6. **Events** - Register event listeners last
7. **Bot Start** - Start the bot after everything is loaded

## Adding New Commands

### Adding a Slash Command

1. Create `commands/slash/mycommand.ez`:

```ezlang
function execute_mycommand(interaction) {
    var cooldown = check_cooldown("slash_mycommand", interaction.user.id, 5000)
    if cooldown > 0 {
        reply_interaction(interaction, "Please wait " + format_cooldown(cooldown) + " before using this command again.", true)
        return
    }

    // Your command logic here
    reply_interaction(interaction, "Command response!", false)
}

function register_mycommand() {
    register_slash_handler("mycommand", execute_mycommand)
    register_command({
        name: "mycommand",
        description: "My command description",
        type: 1
    })
}

register_mycommand()

print("[COMMANDS/SLASH/MYCOMMAND] My command loaded")
```

2. Import in `main.ez`:

```ezlang
import "commands/slash/mycommand.ez"
```

### Adding a Message Command

1. Create `commands/message/mycommand.ez`:

```ezlang
function execute_msg_mycommand(message, args) {
    var cooldown = check_cooldown("msg_mycommand", message.author.id, 5000)
    if cooldown > 0 {
        reply message "Please wait " + format_cooldown(cooldown) + " before using this command again."
        return
    }

    // Your command logic here
    reply message "Command response!"
}

function register_msg_mycommand() {
    register_message_handler("mycommand", execute_msg_mycommand)
}

register_msg_mycommand()

print("[COMMANDS/MESSAGE/MYCOMMAND] My command loaded")
```

2. Import in `main.ez`:

```ezlang
import "commands/message/mycommand.ez"
```

## Best Practices

1. **Always check cooldowns** - Prevent spam and rate limiting
2. **Use ephemeral responses** - For error messages and sensitive data
3. **Validate input** - Check arguments before processing
4. **Handle errors gracefully** - Reply with helpful error messages
5. **Log command usage** - Use log_command for debugging
6. **Keep functions focused** - One function per command/handler
7. **Document your code** - Add comments explaining complex logic
8. **Test thoroughly** - Verify all commands and interactions work

## Running the Bot

```bash
# Set environment variables
export BOT_TOKEN="your-bot-token"
export OWNER_ID="your-user-id"
export DEV_GUILD_ID="your-guild-id"  # Optional

# Run the bot
ezlang run organized-bot/main.ez
```

## Features

- ✅ Slash commands with cooldowns
- ✅ Message commands with prefix
- ✅ Context menu commands
- ✅ Interactive components (buttons, selects)
- ✅ Modal forms
- ✅ Permission checking
- ✅ Cooldown management
- ✅ Guild-specific prefixes
- ✅ Command registry system
- ✅ Event routing
- ✅ Comprehensive logging

## Architecture Benefits

1. **Modularity** - Each file has a single responsibility
2. **Maintainability** - Easy to find and update code
3. **Scalability** - Simple to add new commands/features
4. **Testability** - Individual modules can be tested independently
5. **Readability** - Clear structure and organization
6. **Reusability** - Utilities can be shared across commands
7. **Type Safety** - Import system provides namespace protection

## Version History

- **v2.0.0** - Multi-file architecture with import system
- **v1.0.0** - Monolithic single-file bot (main-monolithic-backup.ez)
