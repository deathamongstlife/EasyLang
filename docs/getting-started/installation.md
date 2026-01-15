---
layout: default
title: Installation
description: Install EasyLang and set up your development environment
---

# Installation

This guide will walk you through installing EasyLang and setting up your development environment.

## Prerequisites

Before installing EasyLang, make sure you have the following installed:

### Node.js (Required)
EasyLang runs on Node.js. You need Node.js version 16.9.0 or higher.

**Download Node.js:**
- Visit [nodejs.org](https://nodejs.org/)
- Download the LTS (Long Term Support) version
- Run the installer and follow the instructions

**Verify Installation:**
```bash
node --version
# Should output: v16.9.0 or higher

npm --version
# Should output: 7.0.0 or higher
```

### Python 3.7+ (Optional)
Python is only required if you want to use the Python bridge system to access Python packages.

**Download Python:**
- Visit [python.org](https://www.python.org/)
- Download Python 3.7 or higher
- During installation, make sure to check "Add Python to PATH"

**Verify Installation:**
```bash
python --version
# or
python3 --version
# Should output: Python 3.7.0 or higher
```

---

## Installing EasyLang

### Method 1: Global Installation (Recommended)

Install EasyLang globally to use it from anywhere:

```bash
npm install -g easylang
```

**Verify Installation:**
```bash
easylang --version
```

If this command works, you're all set!

### Method 2: Local Installation

Install EasyLang in a specific project:

```bash
# Create a new directory for your bot
mkdir my-discord-bot
cd my-discord-bot

# Initialize npm
npm init -y

# Install EasyLang locally
npm install easylang
```

**Run with npx:**
```bash
npx easylang bot.ezlang
```

---

## Setting Up the Python Bridge (Optional)

If you want to use Python packages in your bots, you need to set up the Python bridge:

### 1. Install Python Dependencies

```bash
pip install discord.py python-bridge
# or
pip3 install discord.py python-bridge
```

### 2. Verify Python Bridge

Create a test file `test-bridge.ezlang`:

```ezlang
use_python_package("math")
let result = python_call("math.sqrt", 16)
print(result)  // Should print: 4.0
```

Run it:
```bash
easylang test-bridge.ezlang
```

If it prints `4.0`, your Python bridge is working!

---

## Creating Your First Project

### 1. Create a Project Directory

```bash
mkdir my-first-bot
cd my-first-bot
```

### 2. Create a Bot File

Create a file called `bot.ezlang`:

```ezlang
listen("ready", function() {
    print("Bot is online!")
})

listen("messageCreate", function(message) {
    if message.content == "!ping" {
        reply(message, "Pong!")
    }
})

// Replace with your actual bot token
bot_start("YOUR_TOKEN_HERE")
```

### 3. Get a Discord Bot Token

Before you can run your bot, you need a Discord bot token:

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application"
3. Give your application a name
4. Go to the "Bot" tab
5. Click "Add Bot"
6. Click "Reset Token" to see your token
7. Copy the token (keep it secret!)

### 4. Run Your Bot

Replace `YOUR_TOKEN_HERE` in your bot file with your actual token, then run:

```bash
easylang bot.ezlang
```

You should see "Bot is online!" in your console.

---

## Environment Variables (Recommended)

For security, it's better to store your bot token in an environment variable instead of hardcoding it.

### Using .env File

1. **Create a `.env` file:**

```bash
BOT_TOKEN=your_token_here
```

2. **Update your bot code:**

```ezlang
listen("ready", function() {
    print("Bot is online!")
})

listen("messageCreate", function(message) {
    if message.content == "!ping" {
        reply(message, "Pong!")
    }
})

// Use environment variable
bot_start(get_env("BOT_TOKEN"))
```

3. **Run your bot:**

```bash
easylang bot.ezlang
```

EasyLang automatically loads `.env` files!

---

## IDE Setup

### Visual Studio Code (Recommended)

We recommend using Visual Studio Code for the best development experience:

1. **Download VS Code**: [code.visualstudio.com](https://code.visualstudio.com/)
2. **Install Extensions:**
   - "EasyLang" (if available) for syntax highlighting
   - "Discord" for Discord-related snippets
   - "Better Comments" for enhanced comments

### File Association

Associate `.ezlang` files with your editor:

**VS Code:**
- Open a `.ezlang` file
- Click the language mode in the bottom right
- Select "Configure File Association for '.ezlang'"
- Choose "JavaScript" for basic syntax highlighting

---

## Project Structure

Here's a recommended project structure for your bot:

```
my-discord-bot/
├── bot.ezlang          # Main bot file
├── .env                # Environment variables (don't commit!)
├── .gitignore          # Git ignore file
├── package.json        # npm configuration
├── commands/           # Command files (for larger bots)
│   ├── ping.ezlang
│   └── info.ezlang
└── utils/              # Utility functions
    └── helpers.ezlang
```

### Create .gitignore

If you're using Git, create a `.gitignore` file:

```
.env
node_modules/
.DS_Store
*.log
```

---

## Verification Checklist

Make sure everything is working:

- [ ] Node.js is installed (v16.9.0+)
- [ ] EasyLang is installed (`easylang --version` works)
- [ ] You have a Discord bot token
- [ ] You can run a simple bot
- [ ] Python is installed (if using Python bridge)
- [ ] Python bridge works (if needed)

---

## Troubleshooting

### Command Not Found: easylang

**Problem:** After installing, `easylang` command doesn't work.

**Solution:**
1. Make sure you installed globally: `npm install -g easylang`
2. Check npm's global bin directory is in your PATH:
   ```bash
   npm config get prefix
   ```
3. Add npm's bin directory to your PATH
4. Restart your terminal

**Alternative:** Use npx:
```bash
npx easylang bot.ezlang
```

### Permission Denied (Linux/Mac)

**Problem:** "Permission denied" when installing globally.

**Solution:**
```bash
sudo npm install -g easylang
```

### Python Bridge Not Working

**Problem:** `use_python_package()` throws errors.

**Solution:**
1. Verify Python is installed: `python --version`
2. Install required packages:
   ```bash
   pip install discord.py python-bridge
   ```
3. Make sure Python is in your PATH

### Bot Token Invalid

**Problem:** "Invalid token" error when starting bot.

**Solution:**
1. Make sure you copied the entire token
2. Check for extra spaces or quotes
3. Reset your token in Discord Developer Portal
4. Make sure your bot has the necessary intents enabled

---

## Updating EasyLang

To update to the latest version:

### Global Installation

```bash
npm update -g easylang
```

### Local Installation

```bash
npm update easylang
```

### Check Version

```bash
easylang --version
```

---

## Next Steps

Now that you have EasyLang installed, you're ready to create your first bot!

[Create Your First Bot →](/EasyLang/getting-started/first-bot){: .btn .btn-primary}

Or learn more about basic concepts:

[Learn Basic Concepts →](/EasyLang/getting-started/basic-concepts){: .btn .btn-secondary}

---

## Additional Resources

- **npm Package**: [npmjs.com/package/easylang](https://www.npmjs.com/package/easylang)
- **GitHub Repository**: [github.com/deathamongstlife/EasyLang](https://github.com/deathamongstlife/EasyLang)
- **Discord Developer Portal**: [discord.com/developers](https://discord.com/developers/applications)
- **Node.js Download**: [nodejs.org](https://nodejs.org/)
- **Python Download**: [python.org](https://www.python.org/)

---

## Getting Help

If you run into issues during installation:

- Check the [GitHub Issues](https://github.com/deathamongstlife/EasyLang/issues)
- Read the [FAQ](/EasyLang/faq) (if available)
- Ask for help in the community

[Back to Getting Started →](/EasyLang/getting-started/)
