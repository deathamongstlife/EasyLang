# Changelog

All notable changes to EzLang will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-01-14

### Added - Discord API Functions (27 Tier 1 Features)

#### Slash Commands
- `register_slash_command(client, guildId, command_data)` - Register slash commands with Discord API
  - Supports options: string, integer, boolean, user, channel, role types
  - Full SlashCommandBuilder integration

#### Embed Functions
- `create_embed(title, description, color)` - Create rich embeds
- `embed_add_field(embed, name, value, inline)` - Add fields to embeds
- `embed_set_author(embed, name, iconURL?, url?)` - Set embed author
- `embed_set_footer(embed, text, iconURL?)` - Set embed footer
- `embed_set_image(embed, url)` - Set large embed image
- `embed_set_thumbnail(embed, url)` - Set small embed thumbnail
- `embed_set_timestamp(embed, timestamp?)` - Set embed timestamp
- `embed_set_url(embed, url)` - Set embed clickable URL

#### Button Components
- `create_button(label, style, customId)` - Create interactive buttons
  - Styles: "primary", "secondary", "success", "danger"
- `create_link_button(label, url)` - Create URL buttons

#### Select Menu Components
- `create_string_select(customId, placeholder, options)` - String dropdown menu
- `create_user_select(customId, placeholder)` - User picker menu
- `create_role_select(customId, placeholder)` - Role picker menu
- `create_channel_select(customId, placeholder)` - Channel picker menu

#### Modal Components
- `create_modal(customId, title)` - Create modal dialogs
- `create_text_input(customId, label, style, required)` - Text input fields
  - Styles: "short", "paragraph"

#### Action Rows
- `create_action_row(...components)` - Container for components (max 5 per row)

#### Interaction Responses
- `interaction_reply(interaction, content, options)` - Reply to interactions
  - Options: ephemeral, embeds, components
- `interaction_defer(interaction, ephemeral)` - Defer response for long operations
- `interaction_update(interaction, content, options)` - Update component interactions

#### Advanced Messaging
- `send_message(channel, content, options)` - Send messages with embeds/components
- `edit_message(message, content, options)` - Edit existing messages
- `delete_message(message)` - Delete messages
- `fetch_message(channel, messageId)` - Retrieve specific message

#### Message Reactions
- `add_reaction(message, emoji)` - Add emoji reactions
- `remove_reaction(message, emoji, user?)` - Remove specific reactions
- `clear_reactions(message)` - Clear all reactions
- `fetch_reactions(message, emoji)` - Get users who reacted

#### Pin Management
- `pin_message(message)` - Pin message in channel
- `unpin_message(message)` - Unpin message
- `fetch_pinned_messages(channel)` - Get all pinned messages

#### Bulk Operations
- `bulk_delete(channel, amount)` - Delete multiple messages (2-100, <14 days old)
- `fetch_messages(channel, limit?)` - Fetch message history (1-100 limit)

#### Context Menus
- `register_user_context_menu(name, callback)` - User right-click commands
- `register_message_context_menu(name, callback)` - Message right-click commands

### Added - File System Functions (7 Built-ins)

#### Directory Operations
- `fs_read_dir(path)` - List files and directories
  - Returns array of file/directory names
  - Throws error if path doesn't exist

- `fs_exists(path)` - Check if file/directory exists
  - Returns boolean
  - Safe to call on any path

- `fs_is_file(path)` - Check if path is a file
  - Returns boolean
  - Returns false if path doesn't exist

- `fs_is_dir(path)` - Check if path is a directory
  - Returns boolean
  - Returns false if path doesn't exist

#### File Operations
- `fs_read_file(path)` - Read file contents as UTF-8 string
  - Throws error if file doesn't exist or can't be read
  - Returns full file contents

- `fs_write_file(path, content)` - Write string to file
  - Creates file if it doesn't exist
  - Overwrites existing content
  - Returns true on success

#### Path Utilities
- `path_join(...parts)` - Join path segments safely
  - Handles cross-platform path separators
  - Normalizes the resulting path
  - Accepts any number of string arguments

### Added - Multi-file Organized Bot Architecture

