/**
 * Sticker Management
 * Complete sticker operations for guilds
 */

import {
  StickerFormatType,
  Client,
  AttachmentBuilder,
} from 'discord.js';
import { RuntimeValue, makeNativeFunction, makeBoolean, makeString, makeArray, makeRuntimeObject, isString, isObject } from '../../core/runtime/values';
import { RuntimeError, TypeError } from '../../utils/errors';
import * as fs from 'fs';

/**
 * Create a guild sticker
 */
export const createSticker = makeNativeFunction('create_sticker', async (args: RuntimeValue[]) => {
  if (args.length < 4) {
    throw new RuntimeError('create_sticker() expects 4 arguments: guild, name, description, emoji, file_path');
  }

  if (!isObject(args[0])) {
    throw new TypeError('Guild must be an object');
  }

  if (!isString(args[1]) || !isString(args[2]) || !isString(args[3]) || !isString(args[4])) {
    throw new TypeError('Name, description, emoji, and file_path must be strings');
  }

  const guildObj = (args[0] as any).properties;
  const guildId = guildObj.get('id');
  const client = guildObj.get('_client');

  if (!guildId || !client || client.type !== 'native') {
    throw new RuntimeError('Invalid guild object');
  }

  const discordClient = client.value as Client;
  const guild = await discordClient.guilds.fetch((guildId as any).value);

  const name = (args[1] as any).value;
  const description = (args[2] as any).value;
  const emoji = (args[3] as any).value;
  const filePath = (args[4] as any).value;

  try {
    if (!fs.existsSync(filePath)) {
      throw new RuntimeError(`File not found: ${filePath}`);
    }

    const fileBuffer = fs.readFileSync(filePath);
    const attachment = new AttachmentBuilder(fileBuffer, { name: 'sticker.png' });

    const sticker = await guild.stickers.create({
      file: attachment.attachment,
      name: name,
      tags: emoji,
      description: description,
      reason: 'Created via EzLang',
    });

    return makeRuntimeObject([
      ['id', makeString(sticker.id)],
      ['name', makeString(sticker.name)],
      ['description', makeString(sticker.description || '')],
      ['tags', makeString(sticker.tags || '')],
      ['format', makeString(StickerFormatType[sticker.format])],
    ]);
  } catch (error) {
    throw new RuntimeError(`Failed to create sticker: ${error instanceof Error ? error.message : String(error)}`);
  }
});

/**
 * Delete a guild sticker
 */
export const deleteSticker = makeNativeFunction('delete_sticker', async (args: RuntimeValue[]) => {
  if (args.length !== 2) {
    throw new RuntimeError('delete_sticker() expects 2 arguments: guild, sticker_id');
  }

  if (!isObject(args[0])) {
    throw new TypeError('Guild must be an object');
  }

  if (!isString(args[1])) {
    throw new TypeError('Sticker ID must be a string');
  }

  const guildObj = (args[0] as any).properties;
  const guildId = guildObj.get('id');
  const client = guildObj.get('_client');

  if (!guildId || !client || client.type !== 'native') {
    throw new RuntimeError('Invalid guild object');
  }

  const discordClient = client.value as Client;
  const guild = await discordClient.guilds.fetch((guildId as any).value);
  const stickerId = (args[1] as any).value;

  try {
    await guild.stickers.delete(stickerId, 'Deleted via EzLang');
    return makeBoolean(true);
  } catch (error) {
    throw new RuntimeError(`Failed to delete sticker: ${error instanceof Error ? error.message : String(error)}`);
  }
});

/**
 * Get a sticker by ID
 */
