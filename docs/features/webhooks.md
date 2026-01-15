---
layout: default
title: Webhooks
description: Create and manage Discord webhooks
---

# Webhooks

Send messages as webhooks with custom names and avatars.

## Functions

- `create_webhook` - Create a webhook
- `webhook_send` - Send message via webhook
- `webhook_edit` - Edit webhook message
- `webhook_delete` - Delete webhook
- `fetch_webhooks` - Get channel webhooks
- `delete_webhook` - Remove webhook

## Example

```ezlang
let webhook = create_webhook(channel_id, "Bot Webhook")

webhook_send(webhook.id, webhook.token, {
    "content": "Hello from webhook!",
    "username": "Custom Name",
    "avatarURL": "https://example.com/avatar.png"
})
```

[← Back to Features](/EasyLang/features/)
