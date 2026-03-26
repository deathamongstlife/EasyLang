const { spawn } = require('child_process');
const path = require('path');

class EzLangBot {
    constructor(scriptPath, options = {}) {
        this.scriptPath = path.resolve(scriptPath);
        this.options = options;
        this.process = null;
    }

    start() {
        return new Promise((resolve, reject) => {
            // Find the compiled Go binary (ezbot)
            const binaryPath = path.join(__dirname, '..', '..', 'ezbot');
            
            // Spawn the Go process
            this.process = spawn(binaryPath, ['run', this.scriptPath], {
                env: { ...process.env, ...this.options.env }
            });

            this.process.stdout.on('data', (data) => {
                const output = data.toString();
                console.log(`[EzLang] ${output.trim()}`);
                if (output.includes('connected successfully')) {
                    resolve(true);
                }
            });

            this.process.stderr.on('data', (data) => {
                console.error(`[EzLang Error] ${data.toString().trim()}`);
            });

            this.process.on('close', (code) => {
                console.log(`[EzLang] Bot process exited with code ${code}`);
                if (code !== 0) reject(new Error(`Process exited with code ${code}`));
            });
        });
    }

    stop() {
        if (this.process) {
            this.process.kill();
        }
    }
}

module.exports = { EzLangBot };