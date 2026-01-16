# Advanced Features Documentation (Issues #16-23)

This document covers all 8 new advanced features added to EasyLang.

## Issue #16: Advanced Caching Configuration

Manage Discord.js cache to optimize memory usage and performance.

### Functions

#### `configure_cache(options)`
Set cache limits per manager.
```ezlang
let options = {
    messages: 100,
    users: 500,
    members: 1000,
    guilds: 10,
    channels: 50,
    roles: 100,
    emojis: 50,
    presences: 200,
    voice_states: 50,
    threads: 30
}
configure_cache(options)
```

#### `get_cache_stats()`
Get cache statistics for all managers.
```ezlang
let stats = get_cache_stats()
print("Guilds:", stats.guilds)
print("Users:", stats.users)
print("Messages:", stats.messages)
print("Memory (MB):", stats.memory.heap_used_mb)
```

#### `clear_cache(type)`
Clear specific caches. Types: `"messages"`, `"users"`, `"members"`, `"presences"`, `"voice_states"`, `"threads"`, `"all"`.
```ezlang
let cleared = clear_cache("messages")
print("Cleared", cleared, "cached messages")
```

#### `set_cache_sweep(interval, lifetime)`
Configure automatic cache sweeping.
```ezlang
# Sweep every 5 minutes, remove items older than 10 minutes
set_cache_sweep(300, 600)
```

---

## Issue #17: Permission Calculator

Calculate and manage Discord permissions with overwrites.

### Functions

#### `get_channel_permissions(channel_id, member_id)`
Get effective permissions for a member in a channel.
```ezlang
let perms = get_channel_permissions("channel_id", "member_id")
print("Has administrator:", perms.has_administrator)
print("Permissions:", perms.permissions)
```

#### `calculate_permissions(member_id, channel_id)`
Calculate permissions with overwrites.
```ezlang
let calc = calculate_permissions("member_id", "channel_id")
print("Base permissions:", calc.base_permissions)
print("Channel permissions:", calc.channel_permissions)
print("Overwrites:", calc.overwrites)
```

#### `has_permissions(member_id, permissions, [channel_id])`
Check if member has all specified permissions.
```ezlang
let required = ["SEND_MESSAGES", "EMBED_LINKS", "ATTACH_FILES"]
let check = has_permissions("member_id", required, "channel_id")
print("Has all:", check.has_all)
print("Details:", check.details)
```

#### `create_permission_bitfield(permissions)`
Create a permission bitfield from permission names.
```ezlang
let perms = ["ADMINISTRATOR", "MANAGE_GUILD"]
let bitfield = create_permission_bitfield(perms)
print("Bitfield:", bitfield.bitfield)
```

#### `add_permissions(bitfield, permissions)`
Add permissions to a bitfield.
```ezlang
let new_perms = ["MANAGE_MESSAGES"]
let updated = add_permissions(bitfield, new_perms)
```

#### `remove_permissions(bitfield, permissions)`
Remove permissions from a bitfield.
```ezlang
let remove = ["ADMINISTRATOR"]
let updated = remove_permissions(bitfield, remove)
```

---

## Issue #18: Command Decorators

Add permission checks and restrictions to commands.

### Functions

#### `require_permission(permission)`
Create a permission requirement decorator.
```ezlang
let admin_check = require_permission("ADMINISTRATOR")
let manage_check = require_permission("MANAGE_MESSAGES")
```

#### `require_role(role_id)`
Create a role requirement decorator.
```ezlang
let mod_check = require_role("moderator_role_id")
```

#### `guild_only()`
Restrict command to guild channels only.
```ezlang
let guild_check = guild_only()
```

#### `owner_only()`
Restrict command to bot owner only.
```ezlang
let owner_check = owner_only()
```

#### `register_command_check(name, check_function)`
Register a custom check function.
```ezlang
register_command_check("premium_only", premium_check_function)
```

#### `apply_checks(command_name, checks)`
Apply checks to a command.
```ezlang
apply_checks("ban", admin_check)
apply_checks("ban", guild_check)
```

#### `run_checks(command_name, context)`
Run all checks for a command.
```ezlang
let context = {
    user_id: user_id,
    guild_id: guild_id,
    channel_id: channel_id
}
let result = run_checks("ban", context)
if result.passed == false {
    print("Check failed:", result.reason)
}
```

