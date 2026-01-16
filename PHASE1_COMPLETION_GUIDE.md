# Phase 1 Completion Guide: Import Path Updates

**Task**: Update import paths after codebase reorganization
**Status**: Ready to execute
**Estimated Time**: 2-3 hours
**Prerequisite**: Files already copied to new locations ✓

---

## Overview

Files have been copied from their old locations to the new modular structure. Now we need to update all import statements to point to the new locations. This guide provides the exact changes needed.

---

## Quick Start

### Option 1: Automated Script (Fast)

Create and run this script:

```bash
#!/bin/bash
# fix-imports.sh - Automatically update import paths

cd "$(dirname "$0")/src"

echo "Updating imports in core/runtime files..."
find core/runtime -name "*.ts" -exec sed -i "s|from '../discord'|from '../../discord'|g" {} \;
find core/runtime -name "*.ts" -exec sed -i "s|from '../python'|from '../../python'|g" {} \;
find core/runtime -name "*.ts" -exec sed -i "s|from '../utils'|from '../../utils'|g" {} \;
find core/runtime -name "*.ts" -exec sed -i "s|from '../bridges'|from '../../bridges'|g" {} \;

echo "Updating imports in main index.ts..."
sed -i "s|from './lexer'|from './core/lexer'|g" index.ts
sed -i "s|from './parser'|from './core/parser'|g" index.ts
sed -i "s|from './runtime'|from './core/runtime'|g" index.ts

echo "Updating imports in test files..."
find __tests__ -name "*.ts" -exec sed -i "s|from '../lexer'|from '../core/lexer'|g" {} \;
find __tests__ -name "*.ts" -exec sed -i "s|from '../parser'|from '../core/parser'|g" {} \;
find __tests__ -name "*.ts" -exec sed -i "s|from '../runtime'|from '../core/runtime'|g" {} \;

echo "Updating imports in CLI files..."
find cli -name "*.ts" -exec sed -i "s|from '../lexer'|from '../core/lexer'|g" {} \;
find cli -name "*.ts" -exec sed -i "s|from '../parser'|from '../core/parser'|g" {} \;
find cli -name "*.ts" -exec sed -i "s|from '../runtime'|from '../core/runtime'|g" {} \;

echo "Updating imports in Discord files..."
find discord -name "*.ts" -exec sed -i "s|from '../runtime/discord-|from './extensions/|g" {} \;
find discord -name "*.ts" -exec sed -i "s|from '../../runtime/discord-|from '../extensions/|g" {} \;

echo "Updating imports in extension files..."
find discord/extensions -name "*.ts" -exec sed -i "s|from '../utils'|from '../../utils'|g" {} \;
find discord/extensions -name "*.ts" -exec sed -i "s|from '../bridges'|from '../../bridges'|g" {} \;

echo "Done! Now run: npm run build"
```

Run it:
```bash
chmod +x fix-imports.sh
./fix-imports.sh
```

### Option 2: Manual Updates (Precise)

Follow the file-by-file guide below.

---

## File-by-File Changes

### 1. src/index.ts

**Changes needed**: 3 imports

```typescript
// OLD:
import { Lexer } from './lexer';
import { Parser } from './parser';
import { Runtime } from './runtime';

// NEW:
import { Lexer } from './core/lexer';
import { Parser } from './core/parser';
import { Runtime } from './core/runtime';
```

### 2. src/core/runtime/index.ts

**Changes needed**: ~10 imports

