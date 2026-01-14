/**
 * Package Resolver
 * Resolves package names to Python or npm packages
 */

import { PackageType } from '../bridges/types';
import { PackageManager } from './manager';
import { logger } from '../utils/logger';

/**
 * Known package mapping for disambiguation
 */
const PACKAGE_MAPPING: { [key: string]: PackageType } = {
  // Common npm packages
  'express': PackageType.NPM,
  'react': PackageType.NPM,
  'vue': PackageType.NPM,
  'angular': PackageType.NPM,
  'lodash': PackageType.NPM,
  'axios': PackageType.NPM,
  'moment': PackageType.NPM,
  'chalk': PackageType.NPM,
  'commander': PackageType.NPM,
  'dotenv': PackageType.NPM,
  'jest': PackageType.NPM,
  'webpack': PackageType.NPM,
  'typescript': PackageType.NPM,
  'eslint': PackageType.NPM,
  'prettier': PackageType.NPM,
  'next': PackageType.NPM,
  'nuxt': PackageType.NPM,

  // Common Python packages
  'numpy': PackageType.PYTHON,
  'pandas': PackageType.PYTHON,
  'matplotlib': PackageType.PYTHON,
  'scipy': PackageType.PYTHON,
  'sklearn': PackageType.PYTHON,
  'tensorflow': PackageType.PYTHON,
  'torch': PackageType.PYTHON,
  'flask': PackageType.PYTHON,
  'django': PackageType.PYTHON,
  'requests': PackageType.PYTHON,
  'beautifulsoup4': PackageType.PYTHON,
  'selenium': PackageType.PYTHON,
  'pillow': PackageType.PYTHON,
  'opencv-python': PackageType.PYTHON,
  'pytest': PackageType.PYTHON,
  'black': PackageType.PYTHON,
  'pylint': PackageType.PYTHON,
  'mypy': PackageType.PYTHON,
};

/**
 * Package resolver
 */
export class PackageResolver {
  private static instance: PackageResolver;
  private packageManager: PackageManager;

  private constructor() {
    this.packageManager = PackageManager.getInstance();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): PackageResolver {
    if (!PackageResolver.instance) {
      PackageResolver.instance = new PackageResolver();
    }
    return PackageResolver.instance;
  }

  /**
   * Resolve package type (auto-detect Python vs npm)
   */
  async resolvePackageType(packageName: string): Promise<PackageType> {
    // Check if explicitly mapped
    if (PACKAGE_MAPPING[packageName]) {
      logger.debug(`Package ${packageName} resolved from mapping: ${PACKAGE_MAPPING[packageName]}`);
      return PACKAGE_MAPPING[packageName];
    }

    // Check if already installed as npm package
    const isNpmInstalled = await this.packageManager.isPackageInstalled(
      packageName,
      PackageType.NPM
    );
    if (isNpmInstalled) {
      logger.debug(`Package ${packageName} found in npm`);
      return PackageType.NPM;
    }

    // Check if already installed as Python package
    const isPythonInstalled = await this.packageManager.isPackageInstalled(
      packageName,
      PackageType.PYTHON
    );
    if (isPythonInstalled) {
      logger.debug(`Package ${packageName} found in Python`);
      return PackageType.PYTHON;
    }

    // Check npm registry (faster)
    const existsInNpm = await this.checkNpmRegistry(packageName);
    if (existsInNpm) {
      logger.debug(`Package ${packageName} found in npm registry`);
      return PackageType.NPM;
    }

    // Check PyPI (slower)
    const existsInPyPI = await this.checkPyPI(packageName);
    if (existsInPyPI) {
      logger.debug(`Package ${packageName} found in PyPI`);
      return PackageType.PYTHON;
    }

    // Default to npm if not found anywhere
    logger.warn(`Package ${packageName} not found in any registry, defaulting to npm`);
    return PackageType.NPM;
  }

