#!/bin/bash

echo "🚀 Starting optimized build process..."

# Set memory limits
export NODE_OPTIONS="--max-old-space-size=512"

# Clean any existing builds
rm -rf dist node_modules/.cache

# Install dependencies with minimal memory usage
echo "📦 Installing dependencies..."
npm ci --no-audit --no-fund --prefer-offline --ignore-scripts --maxsockets=1 --no-optional

# Build TypeScript (no emit, just check)
echo "🔍 Type checking..."
npx tsc --skipLibCheck --noEmit

# Build with Vite
echo "🏗️ Building application..."
npx vite build --mode production

echo "✅ Build completed successfully!"