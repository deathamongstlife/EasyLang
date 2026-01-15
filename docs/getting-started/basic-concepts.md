---
layout: default
title: Basic Concepts
description: Learn the fundamental concepts of EasyLang programming
---

# Basic Concepts

This guide covers the fundamental concepts you need to understand to write EasyLang programs.

## Table of Contents

- [Variables and Data Types](#variables-and-data-types)
- [Operators](#operators)
- [Control Flow](#control-flow)
- [Functions](#functions)
- [Arrays and Objects](#arrays-and-objects)
- [Discord Events](#discord-events)
- [Discord Commands](#discord-commands)
- [Working with Discord Objects](#working-with-discord-objects)

---

## Variables and Data Types

### Declaring Variables

Use `let` to declare variables:

```ezlang
let name = "Alice"
let age = 25
let is_admin = true
let score = 99.5
```

### Data Types

EasyLang supports these data types:

#### String (Text)

```ezlang
let greeting = "Hello, world!"
let message = 'Single quotes work too'
let multiline = "This is
a multiline
string"
```

#### Number

```ezlang
let integer = 42
let decimal = 3.14
let negative = -10
```

#### Boolean

```ezlang
let is_ready = true
let has_permission = false
```

#### Null

```ezlang
let empty_value = null
```

#### Arrays

```ezlang
let numbers = [1, 2, 3, 4, 5]
let names = ["Alice", "Bob", "Charlie"]
let mixed = [1, "two", true, null]
```

#### Objects (Dictionaries)

```ezlang
let user = {
    "name": "Alice",
    "age": 25,
    "admin": true
}

let config = {
    "color": "#5865F2",
    "enabled": true,
    "max_users": 100
}
```

### Type Conversion

Convert between types:

```ezlang
// To string
let num = 42
let text = to_string(num)  // "42"

// To number
let str = "123"
let num = to_number(str)  // 123

// To boolean
let value = to_bool("true")  // true
```

---

## Operators

### Arithmetic Operators

```ezlang
let a = 10
let b = 3

let sum = a + b        // 13
let difference = a - b // 7
let product = a * b    // 30
let quotient = a / b   // 3.333...
let remainder = a % b  // 1
```

### Comparison Operators

```ezlang
let a = 10
let b = 20

a == b   // false (equal to)
a != b   // true (not equal to)
a < b    // true (less than)
a > b    // false (greater than)
a <= b   // true (less than or equal)
a >= b   // false (greater than or equal)
```

### Logical Operators

```ezlang
let is_admin = true
let has_permission = false

is_admin and has_permission  // false
is_admin or has_permission   // true
not is_admin                 // false
```

### String Operators

```ezlang
let first = "Hello"
let last = "World"

// Concatenation
let full = first + " " + last  // "Hello World"

// String methods
let msg = "Discord Bot"
length(msg)           // 11
upper(msg)            // "DISCORD BOT"
lower(msg)            // "discord bot"
contains(msg, "Bot")  // true
starts_with(msg, "Discord")  // true
ends_with(msg, "Bot")        // true
```

---

## Control Flow

### If Statements

```ezlang
let age = 18

if age >= 18 {
    print("You are an adult")
}
```

### If-Else

```ezlang
let score = 75

if score >= 60 {
    print("You passed!")
} else {
    print("You failed.")
}
```

### If-Else If-Else

```ezlang
let score = 85

if score >= 90 {
    print("Grade: A")
} else if score >= 80 {
    print("Grade: B")
} else if score >= 70 {
    print("Grade: C")
} else if score >= 60 {
    print("Grade: D")
} else {
    print("Grade: F")
}
```

### Nested Conditions

```ezlang
let is_member = true
let age = 20

if is_member {
    if age >= 18 {
        print("Access granted")
    } else {
        print("Too young")
    }
} else {
    print("Not a member")
}
```

---

## Loops

### For Loop (Iterate Over Array)

```ezlang
let names = ["Alice", "Bob", "Charlie"]

for name in names {
    print(name)
}
// Output:
// Alice
// Bob
// Charlie
```

### For Loop with Range

```ezlang
for i in range(1, 5) {
    print(i)
}
// Output: 1, 2, 3, 4, 5
```

### While Loop

```ezlang
let count = 0

while count < 5 {
    print(count)
    count = count + 1
}
// Output: 0, 1, 2, 3, 4
```

### Break and Continue

```ezlang
// Break - exit loop early
for i in range(1, 10) {
    if i == 5 {
        break  // Stop at 5
    }
    print(i)
}

// Continue - skip to next iteration
for i in range(1, 10) {
    if i % 2 == 0 {
        continue  // Skip even numbers
    }
    print(i)  // Only prints odd numbers
}
```

---

## Functions

### Defining Functions

```ezlang
function greet(name) {
    return "Hello, " + name + "!"
}

let message = greet("Alice")
print(message)  // "Hello, Alice!"
```

### Multiple Parameters

```ezlang
function add(a, b) {
    return a + b
}

let sum = add(5, 3)
print(sum)  // 8
```

### Default Parameters

```ezlang
function greet(name, greeting) {
    if greeting == null {
        greeting = "Hello"
    }
    return greeting + ", " + name + "!"
}

print(greet("Alice"))              // "Hello, Alice!"
print(greet("Bob", "Hi"))          // "Hi, Bob!"
```

### Anonymous Functions

```ezlang
let multiply = function(a, b) {
    return a * b
}

let result = multiply(4, 5)
print(result)  // 20
```

---

## Arrays and Objects

### Working with Arrays

```ezlang
let fruits = ["apple", "banana", "orange"]

// Access elements
let first = fruits[0]  // "apple"

// Add elements
push(fruits, "grape")

// Remove elements
let last = pop(fruits)

// Array length
let count = length(fruits)

// Check if contains
let has_banana = contains(fruits, "banana")

// Join array
let text = join(fruits, ", ")  // "apple, banana, orange"

// Split string into array
let words = split("hello world", " ")  // ["hello", "world"]
```

### Working with Objects

```ezlang
let user = {
    "name": "Alice",
    "age": 25,
    "roles": ["admin", "moderator"]
}

// Access properties
let name = user.name  // "Alice"
let age = user["age"]  // 25

// Modify properties
user.age = 26
user["name"] = "Alice Smith"

// Add properties
user.email = "alice@example.com"

// Get keys
let keys = object_keys(user)  // ["name", "age", "roles", "email"]

// Check if key exists
let has_email = has_key(user, "email")  // true
```

---

## Discord Events

Discord bots work by listening to events. Use the `listen` function:

### Basic Event Listener

```ezlang
listen("ready", function() {
    print("Bot is ready!")
})
```

### Common Events

```ezlang
// Bot is ready
listen("ready", function() {
    print("Bot started")
})

// Message created
listen("messageCreate", function(message) {
    print("New message: " + message.content)
})

// Member joined
listen("guildMemberAdd", function(member) {
    print(member.user.username + " joined")
})

// Member left
listen("guildMemberRemove", function(member) {
    print(member.user.username + " left")
})

// Message deleted
listen("messageDelete", function(message) {
    print("Message deleted")
})

// Reaction added
listen("messageReactionAdd", function(reaction, user) {
    print(user.username + " reacted with " + reaction.emoji.name)
})

// Interaction (button/slash command)
listen("interactionCreate", function(interaction) {
    print("Interaction received")
})
```

### Event Parameters

Different events provide different parameters:

```ezlang
// messageCreate provides message object
listen("messageCreate", function(message) {
    print(message.content)
    print(message.author.username)
    print(message.channel.id)
})

// guildMemberAdd provides member object
listen("guildMemberAdd", function(member) {
    print(member.user.username)
    print(member.guild.name)
})

// messageReactionAdd provides reaction and user
listen("messageReactionAdd", function(reaction, user) {
    print(reaction.emoji.name)
    print(user.username)
})
```

---

## Discord Commands

### Sending Messages

```ezlang
// Send a message to a channel
send_message(channel_id, "Hello!")

// Send with embed
let embed = create_embed({"title": "Hello"})
send_message(channel_id, "", embed)

// Reply to a message
reply(message, "Hi there!")

// React to a message
react(message, "👍")
```

### Editing and Deleting

```ezlang
// Edit a message
edit_message(message_id, channel_id, "Updated text")

// Delete a message
delete_message(message_id, channel_id)

// Delete multiple messages
bulk_delete(channel_id, [msg_id1, msg_id2, msg_id3])
```

### Working with Embeds

```ezlang
// Create an embed
let embed = create_embed({
    "title": "My Title",
    "description": "Description here",
    "color": "#5865F2"
})

// Add fields
embed_add_field(embed, "Field 1", "Value 1", true)
embed_add_field(embed, "Field 2", "Value 2", true)

// Set author
embed_set_author(embed, "Author Name", "icon_url")

// Set footer
embed_set_footer(embed, "Footer text", "icon_url")

// Set image
embed_set_image(embed, "image_url")

// Send the embed
send_message(channel_id, "", embed)
```

---

## Working with Discord Objects

Discord provides objects with many properties you can access:

### Message Object

```ezlang
listen("messageCreate", function(message) {
    message.id           // Message ID
    message.content      // Message text
    message.author       // User who sent it
    message.channel      // Channel it was sent in
    message.guild        // Server it was sent in
    message.createdAt    // When it was sent
    message.mentions     // Array of mentioned users
    message.attachments  // Array of attachments
})
```

### User Object

```ezlang
let user = message.author

user.id           // User's ID
user.username     // Username
user.discriminator // #0000
user.bot          // Is this a bot?
user.avatar       // Avatar hash
user.avatarURL    // Full avatar URL
user.createdAt    // Account creation date
```

### Guild (Server) Object

```ezlang
let guild = message.guild

guild.id             // Server ID
guild.name           // Server name
guild.memberCount    // Number of members
guild.ownerId        // Server owner's ID
guild.channels       // Array of channels
guild.roles          // Array of roles
guild.icon           // Server icon hash
guild.iconURL        // Full icon URL
guild.createdAt      // When server was created
```

### Channel Object

```ezlang
let channel = message.channel

channel.id        // Channel ID
channel.name      // Channel name
channel.type      // Channel type (0=text, 2=voice, etc)
channel.guild     // Parent guild
channel.position  // Position in list
channel.topic     // Channel topic
```

### Member Object

```ezlang
listen("guildMemberAdd", function(member) {
    member.id            // Member ID
    member.user          // User object
    member.guild         // Guild object
    member.roles         // Array of role IDs
    member.joinedAt      // When they joined
    member.nickname      // Their nickname
})
```

---

## Practical Examples

### Command Handler

```ezlang
listen("messageCreate", function(message) {
    if message.author.bot {
        return
    }

    // Extract command and arguments
    if starts_with(message.content, "!") {
        let parts = split(message.content, " ")
        let command = parts[0]
        let args = slice(parts, 1)

        if command == "!ping" {
            reply(message, "Pong!")
        } else if command == "!say" {
            let text = join(args, " ")
            send_message(message.channel.id, text)
        } else if command == "!ban" {
            if length(args) > 0 {
                let user_id = args[0]
                ban_member(message.guild.id, user_id, "Banned by command")
                reply(message, "User banned!")
            }
        }
    }
})
```

### Permission Checking

```ezlang
function has_admin(member) {
    let roles = member.roles
    for role_id in roles {
        let role = get_role(member.guild.id, role_id)
        if role.permissions.administrator {
            return true
        }
    }
    return false
}

listen("messageCreate", function(message) {
    if message.content == "!admin" {
        let member = get_member(message.guild.id, message.author.id)
        if has_admin(member) {
            reply(message, "You are an admin!")
        } else {
            reply(message, "You are not an admin.")
        }
    }
})
```

### Cooldown System

```ezlang
let cooldowns = {}

listen("messageCreate", function(message) {
    if message.content == "!daily" {
        let user_id = message.author.id

        if has_key(cooldowns, user_id) {
            let last_use = cooldowns[user_id]
            let now_time = now()
            let elapsed = now_time - last_use

            if elapsed < 86400000 {  // 24 hours in ms
                let remaining = 86400000 - elapsed
                let hours = floor(remaining / 3600000)
                reply(message, "Cooldown active! " + to_string(hours) + " hours remaining")
                return
            }
        }

        cooldowns[user_id] = now()
        reply(message, "You claimed your daily reward!")
    }
})
```

---

## Next Steps

Now that you understand the basics, explore specific Discord features:

- [Messaging Features](/EasyLang/features/messaging)
- [Embeds](/EasyLang/features/embeds)
- [Components (Buttons & Menus)](/EasyLang/features/components)
- [Slash Commands](/EasyLang/features/slash-commands)
- [Voice Features](/EasyLang/features/voice)

Or check out complete examples:

[View Example Bots →](/EasyLang/examples/){: .btn .btn-primary}
[Browse All Features →](/EasyLang/features/){: .btn .btn-secondary}

---

[← Back to Getting Started](/EasyLang/getting-started/)
