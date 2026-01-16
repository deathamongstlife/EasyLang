/**
 * Builder Validation for EasyLang
 * Provides validation for Discord embeds, buttons, and components
 */

import {
  RuntimeValue,
  makeNativeFunction,
  makeObject,
  makeString,
  makeNumber,
  makeBoolean,
  makeArray,
  isObject,
} from '../../core/runtime/values';
import { RuntimeError, TypeError } from '../../utils/errors';
import { EmbedBuilder, ButtonBuilder, StringSelectMenuBuilder } from 'discord.js';

/**
 * validate_embed(embed)
 * Validate embed against Discord limits
 * Returns: { valid: boolean, errors: array, warnings: array }
 */
export const validateEmbed = makeNativeFunction('validate_embed', async (args: RuntimeValue[]) => {
  if (args.length !== 1) {
    throw new RuntimeError(`validate_embed() expects 1 argument (embed), got ${args.length}`);
  }

  if (!isObject(args[0])) {
    throw new TypeError('Embed must be an object');
  }

  const embedObj = args[0];
  const errors: string[] = [];
  const warnings: string[] = [];

  // Get the native embed if present
  const embedNative = (embedObj as any).properties.get('_embed');
  let embed: EmbedBuilder | null = null;

  if (embedNative && embedNative.type === 'native') {
    embed = embedNative.value;
  }

  if (!embed) {
    errors.push('Invalid embed object: missing native embed');
  } else {
    const embedData = embed.toJSON();

    // Validate title
    if (embedData.title) {
      if (embedData.title.length > 256) {
        errors.push(`Title exceeds 256 characters (${embedData.title.length})`);
      }
    }

    // Validate description
    if (embedData.description) {
      if (embedData.description.length > 4096) {
        errors.push(`Description exceeds 4096 characters (${embedData.description.length})`);
      }
      if (embedData.description.length > 2000) {
        warnings.push(`Description is quite long (${embedData.description.length} characters)`);
      }
    }

    // Validate fields
    if (embedData.fields) {
      if (embedData.fields.length > 25) {
        errors.push(`Too many fields: ${embedData.fields.length} (max 25)`);
      }

      for (let i = 0; i < embedData.fields.length; i++) {
        const field = embedData.fields[i];

        if (field.name.length > 256) {
          errors.push(`Field ${i} name exceeds 256 characters (${field.name.length})`);
        }

        if (field.value.length > 1024) {
          errors.push(`Field ${i} value exceeds 1024 characters (${field.value.length})`);
        }

        if (!field.name || field.name.trim() === '') {
          errors.push(`Field ${i} has empty name`);
        }

        if (!field.value || field.value.trim() === '') {
          errors.push(`Field ${i} has empty value`);
        }
      }
    }

    // Validate footer
    if (embedData.footer) {
      if (embedData.footer.text && embedData.footer.text.length > 2048) {
        errors.push(`Footer text exceeds 2048 characters (${embedData.footer.text.length})`);
      }
    }

    // Validate author
    if (embedData.author) {
      if (embedData.author.name && embedData.author.name.length > 256) {
        errors.push(`Author name exceeds 256 characters (${embedData.author.name.length})`);
      }
    }

    // Calculate total character count
    let totalChars = 0;
    if (embedData.title) totalChars += embedData.title.length;
    if (embedData.description) totalChars += embedData.description.length;
    if (embedData.footer?.text) totalChars += embedData.footer.text.length;
    if (embedData.author?.name) totalChars += embedData.author.name.length;
    if (embedData.fields) {
      for (const field of embedData.fields) {
        totalChars += field.name.length + field.value.length;
      }
    }

    if (totalChars > 6000) {
      errors.push(`Total embed characters exceed 6000 (${totalChars})`);
    }

    if (totalChars > 5000) {
      warnings.push(`Embed is quite large (${totalChars} characters)`);
    }

    // Validate URLs
    const urlPattern = /^https?:\/\/.+/;
    if (embedData.url && !urlPattern.test(embedData.url)) {
      errors.push('Embed URL must start with http:// or https://');
    }
    if (embedData.image?.url && !urlPattern.test(embedData.image.url)) {
      errors.push('Image URL must start with http:// or https://');
    }
    if (embedData.thumbnail?.url && !urlPattern.test(embedData.thumbnail.url)) {
      errors.push('Thumbnail URL must start with http:// or https://');
    }
    if (embedData.author?.icon_url && !urlPattern.test(embedData.author.icon_url)) {
      warnings.push('Author icon URL should start with http:// or https://');
    }
    if (embedData.footer?.icon_url && !urlPattern.test(embedData.footer.icon_url)) {
      warnings.push('Footer icon URL should start with http:// or https://');
    }
  }

  // Build result
  const result = new Map<string, RuntimeValue>();
  result.set('valid', makeBoolean(errors.length === 0));
  result.set('errors', makeArray(errors.map(e => makeString(e))));
  result.set('warnings', makeArray(warnings.map(w => makeString(w))));
  result.set('error_count', makeNumber(errors.length));
  result.set('warning_count', makeNumber(warnings.length));

  return makeObject(result);
});

