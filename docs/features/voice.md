---
layout: default
title: Voice
description: Join voice channels and play audio
---

# Voice Features

Play music and audio in Discord voice channels.

## Available Functions

- `join_voice_channel` - Join a voice channel
- `leave_voice_channel` - Leave voice channel
- `play_audio` - Play audio from buffer
- `play_file` - Play local audio file
- `play_youtube` - Play from YouTube URL
- `pause_audio` - Pause playback
- `resume_audio` - Resume playback
- `stop_audio` - Stop playback
- `set_volume` - Set volume (0-100)
- `create_queue` - Create music queue
- `queue_add` - Add to queue

## Basic Example

```ezlang
listen("messageCreate", function(message) {
    if message.content starts_with "!play " {
        let url = split(message.content, " ")[1]
        let voice_channel = get_user_voice_channel(message.author.id)

        if voice_channel != null {
            let connection = join_voice_channel(voice_channel)
            play_youtube(connection, url)
            reply(message, "Now playing! 🎵")
        }
    }
})
```

## Queue System

```ezlang
let queue = create_queue()

listen("messageCreate", function(message) {
    if message.content starts_with "!play " {
        let url = split(message.content, " ")[1]
        queue_add(queue, url)

        let voice_channel = get_user_voice_channel(message.author.id)
        let connection = join_voice_channel(voice_channel)

        play_next_in_queue(connection, queue)
    }

    if message.content == "!skip" {
        skip_current(queue)
    }
})
```

[← Back to Features](/EasyLang/features/)
