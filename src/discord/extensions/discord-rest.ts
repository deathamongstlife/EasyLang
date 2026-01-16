/**
 * REST-Only Mode for EasyLang
 * Provides direct REST API access without WebSocket connection
 */

import {
  RuntimeValue,
  makeNativeFunction,
  makeObject,
  makeString,
  makeNumber,
  isString,
  isObject,
} from '../../core/runtime/values';
import { RuntimeError, TypeError } from '../../utils/errors';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';

/**
 * REST client storage
 */
let restClient: REST | null = null;
let applicationId: string | null = null;

/**
 * create_rest_client(token, [application_id])
 * Create a REST-only Discord client
 * Does not connect to gateway, only makes HTTP requests
 */
export const createRestClient = makeNativeFunction('create_rest_client', async (args: RuntimeValue[]) => {
  if (args.length < 1 || args.length > 2) {
    throw new RuntimeError(`create_rest_client() expects 1-2 arguments (token, [application_id]), got ${args.length}`);
  }

  if (!isString(args[0])) {
    throw new TypeError('Token must be a string');
  }

  const token = args[0].value;

  // Optional application ID for slash commands
  if (args.length === 2) {
    if (!isString(args[1])) {
      throw new TypeError('Application ID must be a string');
    }
    applicationId = args[1].value;
  }

  // Create REST client
  restClient = new REST({ version: '10' }).setToken(token);

  // If application_id not provided, fetch it
  if (!applicationId) {
    try {
      const application: any = await restClient.get(Routes.oauth2CurrentApplication());
      applicationId = application.id;
    } catch (error) {
      throw new RuntimeError('Failed to fetch application info. Provide application_id manually.');
    }
  }

  const result = new Map<string, RuntimeValue>();
  result.set('status', makeString('connected'));
  result.set('application_id', makeString(applicationId || ''));
  result.set('type', makeString('rest_only'));

  return makeObject(result);
});

/**
 * rest_get(endpoint)
 * Make a GET request to Discord API
 * endpoint: API endpoint (e.g., "/users/@me")
 */
export const restGet = makeNativeFunction('rest_get', async (args: RuntimeValue[]) => {
  if (args.length !== 1) {
    throw new RuntimeError(`rest_get() expects 1 argument (endpoint), got ${args.length}`);
  }

  if (!isString(args[0])) {
    throw new TypeError('Endpoint must be a string');
  }

  if (!restClient) {
    throw new RuntimeError('REST client not initialized. Call create_rest_client() first.');
  }

  const endpoint = args[0].value;

  try {
    const response = await restClient.get(endpoint as `/${string}`);
    const result = new Map<string, RuntimeValue>();
    result.set('status', makeNumber(200));
    result.set('data', makeString(JSON.stringify(response, null, 2)));

    return makeObject(result);
  } catch (error: any) {
    throw new RuntimeError(`REST GET failed: ${error.message}`);
  }
});

/**
 * rest_post(endpoint, data)
 * Make a POST request to Discord API
 * endpoint: API endpoint
 * data: object to send as JSON body
 */
export const restPost = makeNativeFunction('rest_post', async (args: RuntimeValue[]) => {
  if (args.length !== 2) {
    throw new RuntimeError(`rest_post() expects 2 arguments (endpoint, data), got ${args.length}`);
  }

  if (!isString(args[0])) {
    throw new TypeError('Endpoint must be a string');
  }

  if (!isObject(args[1])) {
    throw new TypeError('Data must be an object');
  }

  if (!restClient) {
    throw new RuntimeError('REST client not initialized. Call create_rest_client() first.');
  }

  const endpoint = args[0].value;
  const dataObj = args[1];

  // Convert RuntimeValue object to plain JS object
  const data: any = {};
  (dataObj as any).properties.forEach((value: RuntimeValue, key: string) => {
    if (value.type === 'string') {
      data[key] = (value as any).value;
    } else if (value.type === 'number') {
      data[key] = (value as any).value;
    } else if (value.type === 'boolean') {
      data[key] = (value as any).value;
    } else if (value.type === 'array') {
      data[key] = (value as any).elements.map((e: RuntimeValue) => {
        if (e.type === 'string') return (e as any).value;
        if (e.type === 'number') return (e as any).value;
        if (e.type === 'boolean') return (e as any).value;
        return null;
      });
    }
  });

  try {
    const response = await restClient.post(endpoint as `/${string}`, { body: data });
    const result = new Map<string, RuntimeValue>();
    result.set('status', makeNumber(200));
    result.set('data', makeString(JSON.stringify(response, null, 2)));

    return makeObject(result);
  } catch (error: any) {
    throw new RuntimeError(`REST POST failed: ${error.message}`);
  }
});

