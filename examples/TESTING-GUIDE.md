# EzLang Comprehensive Testing Guide

This guide explains how to use the comprehensive test bots to verify every aspect of EzLang functionality.

## Test Bot Files

### 1. `comprehensive-test-bot.ez`
**Purpose**: Tests ALL EzLang language features
**Duration**: ~2-5 seconds to complete
**Discord Required**: No (optional)

### 2. `discord-api-test-bot.ez`
**Purpose**: Tests ALL Discord API integration features
**Duration**: Runs indefinitely (until stopped)
**Discord Required**: Yes (requires valid bot token)

---

## Quick Start

### Test Language Features (No Discord Required)

```bash
# Run comprehensive language test
ezlang examples/comprehensive-test-bot.ez

# Expected output: Complete test results for all 20+ language features
# All tests should pass with ✓ indicators
```

### Test Discord Integration (Requires Bot Token)

```bash
# Run Discord API test (demo mode - no token)
ezlang examples/discord-api-test-bot.ez

# Run Discord API test (with actual bot)
ezlang examples/discord-api-test-bot.ez BOT_TOKEN=your_actual_token_here

# With custom configuration
ezlang examples/discord-api-test-bot.ez \
  BOT_TOKEN=your_token \
  PREFIX=! \
  NAME=TestBot
```

---

## What Gets Tested

### Comprehensive Test Bot (`comprehensive-test-bot.ez`)

#### Section 1: Variable Declarations and Types
- ✅ String variables
- ✅ Number variables (integers and decimals)
- ✅ Boolean variables (true/false)
- ✅ Null values
- ✅ Arrays (simple, nested, mixed-type)

#### Section 2: Built-in Functions - Strings and Arrays
- ✅ `length()` - String and array length
- ✅ `type()` - Type checking
- ✅ `str()` - Type conversion to string
- ✅ `num()` - Type conversion to number

#### Section 3: Array Manipulation
- ✅ `push()` - Add elements to array
- ✅ `pop()` - Remove and return last element
- ✅ Array modification and mutation

#### Section 4: Mathematical Operations
- ✅ Addition (`+`)
- ✅ Subtraction (`-`)
- ✅ Multiplication (`*`)
- ✅ Division (`/`)
- ✅ Modulo (`%`)
- ✅ Complex expressions with operator precedence

#### Section 5: Comparison and Logical Operators
- ✅ Equality (`==`)
- ✅ Inequality (`!=`)
- ✅ Less than (`<`)
- ✅ Greater than (`>`)
- ✅ Less than or equal (`<=`)
- ✅ Greater than or equal (`>=`)
- ✅ Logical AND (`and`)
- ✅ Logical OR (`or`)
- ✅ Logical NOT (`not`)

#### Section 6: Conditional Statements
- ✅ `if` statements
- ✅ `else` statements
- ✅ Nested conditionals
- ✅ Complex boolean expressions

#### Section 7: While Loops
- ✅ Basic while loops
- ✅ Loop counters
- ✅ Loop conditions

#### Section 8: For Loops
- ✅ Iterating over arrays
- ✅ Array element access in loops

#### Section 9: Range Function
- ✅ `range(end)` - Generate sequence from 0
- ✅ `range(start, end)` - Generate sequence from start
- ✅ Using range in for loops

#### Section 10: Random Number Generation
- ✅ `random()` - Random float 0-1
- ✅ `random(min, max)` - Random integer in range
- ✅ Multiple random generations

#### Section 11: User-Defined Functions
- ✅ Function declaration
- ✅ Function with no parameters
- ✅ Function with parameters
- ✅ Function return values
- ✅ Recursive functions (factorial example)
- ✅ Functions calling other functions
- ✅ Functions with array parameters

#### Section 12: Array Indexing
- ✅ Array element access by index
- ✅ Array element modification
- ✅ Multi-dimensional array access

#### Section 13: Command-Line Arguments
- ✅ `get_argument(name, default)` - Parse KEY=VALUE arguments
- ✅ String argument parsing
- ✅ Default value handling
- ✅ Multiple argument parsing

#### Section 14: String Operations
- ✅ String concatenation
- ✅ String interpolation with `str()`
- ✅ Complex string building

#### Section 15: Complex Data Structures
- ✅ Multi-dimensional arrays (matrices)
- ✅ Nested array access
- ✅ Mixed-type arrays
- ✅ Array of arrays

#### Section 16: Advanced Function Patterns
- ✅ Functions with conditional logic
- ✅ Functions returning computed values
- ✅ Functions with complex array manipulation

#### Section 17: Async Wait Function
- ✅ `wait(seconds)` - Async delay
- ✅ Promise-based timing

