import React, { useState } from 'react';
import { ArrowLeft, Calendar, User, AlertTriangle, Clock, CheckCircle, XCircle, FileText, Users, Edit, Trash2, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { Ticket, User as UserType } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useTickets } from '../../context/TicketContext';
import StatusTransitionModal from './StatusTransitionModal';
import StepManagement from './StepManagement';
import AuditTrail from './AuditTrail';
import DocumentViewer from './DocumentViewer';

interface TicketViewProps {
  ticket: Ticket;
  onClose: () => void;
  onEdit: (ticket: Ticket) => void;
  onDelete: (ticketId: string) => void;
}

const TicketView: React.FC<TicketViewProps> = ({ ticket, onClose, onEdit, onDelete }) => {
  const { user } = useAuth();
  const { users } = useTickets();
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [detailsCollapsed, setDetailsCollapsed] = useState(true);
  const [stepsCollapsed, setStepsCollapsed] = useState(true);
  const [viewingDocument, setViewingDocument] = useState<{
    id: string;
    name: string;
    url: string;
    type: string;
  } | null>(null);

  const createdByUser = users.find(u => u.id === ticket.createdBy);
  const assignedToUser = ticket.assignedTo ? users.find(u => u.id === ticket.assignedTo) : undefined;

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
      'ACTIVE': ['IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
      'IN_PROGRESS': ['RESOLVED', 'CANCELLED'],
      'RESOLVED': ['COMPLETED'],
      'CLOSED': ['ACTIVE'],
      'COMPLETED': ['ACTIVE'],
      'CANCELLED': ['CREATED']
    };
    
    const allTransitions = transitions[ticket.status] || [];
    
    // Role-based filtering
    if (user.role === 'EO') {
      return allTransitions;
    } else if (user.role === 'DO') {
      // DO can only progress through their allowed flow
      if (ticket.status === 'ACTIVE') return ['IN_PROGRESS'];
      if (ticket.status === 'IN_PROGRESS') return ['RESOLVED'];
      return [];
    } else if (user.role === 'EMPLOYEE') {
      // Employee has limited transitions
      if (ticket.status === 'DRAFT') return ['CREATED'];
      return [];
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
      <main className="flex-1 overflow-hidden">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 h-full">
          {/* Back Button */}
          <div className="mb-3">
            <button
              onClick={onClose}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors duration-200 interactive-hover"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to tickets</span>
            </button>
          </div>

          {/* Main Content - Split Layout */}
          <div className="flex flex-col lg:flex-row gap-3 h-full">
            {/* Left Side - Details and Steps */}
            <div className="flex-1 lg:w-2/3 compact-section overflow-y-auto">
              {/* Compact Ticket Details Section */}
              <div className="glass-card rounded-xl">
                <div className="compact-card">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      {/* Collapsed State - Compact Info */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="flex items-center space-x-3 min-w-0 flex-1">
                          <h1 className="text-lg font-bold gradient-text truncate">{ticket.title}</h1>
                          <span className="text-xs font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded-full whitespace-nowrap border thin-border border-blue-200">{ticket.ticketNumber}</span>
                        </div>
                        
                        <div className="flex items-center space-x-1.5 flex-shrink-0">
                          <span className={`px-2 py-1 text-xs font-medium rounded-lg flex items-center space-x-1 shadow-sm backdrop-blur-sm ${getStatusColor(ticket.status)}`}>
                            {getStatusIcon(ticket.status)}
                            <span className="hidden sm:inline">{ticket.status}</span>
                          </span>
                          
                          <div className={`px-2 py-1 text-xs font-medium rounded-lg thin-border flex items-center space-x-1 shadow-sm ${getPriorityColor(ticket.priority)}`}>
                            {ticket.priority === 'CRITICAL' || ticket.priority === 'HIGH' ? <AlertTriangle className="w-3 h-3" /> : null}
                            <span className="hidden sm:inline">{ticket.priority}</span>
                          </div>
                          
                          {assignedToUser && (
                            <div className="flex items-center space-x-1 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-lg thin-border border-gray-200">
                              <User className="w-3 h-3" />
                              <span className="hidden sm:inline">{assignedToUser.name.split(' ')[0]}</span>
                            </div>
                          )}
                          
                          {isOverdue && (
                            <div className="flex items-center space-x-1 text-xs text-red-600 bg-red-50 px-2 py-1 rounded-lg animate-pulse thin-border border-red-200">
                              <AlertTriangle className="w-3 h-3" />
                              <span className="hidden sm:inline">Overdue</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Icons - Only visible when collapsed */}
                    <div className="flex items-center space-x-1 ml-3 flex-shrink-0">
                      {canEdit() && (
                        <button
                          onClick={() => onEdit(ticket)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors duration-200 hover:bg-blue-50 rounded-lg interactive-hover"
                          title="Edit ticket"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      )}
                      
                      {canChangeStatus() && getAvailableStatusTransitions().length > 0 && (
                        <button
                          onClick={() => setShowStatusModal(true)}
                          className="p-1.5 text-gray-400 hover:text-green-600 transition-colors duration-200 hover:bg-green-50 rounded-lg interactive-hover"
                          title="Change status"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
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
                          className="p-1.5 text-gray-400 hover:text-red-600 transition-colors duration-200 hover:bg-red-50 rounded-lg interactive-hover"
                          title="Delete ticket"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    
                    <button
                      onClick={() => setDetailsCollapsed(!detailsCollapsed)}
                      className="ml-2 p-1.5 text-gray-400 hover:text-gray-600 transition-colors duration-200 hover:bg-gray-100 rounded-lg flex-shrink-0 interactive-hover"
                      title={detailsCollapsed ? "Expand details" : "Collapse details"}
                    >
                      {detailsCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Expanded State - Full Details */}
                  {!detailsCollapsed && (
                    <div className="mt-4 pt-3 border-t border-gray-200/50 compact-section animate-scaleIn">
                      {/* Action Buttons */}
                      {/* Progress - Only for EO and DO */}
                      {totalSteps > 0 && user?.role !== 'EMPLOYEE' && (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 thin-border border-blue-100">
                          <div className="flex justify-between text-sm text-gray-600 mb-1.5">
                            <span className="font-medium">Overall Progress</span>
                            <span>{completedSteps}/{totalSteps} steps completed</span>
                          </div>
                          <div className="w-full bg-white/60 rounded-full h-2.5 overflow-hidden shadow-inner">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2.5 rounded-full transition-all duration-700 shadow-sm animate-shimmer"
                              style={{ width: totalSteps > 0 ? `${(completedSteps / totalSteps) * 100}%` : '0%' }}
                            ></div>
                          </div>
                        </div>
                      )}

                      {/* Overdue Warning */}
                      {isOverdue && (
                        <div className="bg-red-50 thin-border border-red-200 rounded-lg p-3 flex items-center space-x-3 animate-pulse">
                          <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
                          <div>
                            <h3 className="text-red-800 font-medium text-sm">Ticket is overdue!</h3>
                            <p className="text-red-700 text-sm">Due date was {formatDate(ticket.dueDate!)}</p>
                          </div>
                        </div>
                      )}

                      {/* Description */}
                      <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-3 thin-border border-gray-100">
                        <h3 className="text-base font-medium text-gray-900 mb-2">Description</h3>
                        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm">{ticket.description}</p>
                      </div>

                      {/* Ticket Information */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                        <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-lg p-3 compact-section thin-border border-gray-100">
                          <h3 className="text-base font-medium text-gray-900 mb-2">Ticket Information</h3>
                          
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Created By</label>
                            <div className="flex items-center space-x-2">
                              <User className="w-3.5 h-3.5 text-gray-400" />
                              <span className="text-sm text-gray-900">{createdByUser?.name || 'Unknown'}</span>
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Department</label>
                            <span className="text-sm text-gray-900">{ticket.department}</span>
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
                            <span className="text-sm text-gray-900">{ticket.category}</span>
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 compact-section thin-border border-blue-100">
                          <h3 className="text-base font-medium text-gray-900 mb-2">Assignment & Dates</h3>
                          
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Assigned To</label>
                            <div className="flex items-center space-x-2">
                              <Users className="w-3.5 h-3.5 text-gray-400" />
                              <span className="text-sm text-gray-900">{assignedToUser?.name || 'Unassigned'}</span>
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Created</label>
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-3.5 h-3.5 text-gray-400" />
                              <span className="text-sm text-gray-900">{formatDate(ticket.createdAt)}</span>
                            </div>
                          </div>
                          
                          {ticket.dueDate && (
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Due Date</label>
                              <div className="flex items-center space-x-2">
                                <Calendar className="w-3.5 h-3.5 text-gray-400" />
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
              </div>

              {/* Steps Section - Only for EO and DO */}
              {user?.role !== 'EMPLOYEE' && (
                <div className="glass-card rounded-xl">
                  <div className="compact-card h-full flex flex-col">
                    {/* Fixed Header */}
                    <div className="flex items-center justify-between flex-shrink-0">
                      <div className="flex items-center space-x-2">
                        <h2 className="text-base font-bold gradient-text">Workflow Management ({totalSteps})</h2>
                        {totalSteps > 0 && (
                          <div className="flex items-center space-x-1.5 text-sm text-gray-600">
                            <span>{completedSteps}/{totalSteps} completed</span>
                            <div className="w-16 bg-gray-200 rounded-full h-1.5">
                              <div
                                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-1.5 rounded-full transition-all duration-500"
                                style={{ width: totalSteps > 0 ? `${(completedSteps / totalSteps) * 100}%` : '0%' }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <button
                        onClick={() => setStepsCollapsed(!stepsCollapsed)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors duration-200 hover:bg-gray-100 rounded-lg interactive-hover"
                        title={stepsCollapsed ? "Expand steps" : "Collapse steps"}
                      >
                        {stepsCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Scrollable Content Area */}
                    {!stepsCollapsed && (
                      <div className="mt-3 pt-2 border-t border-gray-200/50 flex-1 overflow-y-auto animate-scaleIn max-h-96">
                        <StepManagement 
                          ticket={ticket} 
                          canManage={canEdit()} 
                          viewMode="inline"
                          onViewDocument={(file) => setViewingDocument(file)}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Side - Audit Trail */}
            <div className="lg:w-1/3">
              <div className="glass-card lg:h-screen lg:sticky lg:top-4">
                <div className="compact-card h-full flex flex-col">
                  <h2 className="text-base font-bold gradient-text mb-3">
                    {viewingDocument ? 'Document Viewer' : `Audit Trail (${ticket.auditTrail.length})`}
                  </h2>
                  <div className="flex-1 overflow-hidden">
                    {viewingDocument ? (
                      <DocumentViewer
                       file={viewingDocument}
                        onClose={() => setViewingDocument(null)}
                      />
                    ) : (
                      <AuditTrail ticket={ticket} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <StatusTransitionModal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        ticket={ticket}
        availableTransitions={getAvailableStatusTransitions()}
      />
    </>
  );
};

export default TicketView;