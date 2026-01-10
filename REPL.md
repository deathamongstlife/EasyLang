# EzLang REPL Documentation

The EzLang REPL (Read-Eval-Print Loop) provides an interactive environment for executing EzLang code, testing ideas, and learning the language.

## Starting the REPL

```bash
ezlang repl
# or
npm run start:repl
# or
npm run dev
```

You'll see:

```
Welcome to EzLang REPL v1.0.0
Type .help for commands, .exit to quit

>
```

## Basic Usage

### Simple Expressions

```ezlang
> 1 + 2
3

> "Hello" + " " + "World"
Hello World

> 10 * 5
50
```

### Variables

Variables persist between commands:

```ezlang
> var x = 10
> var y = 20
> x + y
30

> var name = "Alice"
> "Hello, " + name
Hello, Alice
```

### Functions

Define and call functions:

```ezlang
> function add(a, b) {
... return a + b
... }
> add(5, 3)
8

> function greet(name) {
... return "Hello, " + name
... }
> greet("Bob")
Hello, Bob
```

### Arrays

```ezlang
> var arr = [1, 2, 3, 4, 5]
> arr[0]
1

> arr[2]
3

> length(arr)
5
```

### Control Flow

```ezlang
> var x = 10
> if (x > 5) {
... print("x is greater than 5")
... }
x is greater than 5
```

## Multi-line Input

The REPL automatically detects when you need to enter multiple lines (for functions, if statements, loops, etc.):

```ezlang
> function factorial(n) {
...   if (n <= 1) {
...     return 1
...   }
...   return n * factorial(n - 1)
... }
> factorial(5)
120
```

The prompt changes from `>` to `...` to indicate multi-line mode. The REPL exits multi-line mode when braces are balanced.

## Special Commands

All special commands start with a dot (`.`):

### .help

Show REPL help:

```
> .help

EzLang REPL Commands:
  .help     - Show this help message
  .clear    - Clear the screen
  .vars     - Show all defined variables
  .history  - Show command history
  .exit     - Exit the REPL
  .quit     - Exit the REPL
```

### .clear

Clear the screen:

```
> .clear
```

This clears the terminal and redisplays the welcome message.

### .vars

Show all defined variables:

```
> var x = 10
> var y = 20
> function add(a, b) { return a + b }
> .vars

Defined Variables:
  print = <native function print>
  length = <native function length>
  random = <native function random>
  wait = <native function wait>
  range = <native function range>
  get_argument = <native function get_argument>
  type = <native function type>
  str = <native function str>
  num = <native function num>
  push = <native function push>
  pop = <native function pop>
  bot_start = <native function bot_start>
  x = 10
  y = 20
  add = <function add>
```

Built-in functions are shown first, followed by user-defined variables and functions.

### .history

Show recent command history:

```
> .history

Command History:
  1: var x = 10
  2: var y = 20
  3: x + y
  4: function add(a, b) { return a + b }
  5: add(5, 3)
```

History is limited to the last 20 commands for display, but up to 1000 commands are saved.

### .exit or .quit

Exit the REPL:

```
> .exit
Goodbye!
```

You can also press `Ctrl+C` (twice if in multi-line mode) or `Ctrl+D`.

## Color-Coded Output

The REPL uses colors to make output easier to read:

- **Numbers** - Yellow
- **Strings** - Green
- **Booleans** - Blue
- **Arrays** - Magenta
- **Functions** - Cyan
- **Errors** - Red
- **Prompts** - Green/Gray

## Command History

### Persistent History

Command history is saved to `~/.ezlang_history` and persists between sessions.

### Navigation

Use arrow keys to navigate history:

- `↑` (Up) - Previous command
- `↓` (Down) - Next command

### History Size

- Display limit: 20 most recent commands
- Storage limit: 1000 commands
- History file: `~/.ezlang_history`

## Error Handling

The REPL handles errors gracefully and doesn't crash:

