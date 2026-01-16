# Discord Collectors API

Discord collectors allow you to collect messages, reactions, and interactions over a period of time. This is useful for creating interactive features like polls, games, forms, and more.

## Table of Contents

- [Message Collectors](#message-collectors)
- [Reaction Collectors](#reaction-collectors)
- [Interaction Collectors](#interaction-collectors)
- [Collector Events](#collector-events)
- [Collector Control](#collector-control)
- [Examples](#examples)

## Message Collectors

### `create_message_collector(channel_id, options?)`

Creates a collector that listens for messages in a specific channel.

**Parameters:**
- `channel_id` (string): The ID of the channel to collect messages in
- `options` (object, optional):
  - `filter` (function): Filter function to accept/reject messages
  - `time` (number): Maximum time to collect in milliseconds
  - `max` (number): Maximum number of messages to collect
  - `idle` (number): Time to wait for inactivity before stopping (ms)

**Returns:** Collector object with properties:
- `id` (string): Unique collector ID
- `type` (string): "message"
- `channel_id` (string): The channel being monitored

**Example:**
```easylang
let collector = create_message_collector("123456789", {
    time: 60000,    # Collect for 60 seconds
    max: 10,        # Stop after 10 messages
    idle: 5000      # Stop if idle for 5 seconds
})
```

## Reaction Collectors

### `create_reaction_collector(message_id, options)`

Creates a collector that listens for reactions on a specific message.

**Parameters:**
- `message_id` (string): The ID of the message to collect reactions on
- `options` (object):
  - `channel_id` (string, required): The channel containing the message
  - `filter` (function): Filter function to accept/reject reactions
  - `time` (number): Maximum time to collect in milliseconds
  - `max` (number): Maximum number of reactions to collect

**Returns:** Collector object with properties:
- `id` (string): Unique collector ID
- `type` (string): "reaction"
- `message_id` (string): The message being monitored

**Example:**
```easylang
let collector = create_reaction_collector("987654321", {
    channel_id: "123456789",
    time: 30000,    # Collect for 30 seconds
    max: 5          # Stop after 5 reactions
})
```

## Interaction Collectors

### `create_interaction_collector(message_id, options)`

Creates a collector that listens for component interactions (buttons, select menus) on a message.

**Parameters:**
- `message_id` (string): The ID of the message with components
- `options` (object):
  - `channel_id` (string, required): The channel containing the message
  - `filter` (function): Filter function to accept/reject interactions
  - `time` (number): Maximum time to collect in milliseconds
  - `max` (number): Maximum number of interactions to collect
  - `componentType` (number): Specific component type to collect (optional)

**Component Types:**
- `2` - Button
- `3` - String Select Menu
- `5` - User Select Menu
- `6` - Role Select Menu
- `7` - Mentionable Select Menu
- `8` - Channel Select Menu

**Returns:** Collector object with properties:
- `id` (string): Unique collector ID
- `type` (string): "interaction"
- `message_id` (string): The message being monitored

**Example:**
```easylang
let collector = create_interaction_collector("555555555", {
    channel_id: "123456789",
    time: 120000,       # Collect for 2 minutes
    max: 20,            # Stop after 20 interactions
    componentType: 2    # Only collect button clicks
})
```

## Collector Events

### `on_collect(collector_id, handler)`

Registers a handler function that is called whenever an item is collected.

**Parameters:**
- `collector_id` (string or collector object): The collector to attach the handler to
- `handler` (function): Function called when an item is collected

**Handler receives:**
- For message collectors: `message` object
- For reaction collectors: `reaction` object
- For interaction collectors: `interaction` object

**Example:**
```easylang
on_collect(collector, function(message) {
    print("Got message: " + message.content)
    print("From: " + message.author.username)
})
```

### `on_collector_end(collector_id, handler)`

Registers a handler function that is called when the collector ends.

**Parameters:**
- `collector_id` (string or collector object): The collector to attach the handler to
- `handler` (function): Function called when collection ends

**Handler receives:**
- `collected` (array): Array of all collected items
- `reason` (string): Reason the collector ended

**End Reasons:**
- `"time"` - Time limit reached
- `"limit"` - Max items collected
- `"idle"` - Idle timeout reached
- `"manual"` - Manually stopped via `stop_collector()`

**Example:**
```easylang
on_collector_end(collector, function(collected, reason) {
    print("Collector ended!")
    print("Reason: " + reason)
    print("Total collected: " + length(collected))
})
```

## Collector Control

### `stop_collector(collector_id)`

Manually stops a running collector.

**Parameters:**
- `collector_id` (string or collector object): The collector to stop

**Returns:** `true` if successfully stopped

**Example:**
```easylang
# Stop the collector manually
stop_collector(collector)
```

## Collected Object Structures

### Message Object
```easylang
{
    id: "message_id",
    content: "message content",
    channelId: "channel_id",
    guildId: "guild_id",
    created_at: "2024-01-01T00:00:00.000Z",
    created_timestamp: 1704067200000,
    pinned: false,
    type: 0,
    author: {
        id: "user_id",
        username: "username",
        tag: "user#1234",
        bot: false,
        discriminator: "1234",
        avatar: "avatar_hash",
        avatarURL: "https://..."
    }
}
```

### Reaction Object
```easylang
{
    emoji: "👍",
    emoji_id: "",           # Custom emoji ID if custom emoji
    count: 3,
    me: false,
    message_id: "message_id",
    user: {
        id: "user_id",
        username: "username",
        # ... user properties
    }
}
```

### Interaction Object
```easylang
{
    id: "interaction_id",
    type: 3,                # Interaction type
    channelId: "channel_id",
    guildId: "guild_id",
    customId: "button_id",
    component_type: "button",
    user: {
        id: "user_id",
        username: "username",
        # ... user properties
    },
    values: []              # For select menus
}
```

## Examples

### Example 1: Simple Quiz

```easylang
function create_quiz(channel_id) {
    send_message(channel_id, "What is 2 + 2? Answer in 30 seconds!")

    let collector = create_message_collector(channel_id, {
        time: 30000,
        max: 1
    })

    on_collect(collector, function(message) {
        if message.content == "4" {
            send_message(channel_id, "Correct! 🎉")
        } else {
            send_message(channel_id, "Wrong answer! The correct answer is 4.")
        }
    })

    on_collector_end(collector, function(collected, reason) {
        if length(collected) == 0 {
            send_message(channel_id, "Time's up! Nobody answered.")
        }
    })
}
```

### Example 2: Reaction Poll

```easylang
function create_poll(channel_id, question) {
    # Send poll message
    let msg_obj = send_message(channel_id, question)
    let message_id = msg_obj.id

    # Add reaction options
    add_reaction(channel_id, message_id, "👍")
    add_reaction(channel_id, message_id, "👎")

    # Create collector
    let collector = create_reaction_collector(message_id, {
        channel_id: channel_id,
        time: 60000  # 1 minute poll
    })

    on_collector_end(collector, function(collected, reason) {
        let thumbs_up = 0
        let thumbs_down = 0

        # Count reactions (simplified, would need iteration)
        send_message(channel_id, "Poll ended! Results coming soon...")
    })
}
```

### Example 3: Button Collector

```easylang
function create_button_menu(channel_id) {
    # Send message with buttons
    let components = create_action_row([
        create_button({
            customId: "option_a",
            label: "Option A",
            style: 1
        }),
        create_button({
            customId: "option_b",
            label: "Option B",
            style: 2
        })
    ])

    let msg = send_message_with_components(channel_id, "Choose an option:", [components])

    # Collect button clicks
    let collector = create_interaction_collector(msg.id, {
        channel_id: channel_id,
        time: 60000,
        componentType: 2
    })

    on_collect(collector, function(interaction) {
        if interaction.customId == "option_a" {
            # Handle option A
            reply_to_interaction(interaction, "You chose Option A!")
        } else if interaction.customId == "option_b" {
            # Handle option B
            reply_to_interaction(interaction, "You chose Option B!")
        }
    })
}
```

### Example 4: Word Game

```easylang
function word_game(channel_id) {
    send_message(channel_id, "Type words that start with 'A'! You have 30 seconds.")

    let collector = create_message_collector(channel_id, {
        time: 30000,
        idle: 10000  # Stop if no messages for 10 seconds
    })

    let valid_words = 0

    on_collect(collector, function(message) {
        if starts_with(message.content, "a") or starts_with(message.content, "A") {
            valid_words = valid_words + 1
            add_reaction(message.channelId, message.id, "✅")
        } else {
            add_reaction(message.channelId, message.id, "❌")
        }
    })

    on_collector_end(collector, function(collected, reason) {
        send_message(channel_id, "Game over! Valid words: " + str(valid_words))
    })
}
```

## Best Practices

1. **Always set time limits**: Prevent collectors from running indefinitely
2. **Use idle timeouts**: Stop collectors when users become inactive
3. **Set max limits**: Prevent excessive resource usage
4. **Handle end events**: Clean up resources and notify users
5. **Filter appropriately**: Use filter functions to accept only relevant items
6. **Manual cleanup**: Call `stop_collector()` when no longer needed
7. **Check collector type**: Handle different collector types appropriately

## Limitations

1. Collectors are stored in memory and will be lost on bot restart
2. Filter functions are stored but not yet executed (requires runtime integration)
3. Maximum recommended collectors per bot: 100 concurrent
4. Collected items are limited by Discord rate limits

## See Also

- [Discord Components API](./components-api.md)
- [Discord Events API](./events-api.md)
- [Discord Messages API](./messages-api.md)
