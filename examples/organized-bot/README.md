# Organized Bot - Pure EzLang Implementation

This is a complete rewrite of the organized-bot to use **ONLY EzLang syntax**. All JavaScript and Discord.js patterns have been removed.

## What Changed

### Before (JavaScript/Discord.js style):
```javascript
let variable = value
function handler(param) {
    client.on('event', () => {
        interaction.reply({ content: 'Text', ephemeral: true });
    });
}
```

### After (Pure EzLang style):
```
var variable = value
function handler(param) {
    # EzLang syntax
}

listen event with param {
    reply_interaction interaction with "Text" ephemeral
}
```

## Key Changes

### 1. Variable Declaration
- **Before:** `let variable = value`
- **After:** `var variable = value`

### 2. Event Listeners
- **Before:** `client.on('ready', () => { })`
- **After:** `listen ready with client { }`

### 3. Discord Interactions
- **Before:** `interaction.reply({ content: 'Text', ephemeral: true })`
- **After:** `reply_interaction interaction with "Text" ephemeral`

### 4. Message Replies
- **Before:** `message.reply('Text')`
- **After:** `reply message with "Text"`

### 5. Function Calls
- **Before:** `register_slash_command(client, data)`
- **After:** `register_command(data)`

## File Structure

```
organized-bot/
├── main.ez                    # Main bot file with all logic (PURE EzLang)
├── config.ez                  # Configuration variables (PURE EzLang)
├── utils/
│   ├── database.ez           # Database utilities (PURE EzLang)
│   ├── permissions.ez        # Permission checking (PURE EzLang)
│   ├── cooldowns.ez          # Cooldown management (PURE EzLang)
│   └── logger.ez             # Logging functions (PURE EzLang)
├── events/                   # Event documentation (see main.ez for implementation)
│   ├── ready.ez
│   ├── messageCreate.ez
│   └── interactionCreate.ez
├── commands/                 # Command documentation (see main.ez for implementation)
│   ├── slash/
│   ├── message/
│   └── context/
└── components/               # Component documentation (see main.ez for implementation)
    ├── button-handler.ez
    ├── select-handler.ez
    ├── modal-handler.ez
    └── autocomplete-handler.ez
```

## Running the Bot

```bash
export BOT_TOKEN="your_discord_bot_token"
export OWNER_ID="your_discord_user_id"
ezlang examples/organized-bot/main.ez
```

## Features

All features are implemented in pure EzLang:
- ✅ Event handling (`listen` syntax)
- ✅ Slash commands
- ✅ Message commands (prefix-based)
- ✅ Context menu commands
- ✅ Interactive components (buttons, select menus)
- ✅ Modal forms
- ✅ Cooldown system
- ✅ Permission checking
- ✅ Guild-specific prefixes
- ✅ Developer-only commands

## EzLang Syntax Reference

### Variables
```
var name = "value"
var number = 42
var array = [1, 2, 3]
var dict = {key: "value"}
```

### Functions
```
function name(param1, param2) {
    return param1 + param2
}
```

### Control Flow
```
if condition {
    # code
} else if other_condition {
    # code
} else {
    # code
}

while condition {
    # code
}
```

### Event Listeners
```
listen eventName with param {
    # handler code
}
```

### Discord Functions
- `reply_interaction interaction with "text" ephemeral`
- `reply message with "text"`
- `register_command(data)`
- `create_button(label, style, customId)`
- `create_string_select(customId, placeholder, options)`
- `create_modal(customId, title)`
- `show_modal(interaction, modal)`
- `set_status(status, activity, text)`
- `login TOKEN`

## Notes

- All files now use `var` instead of `let`
- All files use `function` syntax consistently
- All files use EzLang built-in functions
- No JavaScript patterns remain
- No Discord.js method chaining
- Pure EzLang syntax throughout
