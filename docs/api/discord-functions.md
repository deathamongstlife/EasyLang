---
layout: docs
title: Discord Functions
description: Core Discord bot functions for messages, embeds, and components
category: api
---

# Discord Functions

Core functions for Discord bot operations including messaging, embeds, components, and reactions.

<div class="callout info">
  <strong>Quick Navigation:</strong>
  Jump to <a href="#message-functions">Messages</a> | <a href="#embed-functions">Embeds</a> | <a href="#component-functions">Components</a> | <a href="#reaction-functions">Reactions</a>
</div>

---

## Message Functions

Functions for sending, editing, and managing Discord messages.

<div class="api-function" id="send_message">

### send_message()

Sends a message to a Discord channel with optional embeds and components.

#### Syntax
```ezlang
send_message(channel_id, content, embed?, components?)
```

#### Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `channel_id` | String | Yes | The ID of the channel to send to |
| `content` | String | Yes | The text content of the message |
| `embed` | Object | No | An embed object created with `create_embed()` |
| `components` | Array | No | Array of component rows (buttons, select menus) |

#### Returns
**Message** - The sent message object

#### Examples

<div class="callout success">
  <strong>Basic Message:</strong>
</div>

```ezlang
// Send a simple text message
send_message(channel_id, "Hello, world!")
```

<div class="callout success">
  <strong>Message with Embed:</strong>
</div>

```ezlang
// Create an embed
let embed = create_embed({
    "title": "Welcome!",
    "description": "Thanks for joining our server",
    "color": "#5865F2"
})

// Send message with embed
send_message(channel_id, "", embed)
```

<div class="callout success">
  <strong>Message with Components:</strong>
</div>

```ezlang
// Create button
let button = create_button({
    "customId": "click_me",
    "label": "Click Me!",
    "style": 1
})

let row = create_action_row([button])

// Send with components
send_message(channel_id, "Interactive message!", null, [row])
```

#### Throws
- **Error** - If channel ID is invalid
- **PermissionError** - If bot lacks `SEND_MESSAGES` permission

