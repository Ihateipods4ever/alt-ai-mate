import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Types
interface Project {
  id: string;
  name: string;
  type: string;
  files: Record<string, { content: string }>;
  createdAt: string;
  lastModified: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  subscription: 'free' | 'pro' | 'enterprise';
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
        // Mock authentication - in real app, this would call your API
        if (email && password) {
          const user: User = {
            id: 'user_' + Date.now(),
            email,
            name: email.split('@')[0],
            subscription: 'free'
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
          subscription: 'free'
        };
        setState(prev => ({ ...prev, user, isAuthenticated: true }));
        resolve(true);
      }, 1000);
    });
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
      lastModified: new Date().toISOString()
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
    saveToStorage,
    loadFromStorage,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};