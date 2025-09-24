import React from 'react';
import { LogOut, User, Clock, Plus, Database, Wifi, Grid3X3 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getEnvironmentConfig } from '../../lib/environment';

interface HeaderProps {
  onCreateTicket: () => void;
}

const Header: React.FC<HeaderProps> = ({ onCreateTicket }) => {
  const { user, logout, selectedModule, setSelectedModule } = useAuth();
  const envConfig = getEnvironmentConfig();

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'EO': return 'bg-purple-100 text-purple-800';
      case 'DO': return 'bg-blue-100 text-blue-800';
      case 'EMPLOYEE': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'EO': return 'Executive Officer';
      case 'DO': return 'Department Officer';
      case 'EMPLOYEE': return 'Employee';
      default: return role;
    }
  };

  return (
    <>
      {envConfig.isDemoMode && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-2 text-yellow-800">
              <Wifi className="w-4 h-4" />
              <span className="text-sm font-medium">Demo Mode</span>
              <span className="text-sm">- Data changes are temporary. Connect Supabase for persistence.</span>
            </div>
            <div className="flex items-center space-x-1 text-yellow-700">
              <Database className="w-3 h-3" />
              <span className="text-xs">Mock Data</span>
            </div>
          </div>
        </div>
      )}
      
      <header className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-sm">TT</span>
                </div>
                <h1 className="text-xl font-bold text-white">Ticket Tracker System</h1>
              </div>
              {selectedModule && (
                <div className="flex items-center space-x-2">
                  <span className="text-blue-200">|</span>
                  <span className="text-sm font-medium text-blue-100">{selectedModule.name}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {selectedModule && (
              <button
                onClick={() => {
                  setSelectedModule(null);
                  localStorage.removeItem('selectedModule');
                }}
                className="p-2 text-blue-200 hover:text-white transition-all duration-200 hover:bg-blue-500 rounded-lg"
                title="Change module"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
            )}
            
            <div className="flex items-center space-x-3 pl-4 border-l border-blue-400">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-blue-200" />
                <div className="text-sm">
                  <div className="text-white font-medium">{user?.name}</div>
                  <div className="text-blue-200 text-xs">{user?.department}</div>
                </div>
                
                <span className={`px-2 py-1 text-xs font-medium rounded-full bg-white bg-opacity-20 text-white border border-white border-opacity-30`}>
                  {user?.role === 'EO' ? 'EO' : user?.role === 'DO' ? 'DO' : 'EMP'}
                </span>
              </div>

              {user?.lastLogin && (
                <div className="hidden md:flex items-center space-x-1 text-xs text-blue-200">
                  <Clock className="w-3 h-3 text-blue-300" />
                  <span>Last: {new Intl.DateTimeFormat('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }).format(user.lastLogin)}</span>
                </div>
              )}

              <button
                onClick={logout}
                className="p-2 text-blue-200 hover:text-white transition-all duration-200 hover:bg-red-500 rounded-lg"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
    </>
  );
};

export default Header;