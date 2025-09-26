import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Module } from '../types';
import { AuthService } from '../services/authService';
import { isValidUUID } from '../lib/utils';

interface AuthContextType {
  user: User | null;
  selectedModule: Module | null;
  availableModules: Module[];
  setSelectedModule: (module: Module | null) => void;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  selectModule: (module: Module) => void;
  isAuthenticated: boolean;
  isModuleSelected: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [availableModules, setAvailableModules] = useState<Module[]>([]);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('user');
    const savedModule = localStorage.getItem('selectedModule');
    
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        // Convert lastLogin string back to Date object if it exists
        if (parsedUser.lastLogin) {
          parsedUser.lastLogin = new Date(parsedUser.lastLogin);
        }
        setUser(parsedUser);
      } catch (error) {
        localStorage.removeItem('user');
      }
    }
    
    if (savedModule) {
      try {
        const parsedModule = JSON.parse(savedModule);
        if (parsedModule.id && isValidUUID(parsedModule.id)) {
          setSelectedModule(parsedModule);
        } else {
          console.warn('Invalid module ID found in localStorage:', parsedModule.id);
          localStorage.removeItem('selectedModule');
          setSelectedModule(null);
        }
      } catch (error) {
        localStorage.removeItem('selectedModule');
      }
    }
    
    // Load available modules
    loadModules();
  }, []);

  const loadModules = async () => {
    try {
      console.log('🔍 AuthContext: Loading modules...');
      const modules = await AuthService.getAvailableModules();
      console.log('🔍 AuthContext: Loaded modules:', modules.length, modules.map(m => ({ 
        id: m.id, 
        name: m.name, 
        active: m.active,
        validUUID: m.id && m.id.length === 36
      })));
      setAvailableModules(modules);
    } catch (error) {
      console.error('🔍 Failed to load modules:', error);
      // Set empty array to prevent infinite loading
      setAvailableModules([]);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const authenticatedUser = await AuthService.login(email, password);
      
      if (authenticatedUser) {
        setUser(authenticatedUser);
        localStorage.setItem('user', JSON.stringify(authenticatedUser));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const selectModule = (module: Module) => {
    console.log('Selecting module:', module);
    console.log('Module categories:', module.config?.categories);
    setSelectedModule(module);
    localStorage.setItem('selectedModule', JSON.stringify(module));
  };

  const logout = () => {
    setUser(null);
    setSelectedModule(null);
    localStorage.removeItem('user');
    localStorage.removeItem('selectedModule');
  };

  const value: AuthContextType = {
    user,
    selectedModule,
    availableModules,
    setSelectedModule,
    login,
    logout,
    selectModule,
    isAuthenticated: !!user,
    isModuleSelected: !!selectedModule
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};