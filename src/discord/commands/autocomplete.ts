/**
 * Slash Command Autocomplete Support
 * Provides autocomplete functionality for slash commands
 */

import {
  AutocompleteInteraction,
  ApplicationCommandOptionChoiceData,
} from 'discord.js';
import { RuntimeValue, makeNativeFunction, makeBoolean, makeRuntimeObject, makeString, isString, isArray, isObject } from '../../core/runtime/values';
import { RuntimeError, TypeError } from '../../utils/errors';

// Global storage for autocomplete handlers
const autocompleteHandlers = new Map<string, (interaction: AutocompleteInteraction) => Promise<void>>();

/**
 * Register an autocomplete handler for a specific command
 */
export const registerAutocompleteHandler = makeNativeFunction('register_autocomplete', async (args: RuntimeValue[]) => {
  if (args.length !== 2) {
    throw new RuntimeError('register_autocomplete() expects 2 arguments: command_name, handler_function');
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
  const wrapper = async (interaction: AutocompleteInteraction) => {
    try {
      // Convert interaction to RuntimeValue
      const interactionValue = makeRuntimeObject([
        ['command_name', makeString(interaction.commandName)],
        ['focused_option', makeString(interaction.options.getFocused(true).name)],
        ['focused_value', makeString(interaction.options.getFocused() as string)],
        ['user_id', makeString(interaction.user.id)],
        ['guild_id', makeString(interaction.guildId || '')],
        ['channel_id', makeString(interaction.channelId)],
      ]);

      // Call the EzLang handler function
      if (handlerFn.type === 'native-function') {
        await (handlerFn as any).call([interactionValue]);
      }
    } catch (error) {
      console.error('Autocomplete handler error:', error);
    }
  };

  autocompleteHandlers.set(commandName, wrapper);
  return makeBoolean(true);
});

/**
 * Respond to an autocomplete interaction with choices
 */
export const respondAutocomplete = makeNativeFunction('respond_autocomplete', async (args: RuntimeValue[]) => {
  if (args.length !== 2) {
    throw new RuntimeError('respond_autocomplete() expects 2 arguments: interaction, choices_array');
  }

  if (!isObject(args[0])) {
    throw new TypeError('First argument must be an interaction object');
  }

  if (!isArray(args[1])) {
    throw new TypeError('Choices must be an array');
  }

  // Extract choices from the array
  const choicesArray = (args[1] as any).elements;
  const choices: ApplicationCommandOptionChoiceData[] = [];

  for (const choice of choicesArray) {
    if (!isObject(choice)) {
      throw new TypeError('Each choice must be an object with name and value');
    }

    const props = (choice as any).properties;
    const name = props.get('name');
    const value = props.get('value');

    if (!name || !value) {
      throw new TypeError('Each choice must have name and value properties');
    }

    choices.push({
      name: isString(name) ? (name as any).value : String(name),
      value: isString(value) ? (value as any).value : (value as any).value,
    });
  }

  // Note: In actual implementation, the interaction object would need to store
  // the actual Discord.js interaction instance. This is a simplified version.
  return makeBoolean(true);
});

/**
 * Handle autocomplete interactions from Discord
 */
export function handleAutocompleteInteraction(interaction: AutocompleteInteraction): void {
  const handler = autocompleteHandlers.get(interaction.commandName);
  if (handler) {
    handler(interaction).catch(error => {
      console.error(`Autocomplete handler error for ${interaction.commandName}:`, error);
    });
  }
}

/**
 * Get all registered autocomplete handlers
 */
export function getAutocompleteHandlers(): Map<string, (interaction: AutocompleteInteraction) => Promise<void>> {
  return autocompleteHandlers;
}

/**
 * Clear all autocomplete handlers
 */
export function clearAutocompleteHandlers(): void {
  autocompleteHandlers.clear();
}
