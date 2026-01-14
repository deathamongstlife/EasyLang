#!/bin/bash
# Verify the organized bot structure

echo "=========================================="
echo "Organized Bot Structure Verification"
echo "=========================================="
echo ""

BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$BASE_DIR"

ERRORS=0

# Check required files
echo "Checking required files..."

REQUIRED_FILES=(
    "main.ez"
    "config.ez"
    "handlers/command-registry.ez"
    "handlers/event-router.ez"
    "utils/logger.ez"
    "utils/database.ez"
    "utils/permissions.ez"
    "utils/cooldowns.ez"
    "commands/slash/ping.ez"
    "commands/slash/help.ez"
    "commands/slash/userinfo.ez"
    "commands/slash/serverinfo.ez"
    "commands/slash/components.ez"
    "commands/slash/show-modal.ez"
    "commands/message/ping.ez"
    "commands/message/help.ez"
    "commands/message/set.ez"
    "commands/context/userinfo.ez"
    "commands/context/messageinfo.ez"
    "components/buttons.ez"
    "components/selects.ez"
    "components/modals.ez"
    "events/ready.ez"
    "events/messageCreate.ez"
    "events/interactionCreate.ez"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✓ $file"
    else
        echo "✗ $file (MISSING)"
        ERRORS=$((ERRORS + 1))
    fi
done

echo ""
echo "=========================================="
echo "Verification Complete"
echo "=========================================="

if [ $ERRORS -eq 0 ]; then
    echo "✅ All required files present!"
    echo ""
    echo "File count:"
    echo "  - Slash commands: $(find commands/slash -name "*.ez" | wc -l)"
    echo "  - Message commands: $(find commands/message -name "*.ez" | wc -l)"
    echo "  - Context commands: $(find commands/context -name "*.ez" | wc -l)"
    echo "  - Component handlers: $(find components -name "*.ez" | wc -l)"
    echo "  - Event handlers: $(find events -name "*.ez" | wc -l)"
    echo "  - Utility files: $(find utils -name "*.ez" | wc -l)"
    echo "  - Handler files: $(find handlers -name "*.ez" | wc -l)"
    echo ""
    echo "Total .ez files: $(find . -name "*.ez" -not -path "*/main-monolithic-backup.ez" | wc -l)"
    echo ""
    echo "Ready to run: ezlang run main.ez"
    exit 0
else
    echo "❌ $ERRORS file(s) missing!"
    exit 1
fi