```ezlang
> var x = 10
> print(y)
Error: Undefined variable 'y'
  at line 1, column 7

> var y = 20
> print(y)
20
```

## Tips and Tricks

### Quick Testing

Test code snippets quickly:

```ezlang
> var nums = [1, 2, 3, 4, 5]
> for (n in nums) { print(n * 2) }
2
4
6
8
10
```

### Function Development

Develop functions iteratively:

```ezlang
> function sum(arr) {
... var total = 0
... for (n in arr) {
...   total = total + n
... }
... return total
... }
> sum([1, 2, 3, 4, 5])
15
```

### Debugging

Use the REPL to debug expressions:

```ezlang
> var x = 10
> var y = 20
> type(x)
number
> type(x + y)
number
> str(x + y)
30
```

### Learning

Explore built-in functions:

```ezlang
> range(1, 5)
[1, 2, 3, 4]

> random(1, 10)
7

> length("Hello")
5
```

## Non-Interactive Mode

Pipe commands into the REPL:

```bash
echo "var x = 10; print(x)" | ezlang repl
```

Or use a file:

```bash
cat commands.txt | ezlang repl
```

Example commands.txt:

```
var x = 10
var y = 20
print(x + y)
.exit
```

## Keyboard Shortcuts

- `Ctrl+C` - Cancel multi-line input or exit REPL
- `Ctrl+D` - Exit REPL
- `↑`/`↓` - Navigate command history
- `←`/`→` - Move cursor in line
- `Home`/`End` - Jump to line start/end
- `Ctrl+A` - Jump to line start
- `Ctrl+E` - Jump to line end

## Limitations

Current limitations:

1. No syntax highlighting (planned)
2. No auto-completion (planned)
3. No multi-line editing with arrow keys
4. Cannot edit previous lines in multi-line mode

## Examples

### Math Operations

```ezlang
> var radius = 5
> var pi = 3.14159
> var area = pi * radius * radius
> area
78.53975
```

### String Operations

```ezlang
> var firstName = "John"
> var lastName = "Doe"
> var fullName = firstName + " " + lastName
> fullName
John Doe
```

### Array Operations

```ezlang
> var numbers = [1, 2, 3]
> push(numbers, 4)
> push(numbers, 5)
> numbers
[1, 2, 3, 4, 5]
> pop(numbers)
5
> numbers
[1, 2, 3, 4]
```

### Loops

```ezlang
> var sum = 0
> for (i in range(1, 11)) {
... sum = sum + i
... }
> sum
55
```

### Fibonacci Sequence

```ezlang
> function fibonacci(n) {
...   if (n <= 1) return n
...   return fibonacci(n - 1) + fibonacci(n - 2)
... }
> for (i in range(0, 10)) {
... print("fib(" + str(i) + ") = " + str(fibonacci(i)))
... }
fib(0) = 0
fib(1) = 1
fib(2) = 1
fib(3) = 2
fib(4) = 3
fib(5) = 5
fib(6) = 8
fib(7) = 13
fib(8) = 21
fib(9) = 34
```

## Troubleshooting

### REPL Won't Start

```bash
# Make sure the project is built
npm run build

# Try running directly
node dist/index.js repl
```

### History Not Saving

Check permissions on `~/.ezlang_history`:

```bash
ls -la ~/.ezlang_history
chmod 644 ~/.ezlang_history
```

### Colors Not Showing

Some terminals don't support colors. Try:

```bash
export FORCE_COLOR=1
ezlang repl
```

### Multi-line Mode Stuck

Press `Ctrl+C` to cancel multi-line input and return to normal mode.

## See Also

- [CLI.md](./CLI.md) - Command-line interface documentation
- [README.md](./README.md) - General documentation
- [RUNTIME.md](./RUNTIME.md) - Runtime and built-in functions
- [DISCORD.md](./DISCORD.md) - Discord bot features
