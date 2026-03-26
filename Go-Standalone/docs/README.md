# Welcome to EzLang 🚀

EzLang is a groundbreaking, **standalone programming language** built natively in Go, designed *exclusively* for creating Discord Bots.

It completely abandons the heavy, confusing boilerplate of JavaScript, TypeScript, and Python. There are no wrappers, no hidden Node.js engines, and no `client.on(...)` functions. 

EzLang parses **Natural English Grammar** directly into native, high-performance Go structs and talks directly to Discord's API (v10). 

---

## ⚡ Why EzLang?

### 1. Zero Dependencies
You don't need `npm install`, `node_modules`, or Python environments. You just need the `ezbot` executable and your `.ez` scripts.

### 2. Natural Language Syntax
Instead of writing this in Javascript:
```javascript
client.on("messageCreate", message => {
    if (message.content === "!ping") {
        message.reply("Pong!");
    }
});
```

You write this in EzLang:
```text
when message says "!ping"
    reply with "Pong!"
end when
```

### 3. Ultimate Power
Even though the syntax looks like a beginner tool, it is not. EzLang compiles directly to raw WebSocket payloads, making it **faster and less memory intensive** than `discord.js`.

---

## 📚 The Grammar Reference

Here are the native features you can use right now.

### 🔌 Getting Started
Every EzLang bot starts the same way: by booting up the engine and connecting to Discord.

```text
start bot with token "YOUR_BOT_TOKEN_HERE"

when bot starts
    print("My bot is online!")
end when
```

---

### 💬 Messages & Channels

You can easily trigger actions when people speak, and reply with advanced formatting.

```text
// Simple replies
when message says "!hello"
    reply with "Hi there!"
end when

// Dynamic prefix matching
when message starts with "!ban"
    reply with "Checking permissions..."
end when

// Rich Embeds
when message says "!info"
    reply with embed "Server Info" "This is a great server!"
end when

// Local File Uploads
when message says "!logo"
    reply with file "./assets/logo.png"
end when
```

### 🎛️ Interactive Components v2
EzLang has 100% parity with modern Discord interactions. You can create Slash Commands, Buttons, and Select Menus entirely in English.

```text
// Registering a Slash Command
register slash command "ping" with description "Test my speed!"

when slash command "ping" is used
    reply with "Pong!"
end when

// Sending Interactive Buttons
when message says "!verify"
    reply with button "btn_verify" labeled "Click to Verify" style "success"
end when

// Listening for the Button Click
when button "btn_verify" is clicked
    reply with "You have been verified!"
end when
```

---

### 🛡️ Moderation & Permissions
EzLang natively understands Discord's complex role and permission structures.

```text
when message says "!panic"
    // Security check
    if user has permission "ADMINISTRATOR" then
        ban user message.author.id for "Panic protocol initiated"
        reply with "Threat neutralized."
    end if
end when

when message says "!vip"
    add role "VIP_ROLE_ID" to user message.author.id
    reply with "You are now a VIP!"
end when
```

---

### 📦 The Module & Package System
Don't want to write a 3,000 line file? EzLang supports multi-file architecture and native bridging to Node/Python packages!

**config.ez**
```text
set PREFIX to "!"
```

**main.ez**
```text
include "./config.ez"

// The engine will spawn a background IPC bridge to let you use NPM packages!
load npm package "canvas" as canvas

when message says PREFIX + "draw"
    // Write your logic here
end when
```

---

## ⚙️ How to Run Your Bot

1. Ensure you have the `ezbot` binary.
2. Open your terminal.
3. Run:
```bash
./ezbot run my_bot_script.ez
```

That's it! Ezbot will natively tokenize, parse, and execute your logic directly against Discord's gateway.