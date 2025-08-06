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

/**
 * Generates more realistic code based on keywords in the prompt.
 * @param {string} prompt The user's request.
 * @param {string} projectType The type of project (e.g., 'web').
 * @returns {string} The generated code.
 */
function generateRealisticCode(prompt, projectType) {
  const lowerCasePrompt = prompt.toLowerCase();

  // --- Keyword-based template matching ---

  if (lowerCasePrompt.includes('coloring book')) {
    return `// AI-Generated Adult Coloring Book App
import React, { useState } from 'react';

const colors = ['#FF5733', '#33FF57', '#3357FF', '#F1C40F', '#9B59B6', '#E74C3C', '#1ABC9C'];

// A simple SVG image to color. In a real app, you'd have many complex ones.
const ColoringImage = ({ onFill }) => (
  <svg width="400" height="400" viewBox="0 0 100 100">
    <g id="coloring-area">
      <path id="shape1" d="M10 10 H 50 V 50 H 10 Z" fill="white" stroke="black" onClick={() => onFill('shape1')} style={{ cursor: 'pointer' }} />
      <path id="shape2" d="M60 10 H 90 V 50 H 60 Z" fill="white" stroke="black" onClick={() => onFill('shape2')} style={{ cursor: 'pointer' }} />
      <circle id="shape3" cx="30" cy="75" r="20" fill="white" stroke="black" onClick={() => onFill('shape3')} style={{ cursor: 'pointer' }} />
      <path id="shape4" d="M75 60 L 90 90 L 60 90 Z" fill="white" stroke="black" onClick={() => onFill('shape4')} style={{ cursor: 'pointer' }} />
    </g>
  </svg>
);

function App() {
  const [selectedColor, setSelectedColor] = useState(colors[0]);

  const handleFill = (shapeId) => {
    // Apply the fill directly to the SVG element for performance
    const shapeElement = document.getElementById(shapeId);
    if (shapeElement) {
      shapeElement.setAttribute('fill', selectedColor);
    }
  };

  return (
    <div style={{ display: 'flex', fontFamily: 'sans-serif', alignItems: 'center', flexDirection: 'column' }}>
      <h2>Adult Coloring Book</h2>
      <p>Select a color and click a shape to fill it.</p>
      <div style={{ display: 'flex', gap: '10px', margin: '20px 0' }}>
        {colors.map(color => (
          <div 
            key={color}
            onClick={() => setSelectedColor(color)}
            style={{ 
              width: '40px', 
              height: '40px', 
              backgroundColor: color, 
              cursor: 'pointer',
              border: selectedColor === color ? '3px solid black' : '1px solid grey',
              borderRadius: '50%'
            }}
          />
        ))}
      </div>
      <ColoringImage onFill={handleFill} />
    </div>
  );
}

export default App;`;
  }

  if (lowerCasePrompt.includes('todo') || lowerCasePrompt.includes('to-do')) {
    return `// AI-Generated To-Do List App
import React, { useState } from 'react';

function App() {
  const [todos, setTodos] = useState([
    { id: 1, text: 'Learn React', completed: true },
    { id: 2, text: 'Build a cool app', completed: false },
  ]);
  const [input, setInput] = useState('');

  const addTodo = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setTodos([...todos, { id: Date.now(), text: input, completed: false }]);
    setInput('');
  };

  const toggleTodo = (id) => {
    setTodos(
      todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>To-Do List</h1>
      <form onSubmit={addTodo}>
        <input 
          value={input} 
          onChange={e => setInput(e.target.value)} 
          placeholder="Add a new task"
          style={{ padding: '8px', marginRight: '8px' }}
        />
        <button type="submit">Add</button>
      </form>
      <ul>
        {todos.map(todo => (
          <li 
            key={todo.id} 
            onClick={() => toggleTodo(todo.id)}
            style={{ textDecoration: todo.completed ? 'line-through' : 'none', cursor: 'pointer' }}
          >
            {todo.text}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;`;
  }

  // --- Fallback generic template ---
  return `// Generated ${projectType} app based on: ${prompt}
import React from 'react';

function App() {
  return (
    <div>
      <h1>Your ${projectType} App: ${prompt}</h1>
      <p>This is a sample component generated by ALT-AI-MATE.</p>
      <p>Edit this file to start building your application!</p>
      <button onClick={() => alert('Hello from your generated app!')}>
        Click me!
      </button>
    </div>
  );
}

export default App;`;
}

/**
 * @route   POST /api/generate-code
 * @desc    Generates sample code based on a prompt.
 * @access  Public
 */
app.post('/api/generate-code', (req, res) => {
  const { prompt, projectType } = req.body;
  console.log('Code generation requested:', { prompt, projectType });

  if (!prompt || !projectType) {
    return res.status(400).json({ error: 'Missing required fields: prompt and projectType' });
  }

  // Use the new, more realistic code generation logic.
  const generatedCode = generateRealisticCode(prompt, projectType);

  // Simulate network and processing time
  setTimeout(() => {
    res.status(200).json({ code: generatedCode });
  }, 1200);
});

// --- Server Initialization ---
const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';
app.listen(port, host, () => {
  console.log(`🚀 ALT-AI-MATE backend server is listening at http://${host}:${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});