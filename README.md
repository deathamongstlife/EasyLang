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

- `send channel message` - Send message to channel
- `reply message text` - Reply to a message
- `react message emoji` - Add reaction to message
- `listen event (params) { }` - Listen for Discord events
- `bot_start(token)` - Start the Discord bot

## Examples

See the `examples/` directory for complete bot examples:

- `hello-bot.ez` - Simple greeting bot
- `moderation.ez` - Moderation commands
- `advanced.ez` - Advanced features showcase

## Documentation

- [Language Specification](docs/language-spec.md)
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

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Build the project
npm run build

# Run in development mode
npm run dev
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
