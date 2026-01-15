---
layout: default
title: Threads
description: Create and manage message threads
---

# Threads

Create and manage threads for organized discussions.

## Functions

- `create_thread` - Create a new thread
- `create_thread_from_message` - Create thread from message
- `join_thread` - Join a thread
- `leave_thread` - Leave a thread
- `archive_thread` - Archive thread
- `unarchive_thread` - Unarchive thread
- `add_thread_member` - Add member to thread
- `remove_thread_member` - Remove from thread

## Example

```ezlang
listen("messageCreate", function(message) {
    if message.content == "!thread" {
        let thread = create_thread_from_message(message.channel.id, message.id, {
            "name": "Discussion: " + message.author.username,
            "autoArchiveDuration": 60
        })

        send_message(thread.id, "Thread created! Discuss here.")
    }
})
```

[← Back to Features](/EasyLang/features/)
