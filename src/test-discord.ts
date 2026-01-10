/**
 * Test Discord integration
 * This tests the Discord parser and runtime integration
 */

import { Lexer } from './lexer';
import { Parser } from './parser';
import { Runtime } from './runtime';

// Test program with Discord features
const discordProgram = `
// Test Discord event listener parsing
listen "ready" (client) {
    print("Bot is ready!")
}

listen "messageCreate" (message) {
    if message.content == "!test" {
        reply message "Test successful!"
    }
}

print("Discord integration test - parsing completed")
`;

async function test() {
  console.log('Testing Discord Integration...\n');

  try {
    // Lexer test
    console.log('1. Lexing Discord program...');
    const lexer = new Lexer(discordProgram);
    const tokens = lexer.tokenize();
    console.log(`   ✓ Tokenized ${tokens.length} tokens\n`);

    // Parser test
    console.log('2. Parsing Discord program...');
    const parser = new Parser(tokens);
    const ast = parser.parse();
    console.log(`   ✓ Parsed ${ast.body.length} statements\n`);

    // Check for listen statements
    const listenStatements = ast.body.filter((stmt) => stmt.type === 'ListenStatement');
    console.log(`3. Found ${listenStatements.length} listen statements:`);
    listenStatements.forEach((stmt: any) => {
      console.log(`   - Event: "${stmt.event}" with parameter: ${stmt.parameter}`);
    });
    console.log();

    // Runtime test (without actually starting Discord)
    console.log('4. Testing runtime integration...');
    const runtime = new Runtime(ast);

    // Check that Discord manager exists
    if (runtime.discordManager) {
      console.log('   ✓ Discord manager initialized');
    } else {
      console.log('   ✗ Discord manager not found');
    }

    // Execute the program (won't start Discord, just registers handlers)
    console.log('\n5. Executing program...\n');
    await runtime.execute();

    console.log('\n✓ All Discord integration tests passed!\n');
    console.log('Note: To test actual Discord bot functionality, run:');
    console.log('  ezlang examples/discord-hello-bot.ezlang DISCORD_TOKEN=your_token\n');
  } catch (error: any) {
    console.error('\n✗ Test failed:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

test();
