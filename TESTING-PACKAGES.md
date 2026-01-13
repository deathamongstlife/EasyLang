# Testing Package Integration Commands

This guide shows how to test the new JavaScript and Python package integration commands in the Discord bot.

## Quick Start

### 1. Build the Project
```bash
npm run build
```

### 2. Run the Package Integration Bot
```bash
node dist/index.js run examples/package-integration-bot.ez TOKEN=your_bot_token_here
```

### 3. Test Commands in Discord

Once the bot is online, try these commands:

```
!help          # Shows all available commands
!ping          # Test basic bot responsiveness
```

---

## Testing JavaScript Packages

### Testing Without Packages (Default State)

The bot gracefully handles missing packages. Try these commands without installing anything:

```
!testmoment    # Shows: "moment.js not installed! Install it with: bun add moment"
!testaxios     # Shows: "axios not installed! Install it with: bun add axios"
!testlodash    # Shows: "lodash not installed! Install it with: bun add lodash"
```

**Expected Result:** Friendly error message with installation instructions.

---

### Installing and Testing moment.js

#### Step 1: Install Package
```bash
bun add moment
# or
npm install moment
```

#### Step 2: Rebuild & Restart Bot
```bash
npm run build
node dist/index.js run examples/package-integration-bot.ez TOKEN=your_token
```

#### Step 3: Test in Discord
```
!testmoment
```

**Expected Output:** Rich embed showing:
- Current date/time in multiple formats
- ISO format and Unix timestamp
- Relative time calculations ("2 days ago")
- Date arithmetic (tomorrow, days since date)
- Timezone detection

**Example:**
```
Moment.js Integration Test

Current Date/Time: Monday, January 13, 2026 10:30 AM
ISO Format: 2026-01-13T10:30:00.000Z
Unix Timestamp: 1768195800
Tomorrow: January 14, 2026
Two Days Ago: January 11, 2026 (2 days ago)
Days Since Birthday: 13162 days
Years Since Birthday: 36 years
Timezone: America/New_York
```

---

### Installing and Testing axios

#### Step 1: Install Package
```bash
bun add axios
# or
npm install axios
```

#### Step 2: Rebuild & Restart Bot
```bash
npm run build
node dist/index.js run examples/package-integration-bot.ez TOKEN=your_token
```

#### Step 3: Test in Discord
```
!testaxios
```

**Expected Output:**
1. First message: "Fetching data from GitHub API..."
2. Rich embed showing:
   - GitHub Zen quote (random wisdom)
   - API response status and headers
   - Sample user data from GitHub API

**Example:**
```
Axios HTTP Client Test

GitHub Zen Quote: "Design for failure."
Test API Request: https://api.github.com/zen
Response Status: 200 OK
Content Type: text/plain; charset=utf-8
Sample User Data: @octocat
User Name: The Octocat
Public Repos: 8
Followers: 9284
```

**Note:** This makes real HTTP requests to GitHub's public API.

---

### Installing and Testing lodash

#### Step 1: Install Package
```bash
bun add lodash
# or
npm install lodash
```

#### Step 2: Rebuild & Restart Bot
```bash
npm run build
node dist/index.js run examples/package-integration-bot.ez TOKEN=your_token
```

#### Step 3: Test in Discord
```
!testlodash
```

**Expected Output:** Rich embed demonstrating:
- Array chunking
- Sum and average calculations
- Filtering and grouping
- Deep object access
- Array shuffling
- 300+ available utilities

**Example:**
```
Lodash Utility Library Test

Array Chunking: [[1,2,3],[4,5,6],[7,8,9],[10]]
Sum of Numbers: 55
Average: 5.5
Active Users: Alice, Charlie, Diana
Grouped by Age: 25: 2, 30: 1, 28: 1
Deep Object Access: _.get(nested, 'a.b.c') = "deep value"
Shuffled Array: 3, 1, 5, 2, 4
Other Utilities: throttle, cloneDeep, merge, omit, pick, uniq, flattenDeep, and 300+ more!
```

---

## Testing Python Integration

### Testing Python Commands

```
!testpython    # Shows: "Python integration not yet implemented!"
!testrequests  # Shows: "Python integration not yet implemented!"
```

**Expected Result:** Information about what the command would do if Python bridge was connected, including example code.

**Note:** These commands demonstrate the planned Python integration. To actually use Python packages, you need to set up the Python bridge as described in `PYTHON.md`.

---

## Testing Installation Helper Commands

These commands show users how to install packages:

### JavaScript Package Installation

```
!installjs moment
```

**Expected Output:** Rich embed showing:
- Bun installation command: `bun add moment`
- NPM installation command: `npm install moment`
- Yarn installation command: `yarn add moment`
- Reminder to restart bot after installation

**Note:** Requires Administrator permission

---

### Python Package Installation

```
!installpy requests
```

