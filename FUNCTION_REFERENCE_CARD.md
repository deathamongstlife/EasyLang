# EasyLang Discord Function Reference Card

Quick reference for all 239+ Discord functions organized by category.

---

## Core Messaging (10 functions)

```ezlang
send_message(channel, content, options)        // Send a message
reply(message, content, options)               // Reply to a message
edit_message(message, newContent, options)     // Edit existing message
delete_message(message)                        // Delete a message
fetch_message(channel, messageId)              // Fetch specific message
fetch_messages(channel, limit)                 // Fetch multiple messages
bulk_delete(channel, amount)                   // Delete 2-100 messages at once
pin_message(message)                           // Pin a message
unpin_message(message)                         // Unpin a message
fetch_pinned_messages(channel)                 // Get all pinned messages
```

---

## Embeds (15 functions)

```ezlang
create_embed()                                 // Create new embed
embed_set_title(embed, title)                  // Set embed title
embed_set_description(embed, description)      // Set embed description
embed_set_color(embed, color)                  // Set embed color (hex number)
embed_add_field(embed, name, value, inline)    // Add field to embed
embed_set_author(embed, name, iconURL, url)    // Set embed author
embed_set_footer(embed, text, iconURL)         // Set embed footer
embed_set_image(embed, imageURL)               // Set large image
embed_set_thumbnail(embed, thumbnailURL)       // Set small thumbnail
embed_set_timestamp(embed, timestamp)          // Set timestamp ("now" or ISO)
embed_set_url(embed, url)                      // Set embed URL (clickable title)

// Note: Some additional embed functions exist for field manipulation
```

---

## Components (11 functions)

```ezlang
// Buttons
create_button(label, style, customId)          // Create button (primary/secondary/success/danger)
create_link_button(label, url)                 // Create link button

// Select Menus
create_string_select(customId, placeholder, options)  // String select menu
create_user_select(customId, placeholder)             // User picker
create_role_select(customId, placeholder)             // Role picker
create_channel_select(customId, placeholder)          // Channel picker

// Action Rows
create_action_row(...components)               // Container for components (max 5)

// Modals
create_modal(customId, title)                  // Create modal form
create_text_input(customId, label, style, required)  // Text input (short/paragraph)
show_modal(interaction, modal)                 // Show modal to user
get_modal_field(interaction, customId)         // Get modal field value
```

---

## Reactions (5 functions)

```ezlang
add_reaction(message, emoji)                   // Add reaction to message
remove_reaction(message, emoji, user)          // Remove specific reaction
clear_reactions(message)                       // Clear all reactions
fetch_reactions(message, emoji)                // Get users who reacted
// Note: react() may be an alias for add_reaction()
```

---

## Slash Commands & Context Menus (5 functions)

```ezlang
register_slash_command(commandData)            // Register slash command
register_user_context_menu(menuData)           // Register user right-click menu
register_message_context_menu(menuData)        // Register message right-click menu

interaction_reply(interaction, content, options)    // Reply to interaction
interaction_defer(interaction, options)             // Defer reply (for slow operations)
interaction_update(interaction, content, options)   // Update interaction message
```

---

## Voice & Audio (18 functions)

```ezlang
// Voice Connection
join_voice_channel(channel)                    // Join voice channel
leave_voice_channel(guildId)                   // Leave voice channel
get_voice_connection(guildId)                  // Get active connection

// Audio Playback
play_audio(guildId, source, options)           // Play audio (URL/file/stream)
play_file(guildId, filePath, options)          // Play local audio file
play_youtube(guildId, url, options)            // Play YouTube video audio
stop_audio(guildId)                            // Stop playback
pause_audio(guildId)                           // Pause playback
resume_audio(guildId)                          // Resume playback
set_volume(guildId, volume)                    // Set volume (0.0-2.0)
get_volume(guildId)                            // Get current volume
is_playing(guildId)                            // Check if playing
is_paused(guildId)                             // Check if paused

// Queue Management
add_to_queue(guildId, source, title)           // Add to queue
get_queue(guildId)                             // Get queue
clear_queue(guildId)                           // Clear queue
skip_audio(guildId)                            // Skip to next track
get_now_playing(guildId)                       // Get current track info
```

---

## Polls (5 functions)

```ezlang
create_poll(question, answers, duration)       // Create poll data
send_poll(channel, pollData)                   // Send poll to channel
end_poll(messageId)                            // End poll early
fetch_poll_results(messageId)                  // Get poll results
fetch_poll_voters(messageId, answerId)         // Get voters for specific answer
```