/**
 * validate_button(button)
 * Validate button properties
 * Returns: { valid: boolean, errors: array, warnings: array }
 */
export const validateButton = makeNativeFunction('validate_button', async (args: RuntimeValue[]) => {
  if (args.length !== 1) {
    throw new RuntimeError(`validate_button() expects 1 argument (button), got ${args.length}`);
  }

  if (!isObject(args[0])) {
    throw new TypeError('Button must be an object');
  }

  const buttonObj = args[0];
  const errors: string[] = [];
  const warnings: string[] = [];

  // Get the native button if present
  const buttonNative = (buttonObj as any).properties.get('_button');
  let button: ButtonBuilder | null = null;

  if (buttonNative && buttonNative.type === 'native') {
    button = buttonNative.value;
  }

  if (!button) {
    errors.push('Invalid button object: missing native button');
  } else {
    const buttonData = button.toJSON() as any;

    // Validate label
    if (buttonData.label) {
      if (buttonData.label.length > 80) {
        errors.push(`Label exceeds 80 characters (${buttonData.label.length})`);
      }
      if (buttonData.label.length === 0) {
        errors.push('Label cannot be empty');
      }
    }

    // Validate custom_id
    if (buttonData.custom_id) {
      if (buttonData.custom_id.length > 100) {
        errors.push(`Custom ID exceeds 100 characters (${buttonData.custom_id.length})`);
      }
      if (buttonData.custom_id.length === 0) {
        errors.push('Custom ID cannot be empty');
      }
    }

    // Validate URL (for link buttons)
    if (buttonData.url) {
      const urlPattern = /^https?:\/\/.+/;
      if (!urlPattern.test(buttonData.url)) {
        errors.push('Button URL must start with http:// or https://');
      }
      if (buttonData.url.length > 512) {
        errors.push(`URL exceeds 512 characters (${buttonData.url.length})`);
      }
    }

    // Validate style
    if (buttonData.style === undefined || buttonData.style === null) {
      errors.push('Button style is required');
    }

    // Link buttons must have URL, not custom_id
    if (buttonData.style === 5 && !buttonData.url) {
      errors.push('Link buttons must have a URL');
    }

    // Non-link buttons must have custom_id
    if (buttonData.style !== 5 && !buttonData.custom_id) {
      errors.push('Interactive buttons must have a custom_id');
    }

    // Validate emoji
    if (buttonData.emoji) {
      if (!buttonData.emoji.id && !buttonData.emoji.name) {
        warnings.push('Emoji should have either id or name');
      }
    }

    // Check if both label and emoji are missing
    if (!buttonData.label && !buttonData.emoji) {
      errors.push('Button must have either a label or emoji');
    }
  }

  // Build result
  const result = new Map<string, RuntimeValue>();
  result.set('valid', makeBoolean(errors.length === 0));
  result.set('errors', makeArray(errors.map(e => makeString(e))));
  result.set('warnings', makeArray(warnings.map(w => makeString(w))));
  result.set('error_count', makeNumber(errors.length));
  result.set('warning_count', makeNumber(warnings.length));

  return makeObject(result);
});

/**
 * validate_select_menu(menu)
 * Validate select menu properties
 * Returns: { valid: boolean, errors: array, warnings: array }
 */
