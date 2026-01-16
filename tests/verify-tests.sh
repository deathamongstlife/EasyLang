#!/bin/bash

echo "========================================="
echo "  Test Suite Verification"
echo "========================================="
echo ""

# Check all test files exist
test_files=(
    "tests/collectors.test.ez"
    "tests/sharding-test.ez"
    "tests/modules.test.ez"
    "tests/persistent-components.test.ez"
    "tests/caching.test.ez"
    "tests/permissions.test.ez"
    "tests/decorators.test.ez"
    "tests/help.test.ez"
    "tests/converters.test.ez"
    "tests/rest.test.ez"
    "tests/validation.test.ez"
    "tests/intents.test.ez"
    "tests/run-all-tests.ez"
    "tests/README.md"
    "tests/run-tests.sh"
)

echo "Checking test files..."
missing=0
for file in "${test_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✓ $file"
    else
        echo "✗ $file (MISSING)"
        missing=$((missing + 1))
    fi
done

echo ""
echo "Summary:"
echo "  Total files: ${#test_files[@]}"
echo "  Found: $((${#test_files[@]} - missing))"
echo "  Missing: $missing"

if [ $missing -eq 0 ]; then
    echo ""
    echo "✓ All test files present!"
    exit 0
else
    echo ""
    echo "✗ Some test files missing!"
    exit 1
fi
