#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

echo "🚀 Starting optimized build process..."

# Set memory limits and Node options
export NODE_OPTIONS="--max-old-space-size=1024"
export SKIP_PREFLIGHT_CHECK=true

# Clean any existing builds and caches
echo "🧹 Cleaning build artifacts..."
rm -rf dist node_modules/.cache .vite

# Clear npm cache to fix potential lockfile issues
echo "🔄 Clearing npm cache..."
npm cache clean --force

# Remove package-lock.json and node_modules to fix npm bug with optional dependencies
echo "🔧 Fixing npm optional dependencies bug..."
rm -rf node_modules package-lock.json

# Install dependencies with full resolution, including optional dependencies
echo "📦 Installing dependencies..."
npm install --no-audit --no-fund --include=optional

# Explicitly install the missing Rollup native module for Linux
echo "🔧 Installing Rollup native module for Linux..."
npm install --save-dev @rollup/rollup-linux-x64-gnu --no-audit || echo "⚠️ Optional dependency install failed (expected on non-Linux)"

# Build TypeScript (no emit, just check)
echo "🔍 Type checking..."
npx tsc --skipLibCheck --noEmit

# Build with Vite with additional error handling
echo "🏗️ Building application..."
npx vite build --mode production --logLevel warn

echo "✅ Build completed successfully!"