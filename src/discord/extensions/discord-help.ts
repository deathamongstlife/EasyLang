/**
 * Help Command System for EasyLang
 * Provides automatic help command generation and management
 */

import {
  RuntimeValue,
  makeNativeFunction,
  makeObject,
  makeString,
  makeNumber,
  makeArray,
  isString,
} from '../../core/runtime/values';
import { RuntimeError, TypeError } from '../../utils/errors';
import { EmbedBuilder } from 'discord.js';

/**
 * Command metadata for help system
 */
interface CommandHelp {
  name: string;
  description: string;
  category: string;
  usage: string;
  aliases?: string[];
  examples?: string[];
}

/**
 * Help system configuration
 */
interface HelpConfig {
  footer: string;
  color: number;
  prefix: string;
  title: string;
}

const commandRegistry = new Map<string, CommandHelp>();
const categoryRegistry = new Map<string, string[]>(); // category -> command names
const helpConfig: HelpConfig = {
  footer: 'Use help <command> for more info',
  color: 0x5865f2,
  prefix: '!',
  title: 'Bot Commands',
};

/**
 * register_command(name, description, category, usage, [aliases], [examples])
 * Register command metadata for help system
 */
export const registerCommand = makeNativeFunction('register_command', async (args: RuntimeValue[]) => {
  if (args.length < 4) {
    throw new RuntimeError(`register_command() expects at least 4 arguments (name, description, category, usage), got ${args.length}`);
  }

  if (!isString(args[0]) || !isString(args[1]) || !isString(args[2]) || !isString(args[3])) {
    throw new TypeError('Name, description, category, and usage must be strings');
  }

  const name = args[0].value;
  const description = args[1].value;
  const category = args[2].value;
  const usage = args[3].value;

  const commandHelp: CommandHelp = {
    name,
    description,
    category,
    usage,
  };

  // Optional aliases (array of strings)
  if (args.length > 4 && args[4].type === 'array') {
    const aliasesArray = (args[4] as any).elements;
    commandHelp.aliases = aliasesArray
      .filter((a: RuntimeValue) => isString(a))
      .map((a: RuntimeValue) => (a as any).value);
  }

  // Optional examples (array of strings)
  if (args.length > 5 && args[5].type === 'array') {
    const examplesArray = (args[5] as any).elements;
    commandHelp.examples = examplesArray
      .filter((e: RuntimeValue) => isString(e))
      .map((e: RuntimeValue) => (e as any).value);
  }

  // Register command
  commandRegistry.set(name, commandHelp);

  // Register aliases
  if (commandHelp.aliases) {
    for (const alias of commandHelp.aliases) {
      commandRegistry.set(alias, commandHelp);
    }
  }

  // Add to category
  if (!categoryRegistry.has(category)) {
    categoryRegistry.set(category, []);
  }
  const categoryCommands = categoryRegistry.get(category)!;
  if (!categoryCommands.includes(name)) {
    categoryCommands.push(name);
  }

  return makeString(name);
});

/**
 * generate_help([category])
 * Generate help embed automatically
 * If category provided, show only that category
 * Returns embed object
 */
export const generateHelp = makeNativeFunction('generate_help', async (args: RuntimeValue[]) => {
  const embed = new EmbedBuilder()
    .setColor(helpConfig.color)
    .setTitle(helpConfig.title)
    .setFooter({ text: helpConfig.footer });

  // Filter by category if provided
  let categoriesToShow: string[];
  if (args.length > 0 && isString(args[0])) {
    const requestedCategory = args[0].value;
    if (!categoryRegistry.has(requestedCategory)) {
      throw new RuntimeError(`Category not found: ${requestedCategory}`);
    }
    categoriesToShow = [requestedCategory];
  } else {
    categoriesToShow = Array.from(categoryRegistry.keys());
  }

  // Build fields for each category
  for (const category of categoriesToShow) {
    const commands = categoryRegistry.get(category) || [];
    if (commands.length === 0) continue;

    // Get unique commands (filter out aliases)
    const uniqueCommands = new Set<CommandHelp>();
    for (const cmdName of commands) {
      const cmd = commandRegistry.get(cmdName);
      if (cmd) {
        uniqueCommands.add(cmd);
      }
    }

    // Build command list for this category
    const commandList: string[] = [];
    for (const cmd of uniqueCommands) {
      commandList.push(`\`${helpConfig.prefix}${cmd.name}\` - ${cmd.description}`);
    }

    if (commandList.length > 0) {
      embed.addFields({
        name: `**${category}**`,
        value: commandList.join('\n'),
        inline: false,
      });
    }
  }

  if (embed.data.fields?.length === 0) {
    embed.setDescription('No commands registered yet.');
  }

  // Return embed as object
  const result = new Map<string, RuntimeValue>();
  result.set('_embed', { type: 'native', value: embed } as any);
  result.set('title', makeString(helpConfig.title));
  result.set('category_count', makeNumber(categoriesToShow.length));
  result.set('command_count', makeNumber(commandRegistry.size));

  return makeObject(result);
});

