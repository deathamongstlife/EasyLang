---
layout: default
title: Features
description: Explore all Discord bot features available in EasyLang
---

# EasyLang Features

EasyLang provides comprehensive support for all Discord bot features. Browse the categories below to learn about specific functionality.

## Core Features

### [📨 Messaging](/EasyLang/features/messaging)
Send, edit, delete, and manage messages. Fetch message history and handle bulk operations.

**Key Functions:** `send_message`, `reply`, `edit_message`, `delete_message`, `fetch_messages`

### [🎨 Embeds](/EasyLang/features/embeds)
Create beautiful rich embeds with titles, descriptions, fields, images, and more.

**Key Functions:** `create_embed`, `embed_add_field`, `embed_set_author`, `embed_set_image`

### [🎮 Components](/EasyLang/features/components)
Add interactive buttons, select menus, and modals to your messages.

**Key Functions:** `create_button`, `create_string_select`, `create_action_row`, `create_modal`

### [⚡ Slash Commands](/EasyLang/features/slash-commands)
Register and handle Discord's modern slash commands with options and autocomplete.

**Key Functions:** `register_slash_command`, `interaction_reply`, `interaction_defer`

---

## Media & Communication

### [🎵 Voice](/EasyLang/features/voice)
Join voice channels, play audio, music, and YouTube videos with queue management.

**Key Functions:** `join_voice_channel`, `play_audio`, `play_youtube`, `create_queue`

### [🔗 Webhooks](/EasyLang/features/webhooks)
Create and manage webhooks to send messages with custom avatars and names.

**Key Functions:** `create_webhook`, `webhook_send`, `webhook_edit`, `webhook_delete`

---

## Automation & Tasks

### [⏰ Tasks & Loops](/EasyLang/features/tasks)
Create background tasks, scheduled jobs, and periodic loops.

**Key Functions:** `create_loop`, `create_scheduled_task`, `start_task`, `stop_task`

### [⏱️ Cooldowns](/EasyLang/features/cooldowns)
Implement per-user, channel, or global cooldowns for commands.

**Key Functions:** `add_cooldown`, `is_on_cooldown`, `get_cooldown_remaining`

### [📊 Polls](/EasyLang/features/polls)
Create interactive polls with multiple choices and duration limits.

**Key Functions:** `create_poll`, `send_poll`, `end_poll`, `fetch_poll_results`

### [🛡️ AutoMod](/EasyLang/features/automod)
Set up automatic moderation rules for spam, keywords, and mentions.

**Key Functions:** `create_automod_rule`, `edit_automod_rule`, `delete_automod_rule`

---

## Server Management

### [🔨 Moderation](/EasyLang/features/moderation)
Kick, ban, timeout users, and manage server moderation.

**Key Functions:** `kick_member`, `ban_member`, `timeout_member`, `unban_user`

### [👥 Roles & Permissions](/EasyLang/features/roles-and-permissions)
Create and manage roles, assign them to members, and check permissions.

**Key Functions:** `create_role`, `add_role`, `remove_role`, `has_permission`

### [📝 Channels](/EasyLang/features/channels)
Create, edit, delete, and manage all types of channels.

**Key Functions:** `create_channel`, `edit_channel`, `delete_channel`, `set_permissions`

### [🔍 Audit Logs](/EasyLang/features/audit-logs)
Fetch and filter server audit logs to track changes and actions.

**Key Functions:** `fetch_audit_logs`, filter by action type

### [🎟️ Invites](/EasyLang/features/invites)
Create, manage, and track server invites.

**Key Functions:** `create_invite`, `delete_invite`, `fetch_invites`

---

## Advanced Communication

### [🧵 Threads](/EasyLang/features/threads)
Create and manage message threads in channels.

**Key Functions:** `create_thread`, `create_thread_from_message`, `join_thread`, `archive_thread`

### [💬 Forums](/EasyLang/features/forums)
Work with forum channels and forum posts.

**Key Functions:** `create_forum_post`, `edit_forum_post`, `delete_forum_post`

### [🎭 Stages](/EasyLang/features/stages)
Manage stage channels for audio events.

**Key Functions:** `create_stage_instance`, `edit_stage_instance`, `delete_stage_instance`

### [📅 Events](/EasyLang/features/events)
Create and manage scheduled server events.

**Key Functions:** `create_scheduled_event`, `edit_scheduled_event`, `delete_scheduled_event`

---

## Customization

### [😀 Stickers & Emoji](/EasyLang/features/stickers-emoji)
Work with custom emoji, stickers, and reactions.

