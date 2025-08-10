import { OpenAI } from 'openai';

let openai: OpenAI | null = null;

if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
} else {
  console.warn('OPENAI_API_KEY is not set. AI-powered features will be disabled.');
}

// Phase 1: Deconstruct the prompt and create a plan
async function createPlan(prompt: string): Promise<any> {
  return createPlanWithClient(prompt, openai);
}

async function createPlanWithClient(prompt: string, client: OpenAI | null): Promise<any> {
  const planningPrompt = `
You are an expert software architect. A user wants to build a React application.
Analyze their request and break it down into a detailed, actionable plan.

User's request: "${prompt}"

Your output MUST be a JSON object with the following structure:
{
  "appName": "A short, descriptive name for the app in camelCase.",
  "description": "A one-sentence description of the application.",
  "features": [
    "A list of key features and functionalities."
  ],
  "fileStructure": {
    "src/App.tsx": "The main application component. It should import and render other components.",
    "src/index.css": "CSS file for basic styling.",
    "package.json": "The project's package.json file.",
    "src/components/ExampleComponent.tsx": "Description of an example component."
  }
}

- **fileStructure**: List all the files that need to be created. Keys are file paths, and values are descriptions of what each file should contain.
- Be thorough and think step-by-step. The plan should be comprehensive enough for another AI to generate the code.
`;

  if (!client) {
    throw new Error('OpenAI client is not configured');
  }
  
  const completion = await client.chat.completions.create({
    model: 'gpt-4-turbo',
    messages: [
      { role: 'system', content: planningPrompt },
      { role: 'user', content: `Create a plan for this app: ${prompt}` }
    ],
    response_format: { type: "json_object" },
  });

  const responseJsonString = completion.choices[0].message.content;
  if (!responseJsonString) {
    throw new Error("Failed to get a valid plan from the AI.");
  }
  return JSON.parse(responseJsonString);
}

// Phase 2: Generate code for a single file based on the plan
async function generateFile(filePath: string, plan: any, generatedFiles: Record<string, string>): Promise<string> {
  return generateFileWithClient(filePath, plan, generatedFiles, openai);
}

async function generateFileWithClient(filePath: string, plan: any, generatedFiles: Record<string, string>, client: OpenAI | null): Promise<string> {
  const fileDescription = plan.fileStructure[filePath];
  
  const generationPrompt = `
You are an expert React developer. Your task is to write the code for a single file based on the provided plan and context.

**Overall App Plan:**
- **App Name:** ${plan.appName}
- **Description:** ${plan.description}
- **Features:**
${plan.features.map((f: string) => `  - ${f}`).join('\n')}

**File to Generate:**
- **Path:** \`${filePath}\`
- **Description:** ${fileDescription}

**Project Context (already generated files):**
${Object.entries(generatedFiles).map(([path, code]) => `
\`${path}\`:
\`\`\`
${code}
\`\`\`
`).join('\n') || 'No files generated yet.'}

**Instructions:**
- Write the complete, production-quality code for the file: \`${filePath}\`.
- The code must be fully functional, clean, and well-commented.
- Adhere to modern best practices for React and TypeScript.
- Do not include any markdown formatting (e.g., \`\`\`typescript) in your response.
- Your response should be ONLY the raw code for the file.
`;

  if (!client) {
    throw new Error('OpenAI client is not configured');
  }
  
  const completion = await client.chat.completions.create({
    model: 'gpt-4-turbo',
    messages: [
      { role: 'system', content: generationPrompt },
      { role: 'user', content: `Generate the code for ${filePath}` }
    ],
  });

  const code = completion.choices[0].message.content;
  if (!code) {
    throw new Error(`Failed to generate code for ${filePath}`);
  }
  return code;
}

