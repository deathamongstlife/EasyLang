---
layout: default
title: Tasks & Loops
description: Create background tasks and scheduled jobs
---

# Tasks & Loops

Run code periodically or at scheduled times.

## Functions

- `create_loop` - Create periodic loop
- `create_scheduled_task` - Schedule one-time task
- `start_task` - Start a task
- `stop_task` - Stop a task
- `task_running` - Check if task is running

## Examples

### Periodic Loop

```ezlang
let reminder_task = create_loop(function() {
    send_message(channel_id, "Reminder: Stay hydrated! 💧")
}, 3600000)  // Every hour

start_task(reminder_task)
```

### Scheduled Task

```ezlang
let task = create_scheduled_task(function() {
    send_message(channel_id, "Event starting now!")
}, "2024-12-25T12:00:00")

start_task(task)
```

[← Back to Features](/EasyLang/features/)
