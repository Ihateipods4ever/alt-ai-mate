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
 * Dynamically generates React code by analyzing keywords in a prompt.
 * @param {string} prompt The user's request.
 * @param {string} projectType The type of project (e.g., 'web').
 * @returns {string} The generated code.
 */
function generateDynamicCode(prompt, projectType) {
  const lowerCasePrompt = prompt.toLowerCase();

  // --- High-Fidelity Templates for Specific Keywords ---
  if (lowerCasePrompt.includes('coloring book') || lowerCasePrompt.includes('coloringbook')) {
    return `// AI-Generated Adult Coloring Book App
import React, { useState } from 'react';

const colors = ['#FF5733', '#33FF57', '#3357FF', '#F1C40F', '#9B59B6', '#E74C3C', '#1ABC9C'];

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
    const shapeElement = document.getElementById(shapeId);
    if (shapeElement) shapeElement.setAttribute('fill', selectedColor);
  };

  return (
    <div style={{ display: 'flex', fontFamily: 'sans-serif', alignItems: 'center', flexDirection: 'column' }}>
      <h2>Adult Coloring Book</h2>
      <p>Select a color and click a shape to fill it.</p>
      <div style={{ display: 'flex', gap: '10px', margin: '20px 0' }}>
        {colors.map(color => <div key={color} onClick={() => setSelectedColor(color)} style={{ width: '40px', height: '40px', backgroundColor: color, cursor: 'pointer', border: selectedColor === color ? '3px solid black' : '1px solid grey', borderRadius: '50%' }} />)}
      </div>
      <ColoringImage onFill={handleFill} />
    </div>
  );
}

export default App;`;
  }

  // --- Dynamic Component Assembly based on Keywords ---
  let imports = new Set(['React', 'useState', 'useEffect']);
  let states = [];
  let functions = [];
  let jsx = [`<h1>${prompt}</h1>`];

  // API fetching logic
  if (lowerCasePrompt.includes('fetch') || lowerCasePrompt.includes('api') || lowerCasePrompt.includes('data')) {
    states.push("const [data, setData] = useState(null);");
    states.push("const [loading, setLoading] = useState(true);");
    states.push("const [error, setError] = useState(null);");

    functions.push(`
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Using a placeholder API for demonstration
        const response = await fetch('https://jsonplaceholder.typicode.com/posts/1');
        if (!response.ok) throw new Error('Network response was not ok');
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);`);

    jsx.push(`
      <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2>API Data Viewer</h2>
        {loading && <p>Loading data...</p>}
        {error && <p style={{ color: 'red' }}>Error: {error}</p>}
        {data && <pre style={{ backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>{JSON.stringify(data, null, 2)}</pre>}
      </div>
    `);
  }

  // Form logic
  if (lowerCasePrompt.includes('form')) {
    if (lowerCasePrompt.includes('login')) {
      states.push("const [email, setEmail] = useState('');");
      states.push("const [password, setPassword] = useState('');");
      jsx.push(`
      <form onSubmit={e => e.preventDefault()} style={{ marginTop: '20px' }}>
        <h3>Login Form</h3>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="email" style={{ marginRight: '10px' }}>Email:</label>
          <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="password" style={{ marginRight: '10px' }}>Password:</label>
          <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <button type="submit">Log In</button>
      </form>
      `);
    } else {
      states.push("const [inputValue, setInputValue] = useState('');");
      jsx.push(`
      <form onSubmit={e => e.preventDefault()} style={{ marginTop: '20px' }}>
        <h3>Submission Form</h3>
        <label htmlFor="input" style={{ marginRight: '10px' }}>Enter value:</label>
        <input id="input" value={inputValue} onChange={e => setInputValue(e.target.value)} />
        <button type="submit">Submit</button>
      </form>
      `);
    }
  }

  // Add a simple button if no other interactive element is present
  if (!lowerCasePrompt.includes('form') && !lowerCasePrompt.includes('api') && !lowerCasePrompt.includes('coloring book') && !lowerCasePrompt.includes('coloringbook')) {
      jsx.push(`
      <p>This is a sample component generated by ALT-AI-MATE.</p>
      <button onClick={() => alert('Hello!')}>Click Me</button>
      `);
  }
  
  // --- Assemble Code ---
  const importStatement = `import React, { ${Array.from(imports).filter(i => i !== 'React').join(', ')} } from 'react';`;
  const statesStatement = states.length > 0 ? `  ${states.join('\n  ')}` : '';
  const functionsStatement = functions.length > 0 ? functions.join('\n') : '';
  const jsxStatement = jsx.join('\n');

  return `
${importStatement}

// AI-Generated component for: "${prompt}"
function App() {
${statesStatement}
${functionsStatement}

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      ${jsxStatement}
    </div>
  );
}

export default App;
`;
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

  // Use the new, more dynamic code generation logic.
  const generatedCode = generateDynamicCode(prompt, projectType);

  // Simulate network and processing time
  setTimeout(() => {
    res.status(200).json({ code: generatedCode });
  }, 1200);
});

/**
 * @route   POST /api/ai-chat
 * @desc    Handles interactive AI assistant messages.
 * @access  Public
 */
app.post('/api/ai-chat', (req, res) => {
  const { message, context } = req.body;
  console.log('AI chat message received:', { message });

  if (!message) {
    return res.status(400).json({ error: 'Message is required.' });
  }

  // More intelligent (but still simulated) response logic
  let aiResponse = "I'm not sure how to help with that. Could you be more specific?";
  if (message.toLowerCase().includes('fix')) {
    aiResponse = "To help you fix this, could you describe the bug or provide the error message you're seeing?";
  } else if (message.toLowerCase().includes('optimize')) {
    aiResponse = "Optimization is a great idea! Based on the provided code, one area to look at could be memoizing expensive calculations with `useMemo`. What are your performance goals?";
  } else if (message.toLowerCase().includes('explain')) {
    aiResponse = "Of course. This part of the code seems to be responsible for [simulated explanation]. Is there a specific line or function you'd like to dive into?";
  }

  setTimeout(() => res.status(200).json({ response: aiResponse }), 800);
});

// --- Server Initialization ---
const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';
app.listen(port, host, () => {
  console.log(`🚀 ALT-AI-MATE backend server is listening at http://${host}:${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});