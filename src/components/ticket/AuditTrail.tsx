import React, { useState, useMemo } from 'react';
import { User, Clock, Search, X } from 'lucide-react';
import { Ticket } from '../../types';
import { useTickets } from '../../context/TicketContext';
import { useAuth } from '../../context/AuthContext';

interface AuditTrailProps {
  ticket: Ticket;
}

const AuditTrail: React.FC<AuditTrailProps> = ({ ticket }) => {
  const { users } = useTickets();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(date);
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATED': return 'bg-blue-100 text-blue-800';
      case 'STATUS_CHANGE': return 'bg-orange-100 text-orange-800';
      case 'UPDATED': return 'bg-green-100 text-green-800';
      case 'STEP_ADDED': return 'bg-purple-100 text-purple-800';
      case 'STEP_UPDATED': return 'bg-indigo-100 text-indigo-800';
      case 'STEP_DELETED': return 'bg-red-100 text-red-800';
      case 'DELETED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionDescription = (entry: any) => {
    switch (entry.action) {
      case 'CREATED':
        return 'Ticket created';
      case 'STATUS_CHANGE':
        return `Status changed from ${entry.oldValue} to ${entry.newValue}`;
      case 'UPDATED':
        return 'Ticket updated';
      case 'STEP_ADDED':
        return `Added step: ${entry.newValue}`;
      case 'STEP_UPDATED':
        return `Updated step: ${entry.newValue}`;
      case 'STEP_DELETED':
        return `Deleted step: ${entry.oldValue}`;
      default:
        return entry.action;
    }
  };

  // Filter audit entries based on user role
  const getFilteredAuditTrail = () => {
    if (user?.role === 'EMPLOYEE') {
      // Employees can see all status changes but no step-related entries
      return ticket.auditTrail.filter(entry => 
        entry.action === 'STATUS_CHANGE' || entry.action === 'CREATED' || entry.action === 'UPDATED'
      );
    }
    // EO and DO can see all audit entries
    return ticket.auditTrail;
  };

  // Apply search filter and sort by latest first
  const filteredAndSortedAuditTrail = useMemo(() => {
    let filtered = getFilteredAuditTrail();

    // Apply search filter if search term exists
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(entry => {
        const entryUser = users.find(u => u.id === entry.userId);
        const userName = entryUser?.name?.toLowerCase() || '';
        const action = entry.action.toLowerCase();
        const remarks = entry.remarks?.toLowerCase() || '';
        const description = getActionDescription(entry).toLowerCase();
        
        return (
          userName.includes(searchLower) ||
          action.includes(searchLower) ||
          remarks.includes(searchLower) ||
          description.includes(searchLower)
        );
      });
    }

    // Sort by timestamp (latest first)
    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [ticket.auditTrail, searchTerm, users, user?.role]);

  const clearSearch = () => {
    setSearchTerm('');
  };

  if (filteredAndSortedAuditTrail.length === 0 && !searchTerm) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No audit entries found.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Search Box */}
      <div className="mb-4 relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search audit trail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-10 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        {searchTerm && (
          <p className="text-xs text-gray-500 mt-1">
            {filteredAndSortedAuditTrail.length} result{filteredAndSortedAuditTrail.length !== 1 ? 's' : ''} found
          </p>
        )}
      </div>

      {/* Audit Entries */}
      <div className="flex-1 overflow-y-auto space-y-3">
        {filteredAndSortedAuditTrail.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No entries match your search.</p>
          </div>
        ) : (
          filteredAndSortedAuditTrail.map((entry, index) => {
            const entryUser = users.find(u => u.id === entry.userId);
            
            return (
              <div
                key={entry.id}
                className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <User className="h-4 w-4 text-gray-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {entryUser?.name || 'Unknown User'}
                      </p>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getActionColor(entry.action)}`}>
                        {entry.action}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">
                      {getActionDescription(entry)}
                    </p>
                    {entry.remarks && (
                      <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded border-l-2 border-blue-200 mb-2">
                        <strong>Remarks:</strong> {entry.remarks}
                      </div>
                    )}
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="w-3 h-3 mr-1" />
                      <span>{formatDate(new Date(entry.timestamp))}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AuditTrail;