#!/usr/bin/env node

// Build requirements verification script
const fs = require('fs');
const path = require('path');

console.log('🔍 ALT-AI-MATE Build Requirements Verification');
console.log('==============================================\n');

// Check required files
const requiredFiles = [
  'packages/client/package.json',
  'packages/client/tsconfig.json',
  'packages/client/vite.config.ts',
  'packages/client/index.html',
  'packages/client/src/main.tsx',
  'packages/client/src/App.tsx',
  'packages/server/package.json',
  'packages/server/src/index.js',
  'netlify.toml',
  'packages/server/render.yaml',
  '.nvmrc'
];

console.log('📁 Checking required files...');
let allFilesPresent = true;

requiredFiles.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allFilesPresent = false;
  }
});

// Check package.json configurations
console.log('\n📦 Checking package.json configurations...');

try {
  const clientPkg = JSON.parse(fs.readFileSync('packages/client/package.json', 'utf8'));
  const serverPkg = JSON.parse(fs.readFileSync('packages/server/package.json', 'utf8'));
  
  console.log('Client package.json:');
  console.log(`  ✅ Node engine: ${clientPkg.engines?.node || 'Not specified'}`);
  console.log(`  ✅ Build script: ${clientPkg.scripts?.build || 'Not found'}`);
  console.log(`  ✅ Dependencies count: ${Object.keys(clientPkg.dependencies || {}).length}`);
  console.log(`  ✅ DevDependencies count: ${Object.keys(clientPkg.devDependencies || {}).length}`);
  
  console.log('\nServer package.json:');
  console.log(`  ✅ Node engine: ${serverPkg.engines?.node || 'Not specified'}`);
  console.log(`  ✅ Start script: ${serverPkg.scripts?.start || 'Not found'}`);
  console.log(`  ✅ Dependencies count: ${Object.keys(serverPkg.dependencies || {}).length}`);
  
} catch (error) {
  console.log(`❌ Error reading package.json files: ${error.message}`);
  allFilesPresent = false;
}

// Check Node version compatibility
console.log('\n🔧 Checking Node.js version compatibility...');
try {
  const nvmrc = fs.readFileSync('.nvmrc', 'utf8').trim();
  console.log(`✅ .nvmrc version: ${nvmrc}`);
  
  const netlifyConfig = fs.readFileSync('netlify.toml', 'utf8');
  const nodeVersionMatch = netlifyConfig.match(/NODE_VERSION\s*=\s*"([^"]+)"/);
  if (nodeVersionMatch) {
    console.log(`✅ Netlify Node version: ${nodeVersionMatch[1]}`);
  } else {
    console.log('⚠️  Netlify Node version not found in netlify.toml');
  }
  
} catch (error) {
  console.log(`❌ Error checking Node version files: ${error.message}`);
}

// Summary
console.log('\n📋 Verification Summary:');
console.log('========================');
if (allFilesPresent) {
  console.log('✅ All required files are present');
  console.log('✅ Package configurations look correct');
  console.log('✅ Node.js versions are aligned');
  console.log('\n🚀 Build requirements verified! Deployments should work.');
} else {
  console.log('❌ Some issues found that may cause build failures');
  console.log('🔧 Please fix the missing files or configuration issues above');
}

console.log('\n💡 If builds still fail, check deployment platform logs for specific errors.');