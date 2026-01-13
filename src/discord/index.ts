/**
 * Discord.js integration for EzLang
 * Manages Discord bot lifecycle and event handling
 */

import { Client, GatewayIntentBits } from 'discord.js';
import { RuntimeError } from '../utils/errors';
import { logger } from '../utils/logger';

/**
 * DiscordManager - Manages Discord.js Client lifecycle
 *
 * This class handles:
 * - Bot initialization with proper intents
 * - Starting and stopping the bot
 * - Event handler registration
 * - Client instance management
 */
export class DiscordManager {
  private client: Client | null = null;
  private token: string | null = null;
  private eventHandlers: Map<string, Function[]> = new Map();
  private ready: boolean = false;

  /**
   * Initialize the Discord client with the bot token
   * @param token - Discord bot token
   */
  initialize(token: string): void {
    if (!token || token.trim() === '') {
      throw new RuntimeError('Invalid Discord token: token cannot be empty');
    }

    this.token = token;

    // Create Discord client with comprehensive intents for full Discord API v14 support
    this.client = new Client({
      intents: [
        // Core intents
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent, // Required for reading message content
        GatewayIntentBits.DirectMessages,

        // Member and presence intents
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,

        // Interaction intents
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.DirectMessageTyping,

        // Voice intents
        GatewayIntentBits.GuildVoiceStates,

        // Integration intents
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.GuildInvites,

        // Moderation intents
        GatewayIntentBits.GuildModeration, // Replaces deprecated GuildBans

        // Emoji and sticker intents
        GatewayIntentBits.GuildEmojisAndStickers,

        // Scheduled event intents
        GatewayIntentBits.GuildScheduledEvents,

        // AutoMod intents
        GatewayIntentBits.AutoModerationConfiguration,
        GatewayIntentBits.AutoModerationExecution,
      ],
    });

    // Setup ready event listener
    this.client.once('ready', () => {
      this.ready = true;
      logger.info(`Discord bot logged in as ${this.client?.user?.tag}`);

      // Execute ready event handlers
      this.executeEventHandlers('ready', this.client);
    });

    // Setup error handler
    this.client.on('error', (error) => {
      logger.error(`Discord client error: ${error.message}`);
    });

    logger.debug('Discord client initialized');
  }

  /**
   * Start the Discord bot
   * @throws RuntimeError if bot is not initialized or login fails
   */
  async start(): Promise<void> {
    if (!this.client) {
      throw new RuntimeError('Discord bot not initialized. Call initialize(token) first.');
    }

    if (!this.token) {
      throw new RuntimeError('No Discord token provided');
    }

    try {
      logger.info('Logging in to Discord...');
      await this.client.login(this.token);
      logger.info('Discord bot login successful');
    } catch (error) {
      // Provide helpful error messages for common issues
      const isError = error instanceof Error;
      const errorCode = isError && 'code' in error ? (error as Error & { code: string }).code : null;
      const errorMessage = isError ? error.message : String(error);

      if (errorCode === 'TokenInvalid') {
        throw new RuntimeError('Invalid Discord token. Please check your bot token.');
      } else if (errorCode === 'DisallowedIntents') {
        throw new RuntimeError(
          'Missing required intents. Enable "Message Content Intent" in Discord Developer Portal.'
        );
      } else {
        throw new RuntimeError(`Failed to login to Discord: ${errorMessage}`);
      }
    }
  }

  /**
   * Stop the Discord bot and cleanup
   */
  async stop(): Promise<void> {
    if (this.client) {
      logger.info('Stopping Discord bot...');
      await this.client.destroy();
      this.client = null;
      this.ready = false;
      this.eventHandlers.clear();
      logger.info('Discord bot stopped');
    }
  }

  /**
   * Get the Discord client instance
   * @throws RuntimeError if client is not initialized
   */
  getClient(): Client {
    if (!this.client) {
      throw new RuntimeError('Discord bot not initialized');
    }
    return this.client;
  }

  /**
   * Register an event handler for a Discord event
   * @param event - Event name (e.g., 'messageCreate', 'ready')
   * @param handler - Function to call when event occurs
   */
  registerEventHandler(event: string, handler: Function): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }

    this.eventHandlers.get(event)!.push(handler);
    logger.debug(`Registered event handler for '${event}'`);

    // If client is initialized, setup the event listener
    if (this.client && event !== 'ready') {
      this.setupEventListener(event);
    }
  }

  /**
   * Check if the bot is ready
   */
  isReady(): boolean {
    return this.ready;
  }

  /**
   * Get all registered event handlers for an event
   */
  getEventHandlers(event: string): Function[] {
    return this.eventHandlers.get(event) || [];
  }

  /**
   * Setup an event listener on the Discord client
   * @param event - Event name
   */
  private setupEventListener(event: string): void {
    if (!this.client) return;

    // Only setup once per event
    const handlers = this.eventHandlers.get(event);
    if (!handlers || handlers.length === 0) return;

    // Setup the event listener
    this.client.on(event, (...args: unknown[]) => {
      void this.executeEventHandlers(event, ...args);
    });

    logger.debug(`Setup Discord event listener for '${event}'`);
  }

  /**
   * Execute all handlers for an event
   * @param event - Event name
   * @param args - Event arguments
   */
  private async executeEventHandlers(event: string, ...args: unknown[]): Promise<void> {
    const handlers = this.eventHandlers.get(event);
    if (!handlers || handlers.length === 0) {
      return;
    }

    for (const handler of handlers) {
      try {
        await handler(...args);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(`Error in ${event} handler: ${errorMessage}`);
      }
    }
  }
}
