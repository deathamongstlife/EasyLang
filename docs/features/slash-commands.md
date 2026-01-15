---
layout: default
title: Slash Commands
description: Register and handle Discord slash commands
---

# Slash Commands

Modern Discord commands that appear in the command menu with autocomplete and validation.

## Available Functions

- `register_slash_command` - Register a slash command
- `interaction_reply` - Reply to an interaction
- `interaction_defer` - Defer response for long operations
- `interaction_followup` - Send followup message
- `interaction_update` - Update original response
- `register_autocomplete` - Add autocomplete to options

## Basic Example

```ezlang
register_slash_command({
    "name": "hello",
    "description": "Say hello",
    "options": [
        {
            "name": "user",
            "description": "User to greet",
            "type": 6,
            "required": false
        }
    ]
})

listen("interactionCreate", function(interaction) {
    if interaction.commandName == "hello" {
        let user = get_option(interaction, "user") or interaction.user
        interaction_reply(interaction, "Hello, " + mention_user(user.id) + "!")
    }
})
```

## Command with Options

```ezlang
register_slash_command({
    "name": "ban",
    "description": "Ban a user",
    "options": [
        {"name": "user", "description": "User to ban", "type": 6, "required": true},
        {"name": "reason", "description": "Ban reason", "type": 3, "required": false}
    ]
})
```

## Ephemeral Responses

```ezlang
// Only visible to command user
interaction_reply(interaction, "Secret message!", true)
```

[← Back to Features](/EasyLang/features/)
