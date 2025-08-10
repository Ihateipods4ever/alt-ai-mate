import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import OpenAI from 'openai';
import Stripe from 'stripe';
import * as AIService from './services/aiService';

// Load environment variables
dotenv.config();

// Force redeploy - Updated with intelligent code generation

// Force redeploy - Updated with intelligent code generation

const app = express();
const port = process.env.PORT || 3001;

// --- Stripe Client ---
let stripe: Stripe | null = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-07-30.basil',
  });
} else {
  console.warn('STRIPE_SECRET_KEY is not set. Payment features will be disabled.');
}

// --- OpenAI Client ---
let openai: OpenAI | null = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
} else {
  console.warn('OPENAI_API_KEY is not set. Will use user-provided API keys when available.');
}

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
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

app.use(cors());
app.use(express.json());

// Serve static files from the client build directory
const clientBuildPath = path.join(__dirname, '../../client/dist');
app.use(express.static(clientBuildPath));

// --- API Routes ---

/**
 * @route   GET /api/health
 * @desc    Health check endpoint to ensure the server is running.
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
 * @desc    Get all projects for a user.
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
 * @desc    Generate code snippets based on a prompt.
 * @access  Public
 */
app.post('/api/generate-code', async (req: Request, res: Response) => {
  const { prompt, language = 'javascript', framework = 'none', apiKeys } = req.body;
  
  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt' });
  }

  try {
    // Try AI generation first if API keys are available
    if (apiKeys?.openai || openai) {
      try {
        const aiClient = apiKeys?.openai ? new OpenAI({ apiKey: apiKeys.openai }) : openai;
        if (aiClient) {
          console.log('Using AI generation with API key:', apiKeys?.openai ? 'user-provided' : 'server-env');
          const completion = await aiClient.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: `You are an expert ${language} developer. Generate clean, functional, production-ready code based on the user's request. Include proper error handling, comments, and follow best practices. Do not include markdown formatting - return only the raw code.`
              },
              {
                role: 'user',
                content: `Create ${language} code for: ${prompt}${framework !== 'none' ? ` using ${framework}` : ''}`
              }
            ],
          });

          const aiCode = completion.choices[0].message.content;
          if (aiCode) {
            return res.status(200).json({ code: aiCode });
          }
        }
      } catch (error: any) {
        console.error('AI generation failed, falling back to template:');
        console.error('Error details:', error.message);
        console.error('Full error:', error);
      }
    }

    // Fallback to intelligent template generation
    const generateSmartCode = (prompt: string, language: string, framework: string) => {
      const lowerPrompt = prompt.toLowerCase();
      
      // Text Editor
      if (lowerPrompt.includes('text editor') || lowerPrompt.includes('editor')) {
        if (language === 'javascript' || language === 'typescript') {
          return `// Advanced Text Editor Implementation
class TextEditor {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.content = '';
        this.history = [];
        this.historyIndex = -1;
        this.init();
    }

    init() {
        this.createEditor();
        this.setupEventListeners();
        this.setupToolbar();
    }

    createEditor() {
        this.container.innerHTML = \`
            <div class="text-editor">
                <div class="toolbar">
                    <button id="bold-btn" title="Bold">B</button>
                    <button id="italic-btn" title="Italic">I</button>
                    <button id="underline-btn" title="Underline">U</button>
                    <button id="undo-btn" title="Undo">↶</button>
                    <button id="redo-btn" title="Redo">↷</button>
                    <button id="save-btn" title="Save">💾</button>
                    <button id="load-btn" title="Load">📁</button>
                </div>
                <div class="editor-area" contenteditable="true" id="editor"></div>
                <div class="status-bar">
                    <span id="word-count">Words: 0</span>
                    <span id="char-count">Characters: 0</span>
                </div>
            </div>
        \`;

        this.editor = document.getElementById('editor');
        this.updateCounts();
    }

    setupEventListeners() {
        // Text change events
        this.editor.addEventListener('input', () => {
            this.content = this.editor.innerHTML;
            this.updateCounts();
            this.saveToHistory();
        });

        // Keyboard shortcuts
        this.editor.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'b':
                        e.preventDefault();
                        this.toggleFormat('bold');
                        break;
                    case 'i':
                        e.preventDefault();
                        this.toggleFormat('italic');
                        break;
                    case 'u':
                        e.preventDefault();
                        this.toggleFormat('underline');
                        break;
                    case 'z':
                        e.preventDefault();
                        if (e.shiftKey) {
                            this.redo();
                        } else {
                            this.undo();
                        }
                        break;
                    case 's':
                        e.preventDefault();
                        this.save();
                        break;
                }
            }
        });
    }

    setupToolbar() {
        document.getElementById('bold-btn').onclick = () => this.toggleFormat('bold');
        document.getElementById('italic-btn').onclick = () => this.toggleFormat('italic');
        document.getElementById('underline-btn').onclick = () => this.toggleFormat('underline');
        document.getElementById('undo-btn').onclick = () => this.undo();
        document.getElementById('redo-btn').onclick = () => this.redo();
        document.getElementById('save-btn').onclick = () => this.save();
        document.getElementById('load-btn').onclick = () => this.load();
    }

    toggleFormat(command) {
        document.execCommand(command, false, null);
        this.editor.focus();
    }

    updateCounts() {
        const text = this.editor.innerText || '';
        const words = text.trim() ? text.trim().split(/\\s+/).length : 0;
        const chars = text.length;
        
        document.getElementById('word-count').textContent = \`Words: \${words}\`;
        document.getElementById('char-count').textContent = \`Characters: \${chars}\`;
    }

    saveToHistory() {
        this.history = this.history.slice(0, this.historyIndex + 1);
        this.history.push(this.editor.innerHTML);
        this.historyIndex = this.history.length - 1;
        
        // Limit history size
        if (this.history.length > 50) {
            this.history.shift();
            this.historyIndex--;
        }
    }

    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.editor.innerHTML = this.history[this.historyIndex];
            this.updateCounts();
        }
    }

    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.editor.innerHTML = this.history[this.historyIndex];
            this.updateCounts();
        }
    }

    save() {
        const content = this.editor.innerHTML;
        const blob = new Blob([content], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'document.html';
        a.click();
        URL.revokeObjectURL(url);
    }

    load() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.html,.txt';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.editor.innerHTML = e.target.result;
                    this.updateCounts();
                    this.saveToHistory();
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }

    getContent() {
        return this.editor.innerHTML;
    }

    setContent(content) {
        this.editor.innerHTML = content;
        this.updateCounts();
        this.saveToHistory();
    }
}

// CSS Styles (add to your stylesheet)
const editorStyles = \`
.text-editor {
    border: 1px solid #ccc;
    border-radius: 4px;
    font-family: Arial, sans-serif;
}

.toolbar {
    background: #f5f5f5;
    border-bottom: 1px solid #ccc;
    padding: 8px;
    display: flex;
    gap: 4px;
}

.toolbar button {
    padding: 6px 12px;
    border: 1px solid #ccc;
    background: white;
    cursor: pointer;
    border-radius: 3px;
    font-weight: bold;
}

.toolbar button:hover {
    background: #e9e9e9;
}

.editor-area {
    min-height: 300px;
    padding: 12px;
    outline: none;
    line-height: 1.5;
}

.status-bar {
    background: #f5f5f5;
    border-top: 1px solid #ccc;
    padding: 4px 12px;
    font-size: 12px;
    color: #666;
    display: flex;
    gap: 20px;
}
\`;

// Usage Example
const editor = new TextEditor('editor-container');

// Export for module use
export default TextEditor;`;
        }
      }

      // Calculator
      if (lowerPrompt.includes('calculator')) {
        return `// Advanced Calculator Implementation
class Calculator {
    constructor() {
        this.display = '0';
        this.previousValue = null;
        this.operation = null;
        this.waitingForOperand = false;
        this.memory = 0;
    }

    inputNumber(num) {
        if (this.waitingForOperand) {
            this.display = String(num);
            this.waitingForOperand = false;
        } else {
            this.display = this.display === '0' ? String(num) : this.display + num;
        }
        this.updateDisplay();
    }

    inputDecimal() {
        if (this.waitingForOperand) {
            this.display = '0.';
            this.waitingForOperand = false;
        } else if (this.display.indexOf('.') === -1) {
            this.display += '.';
        }
        this.updateDisplay();
    }

    clear() {
        this.display = '0';
        this.previousValue = null;
        this.operation = null;
        this.waitingForOperand = false;
        this.updateDisplay();
    }

    performOperation(nextOperation) {
        const inputValue = parseFloat(this.display);

        if (this.previousValue === null) {
            this.previousValue = inputValue;
        } else if (this.operation) {
            const currentValue = this.previousValue || 0;
            const newValue = this.calculate(currentValue, inputValue, this.operation);

            this.display = String(newValue);
            this.previousValue = newValue;
            this.updateDisplay();
        }

        this.waitingForOperand = true;
        this.operation = nextOperation;
    }

    calculate(firstValue, secondValue, operation) {
        switch (operation) {
            case '+': return firstValue + secondValue;
            case '-': return firstValue - secondValue;
            case '*': return firstValue * secondValue;
            case '/': return secondValue !== 0 ? firstValue / secondValue : 0;
            case '=': return secondValue;
            case '%': return firstValue % secondValue;
            case '^': return Math.pow(firstValue, secondValue);
            default: return secondValue;
        }
    }

    performEquals() {
        const inputValue = parseFloat(this.display);

        if (this.previousValue !== null && this.operation) {
            const newValue = this.calculate(this.previousValue, inputValue, this.operation);
            this.display = String(newValue);
            this.previousValue = null;
            this.operation = null;
            this.waitingForOperand = true;
            this.updateDisplay();
        }
    }

    // Memory functions
    memoryStore() {
        this.memory = parseFloat(this.display);
    }

    memoryRecall() {
        this.display = String(this.memory);
        this.waitingForOperand = true;
        this.updateDisplay();
    }

    memoryClear() {
        this.memory = 0;
    }

    memoryAdd() {
        this.memory += parseFloat(this.display);
    }

    // Scientific functions
    sqrt() {
        const value = parseFloat(this.display);
        this.display = String(Math.sqrt(value));
        this.waitingForOperand = true;
        this.updateDisplay();
    }

    sin() {
        const value = parseFloat(this.display);
        this.display = String(Math.sin(value * Math.PI / 180));
        this.waitingForOperand = true;
        this.updateDisplay();
    }

    cos() {
        const value = parseFloat(this.display);
        this.display = String(Math.cos(value * Math.PI / 180));
        this.waitingForOperand = true;
        this.updateDisplay();
    }

    tan() {
        const value = parseFloat(this.display);
        this.display = String(Math.tan(value * Math.PI / 180));
        this.waitingForOperand = true;
        this.updateDisplay();
    }

    log() {
        const value = parseFloat(this.display);
        this.display = String(Math.log10(value));
        this.waitingForOperand = true;
        this.updateDisplay();
    }

    updateDisplay() {
        // Override this method to update your UI
        console.log('Display:', this.display);
    }

    getDisplay() {
        return this.display;
    }
}

// Usage Example
const calc = new Calculator();

// Override updateDisplay to connect to your UI
calc.updateDisplay = function() {
    const displayElement = document.getElementById('calculator-display');
    if (displayElement) {
        displayElement.textContent = this.display;
    }
};

export default Calculator;`;
      }

      // Todo List
      if (lowerPrompt.includes('todo') || lowerPrompt.includes('task')) {
        return `// Advanced Todo List Implementation
class TodoList {
    constructor() {
        this.todos = JSON.parse(localStorage.getItem('todos')) || [];
        this.filter = 'all'; // all, active, completed
        this.nextId = this.todos.length > 0 ? Math.max(...this.todos.map(t => t.id)) + 1 : 1;
    }

    addTodo(text) {
        if (!text.trim()) return false;
        
        const todo = {
            id: this.nextId++,
            text: text.trim(),
            completed: false,
            createdAt: new Date().toISOString(),
            priority: 'normal' // low, normal, high
        };
        
        this.todos.push(todo);
        this.save();
        return todo;
    }

    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            todo.completedAt = todo.completed ? new Date().toISOString() : null;
            this.save();
            return todo;
        }
        return null;
    }

    deleteTodo(id) {
        const index = this.todos.findIndex(t => t.id === id);
        if (index > -1) {
            const deleted = this.todos.splice(index, 1)[0];
            this.save();
            return deleted;
        }
        return null;
    }

    editTodo(id, newText) {
        const todo = this.todos.find(t => t.id === id);
        if (todo && newText.trim()) {
            todo.text = newText.trim();
            todo.editedAt = new Date().toISOString();
            this.save();
            return todo;
        }
        return null;
    }

    setPriority(id, priority) {
        const todo = this.todos.find(t => t.id === id);
        if (todo && ['low', 'normal', 'high'].includes(priority)) {
            todo.priority = priority;
            this.save();
            return todo;
        }
        return null;
    }

    setFilter(filter) {
        if (['all', 'active', 'completed'].includes(filter)) {
            this.filter = filter;
            return true;
        }
        return false;
    }

    getFilteredTodos() {
        switch (this.filter) {
            case 'active':
                return this.todos.filter(t => !t.completed);
            case 'completed':
                return this.todos.filter(t => t.completed);
            default:
                return this.todos;
        }
    }

    getTodosByPriority() {
        const priorityOrder = { high: 3, normal: 2, low: 1 };
        return [...this.todos].sort((a, b) => {
            if (a.completed !== b.completed) {
                return a.completed ? 1 : -1;
            }
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });
    }

    searchTodos(query) {
        const lowerQuery = query.toLowerCase();
        return this.todos.filter(todo => 
            todo.text.toLowerCase().includes(lowerQuery)
        );
    }

    getStats() {
        const total = this.todos.length;
        const completed = this.todos.filter(t => t.completed).length;
        const active = total - completed;
        
        return {
            total,
            completed,
            active,
            completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
        };
    }

    clearCompleted() {
        const beforeCount = this.todos.length;
        this.todos = this.todos.filter(t => !t.completed);
        this.save();
        return beforeCount - this.todos.length;
    }

    exportTodos() {
        return JSON.stringify(this.todos, null, 2);
    }

    importTodos(jsonString) {
        try {
            const imported = JSON.parse(jsonString);
            if (Array.isArray(imported)) {
                this.todos = imported;
                this.nextId = this.todos.length > 0 ? Math.max(...this.todos.map(t => t.id)) + 1 : 1;
                this.save();
                return true;
            }
        } catch (error) {
            console.error('Import failed:', error);
        }
        return false;
    }

    save() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }

    // Utility methods
    formatDate(isoString) {
        return new Date(isoString).toLocaleDateString();
    }

    getDueTodayCount() {
        const today = new Date().toDateString();
        return this.todos.filter(t => 
            !t.completed && 
            t.dueDate && 
            new Date(t.dueDate).toDateString() === today
        ).length;
    }
}

// Usage Example
const todoList = new TodoList();

// Add some sample todos
todoList.addTodo('Complete project documentation');
todoList.addTodo('Review pull requests');
todoList.addTodo('Update dependencies');

// Set priorities
todoList.setPriority(1, 'high');
todoList.setPriority(2, 'normal');
todoList.setPriority(3, 'low');

console.log('Stats:', todoList.getStats());
console.log('High priority todos:', todoList.getTodosByPriority());

export default TodoList;`;
      }

      // Default fallback for any other prompt
      const functionName = lowerPrompt.replace(/[^a-z0-9]/g, '').substring(0, 30) || 'generatedFunction';
      return `// ${language.charAt(0).toUpperCase() + language.slice(1)} implementation for: ${prompt}
${framework !== 'none' ? `// Framework: ${framework}` : ''}

/**
 * ${prompt}
 * Generated with intelligent analysis of your requirements
 */
class ${functionName.charAt(0).toUpperCase() + functionName.slice(1)} {
    constructor(options = {}) {
        this.options = {
            debug: false,
            autoSave: true,
            ...options
        };
        this.data = {};
        this.listeners = {};
        this.init();
    }

    init() {
        if (this.options.debug) {
            console.log('Initializing ${functionName}...');
        }
        this.setupEventListeners();
        this.loadData();
    }

    setupEventListeners() {
        // Event listener setup
        this.on('change', (data) => {
            if (this.options.autoSave) {
                this.save();
            }
        });
    }

    // Event system
    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => callback(data));
        }
    }

    // Data management
    setData(key, value) {
        this.data[key] = value;
        this.emit('change', { key, value });
        return this;
    }

    getData(key) {
        return key ? this.data[key] : this.data;
    }

    // Persistence
    save() {
        try {
            localStorage.setItem('${functionName}_data', JSON.stringify(this.data));
            return true;
        } catch (error) {
            console.error('Save failed:', error);
            return false;
        }
    }

    loadData() {
        try {
            const saved = localStorage.getItem('${functionName}_data');
            if (saved) {
                this.data = JSON.parse(saved);
            }
        } catch (error) {
            console.error('Load failed:', error);
        }
    }

    // Main functionality based on prompt analysis
    execute() {
        // Implementation specific to: ${prompt}
        console.log('Executing ${functionName} functionality...');
        
        // Add your specific logic here based on the prompt
        const result = {
            success: true,
            message: 'Operation completed successfully',
            data: this.data,
            timestamp: new Date().toISOString()
        };

        this.emit('execute', result);
        return result;
    }

    // Utility methods
    reset() {
        this.data = {};
        this.save();
        this.emit('reset');
    }

    destroy() {
        this.listeners = {};
        this.data = {};
    }
}

