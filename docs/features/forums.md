---
layout: default
title: Forums
description: Work with forum channels and posts
---

# Forums

Create and manage forum posts in forum channels.

## Functions

- `create_forum_post` - Create a new forum post
- `edit_forum_post` - Edit forum post
- `delete_forum_post` - Delete forum post
- `fetch_forum_posts` - Get forum posts
- `add_forum_tag` - Add tag to post
- `remove_forum_tag` - Remove tag

## Example

```ezlang
let post = create_forum_post(forum_channel_id, {
    "name": "How do I setup a bot?",
    "message": {
        "content": "I need help setting up my first bot..."
    },
    "appliedTags": [tag_id]
})
```

[← Back to Features](/EasyLang/features/)
