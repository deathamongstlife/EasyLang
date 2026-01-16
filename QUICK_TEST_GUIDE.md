# Quick Test Guide

## Run All Tests

```bash
./tests/run-tests.sh
```

## Run Individual Tests

```bash
# Collectors
easylang tests/collectors.test.ez

# Sharding
easylang tests/sharding-test.ez

# Modules
easylang tests/modules.test.ez

# Persistent Components
easylang tests/persistent-components.test.ez

# Caching
easylang tests/caching.test.ez

# Permissions
easylang tests/permissions.test.ez

# Decorators
easylang tests/decorators.test.ez

# Help System
easylang tests/help.test.ez

# Type Converters
easylang tests/converters.test.ez

# REST Mode
easylang tests/rest.test.ez

# Validation
easylang tests/validation.test.ez

# Intents
easylang tests/intents.test.ez
```

## Test Coverage

| Feature | Tests | Coverage |
|---------|-------|----------|
| Collectors | 45+ | Functions, handlers, types |
| Sharding | 8 | Manager, spawning, stats |
| Modules | 45+ | Loading, reloading, exports |
| Persistent Components | 45+ | Buttons, selects, handlers |
| Caching | 40+ | Options, clearing, sweeping |
| Permissions | 45+ | Flags, checking, manipulation |
| Decorators | 45+ | Requirements, cooldowns, hooks |
| Help System | 45+ | Registration, retrieval, embeds |
| Converters | 45+ | Int, bool, color, Discord types |
| REST Mode | 45+ | Client, messages, channels |
| Validation | 45+ | Embeds, buttons, selects, limits |
| Intents | 45+ | Creation, manipulation, checking |

## Quick Commands

```bash
# Make test runner executable
chmod +x tests/run-tests.sh

# Run all tests with summary
./tests/run-tests.sh

# Count test files
ls tests/*.test.ez tests/sharding-test.ez | wc -l

# Check test file sizes
ls -lh tests/*.test.ez
```

## What Tests Verify

- ✅ Function existence
- ✅ Parameter validation
- ✅ Type checking
- ✅ Error handling
- ✅ Edge cases
- ✅ Return values

## Test Results Format

```
✓ Test Name PASSED    - Success
✗ Test Name FAILED    - Failure
  Error: <message>    - Error details
```

## Documentation

- `tests/README.md` - Full testing guide
- `TEST_SUITE_COMPLETE.md` - Implementation summary
- Each test file - Inline documentation

## Quick Stats

- **Test Files**: 12
- **Total Tests**: 540+
- **Functions Tested**: 50+
- **Lines of Code**: 5,100+
- **Success Rate Target**: 100%
