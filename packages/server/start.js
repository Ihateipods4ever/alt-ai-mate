#!/usr/bin/env node

// Simple startup script for Render deployment
const path = require('path');
const fs = require('fs');

// Check if dist/index.js exists
const distPath = path.join(__dirname, 'dist', 'index.js');
const srcPath = path.join(__dirname, 'src', 'index.js');

if (fs.existsSync(distPath)) {
  console.log('Starting from compiled TypeScript...');
  require(distPath);
} else if (fs.existsSync(srcPath)) {
  console.log('Starting from source...');
  require(srcPath);
} else {
  console.error('No entry point found! Please run npm run build first.');
  process.exit(1);
}