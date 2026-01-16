/**
 * Poll System
 * Complete poll creation, management, and results tracking
 */

import {
  TextChannel,
  PollLayoutType,
  Client,
} from 'discord.js';
import { RuntimeValue, makeNativeFunction, makeBoolean, makeString, makeNumber, makeArray, makeRuntimeObject, isString, isNumber, isArray, isObject } from '../../core/runtime/values';
import { RuntimeError, TypeError } from '../../utils/errors';

/**
 * Create a poll in a channel
 */
export const createPoll = makeNativeFunction('create_poll', async (args: RuntimeValue[]) => {
  if (args.length < 3) {
    throw new RuntimeError('create_poll() expects at least 3 arguments: channel, question, answers_array, [duration_hours]');
  }

  if (!isObject(args[0])) {
    throw new TypeError('Channel must be an object');
  }

  if (!isString(args[1])) {
    throw new TypeError('Question must be a string');
  }

  if (!isArray(args[2])) {
    throw new TypeError('Answers must be an array');
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

  const question = (args[1] as any).value;
  const answersArray = (args[2] as any).elements;
  const durationHours = args.length > 3 && isNumber(args[3]) ? (args[3] as any).value : 24;

  // Convert answers to poll format
  const answers = answersArray.map((answer: RuntimeValue, index: number) => {
    if (isString(answer)) {
      return {
        text: (answer as any).value,
        emoji: undefined,
      };
    } else if (isObject(answer)) {
      const props = (answer as any).properties;
      const text = props.get('text');
      const emoji = props.get('emoji');

      return {
        text: text && isString(text) ? (text as any).value : `Option ${index + 1}`,
        emoji: emoji && isString(emoji) ? (emoji as any).value : undefined,
      };
    }
    return { text: `Option ${index + 1}`, emoji: undefined };
  });

  if (answers.length < 2 || answers.length > 10) {
    throw new RuntimeError('Poll must have between 2 and 10 answers');
  }

  // Create poll message
  const message = await channel.send({
    poll: {
      question: { text: question },
      answers: answers,
      duration: durationHours,
      allowMultiselect: false,
      layoutType: PollLayoutType.Default,
    },
  });

  // Return poll message information
  return makeRuntimeObject([
    ['message_id', makeString(message.id)],
    ['channel_id', makeString(channel.id)],
    ['question', makeString(question)],
    ['answers_count', makeNumber(answers.length)],
    ['duration_hours', makeNumber(durationHours)],
  ]);
});

/**
 * Create a multi-select poll
 */
export const createMultiSelectPoll = makeNativeFunction('create_multi_select_poll', async (args: RuntimeValue[]) => {
  if (args.length < 3) {
    throw new RuntimeError('create_multi_select_poll() expects at least 3 arguments: channel, question, answers_array, [duration_hours]');
  }

  if (!isObject(args[0])) {
    throw new TypeError('Channel must be an object');
  }

  if (!isString(args[1])) {
    throw new TypeError('Question must be a string');
  }

  if (!isArray(args[2])) {
    throw new TypeError('Answers must be an array');
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

  const question = (args[1] as any).value;
  const answersArray = (args[2] as any).elements;
  const durationHours = args.length > 3 && isNumber(args[3]) ? (args[3] as any).value : 24;

  // Convert answers to poll format
  const answers = answersArray.map((answer: RuntimeValue, index: number) => {
    if (isString(answer)) {
      return {
        text: (answer as any).value,
        emoji: undefined,
      };
    } else if (isObject(answer)) {
      const props = (answer as any).properties;
      const text = props.get('text');
      const emoji = props.get('emoji');

      return {
        text: text && isString(text) ? (text as any).value : `Option ${index + 1}`,
        emoji: emoji && isString(emoji) ? (emoji as any).value : undefined,
      };
    }
    return { text: `Option ${index + 1}`, emoji: undefined };
  });

  if (answers.length < 2 || answers.length > 10) {
    throw new RuntimeError('Poll must have between 2 and 10 answers');
  }

  // Create multi-select poll message
  const message = await channel.send({
    poll: {
      question: { text: question },
      answers: answers,
      duration: durationHours,
      allowMultiselect: true,
      layoutType: PollLayoutType.Default,
    },
  });

  // Return poll message information
  return makeRuntimeObject([
    ['message_id', makeString(message.id)],
    ['channel_id', makeString(channel.id)],
    ['question', makeString(question)],
    ['answers_count', makeNumber(answers.length)],
    ['duration_hours', makeNumber(durationHours)],
    ['multi_select', makeBoolean(true)],
  ]);
});

/**
 * End a poll immediately
 */
export const endPoll = makeNativeFunction('end_poll', async (args: RuntimeValue[]) => {
  if (args.length !== 2) {
    throw new RuntimeError('end_poll() expects 2 arguments: channel, message_id');
  }

  if (!isObject(args[0])) {
    throw new TypeError('Channel must be an object');
  }

  if (!isString(args[1])) {
    throw new TypeError('Message ID must be a string');
  }

  const channelObj = (args[0] as any).properties;
  const channelId = channelObj.get('id');
  const client = channelObj.get('_client');

  if (!channelId || !client || client.type !== 'native') {
    throw new RuntimeError('Invalid channel object');
  }

  const discordClient = client.value as Client;
  const channel = await discordClient.channels.fetch((channelId as any).value) as TextChannel;
  const messageId = (args[1] as any).value;

  if (!channel || !channel.isTextBased()) {
    throw new RuntimeError('Channel must be a text channel');
  }

  try {
    const message = await channel.messages.fetch(messageId);

    if (!message.poll) {
      throw new RuntimeError('Message is not a poll');
    }

    await message.poll.end();
    return makeBoolean(true);
  } catch (error) {
    throw new RuntimeError(`Failed to end poll: ${error instanceof Error ? error.message : String(error)}`);
  }
});

/**
 * Get poll results
 */
export const getPollResults = makeNativeFunction('get_poll_results', async (args: RuntimeValue[]) => {
  if (args.length !== 2) {
    throw new RuntimeError('get_poll_results() expects 2 arguments: channel, message_id');
  }

  if (!isObject(args[0])) {
    throw new TypeError('Channel must be an object');
  }

  if (!isString(args[1])) {
    throw new TypeError('Message ID must be a string');
  }

  const channelObj = (args[0] as any).properties;
  const channelId = channelObj.get('id');
  const client = channelObj.get('_client');

  if (!channelId || !client || client.type !== 'native') {
    throw new RuntimeError('Invalid channel object');
  }

  const discordClient = client.value as Client;
  const channel = await discordClient.channels.fetch((channelId as any).value) as TextChannel;
  const messageId = (args[1] as any).value;

  if (!channel || !channel.isTextBased()) {
    throw new RuntimeError('Channel must be a text channel');
  }

  try {
    const message = await channel.messages.fetch(messageId);

    if (!message.poll) {
      throw new RuntimeError('Message is not a poll');
    }

    const poll = message.poll;
    const resultsArray: RuntimeValue[] = [];

    // Get results for each answer
    for (const answer of poll.answers.values()) {
      resultsArray.push(makeRuntimeObject([
        ['answer_id', makeNumber(answer.id)],
        ['text', makeString(answer.text || '')],
        ['vote_count', makeNumber(answer.voteCount)],
      ]));
    }

    return makeRuntimeObject([
      ['question', makeString(poll.question.text || '')],
      ['total_votes', makeNumber(poll.answers.reduce((sum, answer) => sum + answer.voteCount, 0))],
      ['is_finalized', makeBoolean(poll.resultsFinalized)],
      ['results', makeArray(resultsArray)],
    ]);
  } catch (error) {
    throw new RuntimeError(`Failed to get poll results: ${error instanceof Error ? error.message : String(error)}`);
  }
});

/**
 * Get voters for a specific poll answer
 */
export const getPollVoters = makeNativeFunction('get_poll_voters', async (args: RuntimeValue[]) => {
  if (args.length !== 3) {
    throw new RuntimeError('get_poll_voters() expects 3 arguments: channel, message_id, answer_id');
  }

  if (!isObject(args[0])) {
    throw new TypeError('Channel must be an object');
  }

  if (!isString(args[1])) {
    throw new TypeError('Message ID must be a string');
  }

  if (!isNumber(args[2])) {
    throw new TypeError('Answer ID must be a number');
  }

  const channelObj = (args[0] as any).properties;
  const channelId = channelObj.get('id');
  const client = channelObj.get('_client');

  if (!channelId || !client || client.type !== 'native') {
    throw new RuntimeError('Invalid channel object');
  }

  const discordClient = client.value as Client;
  const channel = await discordClient.channels.fetch((channelId as any).value) as TextChannel;
  const messageId = (args[1] as any).value;
  const answerId = (args[2] as any).value;

  if (!channel || !channel.isTextBased()) {
    throw new RuntimeError('Channel must be a text channel');
  }

  try {
    const message = await channel.messages.fetch(messageId);

    if (!message.poll) {
      throw new RuntimeError('Message is not a poll');
    }

    const answer = message.poll.answers.get(answerId);
    if (!answer) {
      throw new RuntimeError(`Answer with ID ${answerId} not found`);
    }

    const voters = await answer.fetchVoters();
    const votersArray: RuntimeValue[] = [];

    for (const user of voters.values()) {
      votersArray.push(makeRuntimeObject([
        ['id', makeString(user.id)],
        ['username', makeString(user.username)],
        ['tag', makeString(user.tag)],
      ]));
    }

    return makeArray(votersArray);
  } catch (error) {
    throw new RuntimeError(`Failed to get poll voters: ${error instanceof Error ? error.message : String(error)}`);
  }
});

export const pollBuiltins = {
  create_poll: createPoll,
  create_multi_select_poll: createMultiSelectPoll,
  end_poll: endPoll,
  get_poll_results: getPollResults,
  get_poll_voters: getPollVoters,
};
