---
layout: default
title: Discord Functions
description: Core Discord bot functions for messages, embeds, and components
---

# Discord Functions

Core functions for Discord bot operations.

## Message Functions

### send_message(channel_id, content, embed?, components?)
Send a message to a channel.

**Parameters:**
- `channel_id` (String) - Channel ID
- `content` (String) - Message text
- `embed` (Object, optional) - Embed object
- `components` (Array, optional) - Component rows

**Returns:** Message object

**Example:**
```ezlang
send_message(channel_id, "Hello!")
send_message(channel_id, "", embed)
send_message(channel_id, "Click!", null, [button_row])
```

### reply(message, content, embed?, components?)
Reply to a message.

**Example:**
```ezlang
reply(message, "Thanks for your message!")
```

### edit_message(message_id, channel_id, new_content, embed?)
Edit an existing message.

### delete_message(message_id, channel_id)
Delete a message.

### bulk_delete(channel_id, message_ids)
Delete multiple messages (2-100).

### fetch_message(channel_id, message_id)
Fetch a specific message.

### fetch_messages(channel_id, options?)
Fetch multiple messages.

**Options:**
- `limit` (Number) - Max messages (1-100)
- `before` (String) - Message ID to fetch before
- `after` (String) - Message ID to fetch after

## Embed Functions

### create_embed(options)
Create embed object.

**Options:**
- `title` (String) - Embed title
- `description` (String) - Description
- `color` (String) - Hex color
- `url` (String) - Title URL
- `thumbnail` (String) - Thumbnail URL
- `image` (String) - Image URL
- `footer` (Object) - Footer object
- `author` (Object) - Author object
- `fields` (Array) - Field array

**Example:**
```ezlang
let embed = create_embed({
    "title": "My Embed",
    "description": "Description here",
    "color": "#5865F2"
})
```

### embed_add_field(embed, name, value, inline?)
Add field to embed.

### embed_set_author(embed, name, icon_url?, url?)
Set embed author.

### embed_set_footer(embed, text, icon_url?)
Set embed footer.

### embed_set_image(embed, url)
Set large image.

### embed_set_thumbnail(embed, url)
Set thumbnail image.

### embed_set_timestamp(embed, timestamp?)
Add timestamp (defaults to now).

## Component Functions

### create_button(options)
Create button component.

**Options:**
- `customId` (String) - Button ID
- `label` (String) - Button text
- `style` (Number) - 1=Blurple, 2=Gray, 3=Green, 4=Red
- `emoji` (String) - Emoji
- `disabled` (Boolean) - Disable button

**Example:**
```ezlang
let button = create_button({
    "customId": "my_button",
    "label": "Click Me",
    "style": 1
})
```

### create_link_button(options)
Create URL button.

**Options:**
- `label` (String) - Button text
- `url` (String) - Target URL
- `emoji` (String) - Emoji

### create_string_select(options)
Create select menu.

**Options:**
- `customId` (String) - Menu ID
- `placeholder` (String) - Placeholder text
- `options` (Array) - Option objects
- `minValues` (Number) - Min selections
- `maxValues` (Number) - Max selections

**Example:**
```ezlang
let select = create_string_select({
    "customId": "color_select",
    "placeholder": "Choose a color",
    "options": [
        {"label": "Red", "value": "red", "emoji": "🔴"},
        {"label": "Blue", "value": "blue", "emoji": "🔵"}
    ]
})
```

### create_action_row(components)
Create component row.

**Example:**
```ezlang
let row = create_action_row([button1, button2])
```

## Interaction Functions

### interaction_reply(interaction, content, ephemeral?, embed?, components?)
Reply to interaction.

**Parameters:**
- `ephemeral` (Boolean) - Only visible to user

**Example:**
```ezlang
interaction_reply(interaction, "Success!", true)
```

### interaction_defer(interaction, ephemeral?)
Defer interaction response.

### interaction_followup(interaction, content, embed?, components?)
Send followup message.

### interaction_update(interaction, content, embed?, components?)
Update interaction response.

## Reaction Functions

### react(message, emoji)
Add reaction to message.

**Example:**
```ezlang
react(message, "👍")
react(message, "<:custom:123456789>")
```

### remove_reaction(message_id, channel_id, emoji, user_id?)
Remove reaction.

### remove_all_reactions(message_id, channel_id)
Remove all reactions.

## Utility Functions

### mention_user(user_id)
Create user mention.

**Example:**
```ezlang
mention_user("123456789")  // "<@123456789>"
```

### mention_channel(channel_id)
Create channel mention.

### mention_role(role_id)
Create role mention.

### bot_user()
Get bot's user object.

**Example:**
```ezlang
let bot = bot_user()
print("Bot username: " + bot.username)
```

### get_member(guild_id, user_id)
Get guild member object.

### get_channel(channel_id)
Get channel object.

### get_guild(guild_id)
Get guild object.

[← Back to API Reference](/EasyLang/api/)
