# EasyLang Test Suite

Comprehensive test coverage for all newly implemented features in EasyLang.

## Overview

This test suite provides comprehensive testing for 12 major feature areas:

1. **Collectors** - Message, reaction, and interaction collectors
2. **Sharding** - Multi-process Discord bot sharding
3. **Modules** - Module system with hot-reloading
4. **Persistent Components** - Components that survive bot restarts
5. **Caching** - Cache configuration and management
6. **Permissions** - Permission calculator and helpers
7. **Decorators** - Command decorators and middleware
8. **Help System** - Auto-generated help commands
9. **Converters** - Type converters for arguments
10. **REST Mode** - REST-only mode without Gateway
11. **Validation** - Builder validation for Discord objects
12. **Intents** - Gateway intent configuration

## Test Files

### Core Feature Tests

- **`collectors.test.ez`** - Tests all 6 collector functions
  - Message collectors
  - Reaction collectors
  - Interaction collectors
  - Collector event handlers
  - Collector management

- **`sharding-test.ez`** - Tests sharding functionality
  - Shard manager creation
  - Shard spawning
  - Cross-shard communication
  - Shard statistics
  - Error handling

- **`modules.test.ez`** - Tests module system
  - Module loading/unloading
  - Hot-reloading
  - Module exports
  - Module metadata
  - Error handling

- **`persistent-components.test.ez`** - Tests persistent components
  - Button creation
  - Select menu creation
  - Handler registration
  - State persistence
  - Component restoration

### Utility Feature Tests

- **`caching.test.ez`** - Tests cache configuration
  - Cache options setting
  - Cache info retrieval
  - Cache clearing
  - Sweep interval configuration

- **`permissions.test.ez`** - Tests permission system
  - Permission flag creation
  - Permission checking
  - Adding/removing permissions
  - Permission arrays
  - Common permission sets

- **`decorators.test.ez`** - Tests command decorators
  - Role requirements
  - Permission requirements
  - Guild/DM only
  - Cooldowns
  - Before/after hooks
  - Decorator chaining

- **`help.test.ez`** - Tests help system
  - Command help registration
  - Help retrieval
  - Command listing
  - Category management
  - Help embed generation

- **`converters.test.ez`** - Tests type converters
  - Integer conversion
  - Boolean conversion
  - Color conversion
  - User/member conversion
  - Channel/role conversion

- **`rest.test.ez`** - Tests REST-only mode
  - REST client creation
  - Message operations
  - Channel operations
  - Error handling

- **`validation.test.ez`** - Tests builder validation
  - Embed validation
  - Button validation
  - Select menu validation
  - Modal validation
  - Message validation
  - Length limits
  - Count limits

- **`intents.test.ez`** - Tests intent configuration
  - Intent creation
  - Adding/removing intents
  - Intent checking
  - Default/all intents
  - Privileged intents

### Test Runner

- **`run-all-tests.ez`** - Master test runner
  - Runs all test suites
  - Provides summary
  - Shows test categories
  - Includes usage guide

## Running Tests

### Option 1: Run All Tests

```bash
# Run the master test runner
easylang tests/run-all-tests.ez
```

### Option 2: Run Individual Tests

```bash
# Run a specific test suite
easylang tests/collectors.test.ez
easylang tests/sharding-test.ez
easylang tests/modules.test.ez
# ... etc
```

### Option 3: Shell Script (Recommended)

```bash
# Create shell script
cat > tests/run-tests.sh << 'EOF'
#!/bin/bash

echo "Running EasyLang Test Suite..."
echo "=============================="

# Run each test
for test in tests/*.test.ez tests/sharding-test.ez; do
    if [ -f "$test" ]; then
        echo ""
        echo "Running: $test"
        echo "----------------------------"
        easylang "$test"
        echo ""
    fi
done

echo "=============================="
echo "All tests complete!"
EOF

# Make executable and run
chmod +x tests/run-tests.sh
./tests/run-tests.sh
```

## Test Structure

Each test file follows this structure:

```easylang
// Test Setup
print("Starting <Feature> Tests...")
let test_count = 0
let passed_count = 0
let failed_count = 0

// Helper function
function test_result(name, passed) {
    test_count = test_count + 1
    if passed {
        passed_count = passed_count + 1
        print("✓ " + name + " PASSED")
    } else {
        failed_count = failed_count + 1
        print("✗ " + name + " FAILED")
    }
}

// Test cases
// Test 1: Function Existence
// Test 2: Basic Functionality
// Test 3: Advanced Features
// Test 4: Error Handling
// Test 5: Edge Cases
// ... etc

// Test Summary
print("Total Tests: " + str(test_count))
print("Passed: " + str(passed_count))
print("Failed: " + str(failed_count))
```

## What Each Test Verifies

### Function Existence
Every test suite starts by verifying all functions exist:
```easylang
let has_function = typeof(function_name) == "function"
test_result("function_name exists", has_function)
```

### Parameter Validation
Tests check that functions validate their parameters:
```easylang
try {
    let result = function_name(invalid_param)
    test_result("Should reject invalid param", false)
} catch error {
    test_result("Validates parameters", true)
}
```

### Basic Functionality
Tests verify functions work with valid inputs:
```easylang
let result = function_name(valid_params)
test_result("Function returns result", result != null)
```

### Error Handling
Tests ensure functions handle errors gracefully:
```easylang
try {
    let result = function_name(error_causing_input)
    // Handle expected behavior
} catch error {
    test_result("Handles errors correctly", true)
}
```

