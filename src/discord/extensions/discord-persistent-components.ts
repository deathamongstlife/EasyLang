/**
 * Discord Persistent Components for EzLang
 * Provides components (buttons, select menus) that survive bot restarts
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
  isObject,
  isFunction,
  FunctionValue,
} from '../../core/runtime/values';
import { RuntimeError, TypeError } from '../../utils/errors';
import {
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from 'discord.js';
import * as fs from 'fs';
import * as path from 'path';

// Component handler interface
interface ComponentHandler {
  customId: string;
  handlerName: string;
  createdAt: number;
  expiresAt: number;
  state?: any;
  type: 'button' | 'select_menu';
}

// In-memory handler function registry
const handlerFunctions = new Map<string, FunctionValue>();

// Storage file path
const STORAGE_DIR = path.join(process.cwd(), 'src', 'discord', 'persistent-storage');
const STORAGE_FILE = path.join(STORAGE_DIR, 'components.json');

// Discord component expiry time (15 minutes)
const COMPONENT_EXPIRY_MS = 15 * 60 * 1000;

// Auto-cleanup interval (every 5 minutes)
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

/**
 * Ensure storage directory exists
 */
function ensureStorageDir(): void {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
  }
}

/**
 * Load component handlers from storage
 */
function loadHandlersFromStorage(): Map<string, ComponentHandler> {
  ensureStorageDir();

  if (!fs.existsSync(STORAGE_FILE)) {
    return new Map();
  }

  try {
    const data = fs.readFileSync(STORAGE_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    return new Map(Object.entries(parsed));
  } catch (error) {
    console.error('Failed to load component handlers:', error);
    return new Map();
  }
}

/**
 * Save component handlers to storage
 */
function saveHandlersToStorage(handlers: Map<string, ComponentHandler>): boolean {
  ensureStorageDir();

  try {
    const obj: Record<string, ComponentHandler> = {};
    handlers.forEach((value, key) => {
      obj[key] = value;
    });

    const data = JSON.stringify(obj, null, 2);
    fs.writeFileSync(STORAGE_FILE, data, 'utf-8');
    return true;
  } catch (error) {
    console.error('Failed to save component handlers:', error);
    return false;
  }
}

// Global component handler storage
let componentHandlers = loadHandlersFromStorage();

/**
 * Generate unique custom ID
 */
function generateCustomId(prefix: string = 'persistent'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${timestamp}_${random}`;
}

/**
 * Clean up expired components
 */
function cleanupExpiredComponents(): void {
  const now = Date.now();
  const toDelete: string[] = [];

  componentHandlers.forEach((handler, customId) => {
    if (handler.expiresAt <= now) {
      toDelete.push(customId);
    }
  });

  toDelete.forEach(customId => {
    componentHandlers.delete(customId);
    handlerFunctions.delete(customId);
  });

  if (toDelete.length > 0) {
    saveHandlersToStorage(componentHandlers);
    console.log(`Cleaned up ${toDelete.length} expired component(s)`);
  }
}

// Start auto-cleanup interval
setInterval(cleanupExpiredComponents, CLEANUP_INTERVAL_MS);

/**
 * create_persistent_button(options, handler)
 * Create a persistent button component
 *
 * Options:
 * - label: Button text (required)
 * - style: Button style (primary, secondary, success, danger, link) (default: primary)
 * - custom_id: Custom ID (optional, auto-generated if not provided)
 * - emoji: Emoji for button (optional)
 * - disabled: Whether button is disabled (default: false)
 * - url: URL for link buttons (required if style is link)
 * - state: Serializable state object (optional)
 *
 * Handler: Function to call when button is clicked
 */
export const createPersistentButton = makeNativeFunction('create_persistent_button', async (args: RuntimeValue[]) => {
  if (args.length < 1 || args.length > 2) {
    throw new RuntimeError(`create_persistent_button() expects 1-2 arguments (options, handler?), got ${args.length}`);
  }

  if (!isObject(args[0])) {
    throw new TypeError('Options must be an object');
  }

  const options = args[0];
  const handler = args.length === 2 ? args[1] : null;

  // Extract label
  const labelProp = options.properties.get('label');
  if (!labelProp || !isString(labelProp)) {
    throw new RuntimeError('Button label is required and must be a string');
  }
  const label = labelProp.value;

  // Extract style
  const styleProp = options.properties.get('style');
  let style = ButtonStyle.Primary;
  if (styleProp && isString(styleProp)) {
    const styleValue = styleProp.value.toLowerCase();
    switch (styleValue) {
      case 'primary':
        style = ButtonStyle.Primary;
        break;
      case 'secondary':
        style = ButtonStyle.Secondary;
        break;
      case 'success':
        style = ButtonStyle.Success;
        break;
      case 'danger':
        style = ButtonStyle.Danger;
        break;
      case 'link':
        style = ButtonStyle.Link;
        break;
      default:
        throw new RuntimeError(`Invalid button style: ${styleValue}`);
    }
  }

  // Extract or generate custom ID
  let customId: string;
  const customIdProp = options.properties.get('custom_id');
  if (customIdProp && isString(customIdProp)) {
    customId = customIdProp.value;
  } else {
    customId = generateCustomId('button');
  }

  // Extract emoji
  const emojiProp = options.properties.get('emoji');
  const emoji = (emojiProp && isString(emojiProp)) ? emojiProp.value : undefined;

  // Extract disabled
  const disabledProp = options.properties.get('disabled');
  const disabled = (disabledProp && 'value' in disabledProp) ? Boolean(disabledProp.value) : false;

  // Extract URL for link buttons
  const urlProp = options.properties.get('url');
  const url = (urlProp && isString(urlProp)) ? urlProp.value : undefined;

  if (style === ButtonStyle.Link && !url) {
    throw new RuntimeError('URL is required for link-style buttons');
  }

  // Extract state
  const stateProp = options.properties.get('state');
  let state: any = undefined;
  if (stateProp && isObject(stateProp)) {
    // Convert object to plain JS object for serialization
    state = {};
    stateProp.properties.forEach((value, key) => {
      if (isString(value)) {
        state[key] = value.value;
      } else if (isNumber(value)) {
        state[key] = value.value;
      } else if ('value' in value) {
        state[key] = value.value;
      }
    });
  }

  // Create button builder
  const button = new ButtonBuilder()
    .setLabel(label)
    .setStyle(style)
    .setDisabled(disabled);

  // Set custom ID or URL based on style
  if (style === ButtonStyle.Link) {
    button.setURL(url!);
  } else {
    button.setCustomId(customId);

    // Register handler if provided and not a link button
    if (handler) {
      if (!isFunction(handler)) {
        throw new TypeError('Handler must be a function');
      }

      // Store handler function
      handlerFunctions.set(customId, handler);

      // Get handler name
      const handlerName = (handler as any).name || customId;

      // Store handler metadata
      const now = Date.now();
      componentHandlers.set(customId, {
        customId,
        handlerName,
        createdAt: now,
        expiresAt: now + COMPONENT_EXPIRY_MS,
        state,
        type: 'button',
      });

      // Save to storage
      saveHandlersToStorage(componentHandlers);
    }
  }

  // Set emoji if provided
  if (emoji) {
    button.setEmoji(emoji);
  }

  // Return button wrapped in runtime object
  const properties = new Map<string, RuntimeValue>();
  properties.set('custom_id', makeString(customId));
  properties.set('label', makeString(label));
  properties.set('type', makeString('button'));

  // Store raw button builder
  const rawValue: any = { __rawValue: button };
  properties.set('__raw', rawValue as any);

  return makeObject(properties);
});

/**
 * create_persistent_select_menu(options, handler)
 * Create a persistent select menu component
 *
 * Options:
 * - custom_id: Custom ID (optional, auto-generated if not provided)
 * - placeholder: Placeholder text (optional)
 * - min_values: Minimum number of selections (default: 1)
 * - max_values: Maximum number of selections (default: 1)
 * - options: Array of menu options (required)
 *   Each option: { label, value, description?, emoji?, default? }
 * - disabled: Whether menu is disabled (default: false)
 * - state: Serializable state object (optional)
 *
 * Handler: Function called with selected values
 */
export const createPersistentSelectMenu = makeNativeFunction('create_persistent_select_menu', async (args: RuntimeValue[]) => {
  if (args.length < 1 || args.length > 2) {
    throw new RuntimeError(`create_persistent_select_menu() expects 1-2 arguments (options, handler?), got ${args.length}`);
  }

  if (!isObject(args[0])) {
    throw new TypeError('Options must be an object');
  }

  const options = args[0];
  const handler = args.length === 2 ? args[1] : null;

  // Extract or generate custom ID
  let customId: string;
  const customIdProp = options.properties.get('custom_id');
  if (customIdProp && isString(customIdProp)) {
    customId = customIdProp.value;
  } else {
    customId = generateCustomId('select');
  }

  // Extract placeholder
  const placeholderProp = options.properties.get('placeholder');
  const placeholder = (placeholderProp && isString(placeholderProp)) ? placeholderProp.value : 'Select an option';

  // Extract min/max values
  const minValuesProp = options.properties.get('min_values');
  const minValues = (minValuesProp && isNumber(minValuesProp)) ? minValuesProp.value : 1;

  const maxValuesProp = options.properties.get('max_values');
  const maxValues = (maxValuesProp && isNumber(maxValuesProp)) ? maxValuesProp.value : 1;

  // Extract disabled
  const disabledProp = options.properties.get('disabled');
  const disabled = (disabledProp && 'value' in disabledProp) ? Boolean(disabledProp.value) : false;

  // Extract options array
  const optionsProp = options.properties.get('options');
  if (!optionsProp) {
    throw new RuntimeError('Select menu options array is required');
  }

  if (!('elements' in optionsProp)) {
    throw new TypeError('Options must be an array');
  }

  const optionsArray = (optionsProp as any).elements;
  if (optionsArray.length === 0) {
    throw new RuntimeError('Select menu must have at least one option');
  }

  if (optionsArray.length > 25) {
    throw new RuntimeError('Select menu cannot have more than 25 options');
  }

  // Extract state
  const stateProp = options.properties.get('state');
  let state: any = undefined;
  if (stateProp && isObject(stateProp)) {
    state = {};
    stateProp.properties.forEach((value, key) => {
      if (isString(value)) {
        state[key] = value.value;
      } else if (isNumber(value)) {
        state[key] = value.value;
      } else if ('value' in value) {
        state[key] = value.value;
      }
    });
  }

  // Build select menu
  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId(customId)
    .setPlaceholder(placeholder)
    .setMinValues(minValues)
    .setMaxValues(maxValues)
    .setDisabled(disabled);

  // Add options
  const menuOptions: StringSelectMenuOptionBuilder[] = [];
  for (const opt of optionsArray) {
    if (!isObject(opt)) {
      throw new TypeError('Each option must be an object');
    }

    const labelProp = opt.properties.get('label');
    const valueProp = opt.properties.get('value');

    if (!labelProp || !isString(labelProp)) {
      throw new RuntimeError('Option label is required and must be a string');
    }
    if (!valueProp || !isString(valueProp)) {
      throw new RuntimeError('Option value is required and must be a string');
    }

    const optionBuilder = new StringSelectMenuOptionBuilder()
      .setLabel(labelProp.value)
      .setValue(valueProp.value);

    // Optional fields
    const descProp = opt.properties.get('description');
    if (descProp && isString(descProp)) {
      optionBuilder.setDescription(descProp.value);
    }

    const emojiProp = opt.properties.get('emoji');
    if (emojiProp && isString(emojiProp)) {
      optionBuilder.setEmoji(emojiProp.value);
    }

    const defaultProp = opt.properties.get('default');
    if (defaultProp && 'value' in defaultProp) {
      optionBuilder.setDefault(Boolean(defaultProp.value));
    }

    menuOptions.push(optionBuilder);
  }

  selectMenu.addOptions(menuOptions);

  // Register handler if provided
  if (handler) {
    if (!isFunction(handler)) {
      throw new TypeError('Handler must be a function');
    }

    // Store handler function
    handlerFunctions.set(customId, handler);

    // Get handler name
    const handlerName = (handler as any).name || customId;

    // Store handler metadata
    const now = Date.now();
    componentHandlers.set(customId, {
      customId,
      handlerName,
      createdAt: now,
      expiresAt: now + COMPONENT_EXPIRY_MS,
      state,
      type: 'select_menu',
    });

    // Save to storage
    saveHandlersToStorage(componentHandlers);
  }

  // Return select menu wrapped in runtime object
  const properties = new Map<string, RuntimeValue>();
  properties.set('custom_id', makeString(customId));
  properties.set('placeholder', makeString(placeholder));
  properties.set('type', makeString('select_menu'));

  // Store raw select menu builder
  const rawValue: any = { __rawValue: selectMenu };
  properties.set('__raw', rawValue as any);

  return makeObject(properties);
});

/**
 * register_component_handler(custom_id, handler)
 * Manually register a handler for a custom ID
 */
export const registerComponentHandler = makeNativeFunction('register_component_handler', async (args: RuntimeValue[]) => {
  if (args.length !== 2) {
    throw new RuntimeError(`register_component_handler() expects 2 arguments (custom_id, handler), got ${args.length}`);
  }

  if (!isString(args[0])) {
    throw new TypeError('Custom ID must be a string');
  }

  if (!isFunction(args[1])) {
    throw new TypeError('Handler must be a function');
  }

  const customId = args[0].value;
  const handlerFunc = args[1];

  // Store handler function
  handlerFunctions.set(customId, handlerFunc);

  // Get handler name
  const handlerName = (handlerFunc as any).name || customId;

  // Store handler metadata
  const now = Date.now();
  componentHandlers.set(customId, {
    customId,
    handlerName,
    createdAt: now,
    expiresAt: now + COMPONENT_EXPIRY_MS,
    type: 'button', // Default to button, can be overridden
  });

  // Save to storage
  const success = saveHandlersToStorage(componentHandlers);

  return makeBoolean(success);
});

/**
 * unregister_component_handler(custom_id)
 * Remove a component handler
 */
export const unregisterComponentHandler = makeNativeFunction('unregister_component_handler', async (args: RuntimeValue[]) => {
  if (args.length !== 1) {
    throw new RuntimeError(`unregister_component_handler() expects 1 argument (custom_id), got ${args.length}`);
  }

  if (!isString(args[0])) {
    throw new TypeError('Custom ID must be a string');
  }

  const customId = args[0].value;
  const existed = componentHandlers.has(customId);

  componentHandlers.delete(customId);
  handlerFunctions.delete(customId);

  if (existed) {
    saveHandlersToStorage(componentHandlers);
  }

  return makeBoolean(existed);
});

/**
 * get_component_handler(custom_id)
 * Get the handler for a custom ID
 */
export const getComponentHandler = makeNativeFunction('get_component_handler', async (args: RuntimeValue[]) => {
  if (args.length !== 1) {
    throw new RuntimeError(`get_component_handler() expects 1 argument (custom_id), got ${args.length}`);
  }

  if (!isString(args[0])) {
    throw new TypeError('Custom ID must be a string');
  }

  const customId = args[0].value;
  const handlerFunc = handlerFunctions.get(customId);

  if (!handlerFunc) {
    const properties = new Map<string, RuntimeValue>();
    properties.set('type', makeString('null'));
    return makeObject(properties);
  }

  return handlerFunc;
});

/**
 * restore_component_handlers()
 * Load all component handlers from storage
 * Called on bot startup
 */
export const restoreComponentHandlers = makeNativeFunction('restore_component_handlers', async (args: RuntimeValue[]) => {
  if (args.length !== 0) {
    throw new RuntimeError(`restore_component_handlers() expects 0 arguments, got ${args.length}`);
  }

  // Reload from storage
  componentHandlers = loadHandlersFromStorage();

  // Clean up expired ones immediately
  cleanupExpiredComponents();

  return makeNumber(componentHandlers.size);
});

/**
 * save_component_handlers()
 * Save all handlers to persistent storage
 */
export const saveComponentHandlersFunc = makeNativeFunction('save_component_handlers', async (args: RuntimeValue[]) => {
  if (args.length !== 0) {
    throw new RuntimeError(`save_component_handlers() expects 0 arguments, got ${args.length}`);
  }

  const success = saveHandlersToStorage(componentHandlers);
  return makeBoolean(success);
});

/**
 * list_component_handlers()
 * Get all registered component custom IDs
 */
export const listComponentHandlers = makeNativeFunction('list_component_handlers', async (args: RuntimeValue[]) => {
  if (args.length !== 0) {
    throw new RuntimeError(`list_component_handlers() expects 0 arguments, got ${args.length}`);
  }

  const customIds: RuntimeValue[] = [];
  componentHandlers.forEach((_handler, customId) => {
    customIds.push(makeString(customId));
  });

  return makeArray(customIds);
});

/**
 * get_component_state(custom_id)
 * Get the state associated with a component
 */
export const getComponentState = makeNativeFunction('get_component_state', async (args: RuntimeValue[]) => {
  if (args.length !== 1) {
    throw new RuntimeError(`get_component_state() expects 1 argument (custom_id), got ${args.length}`);
  }

  if (!isString(args[0])) {
    throw new TypeError('Custom ID must be a string');
  }

  const customId = args[0].value;
  const handler = componentHandlers.get(customId);

  if (!handler || !handler.state) {
    return makeObject();
  }

  // Convert state back to RuntimeValue object
  const properties = new Map<string, RuntimeValue>();
  Object.entries(handler.state).forEach(([key, value]) => {
    if (typeof value === 'string') {
      properties.set(key, makeString(value));
    } else if (typeof value === 'number') {
      properties.set(key, makeNumber(value));
    } else if (typeof value === 'boolean') {
      properties.set(key, makeBoolean(value));
    }
  });

  return makeObject(properties);
});

/**
 * Handle interaction routing
 * This should be called from the interactionCreate event
 */
export async function routeComponentInteraction(interaction: any): Promise<boolean> {
  // Only handle button and select menu interactions
  if (!interaction.isButton() && !interaction.isStringSelectMenu()) {
    return false;
  }

  const customId = interaction.customId;
  const handler = handlerFunctions.get(customId);

  if (!handler) {
    // No handler found
    return false;
  }

  try {
    // Get handler metadata for state
    const handlerMetadata = componentHandlers.get(customId);
    const state = handlerMetadata?.state;

    // Create interaction object for handler
    const properties = new Map<string, RuntimeValue>();
    properties.set('custom_id', makeString(customId));
    properties.set('user_id', makeString(interaction.user.id));
    properties.set('channel_id', makeString(interaction.channelId));
    properties.set('guild_id', makeString(interaction.guildId || ''));

    // Add state if available
    if (state) {
      const stateProps = new Map<string, RuntimeValue>();
      Object.entries(state).forEach(([key, value]) => {
        if (typeof value === 'string') {
          stateProps.set(key, makeString(value));
        } else if (typeof value === 'number') {
          stateProps.set(key, makeNumber(value));
        } else if (typeof value === 'boolean') {
          stateProps.set(key, makeBoolean(value));
        }
      });
      properties.set('state', makeObject(stateProps));
    }

    // Add values for select menus
    if (interaction.isStringSelectMenu()) {
      const values = interaction.values.map((v: string) => makeString(v));
      properties.set('values', makeArray(values));
    }

    // Store raw interaction
    const rawValue: any = { __rawValue: interaction };
    properties.set('__raw', rawValue as any);

    const interactionObj = makeObject(properties);

    // Call handler - supports both native and user-defined functions
    // Cast to any to bypass type checking since we handle both function types
    await (handler as any).call([interactionObj], null);

    return true;
  } catch (error) {
    console.error(`Error handling component interaction ${customId}:`, error);
    return false;
  }
}

// Export all persistent component functions
export const persistentComponentBuiltins = {
  create_persistent_button: createPersistentButton,
  create_persistent_select_menu: createPersistentSelectMenu,
  register_component_handler: registerComponentHandler,
  unregister_component_handler: unregisterComponentHandler,
  get_component_handler: getComponentHandler,
  restore_component_handlers: restoreComponentHandlers,
  save_component_handlers: saveComponentHandlersFunc,
  list_component_handlers: listComponentHandlers,
  get_component_state: getComponentState,
};

// Export for interaction routing
export { handlerFunctions, componentHandlers };
