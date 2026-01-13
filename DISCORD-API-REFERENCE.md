# EzLang Discord API v14 Reference

Complete reference for Discord bot development with EzLang, featuring full Discord.js v14 compatibility.

## Table of Contents

- [Event System](#event-system)
- [Slash Commands](#slash-commands)
- [Components (Buttons, Selects, Modals)](#components)
- [Embeds](#embeds)
- [Messaging](#messaging)
- [Permissions](#permissions)
- [Role Management](#role-management)
- [Member Management](#member-management)
- [Channel Management](#channel-management)
- [Thread Management](#thread-management)
- [Complete Function Reference](#complete-function-reference)

---

## Event System

EzLang supports all Discord.js v14 events through the `listen` keyword.

### Basic Event Handler

```ezlang
listen eventName with parameter {
    // Handle event
}
```

### Supported Events

#### Core Events
- `ready` - Bot is connected and ready
- `messageCreate` - New message posted
- `messageUpdate` - Message edited
- `messageDelete` - Message deleted
- `interactionCreate` - Any interaction (buttons, commands, etc.)

#### Guild Events
- `guildCreate` - Bot joins a server
- `guildUpdate` - Server updated
- `guildDelete` - Bot removed from server
- `guildMemberAdd` - User joins server
- `guildMemberUpdate` - Member updated
- `guildMemberRemove` - Member leaves/kicked

#### Role Events
- `roleCreate` - Role created
- `roleUpdate` - Role updated
- `roleDelete` - Role deleted

#### Channel Events
- `channelCreate` - Channel created
- `channelUpdate` - Channel updated
- `channelDelete` - Channel deleted

#### Voice Events
- `voiceStateUpdate` - Voice state changed (join/leave/mute)

#### Reaction Events
- `messageReactionAdd` - Reaction added to message
- `messageReactionRemove` - Reaction removed

#### Thread Events
- `threadCreate` - Thread created
- `threadUpdate` - Thread updated
- `threadDelete` - Thread deleted

### Event Examples

```ezlang
// Bot ready
listen ready with client {
    print("Bot online as " + client.user.username)
}

// New message
listen messageCreate with message {
    if message.content == "!ping" {
        reply message with "Pong!"
    }
}

// Interaction (button/command)
listen interactionCreate with interaction {
    if interaction.isButton {
        interaction_reply(interaction, "Button clicked!", {ephemeral: true})
    }
}

// Member joins
listen guildMemberAdd with member {
    print("Welcome " + member.user.username)
}

// Voice state change
listen voiceStateUpdate with oldState {
    // newState available as oldState_args[1]
    print("Voice state changed")
}
```

---

## Slash Commands

Modern Discord command system with rich options and autocomplete.

### Register Slash Command

```ezlang
var commandData = {
    name: "hello",
    description: "Say hello",
    options: [
        {
            type: "String",
            name: "name",
            description: "Person to greet",
            required: true
        },
        {
            type: "Boolean",
            name: "loud",
            description: "Shout greeting",
            required: false
        }
    ]
}

register_slash_command(client, guildId, commandData)
```

### Option Types

- `String` - Text input
- `Integer` - Whole number
- `Boolean` - True/false
- `User` - User selector
- `Channel` - Channel selector
- `Role` - Role selector
- `Number` - Decimal number
- `Mentionable` - User or role

### Handle Slash Command

```ezlang
listen interactionCreate with interaction {
    if interaction.isCommand {
        if interaction.commandName == "hello" {
            var name = interaction.options.name
            var loud = interaction.options.loud

            var greeting = "Hello, " + name + "!"
            if loud {
                greeting = "HELLO, " + name + "!!!"
            }

            interaction_reply(interaction, greeting, {})
        }
    }
}
```

---

## Components

### Buttons

Create interactive buttons with different styles.

```ezlang
// Create buttons
var btn1 = create_button("Click Me", "primary", "btn_id_1")
var btn2 = create_button("Success", "success", "btn_id_2")
var btn3 = create_button("Danger", "danger", "btn_id_3")
var linkBtn = create_link_button("Visit Site", "https://example.com")

// Add to action row
var row = create_action_row(btn1, btn2, btn3)
var row2 = create_action_row(linkBtn)

// Send with message
send_message(channel, "Click a button!", {
    components: [row, row2]
})

// Handle button click
listen interactionCreate with interaction {
    if interaction.isButton {
        if interaction.customId == "btn_id_1" {
            interaction_reply(interaction, "Button 1 clicked!", {ephemeral: true})
        }
    }
}
```

#### Button Styles
- `primary` - Blue (Blurple)
- `secondary` - Gray
- `success` - Green
- `danger` - Red
- `link` - Link button (doesn't trigger interaction)

### Select Menus

#### String Select Menu

```ezlang
var options = [
    {label: "Option 1", value: "opt1", description: "First option"},
    {label: "Option 2", value: "opt2", description: "Second option"},
    {label: "Option 3", value: "opt3", description: "Third option"}
]

var select = create_string_select("menu_id", "Choose option", options)
var row = create_action_row(select)

send_message(channel, "Make a selection!", {components: [row]})

// Handle selection
listen interactionCreate with interaction {
    if interaction.isSelectMenu {
        if interaction.customId == "menu_id" {
            var selected = interaction.values[0]
            interaction_reply(interaction, "You chose: " + selected, {ephemeral: true})
        }
    }
}
```

#### User Select Menu

```ezlang
var userSelect = create_user_select("user_picker", "Select users")
var row = create_action_row(userSelect)

send_message(channel, "Pick users!", {components: [row]})
```

#### Role Select Menu

```ezlang
var roleSelect = create_role_select("role_picker", "Select roles")
var row = create_action_row(roleSelect)

send_message(channel, "Pick roles!", {components: [row]})
```

#### Channel Select Menu

```ezlang
var channelSelect = create_channel_select("channel_picker", "Select channels")
var row = create_action_row(channelSelect)

send_message(channel, "Pick channels!", {components: [row]})
```

### Modals

Create popup forms for user input.

```ezlang
// Create modal
var modal = create_modal("form_id", "Feedback Form")

var nameInput = create_text_input("name_input", "Your Name", "short", true)
var feedbackInput = create_text_input("feedback_input", "Feedback", "paragraph", true)

var row1 = create_action_row(nameInput)
var row2 = create_action_row(feedbackInput)

// Note: Modals must be shown in response to button interaction
// This requires raw interaction object access

// Handle modal submission
listen interactionCreate with interaction {
    if interaction.isModal {
        if interaction.customId == "form_id" {
            var name = interaction.fields.name_input
            var feedback = interaction.fields.feedback_input

            interaction_reply(interaction, "Thanks for feedback, " + name + "!", {})
        }
    }
}
```

#### Text Input Styles
- `short` - Single line (e.g., username)
- `paragraph` - Multi-line (e.g., feedback)

---

## Embeds

Create rich embedded messages with formatting.

### Basic Embed

```ezlang
var embed = create_embed("Title", "Description", 0x5865F2)

send_message(channel, "Check this out!", {embeds: [embed]})
```

### Add Fields

```ezlang
var embed = create_embed("User Info", "Information about user", 0x3498db)

embed_add_field(embed, "Username", "JohnDoe", true)
embed_add_field(embed, "ID", "123456789", true)
embed_add_field(embed, "Joined", "2024-01-01", false)

send_message(channel, "", {embeds: [embed]})
```

### Color Codes

Common Discord colors:
- `0x5865F2` - Blurple (Discord brand)
- `0x57F287` - Green (success)
- `0xFEE75C` - Yellow (warning)
- `0xED4245` - Red (danger)
- `0xEB459E` - Pink
- `0x3498DB` - Blue
- `0x9B59B6` - Purple

---

## Messaging

### Send Message

```ezlang
send_message(channel, "Hello world!", {})

// With embeds
send_message(channel, "Message with embed", {
    embeds: [embed1, embed2]
})

// With components
send_message(channel, "Interactive message", {
    components: [row1, row2]
})

// With files
send_message(channel, "Here's a file", {
    files: ["path/to/file.png"]
})
```

### Edit Message

```ezlang
edit_message(message, "Updated content", {})

// With new embed
edit_message(message, "Updated", {
    embeds: [newEmbed]
})
```

### Delete Message

```ezlang
delete_message(message)
```

### Fetch Message

```ezlang
var message = fetch_message(channel, "message_id_here")
```

### Reply to Message

```ezlang
reply message with "This is a reply"
```

---

## Permissions

Check if a member has specific permissions.

```ezlang
var isAdmin = has_permission(member, "Administrator")
var canKick = has_permission(member, "KickMembers")
var canBan = has_permission(member, "BanMembers")
var canManageChannels = has_permission(member, "ManageChannels")
var canManageRoles = has_permission(member, "ManageRoles")
var canManageMessages = has_permission(member, "ManageMessages")
var canModerate = has_permission(member, "ModerateMembers")

if isAdmin {
    print("User is administrator")
}
```

### Available Permissions

- `Administrator`
- `ManageGuild`
- `ManageRoles`
- `ManageChannels`
- `KickMembers`
- `BanMembers`
- `ManageMessages`
- `SendMessages`
- `EmbedLinks`
- `AttachFiles`
- `ReadMessageHistory`
- `MentionEveryone`
- `UseExternalEmojis`
- `ViewChannel`
- `Connect`
- `Speak`
- `MuteMembers`
- `DeafenMembers`
- `MoveMembers`
- `ManageNicknames`
- `ManageWebhooks`
- `ManageEmojisAndStickers`
- `ManageThreads`
- `CreatePublicThreads`
- `CreatePrivateThreads`
- `SendMessagesInThreads`
- `ModerateMembers`

---

## Role Management

### Create Role

```ezlang
var role = create_role(guild, "VIP", {
    color: 0xFFD700,
    hoist: true,
    mentionable: true
})
```

### Edit Role

```ezlang
edit_role(role, {
    name: "New Name",
    color: 0xFF0000,
    hoist: false
})
```

### Delete Role

```ezlang
delete_role(role)
```

### Add/Remove Role from Member

```ezlang
add_role_to_member(member, role)
remove_role_from_member(member, role)
```

---

## Member Management

### Kick Member

```ezlang
kick_member(member, "Breaking rules")
```

### Ban Member

```ezlang
ban_member(member, "Spam", 7)  // Delete 7 days of messages
```

### Timeout Member

```ezlang
timeout_member(member, 300, "Spamming")  // 300 seconds timeout
```

### Fetch Member

```ezlang
var member = fetch_member(guild, "user_id_here")
```

---

## Channel Management

### Create Channel

```ezlang
var channel = create_channel(guild, "general", "text", {
    topic: "General discussion",
    nsfw: false
})

var voiceChannel = create_channel(guild, "Voice Chat", "voice", {})
var announcement = create_channel(guild, "Announcements", "announcement", {})
```

#### Channel Types
- `text` - Text channel
- `voice` - Voice channel
- `announcement` - Announcement channel
- `category` - Category
- `stage` - Stage channel
- `forum` - Forum channel

### Edit Channel

```ezlang
edit_channel(channel, {
    name: "new-name",
    topic: "New topic",
    nsfw: true
})
```

### Delete Channel

```ezlang
delete_channel(channel)
```

---

## Thread Management

### Create Thread

```ezlang
var thread = create_thread(channel, "Discussion Topic", {
    autoArchiveDuration: 60,
    reason: "New discussion"
})
```

### Archive/Unarchive Thread

```ezlang
archive_thread(thread)
unarchive_thread(thread)
```

### Lock Thread

```ezlang
lock_thread(thread)
```

---

## Complete Function Reference

### Core Functions
- `bot_start(token)` - Start Discord bot
- `print(...)` - Console output
- `wait(seconds)` - Async delay
- `get_argument(name, default)` - Get command line argument

### Events
- `listen eventName with param { }` - Register event handler
- All Discord.js v14 events supported

### Slash Commands
- `register_slash_command(client, guildId, data)` - Register command

### Embeds
- `create_embed(title, description, color)` - Create embed
- `embed_add_field(embed, name, value, inline)` - Add field

### Buttons
- `create_button(label, style, customId)` - Create button
- `create_link_button(label, url)` - Create link button

### Select Menus
- `create_string_select(customId, placeholder, options)` - String selector
- `create_user_select(customId, placeholder)` - User selector
- `create_role_select(customId, placeholder)` - Role selector
- `create_channel_select(customId, placeholder)` - Channel selector

### Modals
- `create_modal(customId, title)` - Create modal
- `create_text_input(customId, label, style, required)` - Create input
- `create_action_row(...components)` - Create action row

### Interactions
- `interaction_reply(interaction, content, options)` - Reply to interaction
- `interaction_defer(interaction, ephemeral)` - Defer response
- `interaction_update(interaction, content, options)` - Update interaction

### Messaging
- `send_message(channel, content, options)` - Send message
- `edit_message(message, content, options)` - Edit message
- `delete_message(message)` - Delete message
- `fetch_message(channel, messageId)` - Fetch message
- `reply message with content` - Reply to message
- `react message with emoji` - Add reaction

### Permissions
- `has_permission(member, permissionName)` - Check permission

### Role Management
- `create_role(guild, name, options)` - Create role
- `edit_role(role, options)` - Edit role
- `delete_role(role)` - Delete role
- `add_role_to_member(member, role)` - Add role
- `remove_role_from_member(member, role)` - Remove role

### Member Management
- `kick_member(member, reason)` - Kick member
- `ban_member(member, reason, deleteMessageDays)` - Ban member
- `timeout_member(member, duration, reason)` - Timeout member
- `fetch_member(guild, userId)` - Fetch member

### Channel Management
- `create_channel(guild, name, type, options)` - Create channel
- `edit_channel(channel, options)` - Edit channel
- `delete_channel(channel)` - Delete channel

### Thread Management
- `create_thread(channel, name, options)` - Create thread
- `archive_thread(thread)` - Archive thread
- `unarchive_thread(thread)` - Unarchive thread
- `lock_thread(thread)` - Lock thread

---

## Examples

See the `examples/` directory for complete working examples:

- `comprehensive-discord-bot.ez` - All features demonstration
- `slash-commands-bot.ez` - Modern slash commands
- `moderation-bot.ez` - Guild management and moderation
- `live-discord-bot.ez` - Complete production-ready bot

---

## Best Practices

1. **Always check permissions before executing admin commands**
2. **Use ephemeral responses for errors and confirmations**
3. **Implement proper error handling in event listeners**
4. **Use embeds for rich, formatted responses**
5. **Defer long-running interactions to avoid timeouts**
6. **Use components for interactive user experiences**
7. **Log important guild events for audit trails**

---

## Getting Started

```bash
# Run with environment variables
ezlang your-bot.ez TOKEN=your_token GUILD_ID=your_guild

# Or use get_argument in your code
var TOKEN = get_argument("TOKEN", "")
bot_start(TOKEN)
```

---

**EzLang Discord API v14 - Making Discord bot development simple and powerful!**
