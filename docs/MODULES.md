# EasyLang Module System (Cogs)

The EasyLang module system allows you to organize your bot code into separate, reusable files called **modules** (similar to Discord.py's "cogs"). This enables better code organization, hot-reloading, and maintainable large-scale bots.

## Table of Contents

- [Overview](#overview)
- [Creating Modules](#creating-modules)
- [Loading Modules](#loading-modules)
- [Module Functions](#module-functions)
- [Hot-Reloading](#hot-reloading)
- [Best Practices](#best-practices)
- [Examples](#examples)
- [API Reference](#api-reference)

## Overview

### What are Modules?

Modules are self-contained EasyLang files that:
- Export functions and variables for use by other code
- Can be loaded and unloaded dynamically
- Support hot-reloading without restarting the bot
- Provide isolated namespaces to avoid naming conflicts
- Track their own event handlers and resources

### Key Features

- **Automatic Export Detection**: Functions starting with `export_` are automatically exported
- **Module Isolation**: Each module has its own environment
- **Hot-Reloading**: Update modules without restarting the bot
- **Dependency Tracking**: Prevent circular dependencies
- **Resource Cleanup**: Proper cleanup when modules are unloaded
- **Metadata Tracking**: Track load times, reload counts, and more

## Creating Modules

### Basic Module Structure

Create a file with `.ez` extension. Optionally add a `@module` pragma:

```easylang
# @module ModuleName

# Functions starting with export_ are automatically exported
export_my_function(param) {
    print("Hello from module!")
    return param * 2
}

# Private functions are not exported
helper_function(x) {
    return x + 1
}

# Use exported function
export_process_data(value) {
    result = helper_function(value)
    return result
}
```

### Module Naming

The module name is determined by:
1. The `@module` pragma if present: `# @module MyModule`
2. Otherwise, the filename without extension: `math_utils.ez` → `MathUtils`

### Exporting Functions

**Automatic Export** (Recommended):
```easylang
# Automatically exported as "calculate"
export_calculate(x, y) {
    return x + y
}
```

**Manual Export**:
```easylang
# Define function normally
my_variable = 42

# Explicitly export it (advanced use)
export("my_var", my_variable)
```

### Private vs Public

```easylang
# Public (exported) - available to importers
export_public_function() {
    return "I'm accessible!"
}

# Private - only available within module
private_helper() {
    return "I'm internal!"
}
```

## Loading Modules

### load_module(file_path)

Load a module from a file path:

```easylang
# Load a module
math_mod = load_module("modules/math_utils.ez")

# Use exported functions
result = math_mod.factorial(5)
print(result)  # Output: 120
```

### Relative and Absolute Paths

```easylang
# Relative to current file
module1 = load_module("./utils/helpers.ez")

# Relative to project root
module2 = load_module("modules/commands.ez")

# Absolute path
module3 = load_module("/home/user/bot/modules/admin.ez")

# .ez extension is optional
module4 = load_module("modules/math_utils")  # Automatically adds .ez
```

## Module Functions

### load_module(file_path)

Load and execute a module file.

**Parameters:**
- `file_path` (string): Path to the module file

**Returns:** Module object with all exported functions/variables

**Example:**
```easylang
utils = load_module("modules/utils.ez")
result = utils.helper_function(42)
```

### unload_module(module_name)

Unload a module and clean up its resources.

**Parameters:**
- `module_name` (string): Name of the module to unload

**Returns:** Boolean indicating success

**Example:**
```easylang
success = unload_module("MathUtils")
if success {
    print("Module unloaded successfully")
}
```

### reload_module(module_name)

Reload a module (unload + load).

**Parameters:**
- `module_name` (string): Name of the module to reload

**Returns:** Updated module object

**Example:**
```easylang
# After editing the module file
updated_module = reload_module("CommandsModule")
```

### list_modules()

Get information about all loaded modules.

**Returns:** Array of module info objects

**Example:**
```easylang
modules = list_modules()
for mod in modules {
    print("Module: " + mod.name)
    print("  File: " + mod.file_path)
    print("  Loaded at: " + mod.loaded_at)
    print("  Reloads: " + mod.reload_count)
    print("  Exports: " + mod.export_count)
}
```

### get_module(module_name)

Get a reference to a loaded module.

**Parameters:**
- `module_name` (string): Name of the module

**Returns:** Module object

**Example:**
```easylang
math = get_module("MathUtils")
result = math.factorial(10)
```

### module_exists(module_name)

Check if a module is loaded.

**Parameters:**
- `module_name` (string): Name of the module

**Returns:** Boolean

**Example:**
```easylang
if module_exists("AdminCommands") {
    admin = get_module("AdminCommands")
    admin.init()
}
```

## Hot-Reloading

### What is Hot-Reloading?

Hot-reloading allows you to update module code without restarting the bot. This is essential for:
- Fixing bugs in production
- Adding new commands
- Updating functionality
- Testing changes quickly

### How to Hot-Reload

**Manual Reload:**
```easylang
# In your bot code
listen("messageCreate", message) {
    content = get_message_content(message)

    if starts_with(content, "!reload commands") {
        reload_module("CommandsModule")
        reply(message, "✅ Commands reloaded!")
    }
}
```

**Automatic Reload on File Change** (requires file watcher):
```easylang
# Watch for file changes and auto-reload
# (This would require implementing a file watcher)
```

### What Gets Reloaded?

When you reload a module:
- ✅ Function definitions are updated
- ✅ Variable values are reset
- ✅ Event handlers are re-registered
- ❌ Active connections persist
- ❌ Global state outside module is unchanged

### Safety Considerations

```easylang
# Good: Stateless command handler
export_handle_ping(message) {
    reply(message, "Pong!")
}

# Caution: Stateful module
module_counter = 0  # Resets to 0 on reload!

export_increment() {
    module_counter = module_counter + 1
    return module_counter
}
```

## Best Practices

### 1. Organize by Functionality

```
modules/
├── commands/
│   ├── admin.ez
│   ├── fun.ez
│   └── utility.ez
├── events/
│   ├── moderation.ez
│   └── welcome.ez
└── utils/
    ├── database.ez
    └── helpers.ez
```

### 2. Use Clear Export Names

```easylang
# Good: Clear, descriptive names
export_handle_ban_command(message, user, reason)
export_calculate_user_level(xp)
export_format_timestamp(date)

# Avoid: Generic names
export_handle(x)
export_do(a, b, c)
```

### 3. Keep Modules Focused

Each module should have a single responsibility:

```easylang
# ✅ Good: Focused module
# @module ModerationCommands

export_handle_ban(message, user, reason)
export_handle_kick(message, user, reason)
export_handle_mute(message, user, duration)
export_check_mod_permissions(member)
```

```easylang
# ❌ Bad: Too many responsibilities
# @module Everything

export_handle_ban(...)
export_play_music(...)
export_fetch_weather(...)
export_calculate_math(...)
```

### 4. Handle Errors Gracefully

```easylang
export_safe_command(message) {
    # Use try-catch when available
    result = potentially_failing_operation()

    if result == null {
        reply(message, "❌ Operation failed")
        return
    }

    reply(message, "✅ Success!")
}
```

### 5. Document Your Exports

```easylang
# Calculate factorial of a number
# Parameters:
#   n - The number to calculate factorial for
# Returns:
#   The factorial of n
export_factorial(n) {
    if n <= 1 {
        return 1
    }
    return n * export_factorial(n - 1)
}
```

## Examples

### Example 1: Math Utilities Module

**File: `modules/math_utils.ez`**
```easylang
# @module MathUtils

export_factorial(n) {
    if n <= 1 {
        return 1
    }
    return n * export_factorial(n - 1)
}

export_is_prime(num) {
    if num < 2 {
        return false
    }

    i = 2
    while i * i <= num {
        if num % i == 0 {
            return false
        }
        i = i + 1
    }

    return true
}

export_fibonacci(n) {
    if n <= 1 {
        return n
    }
    return export_fibonacci(n - 1) + export_fibonacci(n - 2)
}
```

**Usage:**
```easylang
math = load_module("modules/math_utils.ez")

print(math.factorial(5))      # 120
print(math.is_prime(17))      # true
print(math.fibonacci(10))     # 55
```

### Example 2: Discord Commands Module

**File: `modules/fun_commands.ez`**
```easylang
# @module FunCommands

export_handle_dice(message) {
    roll = random(1, 6)
    reply(message, "🎲 You rolled: " + str(roll))
}

export_handle_flip(message) {
    result = random(0, 1)
    coin = "Heads"
    if result == 1 {
        coin = "Tails"
    }
    reply(message, "🪙 Coin flip: " + coin)
}

export_handle_8ball(message, question) {
    responses = [
        "Yes, definitely!",
        "It is certain",
        "Reply hazy, try again",
        "Don't count on it",
        "My sources say no"
    ]

    index = random(0, 4)
    reply(message, "🎱 " + responses[index])
}
```

**Main Bot File:**
```easylang
token = get_argument("TOKEN")

# Load fun commands module
fun = load_module("modules/fun_commands.ez")

listen("messageCreate", message) {
    author = get_message_author(message)
    if get_user_bot(author) {
        return
    }

    content = get_message_content(message)

    if starts_with(content, "!dice") {
        fun.handle_dice(message)
    }

    if starts_with(content, "!flip") {
        fun.handle_flip(message)
    }

    if starts_with(content, "!8ball") {
        question = substr(content, 7, length(content))
        fun.handle_8ball(message, question)
    }

    # Hot-reload command
    if starts_with(content, "!reload fun") {
        reload_module("FunCommands")
        reply(message, "✅ Fun commands reloaded!")
    }
}

bot_start(token)
```

### Example 3: Database Module

**File: `modules/database.ez`**
```easylang
# @module Database

# In-memory user data (would be replaced with real DB)
user_data = {}

export_save_user(user_id, data) {
    user_data[user_id] = data
    print("Saved data for user: " + user_id)
}

export_get_user(user_id) {
    if user_id in user_data {
        return user_data[user_id]
    }
    return null
}

export_delete_user(user_id) {
    if user_id in user_data {
        user_data[user_id] = null
        return true
    }
    return false
}

export_get_all_users() {
    return user_data
}
```

### Example 4: Module with Events

**File: `modules/welcome.ez`**
```easylang
# @module WelcomeModule

export_setup_events() {
    # This would need support for module-scoped event handlers
    # Events registered here should be cleaned up when module unloads
}

export_handle_member_join(member) {
    guild = get_member_guild(member)
    user = get_member_user(member)
    username = get_user_username(user)

    system_channel = get_guild_system_channel(guild)
    if system_channel != null {
        welcome = "👋 Welcome " + username + " to the server!"
        send_channel_message(system_channel, welcome)
    }
}
```

## API Reference

### Module Object Properties

When you load a module, you get an object with:

```easylang
module = load_module("path/to/module.ez")

# Access exported functions
module.exported_function()

# Access module metadata
print(module.__name__)    # Module name
print(module.__file__)    # Module file path
```

### Module Info Object

Returned by `list_modules()`:

```easylang
{
    name: "ModuleName",           # Module name
    file_path: "/path/to/file",   # Absolute file path
    loaded_at: "2024-01-15...",   # ISO timestamp
    reload_count: "0",            # Number of times reloaded
    export_count: "5",            # Number of exports
    event_handlers: "2"           # Number of registered handlers
}
```

### Error Handling

Common errors and how to handle them:

**Module Not Found:**
```easylang
# Will throw error if file doesn't exist
module = load_module("nonexistent.ez")
# Error: Module file not found: nonexistent.ez
```

**Module Name Conflict:**
```easylang
# Loading two different files with same module name
module1 = load_module("path1/utils.ez")  # @module Utils
module2 = load_module("path2/utils.ez")  # @module Utils
# Error: Module name conflict: 'Utils' is already registered
```

**Circular Dependencies:**
```easylang
# module_a.ez imports module_b.ez
# module_b.ez imports module_a.ez
# Error: Circular dependency detected
```

## Advanced Topics

### Module Lifecycle

1. **Load**: Parse file, create environment, execute code
2. **Run**: Functions available for use
3. **Reload**: Unload old version, load new version
4. **Unload**: Clean up resources, remove from registry

### Resource Management

Modules should clean up after themselves:

```easylang
# Good: Cleanup is automatic for most resources
export_create_webhook(channel) {
    webhook = create_webhook(channel, "MyWebhook")
    return webhook
}

# If you need manual cleanup, track resources
export_cleanup() {
    # Clean up any persistent resources
}
```

### State Preservation

To preserve state across reloads, use external storage:

```easylang
# Store state in a file or database
export_save_state() {
    data = get_current_state()
    fs_write_file("module_state.json", data)
}

export_load_state() {
    if fs_exists("module_state.json") {
        data = fs_read_file("module_state.json")
        restore_state(data)
    }
}
```

## Troubleshooting

### Module Won't Load

Check:
- File path is correct
- File has `.ez` extension
- Syntax is valid
- No runtime errors in module code

### Functions Not Exported

Ensure:
- Function names start with `export_`
- Functions are defined at module level (not inside other functions)

### Hot-Reload Not Working

Verify:
- Using correct module name
- Module is already loaded
- No syntax errors in updated code

### Memory Leaks

Prevent:
- Clean up event handlers properly
- Don't create global state
- Unload unused modules

## Conclusion

The EasyLang module system provides powerful organization and hot-reloading capabilities for Discord bots. Use modules to:

- ✅ Organize code by functionality
- ✅ Enable hot-reloading without restarts
- ✅ Create reusable utility libraries
- ✅ Separate concerns in large bots
- ✅ Improve code maintainability

For more examples, see the `examples/modules-example/` directory.
