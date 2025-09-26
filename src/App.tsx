import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Grid3X3, List, LayoutGrid } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TicketProvider, useTickets } from './context/TicketContext';
import { FileProvider } from './context/FileContext';
import LoginForm from './components/auth/LoginForm';
import ModuleSelection from './components/auth/ModuleSelection';
import LandingPage from './components/landing/LandingPage';
import Header from './components/layout/Header';
import StatusCards from './components/dashboard/StatusCards';
import SearchPanel from './components/dashboard/SearchPanel';
import TicketGrid from './components/dashboard/TicketGrid';
import TicketView from './components/ticket/TicketView';
import TicketForm from './components/ticket/TicketForm';
import LoadingSpinner from './components/common/LoadingSpinner';
import { Ticket, TicketStatus } from './types';

interface SearchFilters {
  search: string;
  status: TicketStatus | '';
  assignedTo: string;
  priority: string;
  department: string;
}

const Dashboard: React.FC = () => {
  const { user, selectedModule } = useAuth();
  const { tickets, loading, error } = useTickets();
  
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showTicketView, setShowTicketView] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState<TicketStatus | null>(null);
  const [expandedTickets, setExpandedTickets] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'compact'>('grid');
  
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    search: '',
    status: '',
    assignedTo: '',
    priority: '',
    department: ''
  });

  // Apply status filter to search filters when status card is clicked
  useEffect(() => {
    setSearchFilters(prev => ({
      ...prev,
      status: statusFilter || ''
    }));
  }, [statusFilter]);

  const filteredTickets = useMemo(() => {
    let result = tickets;

    // Apply search filter
    if (searchFilters.search) {
      const searchLower = searchFilters.search.toLowerCase();
      result = result.filter(ticket => 
        ticket.title.toLowerCase().includes(searchLower) ||
        ticket.description?.toLowerCase().includes(searchLower) ||
        ticket.ticketNumber.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (searchFilters.status) {
      result = result.filter(ticket => ticket.status === searchFilters.status);
    }

    // Apply priority filter
    if (searchFilters.priority) {
      result = result.filter(ticket => ticket.priority === searchFilters.priority);
    }

    // Apply department filter
    if (searchFilters.department) {
      result = result.filter(ticket => {
        // Assuming we need to check assigned user's department
        // This would need to be adjusted based on your actual data structure
        return true; // Placeholder - implement based on your needs
      });
    }

    // Apply assigned to filter
    if (searchFilters.assignedTo) {
      if (searchFilters.assignedTo === 'unassigned') {
        result = result.filter(ticket => !ticket.assignedTo);
      } else {
        result = result.filter(ticket => ticket.assignedTo === searchFilters.assignedTo);
      }
    }
    
    return result;
  }, [tickets, searchFilters]);

  const handleTicketClick = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setShowTicketView(true);
  };

  const handleEditTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setShowTicketView(false);
    setShowEditForm(true);
  };

  const handleDeleteTicket = async (ticketId: string) => {
    try {
      // In real app, this would call the delete function
      console.log('Delete ticket:', ticketId);
      // await deleteTicket(ticketId);
    } catch (error) {
      alert('Failed to delete ticket');
    }
  };

  const handleToggleExpand = (ticketId: string) => {
    const newExpanded = new Set(expandedTickets);
    if (newExpanded.has(ticketId)) {
      newExpanded.delete(ticketId);
    } else {
      newExpanded.add(ticketId);
    }
    setExpandedTickets(newExpanded);
  };

  const handleModifyTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setShowTicketView(false);
    setShowEditForm(true);
  };

  const getIconComponent = (iconName: string) => {
    // Map icon names to actual emoji icons
    const iconMap: Record<string, string> = {
      'Wrench': '🔧',
      'AlertTriangle': '⚠️',
      'Users': '👥',
      'FileText': '📄',
      'Briefcase': '💼'
    };
    return iconMap[iconName] || '📋';
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingSpinner />
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 shadow-lg">
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        </main>
      </div>
    );
  }

  // Show ticket view screen
  if (showTicketView && selectedTicket) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Header />
        <TicketView
          ticket={selectedTicket}
          onClose={() => {
            setShowTicketView(false);
            setSelectedTicket(null);
          }}
          onEdit={handleEditTicket}
          onDelete={handleDeleteTicket}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="mb-3 glass-card rounded-xl compact-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {selectedModule && (
                <div className="flex items-center space-x-3">
                  <div className="text-3xl">
                    {getIconComponent(selectedModule.icon)}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold gradient-text">
                      {selectedModule.name}
                    </h2>
                    <p className="text-gray-600 text-xs">
                      Welcome back, {user?.name}! You have access to{' '}
                      {user?.role === 'EO' ? 'all tickets across departments' : 
                       user?.role === 'DO' ? `${user.department} department tickets` : 
                       'your personal tickets'}.
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 text-sm rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 flex items-center space-x-2 shadow-md hover:shadow-lg interactive-hover"
            >
              <Plus className="w-4 h-4" />
              <span>Create Ticket</span>
            </button>
          </div>
        </div>

        <StatusCards 
          onStatusFilter={setStatusFilter}
          activeFilter={statusFilter}
        />

        <SearchPanel 
          filters={searchFilters}
          onFiltersChange={setSearchFilters}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        <div className="mb-2 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            <span className="bg-white/60 backdrop-blur-sm px-3 py-1 rounded-full text-xs thin-border border-gray-200">Showing {filteredTickets.length} ticket{filteredTickets.length !== 1 ? 's' : ''}</span>
          </div>
        </div>

        <TicketGrid 
          tickets={filteredTickets}
          onTicketClick={handleTicketClick}
          expandedTickets={expandedTickets}
          onToggleExpand={handleToggleExpand}
          onModifyTicket={handleModifyTicket}
          viewMode={viewMode}
        />
      </main>

      <TicketForm
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
      />

      <TicketForm
        isOpen={showEditForm}
        onClose={() => {
          setShowEditForm(false);
          setSelectedTicket(null);
        }}
        ticket={selectedTicket}
      />
    </div>
  );
};

const App: React.FC = () => {
  const [showLanding, setShowLanding] = useState(true);

  if (showLanding) {
    return <LandingPage onGetStarted={() => setShowLanding(false)} />;
  }

  return (
    <AuthProvider>
      <FileProvider>
        <TicketProvider>
          <AppContent />
        </TicketProvider>
      </FileProvider>
    </AuthProvider>
  );
};

const AppContent: React.FC = () => {
  const { isAuthenticated, isModuleSelected } = useAuth();

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  if (!isModuleSelected) {
    return <ModuleSelection />;
  }
  return <Dashboard />;
};

export default App;