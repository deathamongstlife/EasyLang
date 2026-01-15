---
layout: default
title: Presence
description: Set bot status and activity
---

# Presence

Customize your bot's online status and activity.

## Functions

- `set_presence` - Set full presence
- `set_status` - Set online status
- `set_activity` - Set activity

## Examples

### Set Activity

```ezlang
listen("ready", function() {
    set_presence({
        "activities": [{
            "name": "with Discord API",
            "type": 0  // Playing
        }],
        "status": "online"
    })
})
```

### Activity Types

```ezlang
// Type 0: Playing
set_activity("Minecraft", 0)

// Type 1: Streaming
set_activity("Live Coding", 1)

// Type 2: Listening
set_activity("Spotify", 2)

// Type 3: Watching
set_activity("YouTube", 3)

// Type 5: Competing
set_activity("Tournaments", 5)
```

### Status Types

```ezlang
set_status("online")    // Green
set_status("idle")      // Yellow
set_status("dnd")       // Red (Do Not Disturb)
set_status("invisible") // Invisible
```

[← Back to Features](/EasyLang/features/)
