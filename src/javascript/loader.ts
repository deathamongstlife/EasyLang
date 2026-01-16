/**
 * JavaScript/npm Package Loader
 * Dynamically loads and manages npm packages
 */

import * as path from 'path';
import * as fs from 'fs';
import { PackageManager } from '../packages/manager';
import { PackageCache } from '../packages/cache';
import { PackageType } from '../bridges/types';
import { ImportError, PackageNotFoundError } from '../bridges/errors';
import { JsPackageExports } from './types';
import { logger } from '../utils/logger';

/**
 * JavaScript package loader
 */
export class JavaScriptLoader {
  private static instance: JavaScriptLoader;
  private packageManager: PackageManager;
  private cache: PackageCache;
  private loadedModules: Map<string, any> = new Map();

  private constructor() {
    this.packageManager = PackageManager.getInstance();
    this.cache = PackageCache.getInstance();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): JavaScriptLoader {
    if (!JavaScriptLoader.instance) {
      JavaScriptLoader.instance = new JavaScriptLoader();
    }
    return JavaScriptLoader.instance;
  }

  /**
   * Load npm package
   */
  async loadPackage(packageName: string, autoInstall = true): Promise<JsPackageExports> {
    // Check cache first
    const cached = this.cache.get(packageName, PackageType.NPM);
    if (cached) {
      logger.debug(`Using cached package: ${packageName}`);
      return cached;
    }

    // Check if already loaded
    if (this.loadedModules.has(packageName)) {
      const exports = this.loadedModules.get(packageName)!;
      this.cache.set(packageName, PackageType.NPM, exports);
      return exports;
    }

    // Try to require the package
    try {
      const packageExports = await this.requirePackage(packageName);
      this.loadedModules.set(packageName, packageExports);
      this.cache.set(packageName, PackageType.NPM, packageExports);
      logger.info(`Loaded npm package: ${packageName}`);
      return packageExports;
    } catch (error: any) {
      // Package not found
      if (error.code === 'MODULE_NOT_FOUND' && autoInstall) {
        logger.info(`Package ${packageName} not found, attempting auto-install...`);
        try {
          await this.packageManager.installPackage(packageName, PackageType.NPM);
          // Try again after installation
          const packageExports = await this.requirePackage(packageName);
          this.loadedModules.set(packageName, packageExports);
          this.cache.set(packageName, PackageType.NPM, packageExports);
          return packageExports;
        } catch (installError: any) {
          throw new PackageNotFoundError(packageName, 'npm', {
            originalError: installError.message,
            autoInstallAttempted: true,
          });
        }
      }

      throw new ImportError(
        packageName,
        `Failed to load npm package '${packageName}': ${error.message}`,
        error
      );
    }
  }

