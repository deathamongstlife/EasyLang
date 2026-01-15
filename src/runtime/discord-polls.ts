/**
 * Discord Poll Support for EzLang
 * Provides native Discord poll functionality
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
  isBoolean,
  isArray,
  isObject,
} from './values';
import { RuntimeError, TypeError } from '../utils/errors';
import {
  TextChannel,
  NewsChannel,
  Message,
  PollLayoutType,
} from 'discord.js';

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

/**
 * create_poll(question, answers_array, duration_hours, allow_multiselect?)
 * Create a poll object
 *
 * Parameters:
 * - question: Poll question (max 300 chars)
 * - answers_array: Array of answer strings (2-10 answers, max 55 chars each)
 * - duration_hours: Poll duration in hours (1-336 hours / 14 days)
 * - allow_multiselect: Allow multiple answers (default: false)
 */
export const createPoll = makeNativeFunction('create_poll', async (args: RuntimeValue[]) => {
  if (args.length < 3) {
    throw new RuntimeError(`create_poll() expects at least 3 arguments (question, answers_array, duration_hours), got ${args.length}`);
  }

  if (!isString(args[0])) {
    throw new TypeError('Question must be a string');
  }

  if (!isArray(args[1])) {
    throw new TypeError('Answers must be an array');
  }

  if (!isNumber(args[2])) {
    throw new TypeError('Duration must be a number (hours)');
  }

  const question = args[0].value;
  const answersArray = args[1];
  const durationHours = args[2].value;
  const allowMultiselect = args.length >= 4 && isBoolean(args[3]) ? args[3].value : false;

  // Validate question
  if (question.length === 0) {
    throw new RuntimeError('Question cannot be empty');
  }
  if (question.length > 300) {
    throw new RuntimeError('Question cannot exceed 300 characters');
  }

  // Validate and extract answers
  const answers: string[] = [];
  for (const answerVal of answersArray.elements) {
    if (!isString(answerVal)) {
      throw new TypeError('All answers must be strings');
    }

    const answer = answerVal.value;
    if (answer.length === 0) {
      throw new RuntimeError('Answer cannot be empty');
    }
    if (answer.length > 55) {
      throw new RuntimeError('Answer cannot exceed 55 characters');
    }

    answers.push(answer);
  }

  // Validate answer count
  if (answers.length < 2) {
    throw new RuntimeError('Poll must have at least 2 answers');
  }
  if (answers.length > 10) {
    throw new RuntimeError('Poll cannot have more than 10 answers');
  }

  // Validate duration
  if (durationHours < 1 || durationHours > 336) {
    throw new RuntimeError('Duration must be between 1 and 336 hours (14 days)');
  }

  // Create poll data structure
  const properties = new Map<string, RuntimeValue>();
  properties.set('question', makeString(question));
  properties.set('answers', makeArray(answers.map(a => makeString(a))));
  properties.set('duration', makeNumber(durationHours));
  properties.set('allow_multiselect', makeBoolean(allowMultiselect));

  return makeObject(properties);
});

/**
 * send_poll(channel, poll)
 * Send a poll to a channel
 */
export const sendPoll = makeNativeFunction('send_poll', async (args: RuntimeValue[]) => {
  if (args.length !== 2) {
    throw new RuntimeError(`send_poll() expects 2 arguments (channel, poll), got ${args.length}`);
  }

  const channel = getRawValue(args[0]) as TextChannel | NewsChannel;
  if (!channel || !channel.send) {
    throw new RuntimeError('Invalid channel or channel does not support polls');
  }

  if (!isObject(args[1])) {
    throw new TypeError('Poll must be an object created by create_poll()');
  }

  const pollObj = args[1];

  // Extract poll properties
  const questionProp = pollObj.properties.get('question');
  const answersProp = pollObj.properties.get('answers');
  const durationProp = pollObj.properties.get('duration');
  const allowMultiselectProp = pollObj.properties.get('allow_multiselect');

  if (!questionProp || !isString(questionProp)) {
    throw new RuntimeError('Poll missing question');
  }
  if (!answersProp || !isArray(answersProp)) {
    throw new RuntimeError('Poll missing answers');
  }
  if (!durationProp || !isNumber(durationProp)) {
    throw new RuntimeError('Poll missing duration');
  }

  const question = questionProp.value;
  const answers = answersProp.elements.map(a => isString(a) ? a.value : '');
  const durationHours = durationProp.value;
  const allowMultiselect = allowMultiselectProp && isBoolean(allowMultiselectProp) ? allowMultiselectProp.value : false;

  try {
    // Create poll
    const message = await channel.send({
      poll: {
        question: { text: question },
        answers: answers.map(text => ({ text })),
        duration: durationHours,
        allowMultiselect,
        layoutType: PollLayoutType.Default,
      },
    });

    const properties = new Map<string, RuntimeValue>();
    properties.set('__raw', { __rawValue: message } as any);
    properties.set('id', makeString(message.id));
    properties.set('channel_id', makeString(message.channelId));

    return makeObject(properties);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    throw new RuntimeError(`Failed to send poll: ${errorMsg}`);
  }
});

