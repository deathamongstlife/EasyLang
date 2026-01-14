/**
 * Discord-specific built-in functions for EzLang
 * Provides comprehensive Discord.js v14 API access
 */

import {
  RuntimeValue,
  makeString,
  makeBoolean,
  makeObject,
  makeNativeFunction,
  isString,
  isNumber,
  isBoolean,
  isObject,
  isArray,
} from './values';
import { RuntimeError, TypeError } from '../utils/errors';
import {
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  UserSelectMenuBuilder,
  RoleSelectMenuBuilder,
  ChannelSelectMenuBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  REST,
  Routes,
  SlashCommandBuilder,
  Message,
  Interaction,
  TextChannel,
  Client,
} from 'discord.js';

/**
 * Get the Discord client from global context
 */
function getDiscordClient(): any {
  // This will be set by the DiscordManager
  return (global as any).__discordClient;
}

/**
 * Convert EzLang object to plain JavaScript object
 */
function convertObjectToJS(obj: RuntimeValue): any {
  if (isObject(obj)) {
    const result: any = {};
    obj.properties.forEach((value, key) => {
      if (key !== '__raw') {
        result[key] = convertObjectToJS(value);
      }
    });
    return result;
  } else if (isArray(obj)) {
    return obj.elements.map(convertObjectToJS);
  } else if (isString(obj)) {
    return obj.value;
  } else if (isNumber(obj)) {
    return obj.value;
  } else if (isBoolean(obj)) {
    return obj.value;
  }
  return null;
}

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

// ==================== SLASH COMMAND FUNCTIONS ====================

/**
 * register_slash_command(client, guildId, command_data)
 * Register a slash command with Discord
 */
export const registerSlashCommand = makeNativeFunction('register_slash_command', async (args: RuntimeValue[]) => {
  if (args.length !== 3) {
    throw new RuntimeError(`register_slash_command() expects 3 arguments, got ${args.length}`);
  }

  const clientArg = args[0];
  const guildIdArg = args[1];
  const commandDataArg = args[2];

  const client = getRawValue(clientArg) as Client;
  if (!client) {
    throw new RuntimeError('Invalid client object');
  }

  if (!isString(guildIdArg)) {
    throw new TypeError(`register_slash_command() expects guildId as string, got ${guildIdArg.type}`);
  }

  if (!isObject(commandDataArg)) {
    throw new TypeError(`register_slash_command() expects command_data as object, got ${commandDataArg.type}`);
  }

  const guildId = guildIdArg.value;
  const data = commandDataArg;

  // Extract command properties
  const nameValue = data.properties.get('name');
  const descValue = data.properties.get('description');

  if (!nameValue || !isString(nameValue)) {
    throw new RuntimeError('Command name is required and must be a string');
  }
  if (!descValue || !isString(descValue)) {
    throw new RuntimeError('Command description is required and must be a string');
  }

  const commandBuilder = new SlashCommandBuilder()
    .setName(nameValue.value)
    .setDescription(descValue.value);

  // Add options if provided
  const optionsValue = data.properties.get('options');
  if (optionsValue && isArray(optionsValue)) {
    for (const opt of optionsValue.elements) {
      if (!isObject(opt)) continue;

      const optType = opt.properties.get('type');
      const optName = opt.properties.get('name');
      const optDesc = opt.properties.get('description');
      const optRequired = opt.properties.get('required');

      if (!optType || !isString(optType)) continue;
      if (!optName || !isString(optName)) continue;
      if (!optDesc || !isString(optDesc)) continue;

      const required = optRequired && isBoolean(optRequired) ? optRequired.value : false;

      const typeName = optType.value.toLowerCase();

      if (typeName === 'string') {
        commandBuilder.addStringOption(option =>
          option
            .setName(optName.value)
            .setDescription(optDesc.value)
            .setRequired(required)
        );
      } else if (typeName === 'integer') {
        commandBuilder.addIntegerOption(option =>
          option
            .setName(optName.value)
            .setDescription(optDesc.value)
            .setRequired(required)
        );
      } else if (typeName === 'boolean') {
        commandBuilder.addBooleanOption(option =>
          option
            .setName(optName.value)
            .setDescription(optDesc.value)
            .setRequired(required)
        );
      } else if (typeName === 'user') {
        commandBuilder.addUserOption(option =>
          option
            .setName(optName.value)
            .setDescription(optDesc.value)
            .setRequired(required)
        );
      } else if (typeName === 'channel') {
        commandBuilder.addChannelOption(option =>
          option
            .setName(optName.value)
            .setDescription(optDesc.value)
            .setRequired(required)
        );
      } else if (typeName === 'role') {
        commandBuilder.addRoleOption(option =>
          option
            .setName(optName.value)
            .setDescription(optDesc.value)
            .setRequired(required)
        );
      }
    }
  }

  // Register the command
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN || '');

  try {
    await rest.put(
      Routes.applicationGuildCommands(client.user?.id || '', guildId),
      { body: [commandBuilder.toJSON()] }
    );
    return makeBoolean(true);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    throw new RuntimeError(`Failed to register slash command: ${errorMsg}`);
  }
});

