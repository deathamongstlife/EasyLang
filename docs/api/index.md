---
layout: docs
title: API Reference
description: Complete API reference for all EasyLang functions
category: api
---

# API Reference

Complete reference documentation for all 148+ EasyLang functions organized by category.

<div class="callout info">
  <strong>Looking for something specific?</strong> Use your browser's find function (Ctrl+F / Cmd+F) to search for functions by name.
</div>

---

## Function Categories

<div class="features">
  <div class="feature-card">
    <h3>Core Language</h3>
    <p>Essential built-in functions for basic operations</p>
    <ul>
      <li>20+ functions</li>
      <li>Variables & data types</li>
      <li>String manipulation</li>
      <li>Array operations</li>
    </ul>
    <a href="{{ '/api/built-in-functions' | relative_url }}">View Functions →</a>
  </div>

  <div class="feature-card">
    <h3>Discord Core</h3>
    <p>Messages, embeds, and core Discord features</p>
    <ul>
      <li>30+ functions</li>
      <li>Send & edit messages</li>
      <li>Rich embeds</li>
      <li>Reactions & replies</li>
    </ul>
    <a href="{{ '/api/discord-functions' | relative_url }}">View Functions →</a>
  </div>

  <div class="feature-card">
    <h3>Voice & Audio</h3>
    <p>Voice channel control and audio playback</p>
    <ul>
      <li>12+ functions</li>
      <li>Join voice channels</li>
      <li>YouTube integration</li>
      <li>Audio controls</li>
    </ul>
    <a href="{{ '/api/voice-functions' | relative_url }}">View Functions →</a>
  </div>

  <div class="feature-card">
    <h3>Components</h3>
    <p>Interactive buttons, menus, and modals</p>
    <ul>
      <li>10+ functions</li>
      <li>Buttons & menus</li>
      <li>Modal forms</li>
      <li>Action rows</li>
    </ul>
    <a href="{{ '/api/discord-functions#component-functions' | relative_url }}">View Functions →</a>
  </div>

  <div class="feature-card">
    <h3>Moderation</h3>
    <p>Kick, ban, timeout, and server management</p>
    <ul>
      <li>10+ functions</li>
      <li>Member actions</li>
      <li>Role management</li>
      <li>Permissions</li>
    </ul>
    <a href="{{ '/api/moderation-functions' | relative_url }}">View Functions →</a>
  </div>

  <div class="feature-card">
    <h3>AutoMod</h3>
    <p>Automatic moderation rules and filters</p>
    <ul>
      <li>8+ functions</li>
      <li>Keyword filters</li>
      <li>Spam protection</li>
      <li>Custom rules</li>
    </ul>
    <a href="{{ '/api/automod-functions' | relative_url }}">View Functions →</a>
  </div>

  <div class="feature-card">
    <h3>Tasks & Loops</h3>
    <p>Background tasks and scheduled jobs</p>
    <ul>
      <li>8+ functions</li>
      <li>Periodic loops</li>
      <li>Scheduled tasks</li>
      <li>Intervals & timeouts</li>
    </ul>
    <a href="{{ '/api/task-functions' | relative_url }}">View Functions →</a>
  </div>

  <div class="feature-card">
    <h3>Webhooks</h3>
    <p>Create and manage webhooks</p>
    <ul>
      <li>6+ functions</li>
      <li>Webhook creation</li>
      <li>Custom messages</li>
      <li>Avatar & name</li>
    </ul>
    <a href="{{ '/api/webhook-functions' | relative_url }}">View Functions →</a>
  </div>

  <div class="feature-card">
    <h3>Polls</h3>
    <p>Create interactive polls and surveys</p>
    <ul>
      <li>6+ functions</li>
      <li>Multiple choice</li>
      <li>Duration settings</li>
      <li>Result fetching</li>
    </ul>
    <a href="{{ '/api/poll-functions' | relative_url }}">View Functions →</a>
  </div>

  <div class="feature-card">
    <h3>Cooldowns</h3>
    <p>Rate limiting and cooldown management</p>
    <ul>
      <li>5+ functions</li>
      <li>Per-user limits</li>
      <li>Global cooldowns</li>
      <li>Channel-specific</li>
    </ul>
    <a href="{{ '/api/cooldown-functions' | relative_url }}">View Functions →</a>
  </div>

  <div class="feature-card">
    <h3>Channels</h3>
    <p>Channel creation and management</p>
    <ul>
      <li>15+ functions</li>
      <li>Create channels</li>
      <li>Edit properties</li>
      <li>Permissions</li>
    </ul>
    <a href="{{ '/api/channel-functions' | relative_url }}">View Functions →</a>
  </div>

  <div class="feature-card">
    <h3>Threads</h3>
    <p>Thread creation and management</p>
    <ul>
      <li>10+ functions</li>
      <li>Create threads</li>
      <li>Archive/unarchive</li>
      <li>Thread members</li>
    </ul>
    <a href="{{ '/api/thread-functions' | relative_url }}">View Functions →</a>
  </div>
