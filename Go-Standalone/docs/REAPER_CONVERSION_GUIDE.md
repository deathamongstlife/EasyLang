# Reaper-2.0 Conversion Guide
This guide explains how to use EzLang to completely replace a massive `discord.js` bot like REAPER-2.0.

### 1. The Entry File (index.js -> index.ez)
In Node.js, you have to require fs, instantiate Collections, and bind event listeners.
In EzLang, the runtime handles the collections and events for you automatically.

**Javascript:**
```javascript
const { Client, Collection } = require("discord.js");
const client = new Client({ intents: 47007 });
client.login("TOKEN");
```

**EzLang:**
```text
include "./config.ez"
start bot with token BOT_TOKEN
```

### 2. Loading Packages (NPM to EzLang)
You don't need `package.json` dependencies to break your Go compiler. EzLang bridges them dynamically.

**Javascript:**
```javascript
const canvas = require("canvas");
const player = require("discord-player");
```

**EzLang:**
```text
load npm package "canvas" as canvas
load npm package "discord-player" as discordPlayer
```

### 3. Command Translation
Because EzLang uses a global contextual environment, you don't need to pass `(client, message, args)` into every single file.

**Javascript (Commands/Info/ping.js):**
```javascript
module.exports = {
    name: "ping",
    run: async (client, message, args) => {
        message.reply("Pong!");
    }
};
```

**EzLang (Commands/Info/ping.ez):**
```text
when message starts with "!ping"
    reply with "Pong!"
end when
```

### 4. Advanced Interaction Mapping
When REAPER-2.0 uses ActionRows and ButtonBuilders, it takes 15 lines of code. EzLang does it in 1.

**Javascript:**
```javascript
const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
    .setCustomId('primary')
    .setLabel('Click me!')
    .setStyle(ButtonStyle.Primary),
);
message.reply({ components: [row] });
```

**EzLang:**
```text
reply with button "primary" labeled "Click me!" style "primary"
```

Use the `REWRITE_PROMPT.md` file located in the root directory to deploy AI agents to automatically batch-convert your `Commands/` folders!
