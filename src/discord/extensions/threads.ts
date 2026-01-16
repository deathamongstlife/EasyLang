/**
 * Thread Management
 * Complete thread operations including creation, management, and member handling
 */

import {
  TextChannel,
  ThreadChannel,
  ThreadAutoArchiveDuration,
  ChannelType,
  Client,
} from 'discord.js';
import { RuntimeValue, makeNativeFunction, makeBoolean, makeString, makeNumber, makeArray, makeRuntimeObject, isString, isNumber, isObject, isBoolean } from '../../core/runtime/values';
import { RuntimeError, TypeError } from '../../utils/errors';

/**
 * Create a thread in a channel
 */
export const createThread = makeNativeFunction('create_thread', async (args: RuntimeValue[]) => {
  if (args.length < 2) {
    throw new RuntimeError('create_thread() expects at least 2 arguments: channel, name, [options]');
  }

  if (!isObject(args[0])) {
    throw new TypeError('Channel must be an object');
  }

  if (!isString(args[1])) {
    throw new TypeError('Thread name must be a string');
  }

  const channelObj = (args[0] as any).properties;
  const channelId = channelObj.get('id');
  const client = channelObj.get('_client');

  if (!channelId || !client || client.type !== 'native') {
    throw new RuntimeError('Invalid channel object');
  }

  const discordClient = client.value as Client;
  const channel = await discordClient.channels.fetch((channelId as any).value) as TextChannel;

  if (!channel || !channel.isTextBased()) {
    throw new RuntimeError('Channel must be a text channel');
  }

  const name = (args[1] as any).value;
  const options = args.length > 2 && isObject(args[2]) ? (args[2] as any).properties : new Map();

  const threadData: any = { name };

  const autoArchiveDuration = options.get('auto_archive_duration');
  if (autoArchiveDuration && isNumber(autoArchiveDuration)) {
    threadData.autoArchiveDuration = (autoArchiveDuration as any).value as ThreadAutoArchiveDuration;
  }

  const type = options.get('type');
  if (type && isString(type)) {
    const typeValue = (type as any).value.toLowerCase();
    if (typeValue === 'public') {
      threadData.type = ChannelType.PublicThread;
    } else if (typeValue === 'private') {
      threadData.type = ChannelType.PrivateThread;
    }
  }

  const reason = options.get('reason');
  if (reason && isString(reason)) {
    threadData.reason = (reason as any).value;
  }

  const invitable = options.get('invitable');
  if (invitable && isBoolean(invitable)) {
    threadData.invitable = (invitable as any).value;
  }

  try {
    const thread = await channel.threads.create(threadData);

    return makeRuntimeObject([
      ['id', makeString(thread.id)],
      ['name', makeString(thread.name)],
      ['parent_id', makeString(thread.parentId || '')],
      ['owner_id', makeString(thread.ownerId || '')],
      ['archived', makeBoolean(thread.archived || false)],
      ['locked', makeBoolean(thread.locked || false)],
      ['member_count', makeNumber(thread.memberCount || 0)],
      ['_client', { type: 'native', value: discordClient } as any],
    ]);
  } catch (error) {
    throw new RuntimeError(`Failed to create thread: ${error instanceof Error ? error.message : String(error)}`);
  }
});

/**
 * Create a thread from a message
 */
