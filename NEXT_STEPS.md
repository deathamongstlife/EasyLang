# EasyLang: Next Steps for 100% Discord API Parity

**Current Status**: Phase 1 (Reorganization) - 20% Complete
**Last Updated**: 2026-01-16

---

## What Has Been Done

### 1. Planning Documents Created ✓
- **IMPLEMENTATION_PLAN.md**: Comprehensive 24-week plan for achieving 100% feature parity
- **REORGANIZATION_STATUS.md**: Detailed tracking of file migration progress
- **DISCORD_API_COVERAGE_ANALYSIS.md**: Already existed, identifies all missing features

### 2. Directory Structure Created ✓
The new modular structure has been set up:
```
src/
├── core/
│   ├── lexer/
│   ├── parser/
│   └── runtime/
├── discord/
│   ├── api/
│   │   ├── managers/
│   │   ├── structures/
│   │   └── builders/
│   ├── events/
│   ├── commands/
│   ├── components/
│   ├── voice/
│   └── extensions/
```

### 3. Files Copied ✓
All files have been copied to their new locations:
- Lexer files → `src/core/lexer/`
- Parser files → `src/core/parser/`
- Runtime core → `src/core/runtime/`
- Discord runtime files → `src/discord/extensions/`
- Event manager → `src/discord/events/`
- Command handler → `src/discord/commands/`

### 4. Issue Linked ✓
- GitHub Issue #11 is linked to this implementation

---

## What Needs to Be Done Next

### Immediate: Complete Phase 1 (Reorganization)

#### Step 1: Update Import Paths (Critical)

All import statements need to be updated to point to the new file locations. Here's how:

**Option A: Manual Update (Recommended for accuracy)**

1. Update `src/core/runtime/index.ts`:
```typescript
// Change:
import { Program, Statement, ... } from '../parser/ast';
// To:
import { Program, Statement, ... } from '../parser/ast'; // Already correct, stays same

// Change:
import { DiscordManager } from '../discord';
// To:
import { DiscordManager } from '../../discord';

// Change:
import { send, reply, react } from '../discord/commands';
// To:
import { send, reply, react } from '../../discord/commands';

// Change:
import { EventManager } from '../discord/events';
// To:
import { EventManager } from '../../discord/events';

// Change:
import { PythonBridge } from '../python';
// To:
import { PythonBridge } from '../../python';

// Change:
import { Lexer } from '../lexer';
import { Parser } from '../parser';
// To:
import { Lexer } from '../lexer'; // Already correct
import { Parser } from '../parser'; // Already correct
```

2. Update `src/core/runtime/builtins.ts`:
```typescript
// Update all Discord imports from '../runtime/discord-*' to '../../discord/extensions/*'
// Update relative paths as needed
```

3. Update `src/index.ts`:
```typescript
// Change:
import { Lexer } from './lexer';
import { Parser } from './parser';
import { Runtime } from './runtime';
// To:
import { Lexer } from './core/lexer';
import { Parser } from './core/parser';
import { Runtime } from './core/runtime';
```

4. Update all test files in `src/__tests__/`:
```typescript
// Change imports from './lexer', './parser', './runtime'
// To: './core/lexer', './core/parser', './core/runtime'
```

5. Update `src/discord/index.ts` to import from new extension locations

6. Update all files in `src/discord/extensions/` to use correct relative paths

**Option B: Automated Script**

Create a script to find and replace import paths:

```bash
#!/bin/bash
# This script will be helpful but manual verification is still needed

cd src

# Update imports in core/runtime files
find core/runtime -name "*.ts" -exec sed -i "s|from '../discord'|from '../../discord'|g" {} \;
find core/runtime -name "*.ts" -exec sed -i "s|from '../python'|from '../../python'|g" {} \;
find core/runtime -name "*.ts" -exec sed -i "s|from '../utils'|from '../../utils'|g" {} \;

# Update imports in main index.ts
sed -i "s|from './lexer'|from './core/lexer'|g" index.ts
sed -i "s|from './parser'|from './core/parser'|g" index.ts
sed -i "s|from './runtime'|from './core/runtime'|g" index.ts

# Update test imports
find __tests__ -name "*.ts" -exec sed -i "s|from '../lexer'|from '../core/lexer'|g" {} \;
find __tests__ -name "*.ts" -exec sed -i "s|from '../parser'|from '../core/parser'|g" {} \;
find __tests__ -name "*.ts" -exec sed -i "s|from '../runtime'|from '../core/runtime'|g" {} \;
```