  /**
   * Check if package exists in npm registry
   */
  private async checkNpmRegistry(packageName: string): Promise<boolean> {
    try {
      // Use npm view command to check if package exists
      const { exec } = require('child_process');
      const { promisify } = require('util');
      const execAsync = promisify(exec);

      await execAsync(`npm view ${packageName} version`, {
        timeout: 5000, // 5 second timeout
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if package exists in PyPI
   */
  private async checkPyPI(packageName: string): Promise<boolean> {
    try {
      // Use pip search or HTTP request to PyPI API
      const https = require('https');

      return new Promise<boolean>((resolve) => {
        const url = `https://pypi.org/pypi/${packageName}/json`;
        https
          .get(url, (res: any) => {
            resolve(res.statusCode === 200);
          })
          .on('error', () => {
            resolve(false);
          })
          .setTimeout(5000, () => {
            resolve(false);
          });
      });
    } catch {
      return false;
    }
  }

  /**
   * Parse package specification (e.g., "package@version")
   */
  parsePackageSpec(spec: string): { name: string; version?: string; type?: PackageType } {
    // Handle explicit type prefix: python:package or npm:package
    let type: PackageType | undefined;
    let nameVersion = spec;

    if (spec.startsWith('python:')) {
      type = PackageType.PYTHON;
      nameVersion = spec.substring(7);
    } else if (spec.startsWith('npm:')) {
      type = PackageType.NPM;
      nameVersion = spec.substring(4);
    }

    // Parse version
    const atIndex = nameVersion.indexOf('@');
    if (atIndex > 0) {
      const name = nameVersion.substring(0, atIndex);
      const version = nameVersion.substring(atIndex + 1);
      return { name, version, type };
    }

    return { name: nameVersion, type };
  }

  /**
   * Suggest alternative package names
   */
  suggestAlternatives(packageName: string): string[] {
    const suggestions: string[] = [];

    // Common package name variations
    const variations = [
      packageName.toLowerCase(),
      packageName.toUpperCase(),
      packageName.replace(/-/g, '_'),
      packageName.replace(/_/g, '-'),
      packageName.replace(/js$/i, ''),
      `${packageName}js`,
      `${packageName}-js`,
      `py${packageName}`,
      `${packageName}-python`,
    ];

    // Remove duplicates
    return [...new Set(variations)].filter((v) => v !== packageName);
  }

  /**
   * Get package info from both registries
   */
  async getPackageInfo(packageName: string): Promise<{
    npm?: any;
    python?: any;
  }> {
    const info: { npm?: any; python?: any } = {};

    // Try to get npm info
    try {
      const { exec } = require('child_process');
      const { promisify } = require('util');
      const execAsync = promisify(exec);

      const { stdout } = await execAsync(`npm view ${packageName} --json`, {
        timeout: 5000,
      });
      info.npm = JSON.parse(stdout);
    } catch {
      // Package not found in npm
    }

    // Try to get PyPI info
    try {
      const https = require('https');
      const url = `https://pypi.org/pypi/${packageName}/json`;

      info.python = await new Promise((resolve, reject) => {
        https
          .get(url, (res: any) => {
            let data = '';
            res.on('data', (chunk: any) => (data += chunk));
            res.on('end', () => {
              try {
                resolve(JSON.parse(data));
              } catch {
                reject();
              }
            });
          })
          .on('error', reject)
          .setTimeout(5000, reject);
      });
    } catch {
      // Package not found in PyPI
    }

    return info;
  }

  /**
   * Validate package name
   */
  isValidPackageName(name: string): boolean {
    // npm package name rules
    const npmPattern = /^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;
    // Python package name rules (more lenient)
    const pythonPattern = /^[a-zA-Z0-9_-]+$/;

    return npmPattern.test(name) || pythonPattern.test(name);
  }

  /**
   * Add custom package mapping
   */
  addPackageMapping(packageName: string, type: PackageType): void {
    PACKAGE_MAPPING[packageName] = type;
  }

  /**
   * Remove package mapping
   */
  removePackageMapping(packageName: string): void {
    delete PACKAGE_MAPPING[packageName];
  }

  /**
   * Get all known mappings
   */
  getKnownMappings(): { [key: string]: PackageType } {
    return { ...PACKAGE_MAPPING };
  }
}
