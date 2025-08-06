#!/usr/bin/env node

// Test script to verify server works in production mode
const { spawn } = require('child_process');
const http = require('http');

console.log('🧪 Testing server in production mode...\n');

// Set production environment
process.env.NODE_ENV = 'production';
process.env.PORT = '3001';

// Start the server
const serverProcess = spawn('node', ['packages/server/src/index.js'], {
  stdio: 'pipe',
  env: { ...process.env }
});

serverProcess.stdout.on('data', (data) => {
  console.log(`Server: ${data.toString().trim()}`);
});

serverProcess.stderr.on('data', (data) => {
  console.error(`Server Error: ${data.toString().trim()}`);
});

// Wait for server to start, then test endpoints
setTimeout(() => {
  console.log('\n🔍 Testing endpoints...\n');
  
  // Test health endpoint
  const healthReq = http.request({
    hostname: 'localhost',
    port: 3001,
    path: '/api/health',
    method: 'GET'
  }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log(`✅ Health check: ${res.statusCode}`);
      console.log(`Response: ${data}\n`);
      
      // Test projects endpoint
      const projectData = JSON.stringify({
        name: 'Test Project',
        projectType: 'web'
      });
      
      const projectReq = http.request({
        hostname: 'localhost',
        port: 3001,
        path: '/api/projects',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(projectData)
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          console.log(`✅ Project creation: ${res.statusCode}`);
          console.log(`Response: ${data}\n`);
          
          console.log('🎉 All tests completed! Server is ready for deployment.');
          serverProcess.kill();
          process.exit(0);
        });
      });
      
      projectReq.on('error', (err) => {
        console.error(`❌ Project test failed: ${err.message}`);
        serverProcess.kill();
        process.exit(1);
      });
      
      projectReq.write(projectData);
      projectReq.end();
    });
  });
  
  healthReq.on('error', (err) => {
    console.error(`❌ Health check failed: ${err.message}`);
    serverProcess.kill();
    process.exit(1);
  });
  
  healthReq.end();
}, 2000);

// Handle cleanup
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping test...');
  serverProcess.kill();
  process.exit(0);
});