export const validateSelectMenu = makeNativeFunction('validate_select_menu', async (args: RuntimeValue[]) => {
  if (args.length !== 1) {
    throw new RuntimeError(`validate_select_menu() expects 1 argument (menu), got ${args.length}`);
  }

  if (!isObject(args[0])) {
    throw new TypeError('Select menu must be an object');
  }

  const menuObj = args[0];
  const errors: string[] = [];
  const warnings: string[] = [];

  // Get the native select menu if present
  const menuNative = (menuObj as any).properties.get('_select');
  let menu: StringSelectMenuBuilder | null = null;

  if (menuNative && menuNative.type === 'native') {
    menu = menuNative.value;
  }

  if (!menu) {
    errors.push('Invalid select menu object: missing native select menu');
  } else {
    const menuData = menu.toJSON();

    // Validate custom_id
    if (menuData.custom_id) {
      if (menuData.custom_id.length > 100) {
        errors.push(`Custom ID exceeds 100 characters (${menuData.custom_id.length})`);
      }
      if (menuData.custom_id.length === 0) {
        errors.push('Custom ID cannot be empty');
      }
    } else {
      errors.push('Select menu must have a custom_id');
    }

    // Validate placeholder
    if (menuData.placeholder) {
      if (menuData.placeholder.length > 150) {
        errors.push(`Placeholder exceeds 150 characters (${menuData.placeholder.length})`);
      }
    }

    // Validate options
    if (menuData.options) {
      if (menuData.options.length === 0) {
        errors.push('Select menu must have at least one option');
      }

      if (menuData.options.length > 25) {
        errors.push(`Too many options: ${menuData.options.length} (max 25)`);
      }

      for (let i = 0; i < menuData.options.length; i++) {
        const option = menuData.options[i];

        if (!option.label || option.label.trim() === '') {
          errors.push(`Option ${i} has empty label`);
        } else if (option.label.length > 100) {
          errors.push(`Option ${i} label exceeds 100 characters (${option.label.length})`);
        }

        if (!option.value || option.value.trim() === '') {
          errors.push(`Option ${i} has empty value`);
        } else if (option.value.length > 100) {
          errors.push(`Option ${i} value exceeds 100 characters (${option.value.length})`);
        }

        if (option.description && option.description.length > 100) {
          errors.push(`Option ${i} description exceeds 100 characters (${option.description.length})`);
        }
      }

      // Check for duplicate values
      const values = menuData.options.map((o: any) => o.value);
      const uniqueValues = new Set(values);
      if (values.length !== uniqueValues.size) {
        errors.push('Select menu has duplicate option values');
      }
    } else {
      errors.push('Select menu must have options');
    }

    // Validate min_values and max_values
    if (menuData.min_values !== undefined) {
      if (menuData.min_values < 0 || menuData.min_values > 25) {
        errors.push(`min_values must be between 0 and 25 (got ${menuData.min_values})`);
      }

      if (menuData.options && menuData.min_values > menuData.options.length) {
        errors.push(`min_values (${menuData.min_values}) exceeds option count (${menuData.options.length})`);
      }
    }

    if (menuData.max_values !== undefined) {
      if (menuData.max_values < 1 || menuData.max_values > 25) {
        errors.push(`max_values must be between 1 and 25 (got ${menuData.max_values})`);
      }

      if (menuData.options && menuData.max_values > menuData.options.length) {
        warnings.push(`max_values (${menuData.max_values}) exceeds option count (${menuData.options.length})`);
      }
    }

    if (menuData.min_values !== undefined && menuData.max_values !== undefined) {
      if (menuData.min_values > menuData.max_values) {
        errors.push(`min_values (${menuData.min_values}) exceeds max_values (${menuData.max_values})`);
      }
    }
  }

  // Build result
  const result = new Map<string, RuntimeValue>();
  result.set('valid', makeBoolean(errors.length === 0));
  result.set('errors', makeArray(errors.map(e => makeString(e))));
  result.set('warnings', makeArray(warnings.map(w => makeString(w))));
  result.set('error_count', makeNumber(errors.length));
  result.set('warning_count', makeNumber(warnings.length));

  return makeObject(result);
});

/**
 * validate_action_row(action_row)
 * Validate action row (max 5 components, type consistency)
 */
export const validateActionRow = makeNativeFunction('validate_action_row', async (args: RuntimeValue[]) => {
  if (args.length !== 1) {
    throw new RuntimeError(`validate_action_row() expects 1 argument (action_row), got ${args.length}`);
  }

  if (!isObject(args[0])) {
    throw new TypeError('Action row must be an object');
  }

  const errors: string[] = [];
  const warnings: string[] = [];

  const actionRowObj = args[0];
  const componentsArray = (actionRowObj as any).properties.get('components');

  if (!componentsArray || componentsArray.type !== 'array') {
    errors.push('Action row must have a components array');
  } else {
    const components = (componentsArray as any).elements;

    if (components.length === 0) {
      errors.push('Action row must have at least one component');
    }

    if (components.length > 5) {
      errors.push(`Too many components in action row: ${components.length} (max 5)`);
    }

    // Check component type consistency (can't mix select menus with buttons)
    let hasButtons = false;
    let hasSelectMenus = false;

    for (const comp of components) {
      if (comp.type === 'object') {
        const compObj = comp as any;
        if (compObj.properties.has('_button')) {
          hasButtons = true;
        }
        if (compObj.properties.has('_select')) {
          hasSelectMenus = true;
        }
      }
    }

    if (hasButtons && hasSelectMenus) {
      errors.push('Cannot mix buttons and select menus in the same action row');
    }

    if (hasSelectMenus && components.length > 1) {
      errors.push('Action row with select menu cannot have other components');
    }
  }

  // Build result
  const result = new Map<string, RuntimeValue>();
  result.set('valid', makeBoolean(errors.length === 0));
  result.set('errors', makeArray(errors.map(e => makeString(e))));
  result.set('warnings', makeArray(warnings.map(w => makeString(w))));
  result.set('error_count', makeNumber(errors.length));
  result.set('warning_count', makeNumber(warnings.length));

  return makeObject(result);
});

// Export all validation functions
export const validationBuiltins = {
  validate_embed: validateEmbed,
  validate_button: validateButton,
  validate_select_menu: validateSelectMenu,
  validate_action_row: validateActionRow,
};
