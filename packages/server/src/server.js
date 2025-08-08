// Compiled from TypeScript - Full Express server
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
app.use(helmet());
const port = 3001;

// --- Middleware ---
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
  res.status(200).json({ status: 'UP', message: 'ALT-AI-MATE server is running smoothly.' });
});

/**
 * @route   POST /api/projects
 * @desc    A placeholder to simulate project creation.
 * @access  Public
 */
app.post('/api/projects', (req, res) => {
    const { name, projectType } = req.body;
    console.log('Received new project:', { name, projectType });
    // In a real app, you would save this to the database.
    res.status(201).json({ message: 'Project created successfully', project: { id: Date.now(), name, projectType } });
});

// --- Server Initialization ---
app.listen(port, () => {
  console.log(`🚀 ALT-AI-MATE backend server is listening at http://localhost:${port}`);
});

module.exports = app;