# EasyLang Discord Advanced Features - Quick Reference

## Webhooks

```ezlang
# Create webhook
var webhook = create_webhook(channel, "Name", "avatar_url")

# Send message
webhook_send(webhook.url, "Content", {
    username: "Custom Name",
    avatar_url: "url",
    embeds: [embed],
    files: ["path/to/file.png"],
    thread_id: "123"
})

# Edit webhook
webhook_edit(webhook.url, { name: "New Name", avatar: "url" })

# Delete webhook
webhook_delete(webhook.url)

# Fetch webhooks
var webhooks = fetch_webhooks(channel)
var webhook = fetch_webhook(webhook_url)
```

## Background Tasks

```ezlang
# Create interval loop
var loop = create_loop(function() {
    # Runs every interval
}, 30) # seconds

# Create scheduled task
var scheduled = create_scheduled_task(function() {
    # Runs at specific times
}, ["08:00", "12:00", "18:00"]) # HH:MM format

# Control tasks
start_task(task)
stop_task(task)
var running = is_task_running(task)
var info = get_task_info(task)
var all = list_tasks()
delete_task(task)
```

## Cooldowns

```ezlang
# Add cooldown (user bucket - default)
add_cooldown(user.id, "command", 60) # seconds

# Add with specific bucket
add_cooldown(user.id, "command", 60, {
    bucket: "channel",      # user, channel, guild, global
    channel_id: channel.id, # required for channel bucket
    guild_id: guild.id      # required for guild bucket
})

# Check cooldown
if is_on_cooldown(user.id, "command") {
    var remaining = get_cooldown_remaining(user.id, "command")
    # remaining is in seconds
}

# Reset cooldowns
reset_cooldown(user.id, "command")
reset_all_cooldowns(user.id)

# Get info
var cds = get_user_cooldowns(user.id)
var stats = get_cooldown_stats()
```

## Polls

```ezlang
# Create poll
var poll = create_poll(
    "Question?",           # Max 300 chars
    ["A", "B", "C"],       # 2-10 answers, max 55 chars each
    24,                    # Duration in hours (1-336)
    false                  # Allow multiselect?
)

# Send poll
var message = send_poll(channel, poll)

# End poll early
end_poll(message)

# Get results
var results = fetch_poll_results(message)
# results.total_votes
# results.results[].text
# results.results[].vote_count

# Get voters for answer
var voters = fetch_poll_voters(message, 0) # answer_id
```

## Error Handling

```ezlang
try {
    # Discord operation
} catch error {
    # Handle error
    var formatted = handle_discord_error(error, "Context")
    var user_msg = format_error_message(formatted)
    log_error(formatted, "Context")
}

# Create custom error
var error = create_error("ErrorName", "Message", {
    custom_prop: "value"
})
```

## Common Patterns

### Daily Reward with Cooldown
```ezlang
if is_on_cooldown(user.id, "daily") {
    var remaining = get_cooldown_remaining(user.id, "daily")
    reply(message, "Come back in " + str(remaining) + " seconds!")
} else {
    var coins = random(50, 150)
    reply(message, "You got " + str(coins) + " coins!")
    add_cooldown(user.id, "daily", 86400) # 24 hours
}
```

### Status Update Loop
```ezlang
var task = create_loop(function() {
    var embed = create_embed("Status", "Bot is online")
    webhook_send(webhook.url, "", { embeds: [embed] })
}, 300) # Every 5 minutes
start_task(task)
```

### Scheduled Daily Reminder
```ezlang
var reminder = create_scheduled_task(function() {
    send(channel, "Daily reminder!")
}, ["08:00", "20:00"])
start_task(reminder)
```

### Interactive Poll
```ezlang
var poll = create_poll("Vote!", ["Yes", "No"], 24, false)
var msg = send_poll(channel, poll)

# Check results after some time
wait(3600) # Wait 1 hour
var results = fetch_poll_results(msg)
print("Total votes: " + str(results.total_votes))
```

### Guild-Wide Cooldown
```ezlang
# One giveaway per server every 5 minutes
if !is_on_cooldown(user.id, "giveaway", {
    bucket: "guild",
    guild_id: guild.id
}) {
    send(channel, "🎉 Giveaway!")
    add_cooldown(user.id, "giveaway", 300, {
        bucket: "guild",
        guild_id: guild.id
    })
}
```

### Webhook Logger
```ezlang
var logger = create_webhook(log_channel, "Audit Log")

function log_action(action, user) {
    var embed = create_embed("Action: " + action, "")
    embed_add_field(embed, "User", user.tag, true)
    embed_set_timestamp(embed)

    webhook_send(logger.url, "", {
        embeds: [embed],
        username: "Audit Log"
    })
}
```

## Time Helpers

```ezlang
# Cooldown durations
var one_minute = 60
var one_hour = 3600
var one_day = 86400
var one_week = 604800

# Format time
function format_time(seconds) {
    if seconds >= 3600 {
        return str(seconds / 3600) + "h"
    }
    if seconds >= 60 {
        return str(seconds / 60) + "m"
    }
    return str(seconds) + "s"
}
```

## Best Practices

1. **Always handle errors** - Wrap Discord operations in try-catch
2. **Use appropriate cooldown buckets** - Choose user/channel/guild/global based on needs
3. **Clean up tasks** - Stop and delete tasks when done
4. **Validate poll inputs** - Check lengths and counts before creating
5. **Log important actions** - Use webhooks for audit logging
6. **Test scheduled times** - Verify timezone and format (HH:MM)
7. **Monitor task errors** - Check error_count in task info
8. **Use webhooks for high-volume** - Webhooks bypass many rate limits

## Tips & Tricks

- **Cooldown math**: `86400 = 24 hours`, `3600 = 1 hour`, `60 = 1 minute`
- **Task IDs**: Store task IDs to manage them later
- **Webhook URLs**: Keep webhook URLs secret (don't log them)
- **Poll duration**: Max 336 hours (14 days)
- **Task retries**: Default 5 retries before stopping
- **Bucket types**: User (default), Channel, Guild, Global
- **Time format**: Use 24-hour "HH:MM" format for scheduled tasks
- **Error context**: Always provide context for better debugging

## Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| Task not starting | Call `start_task()` after creating |
| Cooldown not working | Check bucket type and IDs match |
| Webhook fails | Verify URL and bot permissions |
| Poll not showing | Check answer count (2-10) and lengths |
| Task stops | Check `error_count` in task info |
| Scheduled time wrong | Verify 24-hour HH:MM format |

## More Info

- **Full Documentation**: `docs/DISCORD_ADVANCED_FEATURES.md`
- **Examples**: `examples/advanced/`
- **Implementation Details**: `ADVANCED_FEATURES_IMPLEMENTATION.md`
