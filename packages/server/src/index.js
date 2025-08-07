require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const OpenAI = require('openai');
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
const port = process.env.PORT || 3001;

// --- AI and API Key Configuration ---
const internalApiKey = process.env.INTERNAL_API_KEY;

// Initialize AI clients with environment variables
let genAI = null;
let openai = null;
let anthropic = null;

// Initialize Google Gemini
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

// Initialize OpenAI
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

// Initialize Anthropic Claude
if (process.env.ANTHROPIC_API_KEY) {
  anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
}

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
 * @desc    Generates code using various AI models.
 * @access  Protected
 */
app.post('/api/generate-code', authenticateRequest, async (req, res) => {
  const { prompt, projectType, model: modelName, apiKeys } = req.body;
  console.log('Code generation requested:', { prompt, projectType, modelName });

  if (!prompt || !projectType) {
    return res.status(400).json({ error: 'Missing required fields: prompt and projectType' });
  }

  const generationPrompt = `
    You are an expert React developer. Generate a single, complete React component in a single file.
    The component should be functional and self-contained.
    Do not include any explanations, just the raw code.
    The user's request is: "${prompt}".
    The component should be named "App" and exported as the default.
    Start the code with "import React from 'react';".
  `;

  try {
    let text = '';
    
    // Handle different AI models
    if (modelName?.startsWith('gemini')) {
      // Use provided API key or fallback to environment variable
      const geminiApiKey = apiKeys?.gemini || process.env.GEMINI_API_KEY;
      if (!geminiApiKey) {
        return res.status(400).json({ error: 'Gemini API key is required' });
      }
      
      const geminiClient = new GoogleGenerativeAI(geminiApiKey);
      const model = geminiClient.getGenerativeModel({ model: modelName || "gemini-1.5-pro" });
      const result = await model.generateContent(generationPrompt);
      const response = await result.response;
      text = response.text();
      
    } else if (modelName?.startsWith('gpt')) {
      // OpenAI GPT models
      const openaiApiKey = apiKeys?.openai || process.env.OPENAI_API_KEY;
      if (!openaiApiKey) {
        return res.status(400).json({ error: 'OpenAI API key is required' });
      }
      
      const openaiClient = new OpenAI({ apiKey: openaiApiKey });
      const completion = await openaiClient.chat.completions.create({
        model: modelName || 'gpt-4',
        messages: [{ role: 'user', content: generationPrompt }],
        max_tokens: 2000,
      });
      text = completion.choices[0].message.content;
      
    } else if (modelName?.startsWith('claude')) {
      // Anthropic Claude models
      const anthropicApiKey = apiKeys?.anthropic || process.env.ANTHROPIC_API_KEY;
      if (!anthropicApiKey) {
        return res.status(400).json({ error: 'Anthropic API key is required' });
      }
      
      const anthropicClient = new Anthropic({ apiKey: anthropicApiKey });
      const message = await anthropicClient.messages.create({
        model: modelName || 'claude-3-sonnet-20240229',
        max_tokens: 2000,
        messages: [{ role: 'user', content: generationPrompt }],
      });
      text = message.content[0].text;
      
    } else {
      return res.status(400).json({ error: 'Unsupported model type' });
    }

    // Clean up the response to ensure it's just code
    if (text.startsWith('```jsx')) {
      text = text.substring(5, text.length - 3).trim();
    } else if (text.startsWith('```javascript')) {
      text = text.substring(13, text.length - 3).trim();
    } else if (text.startsWith('```')) {
      const firstNewline = text.indexOf('\n');
      const lastBackticks = text.lastIndexOf('```');
      if (firstNewline !== -1 && lastBackticks !== -1) {
        text = text.substring(firstNewline + 1, lastBackticks).trim();
      }
    }

    res.status(200).json({ code: text });
  } catch (error) {
    console.error('Error generating code:', error);
    res.status(500).json({ 
      error: 'Failed to generate code.',
      details: error.message 
    });
  }
});

/**
 * @route   POST /api/ai-chat
 * @desc    Handles interactive AI assistant messages.
 * @access  Protected
 */
app.post('/api/ai-chat', authenticateRequest, async (req, res) => {
  const { message, context, model: modelName, apiKeys } = req.body;
  console.log('AI chat message received:', { message, modelName });

  if (!message) {
    return res.status(400).json({ error: 'Message is required.' });
  }

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

  try {
    let text = '';
    const selectedModel = modelName || 'gemini-pro';
    
    // Handle different AI models
    if (selectedModel.startsWith('gemini')) {
      const geminiApiKey = apiKeys?.gemini || process.env.GEMINI_API_KEY;
      if (!geminiApiKey) {
        return res.status(400).json({ error: 'Gemini API key is required' });
      }
      
      const geminiClient = new GoogleGenerativeAI(geminiApiKey);
      const model = geminiClient.getGenerativeModel({ model: selectedModel });
      const result = await model.generateContent(chatPrompt);
      const response = await result.response;
      text = response.text();
      
    } else if (selectedModel.startsWith('gpt')) {
      const openaiApiKey = apiKeys?.openai || process.env.OPENAI_API_KEY;
      if (!openaiApiKey) {
        return res.status(400).json({ error: 'OpenAI API key is required' });
      }
      
      const openaiClient = new OpenAI({ apiKey: openaiApiKey });
      const completion = await openaiClient.chat.completions.create({
        model: selectedModel,
        messages: [{ role: 'user', content: chatPrompt }],
        max_tokens: 1000,
      });
      text = completion.choices[0].message.content;
      
    } else if (selectedModel.startsWith('claude')) {
      const anthropicApiKey = apiKeys?.anthropic || process.env.ANTHROPIC_API_KEY;
      if (!anthropicApiKey) {
        return res.status(400).json({ error: 'Anthropic API key is required' });
      }
      
      const anthropicClient = new Anthropic({ apiKey: anthropicApiKey });
      const message = await anthropicClient.messages.create({
        model: selectedModel,
        max_tokens: 1000,
        messages: [{ role: 'user', content: chatPrompt }],
      });
      text = message.content[0].text;
      
    } else {
      return res.status(400).json({ error: 'Unsupported model type' });
    }

    res.status(200).json({ response: text });
  } catch (error) {
    console.error('Error with AI chat:', error);
    res.status(500).json({ 
      error: 'Failed to get AI response.',
      details: error.message 
    });
  }
});

/**
 * @route   GET /api/models
 * @desc    Get available AI models
 * @access  Public
 */
app.get('/api/models', (req, res) => {
  const models = [
    // Google Gemini models
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'google', category: 'gemini' },
    { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'google', category: 'gemini' },
    { id: 'gemini-pro', name: 'Gemini Pro', provider: 'google', category: 'gemini' },
    
    // OpenAI models
    { id: 'gpt-4', name: 'GPT-4', provider: 'openai', category: 'gpt' },
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'openai', category: 'gpt' },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'openai', category: 'gpt' },
    
    // Anthropic Claude models
    { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', provider: 'anthropic', category: 'claude' },
    { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet', provider: 'anthropic', category: 'claude' },
    { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', provider: 'anthropic', category: 'claude' },
  ];
  
  res.status(200).json({ models });
});

// --- Server Initialization ---
const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';
app.listen(port, host, () => {
  console.log(`🚀 ALT-AI-MATE backend server is listening at http://${host}:${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});