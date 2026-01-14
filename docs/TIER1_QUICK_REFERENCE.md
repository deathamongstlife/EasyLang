# Tier 1 Features - Quick Reference

A quick lookup guide for all Tier 1 Discord features in EzLang.

---

## Enhanced Embed Functions

```ezlang
# Set embed properties
embed_set_author(embed, name, iconURL?, url?)
embed_set_footer(embed, text, iconURL?)
embed_set_image(embed, url)
embed_set_thumbnail(embed, url)
embed_set_timestamp(embed, timestamp?)  # Defaults to now
embed_set_url(embed, url)
```

**Quick Example:**
```ezlang
let embed = create_embed("Title", "Description", 0x5865F2)
embed_set_author(embed, "Bot", "icon.png", "https://example.com")
embed_set_footer(embed, "Footer text", "icon.png")
embed_set_thumbnail(embed, "thumb.png")
embed_set_image(embed, "image.png")
embed_set_timestamp(embed)
embed_set_url(embed, "https://example.com")
```

---

## Message Reactions

```ezlang
# Reaction management
add_reaction(message, emoji)
remove_reaction(message, emoji, user?)
clear_reactions(message)
fetch_reactions(message, emoji) -> Array<User>
```

**Quick Example:**
```ezlang
add_reaction(msg, "👍")
add_reaction(msg, "❤️")
let users = fetch_reactions(msg, "👍")
clear_reactions(msg)
```

---

## Pin Management

```ezlang
# Pin operations
pin_message(message)
unpin_message(message)
fetch_pinned_messages(channel) -> Array<Message>
```

**Quick Example:**
```ezlang
let msg = send_message(channel, "Important!")
pin_message(msg)
let pinned = fetch_pinned_messages(channel)
unpin_message(msg)
```

---

## Ban Management

```ezlang
# Ban operations (requires permissions)
unban_user(guild, userId, reason?)
fetch_bans(guild) -> Array<Ban>
fetch_ban(guild, userId) -> Ban
```

**Quick Example:**
```ezlang
let bans = fetch_bans(guild)
let ban = fetch_ban(guild, "123456789")
unban_user(guild, "123456789", "Appeal accepted")
```

---

## Bulk Message Operations

```ezlang
# Bulk operations
bulk_delete(channel, amount) -> number  # 2-100, <14 days
fetch_messages(channel, limit?) -> Array<Message>  # 1-100
```

**Quick Example:**
```ezlang
let deleted = bulk_delete(channel, 10)
let history = fetch_messages(channel, 50)
```

---

## Context Menu Commands

```ezlang
# Context menus
register_user_context_menu(name, callback)
register_message_context_menu(name, callback)
```

**Quick Example:**
```ezlang
register_user_context_menu("Info", function(interaction, user) {
    interaction_reply(interaction, "User: " + user.tag, { ephemeral: true })
})

register_message_context_menu("Pin", function(interaction, message) {
    pin_message(message)
    interaction_reply(interaction, "Pinned!", { ephemeral: true })
})
```

---

## File System Operations

```ezlang
# File/directory operations
fs_read_dir(path) -> Array<string>
fs_exists(path) -> bool
fs_is_file(path) -> bool
fs_is_dir(path) -> bool
path_join(...parts) -> string
fs_read_file(path) -> string
fs_write_file(path, content) -> bool
```

**Quick Example:**
```ezlang
if fs_exists("./config.json") {
    let content = fs_read_file("./config.json")
    print(content)
}

let files = fs_read_dir("./bots")
for let i = 0; i < length(files); i = i + 1 {
    let path = path_join("./bots", files[i])
    if fs_is_file(path) {
        print("File: " + files[i])
    }
}

fs_write_file("./output.txt", "Hello World!")
```

---

## Common Patterns

### Rich Announcement
```ezlang
let embed = create_embed("Announcement", "Important news!", 0xF1C40F)
embed_set_author(embed, "Admin", "icon.png")
embed_set_footer(embed, "Posted at")
embed_set_timestamp(embed)
let msg = send_message(channel, "@everyone", { embeds: [embed] })
pin_message(msg)
add_reaction(msg, "✅")
```

