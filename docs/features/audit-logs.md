---
layout: default
title: Audit Logs
description: Track and monitor server changes
---

# Audit Logs

Fetch server audit logs to track moderation actions and changes.

## Functions

- `fetch_audit_logs` - Get audit log entries
- Filter by action type, user, or timeframe

## Example

```ezlang
// Get recent bans
let logs = fetch_audit_logs(guild_id, {
    "actionType": 22,  // Member ban
    "limit": 10
})

for entry in logs {
    print(entry.executor.username + " banned " + entry.target.username)
    print("Reason: " + entry.reason)
}
```

[← Back to Features](/EasyLang/features/)
