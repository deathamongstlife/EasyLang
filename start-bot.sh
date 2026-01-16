#!/bin/bash

# ============================================================================
# EasyLang Discord Bot Starter Script
# ============================================================================
# This script helps start the Discord test bot with proper configuration
#
# Usage:
#   ./start-bot.sh              - Start with token from .env file
#   ./start-bot.sh your-token   - Start with provided token
#
# Prerequisites:
#   1. Node.js installed
#   2. Dependencies installed (npm install)
#   3. Project built (npm run build)
#   4. Discord bot token in .env file or provided as argument
# ============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo -e "${BLUE}============================================================================${NC}"
echo -e "${BLUE}EasyLang Discord Bot Starter${NC}"
echo -e "${BLUE}============================================================================${NC}"
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${RED}Error: .env file not found!${NC}"
    echo "Please create a .env file with your Discord bot token:"
    echo "BOT_TOKEN=your_token_here"
    echo "DISCORD_TOKEN=your_token_here"
    exit 1
fi

# Get token from argument or .env file
if [ -n "$1" ]; then
    TOKEN="$1"
    echo -e "${GREEN}✓ Using token from command line argument${NC}"
else
    # Try to read from .env file
    if [ -f ".env" ]; then
        # Try BOT_TOKEN first
        TOKEN=$(grep -E "^BOT_TOKEN=" .env | cut -d '=' -f2- | tr -d '\r' | tr -d ' ')

        # If not found, try DISCORD_TOKEN
        if [ -z "$TOKEN" ]; then
            TOKEN=$(grep -E "^DISCORD_TOKEN=" .env | cut -d '=' -f2- | tr -d '\r' | tr -d ' ')
        fi

        if [ -n "$TOKEN" ]; then
            echo -e "${GREEN}✓ Token loaded from .env file${NC}"
        else
            echo -e "${RED}Error: No token found in .env file!${NC}"
            echo "Please add BOT_TOKEN or DISCORD_TOKEN to your .env file"
            exit 1
        fi
    fi
fi

# Validate token format (Discord tokens are typically 59+ characters)
if [ ${#TOKEN} -lt 50 ]; then
    echo -e "${RED}Error: Token appears to be invalid (too short)${NC}"
    echo "Discord bot tokens are typically 59+ characters long"
    exit 1
fi

echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠ node_modules not found. Installing dependencies...${NC}"
    npm install --include=dev
    echo ""
fi

# Check if dist directory exists
if [ ! -d "dist" ]; then
    echo -e "${YELLOW}⚠ dist directory not found. Building project...${NC}"
    npm run build
    echo ""
fi

# Check if test-bot.ez exists
if [ ! -f "test-bot.ez" ]; then
    echo -e "${RED}Error: test-bot.ez not found!${NC}"
    echo "Make sure you're in the correct directory"
    exit 1
fi

# Check if index.js exists
if [ ! -f "dist/index.js" ]; then
    echo -e "${RED}Error: dist/index.js not found!${NC}"
    echo "The project needs to be built first"
    echo "Run: npm run build"
    exit 1
fi

echo -e "${GREEN}✓ All prerequisites met${NC}"
echo ""
echo -e "${BLUE}Starting Discord bot...${NC}"
echo -e "${YELLOW}Note: Make sure you have enabled all 3 privileged intents in Discord Developer Portal:${NC}"
echo -e "${YELLOW}  1. Presence Intent${NC}"
echo -e "${YELLOW}  2. Server Members Intent${NC}"
echo -e "${YELLOW}  3. Message Content Intent${NC}"
echo ""
echo -e "${BLUE}Bot URL: https://discord.com/developers/applications${NC}"
echo -e "${BLUE}Press Ctrl+C to stop the bot${NC}"
echo ""
echo -e "${BLUE}============================================================================${NC}"
echo ""

# Start the bot
node dist/index.js run test-bot.ez "DISCORD_TOKEN=$TOKEN"
