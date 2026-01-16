# Module System Examples

This directory contains examples demonstrating the EasyLang module system (cogs).

## Files

### `main.ez`
The main bot file that demonstrates:
- Loading multiple modules
- Using module exports
- Hot-reloading modules
- Module management commands

### `math_utils.ez`
Example utility module showing:
- Mathematical functions
- Private helper functions
- Automatic export detection

### `commands_module.ez`
Discord command module demonstrating:
- Command handlers
- Hot-reloadable commands
- Permission checks

### `events_module.ez`
Event handler module showing:
- Member join/leave events
- Message events
- Role events

## Running the Examples

1. Install dependencies:
```bash
bun install
```

2. Set your Discord bot token:
```bash
export TOKEN=your_discord_bot_token
```

3. Run the main bot:
```bash
bun run src/index.ts examples/modules-example/main.ez TOKEN=$TOKEN
```

## Testing Module Features

### Test Math Module
The bot will automatically test the math module on startup:
```
Factorial of 5: 120
Is 17 prime? true
Fibonacci(10): 55
Sum of [1,2,3,4,5]: 15
```

### Test Discord Commands
In Discord, try these commands:
- `!dice` - Roll a dice
- `!flip` - Flip a coin
- `!greet` - Get a greeting
- `!serverinfo` - Show server information

### Test Hot-Reloading
1. Edit `commands_module.ez` while the bot is running
2. In Discord, run `!reload` (requires admin permission)
3. The module will reload with your changes

### Test Module Management
Use `!modules` to see all loaded modules:
```
📦 Loaded Modules:
• MathUtils (reloaded 0 times)
• CommandsModule (reloaded 2 times)
```

## Module Structure

### math_utils.ez
```easylang
# @module MathUtils

export_factorial(n) { ... }
export_is_prime(num) { ... }
export_fibonacci(n) { ... }
export_sum_array(arr) { ... }
```

### commands_module.ez
```easylang
# @module CommandsModule

export_handle_dice(message) { ... }
export_handle_flip(message) { ... }
export_handle_greet(message) { ... }
export_handle_serverinfo(message) { ... }
export_is_admin(message) { ... }
```

## Key Concepts Demonstrated

1. **Module Loading**: `load_module("path/to/module.ez")`
2. **Using Exports**: `module.exported_function(args)`
3. **Hot-Reloading**: `reload_module("ModuleName")`
4. **Module Info**: `list_modules()`
5. **Automatic Exports**: Functions starting with `export_`
6. **Module Isolation**: Each module has its own scope
7. **Shared Built-ins**: All modules can use Discord functions

## Extending the Examples

### Add a New Module

1. Create a new `.ez` file:
```easylang
# @module MyNewModule

export_my_function(param) {
    print("Hello from my module!")
    return param * 2
}
```

2. Load it in `main.ez`:
```easylang
my_module = load_module("examples/modules-example/my_new_module.ez")
result = my_module.my_function(21)
```

### Add More Commands

Edit `commands_module.ez` and add:
```easylang
export_handle_newcommand(message) {
    reply(message, "This is a new command!")
}
```

Then in `main.ez`:
```easylang
if starts_with(content, "!newcommand") {
    commands.handle_newcommand(message)
}
```

### Create an Admin Module

```easylang
# @module AdminModule

export_handle_clear(message, count) {
    # Clear messages
}

export_handle_ban(message, user, reason) {
    # Ban user
}

export_is_moderator(member) {
    # Check if user is moderator
}
```

## Best Practices

1. **One Purpose Per Module**: Keep modules focused
2. **Use Clear Names**: `export_handle_ping` not `export_h`
3. **Document Functions**: Add comments explaining parameters
4. **Handle Errors**: Check for null/invalid input
5. **Test Before Reload**: Ensure code is valid before hot-reloading

## Troubleshooting

### Module Not Found
- Check file path is correct
- Ensure file exists and has `.ez` extension
- Use absolute or relative path from main file

### Function Not Exported
- Ensure function name starts with `export_`
- Check function is defined at module level
- Verify module loaded successfully

### Reload Fails
- Check for syntax errors in updated code
- Ensure module name is correct
- Verify you have admin permissions

## Learn More

See the full documentation: `docs/MODULES.md`
