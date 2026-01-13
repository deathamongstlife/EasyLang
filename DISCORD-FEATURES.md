# Discord Features in EzLang - Complete Documentation

## Current Implementation Status

### ✅ Implemented Features

#### 1. **Bot Connection & Authentication**
- `bot_start(token)` - Connect bot to Discord
- Automatic login handling
- Error detection (invalid token, missing intents)
- Graceful shutdown

#### 2. **Discord.js Client Configuration**
- **Intents Configured:**
  - `Guilds` - Access server information
  - `GuildMessages` - Receive message events
  - `MessageContent` - Read message content (required for commands)

#### 3. **Event System** (Partial)
- `ready` event - Bot successfully connected
- `error` event - Connection/runtime errors
- Event handler registration via `DiscordManager`

#### 4. **Message Command Handler** (Built into bot_start)
The bot includes a comprehensive message command handler with 25+ built-in commands:

**Basic Commands:**
- `!ping` - Test bot responsiveness
- `!help` - Show all available commands
- `!info` - Display bot information
- `!dice` - Roll a dice (1-6)
- `!flip` - Flip a coin
- `!random` - Generate random number

**Discord API Feature Tests:**
- `!testembed` - Rich embed demonstration
- `!testbuttons` - Interactive button components
- `!testselect` - Select menu demo (single/multi)
- `!testmodal` - Modal form popup
- `!testall` - Combined components demo
- `!testuserselect` - User picker menu
- `!testroleselect` - Role picker menu
- `!testchannelselect` - Channel picker menu

**Package Integration Tests:**
- `!testmoment` - Date/time with moment.js (requires: `bun add moment`)
- `!testaxios` - HTTP requests with axios (requires: `bun add axios`)
- `!testlodash` - Utility functions with lodash (requires: `bun add lodash`)
- `!testpython` - Python math module (requires Python bridge)
- `!testrequests` - Python HTTP requests (requires Python bridge)

**Admin Commands:**
- `!setname <name>` - Change bot username
- `!setstatus <status>` - Set online/idle/dnd/invisible
- `!setactivity <type> <text>` - Set playing/watching/listening
- `!setavatar <url>` - Change bot avatar
- `!installjs <package>` - Show JS package installation
- `!installpy <package>` - Show Python package installation

#### 5. **Interactive Components Support**
- Button handlers (Primary, Secondary, Success, Danger, Link styles)
- String select menus (single and multi-select)
- User select menus
- Role select menus
- Channel select menus
- Modal form submissions

#### 6. **Package Integration**
- Full npm package integration via `require()`
- Graceful handling of missing packages
- Error messages with installation instructions
- Support for async operations
- Examples for popular packages (moment, axios, lodash)

### ⚠️ Partially Implemented

#### 1. **listen Keyword**
- **Status**: Defined in lexer/parser but not connected to runtime
- **Current Behavior**: Bot connects but doesn't process messages
- **Workaround**: Messages sent, but responses require TypeScript layer

### ❌ Not Yet Implemented

#### 1. **Message Event Handling in EzLang**
```ezlang
// This syntax exists but isn't functional yet:
listen 'messageCreate' {
    // Handle message
}
```

#### 2. **Slash Commands**
- No slash command registration
- No interaction handling
- No autocomplete

#### 3. **Advanced Discord Features**
- Embeds
- Buttons/Components
- Select menus
- Modals
- Voice channels
- Webhooks
- Permissions management
- Role management
- Channel creation/editing

---

## What Works Right Now

### ✅ Bot Connection Example

```ezlang
var bot_token = get_argument("BOT_TOKEN", "")

if bot_token != "" {
    print("Connecting to Discord...")
    bot_start(bot_token)
    print("Bot is online!")

    // Bot stays online and can see events
    // But cannot respond to them yet in pure EzLang
}
```

**Result**: Bot appears online in Discord, shows in member list, but doesn't respond to commands.

---

## Discord.js Version & Capabilities

### Current Discord.js Version: **v14.14.1**

This version supports ALL modern Discord features:

#### ✅ Available in Discord.js (Not yet in EzLang)

1. **Messages**
   - Send, edit, delete messages
   - Message threads
   - Reactions
   - Attachments
   - Embeds with fields, images, footers

