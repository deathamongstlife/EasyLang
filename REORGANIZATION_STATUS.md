# EasyLang Codebase Reorganization Status

**Status**: Phase 1 - In Progress
**Date Started**: 2026-01-16
**Current Step**: File Movement & Import Updates

---

## Overview

This document tracks the codebase reorganization from the flat structure to a well-organized modular architecture as defined in IMPLEMENTATION_PLAN.md.

---

## Phase 1: Directory Structure

### Created Directories

- [x] `src/core/` - Core language features
- [x] `src/core/lexer/` - Tokenization
- [x] `src/core/parser/` - AST generation
- [x] `src/core/runtime/` - Interpreter
- [x] `src/discord/api/` - Discord API wrappers
- [x] `src/discord/api/managers/` - Data managers
- [x] `src/discord/api/structures/` - Data structures
- [x] `src/discord/api/builders/` - Message builders
- [x] `src/discord/events/` - Event system
- [x] `src/discord/commands/` - Commands
- [x] `src/discord/components/` - UI Components
- [x] `src/discord/voice/` - Voice & audio
- [x] `src/discord/extensions/` - Advanced features

---

## Phase 2: File Migration

### Core Language Files

#### Lexer (src/lexer/ → src/core/lexer/)
- [x] index.ts - Copied
- [x] keywords.ts - Copied
- [x] token.ts - Copied
- [ ] Update imports in destination files
- [ ] Remove old files

#### Parser (src/parser/ → src/core/parser/)
- [x] ast.ts - Copied
- [x] index.ts - Copied
- [x] precedence.ts - Copied
- [ ] Update imports in destination files
- [ ] Remove old files

#### Runtime Core (src/runtime/ → src/core/runtime/)
- [x] index.ts - Copied
- [x] environment.ts - Copied
- [x] values.ts - Copied
- [x] builtins.ts - Copied
- [ ] Update imports in destination files
- [ ] Remove old files

### Discord Files

#### Extensions (src/runtime/discord-*.ts → src/discord/extensions/)
- [x] discord-advanced.ts - Copied
- [x] discord-audit.ts - Copied
- [x] discord-automod.ts - Copied
- [x] discord-builtins.ts - Copied
- [x] discord-cooldowns.ts - Copied
- [x] discord-errors.ts - Copied
- [x] discord-extended.ts - Copied
- [x] discord-polls.ts - Copied
- [x] discord-tasks.ts - Copied
- [x] discord-voice.ts - Copied
- [x] discord-webhooks.ts - Copied
- [ ] Update imports in destination files
- [ ] Rename files (remove discord- prefix)
- [ ] Remove old files

#### Events (src/discord/events.ts → src/discord/events/)
- [x] events.ts → events/index.ts - Copied
- [ ] Update imports
- [ ] Remove old file

#### Commands (src/discord/commands.ts → src/discord/commands/)
- [x] commands.ts → commands/index.ts - Copied
- [ ] Update imports
- [ ] Remove old file

---

## Phase 3: Import Path Updates

### Strategy

We need to update imports in ALL files that reference moved files. Here's the mapping:

#### Old → New Import Paths

```typescript
// Lexer
'../lexer' → '../core/lexer'
'../../lexer' → '../../core/lexer'
'./lexer' → './core/lexer'

// Parser
'../parser' → '../core/parser'
'../../parser' → '../../core/parser'
'./parser' → './core/parser'

// Runtime
'../runtime' → '../core/runtime'
'../../runtime' → '../../core/runtime'
'./runtime' → './core/runtime'

// Discord extensions
'../runtime/discord-' → '../discord/extensions/'
'../../runtime/discord-' → '../../discord/extensions/'

// Discord events
'../discord/events' → '../discord/events'
'./discord/events' → './discord/events'

// Discord commands
'../discord/commands' → '../discord/commands'
'./discord/commands' → './discord/commands'
```

### Files Requiring Import Updates

#### Core Files
- [x] src/core/runtime/index.ts - NEEDS UPDATE
- [ ] src/core/runtime/builtins.ts - NEEDS UPDATE
- [ ] src/core/parser/index.ts - NEEDS UPDATE
- [ ] src/index.ts - NEEDS UPDATE

#### Test Files
- [ ] src/__tests__/lexer.test.ts - NEEDS UPDATE
- [ ] src/__tests__/parser.test.ts - NEEDS UPDATE
- [ ] src/__tests__/runtime.test.ts - NEEDS UPDATE
- [ ] src/__tests__/import.test.ts - NEEDS UPDATE

#### CLI Files
- [ ] src/cli/commands.ts - NEEDS UPDATE
- [ ] src/cli/index.ts - NEEDS UPDATE

#### Discord Files
- [ ] src/discord/index.ts - NEEDS UPDATE
- [ ] src/discord/events/index.ts - NEEDS UPDATE
- [ ] src/discord/commands/index.ts - NEEDS UPDATE
- [ ] All src/discord/extensions/*.ts files - NEEDS UPDATE

#### Bridge Files
- [ ] src/bridges/converter.ts - NEEDS UPDATE
- [ ] src/bridges/serializer.ts - NEEDS UPDATE

#### JavaScript Files
- [ ] src/javascript/loader.ts - NEEDS UPDATE
- [ ] src/javascript/index.ts - NEEDS UPDATE

#### Package Files
- [ ] src/packages/manager.ts - NEEDS UPDATE
- [ ] src/packages/resolver.ts - NEEDS UPDATE

#### Python Files
- [ ] src/python/index.ts - NEEDS UPDATE

---

## Phase 4: Cleanup

### Files to Remove (after verification)
- [ ] src/lexer/ (old location)
- [ ] src/parser/ (old location)
- [ ] src/runtime/index.ts (moved to core)
- [ ] src/runtime/environment.ts (moved to core)
- [ ] src/runtime/values.ts (moved to core)
- [ ] src/runtime/builtins.ts (moved to core)
- [ ] src/runtime/discord-*.ts (moved to discord/extensions)
- [ ] src/discord/events.ts (moved to events/index.ts)
- [ ] src/discord/commands.ts (moved to commands/index.ts)

---

## Phase 5: Verification

### Build Tests
- [ ] Run `npm run build` - Must succeed
- [ ] Verify no TypeScript errors
- [ ] Check for circular dependencies

### Unit Tests
- [ ] Run `npm test` - All tests must pass
- [ ] Run `npm run test:lexer`
- [ ] Run `npm run test:runtime`
- [ ] Run `npm run test:discord`

### Integration Tests
- [ ] Test with example .ez files
- [ ] Test Discord bot startup
- [ ] Test Python bridge integration

---

## Current Blockers

1. **Import Path Updates**: Need to systematically update all import paths
   - Estimated files: ~30-40 files
   - Approach: Update in batches, test after each batch

2. **Circular Dependencies**: Need to check for any new circular deps created by reorganization

3. **Type Exports**: Need to ensure all necessary types are re-exported from new locations

---

## Next Immediate Steps

1. Update import paths in src/core/runtime/index.ts
2. Update import paths in src/core/runtime/builtins.ts
3. Update import paths in src/discord/index.ts
4. Create proper re-export index files
5. Test build
6. Continue with remaining files

---

## Notes

- Maintaining backward compatibility is critical
- All existing .ez example files must continue to work
- Git history should be preserved where possible
- This is a non-breaking change - only internal structure changes

---

**Last Updated**: 2026-01-16
**Next Review**: After completing import updates
