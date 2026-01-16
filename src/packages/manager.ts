/**
 * Package Manager
 * Handles installation and management of Python and npm packages
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import { PackageType, PackageMetadata } from '../bridges/types';
import { InstallationError } from '../bridges/errors';
import { logger } from '../utils/logger';

const execAsync = promisify(exec);

/**
 * Package manager for both Python and npm packages
 */
export class PackageManager {
  private static instance: PackageManager;
  private installedPackages: Map<string, PackageMetadata> = new Map();
  private installationLocks: Set<string> = new Set(); // Prevent concurrent installs

  private constructor() {
    this.loadInstalledPackages();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): PackageManager {
    if (!PackageManager.instance) {
      PackageManager.instance = new PackageManager();
    }
    return PackageManager.instance;
  }

  /**
   * Install a package
   */
  async installPackage(
    packageName: string,
    type: PackageType,
    version?: string
  ): Promise<PackageMetadata> {
    const fullName = version ? `${packageName}@${version}` : packageName;
    const lockKey = `${type}:${fullName}`;

    // Check if already installing
    if (this.installationLocks.has(lockKey)) {
      throw new Error(`Package ${fullName} is already being installed`);
    }

    // Check if already installed
    const existing = this.getPackageMetadata(packageName, type);
    if (existing && existing.installed) {
      logger.info(`Package ${fullName} is already installed`);
      return existing;
    }

    this.installationLocks.add(lockKey);

    try {
      let metadata: PackageMetadata;

      if (type === PackageType.PYTHON) {
        metadata = await this.installPythonPackage(packageName, version);
      } else if (type === PackageType.NPM) {
        metadata = await this.installNpmPackage(packageName, version);
      } else {
        throw new Error(`Invalid package type: ${type}`);
      }

      this.installedPackages.set(`${type}:${packageName}`, metadata);
      this.saveInstalledPackages();

      logger.info(`Successfully installed ${type} package: ${fullName}`);
      return metadata;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error(`Failed to install ${type} package ${fullName}: ${errorMsg}`);
      throw new InstallationError(
        packageName,
        type === PackageType.PYTHON ? 'python' : 'npm',
        error instanceof Error ? error : undefined
      );
    } finally {
      this.installationLocks.delete(lockKey);
    }
  }

  /**
   * Install Python package using pip
   */
  private async installPythonPackage(
    packageName: string,
    version?: string
  ): Promise<PackageMetadata> {
    const pythonCmd = await this.findPythonExecutable();
    if (!pythonCmd) {
      throw new Error('Python not found. Please install Python 3.6 or later.');
    }

    const pipCmd = pythonCmd === 'python3' ? 'pip3' : 'pip';
    const fullName = version ? `${packageName}==${version}` : packageName;

    logger.info(`Installing Python package: ${fullName}`);

    try {
      // Try normal pip install first
      const { stdout, stderr } = await execAsync(`${pipCmd} install ${fullName}`);
      logger.debug(`pip install output: ${stdout}`);
      if (stderr) logger.debug(`pip install stderr: ${stderr}`);
    } catch (error: any) {
      // If normal install fails, try with --user flag
      if (error.message.includes('externally-managed-environment')) {
        logger.info('Retrying with --user flag (externally managed environment)');
        const { stdout, stderr } = await execAsync(`${pipCmd} install --user ${fullName}`);
        logger.debug(`pip install --user output: ${stdout}`);
        if (stderr) logger.debug(`pip install --user stderr: ${stderr}`);
      } else {
        throw error;
      }
    }

    // Verify installation
    const isInstalled = await this.verifyPythonPackage(packageName);
    if (!isInstalled) {
      throw new Error('Package installation succeeded but package not found in Python environment');
    }

    return {
      name: packageName,
      type: PackageType.PYTHON,
      version: version || 'latest',
      installed: true,
    };
  }

