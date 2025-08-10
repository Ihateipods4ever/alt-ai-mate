import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Types
interface Project {
  id: string;
  name: string;
  type: string;
  files: Record<string, { content: string }>;
  createdAt: string;
  lastModified: string;
  deploymentStatus: 'Not Deployed' | 'Ready to Deploy' | 'Deploying' | 'Deployed' | 'Error';
  deploymentUrl?: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  subscription: 'free' | 'pro' | 'enterprise';
  role: 'user' | 'admin' | 'master_admin';
  permissions: string[];
}

interface AppState {
  user: User | null;
  currentProject: Project | null;
  projects: Project[];
  isAuthenticated: boolean;
}

interface AppContextType extends AppState {
  // User actions
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  
  // Project actions
  createProject: (name: string, type: string, files?: Record<string, { content: string }>) => void;
  updateProject: (projectId: string, updates: Partial<Project>) => void;
  deleteProject: (projectId: string) => void;
  setCurrentProject: (project: Project | null) => void;
  
  // File actions
  updateProjectFiles: (projectId: string, files: Record<string, { content: string }>) => void;
  
  // Code generation actions
  generateCode: (prompt: string, language?: string, framework?: string) => Promise<string>;
  generateProject: (description: string, projectType: string) => Promise<Project>;
  
  // Deployment actions
  deployProject: (projectId: string) => Promise<boolean>;
  
  // Admin actions
  hasPermission: (permission: string) => boolean;
  isMasterAdmin: () => boolean;
  getAllUsers: () => User[];
  getAllProjects: () => Project[];
  deleteUserProject: (userId: string, projectId: string) => void;
  updateUserSubscription: (userId: string, subscription: 'free' | 'pro' | 'enterprise') => void;
  