**Expected Output:** Rich embed showing:
- pip installation command: `pip install requests`
- pip3 installation command: `pip3 install requests`
- Note about Python bridge requirement
- Reminder that Python 3.x is required

**Note:** Requires Administrator permission

---

## Complete Test Workflow

### Test All Features in Order:

```
# 1. Basic Bot Functionality
!ping          # Should reply: "🏓 Pong! Bot is online and responsive!"
!help          # Shows all commands including package integration section
!info          # Shows bot information

# 2. Package Commands (Before Installation)
!testmoment    # Shows installation instructions
!testaxios     # Shows installation instructions
!testlodash    # Shows installation instructions

# 3. Admin Helper Commands
!installjs moment    # Shows how to install moment
!installjs axios     # Shows how to install axios
!installjs lodash    # Shows how to install lodash
!installpy requests  # Shows how to install Python packages

# 4. Install Packages (in terminal)
# Stop the bot (Ctrl+C), then run:
bun add moment axios lodash
npm run build

# 5. Restart Bot and Test Again
# Start bot again, then in Discord:
!testmoment    # Now shows actual date/time data
!testaxios     # Now makes real API requests
!testlodash    # Now shows utility functions

# 6. Test Other Discord Features
!testembed     # Test rich embeds
!testbuttons   # Test button interactions
!testselect    # Test select menus
!testmodal     # Test modal forms
```

---

## Troubleshooting

### Package Not Found Error

**Problem:** Bot says package is not installed even after running `bun add <package>`

**Solution:**
1. Verify package is in `package.json` dependencies
2. Run `npm run build` to recompile TypeScript
3. Restart the bot
4. Check `node_modules` folder contains the package

---

### TypeScript Build Errors

**Problem:** `npm run build` fails with module errors

**Solution:**
```bash
# Install type definitions (if needed)
bun add -D @types/lodash

# Clean and rebuild
npm run clean
npm run build
```

---

### HTTP Request Fails (axios)

**Problem:** `!testaxios` shows error even with axios installed

**Solution:**
1. Check internet connection
2. Verify GitHub API is accessible: `curl https://api.github.com/zen`
3. Check for rate limiting
4. Try again after a few minutes

---

### Bot Doesn't Respond

**Problem:** Bot is online but doesn't respond to commands

**Solution:**
1. Verify Message Content Intent is enabled in Discord Developer Portal
2. Check bot has permission to send messages in the channel
3. Make sure you're using `!` prefix (exclamation mark)
4. Check console for error messages

---

## Expected Results Summary

| Command | Without Package | With Package Installed |
|---------|----------------|----------------------|
| `!testmoment` | ❌ Error message | ✅ Date/time data |
| `!testaxios` | ❌ Error message | ✅ API data |
| `!testlodash` | ❌ Error message | ✅ Utility demos |
| `!testpython` | ℹ️ Not implemented | ℹ️ Not implemented |
| `!testrequests` | ℹ️ Not implemented | ℹ️ Not implemented |
| `!installjs` | ✅ Installation help | ✅ Installation help |
| `!installpy` | ✅ Installation help | ✅ Installation help |

---

## Performance Notes

### Package Load Times

- **moment.js**: ~50ms first load, cached afterward
- **axios**: ~30ms first load, cached afterward
- **lodash**: ~20ms first load, cached afterward

### HTTP Request Times

- **!testaxios**: 200-500ms (depends on GitHub API response time)
- Makes 2 API calls: `/zen` and `/users/octocat`

---

## Advanced Testing

### Test Multiple Bots

You can run multiple instances with different tokens:

```bash
# Terminal 1
node dist/index.js run examples/package-integration-bot.ez TOKEN=bot1_token

# Terminal 2
node dist/index.js run examples/package-integration-bot.ez TOKEN=bot2_token
```

### Test Rate Limiting

Try rapid-fire axios commands to test rate limit handling:

```
!testaxios
!testaxios
!testaxios
```

Discord should handle rate limiting gracefully.

---

## Package Integration Examples

### What Each Package is Good For

**moment.js**
- Birthday calculators
- Event scheduling
- Reminder bots
- Timezone conversions
- Relative time displays

**axios**
- Weather bots
- News fetchers
- API integrations
- Web scrapers
- Status checkers

**lodash**
- Data processing
- Complex calculations
- Array/object manipulation
- Performance optimization
- Utility functions

---

## Next Steps

After testing these packages, try:

1. **Add your own package** - Follow the pattern in `builtins.ts`
2. **Extend existing commands** - Add more features to the test commands
3. **Create custom commands** - Use packages in your own bot logic
4. **Connect Python bridge** - Enable Python package integration (see PYTHON.md)

---

## Related Documentation

- **PACKAGE-INTEGRATION.md** - Full package integration guide
- **DISCORD-FEATURES.md** - Complete Discord API feature list
- **PYTHON.md** - Python bridge setup instructions
- **README.md** - Project overview

---

**Happy Testing!** 🚀

If you encounter any issues, check the console output for detailed error messages.