  /**
   * Require package using Node.js require
   */
  private async requirePackage(packageName: string): Promise<JsPackageExports> {
    try {
      // Clear require cache to ensure fresh load
      const resolvedPath = require.resolve(packageName);
      delete require.cache[resolvedPath];

      // Require the package
      const pkg = require(packageName);

      // Normalize exports structure
      return this.normalizeExports(pkg, packageName);
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Normalize package exports (handle ES modules, CommonJS, etc.)
   */
  private normalizeExports(pkg: any, _packageName: string): JsPackageExports {
    const exports: JsPackageExports = {
      named: {},
    };

    // Handle ES module default export
    if (pkg && typeof pkg === 'object' && '__esModule' in pkg) {
      if ('default' in pkg) {
        exports.default = pkg.default;
      }

      // Get named exports
      for (const key in pkg) {
        if (key !== 'default' && key !== '__esModule') {
          exports.named[key] = pkg[key];
        }
      }
    } else {
      // CommonJS module or direct export
      exports.default = pkg;

      // If it's an object, also expose as named exports
      if (pkg && typeof pkg === 'object') {
        for (const key in pkg) {
          exports.named[key] = pkg[key];
        }
      }
    }

    return exports;
  }

  /**
   * Get package property by path
   */
  getProperty(packageName: string, propertyPath: string[]): any {
    const exports = this.loadedModules.get(packageName);
    if (!exports) {
      throw new Error(`Package ${packageName} not loaded`);
    }

    let current: any = exports.default || exports.named;

    for (const prop of propertyPath) {
      if (current === null || current === undefined) {
        throw new Error(`Cannot access property '${prop}' of ${current}`);
      }
      current = current[prop];
    }

    return current;
  }

  /**
   * Call package function
   */
  async callFunction(
    packageName: string,
    functionPath: string[],
    args: any[],
    options: { isConstructor?: boolean; context?: any } = {}
  ): Promise<any> {
    const func = this.getProperty(packageName, functionPath);

    if (typeof func !== 'function') {
      throw new Error(
        `Property '${functionPath.join('.')}' in package '${packageName}' is not a function`
      );
    }

    try {
      let result: any;

      if (options.isConstructor) {
        // Call as constructor
        result = new func(...args);
      } else if (options.context) {
        // Call with specific context
        result = func.apply(options.context, args);
      } else {
        // Normal function call
        result = func(...args);
      }

      // Handle promises
      if (result && typeof result.then === 'function') {
        return await result;
      }

      return result;
    } catch (error: any) {
      throw new Error(
        `Error calling function '${functionPath.join('.')}' in package '${packageName}': ${
          error.message
        }`
      );
    }
  }

  /**
   * Check if package is loaded
   */
  isLoaded(packageName: string): boolean {
    return this.loadedModules.has(packageName);
  }

  /**
   * Unload package
   */
  unload(packageName: string): boolean {
    const existed = this.loadedModules.delete(packageName);
    this.cache.delete(packageName, PackageType.NPM);

    // Clear from require cache
    try {
      const resolvedPath = require.resolve(packageName);
      delete require.cache[resolvedPath];
    } catch {
      // Package path not resolvable
    }

    if (existed) {
      logger.debug(`Unloaded package: ${packageName}`);
    }

    return existed;
  }

  /**
   * Reload package (clear cache and load fresh)
   */
  async reloadPackage(packageName: string): Promise<JsPackageExports> {
    this.unload(packageName);
    return await this.loadPackage(packageName, false);
  }

  /**
   * Get all loaded packages
   */
  getLoadedPackages(): string[] {
    return Array.from(this.loadedModules.keys());
  }

  /**
   * Clear all loaded packages
   */
  clearAll(): void {
    for (const packageName of this.loadedModules.keys()) {
      this.unload(packageName);
    }
    logger.info('Cleared all loaded JavaScript packages');
  }

  /**
   * Get package metadata
   */
  getPackageMetadata(packageName: string): {
    name: string;
    version?: string;
    description?: string;
    main?: string;
  } | null {
    try {
      const packageJsonPath = path.join(
        process.cwd(),
        'node_modules',
        packageName,
        'package.json'
      );

      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
        return {
          name: packageJson.name,
          version: packageJson.version,
          description: packageJson.description,
          main: packageJson.main,
        };
      }
    } catch {
      // Failed to read package.json
    }

    return null;
  }

  /**
   * List available packages in node_modules
   */
  listAvailablePackages(): string[] {
    try {
      const nodeModulesPath = path.join(process.cwd(), 'node_modules');
      if (!fs.existsSync(nodeModulesPath)) {
        return [];
      }

      const entries = fs.readdirSync(nodeModulesPath, { withFileTypes: true });
      const packages: string[] = [];

      for (const entry of entries) {
        if (entry.isDirectory()) {
          // Handle scoped packages (@scope/package)
          if (entry.name.startsWith('@')) {
            const scopedPath = path.join(nodeModulesPath, entry.name);
            const scopedEntries = fs.readdirSync(scopedPath, { withFileTypes: true });
            for (const scopedEntry of scopedEntries) {
              if (scopedEntry.isDirectory()) {
                packages.push(`${entry.name}/${scopedEntry.name}`);
              }
            }
          } else {
            packages.push(entry.name);
          }
        }
      }

      return packages.sort();
    } catch {
      return [];
    }
  }
}
