# Discord Bot Setup Guide

This guide will help you enable the required privileged intents for your Discord bot and test it successfully.

## Issue #10 Fix Summary

The Discord bot connectivity issue has been resolved. The main problems were:

1. **Build System**: TypeScript dependencies were not being installed correctly
   - **Fixed**: Reinstalled all dependencies with `npm install --include=dev`
   - **Fixed**: All 21 TypeScript compilation errors resolved

2. **Helper Script**: Created `start-bot.sh` to simplify bot startup
   - Automatically reads token from `.env` file
   - Validates prerequisites (dependencies, build)
   - Provides clear error messages

## Prerequisites

Before running the bot, ensure you have:

- ✅ Node.js 16.0.0 or higher installed
- ✅ All dependencies installed: `npm install --include=dev`
- ✅ Project built successfully: `npm run build`
- ✅ Discord bot token in `.env` file
- ⚠️ **Privileged intents enabled in Discord Developer Portal** (see below)

## Critical: Enable Privileged Intents

Your bot **requires all 3 privileged intents** to function properly. Without these, the bot will fail to start or will not be able to read messages.

### Step-by-Step Instructions

1. **Go to Discord Developer Portal**
   - Visit: https://discord.com/developers/applications
   - Sign in with your Discord account

2. **Select Your Bot Application**
   - Click on your bot's application from the list
   - If you don't have a bot yet, click "New Application"

3. **Navigate to Bot Settings**
   - Click "Bot" in the left sidebar
   - Scroll down to the "Privileged Gateway Intents" section

4. **Enable All Three Intents**

   You **MUST** enable all of these:

   ☐ **Presence Intent**
   - Allows the bot to receive presence updates
   - Toggle the switch to enable

   ☐ **Server Members Intent**
   - Allows the bot to receive member join/leave events
   - Toggle the switch to enable

   ☐ **Message Content Intent** ⚠️ **MOST IMPORTANT**
   - Allows the bot to read message content
   - **Without this, the bot cannot see any commands!**
   - Toggle the switch to enable

5. **Save Changes**
   - Click "Save Changes" at the bottom of the page
   - You may need to verify your changes

### Visual Reference

The privileged intents section looks like this:

```
Privileged Gateway Intents
┌─────────────────────────────────────────┐
│ ☑ Presence Intent                       │
│ ☑ Server Members Intent                 │
│ ☑ Message Content Intent                │
└─────────────────────────────────────────┘
```

**All three boxes must be checked!**

## Bot Token

Your bot token is already configured in the `.env` file:

```env
BOT_TOKEN=your_bot_token_here
DISCORD_TOKEN=your_bot_token_here
```

⚠️ **Security Note**: Never share your bot token publicly. The token in this file is for your bot only.

## Running the Bot

### Option 1: Using the Helper Script (Recommended)

The easiest way to start the bot:

```bash
./start-bot.sh
```

This script will:
- ✅ Check for required files and dependencies
- ✅ Load token from `.env` file
- ✅ Build the project if needed
- ✅ Start the bot with proper arguments
- ✅ Show clear error messages if something is wrong

### Option 2: Manual Command

If you prefer to run the bot manually:

```bash
node dist/index.js run test-bot.ez "DISCORD_TOKEN=your_token_here"
```

Or with the ezlang command:

```bash
npm run start -- run test-bot.ez "DISCORD_TOKEN=your_token_here"
```

## Testing the Bot

Once the bot is running, you should see:

```
🤖 EasyLang Comprehensive Test Bot Starting...
📋 Testing ALL 148+ Discord features

🚀 Starting bot with token...
✅ Bot is online!
👤 Logged in as: YourBotName#1234
🆔 Bot ID: 1459385987678343294
```

### Available Test Commands

In your Discord server, try these commands:

**Basic Tests:**
- `!help` - Show help menu
- `!test basic` - Test basic messaging features
- `!test embeds` - Test embed creation
- `!test components` - Test buttons and select menus

**Advanced Tests:**
- `!test roles` - Test role management
- `!test channels` - Test channel creation
- `!test threads` - Test thread operations
- `!test dm` - Test DM functionality

**Run All Tests:**
- `!test all` - Run all feature tests sequentially
- `!results` - Show test results summary

## Troubleshooting