// ==================== COMPONENT BUILDER FUNCTIONS ====================

/**
 * create_embed(title, description, color)
 * Create a Discord embed
 */
export const createEmbed = makeNativeFunction('create_embed', async (args: RuntimeValue[]) => {
  const embed = new EmbedBuilder();

  if (args.length >= 1 && isString(args[0])) {
    embed.setTitle(args[0].value);
  }
  if (args.length >= 2 && isString(args[1])) {
    embed.setDescription(args[1].value);
  }
  if (args.length >= 3 && isNumber(args[2])) {
    embed.setColor(args[2].value);
  }

  const properties = new Map<string, RuntimeValue>();
  properties.set('__raw', { __rawValue: embed } as any);
  properties.set('type', makeString('embed'));

  return makeObject(properties);
});

/**
 * embed_add_field(embed, name, value, inline)
 * Add a field to an embed
 */
export const embedAddField = makeNativeFunction('embed_add_field', async (args: RuntimeValue[]) => {
  if (args.length < 3) {
    throw new RuntimeError(`embed_add_field() expects at least 3 arguments, got ${args.length}`);
  }

  const embed = getRawValue(args[0]) as EmbedBuilder;
  if (!embed) {
    throw new RuntimeError('Invalid embed object');
  }

  if (!isString(args[1]) || !isString(args[2])) {
    throw new TypeError('Field name and value must be strings');
  }

  const inline = args.length >= 4 && isBoolean(args[3]) ? args[3].value : false;

  embed.addFields({ name: args[1].value, value: args[2].value, inline });

  return args[0]; // Return the embed for chaining
});

/**
 * create_button(label, style, customId)
 * Create a Discord button
 * Styles: "primary" | "secondary" | "success" | "danger" | "link"
 */
export const createButton = makeNativeFunction('create_button', async (args: RuntimeValue[]) => {
  if (args.length < 3) {
    throw new RuntimeError(`create_button() expects 3 arguments, got ${args.length}`);
  }

  if (!isString(args[0]) || !isString(args[1]) || !isString(args[2])) {
    throw new TypeError('All button arguments must be strings');
  }

  const label = args[0].value;
  const style = args[1].value.toLowerCase();
  const customId = args[2].value;

  const button = new ButtonBuilder()
    .setLabel(label)
    .setCustomId(customId);

  // Map string styles to ButtonStyle enum
  switch (style) {
    case 'primary':
      button.setStyle(ButtonStyle.Primary);
      break;
    case 'secondary':
      button.setStyle(ButtonStyle.Secondary);
      break;
    case 'success':
      button.setStyle(ButtonStyle.Success);
      break;
    case 'danger':
      button.setStyle(ButtonStyle.Danger);
      break;
    default:
      button.setStyle(ButtonStyle.Primary);
  }

  const properties = new Map<string, RuntimeValue>();
  properties.set('__raw', { __rawValue: button } as any);
  properties.set('type', makeString('button'));

  return makeObject(properties);
});

/**
 * create_link_button(label, url)
 * Create a link button
 */
