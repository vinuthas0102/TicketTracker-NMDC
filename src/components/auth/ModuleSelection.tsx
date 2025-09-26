import React from 'react';
import { Module } from '../../types';
import { useAuth } from '../../context/AuthContext';

const ModuleSelection: React.FC = () => {
  const { availableModules, selectModule } = useAuth();

  console.log('ModuleSelection: Available modules:', availableModules.length, availableModules.map(m => ({ id: m.id, name: m.name, active: m.active })));

  const getIconComponent = (iconName: string) => {
    // Map icon names to actual Lucide icons
    const iconMap: Record<string, string> = {
      'Wrench': '🔧',
      'AlertTriangle': '⚠️',
      'Users': '👥',
      'FileText': '📄',
      'Briefcase': '💼'
    };
    return iconMap[iconName] || '📋';
  };

  // Filter only active modules
  const activeModules = availableModules.filter(module => module.active !== false);

  console.log('ModuleSelection: Active modules to display:', activeModules.length, activeModules.map(m => ({ id: m.id, name: m.name })));
  
  if (activeModules.length === 0) {
    console.warn('ModuleSelection: No active modules found!');
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 flex items-center justify-center px-4">
        <div className="max-w-6xl w-full bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-2xl p-10 border border-white border-opacity-20">
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">No Modules Available</h1>
            <p className="text-gray-600 text-lg">No active modules found. Please contact your administrator.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 flex items-center justify-center px-4">
      <div className="max-w-6xl w-full bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-2xl p-10 border border-white border-opacity-20">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">Select Module</h1>
          <p className="text-gray-600 text-lg">Choose the module you want to work with</p>
          <p className="text-sm text-gray-500 mt-2">Available modules: {activeModules.length}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {activeModules.map((module) => (
            <div
              key={module.id}
              onClick={() => selectModule(module)}
              className={`
                cursor-pointer rounded-2xl p-6 border-2 border-transparent
                bg-gradient-to-br ${module.color}
                hover:scale-105 transform transition-all duration-300
                hover:shadow-2xl text-white shadow-lg
                hover:-translate-y-1 min-h-[280px] flex flex-col justify-between
              `}
            >
              <div className="text-center">
                <div className="text-5xl mb-4">
                  {getIconComponent(module.icon)}
                </div>
                <h3 className="text-xl font-bold mb-3 leading-tight">{module.name}</h3>
                <p className="text-sm opacity-90 mb-4 leading-relaxed">{module.description}</p>
                <div className="text-xs opacity-75 bg-white bg-opacity-20 rounded-full px-3 py-1 inline-block mt-auto">
                  Categories: {module.config.categories.length}
                </div>
              </div>
            </div>
          ))}
        </div>

        {activeModules.length === 0 && (
          <div className="text-center text-gray-600 mt-8">
            <p>No modules available. Please contact your administrator.</p>
          </div>
        )}

        <div className="mt-10 text-center">
          <p className="text-gray-600">
            Select a module to start creating and managing tickets
          </p>
        </div>
      </div>
    </div>
  );
};

export default ModuleSelection;
