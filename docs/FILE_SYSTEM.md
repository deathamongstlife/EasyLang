# File System Functions

Complete reference for EzLang's file system built-in functions. These functions enable dynamic bot loading, configuration management, and file-based operations.

## Table of Contents

- [Overview](#overview)
- [Directory Operations](#directory-operations)
- [File Operations](#file-operations)
- [Path Utilities](#path-utilities)
- [Common Patterns](#common-patterns)
- [Best Practices](#best-practices)
- [Examples](#examples)

---

## Overview

EzLang provides 7 file system functions for working with files and directories:

| Function | Purpose |
|----------|---------|
| `fs_read_dir()` | List directory contents |
| `fs_exists()` | Check if path exists |
| `fs_is_file()` | Check if path is a file |
| `fs_is_dir()` | Check if path is a directory |
| `fs_read_file()` | Read file contents |
| `fs_write_file()` | Write content to file |
| `path_join()` | Join path segments safely |

All functions are synchronous and work cross-platform (Windows, macOS, Linux).

---

## Directory Operations

### fs_read_dir()

List all files and directories in a directory.

```ezlang
fs_read_dir(path)
```

**Parameters:**
- `path` (String) - Directory path (absolute or relative)

**Returns:** Array of strings (file/directory names)

**Throws:** Error if directory doesn't exist or can't be read

**Example:**
```ezlang
// List files in current directory
var files = fs_read_dir(".")
for var file in files {
    print(file)
}

// List files in subdirectory
var commands = fs_read_dir("./commands")
print("Found " + str(length(commands)) + " commands")
```

**Output:**
```
main.ez
config.ez
commands/
utils/
Found 5 commands
```

### fs_exists()

Check if a file or directory exists.

```ezlang
fs_exists(path)
```

**Parameters:**
- `path` (String) - Path to check

**Returns:** Boolean (true if exists, false otherwise)

**Example:**
```ezlang
if fs_exists("./config.json") {
    print("Config file found")
} else {
    print("Config file not found")
}

// Check before reading
var file = "./data.txt"
if fs_exists(file) {
    var content = fs_read_file(file)
    print(content)
}
```

### fs_is_file()

Check if a path is a file (not a directory).

```ezlang
fs_is_file(path)
```

**Parameters:**
- `path` (String) - Path to check

**Returns:** Boolean (true if file, false if directory or doesn't exist)

**Example:**
```ezlang
var path = "./README.md"
if fs_is_file(path) {
    print(path + " is a file")
}

// Filter only files
var items = fs_read_dir(".")
var files = []
for var item in items {
    if fs_is_file(item) {
        push(files, item)
    }
}
print("Files: " + str(length(files)))
```

### fs_is_dir()

Check if a path is a directory.

```ezlang
fs_is_dir(path)
```

**Parameters:**
- `path` (String) - Path to check

**Returns:** Boolean (true if directory, false if file or doesn't exist)

**Example:**
```ezlang
var path = "./commands"
if fs_is_dir(path) {
    print(path + " is a directory")
    var files = fs_read_dir(path)
    print("Contains " + str(length(files)) + " items")
}

// Filter only directories
var items = fs_read_dir(".")
var dirs = []
for var item in items {
    if fs_is_dir(item) {
        push(dirs, item)
    }
}
print("Directories: " + str(length(dirs)))
```

---

## File Operations

### fs_read_file()

Read the entire contents of a file as a UTF-8 string.

```ezlang
fs_read_file(path)
```

**Parameters:**
- `path` (String) - File path

**Returns:** String (file contents)

**Throws:** Error if file doesn't exist or can't be read

**Example:**
```ezlang
// Read configuration file
var config_text = fs_read_file("./config.json")
print(config_text)

// Read and parse
var data = fs_read_file("./data.txt")
var lines = split(data, "\n")
for var line in lines {
    print("Line: " + line)
}

// Check before reading
if fs_exists("./message.txt") {
    var message = fs_read_file("./message.txt")
    print(message)
} else {
    print("File not found")
}
```

**Notes:**
- Always reads as UTF-8 encoding
- Reads entire file into memory
- For large files, consider memory usage

### fs_write_file()

Write content to a file. Creates the file if it doesn't exist, overwrites if it does.

```ezlang
fs_write_file(path, content)
```

**Parameters:**
- `path` (String) - File path
- `content` (String) - Content to write

**Returns:** Boolean (true on success)

**Throws:** Error if file can't be written

**Example:**
```ezlang
// Write simple text
fs_write_file("./output.txt", "Hello, World!")

// Write multiple lines
var data = "Line 1\nLine 2\nLine 3"
fs_write_file("./data.txt", data)

// Save configuration
var config = "token=abc123\nprefix=!"
fs_write_file("./config.txt", config)

// Overwrite existing file
if fs_exists("./log.txt") {
    var old_log = fs_read_file("./log.txt")
    var new_log = old_log + "\nNew entry: " + str(time())
    fs_write_file("./log.txt", new_log)
} else {
    fs_write_file("./log.txt", "First entry: " + str(time()))
}
```

**Notes:**
- Always writes as UTF-8 encoding
- Creates parent directories if needed (on most systems)
- Overwrites existing content completely

---

## Path Utilities

### path_join()

Join multiple path segments into a single normalized path.

```ezlang
path_join(...parts)
```

**Parameters:**
- `...parts` (String[]) - Path segments to join

**Returns:** String (normalized path)

**Example:**
```ezlang
// Join directory and filename
var file_path = path_join("commands", "slash", "ping.ez")
print(file_path)  // "commands/slash/ping.ez" (Unix) or "commands\slash\ping.ez" (Windows)

// Join with relative paths
var config_path = path_join(".", "config", "settings.json")
print(config_path)  // "./config/settings.json"

// Complex path joining
var base = "./data"
var category = "users"
var filename = "user_123.json"
var full_path = path_join(base, category, filename)
print(full_path)  // "./data/users/user_123.json"
```

**Notes:**
- Automatically uses correct separator for OS
- Normalizes paths (removes redundant separators)
- Handles relative and absolute paths
- Essential for cross-platform compatibility

---

## Common Patterns

### 1. Load All Files from Directory

```ezlang
function load_commands(directory) {
    var files = fs_read_dir(directory)
    var loaded = 0

    for var file in files {
        var full_path = path_join(directory, file)

        if fs_is_file(full_path) {
            if ends_with(file, ".ez") {
                print("Loading: " + file)
                import full_path
                loaded = loaded + 1
            }
        }
    }

    print("Loaded " + str(loaded) + " command files")
}

load_commands("./commands")
```

### 2. Recursive Directory Walk

```ezlang
function walk_directory(dir) {
    var items = fs_read_dir(dir)

    for var item in items {
        var full_path = path_join(dir, item)

        if fs_is_file(full_path) {
            print("File: " + full_path)
        } else if fs_is_dir(full_path) {
            print("Dir: " + full_path)
            walk_directory(full_path)  // Recursive call
        }
    }
}

walk_directory("./src")
```

### 3. File Type Filter

```ezlang
function get_ez_files(directory) {
    var all_files = fs_read_dir(directory)
    var ez_files = []

    for var file in all_files {
        var full_path = path_join(directory, file)

        if fs_is_file(full_path) and ends_with(file, ".ez") {
            push(ez_files, full_path)
        }
    }

    return ez_files
}

var commands = get_ez_files("./commands")
print("Found " + str(length(commands)) + " .ez files")
```

### 4. Configuration File Management

```ezlang
// Load configuration
function load_config() {
    if not fs_exists("./config.txt") {
        print("Config not found, creating default...")
        var default_config = "prefix=!\ncolor=0x5865f2"
        fs_write_file("./config.txt", default_config)
    }

    var config_text = fs_read_file("./config.txt")
    var lines = split(config_text, "\n")
    var config = {}

    for var line in lines {
        var parts = split(line, "=")
        if length(parts) == 2 {
            config[parts[0]] = parts[1]
        }
    }

    return config
}

// Save configuration
function save_config(config) {
    var lines = []
    for var key in config {
        push(lines, key + "=" + config[key])
    }
    var content = ""
    for var i in range(length(lines)) {
        if i > 0 {
            content = content + "\n"
        }
        content = content + lines[i]
    }
    fs_write_file("./config.txt", content)
}

var cfg = load_config()
print("Prefix: " + cfg.prefix)
```

### 5. Dynamic Command Loader

```ezlang
function load_all_commands() {
    var categories = ["slash", "message", "context"]

    for var category in categories {
        var dir = path_join("./commands", category)

        if fs_is_dir(dir) {
            print("Loading " + category + " commands...")
            var files = fs_read_dir(dir)

            for var file in files {
                if ends_with(file, ".ez") {
                    var full_path = path_join(dir, file)
                    print("  - " + file)
                    import full_path
                }
            }
        }
    }
}

load_all_commands()
```

### 6. Log File Management

```ezlang
function log_message(message) {
    var log_file = "./bot.log"
    var timestamp = str(time())
    var entry = timestamp + " | " + message + "\n"

    if fs_exists(log_file) {
        var existing = fs_read_file(log_file)
        fs_write_file(log_file, existing + entry)
    } else {
        fs_write_file(log_file, entry)
    }
}

log_message("Bot started")
log_message("Command executed: ping")
```

### 7. Check Required Files

```ezlang
function check_required_files() {
    var required = ["config.ez", "commands/", "utils/logger.ez"]
    var missing = []

    for var path in required {
        if not fs_exists(path) {
            push(missing, path)
        }
    }

    if length(missing) > 0 {
        print("ERROR: Missing required files:")
        for var file in missing {
            print("  - " + file)
        }
        return false
    }

    print("All required files present")
    return true
}

if check_required_files() {
    print("Starting bot...")
} else {
    print("Cannot start bot")
}
```

---

## Best Practices

### 1. Always Check Existence First

```ezlang
// Good
if fs_exists("./config.json") {
    var config = fs_read_file("./config.json")
}

// Bad - might throw error
var config = fs_read_file("./config.json")
```

### 2. Use path_join() for Cross-Platform Compatibility

```ezlang
// Good
var path = path_join("commands", "ping.ez")

// Bad - only works on Unix
var path = "commands/ping.ez"
```

### 3. Filter Files by Extension

```ezlang
// Good
var files = fs_read_dir("./commands")
for var file in files {
    if ends_with(file, ".ez") {
        import path_join("./commands", file)
    }
}

// Bad - imports everything
var files = fs_read_dir("./commands")
for var file in files {
    import path_join("./commands", file)  // Might import .txt, .md, etc.
}
```

### 4. Validate File Type Before Processing

```ezlang
// Good
var items = fs_read_dir("./data")
for var item in items {
    var full_path = path_join("./data", item)
    if fs_is_file(full_path) {
        var content = fs_read_file(full_path)
        print(content)
    }
}

// Bad - tries to read directories
var items = fs_read_dir("./data")
for var item in items {
    var content = fs_read_file(item)  // Error if item is directory
}
```

### 5. Handle Errors Gracefully

```ezlang
// Good
function safe_read(path) {
    if not fs_exists(path) {
        print("File not found: " + path)
        return ""
    }

    if not fs_is_file(path) {
        print("Not a file: " + path)
        return ""
    }

    return fs_read_file(path)
}

// Bad - no error handling
function unsafe_read(path) {
    return fs_read_file(path)  // Crashes if file doesn't exist
}
```

### 6. Use Relative Paths from Script Location

```ezlang
// Good - relative to script
var config = fs_read_file("./config.ez")

// Avoid - relative to where bot is run
var config = fs_read_file("config.ez")
```

### 7. Create Directories Before Writing

```ezlang
// Ensure directory exists (manual check)
var data_dir = "./data"
if not fs_exists(data_dir) {
    print("WARNING: " + data_dir + " does not exist")
}

var file_path = path_join(data_dir, "output.txt")
if fs_exists(data_dir) and fs_is_dir(data_dir) {
    fs_write_file(file_path, "Hello")
}
```

### 8. Be Careful with Overwrites

```ezlang
// Good - backup before overwrite
var file = "./important.txt"
if fs_exists(file) {
    var backup = fs_read_file(file)
    fs_write_file(file + ".backup", backup)
}
fs_write_file(file, new_content)

// Bad - data loss
fs_write_file(file, new_content)  // Old content gone
```

---

## Examples

### Complete Dynamic Command Loader

```ezlang
print("=== Dynamic Command Loader ===")

// Configuration
var COMMAND_DIRS = ["./commands/slash", "./commands/message", "./commands/context"]
var loaded_commands = []

// Load commands from all directories
function load_commands() {
    for var dir in COMMAND_DIRS {
        print("")
        print("Loading from: " + dir)

        if not fs_exists(dir) {
            print("  Directory not found, skipping...")
            continue
        }

        if not fs_is_dir(dir) {
            print("  Not a directory, skipping...")
            continue
        }

        var files = fs_read_dir(dir)
        var count = 0

        for var file in files {
            var full_path = path_join(dir, file)

            if fs_is_file(full_path) and ends_with(file, ".ez") {
                print("  [+] " + file)
                import full_path
                push(loaded_commands, file)
                count = count + 1
            }
        }

        print("  Loaded " + str(count) + " commands")
    }

    print("")
    print("=== Total: " + str(length(loaded_commands)) + " commands loaded ===")
}

// Run loader
load_commands()
```

### Configuration Manager

```ezlang
// Configuration file manager
var CONFIG_FILE = "./config.txt"

// Default configuration
var DEFAULT_CONFIG = {
    prefix: "!",
    color: "0x5865f2",
    log_level: "info"
}

// Load or create config
function get_config() {
    if not fs_exists(CONFIG_FILE) {
        print("Creating default configuration...")
        save_config(DEFAULT_CONFIG)
        return DEFAULT_CONFIG
    }

    print("Loading configuration...")
    var text = fs_read_file(CONFIG_FILE)
    var lines = split(text, "\n")
    var config = {}

    for var line in lines {
        if length(line) > 0 {
            var parts = split(line, "=")
            if length(parts) == 2 {
                config[parts[0]] = parts[1]
            }
        }
    }

    return config
}

// Save configuration
function save_config(config) {
    var text = ""
    var keys = ["prefix", "color", "log_level"]

    for var key in keys {
        if key in config {
            text = text + key + "=" + config[key] + "\n"
        }
    }

    fs_write_file(CONFIG_FILE, text)
    print("Configuration saved")
}

// Usage
var config = get_config()
print("Prefix: " + config.prefix)
print("Color: " + config.color)
print("Log Level: " + config.log_level)
```

### File-Based Database

```ezlang
// Simple file-based key-value store
var DB_DIR = "./database"

// Initialize database
function init_database() {
    if not fs_exists(DB_DIR) {
        print("ERROR: Database directory not found: " + DB_DIR)
        return false
    }
    return true
}

// Save data
function db_set(key, value) {
    var file_path = path_join(DB_DIR, key + ".txt")
    fs_write_file(file_path, value)
}

// Load data
function db_get(key) {
    var file_path = path_join(DB_DIR, key + ".txt")
    if not fs_exists(file_path) {
        return ""
    }
    return fs_read_file(file_path)
}

// Check if key exists
function db_has(key) {
    var file_path = path_join(DB_DIR, key + ".txt")
    return fs_exists(file_path)
}

// List all keys
function db_keys() {
    var files = fs_read_dir(DB_DIR)
    var keys = []

    for var file in files {
        if ends_with(file, ".txt") {
            var key = substr(file, 0, length(file) - 4)
            push(keys, key)
        }
    }

    return keys
}

// Usage
if init_database() {
    db_set("user_123", "John Doe")
    db_set("score_123", "1000")

    print("User: " + db_get("user_123"))
    print("Score: " + db_get("score_123"))

    var all_keys = db_keys()
    print("Total records: " + str(length(all_keys)))
}
```

---

## Error Handling

### Common Errors and Solutions

#### 1. File Not Found

```ezlang
// Error: File doesn't exist
var content = fs_read_file("missing.txt")

// Solution: Check first
if fs_exists("missing.txt") {
    var content = fs_read_file("missing.txt")
} else {
    print("File not found")
}
```

#### 2. Reading a Directory

```ezlang
// Error: Trying to read a directory as file
var content = fs_read_file("./commands")

// Solution: Check if file
if fs_is_file("./commands") {
    var content = fs_read_file("./commands")
}
```

#### 3. Permission Denied

```ezlang
// Error: No permission to read/write
var content = fs_read_file("/etc/passwd")

// Solution: Check permissions or use accessible paths
var content = fs_read_file("./data/file.txt")
```

#### 4. Invalid Path

```ezlang
// Error: Incorrect path separators
var path = "commands\slash\ping.ez"  // Windows-only

// Solution: Use path_join()
var path = path_join("commands", "slash", "ping.ez")
```

---

## Platform Compatibility

### Path Separators

```ezlang
// Windows: C:\Users\Name\bot\commands\ping.ez
// Unix:    /home/name/bot/commands/ping.ez

// Always use path_join() for compatibility
var path = path_join("commands", "ping.ez")
// Windows: commands\ping.ez
// Unix:    commands/ping.ez
```

### Relative vs Absolute Paths

```ezlang
// Relative to current directory
var relative = "./config.ez"

// Relative to script location
var from_script = path_join(__DIR__, "config.ez")

// Absolute path
var absolute = "/home/user/bot/config.ez"  // Unix
var absolute = "C:\\Users\\User\\bot\\config.ez"  // Windows
```

---

## Performance Considerations

### 1. Minimize File Reads

```ezlang
// Good - read once
var config = fs_read_file("./config.json")
var lines = split(config, "\n")
for var line in lines {
    print(line)
}

// Bad - read multiple times
for var i in range(10) {
    var config = fs_read_file("./config.json")  // Reads 10 times!
    print(config)
}
```

### 2. Cache Directory Listings

```ezlang
// Good - cache results
var all_files = fs_read_dir("./commands")
var ez_files = []
var js_files = []

for var file in all_files {
    if ends_with(file, ".ez") {
        push(ez_files, file)
    } else if ends_with(file, ".js") {
        push(js_files, file)
    }
}

// Bad - read multiple times
var ez_files = fs_read_dir("./commands")  // Reads directory
var js_files = fs_read_dir("./commands")  // Reads again
```

### 3. Batch File Operations

```ezlang
// Good - collect first, then process
var files_to_import = []
var files = fs_read_dir("./commands")

for var file in files {
    if ends_with(file, ".ez") {
        push(files_to_import, file)
    }
}

for var file in files_to_import {
    import file
}
```

---

## See Also

- [Discord API Reference](./DISCORD_API.md)
- [Bot Architecture Guide](./BOT_ARCHITECTURE.md)
- [EzLang Language Reference](./LANGUAGE.md)
