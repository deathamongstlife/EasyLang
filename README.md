# EzLang

A simple, intuitive programming language designed specifically for Discord bot development with seamless Python package integration.

## Overview

EzLang is a domain-specific language that makes creating Discord bots easy and fun. It features:

- Clean, readable syntax inspired by Python and JavaScript
- Built-in Discord API integration
- Python package support for extending functionality
- Dynamic typing with intuitive type coercion
- Extension system for custom functionality
- Interactive REPL for rapid prototyping

## Features

- **Discord-First Design**: Built-in commands for sending messages, reactions, and event handling
- **Python Bridge**: Use any Python package directly in your bot code
- **Simple Syntax**: Easy to learn, especially for beginners
- **Type System**: Dynamic typing with automatic conversions
- **Extension System**: Extend the language with custom modules
- **REPL**: Interactive environment for testing and learning

## Installation

### Prerequisites

- Node.js 16 or higher
- Python 3.8 or higher (for Python bridge)
- npm or yarn

### Install

```bash
# Clone the repository
git clone https://github.com/yourusername/ezlang.git
cd ezlang

# Install dependencies
npm install

# Install Python dependencies
pip install -r python-runtime/requirements.txt

# Build the project
npm run build

# Optionally install globally
npm install -g .
```

## Quick Start

### Your First Bot

Create a file named `hello-bot.ez`:

```ezlang
// Set your Discord bot token
token = "YOUR_BOT_TOKEN_HERE"

// Listen for messages
listen "messageCreate" (message) {
    // Respond to !hello command
    if message.content == "!hello" {
        reply message "Hello! I'm an EzLang bot!"
    }
}

// Start the bot
bot_start(token)
```

Run it:

```bash
ezlang run hello-bot.ez
```

### Using the REPL

Start the interactive REPL:

```bash
ezlang repl
```

Try some commands:

```ezlang
> var x = 10
> var y = 20
> print(x + y)
30
> var greeting = "Hello, World!"
> print(greeting)
Hello, World!
```

## Language Syntax

### Variables

```ezlang
var name = "Alice"
var age = 25
var isActive = true
var items = [1, 2, 3, 4, 5]
```

### Control Flow

```ezlang
// If statements
if age >= 18 {
    print("Adult")
} else {
    print("Minor")
}

// For loops
for i in range(5) {
    print(i)
}

// While loops
var count = 0
while count < 5 {
    print(count)
    count = count + 1
}
```

### Functions

```ezlang
function greet(name) {
    return "Hello, " + name + "!"
}

var message = greet("Bob")
print(message)
```

### Discord Commands

```ezlang
// Send a message to a channel
send channel "Welcome to the server!"

// Reply to a message
reply message "Thanks for your message!"

// Add a reaction
react message "👍"

// Listen for events
listen "messageCreate" (msg) {
    if msg.content == "!ping" {
        reply msg "Pong!"
    }
}
```

### Python Integration

```ezlang
// Use a Python package
use "requests" as requests

// Call Python functions
var response = requests.get("https://api.github.com")
var data = response.json()
print(data)
```

## Built-in Functions

- `print(value)` - Print to console
- `length(collection)` - Get length of string or array
- `random(min, max)` - Generate random number
- `wait(seconds)` - Pause execution
- `range(start, end)` - Generate number range
- `get_argument(name, default)` - Get command-line argument

## Discord API

EzLang provides first-class Discord bot support with simple, intuitive syntax:

### Commands

- `send channel message` - Send a new message to a channel
- `reply message text` - Reply to a message (mentions the author)
- `react message emoji` - Add an emoji reaction to a message

### Functions

- `bot_start(token)` - Initialize and start the Discord bot

### Event Listeners

Use the `listen` statement to handle Discord events:

```ezlang
listen "eventName" (parameter) {
    // Event handler code
}
```

**Supported Events:**
- `ready` - Bot connected and ready (parameter: client)
- `messageCreate` - New message received (parameter: message)
- `interactionCreate` - Interaction received (parameter: interaction)

**Message Object Properties:**
- `message.content` - Message text
- `message.id` - Message ID
- `message.author` - Author object (has: id, username, tag, bot)
- `message.channel` - Channel object
- `message.channelId` - Channel ID
- `message.guildId` - Server/Guild ID

For complete Discord integration documentation, see [DISCORD.md](DISCORD.md).