export const createLinkButton = makeNativeFunction('create_link_button', async (args: RuntimeValue[]) => {
  if (args.length !== 2) {
    throw new RuntimeError(`create_link_button() expects 2 arguments, got ${args.length}`);
  }

  if (!isString(args[0]) || !isString(args[1])) {
    throw new TypeError('Label and URL must be strings');
  }

  const button = new ButtonBuilder()
    .setLabel(args[0].value)
    .setURL(args[1].value)
    .setStyle(ButtonStyle.Link);

  const properties = new Map<string, RuntimeValue>();
  properties.set('__raw', { __rawValue: button } as any);
  properties.set('type', makeString('button'));

  return makeObject(properties);
});

/**
 * create_string_select(customId, placeholder, options)
 * Create a string select menu
 * options = [{label: "...", value: "...", description: "..."}]
 */
export const createStringSelect = makeNativeFunction('create_string_select', async (args: RuntimeValue[]) => {
  if (args.length < 3) {
    throw new RuntimeError(`create_string_select() expects 3 arguments, got ${args.length}`);
  }

  if (!isString(args[0]) || !isString(args[1]) || !isArray(args[2])) {
    throw new TypeError('Invalid arguments for create_string_select');
  }

  const customId = args[0].value;
  const placeholder = args[1].value;
  const optionsArray = args[2];

  const menu = new StringSelectMenuBuilder()
    .setCustomId(customId)
    .setPlaceholder(placeholder);

  const options = [];
  for (const opt of optionsArray.elements) {
    if (!isObject(opt)) continue;

    const label = opt.properties.get('label');
    const value = opt.properties.get('value');
    const description = opt.properties.get('description');

    if (!label || !isString(label) || !value || !isString(value)) continue;

    const option: any = {
      label: label.value,
      value: value.value,
    };

    if (description && isString(description)) {
      option.description = description.value;
    }

    options.push(option);
  }

  menu.addOptions(options);

  const properties = new Map<string, RuntimeValue>();
  properties.set('__raw', { __rawValue: menu } as any);
  properties.set('type', makeString('select_menu'));

  return makeObject(properties);
});

/**
 * create_user_select(customId, placeholder)
 * Create a user select menu
 */
export const createUserSelect = makeNativeFunction('create_user_select', async (args: RuntimeValue[]) => {
  if (args.length < 2) {
    throw new RuntimeError(`create_user_select() expects 2 arguments, got ${args.length}`);
  }

  if (!isString(args[0]) || !isString(args[1])) {
    throw new TypeError('customId and placeholder must be strings');
  }

  const menu = new UserSelectMenuBuilder()
    .setCustomId(args[0].value)
    .setPlaceholder(args[1].value);

  const properties = new Map<string, RuntimeValue>();
  properties.set('__raw', { __rawValue: menu } as any);
  properties.set('type', makeString('user_select'));

  return makeObject(properties);
});

/**
 * create_role_select(customId, placeholder)
 * Create a role select menu
 */
export const createRoleSelect = makeNativeFunction('create_role_select', async (args: RuntimeValue[]) => {
  if (args.length < 2) {
    throw new RuntimeError(`create_role_select() expects 2 arguments, got ${args.length}`);
  }

  if (!isString(args[0]) || !isString(args[1])) {
    throw new TypeError('customId and placeholder must be strings');
  }

  const menu = new RoleSelectMenuBuilder()
    .setCustomId(args[0].value)
    .setPlaceholder(args[1].value);

  const properties = new Map<string, RuntimeValue>();
  properties.set('__raw', { __rawValue: menu } as any);
  properties.set('type', makeString('role_select'));

  return makeObject(properties);
});

/**
 * create_channel_select(customId, placeholder)
 * Create a channel select menu
 */
export const createChannelSelect = makeNativeFunction('create_channel_select', async (args: RuntimeValue[]) => {
  if (args.length < 2) {
    throw new RuntimeError(`create_channel_select() expects 2 arguments, got ${args.length}`);
  }

  if (!isString(args[0]) || !isString(args[1])) {
    throw new TypeError('customId and placeholder must be strings');
  }

  const menu = new ChannelSelectMenuBuilder()
    .setCustomId(args[0].value)
    .setPlaceholder(args[1].value);

  const properties = new Map<string, RuntimeValue>();
  properties.set('__raw', { __rawValue: menu } as any);
  properties.set('type', makeString('channel_select'));

  return makeObject(properties);
});

