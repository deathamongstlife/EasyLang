# Command-Line Arguments with `get_argument()`

The `get_argument()` built-in function allows you to pass configuration values to your EzLang programs from the command line.

## Syntax

```ezlang
get_argument(key, default)
```

- `key` (string, required): The name of the argument to retrieve
- `default` (any type, optional): The value to return if the argument is not found. If not provided, returns `null`.

## Usage

### Basic Example

```bash
ezlang run bot.ezlang DISCORD_TOKEN=abc123
```

```ezlang
var token = get_argument("DISCORD_TOKEN", "default_token")
print(token)  // Output: abc123
```

### Multiple Arguments

```bash
ezlang run server.ezlang HOST=0.0.0.0 PORT=3000 DEBUG=true
```

```ezlang
var host = get_argument("HOST", "localhost")
var port = get_argument("PORT", "8080")
var debug = get_argument("DEBUG", "false")

print("Server configuration:")
print("  Host:", host)
print("  Port:", port)
print("  Debug:", debug)
```

### Without Default Value

```ezlang
// Returns null if OPTIONAL_KEY is not provided
var optional = get_argument("OPTIONAL_KEY")

if optional == null {
    print("Optional key not provided")
} else {
    print("Optional key:", optional)
}
```

## Argument Format

Arguments must be passed in `KEY=VALUE` format:

```bash
ezlang run program.ezlang KEY1=value1 KEY2=value2
```

### Valid Arguments

- `TOKEN=abc123` - Standard key-value pair
- `PORT=3000` - Numeric values (returned as strings)
- `EMPTY=` - Empty value (returns empty string, not default)
- `URL=https://example.com:8080/path?query=1` - Special characters
- `CONFIG=key=value` - Values can contain equals signs

### Invalid Arguments (Ignored)

- `someArgument` - No equals sign (skipped)
- `--flag` - Command-line flags (skipped)
- `-v` - Short options (skipped)

## Key Features

1. **Case-Sensitive**: `TOKEN` and `token` are different keys
2. **Type**: All values are returned as strings
3. **Empty Values**: `KEY=` returns an empty string `""`, not the default value
4. **Multiple Equals**: `KEY=a=b=c` returns `"a=b=c"` (everything after first `=`)
5. **First Match**: If duplicate keys exist, the first one is returned
6. **Order**: Arguments can appear in any order on the command line

## Type Conversion

Since all values are returned as strings, you may need to convert them:

```ezlang
// Convert to number
var port_str = get_argument("PORT", "8080")
var port_num = num(port_str)

// Convert to boolean-like logic
var debug = get_argument("DEBUG", "false")
if debug == "true" {
    print("Debug mode enabled")
}
```

## Discord Bot Example

```bash
ezlang run bot.ezlang DISCORD_TOKEN=YOUR_TOKEN_HERE PREFIX=!
```

```ezlang
var token = get_argument("DISCORD_TOKEN", "")
var prefix = get_argument("PREFIX", "!")

if token == "" {
    print("Error: DISCORD_TOKEN is required")
    print("Usage: ezlang run bot.ezlang DISCORD_TOKEN=your_token")
} else {
    print("Starting bot with prefix:", prefix)
    bot_start(token)
}
```

## Environment-Specific Configuration

```bash
# Development
ezlang run app.ezlang ENV=development

# Production
ezlang run app.ezlang ENV=production MAX_USERS=1000
```

```ezlang
var env = get_argument("ENV", "development")
var max_users_str = get_argument("MAX_USERS", "100")
var max_users = num(max_users_str)

print("Environment:", env)
print("Max users:", max_users)

if env == "production" {
    print("Running in production mode")
    // Production-specific logic
} else {
    print("Running in development mode")
    // Development-specific logic
}
```

## Best Practices

1. **Always provide defaults**: Make your programs work without arguments
   ```ezlang
   var token = get_argument("TOKEN", "default_value")
   ```

2. **Validate inputs**: Check that required arguments are provided
   ```ezlang
   var token = get_argument("DISCORD_TOKEN", "")
   if token == "" {
       print("Error: DISCORD_TOKEN is required")
   }
   ```

3. **Document usage**: Add usage instructions in your program
   ```ezlang
   print("Usage: ezlang run program.ezlang KEY=value")
   ```

4. **Use uppercase for keys**: Convention for environment-like variables
   ```ezlang
   var token = get_argument("DISCORD_TOKEN", "default")
   ```

## Complete Example

See `examples/command-line-args.ezlang` for a comprehensive example demonstrating all features.

```bash
ezlang run examples/command-line-args.ezlang TOKEN=abc123 PORT=3000 DEBUG=true
```