// Usage example
const instance = new ${functionName.charAt(0).toUpperCase() + functionName.slice(1)}({
    debug: true,
    autoSave: true
});

// Execute the main functionality
const result = instance.execute();
console.log('Result:', result);

export default ${functionName.charAt(0).toUpperCase() + functionName.slice(1)};`;
    };

    const code = generateSmartCode(prompt, language, framework);
    res.status(200).json({ code });

  } catch (err) {
    console.error('Error generating code:', err);
    const message = err instanceof Error ? err.message : 'An unknown error occurred';
    res.status(500).json({ error: 'Code generation failed', details: message });
  }
});

/**
 * @route   POST /api/generate-app
 * @desc    Generate a full-fledged, functional React component based on a prompt.
 * @access  Public
 */
app.post('/api/generate-app', async (req: Request, res: Response) => {
  const { prompt, language, framework, projectType, apiKeys } = req.body;
  
  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt' });
  }

  try {
    const result = await AIService.generateApplication(prompt, apiKeys);
    
    // The generateApplication returns a Record<string, string> with file paths as keys and content as values
    // Convert it to the expected format for the frontend
    const files: Record<string, { content: string }> = {};
    for (const [filePath, content] of Object.entries(result)) {
      files[filePath] = { content };
    }

    res.status(200).json({ files });
  } catch (err: any) {
    console.error('Error generating app:', err);
    res.status(500).json({ error: 'App generation failed', details: err.message });
  }
});

/**
 * @route   GET /api/models
 * @desc    Get available AI models.
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
      id: 'gpt-4o-mini',
      name: 'GPT-4o Mini',
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

/**
 * @route   POST /api/enhance-prompt
 * @desc    Enhance a user prompt for better code generation.
 * @access  Public
 */
app.post('/api/enhance-prompt', async (req: Request, res: Response) => {
  const { prompt, projectType, model, apiKeys } = req.body;
  
  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt' });
  }

  try {
    // Determine which AI service to use based on model
    let enhancedPrompt = '';
    
    if (model?.startsWith('gpt') && apiKeys?.openai) {
      // Use OpenAI with user's API key
      const userOpenAI = new OpenAI({ apiKey: apiKeys.openai });
      
      const enhancementPrompt = `