#### Step 2: Rename Discord Extension Files

Remove the `discord-` prefix from files in `src/discord/extensions/`:
```bash
cd src/discord/extensions
mv discord-advanced.ts advanced.ts
mv discord-audit.ts audit.ts
mv discord-automod.ts automod.ts
mv discord-builtins.ts builtins.ts
mv discord-cooldowns.ts cooldowns.ts
mv discord-errors.ts errors.ts
mv discord-extended.ts extended.ts
mv discord-polls.ts polls.ts
mv discord-tasks.ts tasks.ts
mv discord-voice.ts voice.ts
mv discord-webhooks.ts webhooks.ts
```

Then update any imports that reference these files.

#### Step 3: Test the Build

```bash
npm run build
```

Fix any TypeScript errors that appear. Common issues:
- Missing import paths
- Circular dependencies
- Type mismatches

#### Step 4: Run Tests

```bash
npm test
npm run test:lexer
npm run test:runtime
```

Fix any failing tests.

#### Step 5: Remove Old Files

**Only after build and tests pass**, remove the old files:
```bash
# Create a backup first!
tar -czf old-structure-backup.tar.gz src/lexer src/parser src/runtime/discord-*.ts

# Then remove old files
rm -rf src/lexer
rm -rf src/parser
rm src/runtime/index.ts
rm src/runtime/environment.ts
rm src/runtime/values.ts
rm src/runtime/builtins.ts
rm src/runtime/discord-*.ts
rm src/discord/events.ts
rm src/discord/commands.ts
```

---

## After Phase 1 Completion: Begin Phase 2

### Week 2-3: Implement Missing Events

Start with the highest priority events:

1. **Create `src/discord/events/all-events.ts`**:
```typescript
/**
 * Complete list of all 79 Discord.js v14 events
 * Implementing missing 49 events
 */

// Existing events (30) are already in src/discord/events/index.ts

// Add missing events:
export const MISSING_EVENTS = {
  // AutoMod (4)
  autoModerationActionExecution: 'autoModerationActionExecution',
  autoModerationRuleCreate: 'autoModerationRuleCreate',
  autoModerationRuleUpdate: 'autoModerationRuleUpdate',
  autoModerationRuleDelete: 'autoModerationRuleDelete',

  // ... (continue with all 49)
};
```

2. **Create event converters for each new event** in `src/discord/events/converter.ts`

3. **Update `EventManager` class** to handle all 79 events

4. **Add runtime functions** for each event in the appropriate extension file

### Week 4-5: Create Manager Classes

Create 40 manager classes in `src/discord/api/managers/`:

1. Start with most critical:
   - `GuildManager.ts` (enhance existing)
   - `ChannelManager.ts` (enhance existing)
   - `MessageManager.ts` (create new)
   - `RoleManager.ts` (enhance existing)

2. Create structure:
```typescript
// Template for manager classes
export class XyzManager {
  private client: Client;
  private cache: Map<string, Xyz>;

  constructor(client: Client) {
    this.client = client;
    this.cache = new Map();
  }

  async fetch(id: string): Promise<Xyz> { }
  async create(data: XyzData): Promise<Xyz> { }
  async delete(id: string): Promise<void> { }
  async update(id: string, data: Partial<XyzData>): Promise<Xyz> { }
}
```

### Week 6-8: Create Structure Classes

Create 120+ structure classes in `src/discord/api/structures/`.

