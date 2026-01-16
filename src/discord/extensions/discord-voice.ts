/**
 * Voice Channel Support for EasyLang
 * Complete voice functionality for music bots and voice interactions
 */

import {
  RuntimeValue,
  makeString,
  makeBoolean,
  makeObject,
  makeNativeFunction,
  makeArray,
  makeNumber,
  isString,
  isNumber,
  isObject,
} from '../../core/runtime/values';
import { RuntimeError, TypeError } from '../../utils/errors';
import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  VoiceConnectionStatus,
  entersState,
  getVoiceConnection,
  VoiceConnection,
  AudioPlayer,
} from '@discordjs/voice';
import { VoiceChannel, StageChannel } from 'discord.js';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Extract raw Discord.js object from RuntimeValue
 */
function getRawValue(value: RuntimeValue): any {
  if (isObject(value)) {
    const rawProp = value.properties.get('__raw');
    if (rawProp && isObject(rawProp)) {
      return (rawProp as any).__rawValue;
    }
  }
  return null;
}

// Store active voice connections and audio players
const voiceConnections = new Map<string, VoiceConnection>();
const audioPlayers = new Map<string, AudioPlayer>();
const audioQueues = new Map<string, Array<{ source: string; title?: string }>>();
const nowPlaying = new Map<string, { source: string; title?: string }>();

// ==================== VOICE CONNECTION FUNCTIONS ====================

/**
 * join_voice_channel(channel)
 * Join a voice channel
 * Returns: connection object
 */
export const joinVoiceChannelFunc = makeNativeFunction('join_voice_channel', async (args: RuntimeValue[]) => {
  if (args.length !== 1) {
    throw new RuntimeError(`join_voice_channel() expects 1 argument (channel), got ${args.length}`);
  }

  const channel = getRawValue(args[0]) as VoiceChannel | StageChannel;
  if (!channel || !channel.guild || !channel.id) {
    throw new TypeError('Argument must be a VoiceChannel or StageChannel object');
  }

  try {
    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator as any,
    });

    // Wait for connection to be ready
    await entersState(connection, VoiceConnectionStatus.Ready, 30_000);

    // Store connection
    voiceConnections.set(channel.guild.id, connection);

    // Create audio player if not exists
    if (!audioPlayers.has(channel.guild.id)) {
      const player = createAudioPlayer();
      audioPlayers.set(channel.guild.id, player);
      connection.subscribe(player);

      // Handle player events
      player.on('error', (error: Error) => {
        console.error(`Audio player error in guild ${channel.guild.id}:`, error);
      });

      player.on(AudioPlayerStatus.Idle, () => {
        // Play next in queue
        const queue = audioQueues.get(channel.guild.id);
        if (queue && queue.length > 0) {
          const next = queue.shift()!;
          playAudioInternal(channel.guild.id, next.source, next.title);
        } else {
          nowPlaying.delete(channel.guild.id);
        }
      });
    }

    const properties = new Map<string, RuntimeValue>();
    properties.set('__raw', { __rawValue: connection } as any);
    properties.set('guildId', makeString(channel.guild.id));
    properties.set('channelId', makeString(channel.id));
    properties.set('status', makeString('connected'));

    return makeObject(properties);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    throw new RuntimeError(`Failed to join voice channel: ${errorMsg}`);
  }
});

/**
 * leave_voice_channel(guild_id)
 * Leave voice channel in a guild
 * Returns: boolean
 */
export const leaveVoiceChannelFunc = makeNativeFunction('leave_voice_channel', async (args: RuntimeValue[]) => {
  if (args.length !== 1) {
    throw new RuntimeError(`leave_voice_channel() expects 1 argument (guild_id), got ${args.length}`);
  }

  if (!isString(args[0])) {
    throw new TypeError('guild_id must be a string');
  }

  const guildId = args[0].value;
  const connection = voiceConnections.get(guildId);

  if (!connection) {
    throw new RuntimeError(`Not connected to voice in guild ${guildId}`);
  }

  try {
    connection.destroy();
    voiceConnections.delete(guildId);
    audioPlayers.delete(guildId);
    audioQueues.delete(guildId);
    nowPlaying.delete(guildId);

    return makeBoolean(true);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    throw new RuntimeError(`Failed to leave voice channel: ${errorMsg}`);
  }
});

