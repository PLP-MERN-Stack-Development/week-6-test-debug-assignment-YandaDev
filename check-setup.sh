#!/bin/bash

# check-setup.sh - Script to verify development environment setup

echo "🔍 Checking development environment setup..."
echo ""

# Check Node.js
if command -v node &> /dev/null; then
    echo "✅ Node.js: $(node --version)"
else
    echo "❌ Node.js not found. Please install Node.js v18 or higher."
    exit 1
fi

# Check pnpm
if command -v pnpm &> /dev/null; then
    echo "✅ pnpm: $(pnpm --version)"
else
    echo "❌ pnpm not found. Installing pnpm..."
    npm install -g pnpm
    if command -v pnpm &> /dev/null; then
        echo "✅ pnpm installed: $(pnpm --version)"
    else
        echo "❌ Failed to install pnpm. Please install manually: npm install -g pnpm"
        exit 1
    fi
fi

# Check MongoDB (optional check)
if command -v mongod &> /dev/null; then
    echo "✅ MongoDB: $(mongod --version | head -n 1)"
else
    echo "⚠️  MongoDB not found locally. Make sure you have MongoDB Atlas connection or install MongoDB locally."
fi

echo ""
echo "🚀 Environment setup complete! You can now run:"
echo "   pnpm run install-all  # Install all dependencies"
echo "   pnpm run dev          # Start development servers"
echo "   pnpm test             # Run tests"