```typescript
// These stay the same (relative to core/runtime):
import { ... } from '../parser/ast';  // ✓ Correct
import { Environment } from './environment';  // ✓ Correct
import { ... } from './values';  // ✓ Correct

// OLD:
import { RuntimeError, TypeError, UndefinedFunctionError } from '../utils/errors';
import { logger } from '../utils/logger';
import { DiscordManager } from '../discord';
import { send, reply, react } from '../discord/commands';
import { EventManager } from '../discord/events';
import { PythonBridge } from '../python';
import { PythonProxy } from '../python/proxy';
import { Lexer } from '../lexer';
import { Parser } from '../parser';

// NEW:
import { RuntimeError, TypeError, UndefinedFunctionError } from '../../utils/errors';
import { logger } from '../../utils/logger';
import { DiscordManager } from '../../discord';
import { send, reply, react } from '../../discord/commands';
import { EventManager } from '../../discord/events';
import { PythonBridge } from '../../python';
import { PythonProxy } from '../../python/proxy';
import { Lexer } from '../lexer';  // Stays same
import { Parser } from '../parser';  // Stays same
```

### 3. src/core/runtime/builtins.ts

**Changes needed**: Multiple Discord imports

Find all imports that reference `../runtime/discord-` and change them:

```typescript
// OLD:
import { ... } from '../runtime/discord-builtins';
import { ... } from '../runtime/discord-extended';
// etc.

// NEW:
import { ... } from '../../discord/extensions/builtins';
import { ... } from '../../discord/extensions/extended';
// etc.
```

Also update:
```typescript
// OLD:
import { ... } from '../utils/...';
// NEW:
import { ... } from '../../utils/...';
```

### 4. src/core/runtime/values.ts

No changes needed (no external imports).

### 5. src/core/runtime/environment.ts

```typescript
// OLD:
import { RuntimeError } from '../utils/errors';
// NEW:
import { RuntimeError } from '../../utils/errors';
```

### 6. src/__tests__/lexer.test.ts

```typescript
// OLD:
import { Lexer } from '../lexer';
// NEW:
import { Lexer } from '../core/lexer';
```

### 7. src/__tests__/parser.test.ts

```typescript
// OLD:
import { Parser } from '../parser';
import { Lexer } from '../lexer';
// NEW:
import { Parser } from '../core/parser';
import { Lexer } from '../core/lexer';
```

### 8. src/__tests__/runtime.test.ts

```typescript
// OLD:
import { Runtime } from '../runtime';
import { Parser } from '../parser';
import { Lexer } from '../lexer';
// NEW:
import { Runtime } from '../core/runtime';
import { Parser } from '../core/parser';
import { Lexer } from '../core/lexer';
```

### 9. src/__tests__/import.test.ts

Same as above - update lexer, parser, runtime imports.

### 10. src/cli/commands.ts

```typescript
// OLD:
import { Lexer } from '../lexer';
import { Parser } from '../parser';
import { Runtime } from '../runtime';
// NEW:
import { Lexer } from '../core/lexer';
import { Parser } from '../core/parser';
import { Runtime } from '../core/runtime';
```

### 11. src/cli/index.ts

Same as commands.ts - update core imports.

### 12. src/discord/index.ts

```typescript
// Add imports from new extension locations:
// OLD (if any):
import { ... } from '../runtime/discord-...';
// NEW:
import { ... } from './extensions/...';
```

### 13. src/discord/events/index.ts

```typescript
// Update any imports that reference old runtime location:
// OLD:
import { ... } from '../runtime/...';
// NEW:
import { ... } from '../../core/runtime/...';
```

### 14. src/discord/commands/index.ts

Same as events - update runtime imports if any.

### 15. All files in src/discord/extensions/

For each file (discord-*.ts):

```typescript
// Update utils imports:
// OLD:
import { ... } from '../../utils/...';
// NEW: (stays the same - already correct)
import { ... } from '../../utils/...';

// Update runtime imports if any:
// OLD:
import { ... } from '../runtime/...';
// NEW:
import { ... } from '../../core/runtime/...';
```

### 16. src/bridges/converter.ts

```typescript
// OLD:
import { ... } from '../runtime/values';
// NEW:
import { ... } from '../core/runtime/values';
```

### 17. src/bridges/serializer.ts

Same as converter.ts.

### 18. src/javascript/loader.ts

```typescript
// OLD:
import { ... } from '../runtime/values';
// NEW:
import { ... } from '../core/runtime/values';
```

