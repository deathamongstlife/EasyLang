---
layout: default
title: Invites
description: Create and manage server invites
---

# Invites

Create, track, and manage server invites.

## Functions

- `create_invite` - Create an invite
- `delete_invite` - Delete an invite
- `fetch_invites` - Get all server invites
- `fetch_invite` - Get specific invite info

## Example

```ezlang
listen("messageCreate", function(message) {
    if message.content == "!invite" {
        let invite = create_invite(message.channel.id, {
            "maxAge": 86400,  // 24 hours
            "maxUses": 10,
            "unique": true
        })

        reply(message, "Invite created: " + invite.url)
    }
})
```

[← Back to Features](/EasyLang/features/)
