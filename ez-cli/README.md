# EzLang 🚀
### Write Discord Bots in Plain English. Powered by Go.

**EzLang** is a high-performance, natural language programming language designed specifically for Discord bot development. It allows you to build complex bots using human-readable English syntax while leveraging a lightning-fast Go-based interpreter.

## ✨ Key Features
- **Natural Language Syntax:** Write `ban user target` instead of complex API wrappers.
- **High Performance:** Built natively in Go for minimal memory footprint and high concurrency.
- **Universal Bridge:** Access 100% of the Discord API even if EzLang doesn't have a keyword for it yet.
- **Built-in Daemon:** Run your bots in the background with a single command.
- **NPM Integration:** Load any NPM package directly into your EzLang script.

## 📦 Installation

```bash
npm install -g ezlang-bot
```

## 🚀 Quick Start

Create a file named `hello.ez`:

```ezlang
set BOT_TOKEN to "your_token_here"

start bot with token BOT_TOKEN

when bot starts
    print("Bot is online!")
end when

when message starts with "!ping"
    reply with "Pong! 🏓"
end when
```

Run your bot:
```bash
ez run hello.ez
```

## 🛠 CLI Usage

EzLang comes with a powerful CLI to manage your bot's lifecycle:

| Command | Description |
|---------|-------------|
| `ez run <file>` | Run a bot in your current terminal (foreground). |
| `ez start <file>` | **Daemon Mode:** Starts your bot in the background. |
| `ez stop` | Stops the background bot running in the current directory. |

*Logs for background bots are automatically saved to `ez-out.log` and `ez-err.log` in your project folder.*

## 🌉 The Universal Bridge

Never be limited by the language. Access any Discord feature using our raw bridges:

### Universal Events
```ezlang
when discord event "GUILD_MEMBER_ADD" occurs
    print("New user joined: " + event_data.user.username)
end when
```

### Universal API Requests
```ezlang
set response to discord_request("POST", "/channels/123/messages", { content: "Hello!" })
```

## 📚 Documentation
For a full list of commands and advanced features, visit our [Universal Bridge Guide](https://github.com/your-repo/docs/UNIVERSAL_BRIDGE_DOCS.md).

## 📄 License
MIT