#### Import System
- `import "path/to/file.ez"` - Import and execute EzLang files
  - Relative paths supported
  - Files executed in order
  - Shared global scope across imports
  - Circular imports prevented

#### File Structure
```
organized-bot/
├── main.ez                      # Entry point
├── config.ez                    # Configuration
├── utils/                       # Utility modules
│   ├── logger.ez               # Logging system
│   ├── database.ez             # Database helpers
│   ├── permissions.ez          # Permission checks
│   └── cooldowns.ez            # Cooldown management
├── handlers/                    # Core handlers
│   ├── command-registry.ez     # Command registration
│   └── event-router.ez         # Event routing
├── commands/                    # Command modules
│   ├── slash/                  # Slash commands
│   ├── message/                # Prefix commands
│   └── context/                # Context menus
├── components/                  # UI components
│   ├── buttons.ez              # Button handlers
│   ├── selects.ez              # Select menu handlers
│   └── modals.ez               # Modal handlers
└── events/                      # Discord events
    ├── ready.ez                # Bot ready event
    ├── messageCreate.ez        # Message events
    └── interactionCreate.ez    # Interaction events
```

#### Handler Registry System
- Global command storage maps
- `register_slash_handler(name, callback)` - Register slash commands
- `register_message_handler(name, callback)` - Register prefix commands
- `register_context_handler(name, callback)` - Register context menus
- Automatic command routing
- Centralized logging

#### Event Routing
- `on_interaction_create(interaction)` - Route all interactions
- Automatic handler lookup
- Support for slash commands, buttons, selects, modals
- Fallback for unknown interactions

### Changed

- **Updated bot_start()** - Now works with multi-file import system
- **Improved error handling** - Better error messages for file operations
- **Enhanced logging** - Structured logging for commands and events

### Technical Details

#### Discord.js v14 Integration
All 27 Discord functions are built on Discord.js v14 API:
- EmbedBuilder for rich embeds
- ButtonBuilder with 5 styles
- StringSelectMenuBuilder, UserSelectMenuBuilder, RoleSelectMenuBuilder, ChannelSelectMenuBuilder
- ModalBuilder with TextInputBuilder
- ActionRowBuilder for component containers
- Full interaction response handling

#### File System Safety
- All fs functions use synchronous operations
- Proper error handling with descriptive messages
- Path normalization for cross-platform compatibility
- UTF-8 encoding by default

#### Import System Implementation
- Resolves relative paths from import location
- Prevents duplicate imports
- Maintains import order
- Shares global environment
- Circular dependency detection

### Breaking Changes

None. This is a feature-additive release that maintains full backward compatibility with v1.x bots.

### Migration Guide

#### From v1.x Simple Bot to v2.0 Organized Bot

1. **Keep your existing bot.ez** - It will work as-is
2. **Optional: Organize into files**
   ```ezlang
   // Before (single file)
   var token = "..."
   bot_start(token)

   // After (multi-file)
   import "config.ez"
   import "commands/ping.ez"
   bot_start(BOT_TOKEN)
   ```

3. **Use new Discord functions**
   ```ezlang
   // New embed creation
   var embed = create_embed("Title", "Description", 0x5865f2)
   embed_add_field(embed, "Field", "Value", false)

   // New button creation
   var button = create_button("Click Me", "primary", "button_id")
   var row = create_action_row(button)
   interaction_reply(interaction, "Message", {components: [row]})
   ```

4. **Use file system functions for dynamic bots**
   ```ezlang
   // Load commands dynamically
   var files = fs_read_dir("./commands")
   for var file in files {
       if fs_is_file(path_join("./commands", file)) {
           import path_join("./commands", file)
       }
   }
   ```

### Examples

See the `examples/organized-bot/` directory for a complete multi-file bot implementation demonstrating all new features.

### Contributors

- EzLang Core Team
- Community contributors

### Notes

This release represents a major milestone for EzLang, bringing it to feature parity with professional Discord.js bots while maintaining the simplicity that makes EzLang special.

---

## [1.0.0] - 2025-01-01

Initial release with core language features and basic Discord bot support.

### Added
- Basic language syntax
- Core built-in functions (print, length, random, wait, etc.)
- Discord bot integration
- Python bridge for package integration
- REPL environment