2. **Interactions**
   - Slash commands (/)
   - Context menu commands
   - Buttons
   - Select menus (string, role, channel, user)
   - Modals (popup forms)

3. **Voice**
   - Join/leave voice channels
   - Play audio streams
   - Voice state updates

4. **Permissions**
   - Check permissions
   - Role management
   - Channel permissions

5. **Guild Management**
   - Create channels
   - Edit server settings
   - Manage members
   - Bans, kicks, timeouts

6. **Advanced**
   - Webhooks
   - Stage channels
   - Forum channels
   - Auto-moderation
   - Scheduled events

---

## Why Your Bot Doesn't Respond

### The Problem

When you run:
```bash
node dist/index.js run examples/live-discord-bot.ez BOT_TOKEN=your_token
```

The bot:
1. ✅ Connects successfully
2. ✅ Appears online in Discord
3. ✅ Logs "Bot is online"
4. ❌ **But doesn't have messageCreate event handler**

### The Missing Piece

The current EzLang implementation needs this in `src/runtime/index.ts`:

```typescript
// After bot_start() is called, register messageCreate handler
discordManager.registerEventHandler('messageCreate', async (message: Message) => {
    // Parse EzLang commands
    // Execute EzLang functions
    // Send responses
});
```

**This TypeScript-level integration is not yet implemented.**

---

## Workaround: TypeScript Integration

To make your bot respond right now, you would need to:

### Option 1: Extend Runtime (TypeScript)

Edit `src/runtime/builtins.ts`:

```typescript
function createBotStartFunction(discordManager: DiscordManager) {
  return makeNativeFunction('bot_start', async (args: RuntimeValue[]) => {
    // ... existing code ...

    // Add message handler
    const client = discordManager.getClient();
    client.on('messageCreate', async (message) => {
      if (message.author.bot) return;
      if (message.content === '!ping') {
        await message.reply('Pong!');
      }
    });

    return makeBoolean(true);
  });
}
```

### Option 2: Create Native Discord Bot (TypeScript)

Create `examples/native-bot.ts`:

```typescript
import { Client, GatewayIntentBits } from 'discord.js';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.on('ready', () => {
  console.log(`Logged in as ${client.user?.tag}!`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.content === '!ping') {
    await message.reply('🏓 Pong!');
  }

  if (message.content === '!help') {
    await message.reply('Commands: !ping, !help');
  }
});

client.login(process.env.BOT_TOKEN);
```

Run with: `BOT_TOKEN=your_token npx ts-node examples/native-bot.ts`

---

## Roadmap: What's Coming

### Phase 1: Message Handling (High Priority)
```ezlang
listen 'messageCreate' message {
    var content = message.content
    var author = message.author

    if content == "!ping" {
        reply message "Pong!"
    }
}
```

### Phase 2: Command Framework
```ezlang
command "ping" {
    reply "Pong!"
}

command "add" args {
    var a = num(args[0])
    var b = num(args[1])
    reply str(a + b)
}
```

### Phase 3: Slash Commands
```ezlang
slash_command "ping" {
    description "Test bot responsiveness"
    execute {
        reply "Pong!"
    }
}
```

### Phase 4: Components & Embeds
```ezlang
var embed = create_embed()
embed.title = "Hello!"
embed.description = "This is an embed"
embed.color = 0x00FF00

send_embed channel embed
```

---

## Comparison: EzLang vs Discord.js

| Feature | Discord.js | EzLang Status |
|---------|-----------|---------------|
| **Basic** |
| Connect bot | ✅ | ✅ Implemented |
| Send messages | ✅ | ⚠️ Via TypeScript only |
| Receive messages | ✅ | ❌ Not yet |
| Reactions | ✅ | ⚠️ Via TypeScript only |
| **Interactions** |
| Slash commands | ✅ | ❌ Not yet |
| Buttons | ✅ | ❌ Not yet |
| Select menus | ✅ | ❌ Not yet |
| Modals | ✅ | ❌ Not yet |
| **Advanced** |
| Embeds | ✅ | ❌ Not yet |
| Voice | ✅ | ❌ Not yet |
| Permissions | ✅ | ❌ Not yet |
| Webhooks | ✅ | ❌ Not yet |

---

## Example: What You Can Build TODAY

### Limited Bot (Current State)

