import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import aiService from './services/aiService';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// --- Database Connection ---
const pool = new Pool({
  user: process.env.DB_USER || 'alt_user',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'altaimate_db',
  password: process.env.DB_PASSWORD || 'password',
  port: parseInt(process.env.DB_PORT || '5432'),
});

// --- Middleware ---
// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
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
 * @desc    Health check for server and database connection.
 * @access  Public
 */
app.get('/api/health', async (req: Request, res: Response) => {
  try {
    const client = await pool.connect();
    client.release();
    res.status(200).json({
      status: 'UP',
      message: 'ALT-AI-MATE server is running smoothly.',
      dbStatus: 'Connected'
    });
  } catch (err) {
    console.error('Database connection error:', err);
    res.status(503).json({
      status: 'DOWN',
      message: 'Server is running, but database connection failed.',
      dbStatus: 'Error'
    });
  }
});

/**
 * @route   POST /api/projects
 * @desc    Create a new project in the database.
 * @access  Public
 */
app.post('/api/projects', async (req: Request, res: Response) => {
    const { name, projectType, userId } = req.body;

    if (!name || !projectType || !userId) {
      return res.status(400).json({ error: 'Missing required fields: name, projectType, and userId' });
    }

    try {
      const result = await pool.query(
        'INSERT INTO projects (name, project_type, user_id, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *',
        [name, projectType, userId]
      );
      res.status(201).json({ message: 'Project created successfully', project: result.rows[0] });
    } catch (err) {
      console.error('Error creating project:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * @route   GET /api/projects
 * @desc    Get all projects for a user
 * @access  Public
 */
app.get('/api/projects', async (req: Request, res: Response) => {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId parameter' });
    }

    try {
      const result = await pool.query(
        'SELECT * FROM projects WHERE user_id = $1 ORDER BY created_at DESC',
        [userId]
      );
      res.status(200).json({ projects: result.rows });
    } catch (err) {
      console.error('Error fetching projects:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * @route   POST /api/generate-code
 * @desc    Generate code using AI
 * @access  Public
 */
app.post('/api/generate-code', async (req: Request, res: Response) => {
    const { prompt, language, framework, projectType } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Missing prompt' });
    }

    try {
      const result = await aiService.generateCode({
        prompt,
        language: language || 'javascript',
        framework: framework || 'none',
        projectType: projectType || 'web'
      });

      res.status(200).json(result);
    } catch (err) {
      console.error('Error generating code:', err);
      res.status(500).json({ error: 'Code generation failed' });
    }
});

/**
 * @route   GET /api/models
 * @desc    Get available AI models
 * @access  Public
 */
app.get('/api/models', (req: Request, res: Response) => {
    const models = [
      {
        id: 'gemini-1.5-pro',
        name: 'Gemini 1.5 Pro',
        provider: 'Google',
        available: !!process.env.GEMINI_API_KEY
      },
      {
        id: 'gpt-4',
        name: 'GPT-4',
        provider: 'OpenAI',
        available: !!process.env.OPENAI_API_KEY
      },
      {
        id: 'claude-3-sonnet',
        name: 'Claude 3 Sonnet',
        provider: 'Anthropic',
        available: !!process.env.ANTHROPIC_API_KEY
      }
    ];

    res.status(200).json({ models });
});


// --- Server Initialization ---
app.listen(port, () => {
  console.log(`🚀 ALT-AI-MATE backend server is listening at http://localhost:${port}`);
});