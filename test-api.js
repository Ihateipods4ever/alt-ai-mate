// Simple test to verify our API endpoints work
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const app = express();
const port = 3002; // Different port to avoid conflicts

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Test health endpoint
app.get('/api/health', (req, res) => {
  console.log('✅ Health check called');
  res.json({ 
    status: 'UP', 
    message: 'ALT-AI-MATE server is running smoothly.',
    timestamp: new Date().toISOString()
  });
});

// Test code generation endpoint
app.post('/api/generate-code', (req, res) => {
  const { prompt, projectType } = req.body;
  console.log('✅ Code generation called:', { prompt, projectType });
  
  if (!prompt || !projectType) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const sampleCode = `// Generated ${projectType} app based on: ${prompt}
import React from 'react';

function App() {
  return (
    <div>
      <h1>Your ${projectType} App</h1>
      <p>Built based on: ${prompt}</p>
      <button onClick={() => alert('Hello World!')}>
        Click me!
      </button>
    </div>
  );
}

export default App;`;

  setTimeout(() => {
    res.json({ 
      code: sampleCode,
      message: 'Code generated successfully',
      projectType,
      prompt
    });
  }, 1000);
});

// Test AI chat endpoint
app.post('/api/ai-chat', (req, res) => {
  const { message } = req.body;
  console.log('✅ AI Chat called:', message);
  
  if (!message) {
    return res.status(400).json({ error: 'Missing message' });
  }
  
  const response = `I understand you're asking about "${message}". This is a test response to verify the AI chat endpoint is working correctly!`;
  
  setTimeout(() => {
    res.json({ 
      response,
      timestamp: new Date().toISOString()
    });
  }, 500);
});

app.listen(port, () => {
  console.log(`🚀 Test server running at http://localhost:${port}`);
  console.log('📋 Available endpoints:');
  console.log('  GET  /api/health');
  console.log('  POST /api/generate-code');
  console.log('  POST /api/ai-chat');
});