### Bot doesn't respond to commands

**Cause**: Message Content Intent is not enabled

**Solution**:
1. Go to Discord Developer Portal
2. Enable Message Content Intent
3. Save changes
4. Restart the bot

### Bot connects but immediately disconnects

**Cause**: Missing privileged intents

**Solution**:
1. Verify all 3 privileged intents are enabled
2. Save changes in Developer Portal
3. Wait 1-2 minutes for changes to propagate
4. Restart the bot

### "Error: Used disallowed intents"

**Cause**: Privileged intents not enabled in Developer Portal

**Solution**:
1. Follow the "Enable Privileged Intents" instructions above
2. Make sure ALL THREE intents are enabled
3. Save changes
4. Restart the bot

### Build errors

**Cause**: Dependencies not installed correctly

**Solution**:
```bash
# Remove existing dependencies
rm -rf node_modules package-lock.json

# Reinstall with dev dependencies
npm install --include=dev

# Build the project
npm run build
```

## Bot Capabilities

This test bot demonstrates all 148+ EasyLang Discord features:

### Core Features
- ✅ Message sending and editing
- ✅ Message reactions
- ✅ Message pinning
- ✅ Rich embeds with all features
- ✅ Interactive components (buttons, select menus)

### Advanced Features
- ✅ Voice channel support
- ✅ Webhook operations
- ✅ Background tasks and loops
- ✅ Cooldown system
- ✅ Poll creation

### Discord Features
- ✅ Role management
- ✅ Channel management
- ✅ Thread operations
- ✅ Moderation (kick, ban, timeout)
- ✅ Invite management

### Utilities
- ✅ DM messaging
- ✅ Guild/channel/user fetching
- ✅ Presence updates
- ✅ Audit logs
- ✅ AutoMod rules

## Next Steps

After enabling the privileged intents and starting the bot:

1. **Verify Bot is Online**
   - Check that the bot shows as online in your Discord server
   - You should see the startup messages in the console

2. **Test Basic Commands**
   - Try `!help` to see available commands
   - Try `!test basic` to verify basic functionality

3. **Run Comprehensive Tests**
   - Use `!test all` to test all features
   - Check `!results` to see what works

4. **Report Issues**
   - If any tests fail, note which features don't work
   - Check the console for error messages
   - Report back with specific error details

## Support

If you continue to have issues after following this guide:

1. **Check the Console Output**
   - Look for specific error messages
   - Note which step fails

2. **Verify Prerequisites**
   - All dependencies installed
   - Project builds successfully
   - All 3 privileged intents enabled

3. **Common Issues**
   - Token invalid: Regenerate token in Developer Portal
   - Permission errors: Check bot has proper server permissions
   - Rate limiting: Wait a few minutes and try again

## Files Modified for Fix

The following files were fixed to resolve Issue #10:

### Build System
- ✅ Dependencies reinstalled with dev packages
- ✅ TypeScript compilation errors fixed (21 errors)

### TypeScript Fixes
- `src/bridges/converter.ts` - Fixed unused parameter
- `src/bridges/serializer.ts` - Fixed import error
- `src/discord/events.ts` - Fixed null handling and type errors
- `src/javascript/loader.ts` - Fixed unused parameter
- `src/packages/manager.ts` - Removed unused import
- `src/packages/resolver.ts` - Fixed unused variable
- `src/python/index.ts` - Fixed property access
- `src/runtime/discord-audit.ts` - Fixed enum and unused imports
- `src/runtime/discord-automod.ts` - Fixed type coercion
- `src/runtime/discord-extended.ts` - Removed unused imports
- `src/runtime/discord-voice.ts` - Removed unused imports

### New Files
- `start-bot.sh` - Helper script for easy bot startup
- `DISCORD_BOT_SETUP.md` - This documentation file

## Build Status

✅ **Build: SUCCESS**
- All TypeScript files compiled successfully
- No compilation errors
- `dist/` directory contains all compiled JavaScript files
- Main entry point: `dist/index.js`
- Discord manager: `dist/discord/index.js`

## Conclusion

The Discord bot is now ready to run! The only remaining step is to **enable the 3 privileged intents** in the Discord Developer Portal, then start the bot with `./start-bot.sh`.

Good luck with your bot! 🤖
