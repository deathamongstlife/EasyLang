#!/usr/bin/env node

/**
 * Main entry point for EzLang CLI
 */

import { CLI } from './cli/index';

// Global error handlers
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
  process.exit(1);
});

// Signal handlers for graceful shutdown
process.on('SIGINT', () => {
  console.log('\nGoodbye!');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nGoodbye!');
  process.exit(0);
});

// Start CLI
const cli = new CLI();
cli.start().catch((error) => {
  console.error('Fatal error:', error.message);
  process.exit(1);
});
