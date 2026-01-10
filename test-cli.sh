#!/bin/bash

# Test script for EzLang CLI
set -e

echo "================================"
echo "Testing EzLang CLI"
echo "================================"
echo ""

# Build first
echo "Building project..."
npm run build
echo ""

# Test 1: Version command
echo "Test 1: Version command"
echo "Running: node dist/index.js version"
node dist/index.js version
echo ""

# Test 2: Help command
echo "Test 2: Help command"
echo "Running: node dist/index.js help"
node dist/index.js help
echo ""

# Test 3: Check syntax
echo "Test 3: Syntax check"
echo "Running: node dist/index.js check examples/01-variables-arithmetic.ezlang"
node dist/index.js check examples/01-variables-arithmetic.ezlang
echo ""

# Test 4: Run a file
echo "Test 4: Run a file"
echo "Running: node dist/index.js run examples/01-variables-arithmetic.ezlang"
node dist/index.js run examples/01-variables-arithmetic.ezlang
echo ""

# Test 5: Run functions example
echo "Test 5: Run functions example"
echo "Running: node dist/index.js run examples/02-functions.ezlang"
node dist/index.js run examples/02-functions.ezlang
echo ""

# Test 6: Run factorial example
echo "Test 6: Run factorial example"
echo "Running: node dist/index.js run examples/07-factorial.ezlang"
node dist/index.js run examples/07-factorial.ezlang
echo ""

echo "================================"
echo "All CLI tests passed!"
echo "================================"
