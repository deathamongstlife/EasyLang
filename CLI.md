# EzLang CLI Documentation

The EzLang command-line interface (CLI) provides tools for running EzLang programs, checking syntax, and starting an interactive REPL.

## Installation

After building the project:

```bash
npm run build
npm link  # Optional: install globally
```

## Commands

### Run a File

Execute an EzLang program:

```bash
ezlang run <file>
```

**Example:**
```bash
ezlang run examples/01-variables-arithmetic.ezlang
ezlang run mybot.ezlang
```

The run command will:
1. Tokenize the source code
2. Parse into an AST
3. Execute the program
4. Display any output from `print()` statements
5. Report any errors with line and column numbers

### Check Syntax

Validate syntax without executing:

```bash
ezlang check <file>
```

**Example:**
```bash
ezlang check examples/discord-hello-bot.ezlang
```

This is useful for:
- Quick syntax validation
- CI/CD pipelines
- Editor integration
- Pre-commit hooks

### Start REPL

Launch the interactive REPL:

```bash
ezlang repl
```

See [REPL.md](./REPL.md) for detailed REPL documentation.

### Version

Display version information:

```bash
ezlang version
# or
ezlang -v
# or
ezlang --version
```

### Help

Show help information:

```bash
ezlang help
# or
ezlang --help
```

## Error Handling

The CLI provides clear error messages with context:

### Syntax Errors

```
Error: Unexpected token '}'
  at line 10, column 1

  8 |   return a + b
  9 | }
 10 | }
    | ^
```

### Runtime Errors

```
Error: Undefined variable 'foo'
  at line 5, column 3

  3 | var x = 10
  4 | var y = 20
  5 | print(foo)
    |       ^^^
```

### File Not Found

```
Error: File not found: myfile.ezlang
```

## Exit Codes

The CLI uses standard exit codes:

- `0` - Success
- `1` - Error (syntax, runtime, or file not found)

This makes it easy to use in scripts:

```bash
#!/bin/bash

if ezlang check mybot.ezlang; then
  echo "Syntax OK"
  ezlang run mybot.ezlang
else
  echo "Syntax error"
  exit 1
fi
```

## NPM Scripts

The project includes convenient npm scripts:

```bash
# Build the project
npm run build

# Run a file (after building)
npm start run examples/01-variables-arithmetic.ezlang

# Start REPL
npm run dev
# or
npm run start:repl

# Run CLI tests
npm run test:cli

# Run REPL tests
npm run test:repl
```

## Command-Line Arguments

Pass arguments to EzLang programs (feature planned):

```bash
ezlang run mybot.ezlang --token=xyz --channel=123
```

Access in your program:

```ezlang
var token = get_argument("token")
var channel = get_argument("channel")
```

## Examples

### Basic Usage

```bash
# Check syntax
ezlang check hello.ezlang

# Run if syntax is OK
ezlang run hello.ezlang
```

### CI/CD Pipeline

```yaml
# .github/workflows/test.yml
name: Test EzLang

on: [push]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run build
      - run: ezlang check mybot.ezlang
```

### Development Workflow

```bash
# Terminal 1: Watch for changes
npm run test:watch

# Terminal 2: Interactive testing
ezlang repl

# Terminal 3: Run examples
ezlang run examples/*.ezlang
```

## Troubleshooting

### Command Not Found

If `ezlang` command is not found:

```bash
# Use npm run or node directly
npm run start:repl
node dist/index.js repl

# Or install globally
npm link
```

### Permission Denied

Make sure the dist/index.js has execute permissions:

```bash
chmod +x dist/index.js
```

### Module Errors

If you get module errors, rebuild:

```bash
npm run clean
npm run build
```

## Advanced Usage

### Piping Input

Pipe code into the REPL:

```bash
echo "var x = 10; print(x)" | ezlang repl
```

### Redirecting Output

Save output to a file:

```bash
ezlang run mybot.ezlang > output.log 2>&1
```

### Silent Mode

Suppress progress messages (planned feature):

```bash
ezlang run --quiet mybot.ezlang
```

## See Also

- [REPL.md](./REPL.md) - Interactive REPL documentation
- [README.md](./README.md) - General documentation
- [RUNTIME.md](./RUNTIME.md) - Runtime and built-in functions
- [DISCORD.md](./DISCORD.md) - Discord bot features
