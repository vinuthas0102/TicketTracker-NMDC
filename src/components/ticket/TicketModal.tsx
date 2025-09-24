import React, { useState } from 'react';
import { X, Calendar, User, AlertTriangle, Clock, CheckCircle, XCircle, FileText, Users, Edit, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Ticket, User as UserType } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useTickets } from '../../context/TicketContext';
import StatusTransitionModal from './StatusTransitionModal';
import StepManagement from './StepManagement';
import AuditTrail from './AuditTrail';

interface TicketModalProps {
  ticket: Ticket | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (ticket: Ticket) => void;
  onDelete: (ticketId: string) => void;
}

const TicketModal: React.FC<TicketModalProps> = ({ ticket, isOpen, onClose, onEdit, onDelete }) => {
  const { user } = useAuth();
  const { users } = useTickets();
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [detailsCollapsed, setDetailsCollapsed] = useState(false);
  const [stepsCollapsed, setStepsCollapsed] = useState(false);

  if (!isOpen || !ticket) return null;

  const createdByUser = users.find(u => u.id === ticket.createdBy);
  const assignedToUser = ticket.assignedTo ? users.find(u => u.id === ticket.assignedTo) : undefined;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DRAFT': return <FileText className="w-4 h-4" />;
      case 'CREATED': return <Clock className="w-4 h-4" />;
      case 'APPROVED': return <CheckCircle className="w-4 h-4" />;
      case 'ACTIVE': return <Users className="w-4 h-4" />;
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

  const canEdit = () => {
    if (!user) return false;
    if (user.role === 'EO') return true;
    if (user.role === 'DO') return ticket.department === user.department;
    return ticket.createdBy === user.id;
  };

  const canDelete = () => {
    if (!user) return false;
    if (user.role === 'EO') return true;
    if (user.role === 'DO') return ticket.department === user.department && ['DRAFT', 'CREATED'].includes(ticket.status);
    return ticket.createdBy === user.id && ['DRAFT', 'CREATED'].includes(ticket.status);
  };

  const canChangeStatus = () => {
    if (!user) return false;
    
    if (user.role === 'EO') return true;
    if (user.role === 'DO') return true;
    
    if (user.role === 'EMPLOYEE') {
      return ticket.createdBy === user.id && ['DRAFT', 'CREATED'].includes(ticket.status);
    }
    
    return false;
  };

  const getAvailableStatusTransitions = () => {
    if (!user) return [];
    
    const transitions: Record<string, string[]> = {
      'DRAFT': ['CREATED'],
      'CREATED': ['ACTIVE', 'APPROVED', 'CANCELLED'],
      'APPROVED': ['ACTIVE', 'CANCELLED'],
      'ACTIVE': ['COMPLETED', 'CANCELLED'],
      'CLOSED': ['ACTIVE'],
      'COMPLETED': ['ACTIVE'],
      'CANCELLED': ['CREATED']
    };
    
    const allTransitions = transitions[ticket.status] || [];
    
    if (user.role === 'EO') {
      return allTransitions;
    } else if (user.role === 'DO' || user.role === 'EMPLOYEE') {
      return allTransitions;
    }
    
    return [];
  };

  const completedSteps = ticket.steps.filter(step => step.status === 'COMPLETED').length;
  const totalSteps = ticket.steps.length;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(date);
  };

  const isOverdue = ticket.dueDate && new Date() > ticket.dueDate && ticket.status !== 'COMPLETED' && ticket.status !== 'CANCELLED';

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose}></div>
          
          <div className="relative bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[95vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-4">
                <h2 className="text-lg font-bold text-gray-900 truncate max-w-md">{ticket.title}</h2>
                <span className="text-xs font-mono text-gray-500">{ticket.ticketNumber}</span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center space-x-1 ${getStatusColor(ticket.status)}`}>
                  {getStatusIcon(ticket.status)}
                  <span>{ticket.status}</span>
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {canEdit() && (
                  <button
                    onClick={() => onEdit(ticket)}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors duration-200"
                    title="Edit ticket"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                )}
                {canDelete() && (
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this ticket?')) {
                        onDelete(ticket.id);
                        onClose();
                      }
                    }}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors duration-200"
                    title="Delete ticket"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content - Split Layout */}
            <div className="flex h-[80vh]">
              {/* Left Side - Details and Steps */}
              <div className="flex-1 w-2/3 p-6 overflow-y-auto space-y-6">
                {/* Ticket Details Section */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Ticket Details</h3>
                    <button
                      onClick={() => setDetailsCollapsed(!detailsCollapsed)}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    >
                      {detailsCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                    </button>
                  </div>

                  {!detailsCollapsed && (
                    <div className="space-y-4">
                      {/* Priority and Status Actions */}
                      <div className="flex items-center justify-between">
                        <div className={`px-2 py-1 text-xs font-medium rounded border flex items-center space-x-1 ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority === 'CRITICAL' || ticket.priority === 'HIGH' ? <AlertTriangle className="w-4 h-4" /> : null}
                          <span>{ticket.priority} Priority</span>
                        </div>
                        
                        {canChangeStatus() && getAvailableStatusTransitions().length > 0 && (
                          <button
                            onClick={() => setShowStatusModal(true)}
                            className="bg-blue-600 text-white px-3 py-1.5 text-sm rounded-lg hover:bg-blue-700 transition-colors duration-200"
                          >
                            Change Status
                          </button>
                        )}
                      </div>

                      {/* Progress - Only for EO and DO */}
                      {totalSteps > 0 && user?.role !== 'EMPLOYEE' && (
                        <div>
                          <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>Overall Progress</span>
                            <span>{completedSteps}/{totalSteps} steps completed</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: totalSteps > 0 ? `${(completedSteps / totalSteps) * 100}%` : '0%' }}
                            ></div>
                          </div>
                        </div>
                      )}

                      {/* Overdue Warning */}
                      {isOverdue && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-center space-x-2">
                          <AlertTriangle className="w-5 h-5 text-red-600" />
                          <span className="text-red-800 font-medium text-sm">This ticket is overdue!</span>
                        </div>
                      )}

                      {/* Description */}
                      <div>
                        <h4 className="text-base font-medium text-gray-900 mb-2">Description</h4>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
                      </div>

                      {/* Ticket Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-500">Created By</label>
                            <div className="flex items-center space-x-2 mt-1">
                              <User className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-900">{createdByUser?.name || 'Unknown'}</span>
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-gray-500">Department</label>
                            <div className="mt-1">
                              <span className="text-sm text-gray-900">{ticket.department}</span>
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-gray-500">Category</label>
                            <div className="mt-1">
                              <span className="text-sm text-gray-900">{ticket.category}</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-500">Assigned To</label>
                            <div className="flex items-center space-x-2 mt-1">
                              <Users className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-900">{assignedToUser?.name || 'Unassigned'}</span>
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-gray-500">Created</label>
                            <div className="flex items-center space-x-2 mt-1">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-900">{formatDate(ticket.createdAt)}</span>
                            </div>
                          </div>
                          
                          {ticket.dueDate && (
                            <div>
                              <label className="block text-xs font-medium text-gray-500">Due Date</label>
                              <div className="flex items-center space-x-2 mt-1">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                                  {formatDate(ticket.dueDate)}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Steps Section - Only for EO and DO */}
                {user?.role !== 'EMPLOYEE' && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">Steps ({totalSteps})</h3>
                      <button
                        onClick={() => setStepsCollapsed(!stepsCollapsed)}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                      >
                        {stepsCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                      </button>
                    </div>

                    {!stepsCollapsed && (
                      <StepManagement ticket={ticket} canManage={canEdit()} viewMode="inline" />
                    )}
                  </div>
                )}
              </div>

              {/* Right Side - Audit Trail */}
              <div className="w-1/3 border-l border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Audit Trail ({ticket.auditTrail.length})</h3>
                <div className="h-full overflow-hidden">
                  <AuditTrail ticket={ticket} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <StatusTransitionModal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        ticket={ticket}
        availableTransitions={getAvailableStatusTransitions()}
      />
    </>
  );
};

export default TicketModal;