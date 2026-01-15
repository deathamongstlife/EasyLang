---
layout: default
title: API Reference
description: Complete API reference for all EasyLang functions
---

# API Reference

Complete reference documentation for all 148+ EasyLang functions.

## Function Categories

### Core Language Functions
[Built-in Functions](/EasyLang/api/built-in-functions) - Core language operations, variables, and utilities (20+ functions)

### Discord Core
[Discord Functions](/EasyLang/api/discord-functions) - Messages, embeds, components, and core Discord features (30+ functions)

### Media & Communication
- [Voice Functions](/EasyLang/api/voice-functions) - Voice channel and audio playback (12+ functions)
- [Webhook Functions](/EasyLang/api/webhook-functions) - Webhook management (6+ functions)

### Automation
- [Task Functions](/EasyLang/api/task-functions) - Background tasks and loops (8+ functions)
- [Cooldown Functions](/EasyLang/api/cooldown-functions) - Rate limiting (5+ functions)
- [Poll Functions](/EasyLang/api/poll-functions) - Interactive polls (6+ functions)

### Moderation
- [AutoMod Functions](/EasyLang/api/automod-functions) - Automatic moderation (8+ functions)
- [Audit Functions](/EasyLang/api/audit-functions) - Audit log access (4+ functions)
- [Moderation Functions](/EasyLang/api/moderation-functions) - Kick, ban, timeout (10+ functions)

### Server Management
- [Channel Functions](/EasyLang/api/channel-functions) - Channel management (15+ functions)
- [Thread Functions](/EasyLang/api/thread-functions) - Thread operations (10+ functions)
- [Forum Functions](/EasyLang/api/forum-functions) - Forum channel management (8+ functions)
- [Stage Functions](/EasyLang/api/stage-functions) - Stage channel operations (6+ functions)
- [Event Functions](/EasyLang/api/event-functions) - Scheduled events (8+ functions)
- [Sticker Functions](/EasyLang/api/sticker-functions) - Emoji and stickers (10+ functions)

### Discord Objects
[Discord Objects](/EasyLang/api/objects) - Properties and structure of Discord objects

## Function Quick Reference

| Category | Count | Key Functions |
|----------|-------|---------------|
| Built-in | 20+ | `print`, `length`, `split`, `to_string` |
| Discord Core | 30+ | `send_message`, `reply`, `create_embed` |
| Voice | 12+ | `join_voice_channel`, `play_youtube` |
| Components | 10+ | `create_button`, `create_string_select` |
| Moderation | 10+ | `kick_member`, `ban_member`, `timeout_member` |
| Tasks | 8+ | `create_loop`, `create_scheduled_task` |
| AutoMod | 8+ | `create_automod_rule` |
| Channels | 15+ | `create_channel`, `edit_channel` |
| **TOTAL** | **148+** | Comprehensive Discord bot API |

## Function Format

Each function is documented with:

```
## function_name(param1, param2, options?)

**Description:** What the function does

**Parameters:**
- `param1` (Type) - Parameter description
- `param2` (Type) - Parameter description
- `options` (Object, optional) - Optional configuration

**Returns:** Return type and description

**Example:**
<code example>

**Throws:**
- Error conditions

**See Also:** Related functions
```

## Common Patterns

### Error Handling

```ezlang
try {
    send_message(channel_id, "Hello!")
} catch error {
    print("Error: " + error)
}
```

### Async Operations

```ezlang
// Most Discord operations are synchronous in EasyLang
let message = send_message(channel_id, "Hello")
edit_message(message.id, channel_id, "Updated!")
```

### Object Options

```ezlang
// Many functions accept options objects
create_embed({
    "title": "Title",
    "description": "Description",
    "color": "#5865F2"
})
```

## Browse API Documentation

[Built-in Functions →](/EasyLang/api/built-in-functions){: .btn .btn-primary}
[Discord Functions →](/EasyLang/api/discord-functions){: .btn .btn-secondary}

---

## Quick Search

Use your browser's find function (Ctrl+F / Cmd+F) to search for specific functions across API pages.

Common searches:
- "send" - Message sending functions
- "create" - Object creation functions
- "fetch" - Data retrieval functions
- "edit" - Modification functions
- "delete" - Deletion functions

[← Back to Documentation](/EasyLang/)
