# EzLang Quick Start Guide

## Installation

```bash
git clone https://github.com/yourusername/ezlang.git
cd ezlang
npm install
npm run build
```

## CLI Commands

```bash
# Run a program
ezlang run myfile.ezlang

# Check syntax
ezlang check myfile.ezlang

# Start REPL
ezlang repl

# Show version
ezlang version

# Get help
ezlang help
```

## REPL Quick Reference

### Start REPL
```bash
ezlang repl
```

### Basic Usage
```
> var x = 10           # Declare variable
> x + 5               # Evaluate expression (returns 15)
> print(x)            # Call function (prints 10)
```

### Multi-line Input
```
> function add(a, b) {
... return a + b
... }
> add(5, 3)           # Returns 8
```

### Special Commands
```
.help      # Show help
.clear     # Clear screen
.vars      # Show all variables
.history   # Show command history
.exit      # Exit REPL (or Ctrl+C)
```

## Language Syntax

### Variables
```ezlang
var name = "Alice"
var age = 25
var active = true
var items = [1, 2, 3]
```

### Functions
```ezlang
function greet(name) {
    return "Hello, " + name
}
```

### Control Flow
```ezlang
// If statement
if (x > 10) {
    print("Greater than 10")
} else {
    print("Less than or equal to 10")
}

// While loop
while (count < 5) {
    print(count)
    count = count + 1
}

// For loop
for (item in items) {
    print(item)
}
```

### Built-in Functions
```ezlang
print("Hello")           # Print to console
length([1, 2, 3])        # Get length (returns 3)
range(1, 5)              # Create array [1, 2, 3, 4]
random(1, 10)            # Random number between 1 and 10
type(x)                  # Get type of value
str(42)                  # Convert to string
num("42")                # Convert to number
push(arr, item)          # Add item to array
pop(arr)                 # Remove last item from array
```

### Discord Bot Example
```ezlang
var token = "YOUR_BOT_TOKEN"

listen "messageCreate" (message) {
    if (message.content == "!hello") {
        reply message "Hello! 👋"
    }
}

bot_start(token)
```

## File Structure

```
your-project/
├── mybot.ezlang        # Your EzLang program
└── examples/           # Example programs
    ├── 01-variables-arithmetic.ezlang
    ├── 02-functions.ezlang
    └── discord-hello-bot.ezlang
```

## NPM Scripts

```bash
npm run build         # Compile TypeScript
npm run dev           # Build and start REPL
npm start             # Run CLI
npm run start:repl    # Build and start REPL
npm test              # Run all tests
npm run test:cli      # Test CLI
npm run test:repl     # Test REPL
```

## Examples

### Hello World
```ezlang
print("Hello, World!")
```

### Variables and Arithmetic
```ezlang
var x = 10
var y = 20
var sum = x + y
print("Sum:", sum)
```

### Fibonacci Function
```ezlang
function fibonacci(n) {
    if (n <= 1) {
        return n
    }
    return fibonacci(n - 1) + fibonacci(n - 2)
}

print("Fibonacci(10):", fibonacci(10))
```

### Array Operations
```ezlang
var numbers = [1, 2, 3, 4, 5]

for (num in numbers) {
    print(num * 2)
}
```

## Common Patterns

### Factorial
```ezlang
function factorial(n) {
    if (n <= 1) {
        return 1
    }
    return n * factorial(n - 1)
}
```

### Sum Array
```ezlang
function sum(arr) {
    var total = 0
    for (item in arr) {
        total = total + item
    }
    return total
}
```

### FizzBuzz
```ezlang
for (i in range(1, 101)) {
    if (i % 15 == 0) {
        print("FizzBuzz")
    } else if (i % 3 == 0) {
        print("Fizz")
    } else if (i % 5 == 0) {
        print("Buzz")
    } else {
        print(i)
    }
}
```

## Getting Help

- **Documentation:** See `CLI.md`, `REPL.md`, `DISCORD.md`
- **Examples:** Check the `examples/` directory
- **REPL Help:** Type `.help` in REPL
- **CLI Help:** Run `ezlang help`

## Troubleshooting

### Command not found
```bash
# Use npm run or node directly
npm run start:repl
node dist/index.js repl
```

### Syntax errors
```bash
# Check syntax first
ezlang check myfile.ezlang
```

### REPL stuck in multi-line mode
Press `Ctrl+C` to cancel and return to normal mode.

## Next Steps

1. **Try the REPL:** `ezlang repl`
2. **Run examples:** `ezlang run examples/01-variables-arithmetic.ezlang`
3. **Create your first bot:** See `examples/discord-hello-bot.ezlang`
4. **Read the docs:** Check out `README.md`, `CLI.md`, `REPL.md`

## Resources

- **README.md** - Complete project documentation
- **CLI.md** - Command-line interface guide
- **REPL.md** - Interactive REPL guide
- **RUNTIME.md** - Built-in functions reference
- **DISCORD.md** - Discord bot development guide

---

Happy coding with EzLang! 🚀