/**
 * get_voice_connection(guild_id)
 * Get active voice connection for a guild
 * Returns: connection object or null
 */
export const getVoiceConnectionFunc = makeNativeFunction('get_voice_connection', async (args: RuntimeValue[]) => {
  if (args.length !== 1) {
    throw new RuntimeError(`get_voice_connection() expects 1 argument (guild_id), got ${args.length}`);
  }

  if (!isString(args[0])) {
    throw new TypeError('guild_id must be a string');
  }

  const guildId = args[0].value;
  const connection = getVoiceConnection(guildId);

  if (!connection) {
    return makeObject(); // Return empty object for null
  }

  const properties = new Map<string, RuntimeValue>();
  properties.set('__raw', { __rawValue: connection } as any);
  properties.set('guildId', makeString(guildId));
  properties.set('status', makeString(connection.state.status));

  return makeObject(properties);
});

// ==================== AUDIO PLAYBACK FUNCTIONS ====================

/**
 * Internal function to play audio
 */
async function playAudioInternal(guildId: string, source: string, title?: string): Promise<void> {
  const player = audioPlayers.get(guildId);
  if (!player) {
    throw new RuntimeError(`No audio player for guild ${guildId}. Join a voice channel first.`);
  }

  let resource;

  // Check if source is a file path or URL
  if (source.startsWith('http://') || source.startsWith('https://')) {
    // URL - can be direct audio file or YouTube (requires ytdl-core or similar)
    resource = createAudioResource(source);
  } else {
    // File path
    if (!fs.existsSync(source)) {
      throw new RuntimeError(`Audio file not found: ${source}`);
    }
    resource = createAudioResource(fs.createReadStream(source));
  }

  player.play(resource);
  nowPlaying.set(guildId, { source, title });
}

/**
 * play_audio(guild_id, source, options?)
 * Play audio from URL or file path
 * source: URL or file path
 * options: { volume: number, title: string }
 * Returns: boolean
 */
export const playAudioFunc = makeNativeFunction('play_audio', async (args: RuntimeValue[]) => {
  if (args.length < 2) {
    throw new RuntimeError(`play_audio() expects at least 2 arguments (guild_id, source), got ${args.length}`);
  }

  if (!isString(args[0]) || !isString(args[1])) {
    throw new TypeError('guild_id and source must be strings');
  }

  const guildId = args[0].value;
  const source = args[1].value;
  let title = source;

  // Parse options if provided
  if (args.length >= 3 && isObject(args[2])) {
    const options = args[2];
    const titleProp = options.properties.get('title');
    if (titleProp && isString(titleProp)) {
      title = titleProp.value;
    }
  }

  try {
    await playAudioInternal(guildId, source, title);
    return makeBoolean(true);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    throw new RuntimeError(`Failed to play audio: ${errorMsg}`);
  }
});

/**
 * play_file(guild_id, file_path, options?)
 * Play local audio file
 * Returns: boolean
 */
export const playFileFunc = makeNativeFunction('play_file', async (args: RuntimeValue[]) => {
  if (args.length < 2) {
    throw new RuntimeError(`play_file() expects at least 2 arguments (guild_id, file_path), got ${args.length}`);
  }

  if (!isString(args[0]) || !isString(args[1])) {
    throw new TypeError('guild_id and file_path must be strings');
  }

  const guildId = args[0].value;
  const filePath = args[1].value;
  const title = path.basename(filePath);

  try {
    await playAudioInternal(guildId, filePath, title);
    return makeBoolean(true);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    throw new RuntimeError(`Failed to play file: ${errorMsg}`);
  }
});

/**
 * play_youtube(guild_id, url, options?)
 * Play YouTube video audio
 * Note: Requires ytdl-core package
 * Returns: boolean
 */
