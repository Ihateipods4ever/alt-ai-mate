#!/bin/bash

echo "🧹 Cleaning up build artifacts to reduce memory usage..."

# Remove existing node_modules and package-lock files
find . -name "node_modules" -type d -exec rm -rf {} + 2>/dev/null || true
find . -name "package-lock.json" -delete 2>/dev/null || true
find . -name ".npm" -type d -exec rm -rf {} + 2>/dev/null || true

# Clean npm cache
npm cache clean --force 2>/dev/null || true

echo "✅ Build cleanup completed!"