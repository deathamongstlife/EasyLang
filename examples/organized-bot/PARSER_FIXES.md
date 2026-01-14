# Parser Error Fixes - Organized Bot

## Date: 2026-01-14

## Summary
Fixed all parser errors in the multi-file organized bot structure. The main issue was that command files were calling `register_command()` during module initialization, but this function is only available after the bot connects to Discord.

## Root Cause
The `register_command()` function is a Discord bot API function that's only available within event handlers after the bot has connected to Discord. Command files were attempting to call it at module load time, causing parser/runtime errors.

## Solution
1. **Moved Discord command registration to the `ready` event** - All `register_command()` calls now happen in `events/ready.ez` after the bot connects
2. **Simplified command file registration** - Command files now only register their handlers with the command registry, not with Discord directly
3. **Maintained separation of concerns** - Command handlers remain in their individual files, only the Discord API registration is centralized

## Files Modified

### 1. events/ready.ez
**Changes:**
- Added all `register_command()` calls for slash commands, user context menus, and message context menus
- These registrations now happen inside the `listen "ready"` event handler when the bot is fully connected

**Added:**
```ezlang
// Register all slash commands with Discord
print("[READY] Registering slash commands...")

register_command({ name: "ping", description: "Replies with Pong!", type: 1 })
register_command({ name: "help", description: "Replies with a list of available application commands.", type: 1 })
// ... etc for all commands
```

### 2. commands/slash/ping.ez
**Before:**
```ezlang
function register_ping() {
    register_slash_handler("ping", execute_ping)
    register_command({
        name: "ping",
        description: "Replies with Pong!",
        type: 1
    })
}

register_ping()
```

**After:**
```ezlang
// Register command handler
register_slash_handler("ping", execute_ping)
```

### 3. commands/slash/help.ez
**Changes:** Same pattern as ping.ez - removed wrapper function and `register_command()` call

### 4. commands/slash/userinfo.ez
**Changes:** Same pattern - removed wrapper function and `register_command()` call

### 5. commands/slash/serverinfo.ez
**Changes:** Same pattern - removed wrapper function and `register_command()` call

### 6. commands/slash/components.ez
**Changes:** Same pattern - removed wrapper function and `register_command()` call

### 7. commands/slash/show-modal.ez
**Changes:** Same pattern - removed wrapper function and `register_command()` call

### 8. commands/context/userinfo.ez
**Changes:** Removed `register_command()` call for user context menu

### 9. commands/context/messageinfo.ez
**Changes:** Removed `register_command()` call for message context menu

### 10. commands/message/ping.ez
**Changes:** Simplified to just call `register_message_handler()`

### 11. commands/message/help.ez
**Changes:** Simplified to just call `register_message_handler()`

### 12. commands/message/set.ez
**Changes:** Simplified to just call `register_message_handler()`

## Architecture Explanation

### Two-Level Registration System

The bot now uses a two-level registration system:

1. **Handler Registration (at module load time)**
   - Files: All command files in `commands/` directories
   - Function: `register_slash_handler()`, `register_message_handler()`, `register_context_handler()`
   - Purpose: Register the command handler function with the bot's internal command registry
   - Timing: When modules are imported (before bot connects)

2. **Discord API Registration (at bot ready)**
   - File: `events/ready.ez`
   - Function: `register_command()`
   - Purpose: Register commands with Discord's API so they appear in the UI
   - Timing: Inside the `ready` event after bot connects

### Execution Flow

```
1. main.ez starts
   |
2. Import all modules
   |
   +-- config.ez (loads configuration)
   |
   +-- utils/*.ez (load utility functions)
   |
   +-- handlers/*.ez (load handler registry)
   |
   +-- commands/**/*.ez (register handlers internally)
   |      Each command calls register_*_handler()
   |
   +-- components/*.ez (load component handlers)
   |
   +-- events/*.ez (register event listeners)
   |
3. bot_start(BOT_TOKEN) - Connect to Discord
   |
4. "ready" event fires
   |
5. events/ready.ez executes
   |
   +-- Calls register_command() for each slash command
   |
   +-- Calls register_command() for each context menu
   |
6. Bot is fully operational
   |
7. When user runs /ping:
   |
   +-- Discord sends interaction
   |
   +-- events/interactionCreate.ez receives it
   |
   +-- Calls handle_slash_command("ping", interaction)
   |
   +-- Looks up "ping" in slash_commands registry
   |
   +-- Calls execute_ping(interaction) from commands/slash/ping.ez
```

## Why This Works

1. **Handler registration doesn't require Discord connection** - We can store function references in a map before connecting
2. **Discord command registration requires connection** - The `register_command()` API is only available after the ready event
3. **Clean separation** - Command logic stays in individual files, Discord API calls are centralized in the ready event
4. **Maintains modularity** - Each command file is still self-contained with its own logic

## Testing Instructions

To verify the fixes:

```bash
cd examples/organized-bot
./verify-structure.sh

# If all files present, run the bot:
ezlang run main.ez BOT_TOKEN=your_token_here OWNER_ID=your_id_here
```

Expected output:
```
[CONFIG] Configuration loaded
[LOGGER] Logging utilities loaded
[DATABASE] Database utilities loaded
[PERMISSIONS] Permission utilities loaded
[COOLDOWNS] Cooldown utilities loaded
[COMMAND-REGISTRY] Command registry loaded
[EVENT-ROUTER] Event router loaded
[COMMANDS/SLASH/PING] Ping command loaded
... (all other commands load)
[EVENTS/READY] Ready event registered
[EVENTS/MESSAGECREATE] Message event registered
[EVENTS/INTERACTIONCREATE] Interaction event registered

[MAIN] All modules loaded successfully
[MAIN] Starting bot...
[MAIN] Connecting to Discord...

Bot is ready!
Logged in as: YourBot
[READY] Registering slash commands...
[READY] All commands registered
```

## Benefits of This Approach

1. **Fixes all parser errors** - No more calls to undefined functions
2. **Maintains clean code structure** - Each command in its own file
3. **Follows Discord.js best practices** - Commands registered in ready event
4. **Centralized registration** - Easy to see all commands in one place
5. **Easy to add new commands** - Just create file + add registration line in ready.ez

## Files That Were NOT Changed

These files did not require changes:
- `config.ez` - Configuration remains the same
- `utils/*.ez` - All utility functions unchanged
- `handlers/command-registry.ez` - Registry system unchanged
- `handlers/event-router.ez` - Routing logic unchanged
- `components/*.ez` - Component handlers unchanged
- `events/messageCreate.ez` - Message event unchanged
- `events/interactionCreate.ez` - Interaction event unchanged
- `main.ez` - Entry point unchanged

## Verification Checklist

- [x] All `register_command()` calls moved to ready event
- [x] All command files register handlers only
- [x] No wrapper functions in command files
- [x] All imports remain in main.ez
- [x] Handler registration happens at module load
- [x] Discord registration happens in ready event
- [x] Print statements show proper loading sequence
- [x] Two-level registration system documented

## Next Steps

If you encounter any issues:

1. **Check bot token** - Ensure BOT_TOKEN is valid
2. **Check permissions** - Bot needs applications.commands scope
3. **Check imports** - Verify all import paths are correct
4. **Check event order** - Ready must fire before commands work
5. **Check handler names** - Must match between registration and Discord

The bot should now parse and start successfully!