#### Section 18: Stress Testing
- ✅ Large arrays (100+ elements)
- ✅ Loop performance
- ✅ Memory management

#### Section 19: Edge Cases
- ✅ Empty arrays
- ✅ Single element arrays
- ✅ Zero values
- ✅ Negative numbers
- ✅ Boolean arithmetic

#### Section 20: Discord Bot Initialization
- ✅ `bot_start(token)` - Bot initialization
- ✅ Configuration parsing
- ✅ Token validation

---

### Discord API Test Bot (`discord-api-test-bot.ez`)

#### Discord Connection
- ✅ Bot authentication
- ✅ Discord.js client initialization
- ✅ Gateway intent configuration
  - Guilds intent
  - GuildMessages intent
  - MessageContent intent

#### Event Handling
- ✅ `ready` event - Bot online detection
- ✅ `messageCreate` event - New message handling
- ✅ `error` event - Error handling

#### Command System
- ✅ Command prefix parsing
- ✅ Command routing
- ✅ 10 test commands implemented:
  - `!ping` - Responsiveness test
  - `!help` - Help message
  - `!test` - Comprehensive bot tests
  - `!info` - Bot information
  - `!echo` - Echo messages
  - `!random` - Random numbers
  - `!math` - Math operations
  - `!react` - Reaction testing
  - `!count` - Counting demonstration
  - `!reverse` - String reversal

#### Discord API Commands
- ✅ `send` - Send messages to channels
- ✅ `reply` - Reply to messages
- ✅ `react` - Add reactions to messages

#### Error Handling
- ✅ Invalid token detection
- ✅ Missing intents detection
- ✅ Connection error handling
- ✅ Graceful degradation (demo mode)

---

## Expected Output

### Comprehensive Test Bot

When you run `comprehensive-test-bot.ez`, you should see:

```
╔════════════════════════════════════════════════════════════════╗
║        COMPREHENSIVE EZLANG FUNCTIONALITY TEST BOT           ║
║                  Testing All Features                         ║
╚════════════════════════════════════════════════════════════════╝

=== SECTION 1: Variable Declarations and Types ===
String: Hello, EzLang!
Number: 42
Decimal: 3.14159
Boolean True: true
Boolean False: false
...

[20+ sections of test output]

╔════════════════════════════════════════════════════════════════╗
║             COMPREHENSIVE TEST COMPLETE                       ║
╚════════════════════════════════════════════════════════════════╝

All EzLang features have been tested:
  ✓ Variables (strings, numbers, booleans, null, arrays)
  ✓ Built-in functions (print, length, type, str, num)
  ✓ Array manipulation (push, pop, indexing)
  ✓ Mathematical operators (+, -, *, /, %)
  ✓ Comparison operators (==, !=, <, >, <=, >=)
  ✓ Logical operators (and, or, not)
  ✓ Conditional statements (if/else)
  ✓ While loops
  ✓ For loops
  ✓ Range function
  ✓ Random number generation
  ✓ User-defined functions
  ✓ Recursive functions
  ✓ Command-line argument parsing
  ✓ String concatenation
  ✓ Multi-dimensional arrays
  ✓ Async wait function
  ✓ Discord bot initialization

Bot Status: DEMO MODE
```

**Success Criteria**: All sections complete with ✓ markers, no errors.

### Discord API Test Bot (Demo Mode)

```
╔════════════════════════════════════════════════════════════════╗
║         DISCORD API COMPREHENSIVE TEST BOT                    ║
║     Testing All Discord.js Integration Features              ║
╚════════════════════════════════════════════════════════════════╝

=== Bot Configuration ===
Bot Name: EzLang-Test-Bot
Command Prefix: !
Test Mode: full

=== Initializing Command System ===
Registered 10 commands:
  !ping - Test bot responsiveness
  !help - Show this help message
  ...

⚠️  ERROR: No bot token provided!

[Instructions for getting a token]

Bot is running in DEMO MODE - Discord features unavailable.

Testing command handlers:
• PING: 🏓 Pong! Bot is responsive!
• MATH: Math examples: ...
• RANDOM: 🎲 Random number: 42
• COUNT: Counting: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10

✓ All command handlers functional

Demo complete. Provide BOT_TOKEN to test Discord integration.
```

### Discord API Test Bot (With Token)

```
✅ Bot token provided - Starting Discord connection...

Initializing Discord.js client with intents:
  • Guilds
  • GuildMessages
  • MessageContent

Starting bot...

╔════════════════════════════════════════════════════════════════╗
║                   BOT IS NOW ONLINE                           ║
╚════════════════════════════════════════════════════════════════╝

The bot is now listening for Discord events!

Try these commands in your Discord server:
  !ping - Test bot response
  !help - Show all commands
  !test - Run comprehensive tests
  !info - Show bot information

The bot will remain online until you stop the process (Ctrl+C)
```

