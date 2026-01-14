/**
 * Built-in functions for EzLang
 */

import { Environment } from './environment';
import {
  RuntimeValue,
  makeNumber,
  makeString,
  makeNull,
  makeArray,
  makeBoolean,
  makeNativeFunction,
  isString,
  isArray,
  isNumber,
  valueToString,
} from './values';
import { RuntimeError, TypeError } from '../utils/errors';
import { DiscordManager } from '../discord';
import {
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ChannelType,
  ActivityType,
  UserSelectMenuBuilder,
  RoleSelectMenuBuilder,
  ChannelSelectMenuBuilder,
} from 'discord.js';
import { discordBuiltins } from './discord-builtins';
import { advancedDiscordBuiltins } from './discord-advanced';

/**
 * print(...args) - Print values to console
 */
const printFunction = makeNativeFunction('print', async (args: RuntimeValue[]) => {
  const output = args.map(valueToString).join(' ');
  console.log(output);
  return makeNull();
});

/**
 * length(collection) - Get length of string or array
 */
const lengthFunction = makeNativeFunction('length', async (args: RuntimeValue[]) => {
  if (args.length !== 1) {
    throw new RuntimeError(`length() expects 1 argument, got ${args.length}`);
  }

  const arg = args[0];
  if (isString(arg)) {
    return makeNumber(arg.value.length);
  }
  if (isArray(arg)) {
    return makeNumber(arg.elements.length);
  }

  throw new TypeError(`length() expects a string or array, got ${arg.type}`);
});

/**
 * random(min, max) - Generate random number between min and max (inclusive)
 * random() - Generate random number between 0 and 1
 */
const randomFunction = makeNativeFunction('random', async (args: RuntimeValue[]) => {
  if (args.length === 0) {
    // random() - return 0 to 1
    return makeNumber(Math.random());
  }

  if (args.length === 2) {
    // random(min, max)
    const minArg = args[0];
    const maxArg = args[1];

    if (!isNumber(minArg) || !isNumber(maxArg)) {
      throw new TypeError('random(min, max) expects two numbers');
    }

    const min = minArg.value;
    const max = maxArg.value;
    const randomValue = Math.floor(Math.random() * (max - min + 1)) + min;
    return makeNumber(randomValue);
  }

  throw new RuntimeError(`random() expects 0 or 2 arguments, got ${args.length}`);
});

/**
 * wait(seconds) - Async delay
 */
const waitFunction = makeNativeFunction('wait', async (args: RuntimeValue[]) => {
  if (args.length !== 1) {
    throw new RuntimeError(`wait() expects 1 argument, got ${args.length}`);
  }

  const arg = args[0];
  if (!isNumber(arg)) {
    throw new TypeError(`wait() expects a number, got ${arg.type}`);
  }

  const milliseconds = arg.value * 1000;
  await new Promise((resolve) => setTimeout(resolve, milliseconds));
  return makeNull();
});

/**
 * range(start, end) - Generate array of numbers from start to end (exclusive)
 * range(end) - Generate array of numbers from 0 to end (exclusive)
 */
const rangeFunction = makeNativeFunction('range', async (args: RuntimeValue[]) => {
  let start = 0;
  let end = 0;

  if (args.length === 1) {
    // range(end)
    const endArg = args[0];
    if (!isNumber(endArg)) {
      throw new TypeError(`range() expects a number, got ${endArg.type}`);
    }
    end = endArg.value;
  } else if (args.length === 2) {
    // range(start, end)
    const startArg = args[0];
    const endArg = args[1];

    if (!isNumber(startArg) || !isNumber(endArg)) {
      throw new TypeError('range(start, end) expects two numbers');
    }

    start = startArg.value;
    end = endArg.value;
  } else {
    throw new RuntimeError(`range() expects 1 or 2 arguments, got ${args.length}`);
  }

  // Generate array
  const elements: RuntimeValue[] = [];
  for (let i = start; i < end; i++) {
    elements.push(makeNumber(i));
  }

  return makeArray(elements);
});

/**
 * get_argument(name, default) - Get command-line argument
 * Parses command-line arguments in KEY=VALUE format from process.argv
 */
const getArgumentFunction = makeNativeFunction('get_argument', async (args: RuntimeValue[]) => {
  if (args.length < 1 || args.length > 2) {
    throw new RuntimeError(`get_argument() expects 1 or 2 arguments, got ${args.length}`);
  }

  const nameArg = args[0];
  if (!isString(nameArg)) {
    throw new TypeError(`get_argument() expects a string as first argument, got ${nameArg.type}`);
  }

  const key = nameArg.value;
  const defaultValue = args.length === 2 ? args[1] : makeNull();

  // Search through process.argv for KEY=VALUE arguments
  // Skip the first two args (node executable and script path)
  for (let i = 2; i < process.argv.length; i++) {
    const arg = process.argv[i];

    // Check if argument contains '='
    const equalIndex = arg.indexOf('=');
    if (equalIndex === -1) {
      continue; // Skip arguments without '='
    }

    // Split into key and value
    const argKey = arg.substring(0, equalIndex);
    const argValue = arg.substring(equalIndex + 1);

    // Match the key (case-sensitive)
    if (argKey === key) {
      // Return the value, even if it's empty
      return makeString(argValue);
    }
  }

  // Key not found, return default value
  return defaultValue;
});

/**
 * type(value) - Get the type of a value as a string
 */
