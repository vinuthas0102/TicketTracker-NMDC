import React, { useState } from 'react';
import { X, Upload, CheckCircle, AlertTriangle } from 'lucide-react';
import { Ticket, TicketStatus } from '../../types';
import { useTickets } from '../../context/TicketContext';
import { useAuth } from '../../context/AuthContext';

interface StatusTransitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket;
  availableTransitions: string[];
  actionLabel?: string;
}

const StatusTransitionModal: React.FC<StatusTransitionModalProps> = ({
  isOpen,
  onClose,
  ticket,
  availableTransitions,
  actionLabel
}) => {
  const { user } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState<TicketStatus | ''>('');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [documentValidationErrors, setDocumentValidationErrors] = useState<string[]>([]);
  const { changeTicketStatus } = useTickets();

  if (!isOpen) return null;

  // Check if all mandatory documents are uploaded for resolution
  const validateMandatoryDocuments = (): string[] => {
    const errors: string[] = [];
    
    if (selectedStatus === 'RESOLVED' && user?.role === 'DO') {
      ticket.steps.forEach((step, stepIndex) => {
        step.documentRequirements?.forEach((req) => {
          if (req.type === 'mandatory' && !req.userUploadedFile) {
            errors.push(`Step ${step.stepNumber}: Missing mandatory document "${req.name}"`);
          }
        });
      });
    }
    
    return errors;
  };

  // Update validation when status changes
  React.useEffect(() => {
    if (selectedStatus) {
      const errors = validateMandatoryDocuments();
      setDocumentValidationErrors(errors);
    } else {
      setDocumentValidationErrors([]);
    }
  }, [selectedStatus, ticket.steps]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedStatus || remarks.trim().length < 10) {
      alert('Please select a status and provide remarks (minimum 10 characters)');
      return;
    }
    
    // Check mandatory documents for DO resolving tickets
    const validationErrors = validateMandatoryDocuments();
    if (validationErrors.length > 0) {
      alert('Cannot resolve ticket: Missing mandatory documents. Please upload all required documents first.');
      return;
    }

    setLoading(true);
    try {
      console.log('Attempting status change:', {
        ticketId: ticket.id,
        currentStatus: ticket.status,
        newStatus: selectedStatus,
        remarks: remarks.trim()
      });
      
      await changeTicketStatus({
        ticketId: ticket.id,
        newStatus: selectedStatus as TicketStatus,
        remarks: remarks.trim()
      });
      
      // Show success message
      alert('Status changed successfully!');
      
      // Reset form
      setSelectedStatus('');
      setRemarks('');
      
      onClose();
    } catch (error) {
      console.error('Status change error:', error);
      // More detailed error handling
      if (error instanceof Error) {
        if (error.message.includes('network') || error.message.includes('connection')) {
          alert('Network error: Please check your internet connection and try again.');
        } else if (error.message.includes('permission') || error.message.includes('unauthorized')) {
          alert('Permission error: You may not have permission to change this ticket status.');
        } else {
          alert(`Error: ${error.message}`);
        }
      } else {
        alert('Failed to change status. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'CREATED': 'Submit for Review',
      'APPROVED': 'Approve Ticket',
      'ACTIVE': 'Start Work',
      'COMPLETED': 'Mark Complete',
      'CANCELLED': 'Cancel Ticket'
    };
    return labels[status] || status;
  };

  const getStatusDescription = (status: string) => {
    const descriptions: Record<string, string> = {
      'CREATED': 'Submit this ticket for review and assignment',
      'APPROVED': 'Approve this ticket to proceed with work',
      'ACTIVE': 'Begin active work on this ticket',
      'IN_PROGRESS': 'Mark this ticket as currently being worked on',
      'RESOLVED': 'Mark this ticket as resolved (requires all mandatory documents)',
      'COMPLETED': 'Mark this ticket as completed',
      'CANCELLED': 'Cancel this ticket and close it'
    };
    return descriptions[status] || '';
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-75 transition-opacity" onClick={onClose}></div>
        
        <div className="relative bg-white rounded-lg shadow-2xl max-w-md w-full border-2 border-blue-200">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {actionLabel || 'Change Ticket Status'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-4 bg-gray-50 p-3 rounded-lg">
                Current Status: <span className="font-bold text-blue-600">{ticket.status}</span>
              </p>
              
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as TicketStatus)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
                required
              >
                <option value="">Select new status...</option>
                {availableTransitions.map(status => (
                  <option key={status} value={status}>
                    {getStatusLabel(status)}
                  </option>
                ))}
              </select>
              
              {selectedStatus && (
                <p className="text-sm text-blue-600 mt-2 bg-blue-50 p-2 rounded">
                  {getStatusDescription(selectedStatus)}
                </p>
              )}
              
              {/* Document Validation Errors */}
              {documentValidationErrors.length > 0 && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-medium text-red-800">Missing Mandatory Documents</span>
                  </div>
                  <ul className="text-sm text-red-700 space-y-1">
                    {documentValidationErrors.map((error, index) => (
                      <li key={index} className="flex items-start space-x-1">
                        <span className="text-red-500">•</span>
                        <span>{error}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-red-600 mt-2">
                    Please upload all mandatory documents in the workflow steps before resolving this ticket.
                  </p>
                </div>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Remarks *
              </label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
                placeholder="Please provide remarks for this status change (minimum 10 characters)..."
                required
                minLength={10}
              />
              <p className={`text-xs mt-1 ${remarks.length >= 10 ? 'text-green-600' : 'text-red-500'}`}>
                {remarks.length}/10 characters minimum
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !selectedStatus || remarks.trim().length < 10 || documentValidationErrors.length > 0}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {loading ? 'Changing...' : 'Change Status'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StatusTransitionModal;