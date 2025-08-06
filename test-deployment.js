// Comprehensive deployment test script
const https = require('https');
const http = require('http');

console.log('🧪 ALT-AI-MATE Deployment Test Suite');
console.log('=====================================\n');

// Test function to check URL status
function testUrl(url, description) {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;
    
    const req = protocol.get(url, (res) => {
      console.log(`${description}: ${res.statusCode} ${res.statusMessage}`);
      
      if (res.statusCode === 200) {
        console.log('✅ SUCCESS');
        resolve({ success: true, status: res.statusCode });
      } else if (res.statusCode === 503) {
        console.log('🔄 SERVICE STARTING UP');
        resolve({ success: false, status: res.statusCode, message: 'Starting up' });
      } else {
        console.log('❌ FAILED');
        resolve({ success: false, status: res.statusCode });
      }
    });
    
    req.on('error', (err) => {
      console.log(`${description}: ERROR - ${err.message}`);
      console.log('❌ CONNECTION FAILED');
      resolve({ success: false, error: err.message });
    });
    
    req.setTimeout(10000, () => {
      console.log(`${description}: TIMEOUT`);
      console.log('⏰ REQUEST TIMEOUT');
      req.destroy();
      resolve({ success: false, error: 'Timeout' });
    });
  });
}

// Test code generation API
function testCodeGeneration(baseUrl) {
  return new Promise((resolve) => {
    const postData = JSON.stringify({
      prompt: "Create a simple todo app",
      projectType: "web"
    });
    
    const options = {
      hostname: baseUrl.replace('https://', '').replace('http://', ''),
      port: baseUrl.startsWith('https') ? 443 : 80,
      path: '/api/generate-code',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const protocol = baseUrl.startsWith('https') ? https : http;
    const req = protocol.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log(`Code Generation API: ${res.statusCode} ${res.statusMessage}`);
        if (res.statusCode === 200) {
          console.log('✅ CODE GENERATION WORKING');
          console.log(`📊 Response length: ${data.length} characters`);
        } else {
          console.log('❌ CODE GENERATION FAILED');
        }
        resolve({ success: res.statusCode === 200, data });
      });
    });
    
    req.on('error', (err) => {
      console.log(`Code Generation API: ERROR - ${err.message}`);
      resolve({ success: false, error: err.message });
    });
    
    req.setTimeout(15000, () => {
      console.log('Code Generation API: TIMEOUT');
      req.destroy();
      resolve({ success: false, error: 'Timeout' });
    });
    
    req.write(postData);
    req.end();
  });
}

// Main test function
async function runTests() {
  console.log('🔍 Testing Backend (Render)...');
  console.log('─'.repeat(40));
  
  const backendHealth = await testUrl('https://alt-ai-mate.onrender.com/api/health', 'Backend Health Check');
  
  if (backendHealth.success) {
    console.log('\n🧪 Testing Code Generation...');
    const codeGenTest = await testCodeGeneration('https://alt-ai-mate.onrender.com');
    console.log('');
  }
  
  console.log('🌐 Testing Frontend (Netlify)...');
  console.log('─'.repeat(40));
  
  const frontendTest = await testUrl('https://alt-ai-mate.netlify.app', 'Frontend Application');
  
  console.log('\n📋 Test Summary:');
  console.log('─'.repeat(40));
  console.log(`Backend Health: ${backendHealth.success ? '✅ ONLINE' : '❌ OFFLINE'}`);
  console.log(`Frontend: ${frontendTest.success ? '✅ ONLINE' : '❌ OFFLINE'}`);
  
  if (backendHealth.success && frontendTest.success) {
    console.log('\n🎉 ALL SERVICES ONLINE! Ready for testing.');
  } else if (backendHealth.status === 503) {
    console.log('\n⏳ Backend is still starting up. Please wait a few more minutes.');
  } else {
    console.log('\n⚠️  Some services need attention. Check deployment logs.');
  }
}

// Run the tests
runTests().catch(console.error);