import React from 'react';
import { FileText, Clock, Play, CheckCircle, XCircle, TrendingUp } from 'lucide-react';
import { TicketStatus } from '../../types';
import { useTickets } from '../../context/TicketContext';

interface StatusCardsProps {
  onStatusFilter: (status: TicketStatus | null) => void;
  activeFilter: TicketStatus | null;
}

const StatusCards: React.FC<StatusCardsProps> = ({ onStatusFilter, activeFilter }) => {
  const { tickets } = useTickets();

  const statusConfig = [
    { 
      status: 'DRAFT' as TicketStatus, 
      label: 'Draft', 
      icon: FileText,
      gradient: 'from-slate-400 via-slate-500 to-slate-600',
      textColor: 'text-white',
      glowColor: 'hover:shadow-slate-400/50'
    },
    { 
      status: 'CREATED' as TicketStatus, 
      label: 'Created', 
      icon: Clock,
      gradient: 'from-blue-400 via-blue-500 to-blue-600',
      textColor: 'text-white',
      glowColor: 'hover:shadow-blue-400/50'
    },
    { 
      status: 'APPROVED' as TicketStatus, 
      label: 'Approved', 
      icon: CheckCircle,
      gradient: 'from-purple-400 via-purple-500 to-purple-600',
      textColor: 'text-white',
      glowColor: 'hover:shadow-purple-400/50'
    },
    { 
      status: 'ACTIVE' as TicketStatus, 
      label: 'Active', 
      icon: Play,
      gradient: 'from-orange-400 via-orange-500 to-orange-600',
      textColor: 'text-white',
      glowColor: 'hover:shadow-orange-400/50'
    },
    { 
      status: 'IN_PROGRESS' as TicketStatus, 
      label: 'In Progress', 
      icon: TrendingUp,
      gradient: 'from-amber-400 via-yellow-500 to-yellow-600',
      textColor: 'text-white',
      glowColor: 'hover:shadow-yellow-400/50'
    },
    { 
      status: 'RESOLVED' as TicketStatus, 
      label: 'Resolved', 
      icon: CheckCircle,
      gradient: 'from-emerald-400 via-green-500 to-green-600',
      textColor: 'text-white',
      glowColor: 'hover:shadow-green-400/50'
    },
    { 
      status: 'COMPLETED' as TicketStatus, 
      label: 'Completed', 
      icon: CheckCircle,
      gradient: 'from-green-400 via-emerald-500 to-teal-600',
      textColor: 'text-white',
      glowColor: 'hover:shadow-emerald-400/50'
    },
    { 
      status: 'CLOSED' as TicketStatus, 
      label: 'Closed', 
      icon: XCircle,
      gradient: 'from-gray-400 via-gray-500 to-gray-600',
      textColor: 'text-white',
      glowColor: 'hover:shadow-gray-400/50'
    },
    { 
      status: 'CANCELLED' as TicketStatus, 
      label: 'Cancelled', 
      icon: XCircle,
      gradient: 'from-red-400 via-red-500 to-red-600',
      textColor: 'text-white',
      glowColor: 'hover:shadow-red-400/50'
    }
  ];

  const getStatusCount = (status: TicketStatus) => {
    return tickets.filter(ticket => ticket.status === status).length;
  };

  return (
    <div className="grid grid-cols-4 md:grid-cols-9 gap-2 mb-3">
      {statusConfig.map((config) => {
        const count = getStatusCount(config.status);
        const isActive = activeFilter === config.status;
        const IconComponent = config.icon;
        
        return (
          <div
            key={config.status}
            onClick={() => onStatusFilter(isActive ? null : config.status)}
            className={`
              status-card cursor-pointer rounded-xl p-2 relative overflow-hidden
              bg-gradient-to-br ${config.gradient} ${config.textColor}
              ${isActive ? 'ring-2 ring-white ring-opacity-60 scale-105 shadow-lg' : 'shadow-md'}
              ${config.glowColor} hover:shadow-xl
              min-h-[48px] flex items-center justify-center space-x-2
              backdrop-blur-sm border border-white/20
              transition-all duration-300 ease-out
              group
            `}
          >
            {/* Glossy overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="relative flex items-center space-x-1.5 z-10">
              <IconComponent className="w-4 h-4 drop-shadow-sm group-hover:scale-110 transition-transform duration-200" />
              <div className="flex flex-col items-center">
                <div className="text-lg font-bold leading-none drop-shadow-sm">{count}</div>
                <div className="text-xs font-medium truncate opacity-90 leading-none mt-0.5">{config.label}</div>
              </div>
            </div>
            
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
          </div>
        );
      })}
    </div>
  );
};

export default StatusCards;