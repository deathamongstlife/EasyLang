/**
 * REPL (Read-Eval-Print Loop) for EzLang
 * Interactive shell for executing EzLang code
 */

import * as readline from 'readline';
import chalk from 'chalk';
import { Lexer } from '../lexer';
import { Parser } from '../parser';
import { Runtime } from '../runtime';
import { RuntimeValue, valueToString } from '../runtime/values';
import { HistoryManager } from './history';
import { LexerError, ParserError, RuntimeError } from '../utils/errors';

export class REPL {
  private runtime: Runtime;
  private lexer: Lexer;
  private parser: Parser;
  private history: HistoryManager;
  private multilineBuffer: string[] = [];
  private inMultilineMode: boolean = false;
  private rl: readline.Interface;
  private processing: boolean = false;
  private lineQueue: string[] = [];

  constructor() {
    // Initialize with empty program
    this.lexer = new Lexer('');
    this.parser = new Parser([]);
    this.runtime = new Runtime({ type: 'Program', body: [] });
    this.history = new HistoryManager();

    // Create readline interface
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: this.showPrompt(),
      historySize: 1000,
    });
  }

  /**
   * Start the REPL
   */
  async start(): Promise<void> {
    this.showWelcome();
    this.history.load();

    // Check if stdin is a TTY (interactive terminal)
    const isInteractive = process.stdin.isTTY;

    // Setup readline handlers
    this.rl.on('line', (line: string) => {
      // Queue the line for processing
      this.lineQueue.push(line);
      this.processQueue(isInteractive);
    });

    this.rl.on('close', () => {
      console.log(chalk.cyan('\nGoodbye!'));
      this.history.save();
      process.exit(0);
    });

    // Handle Ctrl+C (only in interactive mode)
    if (isInteractive) {
      this.rl.on('SIGINT', () => {
        if (this.inMultilineMode) {
          // Cancel multiline mode
          this.inMultilineMode = false;
          this.multilineBuffer = [];
          console.log(chalk.yellow('\nMultiline input cancelled'));
          this.rl.setPrompt(this.showPrompt());
          this.rl.prompt();
        } else {
          // Exit REPL
          this.rl.close();
        }
      });
    }

    // Show initial prompt only in interactive mode
    if (isInteractive) {
      this.rl.prompt();
    }
  }

  /**
   * Process queued lines one at a time
   */
  private async processQueue(isInteractive: boolean): Promise<void> {
    if (this.processing) {
      return;
    }

    this.processing = true;

    while (this.lineQueue.length > 0) {
      const line = this.lineQueue.shift()!;
      await this.processLine(line);
    }

    this.processing = false;

    // Show prompt after processing all queued lines
    if (isInteractive) {
      this.rl.setPrompt(this.showPrompt());
      this.rl.prompt();
    }
  }

  /**
   * Process a single line of input
   */
  private async processLine(line: string): Promise<void> {
    const trimmedLine = line.trim();

    // Handle special commands
    if (trimmedLine.startsWith('.')) {
      this.handleSpecialCommand(trimmedLine);
      return;
    }

    // Skip empty lines
    if (trimmedLine === '') {
      return;
    }

    // Check for multiline input
    if (this.inMultilineMode) {
      this.multilineBuffer.push(line);

      // Check if we should exit multiline mode
      if (this.shouldExitMultilineMode(line)) {
        const code = this.multilineBuffer.join('\n');
        this.multilineBuffer = [];
        this.inMultilineMode = false;
        this.history.add(code);
        await this.evaluateCode(code);
      }
      return;
    }

    // Check if we should enter multiline mode
    if (this.shouldEnterMultilineMode(trimmedLine)) {
      this.inMultilineMode = true;
      this.multilineBuffer = [line];
      return;
    }

    // Single line execution
    this.history.add(line);
    await this.evaluateCode(line);
  }

  /**
   * Check if we should enter multiline mode
   */
  private shouldEnterMultilineMode(line: string): boolean {
    // Enter multiline mode for function declarations, if statements, loops, etc.
    const multilineKeywords = [
      'function',
      'if',
      'else',
      'while',
      'for',
      'listen',
    ];

    // Check if line starts with multiline keyword
    for (const keyword of multilineKeywords) {
      if (line.startsWith(keyword + ' ') || line === keyword) {
        return true;
      }
    }

    // Check for unclosed braces
    const openBraces = (line.match(/{/g) || []).length;
    const closeBraces = (line.match(/}/g) || []).length;

    return openBraces > closeBraces;
  }

  /**
   * Check if we should exit multiline mode
   */
  private shouldExitMultilineMode(_line: string): boolean {
    const code = this.multilineBuffer.join('\n');
    const openBraces = (code.match(/{/g) || []).length;
    const closeBraces = (code.match(/}/g) || []).length;

    return openBraces === closeBraces && openBraces > 0;
  }

  /**
   * Evaluate EzLang code
   */
  private async evaluateCode(code: string): Promise<void> {
    try {
      // Tokenize
      this.lexer = new Lexer(code);
      const tokens = this.lexer.tokenize();

      // Parse
      this.parser = new Parser(tokens);
      const program = this.parser.parse();

      // Execute each statement and display result
      for (const statement of program.body) {
        const result = await this.runtime['evaluateStatement'](
          statement,
          this.runtime['globalEnv']
        );

        // Display result (except for null/undefined)
        if (result.type !== 'null') {
          this.displayResult(result);
        }
      }
    } catch (error) {
      this.displayError(error as Error);
    }
  }

  /**
   * Handle special REPL commands
   */
  private handleSpecialCommand(command: string): void {
    const parts = command.split(' ');
    const cmd = parts[0];

    switch (cmd) {
      case '.help':
        this.showHelp();
        break;

      case '.clear':
        console.clear();
        this.showWelcome();
        break;

      case '.vars':
        this.showVariables();
        break;

      case '.history':
        this.showHistory();
        break;

      case '.exit':
      case '.quit':
        this.rl.close();
        break;

      default:
        console.log(chalk.red(`Unknown command: ${cmd}`));
        console.log(chalk.gray('Type .help for available commands'));
    }
  }

  /**
   * Display result of evaluation
   */
  private displayResult(value: RuntimeValue): void {
    const str = valueToString(value);

    // Color-code based on type
    switch (value.type) {
      case 'number':
        console.log(chalk.yellow(str));
        break;
      case 'string':
        console.log(chalk.green(str));
        break;
      case 'boolean':
        console.log(chalk.blue(str));
        break;
      case 'array':
        console.log(chalk.magenta(str));
        break;
      case 'function':
      case 'native-function':
        console.log(chalk.cyan(str));
        break;
      default:
        console.log(chalk.gray(str));
    }
  }

  /**
   * Display error message
   */
  private displayError(error: Error): void {
    if (error instanceof LexerError || error instanceof ParserError || error instanceof RuntimeError) {
      console.log(chalk.red(error.formatError()));
    } else {
      console.log(chalk.red(`Error: ${error.message}`));
    }
  }

  /**
   * Show welcome message
   */
  private showWelcome(): void {
    console.log(chalk.bold.cyan('Welcome to EzLang REPL v1.0.0'));
    console.log(chalk.gray('Type .help for commands, .exit to quit\n'));
  }

  /**
   * Show help message
   */
  private showHelp(): void {
    console.log(chalk.bold('\nEzLang REPL Commands:'));
    console.log(chalk.cyan('  .help     ') + chalk.gray('- Show this help message'));
    console.log(chalk.cyan('  .clear    ') + chalk.gray('- Clear the screen'));
    console.log(chalk.cyan('  .vars     ') + chalk.gray('- Show all defined variables'));
    console.log(chalk.cyan('  .history  ') + chalk.gray('- Show command history'));
    console.log(chalk.cyan('  .exit     ') + chalk.gray('- Exit the REPL'));
    console.log(chalk.cyan('  .quit     ') + chalk.gray('- Exit the REPL'));
    console.log();
  }

  /**
   * Show all variables in the current environment
   */
  private showVariables(): void {
    const env = this.runtime['globalEnv'];
    const vars = env.getAll();

    if (Object.keys(vars).length === 0) {
      console.log(chalk.gray('No variables defined'));
      return;
    }

    console.log(chalk.bold('\nDefined Variables:'));
    for (const [name, value] of Object.entries(vars)) {
      const valueStr = valueToString(value);
      console.log(chalk.cyan(`  ${name}`) + chalk.gray(' = ') + chalk.yellow(valueStr));
    }
    console.log();
  }

  /**
   * Show command history
   */
  private showHistory(): void {
    const history = this.history.getAll();

    if (history.length === 0) {
      console.log(chalk.gray('No command history'));
      return;
    }

    console.log(chalk.bold('\nCommand History:'));
    const displayCount = Math.min(20, history.length);
    const startIndex = history.length - displayCount;

    for (let i = startIndex; i < history.length; i++) {
      console.log(chalk.gray(`  ${i + 1}: `) + chalk.white(history[i]));
    }
    console.log();
  }

  /**
   * Get the current prompt string
   */
  private showPrompt(): string {
    if (this.inMultilineMode) {
      return chalk.gray('... ');
    }
    return chalk.green('> ');
  }
}
