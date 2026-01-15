# High-Priority Discord Features Implementation

This document describes the newly implemented high-priority Discord features that make EasyLang feature-complete for beginners building Discord bots.

## Implementation Summary

All requested high-priority features have been successfully implemented and tested:

1. ✅ Guild/Channel/User/Role Fetching Functions
2. ✅ DM Support Functions
3. ✅ Invite Management Functions
4. ✅ Nickname Management Functions
5. ✅ Expanded Message Object Properties

## New Functions

### 1. Guild/Channel/User/Role Fetching Functions

Located in: `src/runtime/discord-builtins.ts`

#### `get_guild(guild_id)`
Fetch a guild by ID.

```easylang
let guild = get_guild("1234567890")
println("Guild: " + guild.name)
println("Members: " + str(guild.memberCount))
```

**Returns:** Guild object with properties:
- `id` - Guild ID
- `name` - Guild name
- `memberCount` - Number of members
- `ownerId` - Owner user ID
- `icon` - Icon hash (if set)
- `iconURL` - Full icon URL (if set)

#### `get_channel(channel_id)`
Fetch a channel by ID.

```easylang
let channel = get_channel("9876543210")
println("Channel: " + channel.name)
println("Type: " + str(channel.type))
```

**Returns:** Channel object with properties:
- `id` - Channel ID
- `type` - Channel type (numeric)
- `name` - Channel name (if applicable)
- `guildId` - Parent guild ID (if applicable)
- `parentId` - Parent category ID (if applicable)

#### `get_user(user_id)`
Fetch a user by ID.

```easylang
let user = get_user("1122334455")
println("User: " + user.username)
println("Bot: " + str(user.bot))
```