/**
 * create_modal(customId, title)
 * Create a modal dialog
 */
export const createModal = makeNativeFunction('create_modal', async (args: RuntimeValue[]) => {
  if (args.length < 2) {
    throw new RuntimeError(`create_modal() expects 2 arguments, got ${args.length}`);
  }

  if (!isString(args[0]) || !isString(args[1])) {
    throw new TypeError('customId and title must be strings');
  }

  const modal = new ModalBuilder()
    .setCustomId(args[0].value)
    .setTitle(args[1].value);

  const properties = new Map<string, RuntimeValue>();
  properties.set('__raw', { __rawValue: modal } as any);
  properties.set('type', makeString('modal'));

  return makeObject(properties);
});

/**
 * create_text_input(customId, label, style, required)
 * Create a text input for modals
 * style: "short" | "paragraph"
 */
export const createTextInput = makeNativeFunction('create_text_input', async (args: RuntimeValue[]) => {
  if (args.length < 3) {
    throw new RuntimeError(`create_text_input() expects at least 3 arguments, got ${args.length}`);
  }

  if (!isString(args[0]) || !isString(args[1]) || !isString(args[2])) {
    throw new TypeError('customId, label, and style must be strings');
  }

  const customId = args[0].value;
  const label = args[1].value;
  const style = args[2].value.toLowerCase();
  const required = args.length >= 4 && isBoolean(args[3]) ? args[3].value : true;

  const input = new TextInputBuilder()
    .setCustomId(customId)
    .setLabel(label)
    .setStyle(style === 'paragraph' ? TextInputStyle.Paragraph : TextInputStyle.Short)
    .setRequired(required);

  const properties = new Map<string, RuntimeValue>();
  properties.set('__raw', { __rawValue: input } as any);
  properties.set('type', makeString('text_input'));

  return makeObject(properties);
});

/**
 * create_action_row(...components)
 * Create an action row to hold components
 */
export const createActionRow = makeNativeFunction('create_action_row', async (args: RuntimeValue[]) => {
  const components = [];

  for (const arg of args) {
    const rawComponent = getRawValue(arg);
    if (rawComponent) {
      components.push(rawComponent);
    }
  }

  const row = new ActionRowBuilder().addComponents(...components as any);

  const properties = new Map<string, RuntimeValue>();
  properties.set('__raw', { __rawValue: row } as any);
  properties.set('type', makeString('action_row'));

  return makeObject(properties);
});

// ==================== INTERACTION RESPONSE FUNCTIONS ====================

/**
 * interaction_reply(interaction, content, options)
 * Reply to an interaction
 * options = {ephemeral: bool, embeds: array, components: array}
 */
export const interactionReply = makeNativeFunction('interaction_reply', async (args: RuntimeValue[]) => {
  if (args.length < 2) {
    throw new RuntimeError(`interaction_reply() expects at least 2 arguments, got ${args.length}`);
  }

  const interaction = getRawValue(args[0]) as Interaction;
  if (!interaction || !interaction.isRepliable()) {
    throw new RuntimeError('Invalid or non-repliable interaction');
  }

  if (!isString(args[1])) {
    throw new TypeError('Content must be a string');
  }

  const content = args[1].value;
  const replyOptions: any = { content };

  // Parse options if provided
  if (args.length >= 3 && isObject(args[2])) {
    const options = args[2];

    const ephemeral = options.properties.get('ephemeral');
    if (ephemeral && isBoolean(ephemeral)) {
      replyOptions.ephemeral = ephemeral.value;
    }

    const embeds = options.properties.get('embeds');
    if (embeds && isArray(embeds)) {
      replyOptions.embeds = embeds.elements.map(e => getRawValue(e)).filter(e => e);
    }

    const components = options.properties.get('components');
    if (components && isArray(components)) {
      replyOptions.components = components.elements.map(c => getRawValue(c)).filter(c => c);
    }
  }

  await interaction.reply(replyOptions);
  return makeBoolean(true);
});

