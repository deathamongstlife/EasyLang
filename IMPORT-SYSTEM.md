# EzLang Import System

## Overview

EzLang now supports a file import/module system that allows you to organize your code across multiple files. This is especially useful for building larger Discord bots with proper code organization.

## Basic Usage

### Import Statement Syntax

```ezlang
import "path/to/file.ez"
```

The import statement loads and executes another EzLang file, making all its functions and variables available in the current scope.

## Features

### 1. Shared Scope

Imported files share the same environment (scope) as the importing file. This means:
- Functions defined in imported files are immediately available
- Variables declared in imported files are accessible
- All imports share the global scope

### 2. Path Resolution

#### Relative Paths
```ezlang
import "utils.ez"              // Same directory
import "utils/logger.ez"       // Subdirectory
import "../config.ez"          // Parent directory
```

#### Automatic `.ez` Extension
If you omit the `.ez` extension, it will be added automatically:
```ezlang
import "utils"              // Resolves to "utils.ez"
import "helpers/math"       // Resolves to "helpers/math.ez"
```

### 3. Circular Import Prevention

The import system prevents circular imports automatically. If file A imports file B, and file B tries to import file A, the second import is skipped to prevent infinite loops.

### 4. Import Caching

Each file is only executed once per program run. Subsequent imports of the same file are skipped, ensuring:
- No duplicate function/variable declarations
- Faster execution
- Consistent behavior

## Examples

### Example 1: Basic Module Organization

**utils/logger.ez:**
```ezlang
function log_info(message) {
    print("[INFO] " + message)
}

function log_error(message) {
    print("[ERROR] " + message)
}
```

**utils/math.ez:**
```ezlang
function add(a, b) {
    return a + b
}

function multiply(a, b) {
    return a * b
}

var pi = 3.14159
```

**main.ez:**
```ezlang
import "utils/logger.ez"
import "utils/math.ez"

log_info("Starting calculations")

var result = multiply(pi, 10)
print("Result: " + result)

log_info("Complete")
```

### Example 2: Discord Bot Organization

**config.ez:**
```ezlang
var bot_token = "your-bot-token"
var prefix = "!"
var admin_role = "Admin"
```

**utils/permissions.ez:**
```ezlang
import "../config.ez"

function is_admin(member) {
    return member.roles.has(admin_role)
}

function check_permission(member, permission) {
    // Permission checking logic
    return true
}
```

**commands/ping.ez:**
```ezlang
import "../utils/permissions.ez"

function handle_ping(message) {
    if is_admin(message.author) {
        message.reply("Pong! (Admin)")
    } else {
        message.reply("Pong!")
    }
}
```

**main.ez:**
```ezlang
import "config.ez"
import "utils/permissions.ez"
import "commands/ping.ez"

listen "messageCreate" (message) {
    if message.content == prefix + "ping" {
        handle_ping(message)
    }
}
```

### Example 3: Modular Discord Bot

**events/ready.ez:**
```ezlang
import "../utils/logger.ez"

listen "ready" (client) {
    log_info("Bot is online!")
    log_info("Serving " + client.guilds.size + " guilds")
}
```

**events/messageCreate.ez:**
```ezlang
import "../utils/logger.ez"
import "../commands/handler.ez"

listen "messageCreate" (message) {
    if message.author.bot {
        return
    }

    log_info("Message from: " + message.author.username)
    handle_command(message)
}
```

**main.ez:**
```ezlang
import "config.ez"
import "events/ready.ez"
import "events/messageCreate.ez"

// Bot automatically starts with imported event handlers
```

## How It Works

### Import Resolution Process

1. **Path Resolution**: The import path is resolved relative to the current file's directory
2. **Extension Handling**: If no `.ez` extension is present, it's added automatically
3. **Path Normalization**: The path is normalized for consistent tracking
4. **Circular Check**: If the file is already being imported, the import is skipped
5. **File Loading**: The file is read from disk
6. **Parsing**: The file is tokenized and parsed into an AST
7. **Execution**: The file is executed in the current environment (shared scope)
8. **Tracking**: The file is marked as imported to prevent re-importing

### Circular Import Handling

When circular imports are detected:

```ezlang
// file-a.ez
print("Loading A")
import "file-b.ez"
print("A complete")

// file-b.ez
print("Loading B")
import "file-a.ez"  // This import is skipped
print("B complete")
```

Output:
```
Loading A
Loading B
B complete
A complete
```

The second import of `file-a.ez` from within `file-b.ez` is automatically skipped because `file-a.ez` is already in the process of being imported.

## Best Practices

### 1. Organize by Feature
```
bot/
  ├── main.ez
  ├── config.ez
  ├── utils/
  │   ├── logger.ez
  │   ├── permissions.ez
  │   └── helpers.ez
  ├── commands/
  │   ├── ping.ez
  │   ├── help.ez
  │   └── moderation.ez
  └── events/
      ├── ready.ez
      ├── messageCreate.ez
      └── interactionCreate.ez
```

### 2. Use Clear Naming
- Use descriptive file names
- Group related functionality
- Keep files focused on single responsibilities

### 3. Import Order
- Import configuration first
- Import utilities before features
- Import events last in main file

### 4. Avoid Deep Nesting
- Keep import paths simple
- Use relative paths wisely
- Consider flatter structures for small projects

## Limitations

1. **No Export Control**: All functions and variables in imported files are added to the global scope
2. **No Namespacing**: Imported items are not namespaced, so naming conflicts are possible
3. **File System Only**: Imports only work with local files, not URLs or packages
4. **Single Environment**: All imports share the same global environment

## Error Handling

### File Not Found
```ezlang
import "nonexistent.ez"
```
Error: `Import error: File not found: nonexistent.ez`

### Invalid Path
If the path cannot be resolved or accessed, a runtime error is thrown with details about the failed import.

## Technical Details

- **Implementation**: Imports are resolved at runtime during program execution
- **Scope**: All imports share the global environment
- **Caching**: Files are tracked using absolute, normalized paths
- **Execution**: Imported files are executed in order of import statements
- **Nesting**: Imports can be nested (files can import other files)

## Future Enhancements

Potential future improvements to the import system:
- Named imports/exports
- Namespace support
- Module aliasing
- Import from URLs
- Standard library modules
- Package management
