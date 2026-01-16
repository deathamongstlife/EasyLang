# EasyLang Discord Bot - Quick Start Guide

## Get Started in 5 Minutes

### Step 1: Get Discord Bot Token
1. Go to https://discord.com/developers/applications
2. Create New Application → Add Bot
3. Copy bot token
4. Enable all intents

### Step 2: Create Your Bot

Create `my-bot.ez`:
```easylang
use discord

var token = env("DISCORD_BOT_TOKEN")
discord_init(token)

listen ready as client {
    print("Bot online: " + client.user.tag)
}

listen messageCreate as msg {
    if msg.content == "!ping" {
        reply msg, "Pong!"
    }
}

discord_start()
```

### Step 3: Run It
```bash
export DISCORD_BOT_TOKEN="your-token"
ezlang my-bot.ez
```

Done! Your bot responds to !ping

## See All Features

Check `test-bot.ez` for examples of:
- All 79 events
- Buttons & menus
- Threads & polls
- Voice features
- AutoMod
- And more!

Run test bot:
```bash
export DISCORD_BOT_TOKEN="your-token"
ezlang test-bot.ez
```