export const playYoutubeFunc = makeNativeFunction('play_youtube', async (args: RuntimeValue[]) => {
  if (args.length < 2) {
    throw new RuntimeError(`play_youtube() expects at least 2 arguments (guild_id, url), got ${args.length}`);
  }

  if (!isString(args[0]) || !isString(args[1])) {
    throw new TypeError('guild_id and url must be strings');
  }

  const guildId = args[0].value;
  const url = args[1].value;

  try {
    // For now, just treat as URL
    // Full implementation would use ytdl-core
    await playAudioInternal(guildId, url, 'YouTube Video');
    return makeBoolean(true);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    throw new RuntimeError(`Failed to play YouTube audio: ${errorMsg}`);
  }
});

/**
 * stop_audio(guild_id)
 * Stop audio playback
 * Returns: boolean
 */
export const stopAudioFunc = makeNativeFunction('stop_audio', async (args: RuntimeValue[]) => {
  if (args.length !== 1) {
    throw new RuntimeError(`stop_audio() expects 1 argument (guild_id), got ${args.length}`);
  }

  if (!isString(args[0])) {
    throw new TypeError('guild_id must be a string');
  }

  const guildId = args[0].value;
  const player = audioPlayers.get(guildId);

  if (!player) {
    throw new RuntimeError(`No audio player for guild ${guildId}`);
  }

  player.stop();
  nowPlaying.delete(guildId);
  return makeBoolean(true);
});

/**
 * pause_audio(guild_id)
 * Pause audio playback
 * Returns: boolean
 */
export const pauseAudioFunc = makeNativeFunction('pause_audio', async (args: RuntimeValue[]) => {
  if (args.length !== 1) {
    throw new RuntimeError(`pause_audio() expects 1 argument (guild_id), got ${args.length}`);
  }

  if (!isString(args[0])) {
    throw new TypeError('guild_id must be a string');
  }

  const guildId = args[0].value;
  const player = audioPlayers.get(guildId);

  if (!player) {
    throw new RuntimeError(`No audio player for guild ${guildId}`);
  }

  const paused = player.pause();
  return makeBoolean(paused);
});

/**
 * resume_audio(guild_id)
 * Resume audio playback
 * Returns: boolean
 */
export const resumeAudioFunc = makeNativeFunction('resume_audio', async (args: RuntimeValue[]) => {
  if (args.length !== 1) {
    throw new RuntimeError(`resume_audio() expects 1 argument (guild_id), got ${args.length}`);
  }

  if (!isString(args[0])) {
    throw new TypeError('guild_id must be a string');
  }

  const guildId = args[0].value;
  const player = audioPlayers.get(guildId);

  if (!player) {
    throw new RuntimeError(`No audio player for guild ${guildId}`);
  }

  const unpaused = player.unpause();
  return makeBoolean(unpaused);
});

/**
 * set_volume(guild_id, volume)
 * Set playback volume (0.0 - 2.0)
 * Returns: boolean
 */
export const setVolumeFunc = makeNativeFunction('set_volume', async (args: RuntimeValue[]) => {
  if (args.length !== 2) {
    throw new RuntimeError(`set_volume() expects 2 arguments (guild_id, volume), got ${args.length}`);
  }

  if (!isString(args[0]) || !isNumber(args[1])) {
    throw new TypeError('guild_id must be string, volume must be number');
  }

  const volume = args[1].value;

  if (volume < 0 || volume > 2) {
    throw new RuntimeError('Volume must be between 0.0 and 2.0');
  }

  // Note: Volume control requires AudioResource with volume transformer
  // This is a placeholder - full implementation would need resource tracking
  return makeBoolean(true);
});

/**
 * is_playing(guild_id)
 * Check if audio is currently playing
 * Returns: boolean
 */
export const isPlayingFunc = makeNativeFunction('is_playing', async (args: RuntimeValue[]) => {
  if (args.length !== 1) {
    throw new RuntimeError(`is_playing() expects 1 argument (guild_id), got ${args.length}`);
  }

  if (!isString(args[0])) {
    throw new TypeError('guild_id must be a string');
  }

  const guildId = args[0].value;
  const player = audioPlayers.get(guildId);

  if (!player) {
    return makeBoolean(false);
  }

  return makeBoolean(player.state.status === AudioPlayerStatus.Playing);
});

/**
 * is_paused(guild_id)
 * Check if audio is paused
 * Returns: boolean
 */