export const createThreadFromMessage = makeNativeFunction('create_thread_from_message', async (args: RuntimeValue[]) => {
  if (args.length < 2) {
    throw new RuntimeError('create_thread_from_message() expects at least 2 arguments: message, name, [auto_archive_duration]');
  }

  if (!isObject(args[0])) {
    throw new TypeError('Message must be an object');
  }

  if (!isString(args[1])) {
    throw new TypeError('Thread name must be a string');
  }

  const messageObj = (args[0] as any).properties;
  const messageId = messageObj.get('id');
  const channelId = messageObj.get('channel_id');
  const client = messageObj.get('_client');

  if (!messageId || !channelId || !client || client.type !== 'native') {
    throw new RuntimeError('Invalid message object');
  }

  const discordClient = client.value as Client;
  const channel = await discordClient.channels.fetch((channelId as any).value) as TextChannel;
  const message = await channel.messages.fetch((messageId as any).value);

  const name = (args[1] as any).value;
  const autoArchiveDuration = args.length > 2 && isNumber(args[2])
    ? (args[2] as any).value as ThreadAutoArchiveDuration
    : ThreadAutoArchiveDuration.OneDay;

  try {
    const thread = await message.startThread({
      name,
      autoArchiveDuration,
    });

    return makeRuntimeObject([
      ['id', makeString(thread.id)],
      ['name', makeString(thread.name)],
      ['parent_id', makeString(thread.parentId || '')],
      ['_client', { type: 'native', value: discordClient } as any],
    ]);
  } catch (error) {
    throw new RuntimeError(`Failed to create thread from message: ${error instanceof Error ? error.message : String(error)}`);
  }
});

/**
 * Join a thread
 */
export const joinThread = makeNativeFunction('join_thread', async (args: RuntimeValue[]) => {
  if (args.length !== 1) {
    throw new RuntimeError('join_thread() expects 1 argument: thread_id');
  }

  if (!isString(args[0])) {
    throw new TypeError('Thread ID must be a string');
  }

  try {
    // Note: Requires client context
    throw new RuntimeError('join_thread() requires thread object - pass the thread returned from create_thread()');
  } catch (error) {
    throw new RuntimeError(`Failed to join thread: ${error instanceof Error ? error.message : String(error)}`);
  }
});

/**
 * Leave a thread
 */
export const leaveThread = makeNativeFunction('leave_thread', async (args: RuntimeValue[]) => {
  if (args.length !== 1) {
    throw new RuntimeError('leave_thread() expects 1 argument: thread');
  }

  if (!isObject(args[0])) {
    throw new TypeError('Thread must be an object');
  }

  const threadObj = (args[0] as any).properties;
  const threadId = threadObj.get('id');
  const client = threadObj.get('_client');

  if (!threadId || !client || client.type !== 'native') {
    throw new RuntimeError('Invalid thread object');
  }

  const discordClient = client.value as Client;
  const thread = await discordClient.channels.fetch((threadId as any).value) as ThreadChannel;

  try {
    await thread.leave();
    return makeBoolean(true);
  } catch (error) {
    throw new RuntimeError(`Failed to leave thread: ${error instanceof Error ? error.message : String(error)}`);
  }
});

/**
 * Add a member to a thread
 */
export const addThreadMember = makeNativeFunction('add_thread_member', async (args: RuntimeValue[]) => {
  if (args.length !== 2) {
    throw new RuntimeError('add_thread_member() expects 2 arguments: thread, user_id');
  }

  if (!isObject(args[0])) {
    throw new TypeError('Thread must be an object');
  }

  if (!isString(args[1])) {
    throw new TypeError('User ID must be a string');
  }

  const threadObj = (args[0] as any).properties;
  const threadId = threadObj.get('id');
  const client = threadObj.get('_client');

  if (!threadId || !client || client.type !== 'native') {
    throw new RuntimeError('Invalid thread object');
  }

  const discordClient = client.value as Client;
  const thread = await discordClient.channels.fetch((threadId as any).value) as ThreadChannel;
  const userId = (args[1] as any).value;

  try {
    await thread.members.add(userId);
    return makeBoolean(true);
  } catch (error) {
    throw new RuntimeError(`Failed to add thread member: ${error instanceof Error ? error.message : String(error)}`);
  }
});

/**
 * Remove a member from a thread
 */
