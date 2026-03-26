/**
 * EzLang NPM Bridge Sidecar
 * This process is spawned by the Go engine to handle NPM package calls.
 */
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    terminal: false
});

const loadedPackages = {};

rl.on('line', (line) => {
    try {
        const request = JSON.parse(line);
        const { id, method, params } = request;

        if (method === 'load') {
            const pkgName = params[0];
            try {
                const pkg = require(pkgName);
                loadedPackages[pkgName] = pkg;
                
                // Force colors for chalk
                if (pkgName === 'chalk' || (pkg && pkg.constructor && pkg.constructor.name === 'Chalk')) {
                    pkg.level = 3; 
                    if (pkg.Instance) {
                        const forcedChalk = new pkg.Instance({level: 3});
                        loadedPackages[pkgName] = forcedChalk;
                    }
                }
                
                process.stdout.write(JSON.stringify({ id, result: 'success' }) + '\n');
            } catch (err) {
                process.stdout.write(JSON.stringify({ id, error: `Failed to load package ${pkgName}: ${err.message}` }) + '\n');
            }
        } else if (method === 'call') {
            const [pkgName, funcName, ...args] = params;
            const pkg = loadedPackages[pkgName];

            if (!pkg) {
                return process.stdout.write(JSON.stringify({ id, error: `Package ${pkgName} not loaded` }) + '\n');
            }

            try {
                let target;
                if (funcName === '__direct_call__') {
                    target = pkg;
                } else {
                    // Handle nested access like "members.cache.get"
                    const parts = funcName.split('.');
                    target = pkg;
                    for (const part of parts) {
                        if (target[part] === undefined) throw new Error(`${part} is undefined`);
                        target = target[part];
                    }
                }

                if (typeof target === 'function') {

                    const result = target.apply(pkg, args);
                    // For chalk and similar libraries that return complex objects/proxies
                    // we need to ensure the result is JSON-serializable.
                    const finalResult = (typeof result === 'object' && result !== null) ? result.toString() : result;
                    process.stdout.write(JSON.stringify({ id, result: finalResult }) + '\n');
                } else {
                    const finalResult = (typeof target === 'object' && target !== null) ? target.toString() : target;
                    process.stdout.write(JSON.stringify({ id, result: finalResult }) + '\n');
                }
            } catch (err) {
                process.stdout.write(JSON.stringify({ id, error: `Error calling ${funcName} on ${pkgName}: ${err.message}` }) + '\n');
            }
        }
    } catch (e) {
        // Silently ignore invalid JSON
    }
});