### Poll with Reactions
```ezlang
let msg = send_message(channel, "Vote for your favorite!")
add_reaction(msg, "1️⃣")
add_reaction(msg, "2️⃣")
add_reaction(msg, "3️⃣")

# Later: fetch results
let votes1 = fetch_reactions(msg, "1️⃣")
let votes2 = fetch_reactions(msg, "2️⃣")
let votes3 = fetch_reactions(msg, "3️⃣")
```

### Moderation Dashboard
```ezlang
let bans = fetch_bans(guild)
let embed = create_embed("Mod Dashboard", "", 0xE74C3C)
embed_add_field(embed, "Total Bans", str(length(bans)), true)
embed_set_timestamp(embed)
send_message(channel, "", { embeds: [embed] })
```

### Dynamic Module Loading
```ezlang
let files = fs_read_dir("./commands")
for let i = 0; i < length(files); i = i + 1 {
    let file = files[i]
    if fs_is_file(path_join("./commands", file)) {
        print("Loading: " + file)
        # Load module
    }
}
```

### Message Cleanup
```ezlang
let deleted = bulk_delete(channel, 20)
print("Cleaned " + str(deleted) + " messages")

let history = fetch_messages(channel, 100)
print("Fetched " + str(length(history)) + " messages")
```

---

## Function Categories

**Embed Enhancement** (6 functions)
- embed_set_author, embed_set_footer, embed_set_image
- embed_set_thumbnail, embed_set_timestamp, embed_set_url

**Reactions** (4 functions)
- add_reaction, remove_reaction, clear_reactions, fetch_reactions

**Pins** (3 functions)
- pin_message, unpin_message, fetch_pinned_messages

**Bans** (3 functions)
- unban_user, fetch_bans, fetch_ban

**Bulk Ops** (2 functions)
- bulk_delete, fetch_messages

**Context Menus** (2 functions)
- register_user_context_menu, register_message_context_menu

**File System** (7 functions)
- fs_read_dir, fs_exists, fs_is_file, fs_is_dir
- path_join, fs_read_file, fs_write_file

**Total: 27 new functions**

---

## Error Handling

All functions throw errors on invalid input or insufficient permissions:

```ezlang
# Always check permissions before moderation actions
if has_permission(member, "BanMembers") {
    let bans = fetch_bans(guild)
    # Process bans...
}

# Always check file existence before reading
if fs_exists(path) {
    let content = fs_read_file(path)
    # Process content...
}

# Bulk delete limitations: 2-100 messages, <14 days old
let count = 10
if count >= 2 && count <= 100 {
    bulk_delete(channel, count)
}
```

---

## TypeScript/Discord.js Equivalents

| EzLang Function | Discord.js Equivalent |
|----------------|----------------------|
| `embed_set_author()` | `embed.setAuthor()` |
| `embed_set_footer()` | `embed.setFooter()` |
| `embed_set_image()` | `embed.setImage()` |
| `embed_set_thumbnail()` | `embed.setThumbnail()` |
| `embed_set_timestamp()` | `embed.setTimestamp()` |
| `embed_set_url()` | `embed.setURL()` |
| `add_reaction()` | `message.react()` |
| `remove_reaction()` | `reaction.users.remove()` |
| `clear_reactions()` | `message.reactions.removeAll()` |
| `fetch_reactions()` | `reaction.users.fetch()` |
| `pin_message()` | `message.pin()` |
| `unpin_message()` | `message.unpin()` |
| `fetch_pinned_messages()` | `channel.messages.fetchPinned()` |
| `unban_user()` | `guild.bans.remove()` |
| `fetch_bans()` | `guild.bans.fetch()` |
| `fetch_ban()` | `guild.bans.fetch(id)` |
| `bulk_delete()` | `channel.bulkDelete()` |
| `fetch_messages()` | `channel.messages.fetch()` |

---

For detailed documentation, see `docs/TIER1_FEATURES.md`
For examples, see `examples/tier1-features-demo.ez`