/**
 * get_command_help(command_name)
 * Get detailed help for a specific command
 * Returns embed object with full command information
 */
export const getCommandHelp = makeNativeFunction('get_command_help', async (args: RuntimeValue[]) => {
  if (args.length !== 1) {
    throw new RuntimeError(`get_command_help() expects 1 argument (command_name), got ${args.length}`);
  }

  if (!isString(args[0])) {
    throw new TypeError('Command name must be a string');
  }

  const commandName = args[0].value;
  const command = commandRegistry.get(commandName);

  if (!command) {
    throw new RuntimeError(`Command not found: ${commandName}`);
  }

  const embed = new EmbedBuilder()
    .setColor(helpConfig.color)
    .setTitle(`Help: ${helpConfig.prefix}${command.name}`)
    .setDescription(command.description)
    .addFields(
      { name: 'Category', value: command.category, inline: true },
      { name: 'Usage', value: `\`${helpConfig.prefix}${command.usage}\``, inline: false }
    );

  // Add aliases if present
  if (command.aliases && command.aliases.length > 0) {
    embed.addFields({
      name: 'Aliases',
      value: command.aliases.map(a => `\`${helpConfig.prefix}${a}\``).join(', '),
      inline: false,
    });
  }

  // Add examples if present
  if (command.examples && command.examples.length > 0) {
    embed.addFields({
      name: 'Examples',
      value: command.examples.map(e => `\`${helpConfig.prefix}${e}\``).join('\n'),
      inline: false,
    });
  }

  embed.setFooter({ text: helpConfig.footer });

  // Return embed as object
  const result = new Map<string, RuntimeValue>();
  result.set('_embed', { type: 'native', value: embed } as any);
  result.set('command_name', makeString(command.name));
  result.set('category', makeString(command.category));

  return makeObject(result);
});

/**
 * set_help_footer(text)
 * Customize help footer text
 */
export const setHelpFooter = makeNativeFunction('set_help_footer', async (args: RuntimeValue[]) => {
  if (args.length !== 1) {
    throw new RuntimeError(`set_help_footer() expects 1 argument (text), got ${args.length}`);
  }

  if (!isString(args[0])) {
    throw new TypeError('Footer text must be a string');
  }

  helpConfig.footer = args[0].value;
  return makeString(helpConfig.footer);
});

/**
 * set_help_prefix(prefix)
 * Set command prefix for help display
 */
export const setHelpPrefix = makeNativeFunction('set_help_prefix', async (args: RuntimeValue[]) => {
  if (args.length !== 1) {
    throw new RuntimeError(`set_help_prefix() expects 1 argument (prefix), got ${args.length}`);
  }

  if (!isString(args[0])) {
    throw new TypeError('Prefix must be a string');
  }

  helpConfig.prefix = args[0].value;
  return makeString(helpConfig.prefix);
});

/**
 * set_help_color(color)
 * Set embed color for help (hex number)
 */
export const setHelpColor = makeNativeFunction('set_help_color', async (args: RuntimeValue[]) => {
  if (args.length !== 1) {
    throw new RuntimeError(`set_help_color() expects 1 argument (color), got ${args.length}`);
  }

  if (args[0].type === 'number') {
    helpConfig.color = (args[0] as any).value;
  } else if (isString(args[0])) {
    // Parse hex string
    const hexStr = args[0].value.replace('#', '');
    helpConfig.color = parseInt(hexStr, 16);
  } else {
    throw new TypeError('Color must be a number or hex string');
  }

  return makeNumber(helpConfig.color);
});

/**
 * set_help_title(title)
 * Set help embed title
 */