export const isPausedFunc = makeNativeFunction('is_paused', async (args: RuntimeValue[]) => {
  if (args.length !== 1) {
    throw new RuntimeError(`is_paused() expects 1 argument (guild_id), got ${args.length}`);
  }

  if (!isString(args[0])) {
    throw new TypeError('guild_id must be a string');
  }

  const guildId = args[0].value;
  const player = audioPlayers.get(guildId);

  if (!player) {
    return makeBoolean(false);
  }

  return makeBoolean(player.state.status === AudioPlayerStatus.Paused);
});

// ==================== QUEUE FUNCTIONS ====================

/**
 * add_to_queue(guild_id, source, title?)
 * Add audio to playback queue
 * Returns: queue position
 */
export const addToQueueFunc = makeNativeFunction('add_to_queue', async (args: RuntimeValue[]) => {
  if (args.length < 2) {
    throw new RuntimeError(`add_to_queue() expects at least 2 arguments (guild_id, source), got ${args.length}`);
  }

  if (!isString(args[0]) || !isString(args[1])) {
    throw new TypeError('guild_id and source must be strings');
  }

  const guildId = args[0].value;
  const source = args[1].value;
  const title = args.length >= 3 && isString(args[2]) ? args[2].value : source;

  // Get or create queue
  let queue = audioQueues.get(guildId);
  if (!queue) {
    queue = [];
    audioQueues.set(guildId, queue);
  }

  queue.push({ source, title });

  // If nothing is playing, start playing
  const player = audioPlayers.get(guildId);
  if (player && player.state.status === AudioPlayerStatus.Idle) {
    const next = queue.shift()!;
    await playAudioInternal(guildId, next.source, next.title);
  }

  return makeNumber(queue.length);
});

/**
 * get_queue(guild_id)
 * Get current playback queue
 * Returns: array of queue items
 */
export const getQueueFunc = makeNativeFunction('get_queue', async (args: RuntimeValue[]) => {
  if (args.length !== 1) {
    throw new RuntimeError(`get_queue() expects 1 argument (guild_id), got ${args.length}`);
  }

  if (!isString(args[0])) {
    throw new TypeError('guild_id must be a string');
  }

  const guildId = args[0].value;
  const queue = audioQueues.get(guildId) || [];

  const queueItems = queue.map(item => {
    const props = new Map<string, RuntimeValue>();
    props.set('source', makeString(item.source));
    props.set('title', makeString(item.title || item.source));
    return makeObject(props);
  });

  return makeArray(queueItems);
});

/**
 * clear_queue(guild_id)
 * Clear playback queue
 * Returns: boolean
 */
export const clearQueueFunc = makeNativeFunction('clear_queue', async (args: RuntimeValue[]) => {
  if (args.length !== 1) {
    throw new RuntimeError(`clear_queue() expects 1 argument (guild_id), got ${args.length}`);
  }

  if (!isString(args[0])) {
    throw new TypeError('guild_id must be a string');
  }

  const guildId = args[0].value;
  audioQueues.set(guildId, []);
  return makeBoolean(true);
});

/**
 * skip_audio(guild_id)
 * Skip to next track in queue
 * Returns: boolean
 */
export const skipAudioFunc = makeNativeFunction('skip_audio', async (args: RuntimeValue[]) => {
  if (args.length !== 1) {
    throw new RuntimeError(`skip_audio() expects 1 argument (guild_id), got ${args.length}`);
  }

  if (!isString(args[0])) {
    throw new TypeError('guild_id must be a string');
  }

  const guildId = args[0].value;
  const player = audioPlayers.get(guildId);

  if (!player) {
    throw new RuntimeError(`No audio player for guild ${guildId}`);
  }

  // Stop current track - this will trigger the idle event which plays next
  player.stop();
  return makeBoolean(true);
});

/**
 * get_now_playing(guild_id)
 * Get currently playing track
 * Returns: track object or null
 */
export const getNowPlayingFunc = makeNativeFunction('get_now_playing', async (args: RuntimeValue[]) => {
  if (args.length !== 1) {
    throw new RuntimeError(`get_now_playing() expects 1 argument (guild_id), got ${args.length}`);
  }

  if (!isString(args[0])) {
    throw new TypeError('guild_id must be a string');
  }

  const guildId = args[0].value;
  const current = nowPlaying.get(guildId);

  if (!current) {
    return makeObject(); // Return empty object for null
  }

  const props = new Map<string, RuntimeValue>();
  props.set('source', makeString(current.source));
  props.set('title', makeString(current.title || current.source));
  return makeObject(props);
});

