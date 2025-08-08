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
        if (email === 'admin@alt-ai-mate.com' && password === 'MasterAdmin2024!') {
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