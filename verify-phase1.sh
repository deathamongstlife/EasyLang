#!/bin/bash

echo "================================"
echo "EzLang Phase 1 Verification"
echo "================================"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "❌ node_modules not found. Run: npm install"
    exit 1
fi
echo "✅ node_modules found"

# Check if TypeScript is installed
if [ ! -f "node_modules/.bin/tsc" ]; then
    echo "❌ TypeScript not installed. Run: npm install"
    exit 1
fi
echo "✅ TypeScript installed"

# Check source files
echo ""
echo "Checking source files..."
FILES=(
    "src/lexer/token.ts"
    "src/lexer/keywords.ts"
    "src/lexer/index.ts"
    "src/parser/ast.ts"
    "src/parser/precedence.ts"
    "src/parser/index.ts"
    "src/utils/errors.ts"
    "src/utils/logger.ts"
    "src/types/index.ts"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ $file missing"
        exit 1
    fi
done

# Build the project
echo ""
echo "Building project..."
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Build successful"
else
    echo "❌ Build failed"
    exit 1
fi

# Check dist output
if [ -d "dist" ]; then
    JS_COUNT=$(find dist -name "*.js" | wc -l)
    echo "✅ Generated $JS_COUNT JavaScript files"
else
    echo "❌ dist directory not found"
    exit 1
fi

# Run tests
echo ""
echo "Running tests..."
npm run test:lexer > /tmp/test-output.txt 2>&1
if [ $? -eq 0 ]; then
    TESTS=$(grep -c "=== Test" /tmp/test-output.txt)
    echo "✅ All $TESTS tests passed"
else
    echo "❌ Tests failed"
    cat /tmp/test-output.txt
    exit 1
fi

# Parse example file
echo ""
echo "Parsing example file..."
npx ts-node src/test-example.ts > /tmp/example-output.txt 2>&1
if grep -q "Parsing successful" /tmp/example-output.txt; then
    TOKENS=$(grep "Tokens generated:" /tmp/example-output.txt | awk '{print $3}')
    STMTS=$(grep "AST statements:" /tmp/example-output.txt | awk '{print $3}')
    echo "✅ Example parsed: $TOKENS tokens, $STMTS statements"
else
    echo "❌ Example parsing failed"
    cat /tmp/example-output.txt
    exit 1
fi

# Summary
echo ""
echo "================================"
echo "Phase 1 Verification: SUCCESS ✅"
echo "================================"
echo ""
echo "Summary:"
echo "  • 9 source files implemented"
echo "  • $JS_COUNT JavaScript files compiled"
echo "  • $TESTS tests passing"
echo "  • Example file parsing works"
echo ""
echo "Phase 1 is complete and ready!"