**Key Functions:** `create_emoji`, `delete_emoji`, `fetch_sticker`, react functions

### [✨ Presence](/EasyLang/features/presence)
Set bot status, activity, and online presence.

**Key Functions:** `set_presence`, `set_status`, `set_activity`

---

## Feature Comparison

| Feature | Basic | Intermediate | Advanced |
|---------|-------|--------------|----------|
| Messaging | ✅ Send/Reply | ✅ Edit/Delete | ✅ Bulk Operations |
| Embeds | ✅ Basic | ✅ Fields/Images | ✅ Rich Formatting |
| Components | ✅ Buttons | ✅ Select Menus | ✅ Modals |
| Commands | ✅ Message Commands | ✅ Slash Commands | ✅ Autocomplete |
| Voice | ✅ Join/Leave | ✅ Play Audio | ✅ Queue Management |
| Moderation | ✅ Kick/Ban | ✅ Timeout | ✅ AutoMod Rules |
| Automation | ✅ Event Listeners | ✅ Tasks/Loops | ✅ Cooldowns |

---

## Quick Examples

### Send a Message

```ezlang
send_message(channel_id, "Hello, Discord!")
```

### Create an Embed

```ezlang
let embed = create_embed({
    "title": "Welcome!",
    "description": "Thanks for joining",
    "color": "#5865F2"
})
send_message(channel_id, "", embed)
```

### Add a Button

```ezlang
let button = create_button({
    "customId": "click_me",
    "label": "Click Me!",
    "style": 1
})
let row = create_action_row([button])
send_message(channel_id, "Press the button!", null, [row])
```

### Play Music

```ezlang
let connection = join_voice_channel(voice_channel_id)
play_youtube(connection, "https://youtube.com/watch?v=...")
```

### Create a Poll

```ezlang
let poll = create_poll({
    "question": "Favorite color?",
    "answers": ["Red", "Blue", "Green"],
    "duration": 24
})
send_poll(channel_id, poll)
```

---

## Learning Path

We recommend exploring features in this order:

1. **Messaging & Embeds** - Foundation for all bots
2. **Components** - Add interactivity
3. **Slash Commands** - Modern command interface
4. **Voice OR Moderation** - Choose based on your bot type
5. **Tasks & Cooldowns** - Add automation
6. **Advanced Features** - Threads, forums, events, etc.

---

## Getting Help

- **API Reference**: Detailed function documentation in [API section](/EasyLang/api/)
- **Examples**: Complete working bots in [Examples section](/EasyLang/examples/)
- **Basic Concepts**: Learn fundamentals in [Getting Started](/EasyLang/getting-started/)

---

## All Features

Browse all feature pages:

<div class="feature-list">

- [Messaging](/EasyLang/features/messaging) - 15+ functions
- [Embeds](/EasyLang/features/embeds) - 12+ functions
- [Components](/EasyLang/features/components) - 10+ functions
- [Slash Commands](/EasyLang/features/slash-commands) - 8+ functions
- [Voice](/EasyLang/features/voice) - 12+ functions
- [Webhooks](/EasyLang/features/webhooks) - 6+ functions
- [Tasks](/EasyLang/features/tasks) - 8+ functions
- [Cooldowns](/EasyLang/features/cooldowns) - 5+ functions
- [Polls](/EasyLang/features/polls) - 6+ functions
- [AutoMod](/EasyLang/features/automod) - 8+ functions
- [Audit Logs](/EasyLang/features/audit-logs) - 4+ functions
- [Invites](/EasyLang/features/invites) - 6+ functions
- [Roles & Permissions](/EasyLang/features/roles-and-permissions) - 12+ functions
- [Moderation](/EasyLang/features/moderation) - 10+ functions
- [Channels](/EasyLang/features/channels) - 15+ functions
- [Threads](/EasyLang/features/threads) - 10+ functions
- [Forums](/EasyLang/features/forums) - 8+ functions
- [Stages](/EasyLang/features/stages) - 6+ functions
- [Events](/EasyLang/features/events) - 8+ functions
- [Stickers & Emoji](/EasyLang/features/stickers-emoji) - 10+ functions
- [Presence](/EasyLang/features/presence) - 4+ functions

</div>

**Total: 148+ functions covering every Discord bot feature!**

---

[View Complete API Reference →](/EasyLang/api/){: .btn .btn-primary}
[Browse Examples →](/EasyLang/examples/){: .btn .btn-secondary}
