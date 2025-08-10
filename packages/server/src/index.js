#!/usr/bin/env node

// Redirect script for Render deployment
// This file exists because Render is hardcoded to run 'node src/index.js'

const path = require('path');
const fs = require('fs');

console.log('🚀 ALT-AI-MATE Server Starting...');
console.log('📁 Current directory:', process.cwd());

// Try to find and run the compiled TypeScript
const distPath = path.join(__dirname, '..', 'dist', 'index.js');
const startPath = path.join(__dirname, '..', 'start.js');

if (fs.existsSync(distPath)) {
  console.log('✅ Found compiled TypeScript, starting server...');
  require(distPath);
} else if (fs.existsSync(startPath)) {
  console.log('✅ Using startup script...');
  require(startPath);
} else {
  console.error('❌ No compiled server found!');
  console.error('Available files:', fs.readdirSync(__dirname));
  console.error('Parent directory:', fs.readdirSync(path.join(__dirname, '..')));
  process.exit(1);
}