---
layout: default
title: Discord Objects
---

# Discord Objects

## Message Object

Properties available on message objects:

```ezlang
message.id              // Message ID
message.content         // Message text
message.author          // User object
message.channel         // Channel object
message.guild           // Guild object
message.createdAt       // Timestamp
message.editedAt        // Edit timestamp
message.mentions        // Mentioned users
message.attachments     // File attachments
message.embeds          // Embed objects
message.reactions       // Reaction array
message.reference       // Reply reference
```

## User Object

```ezlang
user.id                 // User ID
user.username           // Username
user.discriminator      // #0000
user.bot                // Is bot?
user.avatar             // Avatar hash
user.avatarURL          // Avatar URL
user.createdAt          // Account created
```

## Guild Object

```ezlang
guild.id                // Server ID
guild.name              // Server name
guild.memberCount       // Member count
guild.ownerId           // Owner ID
guild.channels          // Channel array
guild.roles             // Role array
guild.emojis            // Emoji array
guild.icon              // Icon hash
guild.iconURL           // Icon URL
```

## Channel Object

```ezlang
channel.id              // Channel ID
channel.name            // Channel name
channel.type            // Channel type
channel.guild           // Parent guild
channel.position        // Position
channel.topic           // Topic
channel.nsfw            // NSFW flag
channel.parentId        // Category ID
```

## Member Object

```ezlang
member.id               // Member ID
member.user             // User object
member.guild            // Guild object
member.nick             // Nickname
member.roles            // Role ID array
member.joinedAt         // Join timestamp
member.premiumSince     // Boost timestamp
```

[← Back to API Reference](/EasyLang/api/)