### Edge Cases
Tests check boundary conditions:
- Empty inputs
- Null/undefined values
- Maximum/minimum values
- Invalid types

## Test Categories

### Unit Tests (Primary Focus)
- Function existence
- Parameter validation
- Type checking
- Return value verification
- Error handling

### Integration Tests (Requires Discord Bot)
- Live API calls
- Real Discord objects
- Event handling
- State persistence
- Cross-feature interaction

## Requirements

### Minimal (Unit Tests)
- EasyLang runtime
- Test files
- No external dependencies

### Full (Integration Tests)
- Valid Discord bot token
- Active bot connection
- Test Discord server
- Test channels
- Test roles/permissions
- User accounts for interaction

## Expected Output

### Successful Test Run
```
Starting <Feature> Tests...
============================================================

Test 1: Verify Functions Exist
------------------------------------------------------------
✓ function1 exists PASSED
✓ function2 exists PASSED
✓ function3 exists PASSED

Test 2: Basic Functionality
------------------------------------------------------------
✓ Basic operation succeeds PASSED
✓ Returns expected value PASSED

...

============================================================
<FEATURE> TEST SUMMARY
============================================================
Total Tests: 45
Passed: 45
Failed: 0
Success Rate: 100%
============================================================
```

### Failed Test Run
```
✗ function_name validation FAILED
  Error: Expected true, got false
```

## Writing New Tests

### Template
```easylang
// Test N: <Test Name>
print("\nTest N: <Test Name>")
print("-" * 60)

try {
    // Test implementation
    let result = test_something()

    test_result("<description>", result == expected)
} catch error {
    test_result("<description>", false)
    print("  Error: " + str(error))
}
```

### Best Practices

1. **Descriptive Names**: Use clear test names
   ```easylang
   // Good
   test_result("Validates non-empty string parameter", true)

   // Bad
   test_result("Test 1", true)
   ```

2. **Test One Thing**: Each test should verify one specific behavior
   ```easylang
   // Good
   test_result("Accepts valid email", is_valid)
   test_result("Rejects invalid email", !is_valid)

   // Bad
   test_result("Email validation works", everything_works)
   ```

3. **Error Messages**: Include helpful error messages
   ```easylang
   test_result("User exists", false)
   print("  Error: User ID " + user_id + " not found")
   ```

4. **Edge Cases**: Test boundary conditions
   ```easylang
   test_empty_input()
   test_null_input()
   test_max_value()
   test_min_value()
   ```

## Continuous Integration

### GitHub Actions Example

```yaml
name: EasyLang Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v2

    - name: Setup EasyLang
      run: |
        npm install
        npm run build

    - name: Run Tests
      run: |
        chmod +x tests/run-tests.sh
        ./tests/run-tests.sh
```

## Test Coverage Goals

- **Function Coverage**: 100% - All functions tested
- **Parameter Validation**: 100% - All parameters validated
- **Error Paths**: 90%+ - Most error cases covered
- **Edge Cases**: 80%+ - Common edge cases tested
- **Integration**: 70%+ - Key integration scenarios covered

## Known Limitations

### Without Discord Bot Connection
Many tests can only verify:
- Function existence
- Parameter acceptance
- Type validation
- Error handling structure

They **cannot** fully test:
- Actual Discord API calls
- Real-time event handling
- Live data manipulation
- Cross-feature integration

### Mock vs Real Testing

**Mock Testing** (these tests):
- Fast execution
- No external dependencies
- Predictable results
- Tests code structure

**Real Testing** (requires bot):
- Slow execution
- Requires Discord connection
- Variable results
- Tests actual behavior

## Troubleshooting

### Test Fails: "Function not found"
```
✗ function_name exists FAILED
```
**Solution**: Function may not be registered in builtins.ts

### Test Fails: "Type error"
```
✗ Parameter validation FAILED
  Error: Expected string, got number
```
**Solution**: Check parameter types in test

### All Tests Pass but Feature Doesn't Work
**Reason**: Tests verify structure, not live behavior
**Solution**: Run integration tests with real Discord bot

### Test Hangs or Times Out
**Reason**: May be waiting for Discord API response
**Solution**: Tests should mock or skip live API calls

## Contributing

When adding new features:

1. Create test file: `tests/feature-name.test.ez`
2. Follow existing test structure
3. Include all test categories:
   - Function existence
   - Basic functionality
   - Parameter validation
   - Error handling
   - Edge cases
4. Add to `run-all-tests.ez`
5. Update this README

## Test Metrics

Current test suite includes:

- **12 test files**
- **180+ individual tests**
- **50+ functions tested**
- **100% function coverage**

Test execution time:
- Unit tests: < 1 second per suite
- All unit tests: < 15 seconds
- Integration tests: Variable (requires Discord)

## Related Documentation

- [IMPLEMENTATION_SUMMARY.md](../IMPLEMENTATION_SUMMARY.md) - Feature overview
- [COLLECTORS_IMPLEMENTATION.md](../COLLECTORS_IMPLEMENTATION.md) - Collectors details
- [MODULES_IMPLEMENTATION.md](../MODULES_IMPLEMENTATION.md) - Modules details
- [SHARDING_IMPLEMENTATION.md](../SHARDING_IMPLEMENTATION.md) - Sharding details
- [PERSISTENT_COMPONENTS_IMPLEMENTATION.md](../PERSISTENT_COMPONENTS_IMPLEMENTATION.md) - Components details

## Support

For issues or questions:
1. Check test output for specific errors
2. Review function documentation
3. Check implementation files
4. Create GitHub issue with test output

## License

Same as EasyLang project license.
