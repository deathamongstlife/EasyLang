---
layout: default
title: Embeds
description: Create beautiful rich embeds with fields, images, and formatting
---

# Embeds

Create visually appealing rich embeds to display structured information in Discord.

## Overview

Embeds are special message formats that can display titles, descriptions, fields, images, timestamps, and more. They're perfect for displaying structured data like server info, user profiles, or game stats.

## Available Functions

| Function | Parameters | Description |
|----------|-----------|-------------|
| `create_embed` | options | Create a new embed object |
| `embed_add_field` | embed, name, value, inline? | Add a field to the embed |
| `embed_set_author` | embed, name, icon_url?, url? | Set embed author |
| `embed_set_footer` | embed, text, icon_url? | Set embed footer |
| `embed_set_image` | embed, url | Set large image |
| `embed_set_thumbnail` | embed, url | Set small thumbnail image |
| `embed_set_timestamp` | embed, timestamp? | Set timestamp (defaults to now) |
| `embed_set_url` | embed, url | Set clickable title URL |
| `embed_set_color` | embed, color | Set sidebar color |

## Basic Examples

### Simple Embed

```ezlang
let embed = create_embed({
    "title": "Hello, Discord!",
    "description": "This is a simple embed",
    "color": "#5865F2"
})
send_message(channel_id, "", embed)
```

### Embed with Fields

```ezlang
let embed = create_embed({
    "title": "Server Information",
    "color": "#57F287"
})

embed_add_field(embed, "Members", "1,234", true)
embed_add_field(embed, "Channels", "56", true)
embed_add_field(embed, "Roles", "23", true)

send_message(channel_id, "", embed)
```

### Complete Rich Embed

```ezlang
let embed = create_embed({
    "title": "User Profile",
    "description": "Detailed user information",
    "color": "#5865F2"
})

embed_set_author(embed, "John Doe", avatar_url, profile_url)
embed_add_field(embed, "Level", "42", true)
embed_add_field(embed, "XP", "12,345", true)
embed_add_field(embed, "Rank", "#5", true)
embed_set_thumbnail(embed, avatar_url)
embed_set_footer(embed, "Member since 2020", server_icon)
embed_set_timestamp(embed)

send_message(channel_id, "", embed)
```

## Advanced Examples

### Dynamic User Info Embed

```ezlang
listen("messageCreate", function(message) {
    if message.content == "!userinfo" {
        let user = message.author
        let member = get_member(message.guild.id, user.id)

        let embed = create_embed({
            "title": "User Information",
            "color": "#5865F2"
        })

        embed_set_author(embed, user.username, user.avatarURL)
        embed_set_thumbnail(embed, user.avatarURL)

        embed_add_field(embed, "ID", user.id, true)
        embed_add_field(embed, "Joined", member.joinedAt, true)
        embed_add_field(embed, "Roles", to_string(length(member.roles)), true)

        embed_set_footer(embed, "Account created")
        embed_set_timestamp(embed, user.createdAt)

        send_message(message.channel.id, "", embed)
    }
})
```

### Multiple Embeds

```ezlang
// Send multiple embeds in one message
let embed1 = create_embed({
    "title": "First Embed",
    "description": "First embed content",
    "color": "#5865F2"
})

let embed2 = create_embed({
    "title": "Second Embed",
    "description": "Second embed content",
    "color": "#57F287"
})

send_message(channel_id, "", [embed1, embed2])
```

## Color Reference

Use hex colors for embed styling:

```ezlang
// Discord colors
"#5865F2"  // Blurple
"#57F287"  // Green
"#FEE75C"  // Yellow
"#ED4245"  // Red
"#EB459E"  // Fuchsia

// Custom colors
"#FF0000"  // Red
"#00FF00"  // Green
"#0000FF"  // Blue
"#FFFFFF"  // White
"#000000"  // Black
```

## Tips and Best Practices

- Keep descriptions under 4096 characters
- Limit to 25 fields per embed
- Field names: max 256 characters
- Field values: max 1024 characters
- Total embed size: max 6000 characters
- Use inline fields for compact layouts
- Add timestamps for time-sensitive information

## Related Features

- [Messaging](/EasyLang/features/messaging)
- [Components](/EasyLang/features/components)
- [API: Discord Functions](/EasyLang/api/discord-functions)

[← Back to Features](/EasyLang/features/)
