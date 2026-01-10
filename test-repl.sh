#!/bin/bash

# Test script for EzLang REPL
set -e

echo "================================"
echo "Testing EzLang REPL"
echo "================================"
echo ""

# Build first
echo "Building project..."
npm run build
echo ""

# Test REPL with piped input
echo "Test: REPL with piped input"
echo "Running REPL commands..."
echo ""

# Create a test input file
cat > /tmp/repl-test.txt <<EOF
var x = 10
var y = 20
x + y
var result = x * y
result
function add(a, b) {
return a + b
}
add(5, 3)
.vars
.exit
EOF

# Run REPL with input
cat /tmp/repl-test.txt | node dist/index.js repl

# Clean up
rm /tmp/repl-test.txt

echo ""
echo "================================"
echo "REPL tests completed!"
echo "================================"
