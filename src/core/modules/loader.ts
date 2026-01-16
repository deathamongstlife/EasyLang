/**
 * Module Loader
 * Loads and parses EasyLang module files
 */

import * as fs from 'fs';
import * as path from 'path';
import { RuntimeValue } from '../runtime/values';
import { Environment } from '../runtime/environment';
import { RuntimeError } from '../../utils/errors';
import { Lexer } from '../lexer';
import { Parser } from '../parser';
import { Program } from '../parser/ast';
import { logger } from '../../utils/logger';

export interface LoadedModule {
  name: string;
  filePath: string;
  program: Program;
  environment: Environment;
  exports: Map<string, RuntimeValue>;
}

export class ModuleLoader {
  /**
   * Load a module file and parse it
   */
  async load(filePath: string, parentEnv: Environment): Promise<LoadedModule> {
    // Resolve absolute path
    const resolvedPath = path.resolve(filePath);

    // Ensure .ez extension
    const moduleFile = resolvedPath.endsWith('.ez') ? resolvedPath : `${resolvedPath}.ez`;

    // Check if file exists
    if (!fs.existsSync(moduleFile)) {
      throw new RuntimeError(`Module file not found: ${filePath}`);
    }

    logger.debug(`Loading module from: ${moduleFile}`);

    // Read file content
    const content = fs.readFileSync(moduleFile, 'utf-8');

    // Extract module name from pragma or filename
    const moduleName = this.extractModuleName(content, moduleFile);

    // Tokenize and parse
    const lexer = new Lexer(content);
    const tokens = lexer.tokenize();
    const parser = new Parser(tokens);
    const program = parser.parse();

    // Create isolated environment for the module (extends parent for built-ins)
    const moduleEnv = parentEnv.extend();

    // Create exports object
    const exports = new Map<string, RuntimeValue>();

    return {
      name: moduleName,
      filePath: moduleFile,
      program,
      environment: moduleEnv,
      exports,
    };
  }

  /**
   * Extract module name from @module pragma or filename
   */
  private extractModuleName(content: string, filePath: string): string {
    // Look for @module pragma at the start of the file
    const pragmaMatch = content.match(/^#\s*@module\s+(\w+)/m);
    if (pragmaMatch) {
      return pragmaMatch[1];
    }

    // Fallback to filename without extension
    const filename = path.basename(filePath, '.ez');
    return filename;
  }

  /**
   * Find exported functions and variables in the module
   * Functions starting with "export_" are automatically exported
   */
  extractExports(program: Program, env: Environment): Map<string, RuntimeValue> {
    const exports = new Map<string, RuntimeValue>();

    for (const statement of program.body) {
      // Export functions with export_ prefix
      if (statement.type === 'FunctionDeclaration') {
        const funcDecl = statement as any;
        const funcName = funcDecl.name;

        if (funcName.startsWith('export_')) {
          const exportName = funcName.substring(7); // Remove "export_" prefix
          try {
            const value = env.lookup(funcName);
            exports.set(exportName, value);
            logger.debug(`Exported function: ${exportName} (from ${funcName})`);
          } catch (error) {
            // Function not yet defined, will be handled during execution
          }
        }
      }
    }

    return exports;
  }

  /**
   * Reload a module (re-parse and re-execute)
   */
  async reload(moduleInfo: LoadedModule, parentEnv: Environment): Promise<LoadedModule> {
    logger.debug(`Reloading module: ${moduleInfo.name} from ${moduleInfo.filePath}`);
    return this.load(moduleInfo.filePath, parentEnv);
  }
}