// Fallback function to generate a basic template when OpenAI is not available
function generateFallbackApplication(prompt: string): Record<string, string> {
  const appName = prompt.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20) || 'myapp';
  
  // Analyze prompt to determine what kind of app to generate
  const lowerPrompt = prompt.toLowerCase();
  let appType = 'generic';
  let features: string[] = [];
  
  if (lowerPrompt.includes('todo') || lowerPrompt.includes('task')) {
    appType = 'todo';
    features = ['Add tasks', 'Mark as complete', 'Delete tasks', 'Filter tasks'];
  } else if (lowerPrompt.includes('calculator')) {
    appType = 'calculator';
    features = ['Basic arithmetic', 'Clear function', 'Decimal support'];
  } else if (lowerPrompt.includes('weather')) {
    appType = 'weather';
    features = ['Current weather', 'Location search', 'Temperature display'];
  } else if (lowerPrompt.includes('counter')) {
    appType = 'counter';
    features = ['Increment', 'Decrement', 'Reset'];
  } else if (lowerPrompt.includes('timer') || lowerPrompt.includes('clock')) {
    appType = 'timer';
    features = ['Start/Stop timer', 'Reset timer', 'Display time'];
  }

  const generateAppComponent = () => {
    switch (appType) {
      case 'todo':
        return `import React, { useState } from 'react';
import './index.css';

interface Task {
  id: number;
  text: string;
  completed: boolean;
}

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [inputValue, setInputValue] = useState('');

  const addTask = () => {
    if (inputValue.trim()) {
      setTasks([...tasks, {
        id: Date.now(),
        text: inputValue,
        completed: false
      }]);
      setInputValue('');
    }
  };

  const toggleTask = (id: number) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id: number) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>${appName.charAt(0).toUpperCase() + appName.slice(1)} - Todo List</h1>
        <div className="input-section">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Add a new task..."
            onKeyPress={(e) => e.key === 'Enter' && addTask()}
          />
          <button onClick={addTask}>Add Task</button>
        </div>
        <div className="tasks-section">
          {tasks.map(task => (
            <div key={task.id} className={\`task \${task.completed ? 'completed' : ''}\`}>
              <span onClick={() => toggleTask(task.id)}>{task.text}</span>
              <button onClick={() => deleteTask(task.id)}>Delete</button>
            </div>
          ))}
        </div>
      </header>
    </div>
  );
}

export default App;`;

      case 'calculator':
        return `import React, { useState } from 'react';
import './index.css';

function App() {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const inputNumber = (num: string) => {
    if (waitingForOperand) {
      setDisplay(String(num));
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? String(num) : display + num);
    }
  };

  const inputOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue: number, secondValue: number, operation: string) => {
    switch (operation) {
      case '+': return firstValue + secondValue;
      case '-': return firstValue - secondValue;
      case '*': return firstValue * secondValue;
      case '/': return firstValue / secondValue;
      case '=': return secondValue;
      default: return secondValue;
    }
  };

  const performCalculation = () => {
    const inputValue = parseFloat(display);

    if (previousValue !== null && operation) {
      const newValue = calculate(previousValue, inputValue, operation);
      setDisplay(String(newValue));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForOperand(true);
    }
  };

  const clearAll = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  return (
    <div className="app">
      <div className="calculator">
        <h1>${appName.charAt(0).toUpperCase() + appName.slice(1)} Calculator</h1>
        <div className="display">{display}</div>
        <div className="buttons">
          <button onClick={clearAll}>C</button>
          <button onClick={() => inputOperation('/')}>/</button>
          <button onClick={() => inputOperation('*')}>*</button>
          <button onClick={() => inputOperation('-')}>-</button>
          
          <button onClick={() => inputNumber('7')}>7</button>
          <button onClick={() => inputNumber('8')}>8</button>
          <button onClick={() => inputNumber('9')}>9</button>
          <button onClick={() => inputOperation('+')}>+</button>
          
          <button onClick={() => inputNumber('4')}>4</button>
          <button onClick={() => inputNumber('5')}>5</button>
          <button onClick={() => inputNumber('6')}>6</button>
          <button onClick={performCalculation} className="equals" rowSpan={2}>=</button>
          
          <button onClick={() => inputNumber('1')}>1</button>
          <button onClick={() => inputNumber('2')}>2</button>
          <button onClick={() => inputNumber('3')}>3</button>
          
          <button onClick={() => inputNumber('0')} className="zero">0</button>
          <button onClick={() => inputNumber('.')}>.</button>
        </div>
      </div>
    </div>
  );
}

export default App;`;

      case 'counter':
        return `import React, { useState } from 'react';
import './index.css';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="app">
      <header className="app-header">
        <h1>${appName.charAt(0).toUpperCase() + appName.slice(1)} Counter</h1>
        <div className="counter-display">
          <span className="count">{count}</span>
        </div>
        <div className="button-group">
          <button onClick={() => setCount(count - 1)} className="decrement">
            -1
          </button>
          <button onClick={() => setCount(0)} className="reset">
            Reset
          </button>
          <button onClick={() => setCount(count + 1)} className="increment">
            +1
          </button>
        </div>
      </header>
    </div>
  );
}

export default App;`;

      default:
        return `import React, { useState } from 'react';
import './index.css';

function App() {
  const [message, setMessage] = useState('Hello World!');

  return (
    <div className="app">
      <header className="app-header">
        <h1>${appName.charAt(0).toUpperCase() + appName.slice(1)}</h1>
        <p>Generated from prompt: "${prompt}"</p>
        <p>{message}</p>
        <button onClick={() => setMessage('Button clicked!')}>
          Click me!
        </button>
        <div className="features">
          <h3>Planned Features:</h3>
          <ul>
            ${features.map(feature => `<li>${feature}</li>`).join('\n            ')}
          </ul>
        </div>
      </header>
    </div>
  );
}

export default App;`;
    }
  };

  const generateCSS = () => {
    const baseCSS = `body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.app {
  text-align: center;
}

.app-header {
  background-color: #282c34;
  padding: 20px;
  color: white;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: calc(10px + 2vmin);
}

button {
  background-color: #61dafb;
  border: none;
  padding: 10px 20px;
  font-size: 16px;
  border-radius: 5px;
  cursor: pointer;
  margin: 5px;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #21a9c7;
}`;

    switch (appType) {
      case 'todo':
        return baseCSS + `

.input-section {
  margin: 20px 0;
  display: flex;
  gap: 10px;
  align-items: center;
}

.input-section input {
  padding: 10px;
  font-size: 16px;
  border: none;
  border-radius: 5px;
  min-width: 300px;
}

.tasks-section {
  max-width: 500px;
  margin: 20px auto;
}

.task {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  margin: 5px 0;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 5px;
  cursor: pointer;
}

.task.completed {
  opacity: 0.6;
  text-decoration: line-through;
}

.task span {
  flex: 1;
  text-align: left;
}

.task button {
  background-color: #ff4757;
  padding: 5px 10px;
  font-size: 12px;
}

.task button:hover {
  background-color: #ff3838;
}`;

      case 'calculator':
        return baseCSS + `

.calculator {
  background-color: #333;
  border-radius: 10px;
  padding: 20px;
  max-width: 300px;
  margin: 0 auto;
}

.display {
  background-color: #000;
  color: white;
  font-size: 2em;
  padding: 20px;
  text-align: right;
  margin-bottom: 20px;
  border-radius: 5px;
  min-height: 40px;
}

.buttons {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.buttons button {
  padding: 20px;
  font-size: 18px;
  font-weight: bold;
  background-color: #666;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.buttons button:hover {
  background-color: #777;
}

.equals {
  grid-row: span 2;
  background-color: #ff9500 !important;
}

.zero {
  grid-column: span 2;
}`;

      case 'counter':
        return baseCSS + `

.counter-display {
  margin: 40px 0;
}

.count {
  font-size: 4em;
  font-weight: bold;
  color: #61dafb;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.button-group {
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-top: 40px;
}

.button-group button {
  padding: 15px 30px;
  font-size: 18px;
  font-weight: bold;
  min-width: 100px;
}

.increment {
  background-color: #2ecc71 !important;
}

.increment:hover {
  background-color: #27ae60 !important;
}

.decrement {
  background-color: #e74c3c !important;
}

.decrement:hover {
  background-color: #c0392b !important;
}

.reset {
  background-color: #f39c12 !important;
}

.reset:hover {
  background-color: #e67e22 !important;
}`;

      default:
        return baseCSS + `

.features {
  margin-top: 30px;
  text-align: left;
  max-width: 400px;
}

.features ul {
  list-style-type: none;
  padding: 0;
}

.features li {
  background-color: rgba(255, 255, 255, 0.1);
  margin: 5px 0;
  padding: 10px;
  border-radius: 5px;
  font-size: 14px;
}`;
    }
  };
  
  return {
    'src/App.tsx': generateAppComponent(),
    'src/index.css': generateCSS(),
    'package.json': `{
  "name": "${appName}",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "@types/node": "^16.7.13",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1",
    "typescript": "^4.4.2",
    "web-vitals": "^2.1.0"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}`,
    'README.md': `# ${appName.charAt(0).toUpperCase() + appName.slice(1)}

Generated from prompt: "${prompt}"

## Features
${features.map(feature => `- ${feature}`).join('\n')}

## Note
This is a functional template generated as a fallback. 
To get AI-powered code generation with more advanced features, please configure your OPENAI_API_KEY in the backend.

## Available Scripts

- \`npm start\` - Runs the app in development mode
- \`npm run build\` - Builds the app for production
- \`npm test\` - Launches the test runner

## Getting Started

1. Install dependencies: \`npm install\`
2. Start the development server: \`npm start\`
3. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.
`
  };
}

