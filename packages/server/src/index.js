const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3001;

// --- Middleware ---
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

// --- Server Initialization ---
const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';
app.listen(port, host, () => {
  console.log(`🚀 ALT-AI-MATE backend server is listening at http://${host}:${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});