Priority order:
1. Interaction structures (needed for commands)
2. Channel structures (needed for messages)
3. Guild structures
4. Message structures
5. Component structures

### Week 9+: Continue with Builders and Features

Follow the detailed timeline in IMPLEMENTATION_PLAN.md.

---

## Testing Strategy

### Create Test Bot Incrementally

Create `test-bot.ez` (git-ignored) and add features as they're implemented:

```easylang
// test-bot.ez - TEST BOT (DO NOT COMMIT)
// Add to .gitignore!

use discord

var token = env("DISCORD_BOT_TOKEN")
discord_init(token)

// Test new events as they're added
listen autoModerationActionExecution as action {
    print("AutoMod action executed!")
    // Test the new event
}

// Test new commands as they're added
discord_register_command({
    name: "test-autocomplete",
    description: "Test autocomplete feature",
    options: [{
        type: "string",
        name: "choice",
        description: "Pick something",
        autocomplete: true
    }]
})

// Continue adding tests...

discord_start()
```

### Unit Tests

For each new feature, add unit tests:

```typescript
// __tests__/discord-events.test.ts
describe('Discord Events', () => {
  test('autoModerationActionExecution event handler', async () => {
    // Test implementation
  });
});
```

---

## Important Guidelines

### 1. Backward Compatibility
- **CRITICAL**: Do not break existing .ez files
- All existing runtime functions must continue to work
- Maintain the same simple API for users

### 2. Code Quality
- Add JSDoc comments to all public APIs
- Use TypeScript types properly
- Follow existing code style
- Keep functions focused and small

### 3. Testing
- Test each feature before moving to the next
- Run full test suite frequently
- Test with real Discord bot (use test server)

### 4. Documentation
- Update README.md as features are added
- Add examples for each feature category
- Keep IMPLEMENTATION_PLAN.md updated with progress

### 5. Git Workflow
- Commit frequently with clear messages
- Use descriptive branch names
- Link commits to issue #11
- Example: `git commit -m "feat: add automod events (#11)"`

---

## Resources

### Discord.js Documentation
- Events: https://discord.js.org/docs/packages/discord.js/main/ClientEvents:Interface
- Managers: https://discord.js.org/docs/packages/discord.js/main
- Builders: https://discord.js.org/docs/packages/builders/main

### EasyLang Existing Docs
- `DISCORD_API_COVERAGE_ANALYSIS.md` - Gap analysis
- `IMPLEMENTATION_PLAN.md` - 24-week roadmap
- `REORGANIZATION_STATUS.md` - File migration tracking
- `TEST_BOT_SUMMARY.md` - Test bot features
- `DISCORD_BOT_SETUP.md` - Bot setup guide

---

## Quick Start Commands

```bash
# Build the project
npm run build

# Run tests
npm test

# Run specific test suites
npm run test:lexer
npm run test:runtime
npm run test:discord

# Start REPL for testing
npm run start:repl

# Run a .ez file
npm start run example.ez

# Check for TypeScript errors
npx tsc --noEmit
```

---

## Estimated Timeline

- **Phase 1 Completion**: 1-2 days (import updates + testing)
- **Phase 2 (Events)**: 2 weeks
- **Phase 3 (Managers)**: 2 weeks
- **Phase 4 (Structures)**: 3 weeks
- **Phase 5+**: Follow IMPLEMENTATION_PLAN.md timeline

---

## Questions or Issues?

1. Check existing documentation files first
2. Review Discord.js v14 documentation
3. Look at existing code patterns in codebase
4. Refer to GitHub Issue #11 for discussions

---

## Success Criteria for Phase 1

- [ ] All import paths updated
- [ ] `npm run build` succeeds with no errors
- [ ] `npm test` passes all tests
- [ ] Old files removed
- [ ] Can run existing .ez example files
- [ ] No functionality broken

Once Phase 1 is complete, proceed to Phase 2 (Events) in IMPLEMENTATION_PLAN.md.

---

**Good luck! This is a significant undertaking but the structure is now in place to succeed.**