---

## Troubleshooting

### Issue: "No such file or directory"
**Solution**: Make sure you're running from the EzLang root directory:
```bash
cd /path/to/EasyLang
ezlang examples/comprehensive-test-bot.ez
```

### Issue: "Bot token invalid"
**Solution**:
1. Verify your token is correct (no extra spaces)
2. Ensure bot is not deactivated in Discord Developer Portal
3. Check token hasn't been regenerated

### Issue: "Missing Message Content Intent"
**Solution**:
1. Go to Discord Developer Portal
2. Select your application
3. Go to "Bot" section
4. Scroll to "Privileged Gateway Intents"
5. Enable "Message Content Intent"
6. Save changes

### Issue: "Bot doesn't respond to commands"
**Solution**:
1. Ensure bot has been invited to your server
2. Check bot has "Send Messages" permission in the channel
3. Verify you're using the correct command prefix (default: `!`)
4. Make sure bot is online (check user list)

### Issue: Tests run but show errors
**Solution**:
1. Check the error message for specific function
2. Verify TypeScript compilation succeeded: `npm run build`
3. Run tests: `npm test`
4. Check for syntax errors in `.ez` files

---

## Testing Checklist

Use this checklist to verify comprehensive testing:

### Language Features
- [ ] Run `comprehensive-test-bot.ez` successfully
- [ ] All 20 sections complete without errors
- [ ] See final success message with all ✓ markers

### Discord Integration (Optional)
- [ ] Run `discord-api-test-bot.ez` in demo mode
- [ ] All command handlers show as functional
- [ ] Obtain Discord bot token
- [ ] Run bot with actual token
- [ ] Bot shows "ONLINE" status
- [ ] Test at least 3 commands in Discord
  - [ ] `!ping` responds
  - [ ] `!help` shows command list
  - [ ] `!test` runs and shows results

### Custom Arguments
- [ ] Test with custom prefix: `PREFIX=>`
- [ ] Test with custom bot name: `NAME=MyTestBot`
- [ ] Test multiple arguments at once

### Edge Cases
- [ ] Run with no arguments (defaults work)
- [ ] Run with invalid token (graceful error)
- [ ] Interrupt bot with Ctrl+C (clean shutdown)

---

## Performance Benchmarks

Expected performance on modern hardware:

| Test | Duration | Operations |
|------|----------|------------|
| Comprehensive Test Bot | 2-5 seconds | 200+ operations |
| Discord Bot Startup | 2-3 seconds | N/A |
| Discord Bot Runtime | Indefinite | Event-driven |
| Large Array Test (100 elements) | <100ms | 100 push operations |
| Factorial(5) | <1ms | 5 recursive calls |
| 100 Random Numbers | <10ms | 100 random() calls |

---

## Advanced Testing

### Stress Testing
```bash
# Test with large command-line arguments
ezlang examples/comprehensive-test-bot.ez \
  BOT_TOKEN=test_token_12345 \
  PREFIX=!! \
  NAME="Super Long Bot Name With Spaces" \
  MAX_COMMANDS=9999
```

### Automated Testing
```bash
# Run both tests in sequence
ezlang examples/comprehensive-test-bot.ez && \
ezlang examples/discord-api-test-bot.ez

# Check exit codes
echo "Test completed with status: $?"
```

### Performance Profiling
```bash
# Time the comprehensive test
time ezlang examples/comprehensive-test-bot.ez
```

---

## Reporting Issues

If you encounter any test failures:

1. Note which section/test failed
2. Capture the full error message
3. Check your EzLang version: `ezlang --version`
4. Check Node.js version: `node --version`
5. Report issue on GitHub with:
   - OS and version
   - Node.js version
   - EzLang version
   - Full error output
   - Command used to run test

---

## Next Steps

After successful testing:

1. ✅ All language features work correctly
2. ✅ Discord integration functions properly
3. ✅ Ready for production use
4. 📝 Start building your own EzLang bots!
5. 📚 Check out the main README for more examples
6. 🚀 Deploy your bot to a server

---

## Additional Resources

- **Main README**: `../README.md` - Full language documentation
- **Example Bots**: `./` - Simple bot examples
- **Test Suite**: `../src/__tests__/` - Unit tests
- **Discord.js Docs**: https://discord.js.org/ - Discord API reference
- **EzLang Guide**: `../docs/` - Language specification

---

**Happy Testing! 🎉**

If all tests pass, your EzLang installation is working perfectly and ready for production use.
