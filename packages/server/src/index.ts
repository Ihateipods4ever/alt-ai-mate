import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import helmet from 'helmet';
const app = express();
const port = 3001;

// --- Database Connection ---
// In a production app, these details should come from environment variables.
const pool = new Pool({
  user: 'alt_user',
  host: 'localhost',
  database: 'altaimate_db',
  password: 'password',
  port: 5432,
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
app.use(helmet());

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
    const { name, projectType, userId } = req.body; // Assuming userId is passed for now

    if (!name || !projectType || !userId) {
      return res.status(400).json({ error: 'Missing required fields: name, projectType, and userId' });
    }

    try {
      const result = await pool.query(
        'INSERT INTO projects (name, project_type, user_id) VALUES ($1, $2, $3) RETURNING *',
        [name, projectType, userId]
      );
      res.status(201).json({ message: 'Project created successfully', project: result.rows[0] });
    } catch (err) {
      console.error('Error creating project:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
});


// --- Server Initialization ---
app.listen(port, () => {
  console.log(`🚀 ALT-AI-MATE backend server is listening at http://localhost:${port}`);
});