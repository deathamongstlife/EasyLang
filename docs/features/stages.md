---
layout: default
title: Stages
description: Manage stage channels for audio events
---

# Stages

Create and manage stage instances for large audio events.

## Functions

- `create_stage_instance` - Create stage instance
- `edit_stage_instance` - Edit stage
- `delete_stage_instance` - Delete stage
- `move_to_speaker` - Move to speaker
- `move_to_audience` - Move to audience

## Example

```ezlang
let stage = create_stage_instance(stage_channel_id, {
    "topic": "Weekly Community Meeting",
    "privacyLevel": 2
})
```

[← Back to Features](/EasyLang/features/)
