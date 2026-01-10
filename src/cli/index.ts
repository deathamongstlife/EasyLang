/**
 * CLI Framework for EzLang
 * Uses Commander.js for command-line interface
 */

import { Command } from 'commander';
import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import { runFile, checkSyntax, startRepl, showHelp } from './commands';

export class CLI {
  private program: Command;

  constructor() {
    this.program = new Command();
    this.setupCommands();
  }

  /**
   * Setup CLI commands
   */
  private setupCommands(): void {
    // Read package.json for version
    const packageJsonPath = path.join(__dirname, '../../package.json');
    let version = '1.0.0';
    let description = 'A simple programming language for Discord bot development';

    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      version = packageJson.version;
      description = packageJson.description;
    } catch (error) {
      // Use defaults
    }

    // Configure program
    this.program
      .name('ezlang')
      .description(description)
      .version(version, '-v, --version', 'Output the current version')
      .option('-V, --version', 'Output the current version');

    // Version command (explicit)
    this.program
      .command('version')
      .description('Show version information')
      .action(() => {
        console.log(`v${version}`);
      });

    // Run command
    this.program
      .command('run <file>')
      .description('Run an EzLang file')
      .action(async (file: string) => {
        await runFile(file);
      });

    // REPL command
    this.program
      .command('repl')
      .description('Start interactive REPL')
      .action(async () => {
        await startRepl();
      });

    // Check command
    this.program
      .command('check <file>')
      .description('Check syntax without running')
      .action(async (file: string) => {
        await checkSyntax(file);
      });

    // Help command (explicit)
    this.program
      .command('help')
      .description('Show help information')
      .action(() => {
        showHelp();
      });

    // Handle unknown commands
    this.program.on('command:*', (operands) => {
      console.error(chalk.red(`Error: Unknown command '${operands[0]}'`));
      console.log(chalk.gray('\nRun \'ezlang help\' for usage information'));
      process.exit(1);
    });

    // Customize help
    this.program.addHelpText('after', `
${chalk.bold('Examples:')}
  ${chalk.gray('$ ezlang run hello.ezlang')}
  ${chalk.gray('$ ezlang repl')}
  ${chalk.gray('$ ezlang check mybot.ezlang')}

${chalk.bold('Documentation:')}
  ${chalk.gray('https://github.com/ezlang/ezlang')}
`);
  }

  /**
   * Start the CLI
   */
  async start(argv: string[] = process.argv): Promise<void> {
    // If no arguments provided (just 'ezlang'), show help
    if (argv.length <= 2) {
      showHelp();
      return;
    }

    try {
      await this.program.parseAsync(argv);
    } catch (error) {
      if (error instanceof Error) {
        console.error(chalk.red(`Error: ${error.message}`));
      } else {
        console.error(chalk.red('An unknown error occurred'));
      }
      process.exit(1);
    }
  }
}
