import React from 'react';
import { Ticket, User } from '../../types';
import TicketCard from './TicketCard';
import { useTickets } from '../../context/TicketContext';
import StatusTransitionModal from '../ticket/StatusTransitionModal';

interface TicketGridProps {
  tickets: Ticket[];
  onTicketClick: (ticket: Ticket) => void;
  expandedTickets: Set<string>;
  onToggleExpand: (ticketId: string) => void;
  onModifyTicket: (ticket: Ticket) => void;
  viewMode: 'grid' | 'list' | 'compact';
}

const TicketGrid: React.FC<TicketGridProps> = ({ 
  tickets, 
  onTicketClick, 
  expandedTickets, 
  onToggleExpand,
  onModifyTicket,
  viewMode
}) => {
  const { users, changeTicketStatus } = useTickets();
  const [statusModalTicket, setStatusModalTicket] = React.useState<Ticket | null>(null);
  const [statusModalAction, setStatusModalAction] = React.useState<string>('');
  
  const getUserById = (id: string) => users.find(u => u.id === id);

  const handleStatusChange = (ticket: Ticket, action: string) => {
    setStatusModalTicket(ticket);
    setStatusModalAction(action);
  };

  const getNewStatusFromAction = (action: string) => {
    switch (action) {
      case 'approve': return 'APPROVED';
      case 'close': return 'CLOSED';
      case 'cancel': return 'CANCELLED';
      case 'reopen': return 'ACTIVE';
      case 'reinstate': return 'ACTIVE';
      default: return '';
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'approve': return 'Approve Ticket';
      case 'close': return 'Close Ticket';
      case 'cancel': return 'Cancel Ticket';
      case 'reopen': return 'Reopen Ticket';
      case 'reinstate': return 'Reinstate Ticket';
      default: return 'Change Status';
    }
  };
  if (tickets.length === 0) {
    return (
      <div className="glass-card rounded-xl p-8">
        <div className="text-center">
          <div className="text-gray-400 mb-6">
            <svg className="mx-auto w-16 h-16 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold gradient-text mb-2">No tickets found</h3>
          <p className="text-gray-600">Try adjusting your search criteria or create a new ticket.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`${
        viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' 
          : viewMode === 'list'
          ? 'space-y-2'
          : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-2'
      }`}>
        {tickets.map((ticket) => (
          <TicketCard
            key={ticket.id}
            ticket={ticket}
            createdByUser={getUserById(ticket.createdBy)}
            assignedToUser={ticket.assignedTo ? getUserById(ticket.assignedTo) : undefined}
            onClick={() => onTicketClick(ticket)}
            isExpanded={expandedTickets.has(ticket.id)}
            onExpand={() => onToggleExpand(ticket.id)}
            onModify={onModifyTicket}
            onApprove={(ticket) => handleStatusChange(ticket, 'approve')}
            onClose={(ticket) => handleStatusChange(ticket, 'close')}
            onCancel={(ticket) => handleStatusChange(ticket, 'cancel')}
            onMarkInProgress={(ticket) => handleStatusChange(ticket, 'inprogress')}
            onReopen={(ticket) => handleStatusChange(ticket, 'reopen')}
            onReinstate={(ticket) => handleStatusChange(ticket, 'reinstate')}
            onView={onTicketClick}
            viewMode={viewMode}
          />
        ))}
      </div>

      {statusModalTicket && (
        <StatusTransitionModal
          isOpen={true}
          onClose={() => {
            setStatusModalTicket(null);
            setStatusModalAction('');
          }}
          ticket={statusModalTicket}
          availableTransitions={[getNewStatusFromAction(statusModalAction)]}
          actionLabel={getActionLabel(statusModalAction)}
        />
      )}
    </>
  );
};

export default TicketGrid;