You are an expert software architect and prompt engineer. Your task is to enhance the user's prompt to make it more specific, detailed, and actionable for code generation.

Original prompt: "${prompt}"
Project type: "${projectType}"

Please enhance this prompt by:
1. Adding specific technical requirements
2. Clarifying the user interface and user experience
3. Specifying key features and functionality
4. Adding relevant technology stack suggestions
5. Making it more actionable for code generation

Return only the enhanced prompt, nothing else.
`;

      const completion = await userOpenAI.chat.completions.create({
        model: model || 'gpt-4o-mini',
        messages: [{ role: 'system', content: enhancementPrompt }, { role: 'user', content: prompt }],
      });

      enhancedPrompt = completion.choices[0].message.content || '';
    } else if (model?.startsWith('gemini') && apiKeys?.gemini) {
      // Use Gemini with user's API key
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(apiKeys.gemini);
      const geminiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

      const enhancementPrompt = `
You are an expert software architect and prompt engineer. Your task is to enhance the user's prompt to make it more specific, detailed, and actionable for code generation.

Original prompt: "${prompt}"
Project type: "${projectType}"

Please enhance this prompt by:
1. Adding specific technical requirements
2. Clarifying the user interface and user experience
3. Specifying key features and functionality
4. Adding relevant technology stack suggestions
5. Making it more actionable for code generation