---

## Issue #19: Help Command System

Automatic help command generation and management.

### Functions

#### `register_command(name, description, category, usage, [aliases], [examples])`
Register command metadata.
```ezlang
register_command(
    "ban",
    "Ban a user from the server",
    "Moderation",
    "ban <@user> [reason]",
    ["b"],
    ["!ban @BadUser spamming", "!ban @User"]
)
```

#### `generate_help([category])`
Generate help embed automatically.
```ezlang
let help_embed = generate_help()
# Or for specific category:
let mod_help = generate_help("Moderation")
```

#### `get_command_help(command_name)`
Get detailed help for a specific command.
```ezlang
let cmd_help = get_command_help("ban")
send_message(channel_id, cmd_help)
```

#### `set_help_footer(text)`
Customize help footer text.
```ezlang
set_help_footer("Use !help <command> for details")
```

#### `set_help_prefix(prefix)`, `set_help_color(color)`, `set_help_title(title)`
Customize help appearance.
```ezlang
set_help_prefix("!")
set_help_color(0x5865F2)
set_help_title("My Bot Commands")
```

#### `list_categories()`
Get all command categories.
```ezlang
let categories = list_categories()
for cat in categories {
    print("Category:", cat)
}
```

---

## Issue #20: Type Converter System

Automatic type conversion for Discord objects.

### Functions

#### `convert_to_member(value, guild_id)`
Convert string (ID, mention, username) to Member.
```ezlang
let member = convert_to_member("@User", guild_id)
# Or: convert_to_member("123456789", guild_id)
# Or: convert_to_member("Username", guild_id)
print("Member:", member.username)
```

#### `convert_to_channel(value, guild_id)`
Convert string to Channel.
```ezlang
let channel = convert_to_channel("#general", guild_id)
# Or: convert_to_channel("123456789", guild_id)
print("Channel:", channel.name)
```

#### `convert_to_role(value, guild_id)`
Convert string to Role.
```ezlang
let role = convert_to_role("@Admin", guild_id)
# Or: convert_to_role("123456789", guild_id)
print("Role:", role.name)
```

#### `convert_to_user(value)`
Convert string to User.
```ezlang
let user = convert_to_user("@User")
print("User:", user.username)
```

#### `register_converter(type, converter_function)`
Register custom converter.
```ezlang
register_converter("custom_type", converter_fn)
```

#### `auto_convert(value, type, context)`
Automatically convert to specified type.
```ezlang
let context = { guild_id: guild_id }
let member = auto_convert("@User", "member", context)
let channel = auto_convert("#general", "channel", context)
let role = auto_convert("@Mod", "role", context)
```

---

## Issue #21: REST-Only Mode

Make Discord API requests without WebSocket connection.

### Functions

#### `create_rest_client(token, [application_id])`
Create a REST-only Discord client.
```ezlang
let client = create_rest_client(token)
# Or with app ID:
let client = create_rest_client(token, app_id)
```

#### `rest_get(endpoint)`
Make a GET request.
```ezlang
let response = rest_get("/users/@me")
print("Status:", response.status)
print("Data:", response.data)
```

#### `rest_post(endpoint, data)`
Make a POST request.
```ezlang
let data = { content: "Hello!" }
let response = rest_post("/channels/123/messages", data)
```

#### `rest_patch(endpoint, data)`, `rest_delete(endpoint)`, `rest_put(endpoint, data)`
Other HTTP methods.
```ezlang
rest_patch("/channels/123", { name: "new-name" })
rest_delete("/channels/123/messages/456")
rest_put("/channels/123/permissions/789", perm_data)
```

#### `rest_send_message(channel_id, content)`
Convenience function to send messages.
```ezlang
let msg = rest_send_message(channel_id, "Hello!")
print("Message ID:", msg.message_id)
```

---

## Issue #22: Builder Validation

Validate embeds, buttons, and components against Discord limits.

### Functions

#### `validate_embed(embed)`
Validate embed against Discord limits.
```ezlang
let embed = create_embed()
set_embed_title(embed, "My Title")
set_embed_description(embed, "Description here")

let validation = validate_embed(embed)
print("Valid:", validation.valid)
print("Errors:", validation.errors)
print("Warnings:", validation.warnings)
```

