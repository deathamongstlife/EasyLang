const { EzLangBot } = require('./index.js');
const path = require('path');

async function run() {
    const script = path.join(__dirname, '..', '..', 'absolute_parity_test.ez');
    
    console.log("Initializing EzLang from Node.js Wrapper...");
    const bot = new EzLangBot(script, {
        env: {
            DISCORD_TOKEN: "DISCORD_TOKEN_HERE"
        }
    });

    try {
        await bot.start();
        console.log("Bot is running through Node.js!");
        
        // Let it run for 10 seconds, then kill it
        setTimeout(() => {
            console.log("Shutting down the bot...");
            bot.stop();
        }, 10000);
    } catch (err) {
        console.error("Failed to start bot:", err);
    }
}

run();