/**
 * rest_patch(endpoint, data)
 * Make a PATCH request to Discord API
 * endpoint: API endpoint
 * data: object to send as JSON body
 */
export const restPatch = makeNativeFunction('rest_patch', async (args: RuntimeValue[]) => {
  if (args.length !== 2) {
    throw new RuntimeError(`rest_patch() expects 2 arguments (endpoint, data), got ${args.length}`);
  }

  if (!isString(args[0])) {
    throw new TypeError('Endpoint must be a string');
  }

  if (!isObject(args[1])) {
    throw new TypeError('Data must be an object');
  }

  if (!restClient) {
    throw new RuntimeError('REST client not initialized. Call create_rest_client() first.');
  }

  const endpoint = args[0].value;
  const dataObj = args[1];

  // Convert RuntimeValue object to plain JS object
  const data: any = {};
  (dataObj as any).properties.forEach((value: RuntimeValue, key: string) => {
    if (value.type === 'string') {
      data[key] = (value as any).value;
    } else if (value.type === 'number') {
      data[key] = (value as any).value;
    } else if (value.type === 'boolean') {
      data[key] = (value as any).value;
    } else if (value.type === 'array') {
      data[key] = (value as any).elements.map((e: RuntimeValue) => {
        if (e.type === 'string') return (e as any).value;
        if (e.type === 'number') return (e as any).value;
        if (e.type === 'boolean') return (e as any).value;
        return null;
      });
    }
  });

  try {
    const response = await restClient.patch(endpoint as `/${string}`, { body: data });
    const result = new Map<string, RuntimeValue>();
    result.set('status', makeNumber(200));
    result.set('data', makeString(JSON.stringify(response, null, 2)));

    return makeObject(result);
  } catch (error: any) {
    throw new RuntimeError(`REST PATCH failed: ${error.message}`);
  }
});

/**
 * rest_delete(endpoint)
 * Make a DELETE request to Discord API
 * endpoint: API endpoint
 */
export const restDelete = makeNativeFunction('rest_delete', async (args: RuntimeValue[]) => {
  if (args.length !== 1) {
    throw new RuntimeError(`rest_delete() expects 1 argument (endpoint), got ${args.length}`);
  }

  if (!isString(args[0])) {
    throw new TypeError('Endpoint must be a string');
  }

  if (!restClient) {
    throw new RuntimeError('REST client not initialized. Call create_rest_client() first.');
  }

  const endpoint = args[0].value;

  try {
    const response = await restClient.delete(endpoint as `/${string}`);
    const result = new Map<string, RuntimeValue>();
    result.set('status', makeNumber(204));
    result.set('data', makeString(JSON.stringify(response || {}, null, 2)));

    return makeObject(result);
  } catch (error: any) {
    throw new RuntimeError(`REST DELETE failed: ${error.message}`);
  }
});

/**
 * rest_put(endpoint, data)
 * Make a PUT request to Discord API
 */
export const restPut = makeNativeFunction('rest_put', async (args: RuntimeValue[]) => {
  if (args.length !== 2) {
    throw new RuntimeError(`rest_put() expects 2 arguments (endpoint, data), got ${args.length}`);
  }

  if (!isString(args[0])) {
    throw new TypeError('Endpoint must be a string');
  }

  if (!isObject(args[1])) {
    throw new TypeError('Data must be an object');
  }

  if (!restClient) {
    throw new RuntimeError('REST client not initialized. Call create_rest_client() first.');
  }

  const endpoint = args[0].value;
  const dataObj = args[1];

  // Convert RuntimeValue object to plain JS object
  const data: any = {};
  (dataObj as any).properties.forEach((value: RuntimeValue, key: string) => {
    if (value.type === 'string') {
      data[key] = (value as any).value;
    } else if (value.type === 'number') {
      data[key] = (value as any).value;
    } else if (value.type === 'boolean') {
      data[key] = (value as any).value;
    }
  });

  try {
    const response = await restClient.put(endpoint as `/${string}`, { body: data });
    const result = new Map<string, RuntimeValue>();
    result.set('status', makeNumber(200));
    result.set('data', makeString(JSON.stringify(response, null, 2)));

    return makeObject(result);
  } catch (error: any) {
    throw new RuntimeError(`REST PUT failed: ${error.message}`);
  }
});