/**
 * interaction_defer(interaction, ephemeral)
 * Defer an interaction response
 */
export const interactionDefer = makeNativeFunction('interaction_defer', async (args: RuntimeValue[]) => {
  if (args.length < 1) {
    throw new RuntimeError(`interaction_defer() expects at least 1 argument, got ${args.length}`);
  }

  const interaction = getRawValue(args[0]) as Interaction;
  if (!interaction || !interaction.isRepliable()) {
    throw new RuntimeError('Invalid or non-repliable interaction');
  }

  const ephemeral = args.length >= 2 && isBoolean(args[1]) ? args[1].value : false;

  await interaction.deferReply({ ephemeral });
  return makeBoolean(true);
});

/**
 * interaction_update(interaction, content, options)
 * Update an interaction (for components)
 */
export const interactionUpdate = makeNativeFunction('interaction_update', async (args: RuntimeValue[]) => {
  if (args.length < 2) {
    throw new RuntimeError(`interaction_update() expects at least 2 arguments, got ${args.length}`);
  }

  const interaction = getRawValue(args[0]);
  if (!interaction || !interaction.isMessageComponent()) {
    throw new RuntimeError('Invalid or non-component interaction');
  }

  if (!isString(args[1])) {
    throw new TypeError('Content must be a string');
  }

  const content = args[1].value;
  const updateOptions: any = { content };

  // Parse options if provided
  if (args.length >= 3 && isObject(args[2])) {
    const options = args[2];

    const embeds = options.properties.get('embeds');
    if (embeds && isArray(embeds)) {
      updateOptions.embeds = embeds.elements.map(e => getRawValue(e)).filter(e => e);
    }

    const components = options.properties.get('components');
    if (components && isArray(components)) {
      updateOptions.components = components.elements.map(c => getRawValue(c)).filter(c => c);
    }
  }

  await interaction.update(updateOptions);
  return makeBoolean(true);
});

// ==================== ADVANCED MESSAGING FUNCTIONS ====================

/**
 * send_message(channel, content, options)
 * Send a message to a channel
 * options = {embeds: array, components: array, files: array}
 */
export const sendMessage = makeNativeFunction('send_message', async (args: RuntimeValue[]) => {
  if (args.length < 2) {
    throw new RuntimeError(`send_message() expects at least 2 arguments, got ${args.length}`);
  }

  const channel = getRawValue(args[0]);
  if (!channel || !('send' in channel)) {
    throw new RuntimeError('Invalid channel');
  }

  if (!isString(args[1])) {
    throw new TypeError('Content must be a string');
  }

  const content = args[1].value;
  const messageOptions: any = { content };

  // Parse options if provided
  if (args.length >= 3 && isObject(args[2])) {
    const options = args[2];

    const embeds = options.properties.get('embeds');
    if (embeds && isArray(embeds)) {
      messageOptions.embeds = embeds.elements.map(e => getRawValue(e)).filter(e => e);
    }

    const components = options.properties.get('components');
    if (components && isArray(components)) {
      messageOptions.components = components.elements.map(c => getRawValue(c)).filter(c => c);
    }

    const files = options.properties.get('files');
    if (files && isArray(files)) {
      messageOptions.files = files.elements
        .map(f => {
          if (isString(f)) return f.value;
          return null;
        })
        .filter(f => f);
    }
  }

  const message = await channel.send(messageOptions);

  // Return message as RuntimeValue
  const properties = new Map<string, RuntimeValue>();
  properties.set('__raw', { __rawValue: message } as any);
  properties.set('id', makeString(message.id));

  return makeObject(properties);
});

/**
 * edit_message(message, content, options)
 * Edit a message
 */