export const setHelpTitle = makeNativeFunction('set_help_title', async (args: RuntimeValue[]) => {
  if (args.length !== 1) {
    throw new RuntimeError(`set_help_title() expects 1 argument (title), got ${args.length}`);
  }

  if (!isString(args[0])) {
    throw new TypeError('Title must be a string');
  }

  helpConfig.title = args[0].value;
  return makeString(helpConfig.title);
});

/**
 * list_categories()
 * Get all command categories
 * Returns array of category names
 */
export const listCategories = makeNativeFunction('list_categories', async (args: RuntimeValue[]) => {
  if (args.length !== 0) {
    throw new RuntimeError(`list_categories() expects 0 arguments, got ${args.length}`);
  }

  const categories = Array.from(categoryRegistry.keys());
  const categoryArray = categories.map(cat => makeString(cat));

  return makeArray(categoryArray);
});

/**
 * get_category_commands(category)
 * Get all commands in a category
 */
export const getCategoryCommands = makeNativeFunction('get_category_commands', async (args: RuntimeValue[]) => {
  if (args.length !== 1) {
    throw new RuntimeError(`get_category_commands() expects 1 argument (category), got ${args.length}`);
  }

  if (!isString(args[0])) {
    throw new TypeError('Category must be a string');
  }

  const category = args[0].value;
  const commands = categoryRegistry.get(category) || [];

  // Get unique commands (filter out aliases)
  const uniqueCommands = new Set<string>();
  for (const cmdName of commands) {
    const cmd = commandRegistry.get(cmdName);
    if (cmd) {
      uniqueCommands.add(cmd.name);
    }
  }

  const commandArray = Array.from(uniqueCommands).map(name => makeString(name));
  return makeArray(commandArray);
});

/**
 * unregister_command(name)
 * Remove a command from the help registry
 */
export const unregisterCommand = makeNativeFunction('unregister_command', async (args: RuntimeValue[]) => {
  if (args.length !== 1) {
    throw new RuntimeError(`unregister_command() expects 1 argument (name), got ${args.length}`);
  }

  if (!isString(args[0])) {
    throw new TypeError('Command name must be a string');
  }

  const name = args[0].value;
  const command = commandRegistry.get(name);

  if (!command) {
    return makeString('not_found');
  }

  // Remove from registry
  commandRegistry.delete(name);

  // Remove aliases
  if (command.aliases) {
    for (const alias of command.aliases) {
      commandRegistry.delete(alias);
    }
  }

  // Remove from category
  const categoryCommands = categoryRegistry.get(command.category);
  if (categoryCommands) {
    const index = categoryCommands.indexOf(name);
    if (index > -1) {
      categoryCommands.splice(index, 1);
    }
  }

  return makeString('removed');
});

/**
 * get_all_commands()
 * Get all registered commands with their metadata
 */
export const getAllCommands = makeNativeFunction('get_all_commands', async (args: RuntimeValue[]) => {
  if (args.length !== 0) {
    throw new RuntimeError(`get_all_commands() expects 0 arguments, got ${args.length}`);
  }

  const uniqueCommands = new Set<CommandHelp>();
  for (const [, cmd] of commandRegistry) {
    uniqueCommands.add(cmd);
  }

  const commandsArray: RuntimeValue[] = [];
  for (const cmd of uniqueCommands) {
    const cmdObj = new Map<string, RuntimeValue>();
    cmdObj.set('name', makeString(cmd.name));
    cmdObj.set('description', makeString(cmd.description));
    cmdObj.set('category', makeString(cmd.category));
    cmdObj.set('usage', makeString(cmd.usage));

    if (cmd.aliases) {
      cmdObj.set('aliases', makeArray(cmd.aliases.map(a => makeString(a))));
    }

    if (cmd.examples) {
      cmdObj.set('examples', makeArray(cmd.examples.map(e => makeString(e))));
    }

    commandsArray.push(makeObject(cmdObj));
  }

  return makeArray(commandsArray);
});

// Export all help functions
export const helpBuiltins = {
  register_command: registerCommand,
  generate_help: generateHelp,
  get_command_help: getCommandHelp,
  set_help_footer: setHelpFooter,
  set_help_prefix: setHelpPrefix,
  set_help_color: setHelpColor,
  set_help_title: setHelpTitle,
  list_categories: listCategories,
  get_category_commands: getCategoryCommands,
  unregister_command: unregisterCommand,
  get_all_commands: getAllCommands,
};

// Export for testing
export { commandRegistry, categoryRegistry, helpConfig };
