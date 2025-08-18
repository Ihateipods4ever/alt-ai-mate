#!/bin/bash

# ALT-AI-MATE Build and Deploy Script
# This script ensures both client and server build successfully before deployment

set -e  # Exit on any error

echo "🚀 Starting ALT-AI-MATE build process..."

# Check Node.js version
echo "📋 Checking Node.js version..."
node --version
npm --version

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Build server
echo "🔧 Building server..."
cd ./packages/server
npm install
npm run build
echo "✅ Server build completed successfully!"

# Build client
echo "🎨 Building client..."
cd ../client
npm run build
echo "✅ Client build completed successfully!"

# Return to root
cd ../..

echo "🎉 All builds completed successfully!"
echo "🚀 Ready for deployment to Render!"

# Display build artifacts
echo "📁 Build artifacts:"
echo "  - Server: packages/server/dist/"
echo "  - Client: packages/client/dist/"

# Verify critical files exist
if [ -f "packages/server/dist/index.js" ]; then
    echo "✅ Server build artifact found"
else
    echo "❌ Server build artifact missing!"
    exit 1
fi

if [ -f "packages/client/dist/index.html" ]; then
    echo "✅ Client build artifact found"
else
    echo "❌ Client build artifact missing!"
    exit 1
fi

echo "🎯 All verification checks passed!"