```ezlang
// This connects but doesn't respond to messages
var token = get_argument("BOT_TOKEN", "")
bot_start(token)
print("Bot online!")
```

**Output**: Bot appears online, but doesn't respond.

### Working Bot (Requires TypeScript Extension)

You would need to modify the EzLang runtime or create a hybrid bot.

---

## Full Discord API Reference

### Available in Discord.js v14 (for future EzLang implementation)

#### Message Methods
- `message.reply(content)` - Reply to message
- `message.react(emoji)` - Add reaction
- `message.delete()` - Delete message
- `message.edit(content)` - Edit message
- `message.pin()` - Pin message
- `message.fetch()` - Fetch message details

#### Channel Methods
- `channel.send(content)` - Send message
- `channel.bulkDelete(amount)` - Delete multiple messages
- `channel.createThread(name)` - Create thread
- `channel.setName(name)` - Rename channel
- `channel.setTopic(topic)` - Set channel topic

#### Guild (Server) Methods
- `guild.members.fetch()` - Get all members
- `guild.channels.create()` - Create channel
- `guild.roles.create()` - Create role
- `guild.bans.create(user)` - Ban user
- `guild.setIcon(url)` - Change server icon

#### User Methods
- `user.send(content)` - Send DM
- `user.fetch()` - Get user details
- `user.displayAvatarURL()` - Get avatar URL

#### Interaction Methods (Slash Commands)
- `interaction.reply()` - Reply to slash command
- `interaction.deferReply()` - Defer response
- `interaction.editReply()` - Edit response
- `interaction.showModal()` - Show popup form

---

## Testing Your Current Bot

Even though the bot doesn't respond, you can verify it's working:

### Checklist

1. ✅ **Bot appears online in member list**
   - Check Discord server
   - Look for bot username
   - Green "online" status

2. ✅ **Console shows connection success**
   ```
   Discord bot logged in as Test Bot 12#1061
   ```

3. ✅ **No error messages**
   - Token is valid
   - Intents are enabled
   - Connection is stable

4. ❌ **Bot doesn't respond to commands** (Expected - not yet implemented)

---

## Enabling Message Content Intent

**Required for bot to read message content.**

### Steps:

1. Go to https://discord.com/developers/applications
2. Select your application
3. Go to "Bot" section
4. Scroll to "Privileged Gateway Intents"
5. Enable:
   - ✅ **Presence Intent** (optional)
   - ✅ **Server Members Intent** (optional)
   - ✅ **Message Content Intent** (REQUIRED)
6. Click "Save Changes"

**Without Message Content Intent**, the bot cannot read message text.

---

## Next Steps for Development

### For EzLang Contributors

To make the bot respond to messages, implement:

1. **Message Event Handler**
   - Add `messageCreate` handler in runtime
   - Pass message object to EzLang environment
   - Execute `listen` blocks when messages arrive

2. **Message Object API**
   - Expose `message.content`, `message.author`, `message.channel`
   - Implement `reply`, `send`, `react` in EzLang syntax

3. **Command Parser**
   - Parse prefix commands (`!ping`)
   - Extract command name and arguments
   - Route to appropriate handlers

### For Bot Developers

**Right now**: Wait for message handling implementation

**Workaround**: Use TypeScript to extend the runtime

**Future**: Full EzLang syntax for Discord bots

---

## Conclusion

### Current State

- ✅ Bot connection works perfectly
- ✅ Discord.js v14 is integrated
- ✅ All Discord API features available in TypeScript layer
- ❌ Message event handling not yet exposed to EzLang
- ❌ `listen` keyword not functional

### To Make It Work

The EzLang runtime needs to connect the `listen` keyword to Discord.js events. This requires modifying:
- `src/parser/index.ts` - Parse `listen` statements
- `src/runtime/index.ts` - Execute `listen` blocks on events
- `src/discord/index.ts` - Register EzLang handlers

### What You Can Do

**Option 1**: Wait for message handling to be implemented

**Option 2**: Extend EzLang with TypeScript (requires development)

**Option 3**: Use pure Discord.js for now (TypeScript/JavaScript)

---

**Your bot IS working** - it's online and connected. It just can't respond yet because message handling isn't implemented in EzLang.

This is a framework limitation, not a problem with your setup! 🎉
