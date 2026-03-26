#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const args = process.argv.slice(2);
const command = args[0];
const targetFile = args[1];

// Locate the compiled Go binary packaged alongside this script
const enginePath = path.join(__dirname, 'ez-engine');

const pidFile = path.join(process.cwd(), '.ez.pid');

if (command === 'run') {
    if (!targetFile) return console.error("\x1b[31mUsage: ez run <file.ez>\x1b[0m");
    const child = spawn(enginePath, ['run', targetFile], { 
        stdio: 'inherit',
        env: { ...process.env, FORCE_COLOR: '1' }
    });
    child.on('exit', (code) => process.exit(code));
    
} else if (command === 'start') {
    if (!targetFile) return console.error("\x1b[31mUsage: ez start <file.ez>\x1b[0m");
    
    console.log(`\x1b[36mSpawning EzLang bot in background...\x1b[0m`);
    const out = fs.openSync('./ez-out.log', 'a');
    const err = fs.openSync('./ez-err.log', 'a');
    
    const child = spawn(enginePath, ['run', targetFile], {
        detached: true,
        stdio: ['ignore', out, err],
        env: { ...process.env, FORCE_COLOR: '1' }
    });
    
    child.unref(); // Detach completely
    fs.writeFileSync(pidFile, child.pid.toString());
    
    console.log(`\x1b[32m✔ Bot started successfully in the background!\x1b[0m`);
    console.log(`\x1b[33mPID: ${child.pid}\x1b[0m`);
    console.log(`\x1b[90mLogs are being saved to: ./ez-out.log and ./ez-err.log\x1b[0m`);
    console.log(`To stop the bot, run: \x1b[36mez stop\x1b[0m`);
    
} else if (command === 'stop') {
    if (fs.existsSync(pidFile)) {
        const pid = fs.readFileSync(pidFile, 'utf-8');
        try {
            process.kill(pid);
            console.log(`\x1b[32m✔ Stopped bot (PID: ${pid})\x1b[0m`);
        } catch(e) {
            console.log(`\x1b[33mFailed to stop PID ${pid}. It might have already crashed or stopped.\x1b[0m`);
        }
        fs.unlinkSync(pidFile);
    } else {
        console.log("\x1b[31mNo running bot found in this directory (missing .ez.pid file).\x1b[0m");
    }
} else {
    console.log(`\x1b[1mEzLang CLI (v1.0.0)\x1b[0m`);
    console.log(`\nUsage:`);
    console.log(`  \x1b[36mez run <file.ez>\x1b[0m    - Run a script in the foreground`);
    console.log(`  \x1b[36mez start <file.ez>\x1b[0m  - Run a script in the background (daemon mode)`);
    console.log(`  \x1b[36mez stop\x1b[0m             - Stop the background script in the current directory`);
}