## Examples

See the `examples/` directory for complete examples:

**Core Language Examples:**
- `01-hello-world.ezlang` - Basic print statements
- `02-variables.ezlang` - Variable declarations and types
- `03-functions.ezlang` - Function definitions and calls
- `04-control-flow.ezlang` - If/else statements
- `05-loops.ezlang` - For and while loops
- `06-arrays.ezlang` - Array manipulation
- `07-factorial.ezlang` - Recursive functions

**Discord Bot Examples:**
- `discord-hello-bot.ezlang` - Simple command bot with reactions

**Python Integration Examples:**
- `python-integration.ezlang` - Comprehensive Python package usage

## Documentation

- [Language Specification](docs/language-spec.md)
- [Discord Integration Guide](DISCORD.md)
- [Python Integration Guide](PYTHON.md)
- [CLI Documentation](CLI.md)
- [REPL Documentation](REPL.md)
- [Runtime Documentation](RUNTIME.md)
- [API Reference](docs/api-reference.md)
- [Extension Development Guide](docs/extension-guide.md)

## CLI Commands

```bash
# Run a file
ezlang run <file>

# Start REPL
ezlang repl

# Check syntax without running
ezlang check <file>

# Show version
ezlang version

# Show help
ezlang --help
```

## Development Status

### ✅ Phase 1: Core Language Processing (COMPLETE)

The lexer and parser are fully implemented and tested. See [PHASE1_COMPLETE.md](PHASE1_COMPLETE.md) for details.

**Implemented:**
- Lexer with full tokenization support
- Parser with recursive descent parsing
- Complete AST node definitions
- Operator precedence handling
- Error handling with position tracking
- Support for all planned syntax

**Test the implementation:**

```bash
# Run basic lexer/parser tests
npm run test:lexer

# Parse the example file
npx ts-node src/test-example.ts

# Build the project
npm run build
```

### ✅ Phase 2: Interpreter & Runtime (COMPLETE)

The runtime interpreter is fully implemented and tested. See [RUNTIME.md](RUNTIME.md) for complete documentation.

**Implemented:**
- Runtime value types (Number, String, Boolean, Null, Array, Object, Function)
- Variable scoping with lexical closures
- Expression evaluation (binary, unary, calls, member access)
- Statement execution (if/else, while, for...in, functions, return)
- Built-in functions (print, length, random, wait, range, type, str, num, push, pop)
- Control flow (conditionals, loops, function calls)
- Type coercion and equality checking
- Error handling with position tracking
- Async/await support

**Test the implementation:**

```bash
# Run comprehensive runtime tests
npm run test:runtime

# Try example programs
npx ts-node -e "
const { Lexer } = require('./src/lexer');
const { Parser } = require('./src/parser');
const { Runtime } = require('./src/runtime');
const fs = require('fs');

const code = fs.readFileSync('examples/07-factorial.ezlang', 'utf-8');
const tokens = new Lexer(code).tokenize();
const ast = new Parser(tokens).parse();
new Runtime(ast).execute();
"
```

**Example programs in `examples/` directory:**
- Variables and arithmetic
- Function declarations and calls
- Control flow (if/else, while, for)
- Arrays and iteration
- Recursive functions (factorial)
- Complex algorithms (FizzBuzz)
- Closures and scope

### ✅ Phase 3: Discord.js Integration (COMPLETE)

Full Discord bot functionality is now implemented! See [DISCORD.md](DISCORD.md) for complete documentation.

**Implemented:**
- DiscordManager class for bot lifecycle management
- Event system for Discord events (ready, messageCreate, interactionCreate)
- Discord commands: `send`, `reply`, `react`
- Built-in `bot_start()` function
- Event handlers with `listen` statement
- Automatic conversion of Discord.js objects to RuntimeValues
- Error handling for Discord operations
- Message and user property access

**Create your first Discord bot:**

```ezlang
var token = get_argument("DISCORD_TOKEN", "")

if token == "" {
    print("Error: Please provide DISCORD_TOKEN")
} else {
    listen "ready" (client) {
        print("Bot is online!")
        print("Logged in as:", client.user.tag)
    }

    listen "messageCreate" (message) {
        if message.author.bot == false {
            if message.content == "!hello" {
                reply message "Hello! I'm an EzLang bot! 👋"
            }
        }
    }

    bot_start(token)
}
```