export const removeThreadMember = makeNativeFunction('remove_thread_member', async (args: RuntimeValue[]) => {
  if (args.length !== 2) {
    throw new RuntimeError('remove_thread_member() expects 2 arguments: thread, user_id');
  }

  if (!isObject(args[0])) {
    throw new TypeError('Thread must be an object');
  }

  if (!isString(args[1])) {
    throw new TypeError('User ID must be a string');
  }

  const threadObj = (args[0] as any).properties;
  const threadId = threadObj.get('id');
  const client = threadObj.get('_client');

  if (!threadId || !client || client.type !== 'native') {
    throw new RuntimeError('Invalid thread object');
  }

  const discordClient = client.value as Client;
  const thread = await discordClient.channels.fetch((threadId as any).value) as ThreadChannel;
  const userId = (args[1] as any).value;

  try {
    await thread.members.remove(userId);
    return makeBoolean(true);
  } catch (error) {
    throw new RuntimeError(`Failed to remove thread member: ${error instanceof Error ? error.message : String(error)}`);
  }
});

/**
 * Archive a thread
 */
export const archiveThread = makeNativeFunction('archive_thread', async (args: RuntimeValue[]) => {
  if (args.length !== 1) {
    throw new RuntimeError('archive_thread() expects 1 argument: thread');
  }

  if (!isObject(args[0])) {
    throw new TypeError('Thread must be an object');
  }

  const threadObj = (args[0] as any).properties;
  const threadId = threadObj.get('id');
  const client = threadObj.get('_client');

  if (!threadId || !client || client.type !== 'native') {
    throw new RuntimeError('Invalid thread object');
  }

  const discordClient = client.value as Client;
  const thread = await discordClient.channels.fetch((threadId as any).value) as ThreadChannel;

  try {
    await thread.setArchived(true);
    return makeBoolean(true);
  } catch (error) {
    throw new RuntimeError(`Failed to archive thread: ${error instanceof Error ? error.message : String(error)}`);
  }
});

/**
 * Unarchive a thread
 */
export const unarchiveThread = makeNativeFunction('unarchive_thread', async (args: RuntimeValue[]) => {
  if (args.length !== 1) {
    throw new RuntimeError('unarchive_thread() expects 1 argument: thread');
  }

  if (!isObject(args[0])) {
    throw new TypeError('Thread must be an object');
  }

  const threadObj = (args[0] as any).properties;
  const threadId = threadObj.get('id');
  const client = threadObj.get('_client');

  if (!threadId || !client || client.type !== 'native') {
    throw new RuntimeError('Invalid thread object');
  }

  const discordClient = client.value as Client;
  const thread = await discordClient.channels.fetch((threadId as any).value) as ThreadChannel;

  try {
    await thread.setArchived(false);
    return makeBoolean(true);
  } catch (error) {
    throw new RuntimeError(`Failed to unarchive thread: ${error instanceof Error ? error.message : String(error)}`);
  }
});

/**
 * Get thread members
 */
export const getThreadMembers = makeNativeFunction('get_thread_members', async (args: RuntimeValue[]) => {
  if (args.length !== 1) {
    throw new RuntimeError('get_thread_members() expects 1 argument: thread');
  }

  if (!isObject(args[0])) {
    throw new TypeError('Thread must be an object');
  }

  const threadObj = (args[0] as any).properties;
  const threadId = threadObj.get('id');
  const client = threadObj.get('_client');

  if (!threadId || !client || client.type !== 'native') {
    throw new RuntimeError('Invalid thread object');
  }

  const discordClient = client.value as Client;
  const thread = await discordClient.channels.fetch((threadId as any).value) as ThreadChannel;

  try {
    const members = await thread.members.fetch();
    const membersArray: RuntimeValue[] = [];

    for (const member of members.values()) {
      membersArray.push(makeRuntimeObject([
        ['id', makeString(member.id)],
        ['user_id', makeString(member.id)],
        ['join_timestamp', makeNumber(member.joinedTimestamp || 0)],
      ]));
    }

    return makeArray(membersArray);
  } catch (error) {
    throw new RuntimeError(`Failed to get thread members: ${error instanceof Error ? error.message : String(error)}`);
  }
});

export const threadBuiltins = {
  create_thread: createThread,
  create_thread_from_message: createThreadFromMessage,
  join_thread: joinThread,
  leave_thread: leaveThread,
  add_thread_member: addThreadMember,
  remove_thread_member: removeThreadMember,
  archive_thread: archiveThread,
  unarchive_thread: unarchiveThread,
  get_thread_members: getThreadMembers,
};