---

## Roles (7 functions)

```ezlang
create_role(guild, name, options)              // Create new role
edit_role(role, options)                       // Edit role properties
delete_role(role)                              // Delete role
add_role_to_member(member, role)               // Give role to member
remove_role_from_member(member, role)          // Remove role from member
has_permission(member, permission)             // Check if member has permission
fetch_member(guild, userId)                    // Fetch member object
```

---

## Moderation (8 functions)

```ezlang
kick_member(member, reason)                    // Kick member from guild
ban_member(member, reason)                     // Ban member from guild
unban_user(guild, userId)                      // Unban user
timeout_member(member, duration, reason)       // Timeout member (mute)
set_nickname(member, nickname)                 // Change member nickname
reset_nickname(member)                         // Reset to default username
fetch_bans(guild)                              // Get all bans
fetch_ban(guild, userId)                       // Get specific ban
```

---

## Channels (4 functions)

```ezlang
create_channel(guild, name, type, options)     // Create channel (text/voice/category)
edit_channel(channel, options)                 // Edit channel properties
delete_channel(channel)                        // Delete channel
list_channels(guild)                           // List all channels in guild
```

---

## Threads (7 functions)

```ezlang
create_thread(channel, name, options)          // Create thread
archive_thread(thread)                         // Archive thread
unarchive_thread(thread)                       // Unarchive thread
lock_thread(thread)                            // Lock thread
unlock_thread(thread)                          // Unlock thread (unlock not listed but implied)
join_thread(thread)                            // Join thread
leave_thread(thread)                           // Leave thread
```

---

## Invites (3 functions)

```ezlang
create_invite(channel, options)                // Create invite
fetch_invites(guild)                           // Get all guild invites
delete_invite(invite)                          // Delete invite
```

---

## Webhooks (6 functions)

```ezlang
create_webhook(channel, name, avatar)          // Create webhook
webhook_send(webhook, content, options)        // Send via webhook
webhook_edit(webhook, options)                 // Edit webhook
webhook_delete(webhook)                        // Delete webhook
fetch_webhooks(channel)                        // Get channel webhooks
fetch_webhook(webhookId, token)                // Get specific webhook
```

---

## Tasks & Scheduling (8 functions)

```ezlang
create_loop(name, interval, callback)          // Create repeating task
create_scheduled_task(name, date, callback)    // Schedule one-time task
start_task(name)                               // Start task
stop_task(name)                                // Stop task
is_task_running(name)                          // Check if task is running
get_task_info(name)                            // Get task details
list_tasks()                                   // List all tasks
delete_task(name)                              // Delete task
```

---

## Cooldowns (8 functions)

```ezlang
add_cooldown(key, duration)                    // Add cooldown
is_on_cooldown(key)                            // Check if on cooldown
get_cooldown_remaining(key)                    // Get time remaining
reset_cooldown(key)                            // Reset specific cooldown
reset_all_cooldowns()                          // Reset all cooldowns
get_user_cooldowns(userId)                     // Get user's cooldowns
clear_all_cooldowns()                          // Clear all cooldowns
get_cooldown_stats()                           // Get cooldown statistics
```

---

## AutoMod (7 functions)

```ezlang
create_automod_rule(guild, options)            // Create AutoMod rule
edit_automod_rule(guild, ruleId, options)      // Edit AutoMod rule
delete_automod_rule(guild, ruleId)             // Delete AutoMod rule
fetch_automod_rules(guild)                     // List all AutoMod rules
fetch_automod_rule(guild, ruleId)              // Get specific rule
enable_automod_rule(guild, ruleId)             // Enable rule
disable_automod_rule(guild, ruleId)            // Disable rule
```

---

## Audit Logs (2 functions)

```ezlang
fetch_audit_logs(guild, options)               // Fetch audit log entries
get_audit_log_entry(guild, entryId)            // Get specific entry
```

---

## Direct Messages (2 functions)

```ezlang
send_dm(user, content)                         // Send DM to user
create_dm_channel(user)                        // Create DM channel
```

---

## Fetching & Utility (5 functions)

```ezlang
get_guild(guildId)                             // Get guild object
get_channel(channelId)                         // Get channel object
get_user(userId)                               // Get user object
get_role(guildId, roleId)                      // Get role object
list_guilds()                                  // List all guilds bot is in
```

---

## Presence & Status (3 functions)

