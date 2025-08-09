import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import Stripe from 'stripe';
import AIService from './services/aiService';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// --- Stripe Client ---
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-04-10',
});

// --- OpenAI Client ---
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// --- Stripe Price IDs ---
const STRIPE_PRO_PRICE_ID = process.env.STRIPE_PRO_PRICE_ID || 'price_YOUR_PRO_PLAN_ID';
const STRIPE_ENTERPRISE_PRICE_ID = process.env.STRIPE_ENTERPRISE_PRICE_ID || 'price_YOUR_ENTERPRISE_PLAN_ID';

// --- Database Connection ---
const pool = new Pool({
  user: process.env.DB_USER || 'alt_user',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'altaimate_db',
  password: process.env.DB_PASSWORD || 'password',
  port: parseInt(process.env.DB_PORT || '5432'),
});

// --- Middleware ---
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});
app.use(cors());
app.use(express.json());

// --- API Routes ---

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

app.get('/api/projects', async (req: Request, res: Response) => {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId parameter' });
    }

    try {
      const result = await pool.query(
        'SELECT * FROM projects WHERE user_id = $1 ORDER BY created_at DESC',
        [userId as string]
      );
      res.status(200).json({ projects: result.rows });
    } catch (err) {
      console.error('Error fetching projects:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * @route   POST /api/generate-app
 * @desc    Generate a full-fledged, functional React component based on a prompt.
 * @access  Public
 */
app.post('/api/generate-app', async (req: Request, res: Response) => {
    const { prompt, language, framework, projectType } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Missing prompt' });
    }

    try {
        const result = await AIService.generateCode({
            prompt,
            language,
            framework,
            projectType,
        });
        // The new AIService returns a single 'code' string.
        // To maintain compatibility with the frontend, we'll wrap it in the expected 'files' structure.
        const files = {
            'src/App.tsx': { content: result.code },
            'src/index.css': { content: '/* Add your styles here */' },
            'package.json': { content: JSON.stringify({ name: 'new-project', version: '0.1.0' }, null, 2) }
        };

        res.status(200).json({ files });

    } catch (err: any) {
        console.error('Error generating app:', err);
        res.status(500).json({ error: 'App generation failed', details: err.message });
    }
});

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

app.post('/api/ai-chat', async (req: Request, res: Response) => {
    const { message, context, model } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Missing message' });
    }

    try {
        const systemPrompt = `
You are ALT-AI-MATE, a world-class AI software engineering assistant.
You are helping a user who is working inside a code editor.
Your responses should be helpful, concise, and directly related to their code or question.
Use markdown for code snippets and formatting.

Here is the user's current code context:
\`\`\`
${context || 'No code context provided.'}
\`\`\`
`;
        const completion = await openai.chat.completions.create({
            model: model || 'gpt-4-turbo',
            messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: message }],
        });

        const response = completion.choices[0].message.content;
        res.status(200).json({ response });
    } catch (err: any) {
        console.error('Error in AI chat:', err);
        res.status(500).json({ error: 'AI chat failed', details: err.message });
    }
});

app.post('/api/create-checkout-session', async (req: Request, res: Response) => {
    const { planId, userId } = req.body;

    if (!planId || !userId) {
        return res.status(400).json({ error: 'Missing planId or userId' });
    }

    const priceIdMap: { [key: string]: string } = {
        'pro': STRIPE_PRO_PRICE_ID,
        'enterprise': STRIPE_ENTERPRISE_PRICE_ID,
    };

    const priceId = priceIdMap[planId];

    if (!priceId) {
        return res.status(400).json({ error: 'Invalid planId provided.' });
    }

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'subscription',
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            client_reference_id: userId,
            success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/billing?success=true`,
            cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/billing?canceled=true`,
        });

        res.status(200).json({ sessionId: session.id });
    } catch (err: any) {
        console.error('Error creating Stripe session:', err);
        res.status(500).json({ error: 'Failed to create payment session.', details: err.message });
    }
});

// --- Server Initialization ---
app.listen(port, () => {
  console.log(`🚀 ALT-AI-MATE backend server is listening at http://localhost:${port}`);
});
