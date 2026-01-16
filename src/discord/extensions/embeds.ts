/**
 * Advanced Embed Features
 * Complete embed creation with all Discord embed features
 */

import { EmbedBuilder, ColorResolvable } from 'discord.js';
import { RuntimeValue, makeNativeFunction, makeObject, isString, isNumber, isObject, isArray } from '../../core/runtime/values';
import { RuntimeError, TypeError } from '../../utils/errors';

/**
 * Create embed with timestamp
 */
export const createEmbedWithTimestamp = makeNativeFunction('create_embed_with_timestamp', async (args: RuntimeValue[]) => {
  const embed = new EmbedBuilder();

  if (args.length > 0 && isNumber(args[0])) {
    // Use specific timestamp
    embed.setTimestamp((args[0] as any).value);
  } else {
    // Use current timestamp
    embed.setTimestamp();
  }

  return makeObject(new Map([
    ['_embed', { type: 'native', value: embed }],
  ]));
});

/**
 * Create embed with author
 */
export const createEmbedWithAuthor = makeNativeFunction('create_embed_with_author', async (args: RuntimeValue[]) => {
  if (args.length < 1) {
    throw new RuntimeError('create_embed_with_author() expects at least 1 argument: name, [icon_url], [url]');
  }

  if (!isString(args[0])) {
    throw new TypeError('Author name must be a string');
  }

  const name = (args[0] as any).value;
  const iconURL = args.length > 1 && isString(args[1]) ? (args[1] as any).value : undefined;
  const url = args.length > 2 && isString(args[2]) ? (args[2] as any).value : undefined;

  const embed = new EmbedBuilder().setAuthor({
    name,
    iconURL,
    url,
  });

  return makeObject(new Map([
    ['_embed', { type: 'native', value: embed }],
  ]));
});

/**
 * Create embed with footer
 */
export const createEmbedWithFooter = makeNativeFunction('create_embed_with_footer', async (args: RuntimeValue[]) => {
  if (args.length < 1) {
    throw new RuntimeError('create_embed_with_footer() expects at least 1 argument: text, [icon_url]');
  }

  if (!isString(args[0])) {
    throw new TypeError('Footer text must be a string');
  }

  const text = (args[0] as any).value;
  const iconURL = args.length > 1 && isString(args[1]) ? (args[1] as any).value : undefined;

  const embed = new EmbedBuilder().setFooter({
    text,
    iconURL,
  });

  return makeObject(new Map([
    ['_embed', { type: 'native', value: embed }],
  ]));
});

/**
 * Set embed image
 */
export const setEmbedImage = makeNativeFunction('set_embed_image', async (args: RuntimeValue[]) => {
  if (args.length !== 2) {
    throw new RuntimeError('set_embed_image() expects 2 arguments: embed, url');
  }

  if (!isObject(args[0])) {
    throw new TypeError('First argument must be an embed object');
  }

  if (!isString(args[1])) {
    throw new TypeError('URL must be a string');
  }

  const embedObj = (args[0] as any).properties;
  const embedNative = embedObj.get('_embed');

  if (!embedNative || embedNative.type !== 'native') {
    throw new RuntimeError('Invalid embed object');
  }

  const embed = embedNative.value as EmbedBuilder;
  const url = (args[1] as any).value;

  embed.setImage(url);

  return args[0];
});

/**
 * Set embed thumbnail
 */
export const setEmbedThumbnail = makeNativeFunction('set_embed_thumbnail', async (args: RuntimeValue[]) => {
  if (args.length !== 2) {
    throw new RuntimeError('set_embed_thumbnail() expects 2 arguments: embed, url');
  }

  if (!isObject(args[0])) {
    throw new TypeError('First argument must be an embed object');
  }

  if (!isString(args[1])) {
    throw new TypeError('URL must be a string');
  }

  const embedObj = (args[0] as any).properties;
  const embedNative = embedObj.get('_embed');

  if (!embedNative || embedNative.type !== 'native') {
    throw new RuntimeError('Invalid embed object');
  }

  const embed = embedNative.value as EmbedBuilder;
  const url = (args[1] as any).value;

  embed.setThumbnail(url);

  return args[0];
});

/**
 * Set embed title
 */
export const setEmbedTitle = makeNativeFunction('set_embed_title', async (args: RuntimeValue[]) => {
  if (args.length !== 2) {
    throw new RuntimeError('set_embed_title() expects 2 arguments: embed, title');
  }

  if (!isObject(args[0])) {
    throw new TypeError('First argument must be an embed object');
  }

  if (!isString(args[1])) {
    throw new TypeError('Title must be a string');
  }

  const embedObj = (args[0] as any).properties;
  const embedNative = embedObj.get('_embed');

  if (!embedNative || embedNative.type !== 'native') {
    throw new RuntimeError('Invalid embed object');
  }

  const embed = embedNative.value as EmbedBuilder;
  const title = (args[1] as any).value;

  embed.setTitle(title);

  return args[0];
});

