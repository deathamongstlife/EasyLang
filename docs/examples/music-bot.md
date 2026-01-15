---
layout: default
title: Music Bot Example
---

# Music Bot Example

Full-featured music bot with queue management.

## Complete Code

```ezlang
// music-bot.ezlang

let queue = {}
let now_playing = {}

listen("ready", function() {
    print("🎵 Music Bot Online!")
})

listen("messageCreate", function(message) {
    if message.author.bot { return }

    let guild_id = message.guild.id

    // Play command
    if message.content starts_with "!play " {
        let url = split(message.content, " ")[1]
        let voice_channel = get_user_voice_channel(message.author.id)

        if voice_channel == null {
            reply(message, "❌ You need to be in a voice channel!")
            return
        }

        // Initialize queue if needed
        if not has_key(queue, guild_id) {
            queue[guild_id] = []
        }

        // Add to queue
        push(queue[guild_id], {
            "url": url,
            "requester": message.author.username
        })

        // Join and play
        let connection = join_voice_channel(voice_channel)
        
        if not has_key(now_playing, guild_id) {
            play_next(connection, guild_id)
        }

        reply(message, "✅ Added to queue: " + url)
    }

    // Stop command
    if message.content == "!stop" {
        let voice_channel = get_user_voice_channel(message.author.id)
        if voice_channel != null {
            stop_audio(voice_channel)
            leave_voice_channel(voice_channel)
            queue[guild_id] = []
            now_playing[guild_id] = null
            reply(message, "⏹️ Stopped playback")
        }
    }

    // Skip command
    if message.content == "!skip" {
        let voice_channel = get_user_voice_channel(message.author.id)
        if voice_channel != null {
            stop_audio(voice_channel)
            let connection = join_voice_channel(voice_channel)
            play_next(connection, guild_id)
            reply(message, "⏭️ Skipped")
        }
    }

    // Queue command
    if message.content == "!queue" {
        if has_key(queue, guild_id) and length(queue[guild_id]) > 0 {
            let queue_text = "🎵 **Music Queue:**\n"
            for i in range(0, length(queue[guild_id]) - 1) {
                let song = queue[guild_id][i]
                queue_text = queue_text + to_string(i + 1) + ". " + song.url + "\n"
            }
            send_message(message.channel.id, queue_text)
        } else {
            reply(message, "Queue is empty!")
        }
    }
})

function play_next(connection, guild_id) {
    if has_key(queue, guild_id) and length(queue[guild_id]) > 0 {
        let song = queue[guild_id][0]
        now_playing[guild_id] = song
        queue[guild_id] = slice(queue[guild_id], 1)

        play_youtube(connection, song.url)
    }
}

bot_start(get_env("BOT_TOKEN"))
```

## Features

- Play YouTube videos
- Queue management
- Skip, stop, pause
- Now playing info
- Volume control

[← Back to Examples](/EasyLang/examples/)
