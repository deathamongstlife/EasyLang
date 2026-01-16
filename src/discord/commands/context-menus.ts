/**
 * Context Menu Commands
 * Provides user and message context menu functionality
 */

import {
  ContextMenuCommandBuilder,
  ApplicationCommandType,
  UserContextMenuCommandInteraction,
  MessageContextMenuCommandInteraction,
} from 'discord.js';
import { RuntimeValue, makeNativeFunction, makeBoolean, makeRuntimeObject, makeString, isString } from '../../core/runtime/values';
import { RuntimeError, TypeError } from '../../utils/errors';

// Global storage for context menu handlers
const userContextHandlers = new Map<string, (interaction: UserContextMenuCommandInteraction) => Promise<void>>();
const messageContextHandlers = new Map<string, (interaction: MessageContextMenuCommandInteraction) => Promise<void>>();

/**
 * Register a user context menu command
 */
export const registerUserContextMenu = makeNativeFunction('register_user_context_menu', async (args: RuntimeValue[]) => {
  if (args.length !== 2) {
    throw new RuntimeError('register_user_context_menu() expects 2 arguments: name, handler_function');
  }

  if (!isString(args[0])) {
    throw new TypeError('Command name must be a string');
  }

  const commandName = (args[0] as any).value;
  const handlerFn = args[1];

  if (handlerFn.type !== 'function' && handlerFn.type !== 'native-function') {
    throw new TypeError('Handler must be a function');
  }

  // Create wrapper that calls the EzLang function
  const wrapper = async (interaction: UserContextMenuCommandInteraction) => {
    try {
      const targetUser = interaction.targetUser;

      // Convert interaction to RuntimeValue
      const interactionValue = makeRuntimeObject([
        ['command_name', makeString(interaction.commandName)],
        ['target_user_id', makeString(targetUser.id)],
        ['target_user_tag', makeString(targetUser.tag)],
        ['target_user_name', makeString(targetUser.username)],
        ['user_id', makeString(interaction.user.id)],
        ['guild_id', makeString(interaction.guildId || '')],
        ['channel_id', makeString(interaction.channelId)],
      ]);

      // Call the EzLang handler function
      if (handlerFn.type === 'native-function') {
        await (handlerFn as any).call([interactionValue]);
      }
    } catch (error) {
      console.error('User context menu handler error:', error);
      await interaction.reply({ content: 'An error occurred!', ephemeral: true }).catch(() => {});
    }
  };

  userContextHandlers.set(commandName, wrapper);
  return makeBoolean(true);
});

/**
 * Register a message context menu command
 */
export const registerMessageContextMenu = makeNativeFunction('register_message_context_menu', async (args: RuntimeValue[]) => {
  if (args.length !== 2) {
    throw new RuntimeError('register_message_context_menu() expects 2 arguments: name, handler_function');
  }

  if (!isString(args[0])) {
    throw new TypeError('Command name must be a string');
  }

  const commandName = (args[0] as any).value;
  const handlerFn = args[1];

  if (handlerFn.type !== 'function' && handlerFn.type !== 'native-function') {
    throw new TypeError('Handler must be a function');
  }

  // Create wrapper that calls the EzLang function
  const wrapper = async (interaction: MessageContextMenuCommandInteraction) => {
    try {
      const targetMessage = interaction.targetMessage;

      // Convert interaction to RuntimeValue
      const interactionValue = makeRuntimeObject([
        ['command_name', makeString(interaction.commandName)],
        ['target_message_id', makeString(targetMessage.id)],
        ['target_message_content', makeString(targetMessage.content)],
        ['target_message_author_id', makeString(targetMessage.author.id)],
        ['target_message_author_tag', makeString(targetMessage.author.tag)],
        ['user_id', makeString(interaction.user.id)],
        ['guild_id', makeString(interaction.guildId || '')],
        ['channel_id', makeString(interaction.channelId)],
      ]);

      // Call the EzLang handler function
      if (handlerFn.type === 'native-function') {
        await (handlerFn as any).call([interactionValue]);
      }
    } catch (error) {
      console.error('Message context menu handler error:', error);
      await interaction.reply({ content: 'An error occurred!', ephemeral: true }).catch(() => {});
    }
  };

  messageContextHandlers.set(commandName, wrapper);
  return makeBoolean(true);
});

/**
 * Create and register a user context menu command with Discord API
 */
export const createUserContextMenuCommand = makeNativeFunction('create_user_context_menu_command', async (args: RuntimeValue[]) => {
  if (args.length < 2) {
    throw new RuntimeError('create_user_context_menu_command() expects at least 2 arguments: name, guild_id');
  }

  if (!isString(args[0]) || !isString(args[1])) {
    throw new TypeError('Name and guild_id must be strings');
  }

  const name = (args[0] as any).value;

  const command = new ContextMenuCommandBuilder()
    .setName(name)
    .setType(ApplicationCommandType.User);

  return makeString(command.toJSON().toString());
});

/**
 * Create and register a message context menu command with Discord API
 */
export const createMessageContextMenuCommand = makeNativeFunction('create_message_context_menu_command', async (args: RuntimeValue[]) => {
  if (args.length < 2) {
    throw new RuntimeError('create_message_context_menu_command() expects at least 2 arguments: name, guild_id');
  }

  if (!isString(args[0]) || !isString(args[1])) {
    throw new TypeError('Name and guild_id must be strings');
  }

  const name = (args[0] as any).value;

  const command = new ContextMenuCommandBuilder()
    .setName(name)
    .setType(ApplicationCommandType.Message);

  return makeString(command.toJSON().toString());
});

/**
 * Handle user context menu interactions from Discord
 */
export function handleUserContextMenuInteraction(interaction: UserContextMenuCommandInteraction): void {
  const handler = userContextHandlers.get(interaction.commandName);
  if (handler) {
    handler(interaction).catch(error => {
      console.error(`User context menu handler error for ${interaction.commandName}:`, error);
    });
  }
}

/**
 * Handle message context menu interactions from Discord
 */
export function handleMessageContextMenuInteraction(interaction: MessageContextMenuCommandInteraction): void {
  const handler = messageContextHandlers.get(interaction.commandName);
  if (handler) {
    handler(interaction).catch(error => {
      console.error(`Message context menu handler error for ${interaction.commandName}:`, error);
    });
  }
}

/**
 * Get all registered context menu handlers
 */
export function getContextMenuHandlers() {
  return {
    user: userContextHandlers,
    message: messageContextHandlers,
  };
}

/**
 * Clear all context menu handlers
 */
export function clearContextMenuHandlers(): void {
  userContextHandlers.clear();
  messageContextHandlers.clear();
}
