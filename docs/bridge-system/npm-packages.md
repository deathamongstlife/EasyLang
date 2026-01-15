---
layout: default
title: NPM Packages
description: Use npm packages in EasyLang
---

# NPM Packages Bridge

Access JavaScript's npm ecosystem from EasyLang.

## Usage

### Import a Package

```ezlang
use_npm_package("package_name")
```

### Call Package Functions

```ezlang
let result = await npm_call("module.function", arg1, arg2)
```

## Examples

### HTTP with axios

```ezlang
use_npm_package("axios")

listen("messageCreate", function(message) {
    if message.content == "!joke" {
        let response = await npm_call("axios.get",
            "https://official-joke-api.appspot.com/random_joke")

        let joke = response.data
        reply(message, joke.setup + "\n" + joke.punchline)
    }
})
```

### Date Formatting with moment

```ezlang
use_npm_package("moment")

let now = await npm_call("moment")
let formatted = await npm_call("now.format", "MMMM Do YYYY, h:mm:ss a")

send_message(channel_id, "Current time: " + formatted)
```

### Utilities with lodash

```ezlang
use_npm_package("lodash")

let array = [1, 2, 3, 4, 5]

// Shuffle array
let shuffled = await npm_call("_.shuffle", array)

// Get random element
let random = await npm_call("_.sample", array)

// Chunk array
let chunks = await npm_call("_.chunk", array, 2)
// [[1, 2], [3, 4], [5]]
```

### Generate UUIDs

```ezlang
use_npm_package("uuid")

let id = await npm_call("uuid.v4")
print("Generated ID: " + id)
```

### Color Utilities

```ezlang
use_npm_package("color")

let color = await npm_call("Color", "#5865F2")
let lighter = await npm_call("color.lighten", 0.2)
let hex = await npm_call("lighter.hex")

print("Lighter color: " + hex)
```

### Parse User Agents

```ezlang
use_npm_package("useragent")

let ua = await npm_call("useragent.parse", request.headers.userAgent)
print("Browser: " + ua.family)
print("OS: " + ua.os.family)
```

## Common Packages

Popular npm packages:

- **axios** - HTTP client
- **moment** - Date handling
- **lodash** - Utility functions
- **uuid** - UUID generation
- **cheerio** - HTML parsing
- **validator** - String validation
- **dotenv** - Environment variables
- **express** - Web server
- **socket.io** - WebSockets

## Async/Await

npm bridge calls are asynchronous. Use `await`:

```ezlang
// Correct
let result = await npm_call("axios.get", url)

// Will not work properly without await
let result = npm_call("axios.get", url)  // Don't do this
```

## Best Practices

1. Install packages first:
   ```bash
   npm install package_name
   ```

2. Use await for async operations:
   ```ezlang
   let data = await npm_call("async.function")
   ```

3. Handle promise rejections:
   ```ezlang
   try {
       let result = await npm_call("module.function")
   } catch error {
       print("Error: " + error)
   }
   ```

[← Back to Bridge System](/EasyLang/bridge-system/)