Return only the enhanced prompt, nothing else.
`;

      const result = await geminiModel.generateContent(enhancementPrompt + '\n\nUser prompt: ' + prompt);
      enhancedPrompt = result.response.text();
    } else if (model?.startsWith('claude') && apiKeys?.anthropic) {
      // Use Claude with user's API key
      const Anthropic = require('@anthropic-ai/sdk');
      const anthropic = new Anthropic({ apiKey: apiKeys.anthropic });

      const enhancementPrompt = `
You are an expert software architect and prompt engineer. Your task is to enhance the user's prompt to make it more specific, detailed, and actionable for code generation.

Original prompt: "${prompt}"
Project type: "${projectType}"

Please enhance this prompt by:
1. Adding specific technical requirements
2. Clarifying the user interface and user experience
3. Specifying key features and functionality
4. Adding relevant technology stack suggestions
5. Making it more actionable for code generation

Return only the enhanced prompt, nothing else.
`;

      const completion = await anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1000,
        messages: [{ role: 'user', content: enhancementPrompt + '\n\nUser prompt: ' + prompt }],
      });

      enhancedPrompt = completion.content[0].text;
    } else {
      // Fallback enhancement without AI
      enhancedPrompt = `Create a ${projectType} application for: ${prompt}. 

Include the following features:
- Clean, modern user interface with intuitive navigation
- Responsive design that works on desktop, tablet, and mobile
- Interactive elements with smooth animations and transitions
- Proper error handling and user feedback
- Well-structured, maintainable code with clear comments
- Modern best practices and security considerations
- Accessibility features for inclusive design
- Performance optimization for fast loading
- Cross-browser compatibility
- User authentication and data persistence where appropriate`;
    }

    res.status(200).json({ enhancedPrompt });
  } catch (err: any) {
    console.error('Error enhancing prompt:', err);
    // Fallback enhancement
    const enhancedPrompt = `Create a ${projectType} application for: ${prompt}. 
    