const typeFunction = makeNativeFunction('type', async (args: RuntimeValue[]) => {
  if (args.length !== 1) {
    throw new RuntimeError(`type() expects 1 argument, got ${args.length}`);
  }

  return makeString(args[0].type);
});

/**
 * str(value) - Convert value to string
 */
const strFunction = makeNativeFunction('str', async (args: RuntimeValue[]) => {
  if (args.length !== 1) {
    throw new RuntimeError(`str() expects 1 argument, got ${args.length}`);
  }

  return makeString(valueToString(args[0]));
});

/**
 * num(value) - Convert value to number
 */
const numFunction = makeNativeFunction('num', async (args: RuntimeValue[]) => {
  if (args.length !== 1) {
    throw new RuntimeError(`num() expects 1 argument, got ${args.length}`);
  }

  const arg = args[0];
  if (isNumber(arg)) {
    return arg;
  }
  if (isString(arg)) {
    const num = parseFloat(arg.value);
    if (isNaN(num)) {
      throw new TypeError(`Cannot convert '${arg.value}' to number`);
    }
    return makeNumber(num);
  }

  throw new TypeError(`Cannot convert ${arg.type} to number`);
});

/**
 * push(array, value) - Add value to end of array (mutates array)
 */
const pushFunction = makeNativeFunction('push', async (args: RuntimeValue[]) => {
  if (args.length !== 2) {
    throw new RuntimeError(`push() expects 2 arguments, got ${args.length}`);
  }

  const arrayArg = args[0];
  const value = args[1];

  if (!isArray(arrayArg)) {
    throw new TypeError(`push() expects an array as first argument, got ${arrayArg.type}`);
  }

  arrayArg.elements.push(value);
  return makeNull();
});

/**
 * pop(array) - Remove and return last element from array (mutates array)
 */
const popFunction = makeNativeFunction('pop', async (args: RuntimeValue[]) => {
  if (args.length !== 1) {
    throw new RuntimeError(`pop() expects 1 argument, got ${args.length}`);
  }

  const arrayArg = args[0];
  if (!isArray(arrayArg)) {
    throw new TypeError(`pop() expects an array, got ${arrayArg.type}`);
  }

  if (arrayArg.elements.length === 0) {
    throw new RuntimeError('Cannot pop from empty array');
  }

  return arrayArg.elements.pop()!;
});

/**
 * starts_with(str, prefix) - Check if string starts with prefix
 */
const startsWithFunction = makeNativeFunction('starts_with', async (args: RuntimeValue[]) => {
  if (args.length !== 2) {
    throw new RuntimeError(`starts_with() expects 2 arguments, got ${args.length}`);
  }
  if (!isString(args[0]) || !isString(args[1])) {
    throw new TypeError('starts_with() expects two strings');
  }
  const str = args[0].value;
  const prefix = args[1].value;
  return makeBoolean(str.startsWith(prefix));
});

/**
 * substr(str, start, end) - Get substring from start to end
 */
const substrFunction = makeNativeFunction('substr', async (args: RuntimeValue[]) => {
  if (args.length !== 3) {
    throw new RuntimeError(`substr() expects 3 arguments, got ${args.length}`);
  }
  if (!isString(args[0]) || !isNumber(args[1]) || !isNumber(args[2])) {
    throw new TypeError('substr() expects (string, number, number)');
  }
  const str = args[0].value;
  const start = args[1].value;
  const end = args[2].value;
  return makeString(str.substring(start, end));
});

/**
 * split(str, delimiter) - Split string by delimiter
 */
const splitFunction = makeNativeFunction('split', async (args: RuntimeValue[]) => {
  if (args.length !== 2) {
    throw new RuntimeError(`split() expects 2 arguments, got ${args.length}`);
  }
  if (!isString(args[0]) || !isString(args[1])) {
    throw new TypeError('split() expects two strings');
  }
  const str = args[0].value;
  const delimiter = args[1].value;
  const parts = str.split(delimiter);
  return makeArray(parts.map(part => makeString(part)));
});

/**
 * append(array, value) - Append value to array (mutates array)
 */
const appendFunction = makeNativeFunction('append', async (args: RuntimeValue[]) => {
  if (args.length !== 2) {
    throw new RuntimeError(`append() expects 2 arguments, got ${args.length}`);
  }
  if (!isArray(args[0])) {
    throw new TypeError('append() expects an array as first argument');
  }
  const arr = args[0].elements;
  arr.push(args[1]);
  return args[0];
});

/**
 * time() - Get current timestamp in milliseconds
 */
const timeFunction = makeNativeFunction('time', async (args: RuntimeValue[]) => {
  if (args.length !== 0) {
    throw new RuntimeError(`time() expects 0 arguments, got ${args.length}`);
  }
  return makeNumber(Date.now());
});

/**
 * Create bot_start function with access to Discord manager and Python bridge
 */
