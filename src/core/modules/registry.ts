/**
 * Module Registry
 * Stores and manages loaded modules with metadata
 */

import { RuntimeValue } from '../runtime/values';
import { RuntimeError } from '../../utils/errors';

export interface ModuleMetadata {
  name: string;
  filePath: string;
  exports: Map<string, RuntimeValue>;
  loadedAt: Date;
  eventHandlers: string[]; // Track registered event handlers
  dependencies: string[]; // Track module dependencies
  reloadCount: number;
}

export class ModuleRegistry {
  private modules: Map<string, ModuleMetadata> = new Map();
  private fileToModuleName: Map<string, string> = new Map();

  /**
   * Register a new module
   */
  register(name: string, filePath: string, exports: Map<string, RuntimeValue>): void {
    // Check for name conflicts
    if (this.modules.has(name)) {
      const existing = this.modules.get(name)!;
      if (existing.filePath !== filePath) {
        throw new RuntimeError(
          `Module name conflict: '${name}' is already registered from ${existing.filePath}`
        );
      }
      // Same file, treat as reload
      existing.exports = exports;
      existing.loadedAt = new Date();
      existing.reloadCount++;
      return;
    }

    // Register new module
    const metadata: ModuleMetadata = {
      name,
      filePath,
      exports,
      loadedAt: new Date(),
      eventHandlers: [],
      dependencies: [],
      reloadCount: 0,
    };

    this.modules.set(name, metadata);
    this.fileToModuleName.set(filePath, name);
  }

  /**
   * Unregister a module
   */
  unregister(name: string): boolean {
    const module = this.modules.get(name);
    if (!module) {
      return false;
    }

    this.fileToModuleName.delete(module.filePath);
    this.modules.delete(name);
    return true;
  }

  /**
   * Get module metadata
   */
  get(name: string): ModuleMetadata | undefined {
    return this.modules.get(name);
  }

  /**
   * Check if module exists
   */
  has(name: string): boolean {
    return this.modules.has(name);
  }

  /**
   * Get all module names
   */
  getAllNames(): string[] {
    return Array.from(this.modules.keys());
  }

  /**
   * Get all modules
   */
  getAll(): ModuleMetadata[] {
    return Array.from(this.modules.values());
  }

  /**
   * Get module name by file path
   */
  getNameByPath(filePath: string): string | undefined {
    return this.fileToModuleName.get(filePath);
  }

  /**
   * Track event handler for a module
   */
  addEventHandler(moduleName: string, handlerId: string): void {
    const module = this.modules.get(moduleName);
    if (module) {
      module.eventHandlers.push(handlerId);
    }
  }

  /**
   * Get all event handlers for a module
   */
  getEventHandlers(moduleName: string): string[] {
    const module = this.modules.get(moduleName);
    return module ? [...module.eventHandlers] : [];
  }

  /**
   * Clear event handlers for a module
   */
  clearEventHandlers(moduleName: string): void {
    const module = this.modules.get(moduleName);
    if (module) {
      module.eventHandlers = [];
    }
  }

  /**
   * Add dependency for a module
   */
  addDependency(moduleName: string, dependency: string): void {
    const module = this.modules.get(moduleName);
    if (module && !module.dependencies.includes(dependency)) {
      module.dependencies.push(dependency);
    }
  }

  /**
   * Check for circular dependencies
   */
  hasCircularDependency(moduleName: string, dependency: string): boolean {
    const visited = new Set<string>();
    return this.checkCircular(moduleName, dependency, visited);
  }

  private checkCircular(current: string, target: string, visited: Set<string>): boolean {
    if (current === target) {
      return true;
    }

    if (visited.has(current)) {
      return false;
    }

    visited.add(current);

    const module = this.modules.get(current);
    if (!module) {
      return false;
    }

    for (const dep of module.dependencies) {
      if (this.checkCircular(dep, target, visited)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Clear all modules
   */
  clear(): void {
    this.modules.clear();
    this.fileToModuleName.clear();
  }
}