Include the following features:
- Clean, modern user interface with intuitive navigation
- Responsive design that works on desktop, tablet, and mobile
- Interactive elements with smooth animations and transitions
- Proper error handling and user feedback
- Well-structured, maintainable code with clear comments
- Modern best practices and security considerations
- Accessibility features for inclusive design
- Performance optimization for fast loading
- Cross-browser compatibility
- User authentication and data persistence where appropriate`;
    
    res.status(200).json({ enhancedPrompt });
  }
});

/**
 * @route   POST /api/ai-chat
 * @desc    Chat with AI assistant.
 * @access  Public
 */
app.post('/api/ai-chat', async (req: Request, res: Response) => {
  const { message, context, model, apiKeys } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: 'Missing message' });
  }

  try {
    // Use user's API key if provided, otherwise use server key
    const aiClient = apiKeys?.openai ? new OpenAI({ apiKey: apiKeys.openai }) : openai;

    if (aiClient) {
      console.log('AI Chat using API key:', apiKeys?.openai ? 'user-provided' : 'server-env');
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
      const completion = await aiClient.chat.completions.create({
        model: model || 'gpt-4o-mini',
        messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: message }],
      });

      const response = completion.choices[0].message.content;
      res.status(200).json({ response });
    } else {
      res.status(400).json({
        error: 'AI chat failed',
        details: 'No OpenAI API key provided. Please add your API key in Settings.'
      });
    }
  } catch (err: any) {
    console.error('Error in AI chat:', err);
    res.status(500).json({ error: 'AI chat failed', details: err.message });
  }
});

/**
 * @route   POST /api/create-checkout-session
 * @desc    Create Stripe checkout session.
 * @access  Public
 */
app.post('/api/create-checkout-session', async (req: Request, res: Response) => {
  if (!stripe) {
    return res.status(503).json({ error: 'Payment features are currently disabled.' });
  }

  const { planId, userId } = req.body;
  
  if (!planId || !userId) {
    return res.status(400).json({ error: 'Missing planId or userId' });
  }

  const priceIdMap: Record<string, string> = {
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

// Catch-all handler: send back React's index.html file for client-side routing
app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

// --- Server Initialization ---
app.listen(port, () => {
  console.log(`🚀 ALT-AI-MATE backend server is listening at http://localhost:${port}`);
});