/**
 * Set embed description
 */
export const setEmbedDescription = makeNativeFunction('set_embed_description', async (args: RuntimeValue[]) => {
  if (args.length !== 2) {
    throw new RuntimeError('set_embed_description() expects 2 arguments: embed, description');
  }

  if (!isObject(args[0])) {
    throw new TypeError('First argument must be an embed object');
  }

  if (!isString(args[1])) {
    throw new TypeError('Description must be a string');
  }

  const embedObj = (args[0] as any).properties;
  const embedNative = embedObj.get('_embed');

  if (!embedNative || embedNative.type !== 'native') {
    throw new RuntimeError('Invalid embed object');
  }

  const embed = embedNative.value as EmbedBuilder;
  const description = (args[1] as any).value;

  embed.setDescription(description);

  return args[0];
});

/**
 * Set embed color
 */
export const setEmbedColor = makeNativeFunction('set_embed_color', async (args: RuntimeValue[]) => {
  if (args.length !== 2) {
    throw new RuntimeError('set_embed_color() expects 2 arguments: embed, color');
  }

  if (!isObject(args[0])) {
    throw new TypeError('First argument must be an embed object');
  }

  const embedObj = (args[0] as any).properties;
  const embedNative = embedObj.get('_embed');

  if (!embedNative || embedNative.type !== 'native') {
    throw new RuntimeError('Invalid embed object');
  }

  const embed = embedNative.value as EmbedBuilder;

  // Handle color as number or string
  let color: ColorResolvable;
  if (isNumber(args[1])) {
    color = (args[1] as any).value;
  } else if (isString(args[1])) {
    const colorStr = (args[1] as any).value;
    // Try to parse as hex color
    if (colorStr.startsWith('#')) {
      color = parseInt(colorStr.substring(1), 16);
    } else {
      color = colorStr as ColorResolvable;
    }
  } else {
    throw new TypeError('Color must be a number or string');
  }

  embed.setColor(color);

  return args[0];
});

/**
 * Set embed URL
 */
export const setEmbedURL = makeNativeFunction('set_embed_url', async (args: RuntimeValue[]) => {
  if (args.length !== 2) {
    throw new RuntimeError('set_embed_url() expects 2 arguments: embed, url');
  }

  if (!isObject(args[0])) {
    throw new TypeError('First argument must be an embed object');
  }

  if (!isString(args[1])) {
    throw new TypeError('URL must be a string');
  }

  const embedObj = (args[0] as any).properties;
  const embedNative = embedObj.get('_embed');

  if (!embedNative || embedNative.type !== 'native') {
    throw new RuntimeError('Invalid embed object');
  }

  const embed = embedNative.value as EmbedBuilder;
  const url = (args[1] as any).value;

  embed.setURL(url);

  return args[0];
});

/**
 * Add embed field
 */
export const addEmbedField = makeNativeFunction('add_embed_field', async (args: RuntimeValue[]) => {
  if (args.length < 3) {
    throw new RuntimeError('add_embed_field() expects at least 3 arguments: embed, name, value, [inline]');
  }

  if (!isObject(args[0])) {
    throw new TypeError('First argument must be an embed object');
  }

  if (!isString(args[1]) || !isString(args[2])) {
    throw new TypeError('Name and value must be strings');
  }

  const embedObj = (args[0] as any).properties;
  const embedNative = embedObj.get('_embed');

  if (!embedNative || embedNative.type !== 'native') {
    throw new RuntimeError('Invalid embed object');
  }

  const embed = embedNative.value as EmbedBuilder;
  const name = (args[1] as any).value;
  const value = (args[2] as any).value;
  const inline = args.length > 3 && args[3].type === 'boolean' ? (args[3] as any).value : false;

  embed.addFields({ name, value, inline });

  return args[0];
});

/**
 * Add multiple embed fields
 */
