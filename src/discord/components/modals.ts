/**
 * Modal (Form) Components
 * Provides modal dialog functionality for collecting user input
 */

import {
  ModalBuilder,
  TextInputBuilder,
  ActionRowBuilder,
  TextInputStyle,
  ModalSubmitInteraction,
} from 'discord.js';
import { RuntimeValue, makeNativeFunction, makeNull, makeString, makeRuntimeObject, makeObject, isString, isArray, isObject, isNumber } from '../../core/runtime/values';
import { RuntimeError, TypeError } from '../../utils/errors';

/**
 * Create a modal with components
 */
export const createModalWithComponents = makeNativeFunction('create_modal_with_components', async (args: RuntimeValue[]) => {
  if (args.length !== 3) {
    throw new RuntimeError('create_modal_with_components() expects 3 arguments: custom_id, title, components_array');
  }

  if (!isString(args[0]) || !isString(args[1])) {
    throw new TypeError('Custom ID and title must be strings');
  }

  if (!isArray(args[2])) {
    throw new TypeError('Components must be an array');
  }

  const customId = (args[0] as any).value;
  const title = (args[1] as any).value;
  const componentsArray = (args[2] as any).elements;

  const modal = new ModalBuilder()
    .setCustomId(customId)
    .setTitle(title);

  // Process each component
  const actionRows: ActionRowBuilder<TextInputBuilder>[] = [];

  for (const component of componentsArray) {
    if (!isObject(component)) {
      throw new TypeError('Each component must be an object');
    }

    const props = (component as any).properties;
    const type = props.get('type');

    if (!type || !isString(type)) {
      throw new TypeError('Component must have a type property');
    }

    const typeValue = (type as any).value;

    if (typeValue === 'text_input') {
      const customId = props.get('custom_id');
      const label = props.get('label');
      const style = props.get('style');
      const placeholder = props.get('placeholder');
      const required = props.get('required');
      const minLength = props.get('min_length');
      const maxLength = props.get('max_length');
      const value = props.get('value');

      if (!customId || !isString(customId) || !label || !isString(label)) {
        throw new TypeError('Text input must have custom_id and label');
      }

      const textInput = new TextInputBuilder()
        .setCustomId((customId as any).value)
        .setLabel((label as any).value);

      // Set style (short or paragraph)
      if (style && isString(style)) {
        const styleValue = (style as any).value.toLowerCase();
        if (styleValue === 'short') {
          textInput.setStyle(TextInputStyle.Short);
        } else if (styleValue === 'paragraph') {
          textInput.setStyle(TextInputStyle.Paragraph);
        }
      } else {
        textInput.setStyle(TextInputStyle.Short);
      }

      // Set optional properties
      if (placeholder && isString(placeholder)) {
        textInput.setPlaceholder((placeholder as any).value);
      }

      if (required !== undefined) {
        textInput.setRequired(required.type === 'boolean' ? (required as any).value : true);
      }

      if (minLength && isNumber(minLength)) {
        textInput.setMinLength((minLength as any).value);
      }

      if (maxLength && isNumber(maxLength)) {
        textInput.setMaxLength((maxLength as any).value);
      }

      if (value && isString(value)) {
        textInput.setValue((value as any).value);
      }

      // Each text input needs its own action row
      const actionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(textInput);
      actionRows.push(actionRow);
    }
  }

  modal.addComponents(...actionRows);

  // Return modal as an object that can be used with interaction.showModal()
  return makeRuntimeObject([
    ['_modal', { type: 'native', value: modal } as RuntimeValue],
    ['custom_id', makeString(customId)],
    ['title', makeString(title)],
  ]);
});

/**
 * Get field value from a modal submission
 */
export const getModalFieldValue = makeNativeFunction('get_modal_field_value', async (args: RuntimeValue[]) => {
  if (args.length !== 2) {
    throw new RuntimeError('get_modal_field_value() expects 2 arguments: interaction, custom_id');
  }

  if (!isObject(args[0])) {
    throw new TypeError('First argument must be an interaction object');
  }

  if (!isString(args[1])) {
    throw new TypeError('Custom ID must be a string');
  }

  const customId = (args[1] as any).value;

  // In actual implementation, the interaction object would have the Discord.js interaction
  // This is a placeholder that shows the structure
  const interaction = (args[0] as any).properties.get('_interaction');
  if (interaction && interaction.type === 'native') {
    const discordInteraction = interaction.value as ModalSubmitInteraction;
    const value = discordInteraction.fields.getTextInputValue(customId);
    return makeString(value);
  }

  return makeNull();
});

/**
 * Create a text input component for modals
 */
export const createTextInput = makeNativeFunction('create_text_input', async (args: RuntimeValue[]) => {
  if (args.length < 2) {
    throw new RuntimeError('create_text_input() expects at least 2 arguments: custom_id, label');
  }

  if (!isString(args[0]) || !isString(args[1])) {
    throw new TypeError('Custom ID and label must be strings');
  }

  const customId = (args[0] as any).value;
  const label = (args[1] as any).value;

  // Optional parameters as an options object
  let options: Map<string, RuntimeValue> = new Map();
  if (args.length > 2 && isObject(args[2])) {
    options = (args[2] as any).properties;
  }

  // Build the component object
  const componentProps = new Map<string, RuntimeValue>([
    ['type', makeString('text_input')],
    ['custom_id', makeString(customId)],
    ['label', makeString(label)],
  ]);

  // Add optional properties
  const style = options.get('style');
  if (style) componentProps.set('style', style);

  const placeholder = options.get('placeholder');
  if (placeholder) componentProps.set('placeholder', placeholder);

  const required = options.get('required');
  if (required) componentProps.set('required', required);

  const minLength = options.get('min_length');
  if (minLength) componentProps.set('min_length', minLength);

  const maxLength = options.get('max_length');
  if (maxLength) componentProps.set('max_length', maxLength);

  const value = options.get('value');
  if (value) componentProps.set('value', value);

  return makeObject(componentProps);
});

/**
 * Create a short text input (single line)
 */
export const createShortTextInput = makeNativeFunction('create_short_text_input', async (args: RuntimeValue[]) => {
  if (args.length < 2) {
    throw new RuntimeError('create_short_text_input() expects at least 2 arguments: custom_id, label');
  }

  const options = args.length > 2 && isObject(args[2]) ? (args[2] as any).properties : new Map();
  options.set('style', makeString('short'));

  return createTextInput.call([args[0], args[1], makeObject(options)], null as any);
});

/**
 * Create a paragraph text input (multi-line)
 */
export const createParagraphTextInput = makeNativeFunction('create_paragraph_text_input', async (args: RuntimeValue[]) => {
  if (args.length < 2) {
    throw new RuntimeError('create_paragraph_text_input() expects at least 2 arguments: custom_id, label');
  }

  const options = args.length > 2 && isObject(args[2]) ? (args[2] as any).properties : new Map();
  options.set('style', makeString('paragraph'));

  return createTextInput.call([args[0], args[1], makeObject(options)], null as any);
});

/**
 * Helper function to get the actual ModalBuilder from a modal object
 */
export function getModalBuilder(modalObject: RuntimeValue): ModalBuilder | null {
  if (!isObject(modalObject)) {
    return null;
  }

  const modal = (modalObject as any).properties.get('_modal');
  if (modal && modal.type === 'native') {
    return modal.value as ModalBuilder;
  }

  return null;
}
