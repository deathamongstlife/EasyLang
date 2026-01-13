# File Index - Organized Bot

Complete index of all files in the organized bot project.

## 📁 Project Structure

```
organized-bot/
├── 📄 Documentation (3 files)
├── 📂 commands/ (10 files)
├── 📂 components/ (4 files)
├── 📂 events/ (3 files)
├── 📂 utils/ (4 files)
└── 📄 Core Files (2 files)

Total: 26 files
```

## 📄 Documentation Files (3)

### README.md
**Purpose**: Main documentation and usage guide
**Contains**:
- Feature overview
- Installation instructions
- Configuration guide
- Command templates
- Best practices
- Troubleshooting

### QUICKSTART.md
**Purpose**: Quick setup guide for beginners
**Contains**:
- 5-minute setup instructions
- Discord bot creation
- Configuration steps
- First command tutorial
- Common issues and solutions

### FEATURES.md
**Purpose**: Complete feature listing and comparison
**Contains**:
- All implemented features
- Feature comparison table
- Implementation notes
- Extension ideas
- Code statistics

### FILE-INDEX.md
**Purpose**: This file - complete file listing
**Contains**:
- Directory structure
- File purposes
- Line counts
- Quick reference

## 📂 Commands Directory (10 files)

### commands/slash/ (6 files)

#### ping.ez (64 lines)
**Purpose**: Slash command for bot latency check
**Command**: `/ping`
**Features**: Latency calculation, embed response, 5s cooldown
**Exports**: `execute_ping()`, `register_ping_command()`

#### help.ez (74 lines)
**Purpose**: Display all bot commands and features
**Command**: `/help`
**Features**: Categorized command list, version info, link buttons
**Exports**: `execute_help()`, `register_help_command()`

#### userinfo.ez (89 lines)
**Purpose**: Display detailed user information
**Command**: `/userinfo [user]`
**Features**: Account details, guild info, owner detection, roles
**Exports**: `execute_userinfo()`, `register_userinfo_command()`

#### serverinfo.ez (98 lines)
**Purpose**: Display server statistics and information
**Command**: `/serverinfo`
**Features**: Member count, channels, roles, boost status
**Exports**: `execute_serverinfo()`, `register_serverinfo_command()`

#### components.ez (67 lines)
**Purpose**: Showcase interactive components
**Command**: `/components`
**Features**: Buttons, select menus, component demo
**Exports**: `execute_components()`, `register_components_command()`

#### show-modal.ez (43 lines)
**Purpose**: Display modal dialog for text input
**Command**: `/show-modal`
**Features**: Modal creation, text inputs, form handling
**Exports**: `execute_show_modal()`, `register_show_modal_command()`

### commands/message/ (2 files)

#### ping.ez (59 lines)
**Purpose**: Message command for bot latency
**Command**: `!ping` (aliases: `!p`, `!latency`)
**Features**: Latency calculation, alias support
**Exports**: `execute_message_ping()`, `register_message_ping_command()`

#### setprefix.ez (58 lines)
**Purpose**: Change server command prefix
**Command**: `!setprefix <prefix>` (aliases: `!prefix`, `!changeprefix`)
**Features**: Prefix validation, database storage, guild-only
**Exports**: `execute_setprefix()`, `register_setprefix_command()`

### commands/context/ (2 files)

#### userinfo-context.ez (62 lines)
**Purpose**: User info via right-click context menu
**Command**: Right-click user → Apps → User Info
**Features**: Quick user lookup, ephemeral response
**Exports**: `execute_userinfo_context()`, `register_userinfo_context_command()`

#### messageinfo-context.ez (87 lines)
**Purpose**: Message info via right-click context menu
**Command**: Right-click message → Apps → Message Info
**Features**: Message details, attachments, reactions, timestamp
**Exports**: `execute_messageinfo_context()`, `register_messageinfo_context_command()`

## 📂 Components Directory (4 files)

### button-handler.ez (61 lines)
**Purpose**: Handle button interactions
**Handles**: `comp_btn_primary`, `comp_btn_success`, `comp_btn_danger`
**Features**: Public buttons, dynamic responses, embed updates
**Exports**: `handle_primary_button()`, `handle_success_button()`, `handle_danger_button()`, `register_button_handlers()`

### select-handler.ez (59 lines)
**Purpose**: Handle select menu interactions
**Handles**: `comp_select`
**Features**: Option selection, dynamic responses, value tracking
**Exports**: `handle_string_select()`, `register_select_handlers()`

### modal-handler.ez (54 lines)
**Purpose**: Handle modal form submissions
**Handles**: `feedback_modal`
**Features**: Form data extraction, database storage, confirmation
**Exports**: `handle_feedback_modal()`, `register_modal_handlers()`

