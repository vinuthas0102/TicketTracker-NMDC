import React, { useState } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw, Maximize2, Download, FileText, AlertCircle, RefreshCw } from 'lucide-react';

interface DocumentViewerProps {
  file: {
    id: string;
    name: string;
    url: string;
    type: string;
  };
  onClose: () => void;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ file, onClose }) => {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 300));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 25));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
    console.error('Failed to load image:', file.url, file);
  };

  const retryImageLoad = () => {
    setImageError(false);
    setImageLoading(true);
    // Force reload by adding timestamp
    const img = document.querySelector(`img[src*="${file.name}"]`) as HTMLImageElement;
    if (img) {
      const originalSrc = img.src;
      img.src = '';
      setTimeout(() => {
        img.src = originalSrc + (originalSrc.includes('?') ? '&' : '?') + 't=' + Date.now();
      }, 100);
    }
  };

  const isImage = file.type.startsWith('image/');
  const isPDF = file.type === 'application/pdf';

  const renderContent = () => {
    if (isImage) {
      if (imageError) {
        return (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-4">
            <AlertCircle className="w-16 h-16 text-red-400" />
            <div className="text-center">
              <p className="text-lg font-medium mb-2">Failed to load image</p>
              <p className="text-sm text-gray-400 mb-4">File: {file.name}</p>
              <p className="text-xs text-gray-400 mb-4">URL: {file.url}</p>
              <button
                onClick={retryImageLoad}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry</span>
              </button>
              <div>
                <h3 className="text-sm font-medium text-gray-900 truncate">{file.name}</h3>
                <p className="text-xs text-gray-500">Type: {file.type} | Size: {(file.url.length / 1024).toFixed(1)}KB</p>
              </div>
            </div>
          </div>
        );
      }

      if (imageLoading) {
        return (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-sm">Loading image...</p>
          </div>
        );
      }

      return (
        <div className="flex items-center justify-center h-full">
          <img
            src={file.url}
            alt={file.name}
            className="max-w-full max-h-full object-contain"
            style={{
              transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
              transition: 'transform 0.3s ease'
            }}
            onLoad={handleImageLoad}
            onError={handleImageError}
            crossOrigin="anonymous"
          />
        </div>
      );
    }

    if (isPDF) {
      return (
        <iframe
          src={file.url}
          className="w-full h-full border-0"
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top left'
          }}
          title={file.name}
        />
      );
    }

    // Fallback for other file types
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <FileText className="w-16 h-16 mb-4" />
        <p className="text-lg font-medium mb-2">{file.name}</p>
        <p className="text-sm mb-4">Preview not available for this file type</p>
        <p className="text-xs text-gray-400 mb-4">Type: {file.type}</p>
        <button
          onClick={handleDownload}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          Download File
        </button>
      </div>
    );
  };

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-white' : 'h-full'} flex flex-col`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 truncate">{file.name}</h3>
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          {/* Zoom Controls */}
          <button
            onClick={handleZoomOut}
            className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          
          <span className="text-xs text-gray-600 min-w-12 text-center">{zoom}%</span>
          
          <button
            onClick={handleZoomIn}
            className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          {/* Rotate (only for images) */}
          {isImage && (
            <button
              onClick={handleRotate}
              className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded"
              title="Rotate"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          )}

          {/* Fullscreen */}
          <button
            onClick={handleFullscreen}
            className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded"
            title="Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          {/* Download */}
          <button
            onClick={handleDownload}
            className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded"
            title="Download"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-gray-100 flex items-center justify-center p-4">
        {renderContent()}
      </div>
    </div>
  );
};

export default DocumentViewer;