function createBotStartFunction(discordManager: DiscordManager, pythonBridge: any) {
  return makeNativeFunction('bot_start', async (args: RuntimeValue[]) => {
    if (args.length !== 1) {
      throw new RuntimeError(`bot_start() expects 1 argument (token), got ${args.length}`);
    }

    const tokenArg = args[0];
    if (!isString(tokenArg)) {
      throw new TypeError(`bot_start() expects a string token, got ${tokenArg.type}`);
    }

    try {
      // Initialize and start the Discord bot
      discordManager.initialize(tokenArg.value);
      await discordManager.start();

      // Add comprehensive message handler with modern Discord API features
      const client = discordManager.getClient();

      // Handle button, select menu, and modal interactions
      client.on('interactionCreate', async (interaction) => {
        try {
          // Handle Button Interactions
          if (interaction.isButton()) {
            if (interaction.customId === 'button_primary') {
              await interaction.reply({ content: 'You clicked the **Primary** button!', ephemeral: true });
            } else if (interaction.customId === 'button_secondary') {
              await interaction.reply({ content: 'You clicked the **Secondary** button!', ephemeral: true });
            } else if (interaction.customId === 'button_success') {
              await interaction.reply({ content: 'You clicked the **Success** button!', ephemeral: true });
            } else if (interaction.customId === 'button_danger') {
              await interaction.reply({ content: 'You clicked the **Danger** button!', ephemeral: true });
            } else if (interaction.customId === 'modal_trigger') {
              // Open modal when this button is clicked
              const modal = new ModalBuilder()
                .setCustomId('test_modal')
                .setTitle('Feedback Form');

              const nameInput = new TextInputBuilder()
                .setCustomId('name_input')
                .setLabel('What is your name?')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('Enter your name')
                .setRequired(true)
                .setMaxLength(50);

              const feedbackInput = new TextInputBuilder()
                .setCustomId('feedback_input')
                .setLabel('What is your feedback?')
                .setStyle(TextInputStyle.Paragraph)
                .setPlaceholder('Tell us what you think...')
                .setRequired(true)
                .setMinLength(10)
                .setMaxLength(500);

              const firstRow = new ActionRowBuilder<TextInputBuilder>().addComponents(nameInput);
              const secondRow = new ActionRowBuilder<TextInputBuilder>().addComponents(feedbackInput);

              modal.addComponents(firstRow, secondRow);
              await interaction.showModal(modal);
            }
          }

          // Handle Select Menu Interactions
          if (interaction.isStringSelectMenu()) {
            if (interaction.customId === 'test_select') {
              const selected = interaction.values[0];
              const optionLabels: { [key: string]: string } = {
                option1: 'Option 1',
                option2: 'Option 2',
                option3: 'Option 3',
              };
              await interaction.reply({
                content: `You selected: **${optionLabels[selected]}**`,
                ephemeral: true,
              });
            } else if (interaction.customId === 'multi_select') {
              const selected = interaction.values;
              await interaction.reply({
                content: `You selected ${selected.length} option(s): **${selected.join(', ')}**`,
                ephemeral: true,
              });
            }
          }

          // Handle User Select Menu
          if (interaction.isUserSelectMenu()) {
            if (interaction.customId === 'user_select') {
              const users = interaction.values;
              const userTags = users.map(userId => {
                const user = interaction.guild?.members.cache.get(userId);
                return user ? user.user.tag : userId;
              });
              await interaction.reply({
                content: `You selected user(s): **${userTags.join(', ')}**`,
                ephemeral: true,
              });
            }
          }

          // Handle Role Select Menu
          if (interaction.isRoleSelectMenu()) {
            if (interaction.customId === 'role_select') {
              const roles = interaction.values;
              const roleNames = roles.map(roleId => {
                const role = interaction.guild?.roles.cache.get(roleId);
                return role ? role.name : roleId;
              });
              await interaction.reply({
                content: `You selected role(s): **${roleNames.join(', ')}**`,
                ephemeral: true,
              });
            }
          }

          // Handle Channel Select Menu
          if (interaction.isChannelSelectMenu()) {
            if (interaction.customId === 'channel_select') {
              const channels = interaction.values;
              const channelNames = channels.map(channelId => {
                const channel = interaction.guild?.channels.cache.get(channelId);
                return channel ? channel.name : channelId;
              });
              await interaction.reply({
                content: `You selected channel(s): **${channelNames.join(', ')}**`,
                ephemeral: true,
              });
            }
          }

          // Handle Modal Submissions
          if (interaction.isModalSubmit()) {
            if (interaction.customId === 'test_modal') {
              const name = interaction.fields.getTextInputValue('name_input');
              const feedback = interaction.fields.getTextInputValue('feedback_input');

              const embed = new EmbedBuilder()
                .setColor(0x00ff00)
                .setTitle('Feedback Received!')
                .addFields(
                  { name: 'Name', value: name, inline: true },
                  { name: 'Feedback Length', value: `${feedback.length} characters`, inline: true },
                  { name: 'Feedback', value: feedback }
                )
                .setTimestamp();

              await interaction.reply({ embeds: [embed], ephemeral: true });
            }
          }
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          console.error('Interaction error:', errorMsg);
        }
      });

      client.on('messageCreate', async (message) => {
        // Ignore bot messages
        if (message.author.bot) return;

        const content = message.content;
        const prefix = '!';

        if (!content.startsWith(prefix)) return;

        // Simple command router
        const args = content.slice(prefix.length).trim().split(/ +/);
        const command = args.shift()?.toLowerCase();

        try {
          // ==================== BASIC COMMANDS ====================
          if (command === 'ping') {
            await message.reply('🏓 **Pong!**\nBot is online and responsive!');
          }

          else if (command === 'help') {
            const helpEmbed = new EmbedBuilder()
              .setColor(0x5865f2)
              .setTitle('EzLang Bot - Command List')
              .setDescription('Testing all modern Discord.js v14 features')
              .addFields(
                {
                  name: '**Basic Commands**',
                  value: '`!ping` - Test responsiveness\n`!info` - Bot information\n`!dice` - Roll dice\n`!flip` - Flip coin\n`!random` - Random number',
                  inline: false
                },
                {
                  name: '**Discord API Tests**',
                  value: '`!testembed` - Rich embed demo\n`!testbuttons` - Button interactions\n`!testselect` - Select menu demo\n`!testmodal` - Modal form demo\n`!testall` - Combined components',
                  inline: false
                },
                {
                  name: '**Advanced Selects**',
                  value: '`!testuserselect` - User picker\n`!testroleselect` - Role picker\n`!testchannelselect` - Channel picker',
                  inline: false
                },
                {
                  name: '**Package Integration**',
                  value: '`!testmoment` - Date/time with moment.js\n`!testaxios` - HTTP requests with axios\n`!testlodash` - Utilities with lodash\n`!testpython` - Python math module\n`!testrequests` - Python HTTP requests',
                  inline: false
                },
                {
                  name: '**Bot Settings (Admin)**',
                  value: '`!setname <name>` - Change bot name\n`!setstatus <status>` - Set status\n`!setactivity <type> <text>` - Set activity\n`!setavatar <url>` - Change avatar\n`!installjs <pkg>` - Install JS package\n`!installpy <pkg>` - Install Python package',
                  inline: false
                }
              )
              .setFooter({ text: 'Powered by EzLang v1.0' })
              .setTimestamp();

            await message.reply({ embeds: [helpEmbed] });
          }

          else if (command === 'info') {
            const infoEmbed = new EmbedBuilder()
              .setColor(0x57f287)
              .setTitle('Bot Information')
              .setThumbnail(client.user?.displayAvatarURL() || '')
              .addFields(
                { name: 'Bot Name', value: client.user?.tag || 'Unknown', inline: true },
                { name: 'Language', value: 'EzLang v1.0', inline: true },
                { name: 'Runtime', value: 'Node.js', inline: true },
                { name: 'Library', value: 'Discord.js v14.14.1', inline: true },
                { name: 'Servers', value: `${client.guilds.cache.size}`, inline: true },
                { name: 'Users', value: `${client.users.cache.size}`, inline: true }
              )
              .setTimestamp();

            await message.reply({ embeds: [infoEmbed] });
          }

          else if (command === 'dice') {
            const roll = Math.floor(Math.random() * 6) + 1;
            await message.reply(`🎲 You rolled a **${roll}**!`);
          }

          else if (command === 'flip') {
            const flip = Math.random() < 0.5 ? 'Heads' : 'Tails';
            await message.reply(`🪙 Coin flip: **${flip}**!`);
          }

          else if (command === 'random') {
            const num = Math.floor(Math.random() * 100) + 1;
            await message.reply(`🎲 Random number: **${num}**`);
          }

          // ==================== EMBED TEST ====================
          else if (command === 'testembed') {
            const embed = new EmbedBuilder()
              .setColor(0x9b59b6)
              .setTitle('Rich Embed Example')
              .setURL('https://discord.js.org/')
              .setAuthor({
                name: message.author.tag,
                iconURL: message.author.displayAvatarURL(),
              })
              .setDescription('This is a comprehensive example of a Discord embed with all features!')
              .setThumbnail('https://i.imgur.com/AfFp7pu.png')
              .addFields(
                { name: 'Inline Field 1', value: 'This field is inline', inline: true },
                { name: 'Inline Field 2', value: 'This is also inline', inline: true },
                { name: 'Inline Field 3', value: 'Three inline fields!', inline: true },
                { name: 'Regular Field', value: 'This field spans the full width' },
                { name: 'Another Field', value: 'You can add up to 25 fields!' }
              )
              .setImage('https://i.imgur.com/AfFp7pu.png')
              .setTimestamp()
              .setFooter({
                text: 'Footer text here',
                iconURL: 'https://i.imgur.com/AfFp7pu.png',
              });

            await message.reply({ embeds: [embed] });
          }

          // ==================== BUTTON TEST ====================
          else if (command === 'testbuttons') {
            const row1 = new ActionRowBuilder<ButtonBuilder>().addComponents(
              new ButtonBuilder()
                .setCustomId('button_primary')
                .setLabel('Primary')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('🔵'),
              new ButtonBuilder()
                .setCustomId('button_secondary')
                .setLabel('Secondary')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('⚪'),
              new ButtonBuilder()
                .setCustomId('button_success')
                .setLabel('Success')
                .setStyle(ButtonStyle.Success)
                .setEmoji('✅'),
              new ButtonBuilder()
                .setCustomId('button_danger')
                .setLabel('Danger')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('❌')
            );

            const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
              new ButtonBuilder()
                .setLabel('Link Button')
                .setStyle(ButtonStyle.Link)
                .setURL('https://discord.js.org/')
                .setEmoji('🔗')
            );

            const embed = new EmbedBuilder()
              .setColor(0x5865f2)
              .setTitle('Button Interaction Test')
              .setDescription('Click the buttons below to test different button styles!\n\n' +
                '**Button Styles:**\n' +
                '🔵 **Primary** - Blue button\n' +
                '⚪ **Secondary** - Gray button\n' +
                '✅ **Success** - Green button\n' +
                '❌ **Danger** - Red button\n' +
                '🔗 **Link** - Opens URL (no interaction event)');

            await message.reply({
              embeds: [embed],
              components: [row1, row2],
            });
          }

          // ==================== SELECT MENU TEST ====================
          else if (command === 'testselect') {
            const selectMenu = new StringSelectMenuBuilder()
              .setCustomId('test_select')
              .setPlaceholder('Choose an option')
              .addOptions(
                {
                  label: 'Option 1',
                  description: 'This is the first option',
                  value: 'option1',
                  emoji: '1️⃣',
                },
                {
                  label: 'Option 2',
                  description: 'This is the second option',
                  value: 'option2',
                  emoji: '2️⃣',
                },
                {
                  label: 'Option 3',
                  description: 'This is the third option',
                  value: 'option3',
                  emoji: '3️⃣',
                }
              );

            const multiSelectMenu = new StringSelectMenuBuilder()
              .setCustomId('multi_select')
              .setPlaceholder('Choose multiple options')
              .setMinValues(1)
              .setMaxValues(3)
              .addOptions(
                {
                  label: 'Red',
                  value: 'red',
                  emoji: '🔴',
                },
                {
                  label: 'Blue',
                  value: 'blue',
                  emoji: '🔵',
                },
                {
                  label: 'Green',
                  value: 'green',
                  emoji: '🟢',
                }
              );

            const row1 = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);
            const row2 = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(multiSelectMenu);

            const embed = new EmbedBuilder()
              .setColor(0xfee75c)
              .setTitle('Select Menu Test')
              .setDescription('Test both single and multi-select menus!\n\n' +
                '**First Menu:** Single selection\n' +
                '**Second Menu:** Multi-selection (1-3 options)');

            await message.reply({
              embeds: [embed],
              components: [row1, row2],
            });
          }

          // ==================== MODAL TEST ====================
          else if (command === 'testmodal') {
            const button = new ButtonBuilder()
              .setCustomId('modal_trigger')
              .setLabel('Open Feedback Form')
              .setStyle(ButtonStyle.Primary)
              .setEmoji('📝');

            const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);

            const embed = new EmbedBuilder()
              .setColor(0xeb459e)
              .setTitle('Modal Form Test')
              .setDescription('Click the button below to open a modal form!\n\n' +
                'Modals are popup forms that can collect user input with:\n' +
                '• Short text inputs\n' +
                '• Paragraph text inputs\n' +
                '• Required/optional fields\n' +
                '• Min/max length validation');

            await message.reply({
              embeds: [embed],
              components: [row],
            });
          }

          // ==================== COMBINED COMPONENTS TEST ====================
          else if (command === 'testall') {
            const embed = new EmbedBuilder()
              .setColor(0xf1c40f)
              .setTitle('Combined Components Demo')
              .setDescription('This message demonstrates using embeds, buttons, and select menus together!')
              .addFields(
                { name: 'Embeds', value: 'Rich formatted messages with fields, images, and more', inline: false },
                { name: 'Buttons', value: 'Interactive buttons with different styles', inline: true },
                { name: 'Select Menus', value: 'Dropdown menus for user choices', inline: true }
              )
              .setFooter({ text: 'All components working together!' })
              .setTimestamp();

            const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
              new ButtonBuilder()
                .setCustomId('button_primary')
                .setLabel('Click Me!')
                .setStyle(ButtonStyle.Primary),
              new ButtonBuilder()
                .setCustomId('button_success')
                .setLabel('Or Me!')
                .setStyle(ButtonStyle.Success)
            );

            const selectRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
              new StringSelectMenuBuilder()
                .setCustomId('test_select')
                .setPlaceholder('Make a choice...')
                .addOptions(
                  { label: 'Choice A', value: 'option1', emoji: '🅰️' },
                  { label: 'Choice B', value: 'option2', emoji: '🅱️' },
                  { label: 'Choice C', value: 'option3', emoji: '🔤' }
                )
            );

            await message.reply({
              embeds: [embed],
              components: [buttonRow, selectRow],
            });
          }

          // ==================== USER SELECT TEST ====================
          else if (command === 'testuserselect') {
            const userSelect = new UserSelectMenuBuilder()
              .setCustomId('user_select')
              .setPlaceholder('Select users')
              .setMinValues(1)
              .setMaxValues(5);

            const row = new ActionRowBuilder<UserSelectMenuBuilder>().addComponents(userSelect);

            const embed = new EmbedBuilder()
              .setColor(0x3498db)
              .setTitle('User Select Menu Test')
              .setDescription('Select one or more users from the server!\n\n' +
                'This menu only shows server members.');

            await message.reply({
              embeds: [embed],
              components: [row],
            });
          }

          // ==================== ROLE SELECT TEST ====================
          else if (command === 'testroleselect') {
            const roleSelect = new RoleSelectMenuBuilder()
              .setCustomId('role_select')
              .setPlaceholder('Select roles')
              .setMinValues(1)
              .setMaxValues(5);

            const row = new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(roleSelect);

            const embed = new EmbedBuilder()
              .setColor(0xe91e63)
              .setTitle('Role Select Menu Test')
              .setDescription('Select one or more roles from the server!\n\n' +
                'This menu shows all server roles.');

            await message.reply({
              embeds: [embed],
              components: [row],
            });
          }

          // ==================== CHANNEL SELECT TEST ====================
          else if (command === 'testchannelselect') {
            const channelSelect = new ChannelSelectMenuBuilder()
              .setCustomId('channel_select')
              .setPlaceholder('Select channels')
              .setMinValues(1)
              .setMaxValues(5)
              .setChannelTypes(ChannelType.GuildText, ChannelType.GuildVoice, ChannelType.GuildAnnouncement);

            const row = new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(channelSelect);

            const embed = new EmbedBuilder()
              .setColor(0x9b59b6)
              .setTitle('Channel Select Menu Test')
              .setDescription('Select one or more channels from the server!\n\n' +
                'This menu shows text, voice, and announcement channels.');

            await message.reply({
              embeds: [embed],
              components: [row],
            });
          }

          // ==================== PACKAGE INTEGRATION COMMANDS ====================

          // JavaScript Package: moment.js
          else if (command === 'testmoment') {
            try {
              // Try to require moment
              const moment = require('moment');

              const now = moment();
              const tomorrow = moment().add(1, 'day');
              const twoDaysAgo = moment().subtract(2, 'days');
              const birthday = moment('1990-01-01');

              const embed = new EmbedBuilder()
                .setColor(0x00d9ff)
                .setTitle('Moment.js Integration Test')
                .setDescription('Demonstrating date/time manipulation with moment.js')
                .addFields(
                  { name: 'Current Date/Time', value: now.format('LLLL'), inline: false },
                  { name: 'ISO Format', value: now.toISOString(), inline: true },
                  { name: 'Unix Timestamp', value: now.unix().toString(), inline: true },
                  { name: 'Tomorrow', value: tomorrow.format('LL'), inline: false },
                  { name: 'Two Days Ago', value: `${twoDaysAgo.format('LL')} (${twoDaysAgo.fromNow()})`, inline: false },
                  { name: 'Days Since Birthday', value: `${now.diff(birthday, 'days')} days`, inline: true },
                  { name: 'Years Since Birthday', value: `${now.diff(birthday, 'years')} years`, inline: true },
                  { name: 'Timezone', value: moment.tz.guess() || 'UTC', inline: false }
                )
                .setFooter({ text: 'Package: moment.js' })
                .setTimestamp();

              await message.reply({ embeds: [embed] });
            } catch (error) {
              await message.reply('❌ **moment.js not installed!**\n\nInstall it with: `bun add moment`\nThen restart the bot.');
            }
          }

          // JavaScript Package: axios
          else if (command === 'testaxios') {
            try {
              // Try to require axios
              const axios = require('axios');

              await message.reply('Fetching data from GitHub API...');

              // Make API request to GitHub Zen API
              const zenResponse = await axios.get('https://api.github.com/zen');
              const zenQuote = zenResponse.data;

              // Get some GitHub stats
              const octoResponse = await axios.get('https://api.github.com/users/octocat');
              const octoData = octoResponse.data;

              const embed = new EmbedBuilder()
                .setColor(0xff6b6b)
                .setTitle('Axios HTTP Client Test')
                .setDescription('Demonstrating HTTP requests with axios')
                .addFields(
                  { name: 'GitHub Zen Quote', value: `"${zenQuote}"`, inline: false },
                  { name: 'Test API Request', value: 'https://api.github.com/zen', inline: false },
                  { name: 'Response Status', value: `${zenResponse.status} ${zenResponse.statusText}`, inline: true },
                  { name: 'Content Type', value: zenResponse.headers['content-type'] || 'N/A', inline: true },
                  { name: 'Sample User Data', value: `@${octoData.login}`, inline: false },
                  { name: 'User Name', value: octoData.name || 'N/A', inline: true },
                  { name: 'Public Repos', value: octoData.public_repos.toString(), inline: true },
                  { name: 'Followers', value: octoData.followers.toString(), inline: true }
                )
                .setFooter({ text: 'Package: axios' })
                .setTimestamp();

              await message.reply({ embeds: [embed] });
            } catch (error) {
              if ((error as any).code === 'MODULE_NOT_FOUND') {
                await message.reply('❌ **axios not installed!**\n\nInstall it with: `bun add axios`\nThen restart the bot.');
              } else {
                await message.reply(`❌ Error making HTTP request: ${(error as Error).message}`);
              }
            }
          }

          // JavaScript Package: lodash
          else if (command === 'testlodash') {
            try {
              // Try to require lodash
              const _ = require('lodash');

              // Sample data for demonstrations
              const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
              const users = [
                { name: 'Alice', age: 25, active: true },
                { name: 'Bob', age: 30, active: false },
                { name: 'Charlie', age: 25, active: true },
                { name: 'Diana', age: 28, active: true }
              ];
              const nested = { a: { b: { c: 'deep value' } } };

              // Demonstrate various lodash utilities
              const chunked = _.chunk(numbers, 3);
              const sum = _.sum(numbers);
              const average = _.mean(numbers);
              const activeUsers = _.filter(users, { active: true });
              const grouped = _.groupBy(users, 'age');
              const deepValue = _.get(nested, 'a.b.c', 'default');
              const shuffled = _.shuffle([1, 2, 3, 4, 5]);
              const debounceExample = 'Function that waits 300ms after last call';

              const embed = new EmbedBuilder()
                .setColor(0x3492ff)
                .setTitle('Lodash Utility Library Test')
                .setDescription('Demonstrating powerful utility functions with lodash')
                .addFields(
                  { name: 'Array Chunking', value: `${JSON.stringify(chunked)}`, inline: false },
                  { name: 'Sum of Numbers', value: sum.toString(), inline: true },
                  { name: 'Average', value: average.toString(), inline: true },
                  { name: 'Active Users', value: activeUsers.map((u: any) => u.name).join(', '), inline: false },
                  { name: 'Grouped by Age', value: Object.keys(grouped).map(age => `${age}: ${grouped[age].length}`).join(', '), inline: false },
                  { name: 'Deep Object Access', value: `_.get(nested, 'a.b.c') = "${deepValue}"`, inline: false },
                  { name: 'Shuffled Array', value: shuffled.join(', '), inline: true },
                  { name: 'Debounce Available', value: debounceExample, inline: false },
                  { name: 'Other Utilities', value: 'throttle, cloneDeep, merge, omit, pick, uniq, flattenDeep, and 300+ more!', inline: false }
                )
                .setFooter({ text: 'Package: lodash' })
                .setTimestamp();

              await message.reply({ embeds: [embed] });
            } catch (error) {
              await message.reply('❌ **lodash not installed!**\n\nInstall it with: `bun add lodash`\nThen restart the bot.');
            }
          }

          // Python Integration: math module
          else if (command === 'testpython') {
            try {
              // Import Python math module and test functions
              await pythonBridge.importModule('math');

              // Test getting pi constant
              const pi = await pythonBridge.getAttribute('math', ['pi']);

              // Test calling sqrt function
              const sqrtResult = await pythonBridge.callFunction('math', 'sqrt', [144]);

              // Test calling factorial function
              const factorialResult = await pythonBridge.callFunction('math', 'factorial', [5]);

              const embed = new EmbedBuilder()
                .setTitle('🐍 Python Bridge Test')
                .setColor(0x3776AB)
                .addFields(
                  { name: 'Module', value: 'math', inline: true },
                  { name: 'Status', value: '✅ Connected', inline: true },
                  { name: 'math.pi', value: String(pi), inline: false },
                  { name: 'math.sqrt(144)', value: String(sqrtResult), inline: false },
                  { name: 'math.factorial(5)', value: String(factorialResult), inline: false }
                )
                .setFooter({ text: 'Python integration working!' });

              await message.reply({ embeds: [embed] });
            } catch (error: any) {
              await message.reply(`❌ **Python bridge error:**\n\`\`\`\n${error.message}\n\`\`\`\n\nMake sure:\n1. Python 3 is installed\n2. Run: \`pip3 install ipc\` (or use --break-system-packages if needed)\n3. The Python bridge server is accessible`);
            }
          }

          // Python Integration: requests library
          else if (command === 'testrequests') {
            try {
              // Import requests module
              await pythonBridge.importModule('requests');

              // Make a simple GET request to test
              const result = await pythonBridge.callFunction(
                'requests',
                'get',
                ['https://jsonplaceholder.typicode.com/todos/1']
              );

              // Try to get status code
              let statusInfo = 'Request completed';
              try {
                // The result contains response object representation
                if (result && typeof result === 'object' && '__repr__' in result) {
                  statusInfo = result.__repr__;
                }
              } catch (e) {
                // Ignore if we can't get status details
              }

              const embed = new EmbedBuilder()
                .setTitle('🐍 Python Requests Test')
                .setColor(0x3776AB)
                .addFields(
                  { name: 'Module', value: 'requests', inline: true },
                  { name: 'Status', value: '✅ Working', inline: true },
                  { name: 'Test URL', value: 'jsonplaceholder.typicode.com/todos/1', inline: false },
                  { name: 'Response', value: statusInfo, inline: false }
                )
                .setFooter({ text: 'Python requests module working!' });

              await message.reply({ embeds: [embed] });
            } catch (error: any) {
              await message.reply(`❌ **Python requests error:**\n\`\`\`\n${error.message}\n\`\`\`\n\nMake sure:\n1. Python requests is installed: \`pip3 install requests\`\n2. Python bridge is connected (test with \`!testpython\` first)`);
            }
          }

          // ==================== PACKAGE INSTALLATION COMMANDS (ADMIN) ====================

          else if (command === 'installjs') {
            if (!message.member?.permissions.has('Administrator')) {
              await message.reply('❌ You need Administrator permission to use this command!');
              return;
            }

            const packageName = args[0];
            if (!packageName) {
              await message.reply('❌ Please specify a package name!\n\nUsage: `!installjs <package>`\n\nExamples:\n• `!installjs moment`\n• `!installjs axios`\n• `!installjs lodash`');
              return;
            }

            const embed = new EmbedBuilder()
              .setColor(0xffa500)
              .setTitle('JavaScript Package Installation')
              .setDescription(`To install **${packageName}**, run this command in your terminal:`)
              .addFields(
                { name: 'Bun (recommended)', value: `\`\`\`bash\nbun add ${packageName}\n\`\`\``, inline: false },
                { name: 'NPM', value: `\`\`\`bash\nnpm install ${packageName}\n\`\`\``, inline: false },
                { name: 'Yarn', value: `\`\`\`bash\nyarn add ${packageName}\n\`\`\``, inline: false },
                { name: 'After Installation', value: 'Restart the bot to use the new package!', inline: false }
              )
              .setFooter({ text: 'Run the command in your project directory' });

            await message.reply({ embeds: [embed] });
          }

          else if (command === 'installpy') {
            if (!message.member?.permissions.has('Administrator')) {
              await message.reply('❌ You need Administrator permission to use this command!');
              return;
            }

            const packageName = args[0];
            if (!packageName) {
              await message.reply('❌ Please specify a package name!\n\nUsage: `!installpy <package>`\n\nExamples:\n• `!installpy requests`\n• `!installpy numpy`\n• `!installpy pandas`');
              return;
            }

            const embed = new EmbedBuilder()
              .setColor(0x3776ab)
              .setTitle('Python Package Installation')
              .setDescription(`To install **${packageName}**, run this command in your terminal:`)
              .addFields(
                { name: 'pip', value: `\`\`\`bash\npip install ${packageName}\n\`\`\``, inline: false },
                { name: 'pip3', value: `\`\`\`bash\npip3 install ${packageName}\n\`\`\``, inline: false },
                { name: 'Note', value: 'Python bridge must be set up for Python packages to work with EzLang.', inline: false },
                { name: 'After Installation', value: 'The package will be available in your Python environment!', inline: false }
              )
              .setFooter({ text: 'Requires Python 3.x installed' });

            await message.reply({ embeds: [embed] });
          }

          // ==================== BOT PROFILE COMMANDS (ADMIN) ====================
          else if (command === 'setname') {
            if (!message.member?.permissions.has('Administrator')) {
              await message.reply('❌ You need Administrator permission to use this command!');
              return;
            }

            const newName = args.join(' ');
            if (!newName) {
              await message.reply('❌ Please provide a name! Usage: `!setname <name>`');
              return;
            }

            await client.user?.setUsername(newName);
            await message.reply(`✅ Bot name changed to: **${newName}**`);
          }

          else if (command === 'setstatus') {
            if (!message.member?.permissions.has('Administrator')) {
              await message.reply('❌ You need Administrator permission to use this command!');
              return;
            }

            const status = args[0]?.toLowerCase();
            const validStatuses = ['online', 'idle', 'dnd', 'invisible'];

            if (!status || !validStatuses.includes(status)) {
              await message.reply('❌ Invalid status! Use: `online`, `idle`, `dnd`, or `invisible`');
              return;
            }

            await client.user?.setPresence({
              status: status as 'online' | 'idle' | 'dnd' | 'invisible'
            });
            await message.reply(`✅ Status changed to: **${status}**`);
          }

          else if (command === 'setactivity') {
            if (!message.member?.permissions.has('Administrator')) {
              await message.reply('❌ You need Administrator permission to use this command!');
              return;
            }

            const type = args[0]?.toLowerCase();
            const text = args.slice(1).join(' ');

            if (!type || !text) {
              await message.reply('❌ Usage: `!setactivity <type> <text>`\nTypes: playing, watching, listening, competing');
              return;
            }

            const activityTypes: { [key: string]: ActivityType } = {
              playing: ActivityType.Playing,
              watching: ActivityType.Watching,
              listening: ActivityType.Listening,
              competing: ActivityType.Competing,
            };

            if (!activityTypes[type]) {
              await message.reply('❌ Invalid type! Use: `playing`, `watching`, `listening`, or `competing`');
              return;
            }

            await client.user?.setPresence({
              activities: [{ name: text, type: activityTypes[type] }],
            });
            await message.reply(`✅ Activity set to: **${type} ${text}**`);
          }

          else if (command === 'setavatar') {
            if (!message.member?.permissions.has('Administrator')) {
              await message.reply('❌ You need Administrator permission to use this command!');
              return;
            }

            const url = args[0];
            if (!url) {
              await message.reply('❌ Please provide an image URL! Usage: `!setavatar <url>`');
              return;
            }

            try {
              await client.user?.setAvatar(url);
              await message.reply('✅ Avatar updated successfully!');
            } catch (error) {
              await message.reply('❌ Failed to update avatar. Make sure the URL is a valid image!');
            }
          }

        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          await message.reply(`❌ Error: ${errorMsg}`);
        }
      });

      // Keep the process running
      // The bot will run until the process is terminated
      return makeBoolean(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new RuntimeError(`Failed to start bot: ${errorMessage}`);
    }
  });
}