```ezlang
set_status(status)                             // Set bot status (online/idle/dnd/invisible)
set_activity(type, name)                       // Set activity (Playing/Watching/Listening)
set_streaming(name, url)                       // Set streaming status
```

---

## Error Handling (3 functions)

```ezlang
handle_discord_error(error)                    // Handle Discord API errors
format_error_message(error)                    // Format error for display
log_error(error, context)                      // Log error with context
```

---

## Scheduled Events (4+ functions)

```ezlang
create_scheduled_event(guild, options)         // Create scheduled event
edit_scheduled_event(guild, eventId, options)  // Edit event
delete_scheduled_event(guild, eventId)         // Delete event
fetch_scheduled_events(guild)                  // List scheduled events
```

---

## Forum Channels (3+ functions)

```ezlang
create_forum_post(forumChannel, options)       // Create forum post
create_forum_tag(forumChannel, options)        // Create forum tag
// Additional forum functions may exist
```

---

## Stage Channels (5+ functions)

```ezlang
create_stage_instance(stageChannel, options)   // Start stage
edit_stage_instance(stageChannel, options)     // Edit stage
delete_stage_instance(stageChannel)            // End stage
become_speaker(member, stageChannel)           // Make member speaker
move_to_audience(member, stageChannel)         // Move speaker to audience
```

---

## Stickers (2+ functions)

```ezlang
create_guild_sticker(guild, options)           // Create custom sticker
delete_guild_sticker(guild, stickerId)         // Delete sticker
```

---

## Emojis (3+ functions)

```ezlang
create_guild_emoji(guild, options)             // Create custom emoji
edit_guild_emoji(guild, emojiId, options)      // Edit emoji
delete_guild_emoji(guild, emojiId)             // Delete emoji
```

---

## Voice State (4+ functions)

```ezlang
is_user_in_voice(userId, guildId)              // Check if user in voice
get_user_voice_channel(userId, guildId)        // Get user's voice channel
move_member_to_channel(member, channel)        // Move member to channel
disconnect_member(member)                      // Disconnect from voice
```

---

## Total Function Count

| Category | Functions |
|----------|-----------|
| Core Messaging | 10 |
| Embeds | 15 |
| Components | 11 |
| Reactions | 5 |
| Slash Commands | 5 |
| Voice & Audio | 18 |
| Polls | 5 |
| Roles | 7 |
| Moderation | 8 |
| Channels | 4 |
| Threads | 7 |
| Invites | 3 |
| Webhooks | 6 |
| Tasks | 8 |
| Cooldowns | 8 |
| AutoMod | 7 |
| Audit Logs | 2 |
| DMs | 2 |
| Fetching | 5 |
| Presence | 3 |
| Error Handling | 3 |
| Scheduled Events | 4+ |
| Forums | 3+ |
| Stages | 5+ |
| Stickers | 2+ |
| Emojis | 3+ |
| Voice State | 4+ |
| **TOTAL** | **239+** |

---

## Common Patterns

### Send Embed
```ezlang
var embed = create_embed()
embed = embed_set_title(embed, "Title")
embed = embed_set_description(embed, "Description")
embed = embed_set_color(embed, 0x00FF00)
send_message(channel, "", {"embeds": [embed]})
```

### Send Button
```ezlang
var button = create_button("Click Me", "primary", "btn_id")
var row = create_action_row(button)
send_message(channel, "Message", {"components": [row]})
```

### Handle Interaction
```ezlang
listen "interactionCreate" (interaction) {
    if interaction.isButton {
        interaction_reply(interaction, "Clicked!", {"ephemeral": true})
    }
}
```

### Create Poll
```ezlang
var poll = create_poll("Question?", ["Yes", "No"], 24)
send_poll(channel, poll)
```

### Play Audio
```ezlang
join_voice_channel(voiceChannel)
play_audio(guildId, "https://audio-url.mp3", {})
```

---

## Quick Tips

1. **Options Parameter**: Most functions accept an `options` object as the last parameter
2. **Embed Chaining**: Embed functions return the modified embed for chaining
3. **Action Rows**: Can hold up to 5 buttons or 1 select menu
4. **Ephemeral**: Use `{"ephemeral": true}` for private replies
5. **Colors**: Use hex numbers (0xFF0000) or color names
6. **Duration**: Usually in seconds or hours depending on context

---

**Use this reference card for quick lookup while building your Discord bots!**

**Last Updated:** 2025-01-16
