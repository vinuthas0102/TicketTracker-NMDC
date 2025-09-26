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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
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
        console.error('Error parsing saved user:', error);
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
        console.error('Error parsing saved module:', error);
        localStorage.removeItem('selectedModule');
      }
    }
    
    // Load available modules
    loadModules().finally(() => setLoading(false));
  }, []);

  const loadModules = async (): Promise<void> => {
    try {
      console.log('🔍 AuthContext: Loading modules...');
      const modules = await AuthService.getAvailableModules();
      console.log('🔍 AuthContext: Loaded modules from service:', modules.length);
      console.log('🔍 AuthContext: Module names received:', modules.map(m => m.name));
      console.log('🔍 AuthContext: Setting availableModules state...');
      setAvailableModules(modules);
      console.log('🔍 AuthContext: availableModules state set successfully');
    } catch (error) {
      console.error('🔍 Failed to load modules:', error);
      // Set empty array to prevent infinite loading
      setAvailableModules([]);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('🔍 AuthContext: Attempting login for:', email);
      const authenticatedUser = await AuthService.login(email, password);
      
      if (authenticatedUser) {
        console.log('🔍 AuthContext: Login successful for:', authenticatedUser.name);
        setUser(authenticatedUser);
        localStorage.setItem('user', JSON.stringify(authenticatedUser));
        return true;
      }
      
      console.log('🔍 AuthContext: Login failed - invalid credentials');
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
    console.log('🔍 AuthContext: Logging out user');
    setUser(null);
    setSelectedModule(null);
    localStorage.removeItem('user');
    localStorage.removeItem('selectedModule');
  };

  // Show loading state while initializing
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }
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