  // Persistence
  saveToStorage: () => void;
  loadFromStorage: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, setState] = useState<AppState>({
    user: null,
    currentProject: null,
    projects: [],
    isAuthenticated: false,
  });

  // Mock data for admin functionality
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    loadFromStorage();
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    saveToStorage();
  }, [state]);

  const saveToStorage = () => {
    try {
      localStorage.setItem('alt-ai-mate-app-state', JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save app state:', error);
    }
  };

  const loadFromStorage = () => {
    try {
      const saved = localStorage.getItem('alt-ai-mate-app-state');
      if (saved) {
        const parsedState = JSON.parse(saved);
        setState(parsedState);
      }
    } catch (error) {
      console.error('Failed to load app state:', error);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        // Check for master admin credentials
        if (email === 'altaimate1@gmail.com' && password === '394020766!!') {
          const user: User = {
            id: 'master_admin_001',
            email,
            name: 'Master Administrator',
            subscription: 'enterprise',
            role: 'master_admin',
            permissions: [
              'all_access',
              'user_management',
              'project_management',
              'billing_management',
              'server_management',
              'ip_management',
              'system_maintenance',
              'support_access',
              'analytics_access',
              'security_management'
            ]
          };
          setState(prev => ({ ...prev, user, isAuthenticated: true }));
          resolve(true);
        }
        // Regular user authentication
        else if (email && password) {
          const user: User = {
            id: 'user_' + Date.now(),
            email,
            name: email.split('@')[0],
            subscription: 'free',
            role: 'user',
            permissions: ['basic_access', 'project_create', 'project_edit']
          };
          setState(prev => ({ ...prev, user, isAuthenticated: true }));
          resolve(true);
        } else {
          resolve(false);
        }
      }, 1000);
    });
  };

  const logout = () => {
    setState(prev => ({ ...prev, user: null, isAuthenticated: false }));
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const user: User = {
          id: 'user_' + Date.now(),
          email,
          name,
          subscription: 'free',
          role: 'user',
          permissions: ['basic_access', 'project_create', 'project_edit']
        };
        setState(prev => ({ ...prev, user, isAuthenticated: true }));
        resolve(true);
      }, 1000);
    });
  };

  // Admin functions
  const hasPermission = (permission: string): boolean => {
    if (!state.user) return false;
    return state.user.permissions.includes('all_access') || state.user.permissions.includes(permission);
  };

  const isMasterAdmin = (): boolean => {
    return state.user?.role === 'master_admin' || false;
  };

  const getAllUsers = (): User[] => {
    if (!hasPermission('user_management')) return [];
    return allUsers;
  };

  const getAllProjects = (): Project[] => {
    if (!hasPermission('project_management')) return [];
    return allProjects;
  };

  const deleteUserProject = (userId: string, projectId: string): void => {
    if (!hasPermission('project_management')) return;
    setAllProjects(prev => prev.filter(p => !(p.id === projectId)));
  };

  const updateUserSubscription = (userId: string, subscription: 'free' | 'pro' | 'enterprise'): void => {
    if (!hasPermission('billing_management')) return;
    setAllUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, subscription } : user
    ));
  };

  const createProject = (name: string, type: string, files?: Record<string, { content: string }>) => {
    const project: Project = {
      id: 'proj_' + Date.now(),
      name,
      type,
      files: files || {
        'src/App.tsx': {
          content: `// Welcome to ${name}\nfunction App() {\n  return <h1>Hello, World!</h1>\n}`
        }
      },
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      deploymentStatus: 'Ready to Deploy'
    };

    setState(prev => ({
      ...prev,
      projects: [...prev.projects, project],
      currentProject: project
    }));
  };

  const updateProject = (projectId: string, updates: Partial<Project>) => {
    setState(prev => ({
      ...prev,
      projects: prev.projects.map(p => 
        p.id === projectId 
          ? { ...p, ...updates, lastModified: new Date().toISOString() }
          : p
      ),
      currentProject: prev.currentProject?.id === projectId 
        ? { ...prev.currentProject, ...updates, lastModified: new Date().toISOString() }
        : prev.currentProject
    }));
  };

  const deleteProject = (projectId: string) => {
    setState(prev => ({
      ...prev,
      projects: prev.projects.filter(p => p.id !== projectId),
      currentProject: prev.currentProject?.id === projectId ? null : prev.currentProject
    }));
  };

  const setCurrentProject = (project: Project | null) => {
    setState(prev => ({ ...prev, currentProject: project }));
  };

  const updateProjectFiles = (projectId: string, files: Record<string, { content: string }>) => {
    updateProject(projectId, { files });
  };

  const generateCode = async (prompt: string, language = 'javascript', framework = 'none'): Promise<string> => {
    try {
      // Get API keys from localStorage
      const savedApiKeys = localStorage.getItem('alt-ai-mate-api-keys');
      let apiKeys = {};
      if (savedApiKeys) {
        try {
          apiKeys = JSON.parse(savedApiKeys);
        } catch (error) {
          console.warn('Failed to parse saved API keys:', error);
        }
      }

      // Use environment variable or fallback to localhost for development
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/generate-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, language, framework, apiKeys }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate code');
      }

      const data = await response.json();
      return data.code;
    } catch (error) {
      console.error('Code generation error:', error);
      // Fallback to intelligent local generation
      const lowerPrompt = prompt.toLowerCase();
      
      if (lowerPrompt.includes('text editor') || lowerPrompt.includes('editor')) {
        return `// Basic Text Editor Implementation
class SimpleTextEditor {
    constructor(elementId) {
        this.element = document.getElementById(elementId);
        this.content = '';
        this.init();
    }

    init() {
        this.element.innerHTML = \`
            <div style="border: 1px solid #ccc; border-radius: 4px;">
                <div style="background: #f5f5f5; padding: 8px; border-bottom: 1px solid #ccc;">
                    <button onclick="document.execCommand('bold')">Bold</button>
                    <button onclick="document.execCommand('italic')">Italic</button>
                    <button onclick="this.save()">Save</button>
                </div>
                <div contenteditable="true" style="min-height: 200px; padding: 12px;" 
                     oninput="this.content = this.innerHTML"></div>
            </div>
        \`;
    }

    save() {
        const content = this.element.querySelector('[contenteditable]').innerHTML;
        const blob = new Blob([content], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'document.html';
        a.click();
        URL.revokeObjectURL(url);
    }
}

export default SimpleTextEditor;`;
      }
      
      if (lowerPrompt.includes('calculator')) {
        return `// Simple Calculator Implementation
class SimpleCalculator {
    constructor() {
        this.display = '0';
        this.previousValue = null;
        this.operation = null;
        this.waitingForOperand = false;
    }

    inputNumber(num) {
        if (this.waitingForOperand) {
            this.display = String(num);
            this.waitingForOperand = false;
        } else {
            this.display = this.display === '0' ? String(num) : this.display + num;
        }
    }

    inputOperation(nextOperation) {
        const inputValue = parseFloat(this.display);
        if (this.previousValue === null) {
            this.previousValue = inputValue;
        } else if (this.operation) {
            const currentValue = this.previousValue || 0;
            const result = this.calculate(currentValue, inputValue, this.operation);
            this.display = String(result);
            this.previousValue = result;
        }
        this.waitingForOperand = true;
        this.operation = nextOperation;
    }

    calculate(firstValue, secondValue, operation) {
        switch (operation) {
            case '+': return firstValue + secondValue;
            case '-': return firstValue - secondValue;
            case '*': return firstValue * secondValue;
            case '/': return firstValue / secondValue;
            default: return secondValue;
        }
    }

    clear() {
        this.display = '0';
        this.previousValue = null;
        this.operation = null;
        this.waitingForOperand = false;
    }
}

export default SimpleCalculator;`;
      }
      
      // Generic fallback
      const functionName = lowerPrompt.replace(/[^a-z0-9]/g, '').substring(0, 25) || 'generatedFunction';
      return `// ${language.charAt(0).toUpperCase() + language.slice(1)} implementation for: ${prompt}
class ${functionName.charAt(0).toUpperCase() + functionName.slice(1)} {
    constructor(options = {}) {
        this.options = options;
        this.data = {};
        this.init();
    }

    init() {
        console.log('Initializing ${functionName}...');
        // Add initialization logic here
    }

    execute() {
        console.log('Executing: ${prompt}');
        // Add main functionality here
        return { success: true, message: 'Operation completed' };
    }

    getData() {
        return this.data;
    }

    setData(key, value) {
        this.data[key] = value;
        return this;
    }
}

export default ${functionName.charAt(0).toUpperCase() + functionName.slice(1)};`;
    }
  };

  const generateProject = async (description: string, projectType: string): Promise<Project> => {
    try {
      // Use environment variable or fallback to localhost for development
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      
      // Try to use the AI-powered generation first
      try {
        // Get API keys from localStorage
        const savedApiKeys = localStorage.getItem('alt-ai-mate-api-keys');
        let apiKeys = {};
        if (savedApiKeys) {
          try {
            apiKeys = JSON.parse(savedApiKeys);
          } catch (error) {
            console.warn('Failed to parse saved API keys:', error);
          }
        }

        const response = await fetch(`${apiUrl}/api/generate-app`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            prompt: description, 
            projectType,
            language: 'typescript',
            framework: 'react',
            apiKeys
          }),
        });

        if (response.ok) {
          const data = await response.json();
          
          const project: Project = {
            id: 'proj_' + Date.now(),
            name: description,
            type: projectType,
            files: data.files,
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString(),
            deploymentStatus: 'Ready to Deploy'
          };

          setState(prev => ({
            ...prev,
            projects: [...prev.projects, project],
            currentProject: project
          }));

          return project;
        }
      } catch (error) {
        console.warn('AI generation failed, falling back to template generation:', error);
      }

      // Fallback to intelligent template-based generation
      const generateSmartTemplate = (prompt: string, type: string) => {
        const lowerPrompt = prompt.toLowerCase();
        const appName = prompt.replace(/[^a-zA-Z0-9\s]/g, '').trim().substring(0, 30) || 'MyApp';
        
        // Analyze prompt to determine app type
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
        } else if (lowerPrompt.includes('blog') || lowerPrompt.includes('post')) {
          appType = 'blog';
          features = ['Create posts', 'View posts', 'Edit posts', 'Delete posts'];
        } else if (lowerPrompt.includes('chat') || lowerPrompt.includes('message')) {
          appType = 'chat';
          features = ['Send messages', 'Receive messages', 'User list', 'Message history'];
        }

        const generateAppComponent = () => {
          switch (appType) {
            case 'todo':
              return `import React, { useState } from 'react';
import './App.css';

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
    <div className="App">
      <header className="App-header">
        <h1>${appName} - Todo List</h1>
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
import './App.css';

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
    <div className="App">
      <div className="calculator">
        <h1>${appName} Calculator</h1>
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
          <button onClick={performCalculation} className="equals">=</button>
          
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
import './App.css';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="App">
      <header className="App-header">
        <h1>${appName} Counter</h1>
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
import './App.css';

function App() {
  const [message, setMessage] = useState('Welcome to ${appName}!');

  return (
    <div className="App">
      <header className="App-header">
        <h1>${appName}</h1>
        <p>Generated from: "${prompt}"</p>
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
          const baseCSS = `.App {
  text-align: center;
}

.App-header {
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
          'src/App.tsx': { content: generateAppComponent() },
          'src/App.css': { content: generateCSS() },
          'src/index.tsx': {
            content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<App />);`
          },
          'package.json': {
            content: JSON.stringify({
              name: appName.toLowerCase().replace(/\s+/g, '-'),
              version: '0.1.0',
              private: true,
              dependencies: {
                '@types/node': '^16.7.13',
                '@types/react': '^18.0.0',
                '@types/react-dom': '^18.0.0',
                'react': '^18.2.0',
                'react-dom': '^18.2.0',
                'react-scripts': '5.0.1',
                'typescript': '^4.4.2',
                'web-vitals': '^2.1.0'
              },
              scripts: {
                start: 'react-scripts start',
                build: 'react-scripts build',
                test: 'react-scripts test',
                eject: 'react-scripts eject'
              },
              eslintConfig: {
                extends: [
                  'react-app',
                  'react-app/jest'
                ]
              },
              browserslist: {
                production: [
                  '>0.2%',
                  'not dead',
                  'not op_mini all'
                ],
                development: [
                  'last 1 chrome version',
                  'last 1 firefox version',
                  'last 1 safari version'
                ]
              }
            }, null, 2)
          },
          'README.md': {
            content: `# ${appName}

Generated from prompt: "${prompt}"

## Features
${features.map(feature => `- ${feature}`).join('\n')}

## Getting Started

1. Install dependencies: \`npm install\`
2. Start the development server: \`npm start\`
3. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Available Scripts

- \`npm start\` - Runs the app in development mode
- \`npm run build\` - Builds the app for production
- \`npm test\` - Launches the test runner
`
          }
        };
      };

      let files: Record<string, { content: string }> = {};

      switch (projectType.toLowerCase()) {
        case 'web':
        case 'react':
          files = generateSmartTemplate(description, projectType);
          break;

        case 'mobile':
          files = {
            'App.tsx': {
              content: `import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function App() {
  const [message, setMessage] = useState('Hello from ${description}!');
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>${description}</Text>
      <Text style={styles.message}>{message}</Text>
      <TouchableOpacity 
        style={styles.button}
        onPress={() => setMessage('Button pressed!')}
      >
        <Text style={styles.buttonText}>Press me!</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  message: { fontSize: 16, marginBottom: 30 },
  button: { backgroundColor: '#007AFF', padding: 15, borderRadius: 8 },
  buttonText: { color: 'white', fontSize: 16 }
});`
            },
            'package.json': {
              content: JSON.stringify({
                name: description.toLowerCase().replace(/\s+/g, '-'),
                version: '1.0.0',
                dependencies: {
                  'react-native': '^0.72.0',
                  react: '^18.2.0'
                }
              }, null, 2)
            }
          };
          break;

        case 'desktop':
          files = {
            'main.js': {
              content: `const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadFile('index.html');
  mainWindow.setTitle('${description}');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});`
            },
            'index.html': {
              content: `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${description}</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { color: #333; }
        button { padding: 10px 20px; font-size: 16px; }
    </style>
</head>
<body>
    <h1>${description}</h1>
    <p>This is your desktop application!</p>
    <button onclick="alert('Hello from ${description}!')">Click me!</button>
</body>
</html>`
            },
            'package.json': {
              content: JSON.stringify({
                name: description.toLowerCase().replace(/\s+/g, '-'),
                version: '1.0.0',
                main: 'main.js',
                dependencies: {
                  electron: '^25.0.0'
                }
              }, null, 2)
            }
          };
          break;

        default:
          files = {
            'index.html': {
              content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${description}</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <h1>${description}</h1>
        <p>Welcome to your new project!</p>
        <button onclick="handleClick()">Click me!</button>
    </div>
    <script src="script.js"></script>
</body>
</html>`
            },
            'script.js': {
              content: `// ${description} - JavaScript functionality

function handleClick() {
    alert('Hello from ${description}!');
    console.log('Button clicked in ${description}');
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('${description} loaded successfully!');
});`
            },
            'style.css': {
              content: `/* ${description} - Styles */

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  margin: 0;
  padding: 0;
  background-color: #f5f5f5;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
  text-align: center;
}

h1 {
  color: #333;
  font-size: 2.5em;
  margin-bottom: 20px;
}

p {
  color: #666;
  font-size: 1.2em;
  margin-bottom: 30px;
}

button {
  background-color: #007AFF;
  color: white;
  border: none;
  padding: 12px 24px;
  font-size: 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #0056CC;
}`
            }
          };
      }

      const project: Project = {
        id: 'proj_' + Date.now(),
        name: description,
        type: projectType,
        files,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        deploymentStatus: 'Ready to Deploy'
      };

      setState(prev => ({
        ...prev,
        projects: [...prev.projects, project],
        currentProject: project
      }));

      return project;
    } catch (error) {
      console.error('Project generation error:', error);
      throw error;
    }
  };

  const deployProject = async (projectId: string): Promise<boolean> => {
    // Set deploying status
    updateProject(projectId, { deploymentStatus: 'Deploying' });
    
    try {
      // Simulate deployment process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Generate a mock deployment URL
      const project = state.projects.find(p => p.id === projectId);
      const deploymentUrl = `${project?.name.toLowerCase().replace(/\s+/g, '-')}-${projectId.slice(-4)}.netlify.app`;
      
      // Update to deployed status
      updateProject(projectId, { 
        deploymentStatus: 'Deployed',
        deploymentUrl 
      });
      
      return true;
    } catch (error) {
      // Update to error status
      updateProject(projectId, { deploymentStatus: 'Error' });
      return false;
    }
  };

  const contextValue: AppContextType = {
    ...state,
    login,
    logout,
    register,
    createProject,
    updateProject,
    deleteProject,
    setCurrentProject,
    updateProjectFiles,
    generateCode,
    generateProject,
    deployProject,
    saveToStorage,
    loadFromStorage,
    hasPermission,
    isMasterAdmin,
    getAllUsers,
    getAllProjects,
    deleteUserProject,
    updateUserSubscription,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};