# EzLang Universal Bridge & Advanced Parsing

Welcome to the **EzLang Universal Bridge**! While EzLang has built-in natural language syntax for common actions (like `ban user target for reason`), the Discord API is massive. Instead of waiting for new natural language keywords to be added for obscure features, you can now access **100% of Discord's features** directly through EzLang's Universal Bridge.

## 1. The Gateway Bridge (Universal Events)
You can listen to *any* raw Discord event payload using the `when discord event` syntax. When this triggers, the engine automatically injects the raw JSON payload into a variable named `event_data`.

### Syntax:
```ezlang
when discord event "EVENT_NAME" occurs
    // Your code here
    // Access payload via `event_data`
end when
```

### Example: Tracking New Roles
If you want to track when a role is created, look up the [Discord API docs for Guild Role Create](https://discord.com/developers/docs/topics/gateway-events#guild-role-create). The event name is `GUILD_ROLE_CREATE`.

```ezlang
when discord event "GUILD_ROLE_CREATE" occurs
    set role_id to event_data.role.id
    set role_name to event_data.role.name
    print("A new role was created! Name: " + role_name + ", ID: " + role_id)
end when
```

### Example: Catch-All Logger
You can listen to all events by using the `"ANY"` keyword. The event type is injected as `event_name`.

```ezlang
when discord event "ANY" occurs
    print("Received event type: " + event_name)
end when
```

---

## 2. The REST Bridge (Universal API Requests)
You can execute *any* HTTP request against the Discord API using the `discord_request(method, endpoint, payload)` built-in function. This function automatically handles your bot's authentication token and JSON encoding/decoding.

### Syntax:
```ezlang
set response to discord_request("HTTP_METHOD", "/api/endpoint", payload_object)
```

### Example: Creating a Forum Thread
EzLang doesn't have a `create forum thread` natural language command yet, but you can do it instantly with `discord_request`.

```ezlang
when message starts with "!forum"
    set forum_channel_id to "1234567890"
    
    // The payload exactly as Discord's documentation expects it
    set payload to {
        name: "My Awesome Thread",
        message: {
            content: "Hello from EzLang via the Universal Bridge!"
        }
    }
    
    // Make the request
    set response to discord_request("POST", "/channels/" + forum_channel_id + "/threads", payload)
    
    // Extract the created thread ID from the JSON response
    reply with "Created thread! Thread ID is: " + response.id
end when
```

---

## 3. General HTTP & External APIs
You can fetch data from any website or API using the built-in `http_get` and `to_json` functions.

### Example: Fetching a Meme
```ezlang
when message starts with "!cat"
    // Fetch raw JSON string from an API
    set raw_json to http_get("https://api.thecatapi.com/v1/images/search")
    
    // Parse the string into an EzLang Object/Array
    set data to to_json(raw_json)
    
    // Access the URL (the cat API returns an array, so we get index 0)
    set image_url to data.0.url
    
    reply with image_url
end when
```

## Built-in Utility Functions Reference
*   `length(array)`: Returns the number of items in an array.
*   `slice(array, start)`: Returns a new array starting from the index.
*   `join(array, separator)`: Joins an array into a string.
*   `split(string, separator)`: Splits a string into an array.
*   `get_mention_id(string)`: Strips `<@...>` to return just the numeric ID.
*   `get_member(guildId, userId)`: Fetches a full Member object from Discord.
*   `get_option("name")`: Gets the value of a slash command option.
*   `random(array)`: Picks a random item from an array.
*   `random_int(min, max)`: Returns a random integer between min and max.
*   `encode_uri(string)`: Escapes spaces and special characters for URLs.
*   `to_number(string)`: Converts a string to an integer.
*   `to_string(any)`: Converts anything to a string.