Checks:
- Title ≤ 256 characters
- Description ≤ 4096 characters
- ≤ 25 fields
- Field names ≤ 256 characters
- Field values ≤ 1024 characters
- Footer text ≤ 2048 characters
- Author name ≤ 256 characters
- Total characters ≤ 6000
- Valid URLs

#### `validate_button(button)`
Validate button properties.
```ezlang
let button = create_button()
let validation = validate_button(button)
```

Checks:
- Label ≤ 80 characters
- Custom ID ≤ 100 characters
- URL ≤ 512 characters
- Valid button style
- Link buttons have URL
- Interactive buttons have custom_id

#### `validate_select_menu(menu)`
Validate select menu.
```ezlang
let menu = create_select_menu()
let validation = validate_select_menu(menu)
```

Checks:
- Custom ID ≤ 100 characters
- Placeholder ≤ 150 characters
- ≥ 1 option
- ≤ 25 options
- Option labels ≤ 100 characters
- Option values ≤ 100 characters
- No duplicate values
- Valid min/max values

#### `validate_action_row(action_row)`
Validate action row.
```ezlang
let validation = validate_action_row(row)
```

Checks:
- ≤ 5 components
- Can't mix buttons and select menus
- Select menu rows have only 1 component

---

## Issue #23: Gateway Intents Configuration

Configure Discord gateway intents for your bot.

### Functions

#### `configure_intents(intents_array)`
Set gateway intents for the bot.
```ezlang
let intents = [
    "GUILDS",
    "GUILD_MESSAGES",
    "GUILD_MEMBERS",
    "MESSAGE_CONTENT"
]
let result = configure_intents(intents)
print("Configured", result.intent_count, "intents")
if result.has_privileged {
    print("Warning:", result.warning)
}
```

#### `add_intent(intent)`, `remove_intent(intent)`
Add or remove single intent.
```ezlang
add_intent("GUILD_PRESENCES")
remove_intent("GUILD_MESSAGE_TYPING")
```

#### `get_intents()`
Get current intents configuration.
```ezlang
let current = get_intents()
print("Intents:", current.intents)
print("Count:", current.count)
```

#### `reset_intents()`
Reset to default intents (GUILDS, GUILD_MESSAGES, GUILD_MESSAGE_REACTIONS).
```ezlang
reset_intents()
```

#### `list_all_intents()`
Get list of all available intents with descriptions.
```ezlang
let all = list_all_intents()
for intent in all {
    print(intent.name, "-", intent.description)
    print("  Privileged:", intent.privileged)
    print("  Enabled:", intent.enabled)
}
```

#### `has_intent(intent)`
Check if specific intent is enabled.
```ezlang
let check = has_intent("MESSAGE_CONTENT")
print("Enabled:", check.enabled)
print("Privileged:", check.privileged)
```

#### `configure_all_intents()`
Enable all available intents (requires all privileged intents approved).
```ezlang
configure_all_intents()
```

### Available Intents

**Non-Privileged:**
- GUILDS
- GUILD_MODERATION
- GUILD_EMOJIS_AND_STICKERS
- GUILD_INTEGRATIONS
- GUILD_WEBHOOKS
- GUILD_INVITES
- GUILD_VOICE_STATES
- GUILD_MESSAGES
- GUILD_MESSAGE_REACTIONS
- GUILD_MESSAGE_TYPING
- DIRECT_MESSAGES
- DIRECT_MESSAGE_REACTIONS
- DIRECT_MESSAGE_TYPING
- GUILD_SCHEDULED_EVENTS
- AUTO_MODERATION_CONFIGURATION
- AUTO_MODERATION_EXECUTION

**Privileged (require approval in Discord Developer Portal):**
- GUILD_MEMBERS
- GUILD_PRESENCES
- MESSAGE_CONTENT

---

## Complete Example

See `examples/advanced_features_demo.ezlang` for a complete working example that demonstrates all 8 features.

## Notes

- All functions are registered in `src/core/runtime/builtins.ts`
- Extension files are in `src/discord/extensions/`
- TypeScript compilation tested and passing
- Features follow established EasyLang patterns
