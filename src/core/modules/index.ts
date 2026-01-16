/**
 * Module Manager
 * Central management for EasyLang module system
 */

import { RuntimeValue, makeString, makeObject } from '../runtime/values';
import { Environment } from '../runtime/environment';
import { RuntimeError } from '../../utils/errors';
import { ModuleRegistry, ModuleMetadata } from './registry';
import { ModuleLoader, LoadedModule } from './loader';
import { logger } from '../../utils/logger';
import { DiscordManager } from '../../discord';

export class ModuleManager {
  private registry: ModuleRegistry;
  private loader: ModuleLoader;
  private globalEnv: Environment;
  private eventHandlerMap: Map<string, string[]> = new Map(); // handlerId -> moduleNames

  constructor(_discordManager: DiscordManager, globalEnv: Environment) {
    this.registry = new ModuleRegistry();
    this.loader = new ModuleLoader();
    this.globalEnv = globalEnv;
  }

  /**
   * Load a module from file
   */
  async loadModule(filePath: string, runtime: any): Promise<RuntimeValue> {
    try {
      // Load and parse the module
      const moduleInfo = await this.loader.load(filePath, this.globalEnv);

      // Check for circular dependencies if module already exists
      if (this.registry.has(moduleInfo.name)) {
        logger.debug(`Module '${moduleInfo.name}' already loaded, reloading...`);
        return this.reloadModule(moduleInfo.name, runtime);
      }

      // Execute the module in its isolated environment
      for (const statement of moduleInfo.program.body) {
        await runtime.evaluateStatement(statement, moduleInfo.environment);
      }

      // Extract exports (functions starting with export_)
      const exports = this.extractExports(moduleInfo.environment);

      // Update module exports
      moduleInfo.exports = exports;

      // Register the module
      this.registry.register(moduleInfo.name, moduleInfo.filePath, exports);

      logger.info(`Module '${moduleInfo.name}' loaded successfully from ${moduleInfo.filePath}`);

      // Return module object with exports
      return this.createModuleObject(moduleInfo.name);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new RuntimeError(`Failed to load module from '${filePath}': ${errorMessage}`);
    }
  }

  /**
   * Unload a module and clean up resources
   */
  async unloadModule(moduleName: string): Promise<boolean> {
    const module = this.registry.get(moduleName);
    if (!module) {
      logger.warn(`Module '${moduleName}' not found`);
      return false;
    }

    try {
      // Clean up event handlers
      await this.cleanupEventHandlers(moduleName);

      // Unregister the module
      this.registry.unregister(moduleName);

      logger.info(`Module '${moduleName}' unloaded successfully`);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Failed to unload module '${moduleName}': ${errorMessage}`);
      return false;
    }
  }

  /**
   * Reload a module (unload + load)
   */
  async reloadModule(moduleName: string, runtime: any): Promise<RuntimeValue> {
    const module = this.registry.get(moduleName);
    if (!module) {
      throw new RuntimeError(`Module '${moduleName}' not found`);
    }

    const filePath = module.filePath;

    // Unload the module
    await this.unloadModule(moduleName);

    // Load it again
    return this.loadModule(filePath, runtime);
  }

  /**
   * Get a loaded module
   */
  getModule(moduleName: string): RuntimeValue {
    const module = this.registry.get(moduleName);
    if (!module) {
      throw new RuntimeError(`Module '${moduleName}' not found`);
    }

    return this.createModuleObject(moduleName);
  }

  /**
   * Check if module exists
   */
  moduleExists(moduleName: string): boolean {
    return this.registry.has(moduleName);
  }

  /**
   * List all loaded modules
   */
  listModules(): RuntimeValue[] {
    const modules = this.registry.getAll();

    return modules.map(module => {
      const obj = makeObject(new Map());
      obj.properties.set('name', makeString(module.name));
      obj.properties.set('file_path', makeString(module.filePath));
      obj.properties.set('loaded_at', makeString(module.loadedAt.toISOString()));
      obj.properties.set('reload_count', makeString(module.reloadCount.toString()));
      obj.properties.set('export_count', makeString(module.exports.size.toString()));
      obj.properties.set('event_handlers', makeString(module.eventHandlers.length.toString()));

      return obj;
    });
  }

  /**
   * Extract exported functions and variables from module environment
   */
  private extractExports(env: Environment): Map<string, RuntimeValue> {
    const exports = new Map<string, RuntimeValue>();
    const variables = env.getVariables();

    // Export functions/variables starting with "export_"
    for (const [name, value] of variables) {
      if (name.startsWith('export_')) {
        const exportName = name.substring(7); // Remove "export_" prefix
        exports.set(exportName, value);
      }
    }

    return exports;
  }

  /**
   * Create a module object with exports
   */
  private createModuleObject(moduleName: string): RuntimeValue {
    const module = this.registry.get(moduleName);
    if (!module) {
      throw new RuntimeError(`Module '${moduleName}' not found`);
    }

    const obj = makeObject(new Map());

    // Add all exports to the module object
    for (const [name, value] of module.exports) {
      obj.properties.set(name, value);
    }

    // Add metadata
    obj.properties.set('__name__', makeString(module.name));
    obj.properties.set('__file__', makeString(module.filePath));

    return obj;
  }

  /**
   * Register event handler for a module
   */
  registerEventHandler(moduleName: string, handlerId: string): void {
    this.registry.addEventHandler(moduleName, handlerId);

    if (!this.eventHandlerMap.has(handlerId)) {
      this.eventHandlerMap.set(handlerId, []);
    }
    this.eventHandlerMap.get(handlerId)!.push(moduleName);
  }

  /**
   * Clean up event handlers for a module
   */
  private async cleanupEventHandlers(moduleName: string): Promise<void> {
    const handlers = this.registry.getEventHandlers(moduleName);

    for (const handlerId of handlers) {
      // Remove handler from Discord manager
      // Note: This would require Discord manager to support handler removal by ID
      logger.debug(`Cleaning up event handler: ${handlerId} from module ${moduleName}`);
    }

    this.registry.clearEventHandlers(moduleName);
  }

  /**
   * Export a variable/function explicitly
   */
  exportValue(moduleName: string, exportName: string, value: RuntimeValue): void {
    const module = this.registry.get(moduleName);
    if (!module) {
      throw new RuntimeError(`Module '${moduleName}' not found`);
    }

    module.exports.set(exportName, value);
  }

  /**
   * Get registry for debugging/testing
   */
  getRegistry(): ModuleRegistry {
    return this.registry;
  }
}

// Export types and classes
export { ModuleRegistry, ModuleLoader, ModuleMetadata, LoadedModule };