### 19. src/packages/manager.ts

```typescript
// OLD (if any):
import { ... } from '../runtime/...';
// NEW:
import { ... } from '../core/runtime/...';
```

### 20. src/packages/resolver.ts

Same as manager.ts.

---

## Verification Steps

After updating imports:

### 1. Check TypeScript compilation

```bash
cd /path/to/EasyLang
npm run build
```

**Expected**: No TypeScript errors.

**If errors occur**: Read the error messages carefully. They will tell you which imports are still wrong.

### 2. Run tests

```bash
npm test
```

**Expected**: All tests pass.

### 3. Try a simple example

Create a test file:
```easylang
// test-basic.ez
var x = 10
var y = 20
print(x + y)
```

Run it:
```bash
npm start run test-basic.ez
```

**Expected**: Prints "30"

---

## Common Issues and Fixes

### Issue: "Cannot find module '../lexer'"

**Fix**: The import path is still pointing to the old location. Update it to:
```typescript
import { Lexer } from '../core/lexer';
```

### Issue: "Cannot find module '../runtime/discord-builtins'"

**Fix**: Discord runtime files moved. Update to:
```typescript
import { ... } from '../discord/extensions/builtins';
// or
import { ... } from '../../discord/extensions/builtins';
// (depending on your current location)
```

### Issue: Circular dependency error

**Fix**: This might happen if imports create a loop. Check the import chain and break the cycle by:
- Moving shared types to a separate file
- Using type-only imports: `import type { ... }`

### Issue: Tests failing

**Fix**:
1. Update test file imports first
2. Make sure test files import from core/* locations
3. Check if any test mocks need updating

---

## Cleanup After Verification

**Only after everything builds and tests pass**, remove old files:

```bash
#!/bin/bash
# cleanup-old-files.sh - Remove old file locations

cd "$(dirname "$0")"

# Create backup first
tar -czf old-structure-backup.tar.gz src/lexer src/parser src/runtime/index.ts src/runtime/environment.ts src/runtime/values.ts src/runtime/builtins.ts src/runtime/discord-*.ts src/discord/events.ts src/discord/commands.ts

echo "Backup created: old-structure-backup.tar.gz"

# Remove old files
rm -rf src/lexer
rm -rf src/parser
rm src/runtime/index.ts
rm src/runtime/environment.ts
rm src/runtime/values.ts
rm src/runtime/builtins.ts
rm src/runtime/discord-*.ts
rm src/discord/events.ts
rm src/discord/commands.ts

echo "Old files removed. If anything breaks, restore from: old-structure-backup.tar.gz"
```

---

## Rename Extension Files

After imports are fixed, rename Discord extension files:

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

Then update any files that import these:
```typescript
// OLD:
import { ... } from './discord-builtins';
// NEW:
import { ... } from './builtins';
```

---

## Success Checklist

- [ ] All imports updated
- [ ] `npm run build` succeeds with no errors
- [ ] `npm test` passes all tests
- [ ] Can run basic .ez example file
- [ ] Discord bot example still works
- [ ] Old files removed (after verification)
- [ ] Extension files renamed
- [ ] Git commit created

---

## Git Commit Message

Once Phase 1 is complete:

```bash
git add .
git commit -m "refactor: reorganize codebase into modular structure (#11)

- Move core language features to src/core/
- Move Discord features to src/discord/
- Create modular structure for managers, structures, builders
- Update all import paths
- Maintain backward compatibility

Phase 1 of 100% Discord API parity implementation.
See IMPLEMENTATION_PLAN.md for full roadmap."
```

---

## Next Steps

After Phase 1 is complete, proceed to Phase 2:

1. Read `IMPLEMENTATION_PLAN.md` section 2.1
2. Begin implementing the 49 missing Discord events
3. Update `test-bot.ez` as features are added
4. Continue following the 24-week roadmap

---

**Good luck with Phase 1!** This is the foundation for all future work.
