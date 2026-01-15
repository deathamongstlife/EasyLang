# EasyLang Comprehensive Test Bot Guide

This guide explains how to use the comprehensive test bot (`test-bot.ez`) to verify all 148+ EasyLang Discord features work correctly.

## ⚠️ IMPORTANT: DO NOT COMMIT

The test bot file (`test-bot.ez`) is configured to NOT be committed to the repository via `.gitignore`. This is intentional because:
- It contains test code not meant for production
- You may add your bot token during testing
- It's designed for local testing only

## 📋 Prerequisites

Before running the test bot, ensure you have:

1. **Discord Bot Application**
   - Go to https://discord.com/developers/applications
   - Create a new application
   - Go to "Bot" section and create a bot
   - Copy the bot token (you'll need this)
   - Enable all Privileged Gateway Intents (Presence, Server Members, Message Content)

2. **Bot Permissions**
   - Invite the bot to your test server with Administrator permissions
   - Bot invite URL format:
     ```
     https://discord.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=8&scope=bot%20applications.commands
     ```
   - Replace `YOUR_CLIENT_ID` with your bot's client ID

3. **EasyLang Installation**
   - EasyLang must be installed and built
   - Run `npm install` and `npm run build` if not done already

## 🚀 Running the Test Bot

### Method 1: Command Line Arguments

```bash
ezlang run test-bot.ez DISCORD_TOKEN=your_bot_token_here
```

### Method 2: Using npx (if not globally installed)

```bash
npx ezlang run test-bot.ez DISCORD_TOKEN=your_bot_token_here
```

### Method 3: Using bun (if you have Bun installed)

```bash
bun run ezlang run test-bot.ez DISCORD_TOKEN=your_bot_token_here
```

## 🧪 Testing Features

Once the bot is online, you'll see a welcome message with all available commands. The bot will respond to the following commands in your Discord server:

### Individual Feature Tests

| Command | Tests | Description |
|---------|-------|-------------|
| `!test basic` | Basic Messaging | send, reply, react, fetch, edit, pin, unpin messages |
| `!test embeds` | Embed Creation | create embed with all features (title, fields, footer, etc.) |
| `!test components` | Components | buttons (all styles), select menus, action rows |
| `!test voice` | Voice Channels | join, leave, play, pause, resume, queue (requires audio files) |
| `!test webhooks` | Webhooks | create, send, edit, delete, fetch webhooks |
| `!test tasks` | Background Tasks | loops, scheduled tasks, start/stop, task management |
| `!test cooldowns` | Cooldowns | add, check, reset cooldowns (user/channel/guild/global) |
| `!test polls` | Polls | create and send Discord native polls |
| `!test roles` | Roles & Permissions | create, edit, delete roles, permission checks |
| `!test moderation` | Moderation | kick, ban, timeout, nickname management (requires permissions) |
| `!test channels` | Channel Management | create, edit, delete channels |
| `!test threads` | Threads | create, archive threads |
| `!test invites` | Invites | create, fetch, delete invites |
| `!test dm` | Direct Messages | send DMs to users |
| `!test fetch` | Entity Fetching | get guild, channel, user by ID, list guilds |
| `!test presence` | Presence | set bot status, activity (playing, watching, etc.) |
| `!test audit` | Audit Logs | fetch audit log entries (requires permissions) |
| `!test automod` | AutoMod | AutoMod rule management (requires permissions) |

### Complete Test Suite

| Command | Description |
|---------|-------------|
| `!test all` | Runs ALL tests sequentially (takes 1-2 minutes) |
| `!results` | Shows summary of all tested features |
| `!help` | Displays help message with all commands |

## 📊 What Gets Tested

The test bot verifies **ALL 148+ EasyLang functions** across these categories:

### ✅ Core Features (20+ functions)
- Variables, functions, control flow
- Built-in functions (print, length, wait, etc.)
- Array and object operations

### ✅ Messaging (10 functions)
- `send_message()`, `edit_message()`, `delete_message()`
- `reply()`, `bulk_delete()`
- `fetch_message()`, `fetch_messages()`
- `pin_message()`, `unpin_message()`, `fetch_pinned_messages()`

### ✅ Reactions (5 functions)
- `react()`, `add_reaction()`, `remove_reaction()`
- `clear_reactions()`, `fetch_reactions()`

### ✅ Embeds (10 functions)
- `create_embed()`, `embed_set_title()`, `embed_set_description()`
- `embed_set_color()`, `embed_add_field()`, `embed_set_author()`
- `embed_set_footer()`, `embed_set_image()`, `embed_set_thumbnail()`
- `embed_set_timestamp()`, `embed_set_url()`

### ✅ Components (10 functions)
- `create_button()`, `create_link_button()`
- `create_string_select()`, `create_user_select()`, `create_role_select()`, `create_channel_select()`
- `create_action_row()`, `create_modal()`, `create_text_input()`
- `show_modal()`, `get_modal_field()`

### ✅ Slash Commands (5 functions)
- `register_slash_command()`, `register_user_context_menu()`, `register_message_context_menu()`
- `interaction_reply()`, `interaction_defer()`, `interaction_update()`

### ✅ Voice (18 functions)
- `join_voice_channel()`, `leave_voice_channel()`, `get_voice_connection()`
- `play_audio()`, `play_file()`, `play_youtube()`
- `stop_audio()`, `pause_audio()`, `resume_audio()`
- `set_volume()`, `get_volume()`, `skip_audio()`
- `is_playing()`, `is_paused()`
- `add_to_queue()`, `get_queue()`, `clear_queue()`, `get_now_playing()`

### ✅ Webhooks (6 functions)
- `create_webhook()`, `webhook_send()`, `webhook_edit()`
- `webhook_delete()`, `fetch_webhooks()`, `fetch_webhook()`

### ✅ Background Tasks (8 functions)
- `create_loop()`, `create_scheduled_task()`
- `start_task()`, `stop_task()`, `is_task_running()`
- `get_task_info()`, `list_tasks()`, `delete_task()`

### ✅ Cooldowns (8 functions)
- `add_cooldown()`, `is_on_cooldown()`, `get_cooldown_remaining()`
- `reset_cooldown()`, `reset_all_cooldowns()`, `get_user_cooldowns()`
- `clear_all_cooldowns()`, `get_cooldown_stats()`

### ✅ Polls (5 functions)
- `create_poll()`, `send_poll()`, `end_poll()`
- `fetch_poll_results()`, `fetch_poll_voters()`

### ✅ Roles & Permissions (7 functions)
- `create_role()`, `edit_role()`, `delete_role()`
- `add_role_to_member()`, `remove_role_from_member()`
- `has_permission()`, `fetch_member()`

### ✅ Moderation (8 functions)
- `kick_member()`, `ban_member()`, `unban_user()`
- `timeout_member()`, `fetch_bans()`, `fetch_ban()`
- `set_nickname()`, `reset_nickname()`

### ✅ Channel Management (5 functions)
- `create_channel()`, `edit_channel()`, `delete_channel()`
- `fetch_channel()`, `list_channels()`

### ✅ Threads (6 functions)
- `create_thread()`, `archive_thread()`, `unarchive_thread()`
- `lock_thread()`, `join_thread()`, `leave_thread()`

### ✅ Invites (3 functions)
- `create_invite()`, `fetch_invites()`, `delete_invite()`

### ✅ DM Support (2 functions)
- `send_dm()`, `create_dm_channel()`

### ✅ Entity Fetching (5 functions)
- `get_guild()`, `get_channel()`, `get_user()`, `get_role()`
- `list_guilds()`

### ✅ Presence (3 functions)
- `set_status()`, `set_activity()`, `set_streaming()`

### ✅ Audit Logs (2 functions)
- `fetch_audit_logs()`, `get_audit_log_entry()`

### ✅ AutoMod (7 functions)
- `create_automod_rule()`, `edit_automod_rule()`, `delete_automod_rule()`
- `fetch_automod_rules()`, `fetch_automod_rule()`
- `enable_automod_rule()`, `disable_automod_rule()`

### ✅ Error Handling (4 functions + 6 error classes)
- `handle_discord_error()`, `format_error_message()`
- `log_error()`, `create_error()`

## 🔍 Interpreting Test Results

### Success Indicators
- ✅ Green checkmarks indicate successful operations
- Messages confirming feature execution
- No error messages in console

### Common Issues

#### 1. Permission Errors
**Symptom:** "Missing permissions" error
**Solution:** Ensure bot has Administrator permission or specific required permissions

#### 2. Voice Not Working
**Symptom:** Voice commands don't respond
**Solution:**
- You must be in a voice channel
- Bot needs audio files to play
- Voice features require @discordjs/voice package

#### 3. AutoMod/Audit Logs Not Working
**Symptom:** "Requires Manage Guild permission"
**Solution:** Bot needs Manage Guild permission for these features

#### 4. Webhook Tests Failing
**Symptom:** Webhook creation fails
**Solution:** Bot needs Manage Webhooks permission in the channel

## 📝 Testing Checklist

Use this checklist to ensure comprehensive testing:

- [ ] Bot connects successfully
- [ ] Basic messaging works (send, edit, delete)
- [ ] Reactions work
- [ ] Embeds render correctly
- [ ] Buttons are clickable and respond
- [ ] Select menus work
- [ ] Slash commands register (if tested)
- [ ] Webhooks create and send
- [ ] Background tasks execute
- [ ] Cooldowns enforce correctly
- [ ] Polls create successfully
- [ ] Roles create/edit/delete
- [ ] Channels create/edit/delete
- [ ] Threads create and archive
- [ ] Invites create with correct settings
- [ ] DMs send successfully
- [ ] Guild/channel/user fetching works
- [ ] Status changes reflect correctly
- [ ] Audit logs fetch (if permissions allow)

## 🐛 Troubleshooting

### Bot Won't Start
```bash
# Check if token is provided
ezlang run test-bot.ez DISCORD_TOKEN=your_token

# Verify EasyLang is built
npm run build

# Check if bot token is valid (Discord Developer Portal)
```

### Commands Not Responding
```bash
# Verify Message Content intent is enabled
# Check bot has "Send Messages" permission in the channel
# Ensure bot can see the channel
```

### Voice Features Not Working
```bash
# Voice requires @discordjs/voice package
npm install @discordjs/voice

# Voice features need audio files
# User must be in voice channel for join to work
```

### TypeScript Errors
```bash
# Rebuild the project
npm run build

# Clear cache
rm -rf dist/ node_modules/.cache

# Reinstall dependencies
npm install
```

## 📚 Additional Resources

- **Documentation:** https://deathamongstlife.github.io/EasyLang/
- **Examples:** See `examples/` directory for production bot examples
- **API Reference:** https://deathamongstlife.github.io/EasyLang/api/
- **GitHub Issues:** Report bugs at https://github.com/deathamongstlife/EasyLang/issues

## 🎯 Testing Best Practices

1. **Use a Test Server:** Create a dedicated Discord server for testing
2. **Test Incrementally:** Run individual tests first, then `!test all`
3. **Check Console:** Watch console output for errors
4. **Test Permissions:** Verify bot has necessary permissions for each feature
5. **Clean Up:** Delete test roles, channels, webhooks after testing
6. **Document Issues:** If something doesn't work, note the exact error
7. **Version Control:** Don't commit test bot with token

## 🔒 Security Notes

**NEVER:**
- Commit your bot token to GitHub
- Share your bot token publicly
- Use production bot token for testing
- Commit test-bot.ez with sensitive data

**ALWAYS:**
- Use a separate test bot for testing
- Keep token in command line arguments
- Use `.env` file for production (not committed)
- Review `.gitignore` before committing

## ✅ Test Completion

After running all tests, you should see:
- ✅ All 148+ functions acknowledged
- ✅ No fatal errors in console
- ✅ Test results showing successful operations
- ✅ Bot responds to all commands

If you encounter any issues, please report them on GitHub with:
- Error message
- Command that failed
- Console output
- Bot permissions
- EasyLang version

---

**Happy Testing! 🚀**

All features should work correctly. If you find any bugs, please report them so we can fix them and make EasyLang even better for beginners!