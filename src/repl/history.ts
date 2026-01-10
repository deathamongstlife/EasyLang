/**
 * History Manager for EzLang REPL
 * Manages command history persistence and retrieval
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export class HistoryManager {
  private history: string[] = [];
  private historyFile: string;
  private maxHistory: number;

  constructor(maxHistory: number = 1000) {
    this.maxHistory = maxHistory;
    this.historyFile = path.join(os.homedir(), '.ezlang_history');
  }

  /**
   * Load history from file
   */
  load(): void {
    try {
      if (fs.existsSync(this.historyFile)) {
        const content = fs.readFileSync(this.historyFile, 'utf-8');
        this.history = content
          .split('\n')
          .filter((line) => line.trim() !== '')
          .slice(-this.maxHistory);
      }
    } catch (error) {
      // Silently fail if we can't load history
      console.warn('Failed to load command history');
    }
  }

  /**
   * Save history to file
   */
  save(): void {
    try {
      const content = this.history.slice(-this.maxHistory).join('\n');
      fs.writeFileSync(this.historyFile, content, 'utf-8');
    } catch (error) {
      // Silently fail if we can't save history
      console.warn('Failed to save command history');
    }
  }

  /**
   * Add command to history
   */
  add(command: string): void {
    // Don't add empty commands or duplicates of the last command
    if (command.trim() === '' || command === this.history[this.history.length - 1]) {
      return;
    }

    this.history.push(command);

    // Keep history size under limit
    if (this.history.length > this.maxHistory) {
      this.history = this.history.slice(-this.maxHistory);
    }
  }

  /**
   * Get history entry by index
   */
  get(index: number): string {
    if (index < 0 || index >= this.history.length) {
      return '';
    }
    return this.history[index];
  }

  /**
   * Get all history
   */
  getAll(): string[] {
    return [...this.history];
  }

  /**
   * Search history for matching entries
   */
  search(query: string): string[] {
    const lowerQuery = query.toLowerCase();
    return this.history.filter((entry) => entry.toLowerCase().includes(lowerQuery));
  }

  /**
   * Clear all history
   */
  clear(): void {
    this.history = [];
    try {
      if (fs.existsSync(this.historyFile)) {
        fs.unlinkSync(this.historyFile);
      }
    } catch (error) {
      console.warn('Failed to clear history file');
    }
  }

  /**
   * Get the size of history
   */
  size(): number {
    return this.history.length;
  }
}