### autocomplete-handler.ez (73 lines)
**Purpose**: Provide autocomplete suggestions
**Handles**: Language command autocomplete
**Features**: Dynamic filtering, query matching, 25-choice limit
**Exports**: `handle_language_autocomplete()`, `register_autocomplete_handlers()`

## 📂 Events Directory (3 files)

### ready.ez (87 lines)
**Purpose**: Bot startup and initialization
**Event**: `ready`
**Features**: Status rotation, startup logging, bot statistics
**Exports**: `on_ready_event()`, `set_status_rotating()`, `rotate_status()`

### messageCreate.ez (178 lines)
**Purpose**: Handle message commands (prefix commands)
**Event**: `messageCreate`
**Features**: Prefix parsing, alias resolution, validation, execution
**Exports**: `on_message_create()`, `register_message_command()`, `parse_command()`

### interactionCreate.ez (272 lines)
**Purpose**: Handle all Discord interactions
**Event**: `interactionCreate`
**Features**: Slash commands, context menus, buttons, selects, modals, autocomplete
**Exports**: `on_interaction_create()`, `register_slash_handler()`, `register_context_handler()`, `register_button_handler()`, `register_select_handler()`, `register_modal_handler()`, `register_autocomplete_handler()`

## 📂 Utils Directory (4 files)

### database.ez (107 lines)
**Purpose**: Persistent data storage system
**Features**: Key-value storage, guild data, user data
**Functions**:
- `db_init()` - Initialize database
- `db_set(key, value)` - Store data
- `db_get(key)` - Retrieve data
- `db_has(key)` - Check existence
- `db_delete(key)` - Delete data
- `db_get_prefix(guild_id)` - Get guild prefix
- `db_set_prefix(guild_id, prefix)` - Set guild prefix
- `db_get_user_data(user_id, key)` - Get user data
- `db_set_user_data(user_id, key, value)` - Set user data
- `db_get_guild_data(guild_id, key)` - Get guild data
- `db_set_guild_data(guild_id, key, value)` - Set guild data

### permissions.ez (152 lines)
**Purpose**: Permission checking and validation
**Features**: Guild owner check, NSFW validation, permission arrays
**Functions**:
- `is_guild_owner(user_id, guild)` - Check guild owner
- `is_bot_owner(user_id)` - Check bot owner
- `is_nsfw_channel(channel)` - Validate NSFW
- `check_permissions(member, required_perms)` - Check permission array
- `has_permission(permissions, perm_name)` - Check single permission
- `get_missing_permissions(member, required_perms)` - List missing
- `permission_error_message(missing_perms)` - Format error
- `can_manage_guild(member)` - Helper for ManageGuild
- `can_moderate(member)` - Helper for moderation
- `is_administrator(member)` - Helper for admin

### cooldowns.ez (146 lines)
**Purpose**: Command cooldown management
**Features**: Per-user, per-command tracking, auto cleanup, bypass
**Functions**:
- `cooldown_init()` - Initialize system
- `is_on_cooldown(user_id, command_name)` - Check status
- `get_cooldown_remaining(user_id, command_name)` - Time left
- `set_cooldown(user_id, command_name, duration_ms)` - Apply
- `cooldown_remove(user_id, command_name)` - Remove
- `clear_user_cooldowns(user_id)` - Clear all for user
- `format_cooldown_time(ms)` - Human readable
- `cooldown_error_message(remaining_ms, command_name)` - Error
- `should_bypass_cooldown(user_id, member)` - Check bypass
- `cleanup_expired_cooldowns()` - Cleanup

### logger.ez (131 lines)
**Purpose**: Formatted console logging
**Features**: Multiple log levels, timestamps, specialized loggers
**Functions**:
- `log_info(message)` - Info logging
- `log_success(message)` - Success logging
- `log_error(message)` - Error logging
- `log_warn(message)` - Warning logging
- `log_debug(message)` - Debug logging
- `log_command(user, command_name, guild_name)` - Command usage
- `log_event(event_name, details)` - Event logging
- `log_status(status_message)` - Status logging
- `log_exception(error_message, context)` - Exception logging
- `log_startup_banner(bot_name, version)` - Startup banner
- `log_separator()` - Visual separator

## 📄 Core Files (2)

### config.ez (176 lines)
**Purpose**: Central configuration and settings
**Contains**:
- Bot settings (name, version, owners)
- Development mode configuration
- Command settings (prefix, cooldowns)
- Feature flags (enable/disable features)
- Logging settings
- Status rotation configuration
- Embed color scheme
- Error and success messages
- Database settings
- Helper functions