export const editMessage = makeNativeFunction('edit_message', async (args: RuntimeValue[]) => {
  if (args.length < 2) {
    throw new RuntimeError(`edit_message() expects at least 2 arguments, got ${args.length}`);
  }

  const message = getRawValue(args[0]) as Message;
  if (!message || !message.edit) {
    throw new RuntimeError('Invalid message');
  }

  if (!isString(args[1])) {
    throw new TypeError('Content must be a string');
  }

  const content = args[1].value;
  const editOptions: any = { content };

  // Parse options if provided
  if (args.length >= 3 && isObject(args[2])) {
    const options = args[2];

    const embeds = options.properties.get('embeds');
    if (embeds && isArray(embeds)) {
      editOptions.embeds = embeds.elements.map(e => getRawValue(e)).filter(e => e);
    }

    const components = options.properties.get('components');
    if (components && isArray(components)) {
      editOptions.components = components.elements.map(c => getRawValue(c)).filter(c => c);
    }
  }

  await message.edit(editOptions);
  return makeBoolean(true);
});

/**
 * delete_message(message)
 * Delete a message
 */
export const deleteMessage = makeNativeFunction('delete_message', async (args: RuntimeValue[]) => {
  if (args.length !== 1) {
    throw new RuntimeError(`delete_message() expects 1 argument, got ${args.length}`);
  }

  const message = getRawValue(args[0]) as Message;
  if (!message || !message.delete) {
    throw new RuntimeError('Invalid message');
  }

  await message.delete();
  return makeBoolean(true);
});

/**
 * fetch_message(channel, messageId)
 * Fetch a message by ID
 */
export const fetchMessage = makeNativeFunction('fetch_message', async (args: RuntimeValue[]) => {
  if (args.length !== 2) {
    throw new RuntimeError(`fetch_message() expects 2 arguments, got ${args.length}`);
  }

  const channel = getRawValue(args[0]) as TextChannel;
  if (!channel || !channel.messages) {
    throw new RuntimeError('Invalid channel');
  }

  if (!isString(args[1])) {
    throw new TypeError('Message ID must be a string');
  }

  const message = await channel.messages.fetch(args[1].value);

  const properties = new Map<string, RuntimeValue>();
  properties.set('__raw', { __rawValue: message } as any);
  properties.set('id', makeString(message.id));
  properties.set('content', makeString(message.content));

  return makeObject(properties);
});

// ==================== BOT STATUS AND ADVANCED FUNCTIONS ====================

/**
 * set_status(status, activity, text)
 * Set the bot's status and activity
 * status: "online" | "idle" | "dnd" | "invisible"
 * activity: "playing" | "watching" | "listening"
 * text: Activity text
 */
const setBotStatus = makeNativeFunction('set_status', async (args: RuntimeValue[]) => {
  if (args.length !== 3) {
    throw new RuntimeError(`set_status() expects 3 arguments (status, activity, text), got ${args.length}`);
  }
  if (!isString(args[0]) || !isString(args[1]) || !isString(args[2])) {
    throw new TypeError('set_status() expects three strings');
  }

  const client = getDiscordClient();
  if (!client) {
    throw new RuntimeError('No Discord client available');
  }

  const status = args[0].value;
  const activity = args[1].value;
  const text = args[2].value;

  const activityType = activity === 'playing' ? 0 : activity === 'watching' ? 3 : activity === 'listening' ? 2 : 0;

  await client.user?.setPresence({
    status: status as any,
    activities: [{ name: text, type: activityType }]
  });

  return makeBoolean(true);
});

/**
 * reply_interaction(interaction, content, ephemeral)
 * Reply to an interaction with optional ephemeral flag
 */
const replyInteraction = makeNativeFunction('reply_interaction', async (args: RuntimeValue[]) => {
  if (args.length < 2) {
    throw new RuntimeError(`reply_interaction() expects at least 2 arguments, got ${args.length}`);
  }

  const interaction = getRawValue(args[0]);
  if (!interaction) {
    throw new RuntimeError('Invalid interaction object');
  }

  if (!isString(args[1])) {
    throw new TypeError('Second argument must be a string');
  }

  const content = args[1].value;
  const ephemeral = args.length > 2 && isBoolean(args[2]) ? args[2].value : false;

  await interaction.reply({
    content: content,
    ephemeral: ephemeral
  });

  return makeBoolean(true);
});

/**
 * show_modal(interaction, modal)
 * Show a modal to the user
 */
