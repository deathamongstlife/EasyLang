---
layout: default
title: Components
description: Add interactive buttons, select menus, and modals to messages
---

# Components

Add interactive elements like buttons, select menus, and modals to your Discord messages.

## Overview

Components make your bot interactive by allowing users to click buttons, select options from menus, and fill out forms without typing commands.

## Available Functions

| Function | Description |
|----------|-------------|
| `create_button` | Create an interactive button |
| `create_link_button` | Create a URL button |
| `create_string_select` | Create a string selection menu |
| `create_user_select` | Create a user selection menu |
| `create_role_select` | Create a role selection menu |
| `create_channel_select` | Create a channel selection menu |
| `create_action_row` | Create a row to hold components |
| `create_modal` | Create a modal form |
| `show_modal` | Show a modal to a user |

## Button Examples

### Basic Button

```ezlang
listen("messageCreate", function(message) {
    if message.content == "!button" {
        let button = create_button({
            "customId": "click_me",
            "label": "Click Me!",
            "style": 1  // Blurple
        })

        let row = create_action_row([button])
        send_message(message.channel.id, "Press the button!", null, [row])
    }
})

listen("interactionCreate", function(interaction) {
    if interaction.customId == "click_me" {
        interaction_reply(interaction, "Button clicked! 🎉", true)
    }
})
```

### Button Styles

```ezlang
// Create buttons with different styles
let btn1 = create_button({"customId": "btn1", "label": "Primary", "style": 1})   // Blurple
let btn2 = create_button({"customId": "btn2", "label": "Secondary", "style": 2}) // Gray
let btn3 = create_button({"customId": "btn3", "label": "Success", "style": 3})   // Green
let btn4 = create_button({"customId": "btn4", "label": "Danger", "style": 4})    // Red

let row = create_action_row([btn1, btn2, btn3, btn4])
send_message(channel_id, "Choose a button:", null, [row])
```

### Buttons with Emojis

```ezlang
let button = create_button({
    "customId": "like",
    "label": "Like",
    "style": 1,
    "emoji": "👍"
})

let row = create_action_row([button])
send_message(channel_id, "React with a button!", null, [row])
```

### Link Buttons

```ezlang
let button = create_link_button({
    "label": "Visit Website",
    "url": "https://example.com",
    "emoji": "🔗"
})

let row = create_action_row([button])
send_message(channel_id, "Check out our website:", null, [row])
```

## Select Menu Examples

### String Select

```ezlang
let select = create_string_select({
    "customId": "color_select",
    "placeholder": "Choose your favorite color",
    "options": [
        {"label": "Red", "value": "red", "emoji": "🔴"},
        {"label": "Blue", "value": "blue", "emoji": "🔵"},
        {"label": "Green", "value": "green", "emoji": "🟢"}
    ]
})

let row = create_action_row([select])
send_message(channel_id, "Pick a color:", null, [row])
```

### Handle Select Menu

```ezlang
listen("interactionCreate", function(interaction) {
    if interaction.customId == "color_select" {
        let choice = interaction.values[0]
        interaction_reply(interaction, "You chose: " + choice, true)
    }
})
```

### Role Select

```ezlang
let select = create_role_select({
    "customId": "role_select",
    "placeholder": "Select roles to add",
    "minValues": 1,
    "maxValues": 3
})

let row = create_action_row([select])
send_message(channel_id, "Choose your roles:", null, [row])
```

## Modal Examples

### Create and Show Modal

```ezlang
listen("interactionCreate", function(interaction) {
    if interaction.customId == "open_form" {
        let modal = create_modal({
            "customId": "feedback_form",
            "title": "Feedback Form",
            "components": [
                {
                    "type": 1,
                    "components": [{
                        "type": 4,
                        "customId": "name_input",
                        "label": "Your Name",
                        "style": 1,
                        "required": true
                    }]
                },
                {
                    "type": 1,
                    "components": [{
                        "type": 4,
                        "customId": "feedback_input",
                        "label": "Your Feedback",
                        "style": 2,
                        "required": true
                    }]
                }
            ]
        })
        show_modal(interaction, modal)
    }
})

listen("interactionCreate", function(interaction) {
    if interaction.customId == "feedback_form" {
        let name = get_modal_value(interaction, "name_input")
        let feedback = get_modal_value(interaction, "feedback_input")

        interaction_reply(interaction, "Thanks for your feedback, " + name + "!", true)

        // Log feedback
        send_message(log_channel_id, "Feedback from " + name + ": " + feedback)
    }
})
```

## Complete Examples

### Confirmation System

```ezlang
listen("messageCreate", function(message) {
    if message.content == "!delete_all" {
        let yes = create_button({"customId": "confirm_yes", "label": "Yes", "style": 4})
        let no = create_button({"customId": "confirm_no", "label": "No", "style": 2})

        let row = create_action_row([yes, no])
        send_message(message.channel.id,
            "⚠️ Are you sure you want to delete all messages?", null, [row])
    }
})

listen("interactionCreate", function(interaction) {
    if interaction.customId == "confirm_yes" {
        interaction_reply(interaction, "Deleting messages...", false)
        // Perform deletion
    } else if interaction.customId == "confirm_no" {
        interaction_reply(interaction, "Cancelled.", true)
    }
})
```

### Pagination with Buttons

```ezlang
let current_page = 0
let pages = ["Page 1 content", "Page 2 content", "Page 3 content"]

function show_page(channel_id, page) {
    let prev = create_button({
        "customId": "page_prev",
        "label": "Previous",
        "style": 2,
        "disabled": page == 0
    })

    let next = create_button({
        "customId": "page_next",
        "label": "Next",
        "style": 2,
        "disabled": page == length(pages) - 1
    })

    let row = create_action_row([prev, next])
    send_message(channel_id, pages[page], null, [row])
}

listen("interactionCreate", function(interaction) {
    if interaction.customId == "page_prev" {
        current_page = current_page - 1
        interaction_update(interaction, pages[current_page])
    } else if interaction.customId == "page_next" {
        current_page = current_page + 1
        interaction_update(interaction, pages[current_page])
    }
})
```

## Tips and Best Practices

- Maximum 5 action rows per message
- Maximum 5 buttons per row
- Maximum 1 select menu per row
- Button labels: max 80 characters
- Select options: max 25 options
- Use ephemeral replies for user-specific responses
- Disable buttons when action is complete
- Provide clear labels and placeholders

## Related Features

- [Messaging](/EasyLang/features/messaging)
- [Slash Commands](/EasyLang/features/slash-commands)
- [API: Discord Functions](/EasyLang/api/discord-functions)

[← Back to Features](/EasyLang/features/)
