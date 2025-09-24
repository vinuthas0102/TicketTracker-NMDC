import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Clock, CheckCircle, User, FileText, Upload, Eye, Download, X, MoreVertical, RefreshCw } from 'lucide-react';
import { Ticket, TicketStep, StepStatus, ReferenceFile, DocumentRequirement } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useTickets } from '../../context/TicketContext';
import { useFiles } from '../../context/FileContext';
import { generateUUID } from '../../lib/utils';

interface StepManagementProps {
  ticket: Ticket;
  canManage: boolean;
  viewMode?: 'modal' | 'inline';
  onViewDocument?: (file: { id: string; name: string; url: string; type: string }) => void;
}

const StepManagement: React.FC<StepManagementProps> = ({ 
  ticket, 
  canManage, 
  viewMode = 'modal',
  onViewDocument 
}) => {
  const { user } = useAuth();
  const { addStep, updateStep, deleteStep, users } = useTickets();
  const { storeFile, getFileUrl, getFile } = useFiles();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStep, setEditingStep] = useState<TicketStep | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<Map<string, File>>(new Map());
  const [viewingStep, setViewingStep] = useState<TicketStep | null>(null);
  const [changingStatusStep, setChangingStatusStep] = useState<TicketStep | null>(null);
  const [newStepStatus, setNewStepStatus] = useState<StepStatus>('PENDING');
  const [stepStatusRemarks, setStepStatusRemarks] = useState('');
  
  // Check if user can manage steps (only EO can create/modify steps)
  const canCreateModifySteps = user?.role === 'EO';
  
  // Check if user can upload documents (DO can upload, EO can manage)
  const canUploadDocuments = user?.role === 'DO' || user?.role === 'EO';
  
  // Check if user can view/change step status (DO and EO)
  const canViewChangeStepStatus = user?.role === 'DO' || user?.role === 'EO';

  const [formData, setFormData] = useState({
    stepNumber: '',
    title: '',
    description: '',
    status: 'PENDING' as StepStatus,
    assignedTo: '',
    referenceFiles: [] as ReferenceFile[],
    documentRequirements: [] as DocumentRequirement[]
  });

  // Initialize file store with existing step files
  useEffect(() => {
    ticket.steps.forEach(step => {
      // Store reference files
      step.referenceFiles?.forEach(file => {
      if (file.fileData) {
        try {
          storeFile(file.id, file.fileData);
        } catch (error) {
          console.warn('Failed to store reference file:', file.name, error);
        }
      }
    });
    
    // Store document requirement files
    step.documentRequirements?.forEach(req => {
      if (req.userUploadedFile?.fileData) {
        try {
          storeFile(req.userUploadedFile.id, req.userUploadedFile.fileData);
        } catch (error) {
          console.warn('Failed to store document requirement file:', req.userUploadedFile.name, error);
        }
      }
    });
  });
}, [ticket.steps, storeFile]);

  const resetForm = () => {
    setFormData({
      stepNumber: '',
      title: '',
      description: '',
      status: 'PENDING',
      assignedTo: '',
      referenceFiles: [],
      documentRequirements: []
    });
    setUploadedFiles(new Map());
  };

  const getNextStepNumber = () => {
    const existingNumbers = ticket.steps.map(step => parseInt(step.stepNumber) || 0);
    return (Math.max(0, ...existingNumbers) + 1).toString();
  };

  const handleAddStep = () => {
    setEditingStep(null);
    setFormData(prev => ({
      ...prev,
      stepNumber: getNextStepNumber()
    }));
    setShowAddForm(true);
  };

  const handleEditStep = (step: TicketStep) => {
    setEditingStep(step);
    setFormData({
      stepNumber: step.stepNumber,
      title: step.title,
      description: step.description || '',
      status: step.status,
      assignedTo: step.assignedTo || '',
      referenceFiles: step.referenceFiles || [],
      documentRequirements: step.documentRequirements || []
    });
    setShowAddForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    try {
      // Process uploaded files and create blob URLs
      const processedReferenceFiles = formData.referenceFiles.map(file => {
        const uploadedFile = uploadedFiles.get(file.id);
        if (uploadedFile) {
          const url = storeFile(file.id, uploadedFile);
          return {
            ...file,
            url,
            fileData: uploadedFile
          };
        }
        return file;
      });

      const processedDocumentRequirements = formData.documentRequirements.map(req => {
        if (req.userUploadedFile) {
          const uploadedFile = uploadedFiles.get(req.userUploadedFile.id);
          if (uploadedFile) {
            const url = storeFile(req.userUploadedFile.id, uploadedFile);
            return {
              ...req,
              userUploadedFile: {
                ...req.userUploadedFile,
                url,
                fileData: uploadedFile
              }
            };
          }
        }
        return req;
      });

      const stepData = {
        ticketId: ticket.id,
        stepNumber: formData.stepNumber,
        title: formData.title,
        description: formData.description,
        status: formData.status,
        assignedTo: formData.assignedTo || undefined,
        createdBy: user.id,
        referenceFiles: processedReferenceFiles,
        documentRequirements: processedDocumentRequirements
      };

      console.log('Submitting step with processed files:', {
        referenceFiles: processedReferenceFiles.length,
        documentRequirements: processedDocumentRequirements.length,
        uploadedFilesCount: uploadedFiles.size
      });

      if (editingStep) {
        await updateStep(ticket.id, editingStep.id, stepData);
      } else {
        await addStep(ticket.id, stepData);
      }

      setShowAddForm(false);
      resetForm();
    } catch (error) {
      console.error('Error saving step:', error);
      alert('Failed to save step. Please try again.');
    }
  };

  const handleDeleteStep = async (stepId: string) => {
    if (confirm('Are you sure you want to delete this step?')) {
      try {
        await deleteStep(ticket.id, stepId);
      } catch (error) {
        console.error('Error deleting step:', error);
        alert('Failed to delete step. Please try again.');
      }
    }
  };

  const handleViewStep = (step: TicketStep) => {
    setViewingStep(step);
  };

  const handleChangeStepStatus = (step: TicketStep) => {
    setChangingStatusStep(step);
    setNewStepStatus(step.status);
    setStepStatusRemarks('');
  };

  const handleStepStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!changingStatusStep || !user) return;
    
    if (stepStatusRemarks.trim().length < 5) {
      alert('Please provide remarks (minimum 5 characters)');
      return;
    }

    try {
      await updateStep(ticket.id, changingStatusStep.id, {
        status: newStepStatus,
        completedAt: newStepStatus === 'COMPLETED' ? new Date() : undefined
      });
      
      setChangingStatusStep(null);
      setStepStatusRemarks('');
      alert('Step status updated successfully!');
    } catch (error) {
      console.error('Error updating step status:', error);
      alert('Failed to update step status. Please try again.');
    }
  };

  const handleReferenceFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    files.forEach(file => {
      const fileId = generateUUID();
      const referenceFile: ReferenceFile = {
        id: fileId,
        name: file.name,
        url: '', // Will be set when stored
        size: file.size,
        type: file.type,
        uploadedAt: new Date(),
        uploadedBy: user?.id || '',
        fileData: file
      };

      setFormData(prev => ({
        ...prev,
        referenceFiles: [...prev.referenceFiles, referenceFile]
      }));

      setUploadedFiles(prev => new Map(prev).set(fileId, file));
    });

    // Reset input
    e.target.value = '';
  };

  const handleDocumentRequirementUpload = (requirementId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileId = generateUUID();
    const uploadedFile = {
      id: fileId,
      name: file.name,
      url: '', // Will be set when stored
      size: file.size,
      type: file.type,
      uploadedAt: new Date(),
      fileData: file
    };

    setFormData(prev => ({
      ...prev,
      documentRequirements: prev.documentRequirements.map(req =>
        req.id === requirementId
          ? { ...req, userUploadedFile: uploadedFile }
          : req
      )
    }));

    setUploadedFiles(prev => new Map(prev).set(fileId, file));

    // Reset input
    e.target.value = '';
  };

  const addDocumentRequirement = () => {
    const newRequirement: DocumentRequirement = {
      id: generateUUID(),
      name: '',
      description: '',
      type: 'mandatory'
    };

    setFormData(prev => ({
      ...prev,
      documentRequirements: [...prev.documentRequirements, newRequirement]
    }));
  };

  const updateDocumentRequirement = (id: string, updates: Partial<DocumentRequirement>) => {
    setFormData(prev => ({
      ...prev,
      documentRequirements: prev.documentRequirements.map(req =>
        req.id === id ? { ...req, ...updates } : req
      )
    }));
  };

  const removeDocumentRequirement = (id: string) => {
    setFormData(prev => ({
      ...prev,
      documentRequirements: prev.documentRequirements.filter(req => req.id !== id)
    }));
  };

  const removeReferenceFile = (id: string) => {
    setFormData(prev => ({
      ...prev,
      referenceFiles: prev.referenceFiles.filter(file => file.id !== id)
    }));
    setUploadedFiles(prev => {
      const newMap = new Map(prev);
      newMap.delete(id);
      return newMap;
    });
  };

  const handleViewFile = useCallback((file: { id: string; name: string; url?: string; type: string; fileData?: File }) => {
    console.log('Attempting to view file:', { id: file.id, name: file.name, hasUrl: !!file.url, hasFileData: !!file.fileData });
    
    let fileUrl: string | null = null;
    
    try {
      // Strategy 1: Use existing URL if available
      if (file.url && file.url.startsWith('blob:')) {
        fileUrl = file.url;
        console.log('Using existing blob URL:', fileUrl);
      } else if (file.url && (file.url.startsWith('http') || file.url.startsWith('data:'))) {
        fileUrl = file.url;
        console.log('Using existing URL:', fileUrl);
      }
      // Strategy 2: Create blob URL from file data
      else if (file.fileData instanceof File || file.fileData instanceof Blob) {
        fileUrl = URL.createObjectURL(file.fileData);
        console.log('Created blob URL from fileData:', fileUrl);
      }
      // Strategy 3: Try to get from file store
      else {
        const storedFile = getFile(file.id);
        if (storedFile && storedFile.file) {
          fileUrl = URL.createObjectURL(storedFile.file);
          console.log('Created blob URL from stored file:', fileUrl);
        } else {
          const storedUrl = getFileUrl(file.id);
          if (storedUrl) {
            fileUrl = storedUrl;
            console.log('Got URL from file store:', fileUrl);
          }
        }
      }

      if (fileUrl) {
        if (onViewDocument) {
          onViewDocument({
            id: file.id,
            name: file.name,
            url: fileUrl,
            type: file.type
          });
        } else {
          // Fallback: open in new tab
          window.open(fileUrl, '_blank');
        }
      } else {
        console.error('No valid URL found for file:', file);
        alert('Unable to view file. File may not be available or corrupted.');
      }
    } catch (error) {
      console.error('Error viewing file:', error);
      alert('Error occurred while trying to view the file.');
    }
  }, [onViewDocument, getFile, getFileUrl]);

  const handleDownloadFile = useCallback((file: { id: string; name: string; url?: string; fileData?: File }) => {
    console.log('Attempting to download file:', { id: file.id, name: file.name, hasUrl: !!file.url, hasFileData: !!file.fileData });
    
    let fileUrl: string | null = null;
    let shouldRevokeUrl = false;
    
    try {
      // Strategy 1: Use existing URL if available
      if (file.url && (file.url.startsWith('blob:') || file.url.startsWith('http') || file.url.startsWith('data:'))) {
        fileUrl = file.url;
        console.log('Using existing URL for download:', fileUrl);
      }
      // Strategy 2: Create blob URL from file data
      else if (file.fileData instanceof File || file.fileData instanceof Blob) {
        fileUrl = URL.createObjectURL(file.fileData);
        shouldRevokeUrl = true;
        console.log('Created blob URL for download:', fileUrl);
      }
      // Strategy 3: Try to get from file store
      else {
        const storedFile = getFile(file.id);
        if (storedFile && storedFile.file) {
          fileUrl = URL.createObjectURL(storedFile.file);
          shouldRevokeUrl = true;
          console.log('Created blob URL from stored file for download:', fileUrl);
        } else {
          const storedUrl = getFileUrl(file.id);
          if (storedUrl) {
            fileUrl = storedUrl;
            console.log('Got URL from file store for download:', fileUrl);
          }
        }
      }

      if (fileUrl) {
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = file.name;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up blob URL if we created it
        if (shouldRevokeUrl) {
          setTimeout(() => URL.revokeObjectURL(fileUrl!), 1000);
        }
        
        console.log('File download initiated successfully');
      } else {
        console.error('No valid URL found for file download:', file);
        alert('Unable to download file. File may not be available or corrupted.');
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Error occurred while trying to download the file.');
    }
  }, [getFile, getFileUrl]);

  const getStatusIcon = (status: StepStatus) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'IN_PROGRESS': return <Clock className="w-4 h-4 text-orange-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: StepStatus) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-200';
      case 'IN_PROGRESS': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const availableUsers = users.filter(u => {
    if (user?.role === 'EO') return true;
    if (user?.role === 'DO') return u.department === user.department;
    return false;
  });

  return (
    <div className="space-y-4">
      {/* Header - Only show Add Step button, NO Resequence button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Workflow Management</h3>
        {canManage && canCreateModifySteps && (
          <button
            onClick={handleAddStep}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Workflow Step</span>
          </button>
        )}
      </div>

      {/* Steps List */}
      <div className="space-y-4">
        {ticket.steps.map((step, index) => {
          const assignedUser = step.assignedTo ? users.find(u => u.id === step.assignedTo) : null;
          
          return (
            <div key={step.id} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-3">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                    Workflow Step {step.stepNumber}
                  </span>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center space-x-1 ${getStatusColor(step.status)}`}>
                    {getStatusIcon(step.status)}
                    <span>{step.status}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {/* Action icons for DO users */}
                  {canViewChangeStepStatus && (
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleViewStep(step)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors duration-200 hover:bg-blue-50 rounded"
                        title="View step details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleChangeStepStatus(step)}
                        className="p-1 text-gray-400 hover:text-green-600 transition-colors duration-200 hover:bg-green-50 rounded"
                        title="Change step status"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  
                  {/* Edit/Delete for EO users */}
                  {canManage && canCreateModifySteps && (
                    <div className="flex items-center space-x-1 ml-2 pl-2 border-l border-gray-300">
                    <button
                      onClick={() => handleEditStep(step)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors duration-200"
                      title="Edit step"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteStep(step.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors duration-200"
                      title="Delete step"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    </div>
                  )}
                </div>
              </div>

              <h4 className="font-semibold text-gray-900 mb-2">{step.title}</h4>
              
              {step.description && (
                <p className="text-gray-600 text-sm mb-3">{step.description}</p>
              )}

              {assignedUser && (
                <div className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
                  <User className="w-4 h-4" />
                  <span>{assignedUser.name}</span>
                </div>
              )}

              {/* Reference Files Section */}
              {step.referenceFiles && step.referenceFiles.length > 0 && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                  <h5 className="text-sm font-medium text-green-800 mb-2 flex items-center">
                    <FileText className="w-4 h-4 mr-1" />
                    Reference Files ({step.referenceFiles.length})
                  </h5>
                  <div className="space-y-2">
                    {step.referenceFiles.map((file) => (
                      <div key={file.id} className="flex items-center justify-between bg-white p-2 rounded border border-green-200">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                          <p className="text-xs text-gray-500">
                            {(file.size / 1024).toFixed(1)} KB • {file.type}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 ml-2">
                          <button
                            onClick={() => handleViewFile(file)}
                            className="p-1 text-green-600 hover:text-green-800 hover:bg-green-100 rounded transition-colors duration-200"
                            title="View file"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDownloadFile(file)}
                            className="p-1 text-green-600 hover:text-green-800 hover:bg-green-100 rounded transition-colors duration-200"
                            title="Download file"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Document Requirements Section */}
              {step.documentRequirements && step.documentRequirements.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <h5 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
                    <FileText className="w-4 h-4 mr-1" />
                    Document Requirements ({step.documentRequirements.length})
                  </h5>
                  <div className="space-y-2">
                    {step.documentRequirements.map((req) => (
                      <div key={req.id} className="bg-white p-2 rounded border border-blue-200">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-900">{req.name}</span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            req.type === 'mandatory' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {req.type}
                          </span>
                        </div>
                        {req.description && (
                          <p className="text-xs text-gray-600 mb-2">{req.description}</p>
                        )}
                        {req.userUploadedFile ? (
                          <div className="flex items-center justify-between bg-green-50 p-2 rounded border border-green-200">
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <div>
                                <p className="text-sm font-medium text-green-800">{req.userUploadedFile.name}</p>
                                <p className="text-xs text-green-600">
                                  {(req.userUploadedFile.size / 1024).toFixed(1)} KB • {req.userUploadedFile.type}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleViewFile(req.userUploadedFile!)}
                                className="p-1 text-green-600 hover:text-green-800 hover:bg-green-100 rounded transition-colors duration-200"
                                title="View file"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDownloadFile(req.userUploadedFile!)}
                                className="p-1 text-green-600 hover:text-green-800 hover:bg-green-100 rounded transition-colors duration-200"
                                title="Download file"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded mb-2">
                              No file uploaded
                            </div>
                            {/* Allow DO to upload documents */}
                            {canUploadDocuments && (
                              <div className="mt-2">
                                <input
                                  type="file"
                                  onChange={(e) => handleDocumentRequirementUpload(req.id, e)}
                                  className="text-xs w-full"
                                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.xlsx,.xls"
                                />
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {ticket.steps.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No workflow steps created yet.</p>
            {canManage && (
              <p className="text-sm">Click "Add Workflow Step" to get started.</p>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Step Form */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setShowAddForm(false)}></div>
            
            <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900">
                  {editingStep ? 'Edit Workflow Step' : 'Add Workflow Step'}
                </h3>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 max-h-[70vh] overflow-y-auto">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Step Number
                      </label>
                      <input
                        type="text"
                        value={formData.stepNumber}
                        onChange={(e) => setFormData({ ...formData, stepNumber: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as StepStatus })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Assigned To
                    </label>
                    <select
                      value={formData.assignedTo}
                      onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Unassigned</option>
                      {availableUsers.map(user => (
                        <option key={user.id} value={user.id}>{user.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Reference Files Section */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reference Files
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                      <input
                        type="file"
                        multiple
                        onChange={handleReferenceFileUpload}
                        className="hidden"
                        id="reference-files"
                        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.xlsx,.xls"
                      />
                      <label
                        htmlFor="reference-files"
                        className="cursor-pointer flex flex-col items-center justify-center space-y-2"
                      >
                        <Upload className="w-8 h-8 text-gray-400" />
                        <span className="text-sm text-gray-600">Click to upload reference files</span>
                        <span className="text-xs text-gray-500">PDF, Word, Excel, Images up to 5MB each</span>
                      </label>
                    </div>
                    
                    {formData.referenceFiles.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {formData.referenceFiles.map((file) => (
                          <div key={file.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                            <span className="text-sm text-gray-700">{file.name}</span>
                            <button
                              type="button"
                              onClick={() => removeReferenceFile(file.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Document Requirements Section */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Document Requirements
                      </label>
                      <button
                        type="button"
                        onClick={addDocumentRequirement}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        + Add Requirement
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {formData.documentRequirements.map((req) => (
                        <div key={req.id} className="border border-gray-200 rounded-lg p-3">
                          <div className="grid grid-cols-2 gap-3 mb-2">
                            <input
                              type="text"
                              placeholder="Requirement name"
                              value={req.name}
                              onChange={(e) => updateDocumentRequirement(req.id, { name: e.target.value })}
                              className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <select
                              value={req.type}
                              onChange={(e) => updateDocumentRequirement(req.id, { type: e.target.value as 'mandatory' | 'optional' })}
                              className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="mandatory">Mandatory</option>
                              <option value="optional">Optional</option>
                            </select>
                          </div>
                          <input
                            type="text"
                            placeholder="Description (optional)"
                            value={req.description}
                            onChange={(e) => updateDocumentRequirement(req.id, { description: e.target.value })}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 mb-2"
                          />
                          <div className="flex items-center justify-between">
                            <input
                              type="file"
                              onChange={(e) => handleDocumentRequirementUpload(req.id, e)}
                              className="text-sm"
                              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.xlsx,.xls"
                            />
                            <button
                              type="button"
                              onClick={() => removeDocumentRequirement(req.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          {req.userUploadedFile && (
                            <div className="mt-2 text-xs text-green-600 bg-green-50 p-2 rounded">
                              ✓ {req.userUploadedFile.name} ({(req.userUploadedFile.size / 1024).toFixed(1)} KB)
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    {editingStep ? 'Update Step' : 'Add Step'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Step View Modal */}
      {viewingStep && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setViewingStep(null)}></div>
            
            <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900">
                  Step {viewingStep.stepNumber}: {viewingStep.title}
                </h3>
                <button
                  onClick={() => setViewingStep(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 max-h-[70vh] overflow-y-auto">
                <div className="space-y-4">
                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(viewingStep.status)}`}>
                      {getStatusIcon(viewingStep.status)}
                      <span className="ml-1">{viewingStep.status}</span>
                    </div>
                  </div>

                  {/* Description */}
                  {viewingStep.description && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
                        {viewingStep.description}
                      </div>
                    </div>
                  )}

                  {/* Assigned To */}
                  {viewingStep.assignedTo && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {users.find(u => u.id === viewingStep.assignedTo)?.name || 'Unknown User'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                      <div className="text-sm text-gray-600">
                        {new Intl.DateTimeFormat('en-US', {
                          dateStyle: 'medium',
                          timeStyle: 'short'
                        }).format(new Date(viewingStep.createdAt))}
                      </div>
                    </div>
                    {viewingStep.completedAt && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Completed</label>
                        <div className="text-sm text-gray-600">
                          {new Intl.DateTimeFormat('en-US', {
                            dateStyle: 'medium',
                            timeStyle: 'short'
                          }).format(new Date(viewingStep.completedAt))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Reference Files */}
                  {viewingStep.referenceFiles && viewingStep.referenceFiles.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Reference Files</label>
                      <div className="space-y-2">
                        {viewingStep.referenceFiles.map((file) => (
                          <div key={file.id} className="flex items-center justify-between bg-green-50 p-2 rounded border border-green-200">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                              <p className="text-xs text-gray-500">
                                {(file.size / 1024).toFixed(1)} KB • {file.type}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2 ml-2">
                              <button
                                onClick={() => handleViewFile(file)}
                                className="p-1 text-green-600 hover:text-green-800 hover:bg-green-100 rounded transition-colors duration-200"
                                title="View file"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDownloadFile(file)}
                                className="p-1 text-green-600 hover:text-green-800 hover:bg-green-100 rounded transition-colors duration-200"
                                title="Download file"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Document Requirements */}
                  {viewingStep.documentRequirements && viewingStep.documentRequirements.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Document Requirements</label>
                      <div className="space-y-2">
                        {viewingStep.documentRequirements.map((req) => (
                          <div key={req.id} className="bg-blue-50 p-3 rounded border border-blue-200">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-gray-900">{req.name}</span>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                req.type === 'mandatory' 
                                  ? 'bg-red-100 text-red-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {req.type}
                              </span>
                            </div>
                            {req.description && (
                              <p className="text-xs text-gray-600 mb-2">{req.description}</p>
                            )}
                            {req.userUploadedFile ? (
                              <div className="flex items-center justify-between bg-green-50 p-2 rounded border border-green-200">
                                <div className="flex items-center space-x-2">
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                  <div>
                                    <p className="text-sm font-medium text-green-800">{req.userUploadedFile.name}</p>
                                    <p className="text-xs text-green-600">
                                      {(req.userUploadedFile.size / 1024).toFixed(1)} KB • {req.userUploadedFile.type}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => handleViewFile(req.userUploadedFile!)}
                                    className="p-1 text-green-600 hover:text-green-800 hover:bg-green-100 rounded transition-colors duration-200"
                                    title="View file"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDownloadFile(req.userUploadedFile!)}
                                    className="p-1 text-green-600 hover:text-green-800 hover:bg-green-100 rounded transition-colors duration-200"
                                    title="Download file"
                                  >
                                    <Download className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                                No file uploaded
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end p-6 border-t border-gray-200">
                <button
                  onClick={() => setViewingStep(null)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step Status Change Modal */}
      {changingStatusStep && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setChangingStatusStep(null)}></div>
            
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900">
                  Change Step Status
                </h3>
                <button
                  onClick={() => setChangingStatusStep(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleStepStatusSubmit} className="p-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-4 bg-gray-50 p-3 rounded-lg">
                      Step: <span className="font-bold text-blue-600">{changingStatusStep.stepNumber} - {changingStatusStep.title}</span>
                      <br />
                      Current Status: <span className="font-bold text-orange-600">{changingStatusStep.status}</span>
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Status
                    </label>
                    <select
                      value={newStepStatus}
                      onChange={(e) => setNewStepStatus(e.target.value as StepStatus)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
                      required
                    >
                      <option value="PENDING">Pending</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Remarks *
                    </label>
                    <textarea
                      value={stepStatusRemarks}
                      onChange={(e) => setStepStatusRemarks(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
                      placeholder="Please provide remarks for this status change (minimum 5 characters)..."
                      required
                      minLength={5}
                    />
                    <p className={`text-xs mt-1 ${stepStatusRemarks.length >= 5 ? 'text-green-600' : 'text-red-500'}`}>
                      {stepStatusRemarks.length}/5 characters minimum
                    </p>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setChangingStatusStep(null)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={stepStatusRemarks.trim().length < 5}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    Update Status
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StepManagement;