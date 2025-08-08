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
      const response = await fetch('http://localhost:3001/api/generate-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, language, framework }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate code');
      }

      const data = await response.json();
      return data.code;
    } catch (error) {
      console.error('Code generation error:', error);
      // Fallback to local generation
      return `// Generated ${language} code for: ${prompt}
// Framework: ${framework}

function generatedFunction() {
  // TODO: Implement based on prompt: ${prompt}
  console.log('Generated code placeholder');
  return 'success';
}

export default generatedFunction;`;
    }
  };

  const generateProject = async (description: string, projectType: string): Promise<Project> => {
    try {
      // Generate project structure based on type
      let files: Record<string, { content: string }> = {};

      switch (projectType.toLowerCase()) {
        case 'react':
          files = {
            'src/App.tsx': {
              content: await generateCode(`Create a React App component for: ${description}`, 'typescript', 'react')
            },
            'src/index.tsx': {
              content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<App />);`
            },
            'src/index.css': {
              content: `body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}`
            },
            'package.json': {
              content: JSON.stringify({
                name: description.toLowerCase().replace(/\s+/g, '-'),
                version: '0.1.0',
                dependencies: {
                  react: '^18.2.0',
                  'react-dom': '^18.2.0',
                  typescript: '^4.9.5'
                },
                scripts: {
                  start: 'react-scripts start',
                  build: 'react-scripts build'
                }
              }, null, 2)
            }
          };
          break;

        case 'node':
          files = {
            'src/index.js': {
              content: await generateCode(`Create a Node.js application for: ${description}`, 'javascript', 'node')
            },
            'package.json': {
              content: JSON.stringify({
                name: description.toLowerCase().replace(/\s+/g, '-'),
                version: '1.0.0',
                main: 'src/index.js',
                dependencies: {
                  express: '^4.18.2'
                },
                scripts: {
                  start: 'node src/index.js',
                  dev: 'nodemon src/index.js'
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
</head>
<body>
    <h1>${description}</h1>
    <script src="script.js"></script>
</body>
</html>`
            },
            'script.js': {
              content: await generateCode(`Create JavaScript code for: ${description}`, 'javascript')
            },
            'style.css': {
              content: `body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 20px;
  background-color: #f5f5f5;
}

h1 {
  color: #333;
  text-align: center;
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