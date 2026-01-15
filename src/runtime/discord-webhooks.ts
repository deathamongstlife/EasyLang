/**
 * Discord Webhook Functions for EzLang
 * Provides complete webhook support for Discord integration
 */

import {
  RuntimeValue,
  makeString,
  makeBoolean,
  makeObject,
  makeNativeFunction,
  makeArray,
  isString,
  isObject,
  isArray,
  isNumber,
} from './values';
import { RuntimeError, TypeError } from '../utils/errors';
import {
  WebhookClient,
  WebhookMessageCreateOptions,
  TextChannel,
  NewsChannel,
  VoiceChannel,
  ForumChannel,
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
 * Convert EzLang value to JavaScript
 */
function convertToJS(value: RuntimeValue): any {
  if (isString(value)) return value.value;
  if (isNumber(value)) return value.value;
  if (isObject(value)) {
    const obj: any = {};
    value.properties.forEach((v, k) => {
      if (k !== '__raw') {
        obj[k] = convertToJS(v);
      }
    });
    return obj;
  }
  if (isArray(value)) {
    return value.elements.map(convertToJS);
  }
  return null;
}

/**
 * create_webhook(channel, name, avatar_url?)
 * Create a webhook in a channel
 */
export const createWebhook = makeNativeFunction('create_webhook', async (args: RuntimeValue[]) => {
  if (args.length < 2) {
    throw new RuntimeError(`create_webhook() expects at least 2 arguments (channel, name), got ${args.length}`);
  }

  const channel = getRawValue(args[0]) as TextChannel | NewsChannel | VoiceChannel | ForumChannel;
  if (!channel || !('createWebhook' in channel)) {
    throw new RuntimeError('Invalid channel or channel does not support webhooks');
  }

  if (!isString(args[1])) {
    throw new TypeError('Webhook name must be a string');
  }

  const name = args[1].value;
  const avatarUrl = args.length >= 3 && isString(args[2]) ? args[2].value : undefined;

  try {
    const webhook = await channel.createWebhook({
      name,
      avatar: avatarUrl,
    });

    const properties = new Map<string, RuntimeValue>();
    properties.set('__raw', { __rawValue: webhook } as any);
    properties.set('id', makeString(webhook.id));
    properties.set('url', makeString(webhook.url));
    properties.set('token', makeString(webhook.token || ''));
    properties.set('name', makeString(webhook.name || ''));

    return makeObject(properties);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    throw new RuntimeError(`Failed to create webhook: ${errorMsg}`);
  }
});

/**
 * webhook_send(webhook_url, content, options?)
 * Send a message via webhook
 *
 * Options:
 * - username: Override webhook username
 * - avatar_url: Override webhook avatar
 * - embeds: Array of embeds
 * - files: Array of file paths or attachments
 * - allowed_mentions: Mention configuration
 * - thread_id: Send to specific thread
 */
export const webhookSend = makeNativeFunction('webhook_send', async (args: RuntimeValue[]) => {
  if (args.length < 2) {
    throw new RuntimeError(`webhook_send() expects at least 2 arguments (webhook_url, content), got ${args.length}`);
  }

  if (!isString(args[0]) || !isString(args[1])) {
    throw new TypeError('webhook_url and content must be strings');
  }

  const webhookUrl = args[0].value;
  const content = args[1].value;

  try {
    const webhook = new WebhookClient({ url: webhookUrl });
    const options: WebhookMessageCreateOptions = { content };

    // Parse options if provided
    if (args.length >= 3 && isObject(args[2])) {
      const opts = args[2];

      const username = opts.properties.get('username');
      if (username && isString(username)) {
        options.username = username.value;
      }

      const avatarUrl = opts.properties.get('avatar_url');
      if (avatarUrl && isString(avatarUrl)) {
        options.avatarURL = avatarUrl.value;
      }

      const embeds = opts.properties.get('embeds');
      if (embeds && isArray(embeds)) {
        options.embeds = embeds.elements.map(e => getRawValue(e)).filter(e => e);
      }

      const files = opts.properties.get('files');
      if (files && isArray(files)) {
        options.files = files.elements
          .map(f => isString(f) ? f.value : null)
          .filter(f => f !== null) as string[];
      }

      const threadId = opts.properties.get('thread_id');
      if (threadId && isString(threadId)) {
        options.threadId = threadId.value;
      }

      const allowedMentions = opts.properties.get('allowed_mentions');
      if (allowedMentions && isObject(allowedMentions)) {
        options.allowedMentions = convertToJS(allowedMentions);
      }
    }

    const message = await webhook.send(options);

    const properties = new Map<string, RuntimeValue>();
    properties.set('__raw', { __rawValue: message } as any);
    properties.set('id', makeString(message.id));

    return makeObject(properties);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    throw new RuntimeError(`Failed to send webhook message: ${errorMsg}`);
  }
});

/**
 * webhook_edit(webhook_url, options)
 * Edit webhook properties
 *
 * Options:
 * - name: New webhook name
 * - avatar: New avatar URL
 */
export const webhookEdit = makeNativeFunction('webhook_edit', async (args: RuntimeValue[]) => {
  if (args.length < 2) {
    throw new RuntimeError(`webhook_edit() expects 2 arguments (webhook_url, options), got ${args.length}`);
  }

  if (!isString(args[0])) {
    throw new TypeError('webhook_url must be a string');
  }

  if (!isObject(args[1])) {
    throw new TypeError('options must be an object');
  }

  const webhookUrl = args[0].value;
  const opts = args[1];

  try {
    const webhook = new WebhookClient({ url: webhookUrl });
    const editOptions: any = {};

    const name = opts.properties.get('name');
    if (name && isString(name)) {
      editOptions.name = name.value;
    }

    const avatar = opts.properties.get('avatar');
    if (avatar && isString(avatar)) {
      editOptions.avatar = avatar.value;
    }

    const channel = opts.properties.get('channel');
    if (channel) {
      const channelObj = getRawValue(channel);
      if (channelObj) {
        editOptions.channel = channelObj.id;
      }
    }

    await webhook.edit(editOptions);
    return makeBoolean(true);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    throw new RuntimeError(`Failed to edit webhook: ${errorMsg}`);
  }
});

/**
 * webhook_delete(webhook_url)
 * Delete a webhook
 */
export const webhookDelete = makeNativeFunction('webhook_delete', async (args: RuntimeValue[]) => {
  if (args.length !== 1) {
    throw new RuntimeError(`webhook_delete() expects 1 argument (webhook_url), got ${args.length}`);
  }

  if (!isString(args[0])) {
    throw new TypeError('webhook_url must be a string');
  }

  const webhookUrl = args[0].value;

  try {
    const webhook = new WebhookClient({ url: webhookUrl });
    await webhook.delete();
    return makeBoolean(true);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    throw new RuntimeError(`Failed to delete webhook: ${errorMsg}`);
  }
});

/**
 * fetch_webhooks(channel)
 * Get all webhooks in a channel
 */
export const fetchWebhooks = makeNativeFunction('fetch_webhooks', async (args: RuntimeValue[]) => {
  if (args.length !== 1) {
    throw new RuntimeError(`fetch_webhooks() expects 1 argument (channel), got ${args.length}`);
  }

  const channel = getRawValue(args[0]) as TextChannel | NewsChannel | VoiceChannel | ForumChannel;
  if (!channel || !('fetchWebhooks' in channel)) {
    throw new RuntimeError('Invalid channel or channel does not support webhooks');
  }

  try {
    const webhooks = await channel.fetchWebhooks();
    const webhookArray = webhooks.map(webhook => {
      const properties = new Map<string, RuntimeValue>();
      properties.set('__raw', { __rawValue: webhook } as any);
      properties.set('id', makeString(webhook.id));
      properties.set('url', makeString(webhook.url));
      properties.set('name', makeString(webhook.name || ''));
      properties.set('token', makeString(webhook.token || ''));
      return makeObject(properties);
    });

    return makeArray(Array.from(webhookArray));
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    throw new RuntimeError(`Failed to fetch webhooks: ${errorMsg}`);
  }
});

/**
 * fetch_webhook(webhook_url)
 * Get specific webhook by URL
 */
export const fetchWebhook = makeNativeFunction('fetch_webhook', async (args: RuntimeValue[]) => {
  if (args.length !== 1) {
    throw new RuntimeError(`fetch_webhook() expects 1 argument (webhook_url), got ${args.length}`);
  }

  if (!isString(args[0])) {
    throw new TypeError('webhook_url must be a string');
  }

  const webhookUrl = args[0].value;

  try {
    const webhook = new WebhookClient({ url: webhookUrl });
    // WebhookClient in v14 doesn't have fetch() method
    // The client itself contains the webhook info we need

    const properties = new Map<string, RuntimeValue>();
    properties.set('__raw', { __rawValue: webhook } as any);
    properties.set('id', makeString(webhook.id));
    properties.set('url', makeString(webhook.url));
    // Note: name and token are not available on WebhookClient without fetching
    // Return what we have from the URL

    return makeObject(properties);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    throw new RuntimeError(`Failed to create webhook client: ${errorMsg}`);
  }
});

// Export all webhook functions
export const webhookBuiltins = {
  create_webhook: createWebhook,
  webhook_send: webhookSend,
  webhook_edit: webhookEdit,
  webhook_delete: webhookDelete,
  fetch_webhooks: fetchWebhooks,
  fetch_webhook: fetchWebhook,
};
