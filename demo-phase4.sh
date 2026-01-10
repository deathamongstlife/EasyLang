#!/bin/bash

# Demonstration script for EzLang Phase 4 (CLI & REPL)
set -e

echo "=========================================="
echo "EzLang Phase 4 - CLI & REPL Demonstration"
echo "=========================================="
echo ""

# Build the project
echo "Building the project..."
npm run build > /dev/null 2>&1
echo "✓ Build complete"
echo ""

# Test 1: Show version
echo "1. Version Information"
echo "   Command: ezlang version"
echo "   Output:"
node dist/index.js version | sed 's/^/   /'
echo ""

# Test 2: Syntax check
echo "2. Syntax Validation"
echo "   Command: ezlang check examples/01-variables-arithmetic.ezlang"
echo "   Output:"
node dist/index.js check examples/01-variables-arithmetic.ezlang 2>&1 | grep -v "Tokenizing\|Parsing" | sed 's/^/   /'
echo ""

# Test 3: Run a simple program
echo "3. Execute Program"
echo "   Command: ezlang run examples/02-functions.ezlang"
echo "   Code:"
cat examples/02-functions.ezlang | sed 's/^/   /'
echo ""
echo "   Output:"
node dist/index.js run examples/02-functions.ezlang 2>&1 | grep -v "Tokenizing\|Parsing\|Executing" | sed 's/^/   /'
echo ""

# Test 4: REPL - Variables and arithmetic
echo "4. REPL - Variables and Arithmetic"
echo "   Commands:"
cat << 'EOF' | sed 's/^/   /'
var x = 10
var y = 20
x + y
x * y
EOF
echo ""
echo "   Output:"
printf "var x = 10\nvar y = 20\nx + y\nx * y\n.exit\n" | node dist/index.js repl 2>&1 | grep -v "Welcome\|Type\|Goodbye" | sed 's/^/   /'
echo ""

# Test 5: REPL - Functions
echo "5. REPL - Function Definition and Call"
echo "   Commands:"
cat << 'EOF' | sed 's/^/   /'
function add(a, b) {
return a + b
}
add(15, 25)
EOF
echo ""
echo "   Output:"
printf "function add(a, b) {\nreturn a + b\n}\nadd(15, 25)\n.exit\n" | node dist/index.js repl 2>&1 | grep -v "Welcome\|Type\|Goodbye" | sed 's/^/   /'
echo ""

# Test 6: REPL - Arrays
echo "6. REPL - Array Operations"
echo "   Commands:"
cat << 'EOF' | sed 's/^/   /'
var nums = [1, 2, 3, 4, 5]
length(nums)
nums[2]
push(nums, 6)
nums
EOF
echo ""
echo "   Output:"
printf "var nums = [1, 2, 3, 4, 5]\nlength(nums)\nnums[2]\npush(nums, 6)\nnums\n.exit\n" | node dist/index.js repl 2>&1 | grep -v "Welcome\|Type\|Goodbye" | sed 's/^/   /'
echo ""

# Test 7: REPL - Special command
echo "7. REPL - Show Variables (.vars command)"
echo "   Commands:"
cat << 'EOF' | sed 's/^/   /'
var name = "Alice"
var age = 25
.vars
EOF
echo ""
echo "   Output (showing custom variables only):"
printf "var name = \"Alice\"\nvar age = 25\n.vars\n.exit\n" | node dist/index.js repl 2>&1 | grep -E "name =|age =" | sed 's/^/   /'
echo ""

echo "=========================================="
echo "Phase 4 Demonstration Complete!"
echo "=========================================="
echo ""
echo "Available Commands:"
echo "  ezlang run <file>    - Execute an EzLang program"
echo "  ezlang repl          - Start interactive REPL"
echo "  ezlang check <file>  - Validate syntax"
echo "  ezlang version       - Show version"
echo "  ezlang help          - Show help"
echo ""
echo "Documentation:"
echo "  CLI.md   - Command-line interface guide"
echo "  REPL.md  - Interactive REPL guide"
echo ""