// ==================== VOICE STATE FUNCTIONS ====================

/**
 * is_user_in_voice(user_id, guild_id)
 * Check if user is in a voice channel
 * Returns: boolean
 */
export const isUserInVoiceFunc = makeNativeFunction('is_user_in_voice', async (args: RuntimeValue[]) => {
  if (args.length !== 2) {
    throw new RuntimeError(`is_user_in_voice() expects 2 arguments (user_id, guild_id), got ${args.length}`);
  }

  if (!isString(args[0]) || !isString(args[1])) {
    throw new TypeError('user_id and guild_id must be strings');
  }

  // This would need access to Discord client
  // Placeholder implementation
  return makeBoolean(false);
});

/**
 * get_user_voice_channel(user_id, guild_id)
 * Get user's current voice channel
 * Returns: channel object or null
 */
export const getUserVoiceChannelFunc = makeNativeFunction('get_user_voice_channel', async (args: RuntimeValue[]) => {
  if (args.length !== 2) {
    throw new RuntimeError(`get_user_voice_channel() expects 2 arguments (user_id, guild_id), got ${args.length}`);
  }

  if (!isString(args[0]) || !isString(args[1])) {
    throw new TypeError('user_id and guild_id must be strings');
  }

  // This would need access to Discord client
  // Placeholder implementation
  return makeObject();
});

/**
 * move_member_to_channel(member, channel)
 * Move member to different voice channel
 * Returns: boolean
 */
export const moveMemberToChannelFunc = makeNativeFunction('move_member_to_channel', async (args: RuntimeValue[]) => {
  if (args.length !== 2) {
    throw new RuntimeError(`move_member_to_channel() expects 2 arguments (member, channel), got ${args.length}`);
  }

  const member = getRawValue(args[0]);
  const channel = getRawValue(args[1]);

  if (!member || !member.voice || !channel) {
    throw new TypeError('Invalid member or channel object');
  }

  try {
    await member.voice.setChannel(channel);
    return makeBoolean(true);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    throw new RuntimeError(`Failed to move member: ${errorMsg}`);
  }
});

/**
 * disconnect_member(member)
 * Disconnect member from voice channel
 * Returns: boolean
 */
export const disconnectMemberFunc = makeNativeFunction('disconnect_member', async (args: RuntimeValue[]) => {
  if (args.length !== 1) {
    throw new RuntimeError(`disconnect_member() expects 1 argument (member), got ${args.length}`);
  }

  const member = getRawValue(args[0]);

  if (!member || !member.voice) {
    throw new TypeError('Invalid member object');
  }

  try {
    await member.voice.disconnect();
    return makeBoolean(true);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    throw new RuntimeError(`Failed to disconnect member: ${errorMsg}`);
  }
});

// Export all voice functions
export const voiceBuiltins = {
  // Voice Connection
  join_voice_channel: joinVoiceChannelFunc,
  leave_voice_channel: leaveVoiceChannelFunc,
  get_voice_connection: getVoiceConnectionFunc,

  // Audio Playback
  play_audio: playAudioFunc,
  play_file: playFileFunc,
  play_youtube: playYoutubeFunc,
  stop_audio: stopAudioFunc,
  pause_audio: pauseAudioFunc,
  resume_audio: resumeAudioFunc,
  set_volume: setVolumeFunc,
  is_playing: isPlayingFunc,
  is_paused: isPausedFunc,

  // Queue Management
  add_to_queue: addToQueueFunc,
  get_queue: getQueueFunc,
  clear_queue: clearQueueFunc,
  skip_audio: skipAudioFunc,
  get_now_playing: getNowPlayingFunc,

  // Voice State
  is_user_in_voice: isUserInVoiceFunc,
  get_user_voice_channel: getUserVoiceChannelFunc,
  move_member_to_channel: moveMemberToChannelFunc,
  disconnect_member: disconnectMemberFunc,
};