/**
 * Create and populate the global environment with built-in functions
 */
export function createGlobalEnvironment(discordManager: DiscordManager, pythonBridge?: any): Environment {
  const env = new Environment();

  // Register core built-in functions
  env.define('print', printFunction);
  env.define('length', lengthFunction);
  env.define('random', randomFunction);
  env.define('wait', waitFunction);
  env.define('range', rangeFunction);
  env.define('get_argument', getArgumentFunction);
  env.define('type', typeFunction);
  env.define('str', strFunction);
  env.define('num', numFunction);
  env.define('push', pushFunction);
  env.define('pop', popFunction);

  // String and utility functions
  env.define('starts_with', startsWithFunction);
  env.define('substr', substrFunction);
  env.define('split', splitFunction);
  env.define('append', appendFunction);
  env.define('time', timeFunction);

  // Discord bot functions
  env.define('bot_start', createBotStartFunction(discordManager, pythonBridge));

  // Register all Discord API functions from discord-builtins.ts
  Object.entries(discordBuiltins).forEach(([name, func]) => {
    env.define(name, func);
  });

  // Register all advanced Discord functions from discord-advanced.ts
  Object.entries(advancedDiscordBuiltins).forEach(([name, func]) => {
    env.define(name, func);
  });

  return env;
}
