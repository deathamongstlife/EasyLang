/**
 * IPC Client for communicating with Python bridge
 * Uses node-ipc for inter-process communication
 */

// @ts-ignore - node-ipc doesn't have type definitions
import ipc from 'node-ipc';
import { logger } from '../utils/logger';

export interface IPCResponse {
  success: boolean;
  result?: any;
  error?: string;
}

export class IPCClient {
  private connected: boolean = false;
  private socketName: string;
  private responseCallbacks: Map<string, (data: any) => void> = new Map();
  private messageId: number = 0;

  constructor(socketName: string = 'ezlang-python-bridge') {
    this.socketName = socketName;
    ipc.config.id = 'ezlang';
    ipc.config.retry = 1500;
    ipc.config.silent = true;
  }

  /**
   * Connect to Python bridge
   */
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Connection timeout: Python bridge did not respond'));
      }, 5000);

      ipc.connectTo(this.socketName, () => {
        ipc.of[this.socketName].on('connect', () => {
          clearTimeout(timeout);
          this.connected = true;
          logger.debug('Connected to Python bridge');
          resolve();
        });

        ipc.of[this.socketName].on('disconnect', () => {
          this.connected = false;
          logger.debug('Disconnected from Python bridge');
        });

        ipc.of[this.socketName].on('error', (err: Error) => {
          clearTimeout(timeout);
          logger.error(`IPC error: ${err.message}`);
          reject(err);
        });

        // Handle responses
        ipc.of[this.socketName].on('message', (data: any) => {
          const { id, payload } = data;
          const callback = this.responseCallbacks.get(id);
          if (callback) {
            callback(payload);
            this.responseCallbacks.delete(id);
          }
        });
      });
    });
  }

  /**
   * Send a message and wait for response
   */
  async send(event: string, data: any): Promise<IPCResponse> {
    if (!this.connected) {
      throw new Error('Not connected to Python bridge');
    }

    return new Promise((resolve, reject) => {
      const id = `msg_${this.messageId++}`;
      const timeout = setTimeout(() => {
        this.responseCallbacks.delete(id);
        reject(new Error('Request timeout: Python bridge did not respond'));
      }, 10000);

      this.responseCallbacks.set(id, (payload: any) => {
        clearTimeout(timeout);
        resolve(payload);
      });

      ipc.of[this.socketName].emit(event, { id, data });
    });
  }

  /**
   * Disconnect from bridge
   */
  disconnect(): void {
    if (this.connected) {
      ipc.disconnect(this.socketName);
      this.connected = false;
      logger.debug('Disconnected from Python bridge');
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.connected;
  }
}