  /**
   * Install npm package
   */
  private async installNpmPackage(
    packageName: string,
    version?: string
  ): Promise<PackageMetadata> {
    const fullName = version ? `${packageName}@${version}` : packageName;

    logger.info(`Installing npm package: ${fullName}`);

    // Determine package manager (npm, yarn, bun)
    const packageManager = await this.detectPackageManager();

    try {
      let command: string;
      if (packageManager === 'bun') {
        command = `bun add ${fullName}`;
      } else if (packageManager === 'yarn') {
        command = `yarn add ${fullName}`;
      } else {
        command = `npm install ${fullName}`;
      }

      const { stdout, stderr } = await execAsync(command, {
        cwd: process.cwd(),
      });

      logger.debug(`${packageManager} install output: ${stdout}`);
      if (stderr) logger.debug(`${packageManager} install stderr: ${stderr}`);
    } catch (error: any) {
      throw new Error(`Failed to install npm package: ${error.message}`);
    }

    // Verify installation
    const isInstalled = await this.verifyNpmPackage(packageName);
    if (!isInstalled) {
      throw new Error('Package installation succeeded but package not found in node_modules');
    }

    return {
      name: packageName,
      type: PackageType.NPM,
      version: version || 'latest',
      installed: true,
      path: path.join(process.cwd(), 'node_modules', packageName),
    };
  }

  /**
   * Check if package is installed
   */
  async isPackageInstalled(packageName: string, type: PackageType): Promise<boolean> {
    if (type === PackageType.PYTHON) {
      return await this.verifyPythonPackage(packageName);
    } else if (type === PackageType.NPM) {
      return await this.verifyNpmPackage(packageName);
    }
    return false;
  }

  /**
   * Verify Python package installation
   */
  private async verifyPythonPackage(packageName: string): Promise<boolean> {
    const pythonCmd = await this.findPythonExecutable();
    if (!pythonCmd) return false;

    try {
      const { stdout } = await execAsync(
        `${pythonCmd} -c "import ${packageName}; print('OK')"`
      );
      return stdout.trim() === 'OK';
    } catch {
      return false;
    }
  }

  /**
   * Verify npm package installation
   */
  private async verifyNpmPackage(packageName: string): Promise<boolean> {
    try {
      const packagePath = path.join(process.cwd(), 'node_modules', packageName);
      return fs.existsSync(packagePath);
    } catch {
      return false;
    }
  }

  /**
   * Get package metadata
   */
  getPackageMetadata(packageName: string, type: PackageType): PackageMetadata | undefined {
    return this.installedPackages.get(`${type}:${packageName}`);
  }

  /**
   * List all installed packages
   */
  listPackages(type?: PackageType): PackageMetadata[] {
    const packages = Array.from(this.installedPackages.values());
    if (type) {
      return packages.filter((pkg) => pkg.type === type);
    }
    return packages;
  }

  /**
   * Find Python executable
   */
  private async findPythonExecutable(): Promise<string | null> {
    const commands = ['python3', 'python'];

    for (const cmd of commands) {
      try {
        const { stdout } = await execAsync(`${cmd} --version`);
        if (stdout.includes('Python 3')) {
          return cmd;
        }
      } catch {
        // Command not found, try next
      }
    }

    return null;
  }

  /**
   * Detect which package manager is available
   */
  private async detectPackageManager(): Promise<'npm' | 'yarn' | 'bun'> {
    // Check for bun
    try {
      await execAsync('bun --version');
      return 'bun';
    } catch {
      // Continue
    }

    // Check for yarn
    try {
      await execAsync('yarn --version');
      if (fs.existsSync(path.join(process.cwd(), 'yarn.lock'))) {
        return 'yarn';
      }
    } catch {
      // Continue
    }

    // Default to npm
    return 'npm';
  }

  /**
   * Load installed packages from cache
   */
  private loadInstalledPackages(): void {
    const cacheFile = path.join(process.cwd(), '.ezlang-packages.json');
    if (fs.existsSync(cacheFile)) {
      try {
        const data = fs.readFileSync(cacheFile, 'utf-8');
        const packages = JSON.parse(data) as PackageMetadata[];
        packages.forEach((pkg) => {
          this.installedPackages.set(`${pkg.type}:${pkg.name}`, pkg);
        });
      } catch (error) {
        logger.warn('Failed to load package cache');
      }
    }
  }

  /**
   * Save installed packages to cache
   */
  private saveInstalledPackages(): void {
    const cacheFile = path.join(process.cwd(), '.ezlang-packages.json');
    try {
      const packages = Array.from(this.installedPackages.values());
      fs.writeFileSync(cacheFile, JSON.stringify(packages, null, 2));
    } catch (error) {
      logger.warn('Failed to save package cache');
    }
  }

  /**
   * Clear package cache
   */
  clearCache(): void {
    this.installedPackages.clear();
    const cacheFile = path.join(process.cwd(), '.ezlang-packages.json');
    if (fs.existsSync(cacheFile)) {
      fs.unlinkSync(cacheFile);
    }
  }
}
