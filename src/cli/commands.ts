/**
 * CLI Command Implementations for EzLang
 */

import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import { Lexer } from '../lexer';
import { Parser } from '../parser';
import { Runtime } from '../runtime';
import { REPL } from '../repl';
import { LexerError, ParserError, RuntimeError } from '../utils/errors';

/**
 * Run an EzLang file
 */
export async function runFile(
  filePath: string,
  _args: Record<string, string> = {}
): Promise<void> {
  try {
    // Resolve file path
    const resolvedPath = path.resolve(filePath);

    // Check if file exists
    if (!fs.existsSync(resolvedPath)) {
      console.error(chalk.red(`Error: File not found: ${filePath}`));
      process.exit(1);
    }

    // Read file content
    const content = fs.readFileSync(resolvedPath, 'utf-8');

    // Tokenize
    console.log(chalk.gray('Tokenizing...'));
    const lexer = new Lexer(content);
    const tokens = lexer.tokenize();

    // Parse
    console.log(chalk.gray('Parsing...'));
    const parser = new Parser(tokens);
    const program = parser.parse();

    // Execute
    console.log(chalk.gray('Executing...\n'));
    const runtime = new Runtime(program, resolvedPath);

    // Make command-line arguments available via get_argument() built-in
    // This would need to be added to the runtime's global environment
    // For now, we'll store them in a way the runtime can access

    await runtime.execute();

    console.log(chalk.green('\n\nExecution completed successfully'));
  } catch (error) {
    if (error instanceof LexerError || error instanceof ParserError || error instanceof RuntimeError) {
      console.error(chalk.red('\n' + error.formatError()));
      process.exit(1);
    } else if (error instanceof Error) {
      console.error(chalk.red(`\nError: ${error.message}`));
      process.exit(1);
    } else {
      console.error(chalk.red('\nUnknown error occurred'));
      process.exit(1);
    }
  }
}

/**
 * Check syntax of an EzLang file without executing it
 */
export async function checkSyntax(filePath: string): Promise<void> {
  try {
    // Resolve file path
    const resolvedPath = path.resolve(filePath);

    // Check if file exists
    if (!fs.existsSync(resolvedPath)) {
      console.error(chalk.red(`Error: File not found: ${filePath}`));
      process.exit(1);
    }

    // Read file content
    const content = fs.readFileSync(resolvedPath, 'utf-8');

    // Tokenize
    console.log(chalk.gray('Tokenizing...'));
    const lexer = new Lexer(content);
    const tokens = lexer.tokenize();

    // Parse
    console.log(chalk.gray('Parsing...'));
    const parser = new Parser(tokens);
    parser.parse();

    console.log(chalk.green('\nSyntax check passed!'));
    console.log(chalk.gray(`File: ${filePath}`));
  } catch (error) {
    if (error instanceof LexerError || error instanceof ParserError) {
      console.error(chalk.red('\n' + error.formatError()));
      process.exit(1);
    } else if (error instanceof Error) {
      console.error(chalk.red(`\nError: ${error.message}`));
      process.exit(1);
    } else {
      console.error(chalk.red('\nUnknown error occurred'));
      process.exit(1);
    }
  }
}

/**
 * Start the interactive REPL
 */
export async function startRepl(): Promise<void> {
  const repl = new REPL();
  await repl.start();
}

/**
 * Show version information
 */
export function showVersion(): void {
  // Read version from package.json
  const packageJsonPath = path.join(__dirname, '../../package.json');

  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    console.log(chalk.cyan(`EzLang v${packageJson.version}`));
    console.log(chalk.gray(packageJson.description));
  } catch (error) {
    console.log(chalk.cyan('EzLang v1.0.0'));
    console.log(chalk.gray('A simple programming language for Discord bot development'));
  }
}

/**
 * Show help information
 */
export function showHelp(): void {
  console.log(chalk.bold.cyan('\nEzLang - A Simple Programming Language\n'));

  console.log(chalk.bold('Usage:'));
  console.log(chalk.gray('  ezlang <command> [options]\n'));

  console.log(chalk.bold('Commands:'));
  console.log(chalk.cyan('  run <file>      ') + chalk.gray('Run an EzLang file'));
  console.log(chalk.cyan('  repl            ') + chalk.gray('Start interactive REPL'));
  console.log(chalk.cyan('  check <file>    ') + chalk.gray('Check syntax without running'));
  console.log(chalk.cyan('  version         ') + chalk.gray('Show version information'));
  console.log(chalk.cyan('  help            ') + chalk.gray('Show this help message\n'));

  console.log(chalk.bold('Examples:'));
  console.log(chalk.gray('  ezlang run hello.ezlang'));
  console.log(chalk.gray('  ezlang repl'));
  console.log(chalk.gray('  ezlang check mybot.ezlang'));
  console.log(chalk.gray('  ezlang version\n'));

  console.log(chalk.bold('REPL Commands:'));
  console.log(chalk.cyan('  .help     ') + chalk.gray('Show REPL help'));
  console.log(chalk.cyan('  .clear    ') + chalk.gray('Clear screen'));
  console.log(chalk.cyan('  .vars     ') + chalk.gray('Show all variables'));
  console.log(chalk.cyan('  .history  ') + chalk.gray('Show command history'));
  console.log(chalk.cyan('  .exit     ') + chalk.gray('Exit REPL\n'));

  console.log(chalk.bold('Documentation:'));
  console.log(chalk.gray('  https://github.com/ezlang/ezlang\n'));
}
