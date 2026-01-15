---
layout: default
title: Voice Functions
---

# Voice Functions

## Connection

### join_voice_channel(channel_id)
Join voice channel. Returns connection object.

### leave_voice_channel(channel_id)
Leave voice channel.

## Playback

### play_audio(connection, buffer)
Play audio from buffer.

### play_file(connection, file_path)
Play local audio file.

### play_youtube(connection, url)
Play from YouTube URL.

### pause_audio(connection)
Pause playback.

### resume_audio(connection)
Resume playback.

### stop_audio(connection)
Stop playback.

### set_volume(connection, volume)
Set volume (0-100).

## Queue Management

### create_queue()
Create music queue.

### queue_add(queue, item)
Add to queue.

### queue_remove(queue, index)
Remove from queue.

### queue_clear(queue)
Clear queue.

### get_queue_length(queue)
Get queue size.

[← Back to API Reference](/EasyLang/api/)