/**
 * get_rest_application_id()
 * Get the application ID from REST client
 */
export const getRestApplicationId = makeNativeFunction('get_rest_application_id', async (args: RuntimeValue[]) => {
  if (args.length !== 0) {
    throw new RuntimeError(`get_rest_application_id() expects 0 arguments, got ${args.length}`);
  }

  if (!restClient || !applicationId) {
    throw new RuntimeError('REST client not initialized or application ID not available');
  }

  return makeString(applicationId);
});

/**
 * rest_send_message(channel_id, content)
 * Send a message via REST API
 */
export const restSendMessage = makeNativeFunction('rest_send_message', async (args: RuntimeValue[]) => {
  if (args.length !== 2) {
    throw new RuntimeError(`rest_send_message() expects 2 arguments (channel_id, content), got ${args.length}`);
  }

  if (!isString(args[0]) || !isString(args[1])) {
    throw new TypeError('Channel ID and content must be strings');
  }

  if (!restClient) {
    throw new RuntimeError('REST client not initialized. Call create_rest_client() first.');
  }

  const channelId = args[0].value;
  const content = args[1].value;

  try {
    const response: any = await restClient.post(Routes.channelMessages(channelId), {
      body: { content },
    });

    const result = new Map<string, RuntimeValue>();
    result.set('message_id', makeString(response.id));
    result.set('channel_id', makeString(response.channel_id));
    result.set('content', makeString(response.content));

    return makeObject(result);
  } catch (error: any) {
    throw new RuntimeError(`Failed to send message: ${error.message}`);
  }
});

/**
 * rest_create_guild_command(guild_id, command_data)
 * Create a slash command for a guild via REST
 */
export const restCreateGuildCommand = makeNativeFunction('rest_create_guild_command', async (args: RuntimeValue[]) => {
  if (args.length !== 2) {
    throw new RuntimeError(`rest_create_guild_command() expects 2 arguments (guild_id, command_data), got ${args.length}`);
  }

  if (!isString(args[0]) || !isObject(args[1])) {
    throw new TypeError('Guild ID must be a string and command_data must be an object');
  }

  if (!restClient || !applicationId) {
    throw new RuntimeError('REST client not initialized or application ID not available');
  }

  const guildId = args[0].value;
  const commandDataObj = args[1];

  // Convert to plain object
  const commandData: any = {};
  (commandDataObj as any).properties.forEach((value: RuntimeValue, key: string) => {
    if (value.type === 'string') {
      commandData[key] = (value as any).value;
    } else if (value.type === 'number') {
      commandData[key] = (value as any).value;
    } else if (value.type === 'boolean') {
      commandData[key] = (value as any).value;
    }
  });

  try {
    const response: any = await restClient.post(
      Routes.applicationGuildCommands(applicationId, guildId),
      { body: commandData }
    );

    const result = new Map<string, RuntimeValue>();
    result.set('command_id', makeString(response.id));
    result.set('name', makeString(response.name));
    result.set('description', makeString(response.description));

    return makeObject(result);
  } catch (error: any) {
    throw new RuntimeError(`Failed to create guild command: ${error.message}`);
  }
});

// Export all REST functions
export const restBuiltins = {
  create_rest_client: createRestClient,
  rest_get: restGet,
  rest_post: restPost,
  rest_patch: restPatch,
  rest_delete: restDelete,
  rest_put: restPut,
  get_rest_application_id: getRestApplicationId,
  rest_send_message: restSendMessage,
  rest_create_guild_command: restCreateGuildCommand,
};

// Export for testing
export { restClient, applicationId };