export const addEmbedFields = makeNativeFunction('add_embed_fields', async (args: RuntimeValue[]) => {
  if (args.length !== 2) {
    throw new RuntimeError('add_embed_fields() expects 2 arguments: embed, fields_array');
  }

  if (!isObject(args[0])) {
    throw new TypeError('First argument must be an embed object');
  }

  if (!isArray(args[1])) {
    throw new TypeError('Second argument must be an array of fields');
  }

  const embedObj = (args[0] as any).properties;
  const embedNative = embedObj.get('_embed');

  if (!embedNative || embedNative.type !== 'native') {
    throw new RuntimeError('Invalid embed object');
  }

  const embed = embedNative.value as EmbedBuilder;
  const fieldsArray = (args[1] as any).elements;

  const fields = fieldsArray.map((field: RuntimeValue) => {
    if (!isObject(field)) {
      throw new TypeError('Each field must be an object');
    }

    const props = (field as any).properties;
    const name = props.get('name');
    const value = props.get('value');
    const inline = props.get('inline');

    if (!name || !isString(name) || !value || !isString(value)) {
      throw new TypeError('Each field must have name and value properties');
    }

    return {
      name: (name as any).value,
      value: (value as any).value,
      inline: inline && inline.type === 'boolean' ? (inline as any).value : false,
    };
  });

  embed.addFields(...fields);

  return args[0];
});

/**
 * Set embed author
 */
export const setEmbedAuthor = makeNativeFunction('set_embed_author', async (args: RuntimeValue[]) => {
  if (args.length < 2) {
    throw new RuntimeError('set_embed_author() expects at least 2 arguments: embed, name, [icon_url], [url]');
  }

  if (!isObject(args[0])) {
    throw new TypeError('First argument must be an embed object');
  }

  if (!isString(args[1])) {
    throw new TypeError('Author name must be a string');
  }

  const embedObj = (args[0] as any).properties;
  const embedNative = embedObj.get('_embed');

  if (!embedNative || embedNative.type !== 'native') {
    throw new RuntimeError('Invalid embed object');
  }

  const embed = embedNative.value as EmbedBuilder;
  const name = (args[1] as any).value;
  const iconURL = args.length > 2 && isString(args[2]) ? (args[2] as any).value : undefined;
  const url = args.length > 3 && isString(args[3]) ? (args[3] as any).value : undefined;

  embed.setAuthor({ name, iconURL, url });

  return args[0];
});

/**
 * Set embed footer
 */
export const setEmbedFooter = makeNativeFunction('set_embed_footer', async (args: RuntimeValue[]) => {
  if (args.length < 2) {
    throw new RuntimeError('set_embed_footer() expects at least 2 arguments: embed, text, [icon_url]');
  }

  if (!isObject(args[0])) {
    throw new TypeError('First argument must be an embed object');
  }

  if (!isString(args[1])) {
    throw new TypeError('Footer text must be a string');
  }

  const embedObj = (args[0] as any).properties;
  const embedNative = embedObj.get('_embed');

  if (!embedNative || embedNative.type !== 'native') {
    throw new RuntimeError('Invalid embed object');
  }

  const embed = embedNative.value as EmbedBuilder;
  const text = (args[1] as any).value;
  const iconURL = args.length > 2 && isString(args[2]) ? (args[2] as any).value : undefined;

  embed.setFooter({ text, iconURL });

  return args[0];
});

/**
 * Set embed timestamp
 */
export const setEmbedTimestamp = makeNativeFunction('set_embed_timestamp', async (args: RuntimeValue[]) => {
  if (args.length < 1) {
    throw new RuntimeError('set_embed_timestamp() expects at least 1 argument: embed, [timestamp]');
  }

  if (!isObject(args[0])) {
    throw new TypeError('First argument must be an embed object');
  }

  const embedObj = (args[0] as any).properties;
  const embedNative = embedObj.get('_embed');

  if (!embedNative || embedNative.type !== 'native') {
    throw new RuntimeError('Invalid embed object');
  }

  const embed = embedNative.value as EmbedBuilder;

  if (args.length > 1 && isNumber(args[1])) {
    embed.setTimestamp((args[1] as any).value);
  } else {
    embed.setTimestamp();
  }

  return args[0];
});

export const embedBuiltins = {
  create_embed_with_timestamp: createEmbedWithTimestamp,
  create_embed_with_author: createEmbedWithAuthor,
  create_embed_with_footer: createEmbedWithFooter,
  set_embed_image: setEmbedImage,
  set_embed_thumbnail: setEmbedThumbnail,
  set_embed_title: setEmbedTitle,
  set_embed_description: setEmbedDescription,
  set_embed_color: setEmbedColor,
  set_embed_url: setEmbedURL,
  add_embed_field: addEmbedField,
  add_embed_fields: addEmbedFields,
  set_embed_author: setEmbedAuthor,
  set_embed_footer: setEmbedFooter,
  set_embed_timestamp: setEmbedTimestamp,
};
