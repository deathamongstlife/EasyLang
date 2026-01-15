# Discord Advanced Features for EasyLang

This document covers all the advanced Discord features implemented in EasyLang, providing comprehensive API references, usage examples, and best practices.

## Table of Contents

1. [Webhooks](#webhooks)
2. [Background Tasks & Loops](#background-tasks--loops)
3. [Cooldowns](#cooldowns)
4. [Polls](#polls)
5. [Error Handling](#error-handling)
6. [Common Patterns](#common-patterns)
7. [Troubleshooting](#troubleshooting)

---

## Webhooks

Webhooks allow you to send messages without rate limits and with custom usernames/avatars.

### API Reference

#### `create_webhook(channel, name, avatar_url?)`
Create a webhook in a channel.

**Parameters:**
- `channel` - The channel object to create webhook in
- `name` - Webhook name (string)
- `avatar_url` (optional) - URL for webhook avatar

**Returns:** Webhook object with `id`, `url`, `token`, and `name`

**Example:**
```ezlang
var channel = get_channel("123456789")
var webhook = create_webhook(channel, "Status Bot", "https://example.com/icon.png")
print("Webhook created: " + webhook.url)
```

#### `webhook_send(webhook_url, content, options?)`
Send a message via webhook.

**Parameters:**
- `webhook_url` - The webhook URL (string)
- `content` - Message content (string)
- `options` (optional) - Object with:
  - `username` - Override webhook username
  - `avatar_url` - Override webhook avatar
  - `embeds` - Array of embed objects
  - `files` - Array of file paths
  - `thread_id` - Send to specific thread
  - `allowed_mentions` - Mention configuration

**Example:**
```ezlang
webhook_send(webhook.url, "Server started!", {
    username: "Status Bot",
    avatar_url: "https://example.com/status.png",
    embeds: [status_embed]
})
```

#### `webhook_edit(webhook_url, options)`
Edit webhook properties.

**Parameters:**
- `webhook_url` - The webhook URL
- `options` - Object with `name` and/or `avatar` properties

**Example:**
```ezlang
webhook_edit(webhook.url, {
    name: "New Name",
    avatar: "https://example.com/new-icon.png"
})
```

#### `webhook_delete(webhook_url)`
Delete a webhook.

**Example:**
```ezlang
webhook_delete(webhook.url)
```

#### `fetch_webhooks(channel)`
Get all webhooks in a channel.

**Returns:** Array of webhook objects

**Example:**
```ezlang
var webhooks = fetch_webhooks(channel)
for webhook in webhooks {
    print("Webhook: " + webhook.name)
}
```

#### `fetch_webhook(webhook_url)`
Get specific webhook information.

**Example:**
```ezlang
var webhook = fetch_webhook("https://discord.com/api/webhooks/...")
print("Webhook name: " + webhook.name)
```

---

## Background Tasks & Loops

Create scheduled tasks and repeating loops for automation.

### API Reference

#### `create_loop(callback, interval_seconds)`
Create a repeating task.

**Parameters:**
- `callback` - Function to execute
- `interval_seconds` - Interval in seconds (number)

**Returns:** Task object with `id`, `type`, `interval`, and `running` status

**Example:**
```ezlang
var task = create_loop(function() {
    print("Running every 30 seconds")
    # Your automation logic here
}, 30)

start_task(task)
```

#### `create_scheduled_task(callback, times_array)`
Create a task that runs at specific times each day.

**Parameters:**
- `callback` - Function to execute
- `times_array` - Array of times in "HH:MM" format (24-hour)

**Returns:** Task object

**Example:**
```ezlang
var daily_task = create_scheduled_task(function() {
    var channel = get_channel("123456789")
    send(channel, "Daily reminder!")
}, ["08:00", "12:00", "18:00"])

start_task(daily_task)
```

#### `start_task(task_id)`
Start or resume a task.

**Parameters:**
- `task_id` - Task ID (string) or task object

**Example:**
```ezlang
start_task(task)
# Or using task ID
start_task("task_1_123456")
```

#### `stop_task(task_id)`
Stop a running task.

**Example:**
```ezlang
stop_task(task)
```

#### `is_task_running(task_id)`
Check if a task is currently running.

**Returns:** Boolean

**Example:**
```ezlang
if is_task_running(task) {
    print("Task is running")
} else {
    print("Task is stopped")
}
```

#### `get_task_info(task_id)`
Get detailed task information.

**Returns:** Object with task details including:
- `id` - Task ID
- `type` - "loop" or "scheduled"
- `running` - Boolean status
- `error_count` - Number of errors
- `max_retries` - Maximum retry attempts
- `last_run` - Last execution timestamp
- `next_run` - Next scheduled execution (for scheduled tasks)

**Example:**
```ezlang
var info = get_task_info(task)
print("Task type: " + info.type)
print("Running: " + str(info.running))
if info.next_run {
    print("Next run: " + info.next_run)
}
```

#### `list_tasks()`
Get all tasks.

**Returns:** Array of task objects

**Example:**
```ezlang
var all_tasks = list_tasks()
print("Total tasks: " + str(length(all_tasks)))
for task in all_tasks {
    print("Task " + task.id + " is " + (task.running ? "running" : "stopped"))
}
```

#### `delete_task(task_id)`
Permanently delete a task.

**Example:**
```ezlang
delete_task(task)
```

### Task Features

- **Automatic Error Handling**: Tasks retry on failure (default: 5 retries)
- **Error Logging**: Errors are logged to console
- **Automatic Cleanup**: Stopped tasks are safely cleaned up

---

## Cooldowns

Manage command cooldowns with support for multiple bucket types.

### API Reference

#### `add_cooldown(user_id, command_name, duration_seconds, options?)`
Add a cooldown.

**Parameters:**
- `user_id` - User ID (string)
- `command_name` - Command name (string)
- `duration_seconds` - Duration in seconds (number)
- `options` (optional) - Object with:
  - `bucket` - "user" | "channel" | "guild" | "global" (default: "user")
  - `channel_id` - Channel ID (required for channel bucket)
  - `guild_id` - Guild ID (required for guild bucket)

**Example:**
```ezlang
# Per-user cooldown (default)
add_cooldown(user.id, "daily_reward", 86400)

# Channel-wide cooldown
add_cooldown(user.id, "channel_command", 60, {
    bucket: "channel",
    channel_id: channel.id
})

# Guild-wide cooldown
add_cooldown(user.id, "guild_event", 300, {
    bucket: "guild",
    guild_id: guild.id
})

# Global cooldown (affects all users)
add_cooldown(user.id, "global_announcement", 600, {
    bucket: "global"
})
```

#### `is_on_cooldown(user_id, command_name, options?)`
Check if on cooldown.

**Returns:** Boolean

**Example:**
```ezlang
if is_on_cooldown(user.id, "daily_reward") {
    var remaining = get_cooldown_remaining(user.id, "daily_reward")
    reply(message, "Cooldown: " + str(remaining) + "s remaining")
} else {
    # Execute command
    reply(message, "Here's your reward!")
    add_cooldown(user.id, "daily_reward", 86400)
}
```

#### `get_cooldown_remaining(user_id, command_name, options?)`
Get remaining cooldown time.

**Returns:** Number (seconds), or 0 if not on cooldown

**Example:**
```ezlang
var remaining = get_cooldown_remaining(user.id, "daily_reward")
if remaining > 0 {
    var hours = remaining / 3600
    var minutes = (remaining % 3600) / 60
    reply(message, "Wait " + str(hours) + "h " + str(minutes) + "m")
}
```

#### `reset_cooldown(user_id, command_name, options?)`
Clear a specific cooldown.

**Returns:** Boolean (true if cooldown existed)

**Example:**
```ezlang
# Admin command to reset cooldowns
if has_permission(user, "ADMINISTRATOR") {
    reset_cooldown(target_user.id, "daily_reward")
    reply(message, "Cooldown reset!")
}
```

#### `reset_all_cooldowns(user_id)`
Clear all cooldowns for a user.

**Returns:** Number of cooldowns cleared

**Example:**
```ezlang
var count = reset_all_cooldowns(user.id)
reply(message, "Cleared " + str(count) + " cooldowns")
```

#### `get_user_cooldowns(user_id)`
Get all active cooldowns for a user.

**Returns:** Array of cooldown objects with:
- `command_name` - Command name
- `remaining_seconds` - Time remaining
- `expires_at` - Expiration timestamp
- `bucket` - Bucket type
- `channel_id` - Channel ID (if applicable)
- `guild_id` - Guild ID (if applicable)

**Example:**
```ezlang
var cooldowns = get_user_cooldowns(user.id)
var embed = create_embed("Your Cooldowns", "")

for cd in cooldowns {
    var time = str(cd.remaining_seconds) + "s"
    embed_add_field(embed, cd.command_name, time, true)
}

reply(message, "", { embeds: [embed] })
```

#### `get_cooldown_stats()`
Get cooldown system statistics.

**Returns:** Object with statistics

**Example:**
```ezlang
var stats = get_cooldown_stats()
print("Active cooldowns: " + str(stats.active))
print("User bucket: " + str(stats.user_bucket))
print("Channel bucket: " + str(stats.channel_bucket))
```

### Cooldown Features

- **Multiple Bucket Types**: user, channel, guild, global
- **Automatic Cleanup**: Expired cooldowns are automatically removed
- **Thread-Safe**: Designed for concurrent access

---

## Polls

Create native Discord polls with ease.

### API Reference

#### `create_poll(question, answers_array, duration_hours, allow_multiselect?)`
Create a poll object.

**Parameters:**
- `question` - Poll question (string, max 300 chars)
- `answers_array` - Array of answer strings (2-10 answers, max 55 chars each)
- `duration_hours` - Duration in hours (1-336 hours / 14 days)
- `allow_multiselect` (optional) - Allow multiple answers (boolean, default: false)

**Returns:** Poll object

**Example:**
```ezlang
var poll = create_poll(
    "What's your favorite programming language?",
    ["JavaScript", "Python", "Rust", "Go"],
    24,
    false
)
```

#### `send_poll(channel, poll)`
Send a poll to a channel.

**Returns:** Message object

**Example:**
```ezlang
var message = send_poll(channel, poll)
print("Poll sent: " + message.id)
```

#### `end_poll(message)`
End a poll early.

**Example:**
```ezlang
end_poll(poll_message)
```

#### `fetch_poll_results(message)`
Get current poll results.

**Returns:** Object with:
- `question` - Poll question
- `total_votes` - Total vote count
- `results` - Array of answer results with `id`, `text`, and `vote_count`
- `ended` - Boolean indicating if poll has ended
- `expires_at` - Expiration timestamp

**Example:**
```ezlang
var results = fetch_poll_results(poll_message)
print("Total votes: " + str(results.total_votes))

for answer in results.results {
    print(answer.text + ": " + str(answer.vote_count) + " votes")
}
```

#### `fetch_poll_voters(message, answer_id)`
Get users who voted for a specific answer.

**Parameters:**
- `message` - Poll message
- `answer_id` - Answer ID (number)

**Returns:** Array of user objects

**Example:**
```ezlang
var voters = fetch_poll_voters(poll_message, 0)
print("Voters for first option: " + str(length(voters)))
for voter in voters {
    print("- " + voter.username)
}
```

---

## Error Handling

Comprehensive error handling system with custom error types.

### API Reference

#### `handle_discord_error(error, context?)`
Handle Discord errors with logging.

**Parameters:**
- `error` - Error object or message
- `context` (optional) - Context string

**Returns:** Error object

**Example:**
```ezlang
try {
    send(channel, "Message")
} catch error {
    var formatted = handle_discord_error(error, "Sending message")
    log_error(formatted)
}
```

#### `format_error_message(error)`
Format an error into a user-friendly message.

**Returns:** Formatted error string

**Example:**
```ezlang
try {
    # Some operation
} catch error {
    var user_message = format_error_message(error)
    reply(message, user_message)
}
```

#### `log_error(error, context?)`
Log an error with timestamp.

**Example:**
```ezlang
log_error(error, "Command execution")
```

#### `create_error(name, message, properties?)`
Create a custom error object.

**Parameters:**
- `name` - Error name (string)
- `message` - Error message (string)
- `properties` (optional) - Additional properties object

**Example:**
```ezlang
var error = create_error("CommandError", "Invalid usage", {
    command: "ping",
    user_id: user.id
})
```

### Error Types

The system includes specialized error types:

- **DiscordAPIError** - Discord API errors (rate limits, permissions, etc.)
- **MissingPermissionsError** - Missing bot or user permissions
- **CommandOnCooldownError** - Command on cooldown
- **MissingRequiredArgumentError** - Missing command argument
- **InvalidArgumentError** - Invalid argument type or value
- **RateLimitError** - Discord rate limit hit
- **NotFoundError** - Resource not found

---

## Common Patterns

### Daily Reward System

```ezlang
on("messageCreate", function(message) {
    if message.content == "!daily" {
        # Check cooldown
        if is_on_cooldown(message.author.id, "daily_reward") {
            var remaining = get_cooldown_remaining(message.author.id, "daily_reward")
            var hours = remaining / 3600
            reply(message, "Come back in " + str(hours) + " hours!")
            return
        }

        # Give reward
        var coins = 100
        reply(message, "You earned " + str(coins) + " coins!")

        # Add 24 hour cooldown
        add_cooldown(message.author.id, "daily_reward", 86400)
    }
})
```

### Status Update Loop

```ezlang
var status_task = create_loop(function() {
    var channel = get_channel("123456789")
    var webhook = fetch_webhook("https://discord.com/api/webhooks/...")

    var status = "Server is online - " + str(time())
    webhook_send(webhook, status, {
        username: "Status Bot",
        avatar_url: "https://example.com/icon.png"
    })
}, 300) # Every 5 minutes

start_task(status_task)
```

### Daily Announcement

```ezlang
var announcement = create_scheduled_task(function() {
    var channel = get_channel("123456789")
    var embed = create_embed("Daily Reminder", "Don't forget to check in!")
    embed_set_color(embed, 0x00FF00)

    send(channel, "", { embeds: [embed] })
}, ["08:00", "20:00"])

start_task(announcement)
```

### Poll with Results

```ezlang
on("messageCreate", function(message) {
    if message.content == "!vote" {
        var poll = create_poll(
            "Should we add a new feature?",
            ["Yes!", "No", "Maybe"],
            24,
            false
        )

        var poll_msg = send_poll(message.channel, poll)

        # Schedule results check
        var check_task = create_scheduled_task(function() {
            var results = fetch_poll_results(poll_msg)

            var result_embed = create_embed("Poll Results", "")
            for answer in results.results {
                embed_add_field(result_embed, answer.text,
                    str(answer.vote_count) + " votes", true)
            }

            send(message.channel, "", { embeds: [result_embed] })
        }, ["08:00"]) # Check tomorrow morning

        start_task(check_task)
    }
})
```

---

## Troubleshooting

### Common Issues

#### Webhooks

**Issue:** Webhook not sending messages
- Check webhook URL is valid
- Verify bot has permission to create webhooks
- Ensure content or embeds are provided

**Issue:** "Unknown Webhook" error
- Webhook may have been deleted
- Verify webhook URL is correct
- Check webhook token hasn't expired

#### Tasks

**Issue:** Task not starting
- Verify task was created successfully
- Check `start_task()` was called
- Use `get_task_info()` to debug

**Issue:** Task stops unexpectedly
- Check error count: `get_task_info(task).error_count`
- Tasks stop after 5 consecutive errors
- Review console logs for error details

**Issue:** Scheduled task not running at expected time
- Verify times are in 24-hour "HH:MM" format
- Check system timezone
- Use `get_task_info()` to see `next_run`

#### Cooldowns

**Issue:** Cooldown not working
- Verify user ID and command name are consistent
- Check bucket type matches usage
- Use `get_user_cooldowns()` to debug

**Issue:** Cooldowns persist after restart
- Cooldowns are stored in memory only
- They reset when bot restarts
- Implement database storage for persistence

#### Polls

**Issue:** Poll not appearing
- Verify channel supports polls
- Check answer count (2-10)
- Verify question/answer lengths

**Issue:** Cannot fetch poll results
- Poll may have expired
- Message must contain a poll
- Check message object is valid

### Best Practices

1. **Error Handling**: Always wrap Discord operations in try-catch
2. **Cooldown Buckets**: Choose appropriate bucket type for your use case
3. **Task Management**: Store task IDs to stop tasks cleanly
4. **Webhook Security**: Don't share webhook URLs publicly
5. **Poll Duration**: Consider your audience timezone when setting duration
6. **Logging**: Use `log_error()` for debugging and monitoring

---

## Next Steps

- Explore [Auto-Moderation](./AUTOMOD.md) for content filtering
- Learn about [Scheduled Events](./EVENTS.md) for community events
- Try [Voice Integration](./VOICE.md) for audio playback

For more examples, see the `examples/advanced/` directory.