#### See Also
- [reply()](#reply) - Reply to a message
- [edit_message()](#edit_message) - Edit an existing message
- [delete_message()](#delete_message) - Delete a message

</div>

<div class="api-function" id="reply">

### reply()

Replies to a message with a mention of the original sender.

#### Syntax
```ezlang
reply(message, content, embed?, components?)
```

#### Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `message` | Message | Yes | The message object to reply to |
| `content` | String | Yes | Reply text content |
| `embed` | Object | No | Optional embed object |
| `components` | Array | No | Optional component rows |

#### Returns
**Message** - The reply message object

#### Example

```ezlang
listen("messageCreate", function(message) {
    if message.content == "!ping" {
        reply(message, "Pong! 🏓")
    }
})
```

</div>

<div class="api-function" id="edit_message">

### edit_message()

Edits the content of an existing message.

#### Syntax
```ezlang
edit_message(message_id, channel_id, new_content, embed?)
```

#### Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `message_id` | String | Yes | ID of message to edit |
| `channel_id` | String | Yes | ID of the channel |
| `new_content` | String | Yes | New message content |
| `embed` | Object | No | New embed object |

#### Returns
**Message** - The edited message object

#### Example

```ezlang
// Edit a message
edit_message(msg_id, channel_id, "Updated content!")

// Edit with new embed
let new_embed = create_embed({"title": "Updated"})
edit_message(msg_id, channel_id, "", new_embed)
```

<div class="callout warning">
  <strong>Note:</strong> You can only edit messages sent by your bot.
</div>

</div>

<div class="api-function" id="delete_message">

### delete_message()

Deletes a message from a channel.

#### Syntax
```ezlang
delete_message(message_id, channel_id)
```

#### Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `message_id` | String | Yes | ID of message to delete |
| `channel_id` | String | Yes | ID of the channel |

#### Example

```ezlang
// Delete a message
delete_message(message.id, channel_id)
```

<div class="callout danger">
  <strong>Warning:</strong> Deleted messages cannot be recovered.
</div>

</div>

<div class="api-function" id="bulk_delete">

### bulk_delete()

Deletes multiple messages at once (2-100 messages).

#### Syntax
```ezlang
bulk_delete(channel_id, message_ids)
```

#### Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `channel_id` | String | Yes | ID of the channel |
| `message_ids` | Array | Yes | Array of message IDs (2-100) |

#### Example

```ezlang
// Delete last 10 messages
let messages = fetch_messages(channel_id, {"limit": 10})
let ids = []

for msg in messages {
    push(ids, msg.id)
}

bulk_delete(channel_id, ids)
```

<div class="callout warning">
  <strong>Limitations:</strong>
  - Messages must be less than 14 days old
  - Minimum 2 messages, maximum 100 messages
  - Requires <code>MANAGE_MESSAGES</code> permission
</div>

</div>

---

## Embed Functions

Functions for creating and customizing rich embed messages.

<div class="api-function" id="create_embed">

### create_embed()

Creates a rich embed object for enhanced messages.

#### Syntax
```ezlang
create_embed(options)
```

#### Parameters

| Option | Type | Description |
|--------|------|-------------|
| `title` | String | Embed title text |
| `description` | String | Main embed description |
| `color` | String | Hex color code (e.g., "#5865F2") |
| `url` | String | URL for title link |
| `thumbnail` | String | Small image URL (top right) |
| `image` | String | Large image URL (bottom) |
| `footer` | Object | Footer with `text` and optional `icon_url` |
| `author` | Object | Author with `name`, optional `icon_url` and `url` |
| `fields` | Array | Array of field objects |
| `timestamp` | String | ISO timestamp string |

#### Returns
**Embed** - An embed object

#### Examples

<div class="callout success">
  <strong>Simple Embed:</strong>
</div>

```ezlang
let embed = create_embed({
    "title": "My First Embed",
    "description": "This is a description",
    "color": "#5865F2"
})

send_message(channel_id, "", embed)
```

<div class="callout success">
  <strong>Rich Embed:</strong>
</div>

```ezlang
let embed = create_embed({
    "title": "Server Stats",
    "description": "Current server statistics",
    "color": "#3BA55D",
    "thumbnail": guild.iconURL,
    "footer": {
        "text": "Stats updated",
        "icon_url": bot.user.avatarURL
    },
    "timestamp": new Date().toISOString(),
    "fields": [
        {
            "name": "Members",
            "value": to_string(guild.memberCount),
            "inline": true
        },
        {
            "name": "Channels",
            "value": to_string(length(guild.channels)),
            "inline": true
        }
    ]
})

send_message(channel_id, "", embed)
```

</div>

<div class="api-function" id="embed_add_field">

### embed_add_field()

Adds a field to an existing embed.

#### Syntax
```ezlang
embed_add_field(embed, name, value, inline?)
```

#### Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `embed` | Embed | Yes | The embed object |
| `name` | String | Yes | Field title (max 256 chars) |
| `value` | String | Yes | Field content (max 1024 chars) |
| `inline` | Boolean | No | Display field inline (default: false) |

#### Example

```ezlang
let embed = create_embed({"title": "User Info"})

embed_add_field(embed, "Username", user.username, true)
embed_add_field(embed, "ID", user.id, true)
embed_add_field(embed, "Joined", user.joinedAt, false)

send_message(channel_id, "", embed)
```

<div class="callout info">
  <strong>Tip:</strong> Inline fields appear side-by-side if there's enough space. Maximum 3 inline fields per row.
</div>

</div>

---

## Component Functions

Functions for creating interactive buttons and select menus.

<div class="api-function" id="create_button">

### create_button()

Creates an interactive button component.

#### Syntax
```ezlang
create_button(options)
```

#### Parameters

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `customId` | String | Yes* | Unique identifier for the button |
| `label` | String | Yes | Button text |
| `style` | Number | Yes | Button style (1-5) |
| `emoji` | String | No | Emoji to display |
| `url` | String | No** | URL for link buttons |
| `disabled` | Boolean | No | Whether button is disabled |

*Required for non-link buttons
**Required for link buttons (style 5)

#### Button Styles

| Style | Value | Color | Description |
|-------|-------|-------|-------------|
| Primary | 1 | Blurple | Main action button |
| Secondary | 2 | Grey | Secondary action |
| Success | 3 | Green | Positive action |
| Danger | 4 | Red | Destructive action |
| Link | 5 | Grey | Opens URL (no interaction event) |

#### Example

```ezlang
// Create action buttons
let yes_button = create_button({
    "customId": "confirm_yes",
    "label": "Yes",
    "style": 3,  // Green
    "emoji": "✅"
})

let no_button = create_button({
    "customId": "confirm_no",
    "label": "No",
    "style": 4,  // Red
    "emoji": "❌"
})

// Create link button
let docs_button = create_button({
    "label": "Documentation",
    "style": 5,
    "url": "https://example.com/docs"
})

// Add to action row
let row = create_action_row([yes_button, no_button, docs_button])

send_message(channel_id, "Confirm action?", null, [row])
```

<div class="callout warning">
  <strong>Limitations:</strong>
  - Maximum 5 buttons per action row
  - Maximum 5 action rows per message
  - Link buttons don't trigger interaction events
</div>

</div>

---

## Reaction Functions

Functions for adding and managing message reactions.

<div class="api-function" id="add_reaction">

### add_reaction()

Adds an emoji reaction to a message.

#### Syntax
```ezlang
add_reaction(message, emoji)
```

#### Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `message` | Message | Yes | Message object to react to |
| `emoji` | String | Yes | Emoji to add (Unicode or custom) |

#### Example

```ezlang
// Unicode emoji
add_reaction(message, "👍")
add_reaction(message, "🎉")

// Custom emoji
add_reaction(message, "<:custom:123456789>")
```

</div>

---

## Next Steps

<div class="page-nav">
  <a href="{{ '/api/built-in-functions' | relative_url }}" class="prev">
    <div><small>Previous</small></div>
    <div><strong>Built-in Functions</strong></div>
  </a>
  <a href="{{ '/api/voice-functions' | relative_url }}" class="next">
    <div><small>Next</small></div>
    <div><strong>Voice Functions</strong></div>
  </a>
</div>