// Main function to generate the entire application
export async function generateApplication(prompt: string, apiKeys?: { openai?: string; gemini?: string; anthropic?: string }): Promise<Record<string, string>> {
  // Use user's OpenAI key if provided, otherwise use server key
  let aiClient = openai;
  
  if (apiKeys?.openai) {
    aiClient = new OpenAI({ apiKey: apiKeys.openai });
  }
  
  if (!aiClient && !process.env.OPENAI_API_KEY) {
    console.warn('No OpenAI API key available, using fallback generator');
    return generateFallbackApplication(prompt);
  }
  
  try {
    console.log('Phase 1: Creating a plan...');
    const plan = await createPlanWithClient(prompt, aiClient);
    console.log('Plan created:', plan);

    const generatedFiles: Record<string, string> = {};
    const filePaths = Object.keys(plan.fileStructure);

    console.log('Phase 2: Generating files...');
    for (const filePath of filePaths) {
      console.log(`- Generating ${filePath}...`);
      const code = await generateFileWithClient(filePath, plan, generatedFiles, aiClient);
      generatedFiles[filePath] = code;
      console.log(`- Finished ${filePath}.`);
    }

    console.log('Application generation complete!');
    return generatedFiles;
  } catch (error) {
    console.error('Error in AI generation, falling back to template:', error);
    return generateFallbackApplication(prompt);
  }
}