const showModal = makeNativeFunction('show_modal', async (args: RuntimeValue[]) => {
  if (args.length !== 2) {
    throw new RuntimeError(`show_modal() expects 2 arguments, got ${args.length}`);
  }

  const interaction = getRawValue(args[0]);
  const modal = getRawValue(args[1]);

  if (!interaction || !modal) {
    throw new RuntimeError('Invalid interaction or modal object');
  }

  await interaction.showModal(modal);
  return makeBoolean(true);
});

/**
 * add_modal_text_input(modal, customId, label, style, placeholder, required, maxLength)
 * Add a text input to a modal
 */
const addModalTextInput = makeNativeFunction('add_modal_text_input', async (args: RuntimeValue[]) => {
  if (args.length !== 7) {
    throw new RuntimeError(`add_modal_text_input() expects 7 arguments, got ${args.length}`);
  }

  const modal = getRawValue(args[0]);
  if (!modal) {
    throw new RuntimeError('Invalid modal object');
  }

  const customId = isString(args[1]) ? args[1].value : '';
  const label = isString(args[2]) ? args[2].value : '';
  const style = isString(args[3]) ? args[3].value : 'short';
  const placeholder = isString(args[4]) ? args[4].value : '';
  const required = isBoolean(args[5]) ? args[5].value : true;
  const maxLength = isNumber(args[6]) ? args[6].value : 1000;

  const textInput = new TextInputBuilder()
    .setCustomId(customId)
    .setLabel(label)
    .setStyle(style === 'paragraph' ? TextInputStyle.Paragraph : TextInputStyle.Short)
    .setPlaceholder(placeholder)
    .setRequired(required)
    .setMaxLength(maxLength);

  const row = new ActionRowBuilder<TextInputBuilder>().addComponents(textInput);
  modal.addComponents(row);

  return args[0];
});

/**
 * get_modal_field(interaction, fieldId)
 * Get a field value from a modal submission
 */
const getModalField = makeNativeFunction('get_modal_field', async (args: RuntimeValue[]) => {
  if (args.length !== 2) {
    throw new RuntimeError(`get_modal_field() expects 2 arguments, got ${args.length}`);
  }

  const interaction = getRawValue(args[0]);
  if (!interaction || !interaction.fields) {
    throw new RuntimeError('Invalid modal interaction object');
  }

  const fieldId = isString(args[1]) ? args[1].value : '';
  const value = interaction.fields.getTextInputValue(fieldId);

  return makeString(value);
});

/**
 * register_command(commandData)
 * Register a slash command with Discord
 */
const registerCommand = makeNativeFunction('register_command', async (args: RuntimeValue[]) => {
  if (args.length !== 1) {
    throw new RuntimeError(`register_command() expects 1 argument, got ${args.length}`);
  }

  if (!isObject(args[0])) {
    throw new TypeError('register_command() expects an object');
  }

  const client = getDiscordClient();
  if (!client || !client.application) {
    throw new RuntimeError('No Discord client available');
  }

  const commandData = convertObjectToJS(args[0]);
  await client.application.commands.create(commandData);

  return makeBoolean(true);
});

// Export all Discord builtin functions
export const discordBuiltins = {
  // Slash Commands
  register_slash_command: registerSlashCommand,

  // Embeds
  create_embed: createEmbed,
  embed_add_field: embedAddField,

  // Buttons
  create_button: createButton,
  create_link_button: createLinkButton,

  // Select Menus
  create_string_select: createStringSelect,
  create_user_select: createUserSelect,
  create_role_select: createRoleSelect,
  create_channel_select: createChannelSelect,

  // Modals
  create_modal: createModal,
  create_text_input: createTextInput,

  // Action Rows
  create_action_row: createActionRow,

  // Interaction Responses
  interaction_reply: interactionReply,
  interaction_defer: interactionDefer,
  interaction_update: interactionUpdate,

  // Advanced Messaging
  send_message: sendMessage,
  edit_message: editMessage,
  delete_message: deleteMessage,
  fetch_message: fetchMessage,

  // Bot Status and Advanced Functions
  set_status: setBotStatus,
  reply_interaction: replyInteraction,
  show_modal: showModal,
  add_modal_text_input: addModalTextInput,
  get_modal_field: getModalField,
  register_command: registerCommand,
};
