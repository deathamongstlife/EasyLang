/**
 * Module System Built-in Functions
 * Provides cog/module functionality for EasyLang
 */

import {
  RuntimeValue,
  makeNull,
  makeBoolean,
  makeArray,
  isString,
  makeNativeFunction,
} from '../../core/runtime/values';
import { RuntimeError, TypeError } from '../../utils/errors';
import { ModuleManager } from '../../core/modules';
import { logger } from '../../utils/logger';

// Module manager instance (will be set by runtime)
let moduleManager: ModuleManager | null = null;
let runtime: any = null;

/**
 * Initialize the module system with manager and runtime
 */
export function initializeModuleSystem(manager: ModuleManager, rt: any) {
  moduleManager = manager;
  runtime = rt;
  logger.debug('Module system initialized');
}

/**
 * load_module(file_path) - Load an EasyLang module file
 */
const loadModuleFunction = makeNativeFunction('load_module', async (args: RuntimeValue[]) => {
  if (args.length !== 1) {
    throw new RuntimeError(`load_module() expects 1 argument (file_path), got ${args.length}`);
  }

  if (!isString(args[0])) {
    throw new TypeError('load_module() expects a string file path');
  }

  if (!moduleManager || !runtime) {
    throw new RuntimeError('Module system not initialized');
  }

  const filePath = args[0].value;

  try {
    const moduleObject = await moduleManager.loadModule(filePath, runtime);
    return moduleObject;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new RuntimeError(`Failed to load module: ${errorMessage}`);
  }
});

/**
 * unload_module(module_name) - Unload a loaded module
 */
const unloadModuleFunction = makeNativeFunction('unload_module', async (args: RuntimeValue[]) => {
  if (args.length !== 1) {
    throw new RuntimeError(`unload_module() expects 1 argument (module_name), got ${args.length}`);
  }

  if (!isString(args[0])) {
    throw new TypeError('unload_module() expects a string module name');
  }

  if (!moduleManager) {
    throw new RuntimeError('Module system not initialized');
  }

  const moduleName = args[0].value;

  try {
    const success = await moduleManager.unloadModule(moduleName);
    return makeBoolean(success);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new RuntimeError(`Failed to unload module: ${errorMessage}`);
  }
});

/**
 * reload_module(module_name) - Reload a module (unload + load)
 */
const reloadModuleFunction = makeNativeFunction('reload_module', async (args: RuntimeValue[]) => {
  if (args.length !== 1) {
    throw new RuntimeError(`reload_module() expects 1 argument (module_name), got ${args.length}`);
  }

  if (!isString(args[0])) {
    throw new TypeError('reload_module() expects a string module name');
  }

  if (!moduleManager || !runtime) {
    throw new RuntimeError('Module system not initialized');
  }

  const moduleName = args[0].value;

  try {
    const moduleObject = await moduleManager.reloadModule(moduleName, runtime);
    return moduleObject;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new RuntimeError(`Failed to reload module: ${errorMessage}`);
  }
});

/**
 * list_modules() - Returns array of loaded module info
 */
const listModulesFunction = makeNativeFunction('list_modules', async (args: RuntimeValue[]) => {
  if (args.length !== 0) {
    throw new RuntimeError(`list_modules() expects 0 arguments, got ${args.length}`);
  }

  if (!moduleManager) {
    throw new RuntimeError('Module system not initialized');
  }

  try {
    const modules = moduleManager.listModules();
    return makeArray(modules);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new RuntimeError(`Failed to list modules: ${errorMessage}`);
  }
});

/**
 * get_module(module_name) - Get a loaded module object
 */
const getModuleFunction = makeNativeFunction('get_module', async (args: RuntimeValue[]) => {
  if (args.length !== 1) {
    throw new RuntimeError(`get_module() expects 1 argument (module_name), got ${args.length}`);
  }

  if (!isString(args[0])) {
    throw new TypeError('get_module() expects a string module name');
  }

  if (!moduleManager) {
    throw new RuntimeError('Module system not initialized');
  }

  const moduleName = args[0].value;

  try {
    return moduleManager.getModule(moduleName);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new RuntimeError(`Failed to get module: ${errorMessage}`);
  }
});

/**
 * module_exists(module_name) - Check if a module is loaded
 */
const moduleExistsFunction = makeNativeFunction('module_exists', async (args: RuntimeValue[]) => {
  if (args.length !== 1) {
    throw new RuntimeError(`module_exists() expects 1 argument (module_name), got ${args.length}`);
  }

  if (!isString(args[0])) {
    throw new TypeError('module_exists() expects a string module name');
  }

  if (!moduleManager) {
    throw new RuntimeError('Module system not initialized');
  }

  const moduleName = args[0].value;
  return makeBoolean(moduleManager.moduleExists(moduleName));
});

/**
 * export(name, value) - Explicitly export a value from current module
 * Note: This is a simplified version. In practice, we'd need to track the current module context
 */
const exportFunction = makeNativeFunction('export', async (args: RuntimeValue[]) => {
  if (args.length !== 2) {
    throw new RuntimeError(`export() expects 2 arguments (name, value), got ${args.length}`);
  }

  if (!isString(args[0])) {
    throw new TypeError('export() expects a string name as first argument');
  }

  // For now, this is a placeholder that stores the export intent
  // The actual export happens when the module is loaded by ModuleManager
  const exportName = args[0].value;
  // const value = args[1];  // Uncomment when we implement explicit exports

  logger.debug(`Export registered: ${exportName}`);

  // Return null as this is primarily a side-effect function
  return makeNull();
});

// Export all module functions
export const moduleBuiltins = {
  load_module: loadModuleFunction,
  unload_module: unloadModuleFunction,
  reload_module: reloadModuleFunction,
  list_modules: listModulesFunction,
  get_module: getModuleFunction,
  module_exists: moduleExistsFunction,
  export: exportFunction,
};
