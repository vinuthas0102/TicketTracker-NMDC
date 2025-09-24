import React, { createContext, useContext, useState, ReactNode } from 'react';

interface FileData {
  id: string;
  file: File;
  url: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
}

interface FileContextType {
  files: Map<string, FileData>;
  storeFile: (id: string, file: File) => string;
  getFile: (id: string) => FileData | undefined;
  getFileUrl: (id: string) => string | undefined;
  removeFile: (id: string) => void;
  cleanup: () => void;
}

const FileContext = createContext<FileContextType | undefined>(undefined);

export const useFiles = () => {
  const context = useContext(FileContext);
  if (context === undefined) {
    throw new Error('useFiles must be used within a FileProvider');
  }
  return context;
};

interface FileProviderProps {
  children: ReactNode;
}

export const FileProvider: React.FC<FileProviderProps> = ({ children }) => {
  const [files, setFiles] = useState<Map<string, FileData>>(new Map());

  const storeFile = (id: string, file: File): string => {
    // Check if file is already stored
    const existingFile = files.get(id);
    if (existingFile) {
      return existingFile.url;
    }

    // Create blob URL for the file
    const url = URL.createObjectURL(file);
    
    const fileData: FileData = {
      id,
      file,
      url,
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date()
    };

    setFiles(prev => new Map(prev).set(id, fileData));
    return url;
  };

  const getFile = (id: string): FileData | undefined => {
    return files.get(id);
  };

  const getFileUrl = (id: string): string | undefined => {
    return files.get(id)?.url;
  };

  const removeFile = (id: string): void => {
    const fileData = files.get(id);
    if (fileData) {
      URL.revokeObjectURL(fileData.url);
      setFiles(prev => {
        const newMap = new Map(prev);
        newMap.delete(id);
        return newMap;
      });
    }
  };

  const cleanup = (): void => {
    files.forEach(fileData => {
      URL.revokeObjectURL(fileData.url);
    });
    setFiles(new Map());
  };

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  const value: FileContextType = {
    files,
    storeFile,
    getFile,
    getFileUrl,
    removeFile,
    cleanup
  };

  return (
    <FileContext.Provider value={value}>
      {children}
    </FileContext.Provider>
  );
};