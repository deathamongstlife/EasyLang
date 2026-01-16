# Persistent Components

Persistent Components is a powerful feature of EasyLang that allows Discord components (buttons and select menus) to survive bot restarts. Without this feature, components stop working when the bot restarts, causing "Interaction Failed" errors for users.

## Table of Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Functions](#functions)
- [Usage Examples](#usage-examples)
- [Best Practices](#best-practices)
- [Limitations](#limitations)
- [Troubleshooting](#troubleshooting)

## Overview

### The Problem

When you create Discord buttons or select menus in a normal bot, they only work while the bot is running. If the bot restarts:
- Old buttons return "Interaction Failed" errors
- Users can't complete their actions
- You lose all component state

### The Solution

Persistent Components stores component handlers in a JSON file (`src/discord/persistent-storage/components.json`). When the bot restarts:
- Handlers are automatically restored
- Old buttons/menus continue working
- Component state is preserved
- Users experience no interruption

### Key Features

- **Automatic Persistence**: Handlers saved to disk automatically
- **State Support**: Attach serializable data to components
- **Auto-Cleanup**: Expired components removed automatically (15-minute Discord limit)
- **Type Safety**: Supports buttons and select menus
- **Zero Configuration**: Works out of the box

## How It Works

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│ EasyLang Bot                                            │
│                                                         │
│  ┌──────────────────┐         ┌──────────────────┐    │
│  │ Your EZ Code     │         │ Component Storage│    │
│  │                  │         │                  │    │
│  │ • Define handler │────────▶│ • Save metadata  │    │
│  │ • Create button  │         │ • Save state     │    │
│  │ • Register comp. │         │ • Auto-cleanup   │    │
│  └──────────────────┘         └──────────────────┘    │
│          │                             │               │
│          │ User clicks button          │               │
│          ▼                             ▼               │
│  ┌──────────────────┐         ┌──────────────────┐    │
│  │ Event Router     │◀────────│ Handler Registry │    │
│  │                  │         │                  │    │
│  │ • Route to       │         │ • Load from disk │    │
│  │   handler        │         │ • Match custom ID│    │
│  │ • Call function  │         │ • Return handler │    │
│  └──────────────────┘         └──────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

### Storage Format

Components are stored in `components.json`:

```json
{
  "button_1234567890_abc123": {
    "customId": "button_1234567890_abc123",
    "handlerName": "handle_click",
    "createdAt": 1704067200000,
    "expiresAt": 1704068100000,
    "state": {
      "message": "Hello",
      "counter": 42
    },
    "type": "button"
  }
}
```

### Handler Lifecycle

1. **Creation**: Handler registered with `create_persistent_button()` or `create_persistent_select_menu()`
2. **Storage**: Metadata saved to `components.json`
3. **Interaction**: User clicks button/selects option
4. **Routing**: Event system routes to registered handler
5. **Execution**: Handler function called with interaction data
6. **Expiration**: Component auto-removed after 15 minutes

## Functions

### create_persistent_button(options, handler)

Create a button that persists across bot restarts.

**Parameters:**
- `options` (object): Button configuration
  - `label` (string, required): Button text
  - `style` (string): Button style - "primary", "secondary", "success", "danger", "link"
  - `custom_id` (string): Custom ID (auto-generated if not provided)
  - `emoji` (string): Emoji for button
  - `disabled` (boolean): Whether button is disabled
  - `url` (string): URL for link buttons (required if style is "link")
  - `state` (object): Serializable state object
- `handler` (function): Function to call when clicked

**Returns:** Button object with `__raw` property containing Discord.js ButtonBuilder

**Example:**
```javascript
function handle_click(interaction) {
    const raw = interaction.__raw.__rawValue
    raw.reply({ content: "Button clicked!", ephemeral: true })
}

const button = create_persistent_button({
    label: "Click Me",
    style: "primary",
    emoji: "✨",
    state: { count: 0 }
}, handle_click)
```

### create_persistent_select_menu(options, handler)

Create a select menu that persists across bot restarts.

**Parameters:**
- `options` (object): Menu configuration
  - `custom_id` (string): Custom ID (auto-generated if not provided)
  - `placeholder` (string): Placeholder text
  - `min_values` (number): Minimum selections (default: 1)
  - `max_values` (number): Maximum selections (default: 1)
  - `options` (array, required): Array of menu options
    - `label` (string, required): Option label
    - `value` (string, required): Option value
    - `description` (string): Option description
    - `emoji` (string): Option emoji
    - `default` (boolean): Whether option is selected by default
  - `disabled` (boolean): Whether menu is disabled
  - `state` (object): Serializable state object
- `handler` (function): Function called with selected values

**Returns:** Select menu object with `__raw` property

**Example:**
```javascript
function handle_selection(interaction) {
    const selected = interaction.values.elements[0].value
    const raw = interaction.__raw.__rawValue
    raw.reply({ content: "You selected: " + selected, ephemeral: true })
}

const menu = create_persistent_select_menu({
    placeholder: "Choose a color",
    options: [
        { label: "Red", value: "red", emoji: "🔴" },
        { label: "Blue", value: "blue", emoji: "🔵" },
        { label: "Green", value: "green", emoji: "🟢" }
    ]
}, handle_selection)
```

### register_component_handler(custom_id, handler)

Manually register a handler for a custom ID.

**Parameters:**
- `custom_id` (string): Component custom ID
- `handler` (function): Handler function

**Returns:** Boolean indicating success

**Example:**
```javascript
function my_handler(interaction) {
    print("Handler called for: " + interaction.custom_id)
}

register_component_handler("my_custom_id", my_handler)
```

### unregister_component_handler(custom_id)

Remove a component handler.

**Parameters:**
- `custom_id` (string): Component custom ID

**Returns:** Boolean indicating if handler existed

**Example:**
```javascript
unregister_component_handler("my_custom_id")
```

### get_component_handler(custom_id)

Get the handler for a custom ID.

**Parameters:**
- `custom_id` (string): Component custom ID

**Returns:** Handler function or null object

**Example:**
```javascript
const handler = get_component_handler("my_custom_id")
```

### restore_component_handlers()

Load all component handlers from storage. Called automatically on bot startup.

**Returns:** Number of handlers restored

**Example:**
```javascript
const count = restore_component_handlers()
print("Restored " + str(count) + " handlers")
```

### save_component_handlers()

Save all handlers to persistent storage. Called automatically when handlers are created/updated.

**Returns:** Boolean indicating success

**Example:**
```javascript
save_component_handlers()
```

### list_component_handlers()

Get all registered component custom IDs.

**Returns:** Array of custom ID strings

**Example:**
```javascript
const handlers = list_component_handlers()
print("Total handlers: " + str(length(handlers.elements)))
```

### get_component_state(custom_id)

Get the state associated with a component.

**Parameters:**
- `custom_id` (string): Component custom ID

**Returns:** State object

**Example:**
```javascript
const state = get_component_state("button_123")
print("State message: " + state.message)
```

## Usage Examples

### Basic Persistent Button

```javascript
function handle_click(interaction) {
    const raw = interaction.__raw.__rawValue
    raw.reply({ content: "Hello!", ephemeral: true })
}

on_message_create(function(message) {
    if message.content == "!button" {
        const button = create_persistent_button({
            label: "Click Me",
            style: "primary"
        }, handle_click)

        const raw = message.__raw.__rawValue
        raw.reply({
            content: "Here's a persistent button!",
            components: [{
                type: 1,
                components: [button.__raw.__rawValue]
            }]
        })
    }
})
```

### Button with State

```javascript
function handle_counter(interaction) {
    const state = interaction.state
    const count = state.counter
    const newCount = count + 1

    const raw = interaction.__raw.__rawValue
    raw.reply({
        content: "Counter: " + str(newCount),
        ephemeral: true
    })
}

// Create button with initial state
const button = create_persistent_button({
    label: "Count: 0",
    style: "primary",
    state: { counter: 0 }
}, handle_counter)
```

### Multi-Select Menu

```javascript
function handle_roles(interaction) {
    const values = interaction.values.elements
    const count = length(values)

    const raw = interaction.__raw.__rawValue
    raw.reply({
        content: "Selected " + str(count) + " role(s)",
        ephemeral: true
    })
}

const menu = create_persistent_select_menu({
    placeholder: "Select roles (1-3)",
    min_values: 1,
    max_values: 3,
    options: [
        { label: "Developer", value: "dev", emoji: "💻" },
        { label: "Designer", value: "design", emoji: "🎨" },
        { label: "Manager", value: "manager", emoji: "📊" }
    ]
}, handle_roles)
```

### Combined Components

```javascript
on_message_create(function(message) {
    if message.content == "!panel" {
        const button1 = create_persistent_button({
            label: "Approve",
            style: "success",
            emoji: "✅"
        }, handle_approve)

        const button2 = create_persistent_button({
            label: "Reject",
            style: "danger",
            emoji: "❌"
        }, handle_reject)

        const menu = create_persistent_select_menu({
            placeholder: "Choose reason",
            options: [
                { label: "Quality", value: "quality" },
                { label: "Spam", value: "spam" },
                { label: "Off-topic", value: "offtopic" }
            ]
        }, handle_reason)

        const raw = message.__raw.__rawValue
        raw.reply({
            content: "Review Panel",
            components: [
                {
                    type: 1,
                    components: [
                        button1.__raw.__rawValue,
                        button2.__raw.__rawValue
                    ]
                },
                {
                    type: 1,
                    components: [menu.__raw.__rawValue]
                }
            ]
        })
    }
})
```

### Manual Handler Registration

```javascript
// Register handler manually
function custom_handler(interaction) {
    print("Custom handler called")
}

register_component_handler("custom_button_id", custom_handler)

// Later, create button with this ID
const button = create_persistent_button({
    custom_id: "custom_button_id",
    label: "Custom Button",
    style: "primary"
}, null)  // No handler needed, already registered
```

## Best Practices

### 1. Use Named Functions

**Bad:**
```javascript
// Anonymous functions don't persist properly
create_persistent_button(options, function(interaction) {
    // Handler code
})
```

**Good:**
```javascript
// Named functions can be identified and stored
function handle_click(interaction) {
    // Handler code
}

create_persistent_button(options, handle_click)
```

### 2. Keep State Serializable

**Bad:**
```javascript
// Functions and complex objects don't serialize
state: {
    callback: function() { },
    complexObject: new CustomClass()
}
```

**Good:**
```javascript
// Use simple data types
state: {
    userId: "123",
    timestamp: 1704067200,
    message: "Hello",
    isActive: true
}
```

### 3. Handle Missing State Gracefully

```javascript
function handle_click(interaction) {
    // Check if state exists
    if interaction.state {
        const count = interaction.state.counter
        // Use state
    } else {
        // Use default values
        const count = 0
    }
}
```

### 4. Clean Up Old Handlers

```javascript
// Remove handlers for completed workflows
function handle_finish(interaction) {
    // Do work...

    // Clean up
    unregister_component_handler(interaction.custom_id)
}
```

### 5. Monitor Handler Count

```javascript
on_message_create(function(message) {
    if message.content == "!stats" {
        const handlers = list_component_handlers()
        const count = length(handlers.elements)

        message.__raw.__rawValue.reply({
            content: "Active handlers: " + str(count)
        })
    }
})
```

## Limitations

### Discord Limitations

1. **15-Minute Expiry**: Discord components expire after 15 minutes
   - Solution: Automatically cleaned up by the system
   - Users see "Interaction Failed" for expired components

2. **25 Options Maximum**: Select menus limited to 25 options
   - Solution: Split into multiple menus or use pagination

3. **5 Components per Row**: Max 5 buttons or 1 select menu per action row
   - Solution: Use multiple rows (max 5 rows per message)

### EasyLang Limitations

1. **Handler Functions Must Be Named**: Anonymous functions don't persist
   - Solution: Always use named function declarations

2. **State Must Be Serializable**: Only JSON-compatible data
   - Solution: Use strings, numbers, booleans, arrays, objects

3. **No Function State**: Can't store function references
   - Solution: Store function names as strings, look up functions by name

4. **Storage Size**: Large numbers of components use disk space
   - Solution: Auto-cleanup removes expired components

## Troubleshooting

### Components Not Working After Restart

**Problem**: Buttons show "Interaction Failed"

**Solutions**:
1. Check handler is a named function
2. Verify `restore_component_handlers()` is called on startup
3. Check `components.json` exists and is readable
4. Ensure component hasn't expired (15 minutes)

### State Not Persisting

**Problem**: Component state is empty or incorrect

**Solutions**:
1. Verify state contains only serializable data
2. Check state is attached when creating component
3. Use `get_component_state()` to debug
4. Ensure `save_component_handlers()` was called

### Handler Not Called

**Problem**: Click doesn't trigger handler

**Solutions**:
1. Verify handler is registered: `get_component_handler(custom_id)`
2. Check handler function is defined before registration
3. Ensure interaction routing is enabled in event system
4. Check for errors in handler function

### Too Many Handlers

**Problem**: `components.json` growing too large

**Solutions**:
1. Handlers auto-expire after 15 minutes
2. Manually clean up: `unregister_component_handler(custom_id)`
3. Use `list_component_handlers()` to audit
4. Avoid creating components in loops

### Custom ID Conflicts

**Problem**: Multiple components with same custom ID

**Solutions**:
1. Let system auto-generate IDs (recommended)
2. If setting manually, ensure uniqueness
3. Use prefixes: `button_${timestamp}_${random}`
4. Check existing IDs: `list_component_handlers()`

## Advanced Topics

### Custom ID Generation

The system generates unique IDs using:
```
prefix_timestamp_random
```

Example: `button_1704067200000_a3b5c7`

You can override this:
```javascript
const button = create_persistent_button({
    custom_id: "my_unique_id",
    label: "Button",
    style: "primary"
}, handler)
```

### State Updates

To update component state, you must recreate the component:

```javascript
// Get current state
const oldState = get_component_state(customId)

// Unregister old handler
unregister_component_handler(customId)

// Create new component with updated state
const newButton = create_persistent_button({
    custom_id: customId,
    label: "Updated",
    style: "primary",
    state: {
        counter: oldState.counter + 1
    }
}, handler)
```

### Debugging

Enable debug logging:

```javascript
on_message_create(function(message) {
    if message.content == "!debug-components" {
        const handlers = list_component_handlers()

        let output = "Registered Handlers:\n"
        let i = 0
        while i < length(handlers.elements) {
            const id = handlers.elements[i].value
            const state = get_component_state(id)

            output = output + "\n• " + id
            if state.message {
                output = output + " (state: " + state.message + ")"
            }

            i = i + 1
        }

        message.__raw.__rawValue.reply(output)
    }
})
```

## Migration Guide

### From Non-Persistent Components

**Before:**
```javascript
on_message_create(function(message) {
    if message.content == "!button" {
        const button = new ButtonBuilder()
            .setLabel("Click")
            .setStyle(ButtonStyle.Primary)
            .setCustomId("my_button")

        // Handler in interactionCreate event
    }
})
```

**After:**
```javascript
function handle_click(interaction) {
    // Handler code
}

on_message_create(function(message) {
    if message.content == "!button" {
        const button = create_persistent_button({
            label: "Click",
            style: "primary"
        }, handle_click)

        // Use button.__raw.__rawValue
    }
})
```

## See Also

- [Discord Components Guide](https://discord.com/developers/docs/interactions/message-components)
- [EasyLang Examples](../examples/persistent-components-example.ez)
- [Discord.js Button Documentation](https://discord.js.org/#/docs/main/stable/class/ButtonBuilder)
- [Discord.js Select Menu Documentation](https://discord.js.org/#/docs/main/stable/class/StringSelectMenuBuilder)
