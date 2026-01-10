/**
 * Discord command implementations for EzLang
 * Handles send, reply, and react commands
 */

import { RuntimeValue, isObject, isString, makeNull, makeBoolean } from '../runtime/values';
import { RuntimeError, TypeError } from '../utils/errors';
import { logger } from '../utils/logger';

/**
 * Send a message to a Discord channel
 *
 * Usage in EzLang:
 *   send channel "Hello, world!"
 *
 * @param channelValue - RuntimeValue representing a Discord channel
 * @param messageValue - RuntimeValue containing the message text
 * @returns RuntimeValue (null on success)
 * @throws RuntimeError if send fails
 * @throws TypeError if arguments are invalid
 */
export async function send(
  channelValue: RuntimeValue,
  messageValue: RuntimeValue
): Promise<RuntimeValue> {
  // Validate channel
  if (!isObject(channelValue)) {
    throw new TypeError('send() expects a channel object as first argument');
  }

  // Extract the raw Discord channel from the RuntimeValue
  const channelProp = channelValue.properties.get('__raw');
  if (!channelProp || !isObject(channelProp)) {
    throw new RuntimeError('Invalid channel object');
  }

  const channel = (channelProp as any).__rawValue;
  if (!channel || typeof channel.send !== 'function') {
    throw new RuntimeError('Channel does not support sending messages');
  }

  // Validate message
  if (!isString(messageValue)) {
    throw new TypeError('send() expects a string message');
  }

  try {
    logger.debug(`Sending message to channel: ${messageValue.value}`);
    await channel.send(messageValue.value);
    return makeNull();
  } catch (error: any) {
    throw new RuntimeError(`Failed to send message: ${error.message}`);
  }
}

/**
 * Reply to a Discord message
 *
 * Usage in EzLang:
 *   reply message "Thanks for your message!"
 *
 * @param messageValue - RuntimeValue representing a Discord message
 * @param textValue - RuntimeValue containing the reply text
 * @returns RuntimeValue (null on success)
 * @throws RuntimeError if reply fails
 * @throws TypeError if arguments are invalid
 */
export async function reply(
  messageValue: RuntimeValue,
  textValue: RuntimeValue
): Promise<RuntimeValue> {
  // Validate message
  if (!isObject(messageValue)) {
    throw new TypeError('reply() expects a message object as first argument');
  }

  // Extract the raw Discord message from the RuntimeValue
  const messageProp = messageValue.properties.get('__raw');
  if (!messageProp || !isObject(messageProp)) {
    throw new RuntimeError('Invalid message object');
  }

  const message = (messageProp as any).__rawValue;
  if (!message || typeof message.reply !== 'function') {
    throw new RuntimeError('Message does not support replies');
  }

  // Validate reply text
  if (!isString(textValue)) {
    throw new TypeError('reply() expects a string message');
  }

  try {
    logger.debug(`Replying to message: ${textValue.value}`);
    await message.reply(textValue.value);
    return makeNull();
  } catch (error: any) {
    throw new RuntimeError(`Failed to reply to message: ${error.message}`);
  }
}

/**
 * React to a Discord message with an emoji
 *
 * Usage in EzLang:
 *   react message "👍"
 *   react message "🎉"
 *
 * @param messageValue - RuntimeValue representing a Discord message
 * @param emojiValue - RuntimeValue containing the emoji
 * @returns RuntimeValue (boolean indicating success)
 * @throws RuntimeError if reaction fails
 * @throws TypeError if arguments are invalid
 */
export async function react(
  messageValue: RuntimeValue,
  emojiValue: RuntimeValue
): Promise<RuntimeValue> {
  // Validate message
  if (!isObject(messageValue)) {
    throw new TypeError('react() expects a message object as first argument');
  }

  // Extract the raw Discord message from the RuntimeValue
  const messageProp = messageValue.properties.get('__raw');
  if (!messageProp || !isObject(messageProp)) {
    throw new RuntimeError('Invalid message object');
  }

  const message = (messageProp as any).__rawValue;
  if (!message || typeof message.react !== 'function') {
    throw new RuntimeError('Message does not support reactions');
  }

  // Validate emoji
  if (!isString(emojiValue)) {
    throw new TypeError('react() expects a string emoji');
  }

  try {
    logger.debug(`Reacting to message with: ${emojiValue.value}`);
    await message.react(emojiValue.value);
    return makeBoolean(true);
  } catch (error: any) {
    // Some errors are expected (invalid emoji, permissions)
    logger.warn(`Failed to react to message: ${error.message}`);
    return makeBoolean(false);
  }
}
