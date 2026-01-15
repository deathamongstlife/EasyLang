---
layout: default
title: Stickers & Emoji
description: Work with custom emoji and stickers
---

# Stickers & Emoji

Manage custom emoji and stickers for your server.

## Functions

- `create_emoji` - Create custom emoji
- `edit_emoji` - Edit emoji name/roles
- `delete_emoji` - Delete emoji
- `fetch_emoji` - Get emoji info
- `fetch_sticker` - Get sticker info
- `create_sticker` - Create sticker
- `delete_sticker` - Delete sticker

## Example

```ezlang
// Create custom emoji
let emoji = create_emoji(guild_id, {
    "name": "cool_emoji",
    "image": "data:image/png;base64,..."
})

// Use in message
send_message(channel_id, "Check this out! <:cool_emoji:" + emoji.id + ">")
```

[← Back to Features](/EasyLang/features/)
