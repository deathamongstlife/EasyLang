---
layout: default
title: Polls
description: Create interactive polls with multiple options
---

# Polls

Create polls that users can vote on.

## Functions

- `create_poll` - Create a poll object
- `send_poll` - Send poll to channel
- `end_poll` - End poll early
- `fetch_poll_results` - Get poll results

## Example

```ezlang
listen("messageCreate", function(message) {
    if message.content == "!poll" {
        let poll = create_poll({
            "question": "What's your favorite programming language?",
            "answers": ["Python", "JavaScript", "Rust", "Go"],
            "duration": 24,
            "allowMultiselect": false
        })

        send_poll(message.channel.id, poll)
    }
})
```

[← Back to Features](/EasyLang/features/)
