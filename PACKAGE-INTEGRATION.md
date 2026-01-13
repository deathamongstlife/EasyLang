# Package Integration Guide

This document explains how EzLang Discord bots can integrate with JavaScript (npm) and Python packages for extended functionality.

## Overview

EzLang bots can leverage the entire npm ecosystem and Python packages through:
- **JavaScript packages**: Using Node.js `require()` directly in the bot runtime
- **Python packages**: Through the Python bridge (see PYTHON.md)

## JavaScript Package Integration

### Available Test Commands

The bot includes built-in commands to demonstrate popular npm packages:

#### 1. **`!testmoment`** - Date/Time with moment.js

Tests the moment.js library for date/time manipulation.

**Features demonstrated:**
- Current date/time formatting
- ISO format and Unix timestamps
- Relative time ("2 days ago")
- Date arithmetic (add/subtract days)
- Date differences (days/years since a date)
- Timezone detection

**Installation:**
```bash
bun add moment
# or
npm install moment
```

**What it shows:**
```
Current Date/Time: Monday, January 13, 2026 10:30 AM
ISO Format: 2026-01-13T10:30:00.000Z
Unix Timestamp: 1768195800
Tomorrow: January 14, 2026
Two Days Ago: January 11, 2026 (2 days ago)
Days Since Birthday: 13162 days
Years Since Birthday: 36 years
Timezone: America/New_York
```

---

#### 2. **`!testaxios`** - HTTP Requests with axios

Tests the axios library for making HTTP requests.

**Features demonstrated:**
- GET requests to REST APIs
- Response status and headers
- JSON data parsing
- Multiple API calls
- Real-world API integration (GitHub)

**Installation:**
```bash
bun add axios
# or
npm install axios
```

**What it shows:**
```
GitHub Zen Quote: "Design for failure."
Test API Request: https://api.github.com/zen
Response Status: 200 OK
Content Type: text/plain; charset=utf-8
Sample User Data: @octocat
User Name: The Octocat
Public Repos: 8
Followers: 9284
```

---

#### 3. **`!testlodash`** - Utilities with lodash

Tests the lodash utility library.

**Features demonstrated:**
- Array chunking
- Sum and average calculations
- Array filtering
- Object grouping
- Deep object access
- Array shuffling
- 300+ utility functions available

**Installation:**
```bash
bun add lodash
# or
npm install lodash
```

**What it shows:**
```
Array Chunking: [[1,2,3],[4,5,6],[7,8,9],[10]]
Sum of Numbers: 55
Average: 5.5
Active Users: Alice, Charlie, Diana
Grouped by Age: 25: 2, 30: 1, 28: 1
Deep Object Access: _.get(nested, 'a.b.c') = "deep value"
Shuffled Array: 3, 1, 5, 2, 4
```

---

## Python Package Integration

### Available Test Commands

#### 4. **`!testpython`** - Python Math Module

Tests Python's built-in math module (when Python bridge is connected).

**Features it would demonstrate:**
- Square roots
- Factorials
- Mathematical constants (pi, e)
- Trigonometric functions
- Logarithms

**Status:** ⚠️ Requires Python bridge setup (see PYTHON.md)

---

#### 5. **`!testrequests`** - Python HTTP Requests

Tests Python's requests library for HTTP operations.

**Features it would demonstrate:**
- HTTP GET/POST requests
- JSON parsing
- Response handling
- REST API integration from Python

**Status:** ⚠️ Requires Python bridge setup (see PYTHON.md)

---

## Installation Helper Commands

### `!installjs <package>` (Admin Only)

Shows how to install a JavaScript package.

**Usage:**
```
!installjs moment
!installjs axios
!installjs lodash
```

**Output:** Provides installation commands for Bun, npm, and Yarn.

---

### `!installpy <package>` (Admin Only)

Shows how to install a Python package.

**Usage:**
```
!installpy requests
!installpy numpy
!installpy pandas
```

**Output:** Provides installation commands for pip/pip3.

---

## Using Packages in Your Bot

### JavaScript Packages

Any npm package can be used in the bot commands by requiring it:

```typescript
try {
  const packageName = require('package-name');
  // Use the package
} catch (error) {
  await message.reply('Package not installed! Install with: bun add package-name');
}
```

**Popular packages you can integrate:**
- **moment** / **dayjs** - Date/time manipulation
- **axios** / **node-fetch** - HTTP requests
- **lodash** / **ramda** - Utility functions
- **cheerio** - HTML parsing (web scraping)
- **sharp** - Image processing
- **pdf-lib** - PDF generation/manipulation
- **chart.js** - Chart generation
- **socket.io** - WebSocket communication
- **express** - Web server (for webhooks)
- **sequelize** / **mongoose** - Database ORMs

### Python Packages

Python packages require the Python bridge to be set up (see PYTHON.md).

Once configured, you can use EzLang's `use` statement:

```python
use math from python

var result = math.sqrt(144)
print(result)  # 12.0
```

---

## Best Practices

1. **Error Handling**: Always wrap `require()` in try-catch blocks
2. **User Feedback**: Show clear error messages when packages are missing
3. **Installation Instructions**: Provide exact commands to install packages
4. **Restart Reminder**: Remind users to restart the bot after installing packages
5. **Type Safety**: Use TypeScript types when available (`@types/package-name`)
6. **Async Operations**: Use `await` for async package operations
7. **Rate Limiting**: Be mindful of API rate limits with HTTP libraries

---

## Example: Adding a New Package Command

Here's how to add a command for a new package (e.g., `uuid`):

```typescript
else if (command === 'testuuid') {
  try {
    const { v4: uuidv4 } = require('uuid');

    const uuid1 = uuidv4();
    const uuid2 = uuidv4();
    const uuid3 = uuidv4();

    const embed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle('UUID Generation Test')
      .setDescription('Generating unique identifiers with uuid package')
      .addFields(
        { name: 'UUID 1', value: uuid1, inline: false },
        { name: 'UUID 2', value: uuid2, inline: false },
        { name: 'UUID 3', value: uuid3, inline: false },
        { name: 'Format', value: 'RFC4122 v4 (random)', inline: false }
      )
      .setFooter({ text: 'Package: uuid' });

    await message.reply({ embeds: [embed] });
  } catch (error) {
    await message.reply('❌ **uuid not installed!**\n\nInstall it with: `bun add uuid`');
  }
}
```

Then install the package:
```bash
bun add uuid
```

---

## Testing Package Integration

Run the example bot to test all package integration features:

```bash
# Build the project
npm run build

# Run the package integration bot
node dist/index.js run examples/package-integration-bot.ez TOKEN=your_bot_token

# In Discord, try these commands:
!help
!testmoment     # If moment is installed
!testaxios      # If axios is installed
!testlodash     # If lodash is installed
!installjs uuid # Shows how to install a package
```

---

## Related Documentation

- **DISCORD.md** - Discord bot development guide
- **PYTHON.md** - Python bridge setup and usage
- **DISCORD-FEATURES.md** - Complete Discord API feature list
- **README.md** - Getting started with EzLang

---

## Troubleshooting

### Package Not Found

If you get "module not found" errors:
1. Install the package: `bun add package-name`
2. Rebuild the project: `npm run build`
3. Restart the bot

### TypeScript Errors

If you get TypeScript type errors:
1. Install type definitions: `bun add -D @types/package-name`
2. Or use `any` type: `const pkg = require('package-name') as any;`

### Python Bridge Not Working

See PYTHON.md for Python bridge setup instructions.

---

**Note:** This demonstrates the power of EzLang - simple syntax with access to the entire JavaScript and Python ecosystems!
