/**
 * JavaScript Bridge Manager
 * Main interface for npm package integration
 */

import { JavaScriptLoader } from './loader';
import { JavaScriptProxy } from './proxy';
import { PackageManager } from '../packages/manager';
import { PackageType } from '../bridges/types';
import { RuntimeValue, ObjectValue } from '../runtime/values';
import { ImportError, JavaScriptBridgeError } from '../bridges/errors';
import { logger } from '../utils/logger';

/**
 * JavaScript/npm bridge manager
 */
export class JavaScriptBridge {
  private static instance: JavaScriptBridge;
  private loader: JavaScriptLoader;
  private packageManager: PackageManager;
  private proxies: Map<string, JavaScriptProxy> = new Map();
  private importedPackages: Set<string> = new Set();

  private constructor() {
    this.loader = JavaScriptLoader.getInstance();
    this.packageManager = PackageManager.getInstance();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): JavaScriptBridge {
    if (!JavaScriptBridge.instance) {
      JavaScriptBridge.instance = new JavaScriptBridge();
    }
    return JavaScriptBridge.instance;
  }

  /**
   * Import npm package
   */
  async importPackage(packageName: string, autoInstall = true): Promise<ObjectValue> {
    if (this.importedPackages.has(packageName)) {
      logger.debug(`Package ${packageName} already imported`);
      return this.getProxy(packageName).createProxy();
    }

    try {
      logger.info(`Importing npm package: ${packageName}`);

      // Load the package
      await this.loader.loadPackage(packageName, autoInstall);

      // Create proxy
      const proxy = new JavaScriptProxy(packageName);
      this.proxies.set(packageName, proxy);
      this.importedPackages.add(packageName);

      // Update package manager cache
      await this.packageManager.isPackageInstalled(packageName, PackageType.NPM);

      logger.info(`Successfully imported npm package: ${packageName}`);
      return proxy.createProxy();
    } catch (error: any) {
      logger.error(`Failed to import npm package ${packageName}: ${error.message}`);
      throw new ImportError(packageName, error.message, error);
    }
  }

  /**
   * Call a function from an imported package
   */
  async callFunction(
    packageName: string,
    functionPath: string[],
    args: RuntimeValue[],
    options: { isConstructor?: boolean } = {}
  ): Promise<RuntimeValue> {
    if (!this.importedPackages.has(packageName)) {
      throw new JavaScriptBridgeError(
        `Package '${packageName}' not imported. Use 'use npm "${packageName}" as ${packageName}' first.`
      );
    }

    try {
      const proxy = this.getProxy(packageName);
      return await proxy.callFunction(functionPath, args, options);
    } catch (error: any) {
      throw new JavaScriptBridgeError(
        `Error calling function '${functionPath.join('.')}' in package '${packageName}': ${
          error.message
        }`,
        undefined,
        error
      );
    }
  }

  /**
   * Get attribute from an imported package
   */
  async getAttribute(packageName: string, propertyPath: string[]): Promise<RuntimeValue> {
    if (!this.importedPackages.has(packageName)) {
      throw new JavaScriptBridgeError(
        `Package '${packageName}' not imported. Use 'use npm "${packageName}" as ${packageName}' first.`
      );
    }

    try {
      const proxy = this.getProxy(packageName);
      return await proxy.getAttribute(propertyPath);
    } catch (error: any) {
      throw new JavaScriptBridgeError(
        `Error accessing property '${propertyPath.join('.')}' in package '${packageName}': ${
          error.message
        }`,
        undefined,
        error
      );
    }
  }

  /**
   * Check if package is imported
   */
  isPackageImported(packageName: string): boolean {
    return this.importedPackages.has(packageName);
  }

  /**
   * Unload package
   */
  unloadPackage(packageName: string): boolean {
    if (!this.importedPackages.has(packageName)) {
      return false;
    }

    // Cleanup proxy
    const proxy = this.proxies.get(packageName);
    if (proxy) {
      proxy.cleanup();
      this.proxies.delete(packageName);
    }

    // Unload from loader
    this.loader.unload(packageName);

    // Remove from imported set
    this.importedPackages.delete(packageName);

    logger.info(`Unloaded npm package: ${packageName}`);
    return true;
  }

  /**
   * Reload package (force fresh load)
   */
  async reloadPackage(packageName: string): Promise<ObjectValue> {
    this.unloadPackage(packageName);
    return await this.importPackage(packageName, false);
  }

  /**
   * Get list of imported packages
   */
  getImportedPackages(): string[] {
    return Array.from(this.importedPackages);
  }

  /**
   * Get list of available packages
   */
  getAvailablePackages(): string[] {
    return this.loader.listAvailablePackages();
  }

  /**
   * Get package metadata
   */
  getPackageMetadata(packageName: string): any {
    return this.loader.getPackageMetadata(packageName);
  }

  /**
   * Install package without importing
   */
  async installPackage(packageName: string, version?: string): Promise<void> {
    logger.info(`Installing npm package: ${packageName}${version ? `@${version}` : ''}`);
    await this.packageManager.installPackage(packageName, PackageType.NPM, version);
  }

  /**
   * Check if package is installed
   */
  async isPackageInstalled(packageName: string): Promise<boolean> {
    return await this.packageManager.isPackageInstalled(packageName, PackageType.NPM);
  }

  /**
   * Get proxy for package
   */
  private getProxy(packageName: string): JavaScriptProxy {
    const proxy = this.proxies.get(packageName);
    if (!proxy) {
      throw new Error(`Proxy not found for package: ${packageName}`);
    }
    return proxy;
  }

  /**
   * Cleanup all resources
   */
  cleanup(): void {
    logger.debug('Cleaning up JavaScript bridge');

    // Cleanup all proxies
    for (const proxy of this.proxies.values()) {
      proxy.cleanup();
    }
    this.proxies.clear();

    // Clear loader
    this.loader.clearAll();

    // Clear imported packages
    this.importedPackages.clear();
  }

  /**
   * Get bridge statistics
   */
  getStats(): {
    importedPackages: number;
    availablePackages: number;
    packages: string[];
  } {
    return {
      importedPackages: this.importedPackages.size,
      availablePackages: this.loader.listAvailablePackages().length,
      packages: Array.from(this.importedPackages),
    };
  }
}

// Export singleton instance
export const jsBridge = JavaScriptBridge.getInstance();
