/**
 * Python Bridge Manager
 * Manages Python process and provides API for module integration
 */

import { spawn, ChildProcess } from 'child_process';
import { IPCClient } from './ipc';
import { RuntimeError } from '../utils/errors';
import { logger } from '../utils/logger';
import * as path from 'path';
import * as fs from 'fs';

export class PythonBridge {
  private pythonProcess: ChildProcess | null = null;
  private ipcClient: IPCClient;
  private importedModules: Set<string> = new Set();
  private initializationAttempted: boolean = false;
  private initializationFailed: boolean = false;
  private failureReason: string = '';

  constructor() {
    this.ipcClient = new IPCClient();
  }

  /**
   * Initialize the Python bridge
   * Starts Python process and connects IPC
   */
  async initialize(): Promise<void> {
    if (this.initializationAttempted) {
      if (this.initializationFailed) {
        throw new Error(`Python bridge initialization failed: ${this.failureReason}`);
      }
      return;
    }

    this.initializationAttempted = true;

    try {
      // Find Python executable
      const pythonCmd = await this.findPythonExecutable();
      if (!pythonCmd) {
        this.initializationFailed = true;
        this.failureReason = 'Python not found. Please install Python 3.6 or later.';
        logger.warn(this.failureReason);
        return;
      }

      // Get bridge script path
      const bridgeScript = this.getBridgeScriptPath();
      if (!fs.existsSync(bridgeScript)) {
        this.initializationFailed = true;
        this.failureReason = `Python bridge script not found at: ${bridgeScript}`;
        logger.error(this.failureReason);
        return;
      }

      // Start Python process
      logger.debug(`Starting Python bridge with: ${pythonCmd} ${bridgeScript}`);
      this.pythonProcess = spawn(pythonCmd, [bridgeScript], {
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      // Handle process output
      this.pythonProcess.stdout?.on('data', (data) => {
        const output = data.toString().trim();
        if (output) {
          logger.debug(`Python bridge: ${output}`);
        }
      });

      this.pythonProcess.stderr?.on('data', (data) => {
        const error = data.toString().trim();
        if (error) {
          logger.error(`Python bridge error: ${error}`);
        }
      });

      this.pythonProcess.on('exit', (code) => {
        logger.debug(`Python bridge process exited with code ${code}`);
        this.pythonProcess = null;
      });

      // Wait for bridge to start
      await this.waitForBridgeReady();

      // Connect IPC client
      await this.ipcClient.connect();

      logger.info('Python bridge initialized successfully');
    } catch (error) {
      this.initializationFailed = true;
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.failureReason = errorMessage;
      logger.warn(`Python bridge initialization failed: ${errorMessage}`);
      logger.warn('Python integration features will be disabled');
    }
  }

  /**
   * Import a Python module
   */
  async importModule(moduleName: string, autoInstall = true): Promise<void> {
    if (!this.isInitialized()) {
      throw new RuntimeError(
        `Python bridge not available: ${this.failureReason}`,
        undefined,
        undefined
      );
    }

    if (this.importedModules.has(moduleName)) {
      return; // Already imported
    }

    try {
      const response = await this.ipcClient.send('import', {
        module: moduleName,
        auto_install: autoInstall
      });

      if (!response.success) {
        throw new RuntimeError(
          `Failed to import Python module '${moduleName}': ${response.error}`,
          undefined,
          undefined
        );
      }

      this.importedModules.add(moduleName);
      logger.debug(`Imported Python module: ${moduleName}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new RuntimeError(
        `Error importing Python module '${moduleName}': ${errorMessage}`,
        undefined,
        undefined
      );
    }
  }

  /**
   * Install Python package using pip
   */
  async installPackage(packageName: string): Promise<void> {
    if (!this.isInitialized()) {
      throw new RuntimeError(
        `Python bridge not available: ${this.failureReason}`,
        undefined,
        undefined
      );
    }

    try {
      const response = await this.ipcClient.send('install', { package: packageName });

      if (!response.success) {
        throw new RuntimeError(
          `Failed to install Python package '${packageName}': ${response.error}`,
          undefined,
          undefined
        );
      }

      logger.info(`Installed Python package: ${packageName}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new RuntimeError(
        `Error installing Python package '${packageName}': ${errorMessage}`,
        undefined,
        undefined
      );
    }
  }

  /**
   * Create an instance of a Python class
   */
  async createInstance(moduleName: string, className: string, args: unknown[]): Promise<string> {
    if (!this.isInitialized()) {
      throw new RuntimeError(
        `Python bridge not available: ${this.failureReason}`,
        undefined,
        undefined
      );
    }

    try {
      const response = await this.ipcClient.send('create_instance', {
        module: moduleName,
        class: className,
        args: args,
      });

      if (!response.success) {
        throw new RuntimeError(
          `Python error: ${response.error}`,
          undefined,
          undefined
        );
      }

      return response.instance_id;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new RuntimeError(
        `Error creating instance of '${moduleName}.${className}': ${errorMessage}`,
        undefined,
        undefined
      );
    }
  }

  /**
   * Call method on Python instance
   */
  async callMethod(instanceId: string, methodName: string, args: unknown[]): Promise<unknown> {
    if (!this.isInitialized()) {
      throw new RuntimeError(
        `Python bridge not available: ${this.failureReason}`,
        undefined,
        undefined
      );
    }

    try {
      const response = await this.ipcClient.send('call_method', {
        instance_id: instanceId,
        method: methodName,
        args: args,
      });

      if (!response.success) {
        throw new RuntimeError(
          `Python error: ${response.error}`,
          undefined,
          undefined
        );
      }

      return response.result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new RuntimeError(
        `Error calling method '${methodName}': ${errorMessage}`,
        undefined,
        undefined
      );
    }
  }

  /**
   * Get list of imported modules
   */
  getImportedModules(): string[] {
    return Array.from(this.importedModules);
  }

  /**
   * Check if module is imported
   */
  isModuleImported(moduleName: string): boolean {
    return this.importedModules.has(moduleName);
  }

  /**
   * Call a Python function
   */
  async callFunction(moduleName: string, functionName: string, args: unknown[]): Promise<unknown> {
    if (!this.isInitialized()) {
      throw new RuntimeError(
        `Python bridge not available: ${this.failureReason}`,
        undefined,
        undefined
      );
    }

    if (!this.importedModules.has(moduleName)) {
      throw new RuntimeError(
        `Module '${moduleName}' not imported. Use 'use "${moduleName}" as ${moduleName}' first.`,
        undefined,
        undefined
      );
    }

    try {
      const response = await this.ipcClient.send('call', {
        module: moduleName,
        function: functionName,
        args: args,
      });

      if (!response.success) {
        throw new RuntimeError(
          `Python error: ${response.error}`,
          undefined,
          undefined
        );
      }

      return response.result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new RuntimeError(
        `Error calling Python function '${moduleName}.${functionName}': ${errorMessage}`,
        undefined,
        undefined
      );
    }
  }

  /**
   * Get an attribute from a Python module
   */
  async getAttribute(moduleName: string, attrPath: string[]): Promise<any> {
    if (!this.isInitialized()) {
      throw new RuntimeError(
        `Python bridge not available: ${this.failureReason}`,
        undefined,
        undefined
      );
    }

    if (!this.importedModules.has(moduleName)) {
      throw new RuntimeError(
        `Module '${moduleName}' not imported. Use 'use "${moduleName}" as ${moduleName}' first.`,
        undefined,
        undefined
      );
    }

    try {
      const response = await this.ipcClient.send('get', {
        module: moduleName,
        path: attrPath,
      });

      if (!response.success) {
        throw new RuntimeError(
          `Python error: ${response.error}`,
          undefined,
          undefined
        );
      }

      return response.result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new RuntimeError(
        `Error getting Python attribute '${moduleName}.${attrPath.join('.')}': ${errorMessage}`,
        undefined,
        undefined
      );
    }
  }

  /**
   * Cleanup: disconnect IPC and kill Python process
   */
  async cleanup(): Promise<void> {
    logger.debug('Cleaning up Python bridge');

    if (this.ipcClient.isConnected()) {
      this.ipcClient.disconnect();
    }

    if (this.pythonProcess) {
      this.pythonProcess.kill();
      this.pythonProcess = null;
    }

    this.importedModules.clear();
  }

  /**
   * Check if bridge is initialized
   */
  isInitialized(): boolean {
    return (
      this.initializationAttempted &&
      !this.initializationFailed &&
      this.pythonProcess !== null &&
      this.ipcClient.isConnected()
    );
  }

  /**
   * Find Python executable
   */
  private async findPythonExecutable(): Promise<string | null> {
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);

    // Try python3 first, then python
    const commands = ['python3', 'python'];

    for (const cmd of commands) {
      try {
        const { stdout } = await execAsync(`${cmd} --version`);
        if (stdout.includes('Python 3')) {
          return cmd;
        }
      } catch (error) {
        // Command not found, try next
      }
    }

    return null;
  }

  /**
   * Get path to bridge script
   */
  private getBridgeScriptPath(): string {
    // In production, the script is in the installed package
    // In development, it's in the source tree
    const possiblePaths = [
      path.join(__dirname, '../../python-runtime/bridge.py'),
      path.join(process.cwd(), 'python-runtime/bridge.py'),
      path.join(__dirname, '../../../python-runtime/bridge.py'),
    ];

    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        return p;
      }
    }

    // Return first path as fallback (will fail later with better error)
    return possiblePaths[0];
  }

  /**
   * Wait for bridge to be ready
   */
  private async waitForBridgeReady(): Promise<void> {
    return new Promise((resolve, reject) => {
      let output = '';
      const timeout = setTimeout(() => {
        reject(new Error('Python bridge startup timeout'));
      }, 5000);

      const onData = (data: Buffer) => {
        output += data.toString();
        if (output.includes('Python bridge listening')) {
          clearTimeout(timeout);
          this.pythonProcess?.stdout?.off('data', onData);
          resolve();
        }
      };

      this.pythonProcess?.stdout?.on('data', onData);
    });
  }
}