**Run your bot:**

```bash
ezlang examples/discord-hello-bot.ezlang DISCORD_TOKEN=your_token_here
```

**Features:**
- Listen to Discord events with simple syntax
- Reply to messages and add reactions
- Access message content and author information
- Bot lifecycle management (ready event)
- Proper error handling with helpful messages

See `examples/discord-hello-bot.ezlang` for a complete working example!

### ✅ Phase 4: CLI & REPL (COMPLETE)

Full command-line interface and interactive REPL are now implemented! See [CLI.md](CLI.md) and [REPL.md](REPL.md) for complete documentation.

**Implemented:**
- CLI with Commander.js framework
- Multiple commands: `run`, `repl`, `check`, `version`, `help`
- Interactive REPL with persistent history
- Multi-line input support for functions and blocks
- Color-coded output for different value types
- Special REPL commands: `.help`, `.clear`, `.vars`, `.history`, `.exit`
- Command history saved to `~/.ezlang_history`
- Proper error handling and display
- Non-interactive mode for piped input
- Comprehensive test scripts

**Using the CLI:**

```bash
# Run a file
ezlang run examples/01-variables-arithmetic.ezlang

# Check syntax
ezlang check mybot.ezlang

# Start interactive REPL
ezlang repl

# Show version
ezlang version

# Get help
ezlang help
```

**REPL Features:**
- Line-by-line code execution
- Variable persistence between commands
- Multi-line input for functions, if statements, loops
- Color-coded output (numbers, strings, booleans, arrays, functions)
- Special commands (`.help`, `.clear`, `.vars`, `.history`, `.exit`)
- Command history with up/down arrow navigation
- Persistent history across sessions
- Graceful error handling

**Example REPL Session:**

```
Welcome to EzLang REPL v1.0.0
Type .help for commands, .exit to quit

> var x = 10
> var y = 20
> x + y
30
> function add(a, b) {
... return a + b
... }
> add(5, 3)
8
> .vars
Defined Variables:
  x = 10
  y = 20
  add = <function add>
> .exit
Goodbye!
```

### ✅ Phase 5: Python Bridge (COMPLETE)

Full Python package integration is now implemented! See [PYTHON.md](PYTHON.md) for complete documentation.

**Implemented:**
- Python IPC bridge server
- TypeScript IPC client for communication
- PythonBridge manager for process lifecycle
- PythonProxy for seamless object mapping
- Automatic data type conversion between EzLang and Python
- Support for importing any Python module
- Function calls with argument passing
- Attribute and constant access
- Error handling with helpful messages

**Using Python Packages:**

```ezlang
// Import Python modules
use "math" as math
use "random" as random
use "requests" as requests

// Use math functions
var pi = math.pi
var sqrt_result = math.sqrt(16)
print("Square root of 16:", sqrt_result)

// Generate random numbers
var rand_num = random.randint(1, 100)
print("Random number:", rand_num)

// Make HTTP requests
var response = requests.get("https://api.github.com")
var data = response.json()
print("GitHub API response:", data)
```

**Supported Python Packages:**
- Standard library modules (math, random, json, datetime, os, pathlib, etc.)
- Third-party packages (requests, numpy, pandas, beautifulsoup4, etc.)
- Any Python package that can be imported with `import`

**Requirements:**
- Python 3.6 or later
- `ipc` package: `pip install ipc`

**Test Python Integration:**

```bash
# Install Python dependencies
pip install ipc

# Run the example
ezlang run examples/python-integration.ezlang
```

See `examples/python-integration.ezlang` for a comprehensive demonstration of Python integration features!

### 📋 Future Phases

- Phase 6: Additional Features & Optimizations

## Development Commands

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Build the project
npm run build

# Test lexer and parser
npm run test:lexer

# Test runtime/interpreter
npm run test:runtime
```

## Testing

```bash
# Run all tests
npm test

# Run specific test file
npm test -- tests/lexer.test.ts

# Watch mode
npm run test:watch
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- GitHub Issues: [Report bugs or request features](https://github.com/yourusername/ezlang/issues)
- Documentation: [Read the docs](docs/)
- Discord: [Join our community](https://discord.gg/ezlang)

## Acknowledgments

- Inspired by Python, JavaScript, and domain-specific languages
- Built with TypeScript and Node.js
- Discord.js for Discord API integration
- Python for extensibility
