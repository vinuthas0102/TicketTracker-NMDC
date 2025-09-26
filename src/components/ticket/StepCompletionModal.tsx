import React, { useState } from 'react';
import { X, Upload, CheckCircle, AlertTriangle } from 'lucide-react';
import { TicketStep } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface StepCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  step: TicketStep;
  onComplete: (stepId: string, updates: any) => Promise<void>;
}

const StepCompletionModal: React.FC<StepCompletionModalProps> = ({
  isOpen,
  onClose,
  step,
  onComplete
}) => {
  const { user } = useAuth();
  const [remarks, setRemarks] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // Check if file upload is required for DO users
  const isFileUploadRequired = user?.role === 'DO';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (remarks.trim().length < 10) {
      alert('Please provide remarks (minimum 10 characters)');
      return;
    }

    // Check file upload requirement for DO users
    if (isFileUploadRequired && (!uploadedFiles || uploadedFiles.length === 0)) {
      alert('File upload is mandatory for department officers when completing steps. Please upload at least one document.');
      return;
    }

    setLoading(true);
    try {
      const updates = {
        status: 'COMPLETED',
        completedAt: new Date(),
        remarks: remarks.trim(),
        userRole: user?.role,
        attachments: uploadedFiles ? Array.from(uploadedFiles) : []
      };

      await onComplete(step.id, updates);
      
      // Reset form
      setRemarks('');
      setUploadedFiles(null);
      
      onClose();
    } catch (error) {
      console.error('Step completion error:', error);
      alert(error instanceof Error ? error.message : 'Failed to complete step');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadedFiles(e.target.files);
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-75 transition-opacity" onClick={onClose}></div>
        
        <div className="relative bg-white rounded-lg shadow-2xl max-w-md w-full border-2 border-blue-200">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Complete Step
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
                Step: <span className="font-bold text-blue-600">{step.title}</span>
              </p>
              <p className="text-sm text-gray-600 mb-4">
                Current Status: <span className="font-bold text-orange-600">{step.status}</span>
              </p>
            </div>

            {/* File Upload Section - Mandatory for DO users */}
            {isFileUploadRequired && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Documents *
                  <span className="text-red-600 text-xs ml-1">(Required for department officers)</span>
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 transition-colors duration-200">
                  <div className="space-y-1 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="step-file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                      >
                        <span>Upload files</span>
                        <input
                          id="step-file-upload"
                          name="step-file-upload"
                          type="file"
                          className="sr-only"
                          multiple
                          onChange={handleFileChange}
                          accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.xlsx,.xls"
                          required={isFileUploadRequired}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PDF, Word, Excel, Images up to 10MB each
                    </p>
                  </div>
                </div>
                
                {uploadedFiles && uploadedFiles.length > 0 && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm font-medium text-green-800 mb-2">Selected files:</p>
                    <ul className="text-sm text-green-700 space-y-1">
                      {Array.from(uploadedFiles).map((file, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {isFileUploadRequired && (!uploadedFiles || uploadedFiles.length === 0) && (
                  <p className="text-sm text-red-600 mt-2 flex items-center space-x-1">
                    <AlertTriangle className="w-4 h-4" />
                    <span>At least one document must be uploaded before completing this step.</span>
                  </p>
                )}
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Completion Remarks *
              </label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
                placeholder="Please provide remarks for completing this step (minimum 10 characters)..."
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
                disabled={
                  loading || 
                  remarks.trim().length < 10 ||
                  (isFileUploadRequired && (!uploadedFiles || uploadedFiles.length === 0))
                }
                className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {loading ? 'Completing...' : 'Complete Step'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StepCompletionModal;