# Discord API Reference

Complete reference for EzLang's Discord.js v14 API integration. All 27 Tier 1 functions for building professional Discord bots.

## Table of Contents

- [Slash Commands](#slash-commands)
- [Embeds](#embeds)
- [Buttons](#buttons)
- [Select Menus](#select-menus)
- [Modals](#modals)
- [Action Rows](#action-rows)
- [Interaction Responses](#interaction-responses)
- [Messaging](#messaging)
- [Reactions](#reactions)
- [Pin Management](#pin-management)
- [Bulk Operations](#bulk-operations)
- [Context Menus](#context-menus)
- [Best Practices](#best-practices)

---

## Slash Commands

### register_slash_command()

Register a slash command with Discord.

```ezlang
register_slash_command(client, guildId, command_data)
```

**Parameters:**
- `client` (Object) - Discord client object
- `guildId` (String) - Guild/server ID to register command in
- `command_data` (Object) - Command configuration object

**Command Data Structure:**
```ezlang
var command_data = {
    name: "ping",
    description: "Check bot latency",
    options: [
        {
            type: "string",
            name: "message",
            description: "Custom message",
            required: false
        }
    ]
}
```

**Option Types:**
- `"string"` - Text input
- `"integer"` - Number input
- `"boolean"` - True/false choice
- `"user"` - User selector
- `"channel"` - Channel selector
- `"role"` - Role selector

**Example:**
```ezlang
// Simple command
var ping_command = {
    name: "ping",
    description: "Replies with Pong!"
}
register_slash_command(client, "123456789", ping_command)

// Command with options
var say_command = {
    name: "say",
    description: "Make the bot say something",
    options: [
        {
            type: "string",
            name: "text",
            description: "What to say",
            required: true
        },
        {
            type: "channel",
            name: "channel",
            description: "Where to send it",
            required: false
        }
    ]
}
register_slash_command(client, guild_id, say_command)
```

---

## Embeds

Rich, formatted message containers with fields, images, and styling.

### create_embed()

Create a new embed object.

```ezlang
create_embed(title, description, color)
```

**Parameters:**
- `title` (String) - Embed title (optional)
- `description` (String) - Embed description (optional)
- `color` (Number) - Color as hex number (optional)

**Returns:** Embed object

**Example:**
```ezlang
var embed = create_embed(
    "Welcome!",
    "Thanks for joining our server",
    0x5865f2  // Discord blurple
)
```

**Common Colors:**
```ezlang
var COLOR_BLURPLE = 0x5865f2
var COLOR_GREEN = 0x57f287
var COLOR_YELLOW = 0xfee75c
var COLOR_RED = 0xed4245
var COLOR_WHITE = 0xffffff
var COLOR_BLACK = 0x000000
```

### embed_add_field()

Add a field to an embed.

```ezlang
embed_add_field(embed, name, value, inline)
```

**Parameters:**
- `embed` (Object) - Embed to modify
- `name` (String) - Field name/title
- `value` (String) - Field content
- `inline` (Boolean) - Display inline (default: false)

**Returns:** The embed (for chaining)

**Example:**
```ezlang
var embed = create_embed("User Info", "Profile details", 0x5865f2)
embed_add_field(embed, "Username", user.tag, true)
embed_add_field(embed, "ID", user.id, true)
embed_add_field(embed, "Created", user.createdAt, false)
```

### embed_set_author()

Set the embed author section.

```ezlang
embed_set_author(embed, name, iconURL?, url?)
```

**Parameters:**
- `embed` (Object) - Embed to modify
- `name` (String) - Author name
- `iconURL` (String, optional) - Small icon next to name
- `url` (String, optional) - URL when clicking name

**Example:**
```ezlang
embed_set_author(
    embed,
    "Bot Name",
    "https://i.imgur.com/icon.png",
    "https://example.com"
)
```

### embed_set_footer()

Set the embed footer text.

```ezlang
embed_set_footer(embed, text, iconURL?)
```

**Parameters:**
- `embed` (Object) - Embed to modify
- `text` (String) - Footer text
- `iconURL` (String, optional) - Small footer icon

**Example:**
```ezlang
embed_set_footer(embed, "Powered by EzLang", "https://i.imgur.com/icon.png")
```

### embed_set_image()

Set the large embed image.

```ezlang
embed_set_image(embed, url)
```

**Parameters:**
- `embed` (Object) - Embed to modify
- `url` (String) - Image URL

**Example:**
```ezlang
embed_set_image(embed, "https://i.imgur.com/banner.png")
```

### embed_set_thumbnail()

Set the small thumbnail image (top-right).

```ezlang
embed_set_thumbnail(embed, url)
```

**Parameters:**
- `embed` (Object) - Embed to modify
- `url` (String) - Thumbnail URL

**Example:**
```ezlang
embed_set_thumbnail(embed, user.displayAvatarURL)
```

### embed_set_timestamp()

Set the embed timestamp.

```ezlang
embed_set_timestamp(embed, timestamp?)
```

**Parameters:**
- `embed` (Object) - Embed to modify
- `timestamp` (Number|String, optional) - Timestamp (defaults to now)

**Example:**
```ezlang
// Current time
embed_set_timestamp(embed)

// Specific time
embed_set_timestamp(embed, time())
embed_set_timestamp(embed, "2025-01-14T12:00:00Z")
```

### embed_set_url()

Set the embed title URL (makes title clickable).

```ezlang
embed_set_url(embed, url)
```

**Parameters:**
- `embed` (Object) - Embed to modify
- `url` (String) - URL to open

**Example:**
```ezlang
var embed = create_embed("Visit our Website", "Click the title!", 0x5865f2)
embed_set_url(embed, "https://example.com")
```

### Complete Embed Example

```ezlang
var embed = create_embed("Server Rules", "Please follow these rules", 0x57f287)

embed_set_author(embed, "Admin Team", server.iconURL, "https://example.com")
embed_add_field(embed, "Rule 1", "Be respectful", false)
embed_add_field(embed, "Rule 2", "No spam", false)
embed_add_field(embed, "Rule 3", "Stay on topic", false)
embed_set_footer(embed, "Last updated", "https://i.imgur.com/icon.png")
embed_set_timestamp(embed)
embed_set_thumbnail(embed, server.iconURL)

send_message(channel, "", {embeds: [embed]})
```

---

## Buttons

Interactive buttons that users can click.

### create_button()

Create a standard button.

```ezlang
create_button(label, style, customId)
```

**Parameters:**
- `label` (String) - Button text
- `style` (String) - Button style
- `customId` (String) - Unique identifier for handling clicks

**Styles:**
- `"primary"` - Blue button (Blurple)
- `"secondary"` - Grey button
- `"success"` - Green button
- `"danger"` - Red button

**Example:**
```ezlang
var accept_btn = create_button("Accept", "success", "accept_rules")
var decline_btn = create_button("Decline", "danger", "decline_rules")
var help_btn = create_button("Help", "primary", "show_help")
```

### create_link_button()

Create a button that opens a URL.

```ezlang
create_link_button(label, url)
```

**Parameters:**
- `label` (String) - Button text
- `url` (String) - URL to open

**Example:**
```ezlang
var docs_btn = create_link_button("Documentation", "https://docs.example.com")
var invite_btn = create_link_button("Invite Bot", "https://discord.com/invite/...")
```

### Button Example

```ezlang
function handle_verify_command(interaction) {
    var btn1 = create_button("Verify", "success", "verify_user")
    var btn2 = create_button("Cancel", "danger", "cancel_verify")
    var btn3 = create_link_button("Rules", "https://example.com/rules")

    var row = create_action_row(btn1, btn2, btn3)

    interaction_reply(interaction, "Click to verify your account:", {
        components: [row]
    })
}

// Handle button clicks in interactionCreate event
function on_button_click(interaction) {
    if interaction.customId == "verify_user" {
        interaction_reply(interaction, "✅ Verified!", true)
    } else if interaction.customId == "cancel_verify" {
        interaction_reply(interaction, "❌ Cancelled", true)
    }
}
```

---

## Select Menus

Dropdown menus for user selection.

### create_string_select()

Create a string selection dropdown.

```ezlang
create_string_select(customId, placeholder, options)
```

**Parameters:**
- `customId` (String) - Unique identifier
- `placeholder` (String) - Placeholder text
- `options` (Array) - Array of option objects

**Option Structure:**
```ezlang
{
    label: "Option Name",      // Required
    value: "option_value",     // Required
    description: "Details",    // Optional
    emoji: "🎮"                // Optional
}
```

**Example:**
```ezlang
var options = [
    {label: "Red", value: "red", emoji: "🔴"},
    {label: "Blue", value: "blue", emoji: "🔵"},
    {label: "Green", value: "green", emoji: "🟢"}
]

var menu = create_string_select("color_select", "Choose a color", options)
var row = create_action_row(menu)

interaction_reply(interaction, "Pick your favorite color:", {
    components: [row]
})
```

### create_user_select()

Create a user picker menu.

```ezlang
create_user_select(customId, placeholder)
```

**Example:**
```ezlang
var menu = create_user_select("pick_user", "Select a user")
var row = create_action_row(menu)

interaction_reply(interaction, "Who would you like to mention?", {
    components: [row]
})
```

### create_role_select()

Create a role picker menu.

```ezlang
create_role_select(customId, placeholder)
```

**Example:**
```ezlang
var menu = create_role_select("pick_role", "Select a role")
var row = create_action_row(menu)

interaction_reply(interaction, "Choose a role to assign:", {
    components: [row]
})
```

### create_channel_select()

Create a channel picker menu.

```ezlang
create_channel_select(customId, placeholder)
```

**Example:**
```ezlang
var menu = create_channel_select("pick_channel", "Select a channel")
var row = create_action_row(menu)

interaction_reply(interaction, "Where should I send the message?", {
    components: [row]
})
```

---

## Modals

Popup forms for collecting user input.

### create_modal()

Create a modal dialog.

```ezlang
create_modal(customId, title)
```

**Parameters:**
- `customId` (String) - Unique identifier
- `title` (String) - Modal title

**Example:**
```ezlang
var modal = create_modal("feedback_form", "Submit Feedback")
```

### create_text_input()

Create a text input field for modals.

```ezlang
create_text_input(customId, label, style, required)
```

**Parameters:**
- `customId` (String) - Unique identifier
- `label` (String) - Field label
- `style` (String) - "short" or "paragraph"
- `required` (Boolean) - Is field required?

**Example:**
```ezlang
var name_input = create_text_input("name", "Your Name", "short", true)
var feedback_input = create_text_input("feedback", "Feedback", "paragraph", true)
```

### Complete Modal Example

```ezlang
// Show modal
function show_feedback_modal(interaction) {
    var modal = create_modal("feedback_modal", "Submit Feedback")

    var name_input = create_text_input("user_name", "Name", "short", true)
    var email_input = create_text_input("user_email", "Email", "short", false)
    var feedback_input = create_text_input("feedback_text", "Your Feedback", "paragraph", true)

    var row1 = create_action_row(name_input)
    var row2 = create_action_row(email_input)
    var row3 = create_action_row(feedback_input)

    // Add rows to modal (must be done via raw modal manipulation)
    modal.components = [row1, row2, row3]

    show_modal(interaction, modal)
}

// Handle modal submission
function handle_modal_submit(interaction) {
    if interaction.customId == "feedback_modal" {
        var name = get_modal_field(interaction, "user_name")
        var email = get_modal_field(interaction, "user_email")
        var feedback = get_modal_field(interaction, "feedback_text")

        var embed = create_embed("Feedback Received", "Thank you!", 0x57f287)
        embed_add_field(embed, "Name", name, true)
        embed_add_field(embed, "Email", email, true)
        embed_add_field(embed, "Feedback", feedback, false)

        interaction_reply(interaction, "", {embeds: [embed], ephemeral: true})
    }
}
```

---

## Action Rows

Containers for components. Each message can have up to 5 action rows.

### create_action_row()

Create a row to hold components.

```ezlang
create_action_row(...components)
```

**Parameters:**
- `...components` - Up to 5 components (buttons or 1 select menu)

**Limits:**
- Maximum 5 buttons per row
- Maximum 1 select menu per row
- Maximum 5 action rows per message

**Example:**
```ezlang
// Button row
var btn1 = create_button("Option 1", "primary", "opt1")
var btn2 = create_button("Option 2", "success", "opt2")
var btn3 = create_button("Cancel", "danger", "cancel")
var row1 = create_action_row(btn1, btn2, btn3)

// Select menu row
var menu = create_string_select("pick", "Choose", options)
var row2 = create_action_row(menu)

// Send with multiple rows
interaction_reply(interaction, "Make your choice:", {
    components: [row1, row2]
})
```

---

## Interaction Responses

### interaction_reply()

Reply to an interaction (slash command, button, etc.).

```ezlang
interaction_reply(interaction, content, options)
```

**Parameters:**
- `interaction` (Object) - Interaction object
- `content` (String) - Message text
- `options` (Object) - Reply options

**Options:**
```ezlang
{
    ephemeral: false,          // Only visible to user
    embeds: [embed1, embed2],  // Array of embeds
    components: [row1, row2]   // Array of action rows
}
```

**Example:**
```ezlang
// Simple reply
interaction_reply(interaction, "Pong!", {})

// Ephemeral reply
interaction_reply(interaction, "Secret message", {ephemeral: true})

// Reply with embed and buttons
var embed = create_embed("Title", "Description", 0x5865f2)
var button = create_button("Click", "primary", "btn_id")
var row = create_action_row(button)

interaction_reply(interaction, "Check this out:", {
    embeds: [embed],
    components: [row]
})
```

### interaction_defer()

Defer a reply for long operations (gives you 15 minutes).

```ezlang
interaction_defer(interaction, ephemeral)
```

**Parameters:**
- `interaction` (Object) - Interaction object
- `ephemeral` (Boolean) - Make response ephemeral

**Example:**
```ezlang
function slow_command(interaction) {
    // Defer immediately
    interaction_defer(interaction, false)

    // Do long operation
    wait(5)

    // Follow up with actual reply
    interaction_reply(interaction, "Done processing!", {})
}
```

### interaction_update()

Update a component interaction (buttons, selects).

```ezlang
interaction_update(interaction, content, options)
```

**Example:**
```ezlang
function handle_button(interaction) {
    if interaction.customId == "toggle" {
        // Update the message
        interaction_update(interaction, "Button toggled!", {
            components: []  // Remove buttons
        })
    }
}
```

---

## Messaging

### send_message()

Send a message to a channel.

```ezlang
send_message(channel, content, options)
```

**Parameters:**
- `channel` (Object) - Channel object
- `content` (String) - Message text
- `options` (Object) - Message options

**Options:**
```ezlang
{
    embeds: [embed1],
    components: [row1],
    files: ["./image.png"]
}
```

**Example:**
```ezlang
var channel = interaction.channel
send_message(channel, "Hello everyone!", {})

// With embed
var embed = create_embed("Announcement", "Important news", 0x5865f2)
send_message(channel, "", {embeds: [embed]})
```

### edit_message()

Edit an existing message.

```ezlang
edit_message(message, content, options)
```

**Example:**
```ezlang
var msg = send_message(channel, "Loading...", {})
wait(2)
edit_message(msg, "Done!", {})
```

### delete_message()

Delete a message.

```ezlang
delete_message(message)
```

**Example:**
```ezlang
var msg = send_message(channel, "This will be deleted", {})
wait(5)
delete_message(msg)
```

### fetch_message()

Retrieve a message by ID.

```ezlang
fetch_message(channel, messageId)
```

**Example:**
```ezlang
var msg = fetch_message(channel, "123456789")
print(msg.content)
```

---

## Reactions

### add_reaction()

Add an emoji reaction.

```ezlang
add_reaction(message, emoji)
```

**Example:**
```ezlang
add_reaction(message, "👍")
add_reaction(message, "❤️")
add_reaction(message, "<:custom:123456789>")  // Custom emoji
```

### remove_reaction()

Remove a reaction.

```ezlang
remove_reaction(message, emoji, user?)
```

**Example:**
```ezlang
// Remove bot's reaction
remove_reaction(message, "👍")

// Remove specific user's reaction
remove_reaction(message, "👍", user)
```

### clear_reactions()

Remove all reactions from a message.

```ezlang
clear_reactions(message)
```

### fetch_reactions()

Get users who reacted with a specific emoji.

```ezlang
fetch_reactions(message, emoji)
```

**Returns:** Array of user objects

**Example:**
```ezlang
var users = fetch_reactions(message, "👍")
print("Users who liked: " + length(users))
```

---

## Pin Management

### pin_message()

Pin a message in its channel.

```ezlang
pin_message(message)
```

### unpin_message()

Unpin a message.

```ezlang
unpin_message(message)
```

### fetch_pinned_messages()

Get all pinned messages in a channel.

```ezlang
fetch_pinned_messages(channel)
```

**Returns:** Array of message objects

**Example:**
```ezlang
var pinned = fetch_pinned_messages(channel)
for var msg in pinned {
    print(msg.content)
}
```

---

## Bulk Operations

### bulk_delete()

Delete multiple messages at once.

```ezlang
bulk_delete(channel, amount)
```

**Parameters:**
- `channel` (Object) - Channel object
- `amount` (Number) - Messages to delete (2-100)

**Limitations:**
- Minimum: 2 messages
- Maximum: 100 messages
- Messages must be less than 14 days old

**Returns:** Number of deleted messages

**Example:**
```ezlang
// Delete last 10 messages
var deleted = bulk_delete(channel, 10)
print("Deleted " + str(deleted) + " messages")
```

### fetch_messages()

Fetch recent messages from a channel.

```ezlang
fetch_messages(channel, limit?)
```

**Parameters:**
- `channel` (Object) - Channel object
- `limit` (Number, optional) - Number to fetch (1-100, default: 50)

**Returns:** Array of message objects

**Example:**
```ezlang
var messages = fetch_messages(channel, 25)
for var msg in messages {
    print(msg.author.tag + ": " + msg.content)
}
```

---

## Context Menus

Right-click menu commands (also called Application Commands).

### register_user_context_menu()

Register a user context menu command.

```ezlang
register_user_context_menu(name, callback)
```

**Example:**
```ezlang
function show_user_info(interaction) {
    var target_user = interaction.targetUser
    var embed = create_embed("User Info", "", 0x5865f2)
    embed_add_field(embed, "Username", target_user.tag, true)
    embed_add_field(embed, "ID", target_user.id, true)
    interaction_reply(interaction, "", {embeds: [embed]})
}

register_user_context_menu("User Info", show_user_info)
```

### register_message_context_menu()

Register a message context menu command.

```ezlang
register_message_context_menu(name, callback)
```

**Example:**
```ezlang
function save_message(interaction) {
    var target_msg = interaction.targetMessage
    print("Saved: " + target_msg.content)
    interaction_reply(interaction, "Message saved!", true)
}

register_message_context_menu("Save Message", save_message)
```

---

## Best Practices

### 1. Always Respond to Interactions

```ezlang
// Good
function handle_command(interaction) {
    interaction_reply(interaction, "Processing...", {})
}

// Bad - timeout error after 3 seconds
function handle_command(interaction) {
    // No response!
}
```

### 2. Use Defer for Long Operations

```ezlang
function slow_command(interaction) {
    interaction_defer(interaction, false)

    // Long operation (up to 15 minutes)
    wait(10)

    interaction_reply(interaction, "Finally done!", {})
}
```

### 3. Use Ephemeral for Private Messages

```ezlang
// Error messages should be ephemeral
interaction_reply(interaction, "❌ You don't have permission", {ephemeral: true})

// Public responses
interaction_reply(interaction, "✅ Command executed", {ephemeral: false})
```

### 4. Organize Components

```ezlang
// Keep action rows organized
var button_row = create_action_row(btn1, btn2, btn3)
var select_row = create_action_row(menu)

interaction_reply(interaction, "Choose an option:", {
    components: [button_row, select_row]
})
```

### 5. Validate User Input

```ezlang
function handle_select(interaction) {
    var selected = interaction.values[0]

    if selected == "option1" {
        interaction_update(interaction, "You chose option 1", {})
    } else if selected == "option2" {
        interaction_update(interaction, "You chose option 2", {})
    } else {
        interaction_update(interaction, "Unknown option", {})
    }
}
```

### 6. Use Embeds for Rich Content

```ezlang
// Plain text is boring
interaction_reply(interaction, "Error: Something went wrong", {})

// Embeds are better
var embed = create_embed("Error", "Something went wrong", 0xed4245)
embed_add_field(embed, "Details", "Check the logs", false)
embed_set_footer(embed, "Need help? Contact support")
interaction_reply(interaction, "", {embeds: [embed]})
```

### 7. Handle Errors Gracefully

```ezlang
function safe_command(interaction) {
    try {
        // Risky operation
        var result = some_operation()
        interaction_reply(interaction, "Success: " + result, {})
    } catch error {
        var embed = create_embed("Error", error.message, 0xed4245)
        interaction_reply(interaction, "", {embeds: [embed], ephemeral: true})
    }
}
```

### 8. Limit Component Usage

```ezlang
// Maximum limits:
// - 5 action rows per message
// - 5 buttons per action row
// - 1 select menu per action row
// - 25 options per select menu

// Good
var row1 = create_action_row(btn1, btn2, btn3, btn4, btn5)
var row2 = create_action_row(menu)

// Bad - too many buttons in one row
var row = create_action_row(btn1, btn2, btn3, btn4, btn5, btn6)  // Error!
```

### 9. Clean Up Old Components

```ezlang
function handle_button(interaction) {
    // Remove buttons after click
    interaction_update(interaction, "✅ Confirmed!", {
        components: []
    })
}
```

### 10. Use Color Coding

```ezlang
var COLOR_SUCCESS = 0x57f287  // Green
var COLOR_ERROR = 0xed4245    // Red
var COLOR_WARNING = 0xfee75c  // Yellow
var COLOR_INFO = 0x5865f2     // Blurple

var success_embed = create_embed("Success", "Operation completed", COLOR_SUCCESS)
var error_embed = create_embed("Error", "Something failed", COLOR_ERROR)
```

---

## Common Patterns

### Confirmation Dialog

```ezlang
function ask_confirmation(interaction, action) {
    var yes_btn = create_button("Yes", "success", "confirm_yes")
    var no_btn = create_button("No", "danger", "confirm_no")
    var row = create_action_row(yes_btn, no_btn)

    interaction_reply(interaction, "Are you sure?", {
        components: [row],
        ephemeral: true
    })
}
```

### Paginated List

```ezlang
var current_page = 0
var pages = ["Page 1 content", "Page 2 content", "Page 3 content"]

function show_page(interaction, page) {
    var prev_btn = create_button("Previous", "primary", "prev_page")
    var next_btn = create_button("Next", "primary", "next_page")
    var row = create_action_row(prev_btn, next_btn)

    interaction_update(interaction, pages[page], {
        components: [row]
    })
}
```

### Role Selection

```ezlang
function role_menu(interaction) {
    var options = [
        {label: "Member", value: "role_member", emoji: "👤"},
        {label: "Artist", value: "role_artist", emoji: "🎨"},
        {label: "Gamer", value: "role_gamer", emoji: "🎮"}
    ]

    var menu = create_string_select("pick_role", "Choose your roles", options)
    var row = create_action_row(menu)

    interaction_reply(interaction, "Select your roles:", {
        components: [row]
    })
}
```

---

## Error Handling

Common errors and how to handle them:

### Interaction Timeout

```ezlang
// Error: Interaction already acknowledged
// Solution: Use defer()

function slow_command(interaction) {
    interaction_defer(interaction, false)  // Prevents timeout
    // ... long operation ...
    interaction_reply(interaction, "Done!", {})
}
```

### Unknown Interaction

```ezlang
// Error: Unknown interaction
// Solution: Check interaction type

function handle_interaction(interaction) {
    if interaction.isChatInputCommand() {
        handle_slash_command(interaction)
    } else if interaction.isButton() {
        handle_button(interaction)
    } else if interaction.isStringSelectMenu() {
        handle_select(interaction)
    }
}
```

### Missing Permissions

```ezlang
// Error: Missing Permissions
// Solution: Check permissions first

function admin_command(interaction) {
    if not interaction.member.permissions.has("Administrator") {
        interaction_reply(interaction, "❌ Admin only!", {ephemeral: true})
        return
    }

    // Execute admin action
}
```

---

## Additional Resources

- [Discord.js Guide](https://discordjs.guide/)
- [Discord Developer Portal](https://discord.com/developers/docs)
- [EzLang Examples](../examples/)
- [Bot Architecture Guide](./BOT_ARCHITECTURE.md)