**Key Variables**:
- `BOT_TOKEN` - Discord bot token
- `BOT_NAME` - Bot name
- `BOT_VERSION` - Version number
- `BOT_OWNERS` - Array of owner user IDs
- `DEVELOPMENT_MODE` - Dev mode flag
- `DEV_GUILD_ID` - Testing guild ID
- `DEFAULT_PREFIX` - Command prefix
- `DEFAULT_COOLDOWN` - Default cooldown duration
- `ENABLE_*` - Feature flags
- `STATUS_MESSAGES` - Status rotation array
- All color constants
- All error message constants

### main.ez (138 lines)
**Purpose**: Bot entry point and initialization
**Contains**:
- Import statements (conceptual)
- Utility initialization
- Event handler registration
- Command registration
- Component handler registration
- Bot client creation
- Bot startup sequence
- Graceful shutdown handling

**Flow**:
1. Load configuration
2. Initialize utilities (database, cooldowns, logger)
3. Load event handlers
4. Load all commands (slash, message, context)
5. Load component handlers
6. Create Discord client
7. Register events
8. Register commands
9. Start bot

## 📊 Statistics

### By Category
- **Documentation**: 3 files, ~500 lines
- **Commands**: 10 files, ~700 lines
- **Components**: 4 files, ~250 lines
- **Events**: 3 files, ~540 lines
- **Utils**: 4 files, ~540 lines
- **Core**: 2 files, ~315 lines

### Totals
- **Total Files**: 26
- **Total Lines**: ~2,845 lines
- **EzLang Files**: 22 (.ez)
- **Documentation Files**: 4 (.md)

### Code Distribution
- Commands: 24.6%
- Events: 19.0%
- Utils: 19.0%
- Documentation: 17.6%
- Core: 11.1%
- Components: 8.8%

## 🔍 Quick Reference

### Need to...

**Add a new slash command?**
→ Create `commands/slash/commandname.ez`
→ Follow template in `commands/slash/ping.ez`
→ Register in `main.ez`

**Add a new message command?**
→ Create `commands/message/commandname.ez`
→ Follow template in `commands/message/ping.ez`
→ Register in `main.ez`

**Add a button handler?**
→ Add to `components/button-handler.ez`
→ Register with `register_button_handler()`

**Change bot settings?**
→ Edit `config.ez`
→ Modify constants and flags

**Add database functionality?**
→ Add function to `utils/database.ez`
→ Use `db_*` functions

**Debug an issue?**
→ Enable `DEBUG_MODE = true` in `config.ez`
→ Check logs with `log_debug()`

**Change permissions?**
→ Modify `utils/permissions.ez`
→ Add to command's `permissions` array

**Adjust cooldowns?**
→ Change `cooldown` in command metadata
→ Modify defaults in `config.ez`

## 🎯 Entry Points

**To run the bot**: `main.ez`
**To configure**: `config.ez`
**To understand**: `README.md`
**To get started quickly**: `QUICKSTART.md`
**To see features**: `FEATURES.md`
**To find files**: This file!

## 🔗 Dependencies

### File Dependencies (Conceptual)

```
main.ez
├── config.ez
├── utils/
│   ├── database.ez
│   ├── permissions.ez
│   ├── cooldowns.ez
│   └── logger.ez
├── events/
│   ├── ready.ez → config.ez, logger.ez
│   ├── messageCreate.ez → config.ez, database.ez, permissions.ez, cooldowns.ez
│   └── interactionCreate.ez → config.ez, permissions.ez, cooldowns.ez
├── commands/
│   ├── slash/*.ez → config.ez, events/interactionCreate.ez
│   ├── message/*.ez → config.ez, events/messageCreate.ez
│   └── context/*.ez → config.ez, events/interactionCreate.ez
└── components/*.ez → config.ez, events/interactionCreate.ez
```

## 📝 Notes

- All `.ez` files are self-contained with documentation
- Import statements are conceptual (commented out)
- Each command file exports its registration function
- Utilities are designed to be reusable
- Configuration is centralized in `config.ez`
- Logging is consistent across all files
- Error handling follows try-return pattern

## ✅ Checklist for New Features

When adding new features, ensure:
- [ ] File created in correct directory
- [ ] Proper header comment with purpose
- [ ] Function documentation
- [ ] Error handling implemented
- [ ] Registration function exported
- [ ] Added to main.ez imports
- [ ] Configuration added to config.ez if needed
- [ ] Logging added for debugging
- [ ] README.md updated with new feature
- [ ] Tested in development mode

---

**Last Updated**: 2026-01-13
**Version**: 1.0.0
**Total Files**: 26
