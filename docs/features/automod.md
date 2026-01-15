---
layout: default
title: AutoMod
description: Automatic moderation rules and filters
---

# AutoMod

Set up automatic moderation to filter content and prevent spam.

## Functions

- `create_automod_rule` - Create AutoMod rule
- `edit_automod_rule` - Edit existing rule
- `delete_automod_rule` - Delete rule
- `fetch_automod_rules` - Get all rules
- `enable_automod_rule` - Enable a rule
- `disable_automod_rule` - Disable a rule

## Example

```ezlang
// Block specific keywords
create_automod_rule(guild_id, {
    "name": "Bad Words Filter",
    "eventType": 1,
    "triggerType": 1,
    "triggerMetadata": {
        "keywordFilter": ["badword1", "badword2"]
    },
    "actions": [
        {"type": 1, "metadata": {}},  // Block message
        {"type": 2, "metadata": {"channel": log_channel_id}}  // Alert
    ]
})
```

[← Back to Features](/EasyLang/features/)
