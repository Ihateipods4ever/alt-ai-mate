require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const port = process.env.PORT || 3001;

// --- AI and API Key Configuration ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const internalApiKey = process.env.INTERNAL_API_KEY;

// --- Middleware ---
// Authentication middleware to protect AI endpoints
const authenticateRequest = (req, res, next) => {
  const apiKey = req.headers['x-internal-api-key'];
  if (!internalApiKey || !apiKey || apiKey !== internalApiKey) {
    console.warn('Unauthorized request blocked.');
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// Enable CORS for all routes to allow the frontend to connect
app.use(cors());
// Parse JSON bodies for API requests
app.use(express.json());

// --- API Routes ---

/**
 * @route   GET /api/health
 * @desc    Health check endpoint to ensure the server is running.
 * @access  Public
 */
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'UP', 
    message: 'ALT-AI-MATE server is running smoothly.',
    dbStatus: 'Not Available (using mock data)'
  });
});

/**
 * @route   POST /api/projects
 * @desc    Create a new project
 * @access  Public
 */
app.post('/api/projects', (req, res) => {
    const { name, projectType, userId } = req.body;
    console.log('Received new project:', { name, projectType, userId });
    
    if (!name || !projectType) {
      return res.status(400).json({ error: 'Missing required fields: name and projectType' });
    }
    
    const newProject = {
        id: `proj_${Date.now()}`,
        name,
        project_type: projectType,
        user_id: userId || 'anonymous',
        created_at: new Date().toISOString(),
        status: 'Created'
    };
    
    res.status(201).json({ 
        message: 'Project created successfully', 
        project: newProject 
    });
});

/**
 * @route   POST /api/generate-code
 * @desc    Generates code using the Gemini AI model.
 * @access  Protected
 */
app.post('/api/generate-code', authenticateRequest, async (req, res) => {
  const { prompt, projectType, model: modelName } = req.body;
  console.log('Code generation requested:', { prompt, projectType, modelName });

  if (!prompt || !projectType) {
    return res.status(400).json({ error: 'Missing required fields: prompt and projectType' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: modelName || "gemini-1.5-pro" });
    const generationPrompt = `
      You are an expert React developer. Generate a single, complete React component in a single file.
      The component should be functional and self-contained.
      Do not include any explanations, just the raw code.
      The user's request is: "${prompt}".
      The component should be named "App" and exported as the default.
      Start the code with "import React from 'react';".
    `;
    
    const result = await model.generateContent(generationPrompt);
    const response = await result.response;
    let text = response.text();

    // Clean up the response to ensure it's just code
    if (text.startsWith('```jsx')) {
      text = text.substring(5, text.length - 3).trim();
    } else if (text.startsWith('```javascript')) {
        text = text.substring(13, text.length - 3).trim();
    }

    res.status(200).json({ code: text });
  } catch (error) {
    console.error('Error generating code with Gemini:', error);
    res.status(500).json({ error: 'Failed to generate code.' });
  }
});

/**
 * @route   POST /api/ai-chat
 * @desc    Handles interactive AI assistant messages.
 * @access  Protected
 */
app.post('/api/ai-chat', authenticateRequest, async (req, res) => {
  const { message, context } = req.body;
  console.log('AI chat message received:', { message });

  if (!message) {
    return res.status(400).json({ error: 'Message is required.' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const chatPrompt = `
      You are a helpful AI coding assistant named ALT-AI-MATE.
      The user is asking for help with their code.
      The user's current code is:
      ---
      ${context}
      ---
      The user's question is: "${message}"
      Provide a concise and helpful response. Do not include your own name in the response.
    `;

    const result = await model.generateContent(chatPrompt);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ response: text });
  } catch (error) {
    console.error('Error with AI chat:', error);
    res.status(500).json({ error: 'Failed to get AI response.' });
  }
});

// --- Server Initialization ---
const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';
app.listen(port, host, () => {
  console.log(`🚀 ALT-AI-MATE backend server is listening at http://${host}:${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});