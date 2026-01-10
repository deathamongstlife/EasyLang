/**
 * Simple logger utility for EzLang
 * Uses ANSI color codes for terminal output
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

class Logger {
  private level: LogLevel = LogLevel.INFO;

  /**
   * Set the minimum log level
   */
  setLevel(level: LogLevel): void {
    this.level = level;
  }

  /**
   * Log a debug message
   */
  debug(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.DEBUG) {
      console.log(this.colorize('DEBUG', '\x1b[36m'), message, ...args);
    }
  }

  /**
   * Log an info message
   */
  info(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.INFO) {
      console.log(this.colorize('INFO', '\x1b[32m'), message, ...args);
    }
  }

  /**
   * Log a warning message
   */
  warn(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.WARN) {
      console.warn(this.colorize('WARN', '\x1b[33m'), message, ...args);
    }
  }

  /**
   * Log an error message
   */
  error(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.ERROR) {
      console.error(this.colorize('ERROR', '\x1b[31m'), message, ...args);
    }
  }

  /**
   * Colorize a string with ANSI color codes
   */
  private colorize(label: string, color: string): string {
    const reset = '\x1b[0m';
    return `${color}[${label}]${reset}`;
  }
}

export const logger = new Logger();
