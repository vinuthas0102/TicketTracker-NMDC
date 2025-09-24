import React from 'react';
import { Calendar, User, AlertTriangle, Clock, CheckCircle, XCircle, FileText, Users, ChevronDown, ChevronRight, Edit, Check, X, RotateCcw, Eye, MoreVertical, Play } from 'lucide-react';
import { Ticket, User as UserType } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useTickets } from '../../context/TicketContext';

interface TicketCardProps {
  ticket: Ticket;
  createdByUser?: UserType;
  assignedToUser?: UserType;
  onClick: () => void;
  onExpand?: (ticket: Ticket) => void;
  onModify?: (ticket: Ticket) => void;
  onApprove?: (ticket: Ticket) => void;
  onClose?: (ticket: Ticket) => void;
  onCancel?: (ticket: Ticket) => void;
  onReopen?: (ticket: Ticket) => void;
  onReinstate?: (ticket: Ticket) => void;
  onMarkInProgress?: (ticket: Ticket) => void;
  onView?: (ticket: Ticket) => void;
  isExpanded?: boolean;
  viewMode?: 'grid' | 'list' | 'compact';
}

const TicketCard: React.FC<TicketCardProps> = ({ 
  ticket, 
  createdByUser, 
  assignedToUser, 
  onClick, 
  onExpand,
  onModify,
  onApprove,
  onClose,
  onCancel,
  onReopen,
  onReinstate,
  onMarkInProgress,
  onView,
  isExpanded = false,
  viewMode = 'grid'
}) => {
  const { user } = useAuth();
  const { changeTicketStatus } = useTickets();
  const [showActionMenu, setShowActionMenu] = React.useState(false);
  const [menuPosition, setMenuPosition] = React.useState({ x: 0, y: 0 });
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DRAFT': return <FileText className="w-4 h-4" />;
      case 'CREATED': return <Clock className="w-4 h-4" />;
      case 'APPROVED': return <CheckCircle className="w-4 h-4" />;
      case 'ACTIVE': return <Users className="w-4 h-4" />;
      case 'IN_PROGRESS': return <Clock className="w-4 h-4" />;
      case 'RESOLVED': return <CheckCircle className="w-4 h-4" />;
      case 'COMPLETED': return <CheckCircle className="w-4 h-4" />;
      case 'CLOSED': return <XCircle className="w-4 h-4" />;
      case 'CANCELLED': return <XCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-gray-100 text-gray-800';
      case 'CREATED': return 'bg-blue-100 text-blue-800';
      case 'APPROVED': return 'bg-purple-100 text-purple-800';
      case 'ACTIVE': return 'bg-orange-100 text-orange-800';
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800';
      case 'RESOLVED': return 'bg-green-100 text-green-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'CLOSED': return 'bg-gray-100 text-gray-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'text-red-600 bg-red-50 border-red-200';
      case 'HIGH': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'LOW': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
      case 'HIGH':
        return <AlertTriangle className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const getTicketColorScheme = (status: string, priority: string) => {
    // Base colors by status
    const statusColors = {
      'DRAFT': {
        bg: 'bg-gradient-to-br from-gray-50 to-gray-100',
        border: 'border-gray-200',
        hover: 'hover:from-gray-100 hover:to-gray-200 hover:border-gray-300'
      },
      'CREATED': {
        bg: 'bg-gradient-to-br from-blue-50 to-blue-100',
        border: 'border-blue-200',
        hover: 'hover:from-blue-100 hover:to-blue-200 hover:border-blue-300'
      },
      'APPROVED': {
        bg: 'bg-gradient-to-br from-purple-50 to-purple-100',
        border: 'border-purple-200',
        hover: 'hover:from-purple-100 hover:to-purple-200 hover:border-purple-300'
      },
      'ACTIVE': {
        bg: 'bg-gradient-to-br from-orange-50 to-orange-100',
        border: 'border-orange-200',
        hover: 'hover:from-orange-100 hover:to-orange-200 hover:border-orange-300'
      },
      'COMPLETED': {
        bg: 'bg-gradient-to-br from-green-50 to-green-100',
        border: 'border-green-200',
        hover: 'hover:from-green-100 hover:to-green-200 hover:border-green-300'
      },
      'CLOSED': {
        bg: 'bg-gradient-to-br from-slate-50 to-slate-100',
        border: 'border-slate-200',
        hover: 'hover:from-slate-100 hover:to-slate-200 hover:border-slate-300'
      },
      'CANCELLED': {
        bg: 'bg-gradient-to-br from-red-50 to-red-100',
        border: 'border-red-200',
        hover: 'hover:from-red-100 hover:to-red-200 hover:border-red-300'
      }
    };

    // Priority accent colors
    const priorityAccents = {
      'CRITICAL': {
        bg: 'bg-gradient-to-br from-red-100 to-red-200',
        border: 'border-red-300',
        hover: 'hover:from-red-200 hover:to-red-300 hover:border-red-400',
        shadow: 'shadow-red-200/50'
      },
      'HIGH': {
        bg: 'bg-gradient-to-br from-orange-100 to-orange-200',
        border: 'border-orange-300',
        hover: 'hover:from-orange-200 hover:to-orange-300 hover:border-orange-400',
        shadow: 'shadow-orange-200/50'
      }
    };

    // Use priority colors for critical/high priority tickets
    if (priority === 'CRITICAL' || priority === 'HIGH') {
      return {
        ...priorityAccents[priority],
        hoverScale: 'hover:scale-105',
        hoverShadow: 'hover:shadow-lg'
      };
    }

    // Use status colors for normal priority tickets
    return {
      ...statusColors[status] || statusColors['DRAFT'],
      hoverScale: 'hover:scale-102',
      hoverShadow: 'hover:shadow-md'
    };
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const isOverdue = ticket.dueDate && new Date() > ticket.dueDate && ticket.status !== 'COMPLETED' && ticket.status !== 'CANCELLED';
  const completedSteps = ticket.steps.filter(step => step.status === 'COMPLETED').length;
  const totalSteps = ticket.steps.length;

  const canModify = () => {
    if (!user) return false;
    return ['DRAFT', 'CREATED'].includes(ticket.status) && 
           (user.role === 'EO' || 
            (user.role === 'DO' && ticket.department === user.department) ||
            (user.role === 'EMPLOYEE' && ticket.createdBy === user.id));
  };

  const canApprove = () => {
    if (!user) return false;
    return ticket.status === 'CREATED' && (user.role === 'EO' || user.role === 'DO');
  };

  const canCloseOrCancel = () => {
    if (!user) return false;
    return ticket.status === 'ACTIVE' && (user.role === 'EO' || user.role === 'DO');
  };

  const canReopen = () => {
    if (!user) return false;
    return ticket.status === 'CLOSED' && (user.role === 'EO' || user.role === 'DO');
  };

  const canReinstate = () => {
    if (!user) return false;
    return ticket.status === 'CANCELLED' && (user.role === 'EO' || user.role === 'DO');
  };

  const canMarkInProgress = () => {
    if (!user) return false;
    return ticket.status === 'CREATED' && (user.role === 'EO' || user.role === 'DO');
  };
  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  const handleActionMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPosition({
      x: rect.right - 200, // Position menu to the left of the button
      y: rect.bottom + 5
    });
    setShowActionMenu(!showActionMenu);
  };

  const handleMenuItemClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    setShowActionMenu(false);
    action();
  };

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => {
      setShowActionMenu(false);
    };
    
    if (showActionMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showActionMenu]);

  // Action Menu Component
  const ActionMenu: React.FC = () => {
    if (!showActionMenu) return null;

    const actions = [];

    // Add available actions based on permissions and status
    if (canModify()) {
      actions.push({
        icon: Edit,
        label: 'Modify',
        action: () => onModify?.(ticket),
        className: 'text-blue-700 hover:bg-blue-50'
      });
    }

    if (canMarkInProgress()) {
      actions.push({
        icon: Play,
        label: 'Mark In Progress',
        action: () => onMarkInProgress?.(ticket),
        className: 'text-orange-700 hover:bg-orange-50'
      });
    }

    if (canApprove()) {
      actions.push({
        icon: Check,
        label: 'Approve',
        action: () => onApprove?.(ticket),
        className: 'text-green-700 hover:bg-green-50'
      });
    }

    if (canCloseOrCancel()) {
      actions.push({
        icon: CheckCircle,
        label: 'Close',
        action: () => onClose?.(ticket),
        className: 'text-gray-700 hover:bg-gray-50'
      });
      actions.push({
        icon: X,
        label: 'Cancel',
        action: () => onCancel?.(ticket),
        className: 'text-red-700 hover:bg-red-50'
      });
    }

    if (canReopen()) {
      actions.push({
        icon: RotateCcw,
        label: 'Reopen',
        action: () => onReopen?.(ticket),
        className: 'text-blue-700 hover:bg-blue-50'
      });
    }

    if (canReinstate()) {
      actions.push({
        icon: RotateCcw,
        label: 'Reinstate',
        action: () => onReinstate?.(ticket),
        className: 'text-orange-700 hover:bg-orange-50'
      });
    }

    // Always show view action
    actions.push({
      icon: Eye,
      label: 'View Details',
      action: () => onView?.(ticket),
      className: 'text-indigo-700 hover:bg-indigo-50'
    });

    return (
      <div
        className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 py-2 min-w-48"
        style={{
          left: `${menuPosition.x}px`,
          top: `${menuPosition.y}px`
        }}
      >
        {actions.map((action, index) => {
          const IconComponent = action.icon;
          return (
            <button
              key={index}
              onClick={(e) => handleMenuItemClick(e, action.action)}
              className={`w-full flex items-center space-x-3 px-4 py-2 text-sm transition-colors duration-200 ${action.className}`}
            >
              <IconComponent className="w-4 h-4" />
              <span>{action.label}</span>
            </button>
          );
        })}
      </div>
    );
  };

  // Compact view rendering
  if (viewMode === 'compact') {
    const colorScheme = getTicketColorScheme(ticket.status, ticket.priority);
    
    return (
      <>
        <div className={`${colorScheme.bg} ${colorScheme.border} backdrop-blur-sm rounded-lg border shadow-sm transition-all duration-300 ${colorScheme.hover} ${colorScheme.hoverScale} ${colorScheme.hoverShadow} ${
          isOverdue ? 'border-red-300 bg-gradient-to-br from-red-50 to-red-100' : 'border-gray-200'
        }`}>
          <div 
            onClick={onClick}
            className="p-3 cursor-pointer hover:bg-white hover:bg-opacity-30 transition-all duration-200"
          >
            {/* Compact Header */}
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{ticket.ticketNumber}</span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center space-x-1 shadow-sm ${getStatusColor(ticket.status)}`}>
                {getStatusIcon(ticket.status)}
                <span className="hidden sm:inline">{ticket.status}</span>
              </span>
            </div>

            {/* Compact Title */}
            <h3 className="text-sm font-semibold text-gray-800 mb-2 line-clamp-2 leading-tight">
              {ticket.title}
            </h3>

            {/* Compact Progress */}
            {totalSteps > 0 && (
              <div className="mb-2">
                <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: totalSteps > 0 ? `${(completedSteps / totalSteps) * 100}%` : '0%' }}
                  ></div>
                </div>
              </div>
            )}

            {/* Compact Footer */}
            <div className="flex justify-between items-center text-xs text-gray-500">
              <div className={`px-1.5 py-0.5 text-xs font-medium rounded border flex items-center space-x-1 ${getPriorityColor(ticket.priority)}`}>
                {getPriorityIcon(ticket.priority)}
                <span className="hidden sm:inline">{ticket.priority}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                  {ticket.dueDate ? 
                    new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(ticket.dueDate) :
                    new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(ticket.createdAt)
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Action Menu Button */}
          <div className="px-3 pb-2 border-t border-gray-100">
            <div className="flex justify-end mt-2">
              <button
                onClick={handleActionMenuClick}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors duration-200"
                title="Actions"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        
        <ActionMenu />
      </>
    );
  }

  // List view rendering
  if (viewMode === 'list') {
    return (
      <>
        <div className={`bg-gradient-to-r from-slate-50 to-blue-50 bg-opacity-90 backdrop-blur-sm rounded-xl border shadow-lg transition-all duration-300 hover:shadow-xl hover:from-blue-100 hover:to-indigo-100 ${
          isOverdue ? 'border-red-300 bg-gradient-to-br from-red-50 to-red-100' : 'border-gray-200'
        }`}>
          <div 
            onClick={onClick}
            className="p-4 cursor-pointer hover:bg-gradient-to-r hover:from-white hover:to-blue-50 hover:bg-opacity-70 transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              {/* Left Section */}
              <div className="flex items-center space-x-4 flex-1">
                <button
                  onClick={(e) => handleActionClick(e, () => onExpand?.(ticket))}
                  className="p-1 hover:bg-blue-200 hover:text-blue-700 rounded transition-colors duration-200"
                >
                  {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
                
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{ticket.ticketNumber}</span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-gray-800 truncate">
                    {ticket.title}
                  </h3>
                  <p className="text-sm text-gray-600 truncate">
                    {ticket.description}
                  </p>
                </div>
              </div>

              {/* Right Section */}
              <div className="flex items-center space-x-4">
                {/* Progress */}
                {totalSteps > 0 && user?.role !== 'EMPLOYEE' && (
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">{completedSteps}/{totalSteps}</span>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: totalSteps > 0 ? `${(completedSteps / totalSteps) * 100}%` : '0%' }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Priority and Status */}
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center space-x-1 shadow-sm ${getStatusColor(ticket.status)}`}>
                    {getStatusIcon(ticket.status)}
                    <span>{ticket.status}</span>
                  </span>
                <div className={`px-2 py-1 text-xs font-medium rounded border flex items-center space-x-1 ${getPriorityColor(ticket.priority)}`}>
                  {getPriorityIcon(ticket.priority)}
                  <span>{ticket.priority}</span>
                </div>
                </div>

                {/* Users */}
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <User className="w-3 h-3" />
                    <span className="truncate max-w-20">
                      {createdByUser?.name?.split(' ')[0] || 'Unknown'}
                    </span>
                  </div>
                  {assignedToUser && (
                    <div className="flex items-center space-x-1">
                      <Users className="w-3 h-3" />
                      <span className="truncate max-w-20">
                        {assignedToUser.name.split(' ')[0]}
                      </span>
                    </div>
                  )}
                </div>

                {/* Date */}
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <Calendar className="w-3 h-3" />
                  <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                    {ticket.dueDate ? 
                      new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(ticket.dueDate) :
                      new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(ticket.createdAt)
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* Overdue Warning */}
            {isOverdue && (
              <div className="mt-3 flex items-center space-x-2 text-red-600 text-sm font-semibold bg-red-50 px-3 py-2 rounded-lg border border-red-200">
                <AlertTriangle className="w-3 h-3" />
                <span>Overdue</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="px-4 pb-3 border-t border-blue-100 bg-gradient-to-r from-slate-50 to-blue-50">
            <div className="flex justify-end mt-3">
              <button
                onClick={handleActionMenuClick}
                className="flex items-center space-x-1 px-3 py-1 text-xs bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-full hover:from-blue-200 hover:to-indigo-200 hover:text-blue-800 transition-all duration-200 shadow-sm"
                title="Actions"
              >
                <MoreVertical className="w-3 h-3" />
                <span>Actions</span>
              </button>
            </div>
          </div>

          {/* Expanded Content for List View */}
          {isExpanded && (
            <div className="px-4 pb-4 border-t border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 bg-opacity-60">
              <div className="mt-4 space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Created By:</span>
                    <span className="ml-2 text-blue-700">{createdByUser?.name || 'Unknown'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Department:</span>
                    <span className="ml-2 text-indigo-700">{ticket.department}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Category:</span>
                    <span className="ml-2 text-purple-700">{ticket.category}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Created:</span>
                    <span className="ml-2 text-slate-700">{formatDate(ticket.createdAt)}</span>
                  </div>
                </div>
                
                {ticket.description && (
                  <div>
                    <span className="font-medium text-gray-700">Description:</span>
                    <p className="mt-1 text-sm text-slate-700 bg-white bg-opacity-80 p-3 rounded-lg border border-blue-200 shadow-sm">{ticket.description}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        <ActionMenu />
      </>
    );
  }

  // Default grid view rendering (existing code)
  const colorScheme = getTicketColorScheme(ticket.status, ticket.priority);
  
  return (
    <>
      <div className={`${colorScheme.bg} ${colorScheme.border} backdrop-blur-sm rounded-xl border-2 shadow-lg transition-all duration-300 ${colorScheme.hover} ${colorScheme.hoverScale} ${colorScheme.hoverShadow} ${
        isOverdue ? 'border-red-300 bg-gradient-to-br from-red-50 to-red-100' : 'border-gray-200'
      }`}>
        <div 
          onClick={onClick}
          className="p-6 cursor-pointer hover:bg-gradient-to-br hover:from-white hover:to-blue-50 hover:bg-opacity-40 transition-all duration-200"
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={(e) => handleActionClick(e, () => onExpand?.(ticket))}
                className="p-1 hover:bg-blue-200 hover:text-blue-700 rounded transition-colors duration-200"
              >
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
              <span className="text-xs font-mono text-blue-600 bg-blue-100 px-2 py-1 rounded-full shadow-sm">{ticket.ticketNumber}</span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center space-x-1 shadow-sm ${getStatusColor(ticket.status)}`}>
                {getStatusIcon(ticket.status)}
                <span>{ticket.status}</span>
              </span>
            </div>
            <div className={`px-2 py-1 text-xs font-medium rounded-lg border flex items-center space-x-1 shadow-sm ${getPriorityColor(ticket.priority)}`}>
              {getPriorityIcon(ticket.priority)}
              <span>{ticket.priority}</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold bg-gradient-to-r from-slate-800 to-blue-700 bg-clip-text text-transparent mb-3 line-clamp-2 leading-tight">
            {ticket.title}
          </h3>

          {/* Description */}
          <p className="text-slate-600 text-sm mb-4 line-clamp-3 leading-relaxed">
            {ticket.description}
          </p>

          {/* Progress Bar */}
          {totalSteps > 0 && user?.role !== 'EMPLOYEE' && (
            <div className="mb-3">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Progress</span>
                <span>{completedSteps}/{totalSteps} steps</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: totalSteps > 0 ? `${(completedSteps / totalSteps) * 100}%` : '0%' }}
                ></div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-between items-center text-xs text-gray-500">
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <User className="w-3 h-3" />
                <span title={createdByUser?.name} className="truncate max-w-16">
                  {createdByUser?.name?.split(' ')[0] || 'Unknown'}
                </span>
              </div>
              {assignedToUser && (
                <div className="flex items-center space-x-1">
                  <Users className="w-3 h-3" />
                  <span title={assignedToUser.name} className="truncate max-w-16">
                    {assignedToUser.name.split(' ')[0]}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                {ticket.dueDate ? 
                  new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(ticket.dueDate) :
                  new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(ticket.createdAt)
                }
              </span>
            </div>
          </div>

          {/* Overdue Warning */}
          {isOverdue && (
            <div className="mt-3 flex items-center space-x-2 text-red-600 text-sm font-semibold bg-red-50 px-3 py-2 rounded-lg border border-red-200 animate-pulse">
              <AlertTriangle className="w-3 h-3" />
              <span>Overdue</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="px-6 pb-4 border-t border-blue-100 bg-gradient-to-r from-slate-50 to-blue-50">
          <div className="flex justify-end mt-3">
            <button
              onClick={handleActionMenuClick}
              className="flex items-center space-x-2 px-4 py-2 text-sm bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-lg hover:from-blue-200 hover:to-indigo-200 hover:text-blue-800 transition-all duration-200 shadow-sm hover:shadow-md"
              title="Actions"
            >
              <MoreVertical className="w-4 h-4" />
              <span>Actions</span>
            </button>
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="px-6 pb-4 border-t border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 bg-opacity-70">
            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Created By:</span>
                  <span className="ml-2 text-blue-700">{createdByUser?.name || 'Unknown'}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Department:</span>
                  <span className="ml-2 text-indigo-700">{ticket.department}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Category:</span>
                  <span className="ml-2 text-purple-700">{ticket.category}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Created:</span>
                  <span className="ml-2 text-slate-700">{formatDate(ticket.createdAt)}</span>
                </div>
              </div>
              
              {ticket.description && (
                <div>
                  <span className="font-medium text-gray-700">Description:</span>
                  <p className="mt-1 text-sm text-slate-700 bg-white bg-opacity-90 p-3 rounded-lg border border-blue-200 shadow-sm">{ticket.description}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      <ActionMenu />
    </>
  );
};

export default TicketCard;