export const getSticker = makeNativeFunction('get_sticker', async (args: RuntimeValue[]) => {
  if (args.length !== 1) {
    throw new RuntimeError('get_sticker() expects 1 argument: sticker_id');
  }

  if (!isString(args[0])) {
    throw new TypeError('Sticker ID must be a string');
  }

  try {
    // Note: This requires a client instance - implementation may need adjustment
    // based on how the global client is accessed
    throw new RuntimeError('get_sticker() requires client context - use list_guild_stickers() instead');
  } catch (error) {
    throw new RuntimeError(`Failed to get sticker: ${error instanceof Error ? error.message : String(error)}`);
  }
});

/**
 * List all stickers in a guild
 */
export const listGuildStickers = makeNativeFunction('list_guild_stickers', async (args: RuntimeValue[]) => {
  if (args.length !== 1) {
    throw new RuntimeError('list_guild_stickers() expects 1 argument: guild');
  }

  if (!isObject(args[0])) {
    throw new TypeError('Guild must be an object');
  }

  const guildObj = (args[0] as any).properties;
  const guildId = guildObj.get('id');
  const client = guildObj.get('_client');

  if (!guildId || !client || client.type !== 'native') {
    throw new RuntimeError('Invalid guild object');
  }

  const discordClient = client.value as Client;
  const guild = await discordClient.guilds.fetch((guildId as any).value);

  try {
    const stickers = await guild.stickers.fetch();
    const stickersArray: RuntimeValue[] = [];

    for (const sticker of stickers.values()) {
      stickersArray.push(makeRuntimeObject([
        ['id', makeString(sticker.id)],
        ['name', makeString(sticker.name)],
        ['description', makeString(sticker.description || '')],
        ['tags', makeString(sticker.tags || '')],
        ['format', makeString(StickerFormatType[sticker.format])],
        ['available', makeBoolean(sticker.available || false)],
      ]));
    }

    return makeArray(stickersArray);
  } catch (error) {
    throw new RuntimeError(`Failed to list guild stickers: ${error instanceof Error ? error.message : String(error)}`);
  }
});

/**
 * Edit a guild sticker
 */
export const editSticker = makeNativeFunction('edit_sticker', async (args: RuntimeValue[]) => {
  if (args.length < 2) {
    throw new RuntimeError('edit_sticker() expects at least 2 arguments: guild, sticker_id, options');
  }

  if (!isObject(args[0])) {
    throw new TypeError('Guild must be an object');
  }

  if (!isString(args[1])) {
    throw new TypeError('Sticker ID must be a string');
  }

  if (args.length > 2 && !isObject(args[2])) {
    throw new TypeError('Options must be an object');
  }

  const guildObj = (args[0] as any).properties;
  const guildId = guildObj.get('id');
  const client = guildObj.get('_client');

  if (!guildId || !client || client.type !== 'native') {
    throw new RuntimeError('Invalid guild object');
  }

  const discordClient = client.value as Client;
  const guild = await discordClient.guilds.fetch((guildId as any).value);
  const stickerId = (args[1] as any).value;

  const options = args.length > 2 ? (args[2] as any).properties : new Map();
  const editData: any = {};

  const name = options.get('name');
  if (name && isString(name)) {
    editData.name = (name as any).value;
  }

  const description = options.get('description');
  if (description && isString(description)) {
    editData.description = (description as any).value;
  }

  const tags = options.get('tags');
  if (tags && isString(tags)) {
    editData.tags = (tags as any).value;
  }

  try {
    const sticker = await guild.stickers.edit(stickerId, editData);
    return makeRuntimeObject([
      ['id', makeString(sticker.id)],
      ['name', makeString(sticker.name)],
      ['description', makeString(sticker.description || '')],
      ['tags', makeString(sticker.tags || '')],
    ]);
  } catch (error) {
    throw new RuntimeError(`Failed to edit sticker: ${error instanceof Error ? error.message : String(error)}`);
  }
});

export const stickerBuiltins = {
  create_sticker: createSticker,
  delete_sticker: deleteSticker,
  get_sticker: getSticker,
  list_guild_stickers: listGuildStickers,
  edit_sticker: editSticker,
};
