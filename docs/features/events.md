---
layout: default
title: Events
description: Create and manage scheduled events
---

# Scheduled Events

Create scheduled events for your community.

## Functions

- `create_scheduled_event` - Create an event
- `edit_scheduled_event` - Edit event
- `delete_scheduled_event` - Delete event
- `fetch_scheduled_events` - Get all events
- `fetch_event_users` - Get interested users

## Example

```ezlang
let event = create_scheduled_event(guild_id, {
    "name": "Game Night",
    "description": "Let's play some games together!",
    "scheduledStartTime": "2024-12-25T20:00:00Z",
    "scheduledEndTime": "2024-12-25T23:00:00Z",
    "privacyLevel": 2,
    "entityType": 2,
    "channelId": voice_channel_id
})
```

[← Back to Features](/EasyLang/features/)