**Returns:** User object with properties:
- `id` - User ID
- `username` - Username
- `tag` - Full user tag (username#discriminator)
- `bot` - Whether user is a bot
- `discriminator` - User discriminator
- `avatar` - Avatar hash (if set)
- `avatarURL` - Full avatar URL (if set)

#### `get_role(guild_id, role_id)`
Fetch a role by guild ID and role ID.

```easylang
let role = get_role("1234567890", "5544332211")
println("Role: " + role.name)
println("Color: " + str(role.color))
```

**Returns:** Role object with properties:
- `id` - Role ID
- `name` - Role name
- `color` - Role color (numeric)
- `position` - Role position in hierarchy
- `permissions` - Permission bitfield (string)
- `mentionable` - Whether role is mentionable
- `hoist` - Whether role is hoisted

#### `list_guilds()`
List all guilds the bot is in.

```easylang
let guilds = list_guilds()
println("Bot is in " + str(len(guilds)) + " guilds")

for guild in guilds {
  println("- " + guild.name + " (" + str(guild.memberCount) + " members)")
}
```

**Returns:** Array of Guild objects

---

### 2. DM Support Functions

Located in: `src/runtime/discord-builtins.ts`

#### `send_dm(user, content, options?)`
Send a direct message to a user.

```easylang
# Simple DM
send_dm(user, "Hello from the bot!")

# DM with embed
let embed = create_embed("Title", "Description", 0x00ff00)
send_dm(user, "Check this out:", {
  embeds: [embed]
})

# DM with components
let button = create_button("Click Me", "primary", "btn_id")
let row = create_action_row(button)
send_dm(user, "Click the button:", {
  components: [row]
})
```

**Options:**
- `embeds` - Array of embed objects
- `components` - Array of component rows
- `files` - Array of file paths (strings)

**Returns:** Message object

#### `create_dm_channel(user)`
Create a DM channel with a user.

```easylang
let dmChannel = create_dm_channel(user)
send(dmChannel, "Message to DM channel!")
```

**Returns:** DM Channel object

---

### 3. Invite Management Functions

Located in: `src/runtime/discord-builtins.ts`

#### `create_invite(channel, options?)`
Create an invite for a channel.

```easylang
# Simple invite (default settings)
let invite = create_invite(channel)
println("Invite: " + invite.url)

# Custom invite
let invite = create_invite(channel, {
  max_age: 3600,        # Expires in 1 hour
  max_uses: 10,         # Max 10 uses
  temporary: false,     # Permanent membership
  unique: true,         # Always create new invite
  reason: "Bot invite"  # Audit log reason
})

println("Code: " + invite.code)
println("URL: " + invite.url)
println("Expires: " + invite.expires_at)
```

**Options:**
- `max_age` - Seconds until expiration (0 = never, default: 86400)
- `max_uses` - Max uses (0 = unlimited, default: 0)
- `temporary` - Temporary membership (default: false)
- `unique` - Force unique invite (default: false)
- `reason` - Audit log reason

**Returns:** Invite object with properties:
- `code` - Invite code
- `url` - Full invite URL
- `uses` - Current use count
- `max_uses` - Maximum uses
- `max_age` - Max age in seconds
- `temporary` - Whether temporary
- `created_at` - Creation timestamp
- `expires_at` - Expiration timestamp (if set)
- `inviter` - User who created invite (if available)

#### `fetch_invites(guild)`
Fetch all invites for a guild.

```easylang
let invites = fetch_invites(guild)
println("Found " + str(len(invites)) + " invites")

for invite in invites {
  println("- " + invite.code + " (" + str(invite.uses) + " uses)")
}
```

**Returns:** Array of Invite objects

#### `delete_invite(code_or_invite)`
Delete an invite by code or invite object.

```easylang
# Delete by code
delete_invite("abc123")

# Delete by object
let invite = create_invite(channel)
delete_invite(invite)
```

**Returns:** Boolean (true if successful)

---

### 4. Nickname Management Functions

Located in: `src/runtime/discord-advanced.ts`

#### `set_nickname(member, nickname, reason?)`
Set a member's nickname.

```easylang
# Set nickname
set_nickname(member, "Cool Nickname")

# Set with audit log reason
set_nickname(member, "New Nick", "Changed via bot command")
```

**Returns:** Boolean (true if successful)

#### `reset_nickname(member, reason?)`
Reset a member's nickname (clear it).

```easylang
# Reset nickname
reset_nickname(member)

# Reset with audit log reason
reset_nickname(member, "Reset via bot command")
```

**Returns:** Boolean (true if successful)

---

### 5. Expanded Message Object Properties

Located in: `src/discord/events.ts` (updated `messageToRuntimeValue` function)

All message objects now include these additional properties:

#### Timestamp Properties
```easylang
on("messageCreate", fn(message) {
  println("Created: " + message.created_at)         # ISO timestamp string
  println("Timestamp: " + str(message.created_timestamp))  # Unix timestamp

  if message.edited_at != null {
    println("Edited: " + message.edited_at)         # ISO timestamp string
    println("Edited timestamp: " + str(message.edited_timestamp))  # Unix timestamp
  }
end)
```

#### Message State Properties
```easylang
on("messageCreate", fn(message) {
  println("Pinned: " + str(message.pinned))          # Boolean
  println("Type: " + str(message.type))              # Message type (numeric)
end)
```

#### Mentions Properties
```easylang
on("messageCreate", fn(message) {
  # Array of mentioned users
  let users = message.mentioned_users
  println("Mentioned " + str(len(users)) + " users")

  # Array of mentioned roles
  let roles = message.mentioned_roles
  println("Mentioned " + str(len(roles)) + " roles")

  # Whether @everyone was used
  if message.mentions_everyone {
    println("Message mentions @everyone!")
  }
end)
```

#### Reply Reference
```easylang
on("messageCreate", fn(message) {
  # Check if message is a reply
  if message.reference != null {
    println("Reply to message: " + message.reference.message_id)
    println("In channel: " + message.reference.channel_id)

    if message.reference.guild_id != "" {
      println("In guild: " + message.reference.guild_id)
    }
  }
end)
```

---

## Implementation Details

### Files Modified

1. **`src/runtime/discord-builtins.ts`**
   - Added converter functions: `convertUserToRuntime`, `convertGuildToRuntime`, `convertChannelToRuntime`, `convertRoleToRuntime`, `convertMessageToRuntime`
   - Added fetching functions: `getGuild`, `getChannel`, `getUser`, `getRole`, `listGuilds`
   - Added DM functions: `sendDM`, `createDMChannel`
   - Added invite functions: `createInvite`, `fetchInvites`, `deleteInvite`
   - Updated exports in `discordBuiltins` object

2. **`src/runtime/discord-advanced.ts`**
   - Added nickname functions: `setNickname`, `resetNickname`
   - Updated exports in `advancedDiscordBuiltins` object

3. **`src/discord/events.ts`**
   - Enhanced `messageToRuntimeValue` function with:
     - Timestamp properties (`created_at`, `created_timestamp`, `edited_at`, `edited_timestamp`)
     - State properties (`pinned`, `type`)
     - Mention properties (`mentioned_users`, `mentioned_roles`, `mentions_everyone`)
     - Reference property for replies

### Design Patterns Used

All functions follow the existing EasyLang patterns:

1. **Type Safety**: Use TypeScript type guards (`isString`, `isNumber`, `isBoolean`, `isObject`, `isArray`)
2. **Error Handling**: Proper `RuntimeError` and `TypeError` exceptions with descriptive messages
3. **Raw Object Preservation**: Store Discord.js objects in `__raw` property for method access
4. **Async Support**: All functions use `async/await` for Discord API calls
5. **Optional Parameters**: Support optional parameters with sensible defaults
6. **Documentation**: JSDoc comments for all functions

### Converter Functions

The converter functions transform Discord.js objects to EasyLang RuntimeValues:

- **`convertUserToRuntime(user)`**: Converts Discord User objects
- **`convertGuildToRuntime(guild)`**: Converts Discord Guild objects
- **`convertChannelToRuntime(channel)`**: Converts Discord Channel objects
- **`convertRoleToRuntime(role)`**: Converts Discord Role objects
- **`convertMessageToRuntime(message)`**: Extended message converter with all properties

These converters ensure consistent object structure across all Discord features.

---

## Testing

A comprehensive test file is provided: `examples/discord/new_features_test.ez`

This example demonstrates:
- Guild/channel/user/role fetching
- Enhanced message properties
- DM support
- Invite management
- Nickname management (with code examples)

To test:
1. Set your Discord bot token: `export DISCORD_TOKEN=your_token_here`
2. Run: `npm start examples/discord/new_features_test.ez`
3. Use commands in Discord:
   - `!help` - Show available commands
   - `!msginfo` - Display message properties
   - `!dm` - Receive a DM from the bot
   - `!createinvite` - Create a channel invite

---

## Benefits for Beginners

These features complete the essential Discord bot functionality for beginners:

1. **Guild/Channel/User/Role Fetching**: Enables bots to look up Discord entities by ID
2. **DM Support**: Allows bots to send private messages to users
3. **Invite Management**: Enables bots to create and manage server invites
4. **Nickname Management**: Allows bots to modify member nicknames
5. **Enhanced Message Properties**: Provides complete message metadata for better bot logic

All features use simple, beginner-friendly function names and require minimal setup.

---

## Future Enhancements

Potential additions for advanced users:
- Guild member search/filtering
- Advanced invite analytics
- Bulk nickname operations
- Message edit history tracking
- Advanced mention parsing

---

## Conclusion

The implementation successfully adds all requested high-priority features to EasyLang, making it feature-complete for beginners building Discord bots. All functions follow existing patterns, include proper error handling, and are well-documented with examples.