</div>

---

## Function Count by Category

| Category | Functions | Description |
|----------|-----------|-------------|
| Built-in Functions | 20+ | Core language operations and utilities |
| Discord Core | 30+ | Messages, embeds, reactions, components |
| Voice & Audio | 12+ | Voice channels and audio playback |
| Moderation | 10+ | Member management and moderation |
| AutoMod | 8+ | Automatic moderation rules |
| Tasks & Loops | 8+ | Background tasks and scheduling |
| Webhooks | 6+ | Webhook creation and management |
| Polls | 6+ | Interactive polls and voting |
| Cooldowns | 5+ | Rate limiting and cooldowns |
| Channels | 15+ | Channel creation and management |
| Threads | 10+ | Thread operations |
| Forums | 8+ | Forum channel management |
| Stages | 6+ | Stage channel operations |
| Events | 8+ | Scheduled events |
| Audit Logs | 4+ | Server audit log access |
| Stickers | 10+ | Emoji and sticker functions |
| **Total** | **148+** | Comprehensive Discord bot API |

---

## Common Patterns

### Sending Messages

```ezlang
// Simple message
send_message(channel_id, "Hello, world!")

// Message with embed
let embed = create_embed({
    "title": "Welcome!",
    "description": "Thanks for joining",
    "color": "#5865F2"
})
send_message(channel_id, "", embed)

// Message with buttons
let button = create_button({
    "customId": "click_me",
    "label": "Click Me!",
    "style": 1
})
let row = create_action_row([button])
send_message(channel_id, "Interactive!", null, [row])
```

### Event Handling

```ezlang
// Listen for messages
listen("messageCreate", function(message) {
    if message.content == "!ping" {
        reply(message, "Pong!")
    }
})

// Listen for button clicks
listen("interactionCreate", function(interaction) {
    if interaction.customId == "click_me" {
        interaction_reply(interaction, "Clicked!", true)
    }
})
```

### Error Handling

```ezlang
try {
    send_message(channel_id, "Hello!")
} catch error {
    print("Error sending message: " + error)
}
```

### Working with Objects

```ezlang
// Access properties
let username = message.author.username
let channel_name = message.channel.name

// Create options objects
let options = {
    "limit": 10,
    "before": message_id
}
let messages = fetch_messages(channel_id, options)
```

---

## Documentation Format

Each function page includes:

<div class="features">
  <div class="feature-card">
    <h3>Function Signature</h3>
    <p>Clear syntax with parameter types</p>
  </div>

  <div class="feature-card">
    <h3>Parameters</h3>
    <p>Detailed parameter descriptions with types</p>
  </div>

  <div class="feature-card">
    <h3>Return Values</h3>
    <p>What the function returns</p>
  </div>

  <div class="feature-card">
    <h3>Examples</h3>
    <p>Multiple real-world code examples</p>
  </div>

  <div class="feature-card">
    <h3>Errors</h3>
    <p>Possible error conditions</p>
  </div>

  <div class="feature-card">
    <h3>See Also</h3>
    <p>Links to related functions</p>
  </div>
</div>

---

## Quick Links

<div class="text-center">
  <a href="{{ '/api/built-in-functions' | relative_url }}" class="btn btn-primary">Built-in Functions</a>
  <a href="{{ '/api/discord-functions' | relative_url }}" class="btn btn-primary">Discord Functions</a>
  <a href="{{ '/api/voice-functions' | relative_url }}" class="btn btn-secondary">Voice Functions</a>
  <a href="{{ '/api/objects' | relative_url }}" class="btn btn-secondary">Discord Objects</a>
</div>

---

## Need Help?

<div class="callout info">
  <strong>Can't find what you're looking for?</strong>
  <ul>
    <li>Check the <a href="{{ '/getting-started/' | relative_url }}">Getting Started guide</a> for tutorials</li>
    <li>Browse <a href="{{ '/examples/' | relative_url }}">complete examples</a> to see functions in action</li>
    <li>Report issues on <a href="https://github.com/{{ site.repository }}/issues">GitHub</a></li>
  </ul>
</div>
