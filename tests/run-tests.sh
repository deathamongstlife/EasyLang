#!/bin/bash

# ====================================
# EasyLang Test Suite Runner
# ====================================
# Runs all test files sequentially
# Created: 2026-01-16

echo "=========================================================================="
echo "                    EASYLANG COMPREHENSIVE TEST SUITE                    "
echo "=========================================================================="
echo ""
echo "Running all test suites for newly implemented features..."
echo "Started: $(date)"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
total_suites=0
passed_suites=0
failed_suites=0

# Function to run a test suite
run_test_suite() {
    local name=$1
    local file=$2

    echo ""
    echo "=========================================================================="
    echo "  TEST SUITE: $name"
    echo "=========================================================================="
    echo "File: $file"
    echo ""

    ((total_suites++))

    if [ ! -f "$file" ]; then
        echo -e "${RED}✗ Test file not found: $file${NC}"
        ((failed_suites++))
        return 1
    fi

    # Run the test
    if easylang "$file"; then
        echo -e "${GREEN}✓ Test suite completed${NC}"
        ((passed_suites++))
    else
        echo -e "${RED}✗ Test suite failed${NC}"
        ((failed_suites++))
    fi
}

# Run all test suites
echo "=========================================================================="
echo "                         RUNNING TEST SUITES                             "
echo "=========================================================================="

run_test_suite "Collectors" "tests/collectors.test.ez"
run_test_suite "Sharding" "tests/sharding-test.ez"
run_test_suite "Modules" "tests/modules.test.ez"
run_test_suite "Persistent Components" "tests/persistent-components.test.ez"
run_test_suite "Caching" "tests/caching.test.ez"
run_test_suite "Permissions" "tests/permissions.test.ez"
run_test_suite "Decorators" "tests/decorators.test.ez"
run_test_suite "Help System" "tests/help.test.ez"
run_test_suite "Type Converters" "tests/converters.test.ez"
run_test_suite "REST-only Mode" "tests/rest.test.ez"
run_test_suite "Builder Validation" "tests/validation.test.ez"
run_test_suite "Intents Configuration" "tests/intents.test.ez"

# Summary
echo ""
echo ""
echo "=========================================================================="
echo "                          TEST SUITE SUMMARY                             "
echo "=========================================================================="
echo "Total Test Suites: $total_suites"
echo "Passed: $passed_suites"
echo "Failed: $failed_suites"
echo ""

if [ $failed_suites -eq 0 ]; then
    echo -e "${GREEN}✓ ALL TEST SUITES PASSED${NC}"
    exit_code=0
else
    echo -e "${RED}✗ SOME TEST SUITES FAILED${NC}"
    exit_code=1
fi

echo ""
echo "=========================================================================="
echo "Completed: $(date)"
echo "=========================================================================="

exit $exit_code
