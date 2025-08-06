#!/bin/bash

# ALT-AI-MATE Server Build Script
# Simple build script for the Express.js server

echo "🚀 Starting ALT-AI-MATE server build..."

# Clean any existing node_modules
echo "🧹 Cleaning previous builds..."
rm -rf node_modules

# Install production dependencies only
echo "📦 Installing production dependencies..."
npm install --production --no-audit --no-fund --prefer-offline

echo "✅ Server build completed successfully!"
echo "🎯 Ready to start with: node src/index.js"