/**
 * end_poll(message)
 * End a poll early
 */
export const endPoll = makeNativeFunction('end_poll', async (args: RuntimeValue[]) => {
  if (args.length !== 1) {
    throw new RuntimeError(`end_poll() expects 1 argument (message), got ${args.length}`);
  }

  const message = getRawValue(args[0]) as Message;
  if (!message || !message.poll) {
    throw new RuntimeError('Invalid message or message does not contain a poll');
  }

  try {
    await message.poll.end();
    return makeBoolean(true);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    throw new RuntimeError(`Failed to end poll: ${errorMsg}`);
  }
});

/**
 * fetch_poll_results(message)
 * Get current poll results
 */
export const fetchPollResults = makeNativeFunction('fetch_poll_results', async (args: RuntimeValue[]) => {
  if (args.length !== 1) {
    throw new RuntimeError(`fetch_poll_results() expects 1 argument (message), got ${args.length}`);
  }

  const message = getRawValue(args[0]) as Message;
  if (!message || !message.poll) {
    throw new RuntimeError('Invalid message or message does not contain a poll');
  }

  try {
    const poll = message.poll;

    const results = poll.answers.map(answer => {
      const properties = new Map<string, RuntimeValue>();
      properties.set('id', makeNumber(answer.id));
      properties.set('text', makeString(answer.text || ''));
      properties.set('vote_count', makeNumber(answer.voteCount));

      return makeObject(properties);
    });

    const properties = new Map<string, RuntimeValue>();
    properties.set('question', makeString(poll.question.text || ''));
    // Note: Discord.js v14 Poll doesn't have a direct totalVoters property
    // Calculate total from answers instead
    const totalVotes = poll.answers.reduce((sum, answer) => sum + answer.voteCount, 0);
    properties.set('total_votes', makeNumber(totalVotes));
    properties.set('results', makeArray(results));
    properties.set('ended', makeBoolean(!poll.expiresAt || poll.expiresAt < new Date()));

    if (poll.expiresAt) {
      properties.set('expires_at', makeString(poll.expiresAt.toISOString()));
    }

    return makeObject(properties);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    throw new RuntimeError(`Failed to fetch poll results: ${errorMsg}`);
  }
});

/**
 * fetch_poll_voters(message, answer_id)
 * Get users who voted for a specific answer
 */
export const fetchPollVoters = makeNativeFunction('fetch_poll_voters', async (args: RuntimeValue[]) => {
  if (args.length !== 2) {
    throw new RuntimeError(`fetch_poll_voters() expects 2 arguments (message, answer_id), got ${args.length}`);
  }

  const message = getRawValue(args[0]) as Message;
  if (!message || !message.poll) {
    throw new RuntimeError('Invalid message or message does not contain a poll');
  }

  if (!isNumber(args[1])) {
    throw new TypeError('Answer ID must be a number');
  }

  const answerId = args[1].value;

  try {
    const poll = message.poll;
    const answer = poll.answers.get(answerId);

    if (!answer) {
      throw new RuntimeError(`Answer with ID ${answerId} not found in poll`);
    }

    const voters = await answer.fetchVoters();

    const votersArray = voters.map(user => {
      const properties = new Map<string, RuntimeValue>();
      properties.set('__raw', { __rawValue: user } as any);
      properties.set('id', makeString(user.id));
      properties.set('username', makeString(user.username));
      properties.set('tag', makeString(user.tag));

      return makeObject(properties);
    });

    return makeArray(Array.from(votersArray));
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    throw new RuntimeError(`Failed to fetch poll voters: ${errorMsg}`);
  }
});

// Export all poll functions
export const pollBuiltins = {
  create_poll: createPoll,
  send_poll: sendPoll,
  end_poll: endPoll,
  fetch_poll_results: fetchPollResults,
  fetch_poll_voters: fetchPollVoters,
};
