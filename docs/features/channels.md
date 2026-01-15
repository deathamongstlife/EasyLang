---
layout: default
title: Channels
description: Create and manage all types of channels
---

# Channels

Create, edit, delete, and manage Discord channels.

## Functions

- `create_channel` - Create a new channel
- `edit_channel` - Edit channel properties
- `delete_channel` - Delete a channel
- `fetch_channel` - Get channel info
- `set_channel_permissions` - Set permissions
- `create_category` - Create category channel

## Example

```ezlang
// Create text channel
let channel = create_channel(guild_id, {
    "name": "general",
    "type": 0,  // Text channel
    "topic": "General discussion"
})

// Create voice channel
let voice = create_channel(guild_id, {
    "name": "Voice Chat",
    "type": 2,  // Voice channel
    "bitrate": 64000
})

// Create category
let category = create_category(guild_id, "Main Channels")
```

[← Back to Features](/EasyLang/features/)
