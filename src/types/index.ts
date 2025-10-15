export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: 'EMPLOYEE' | 'DO' | 'EO';
  department: string;
  lastLogin?: Date;
}

export interface Module {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  schema_id: string;
  config: {
    categories: string[];
  };
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Ticket {
  id: string;
  ticketNumber: string;
  moduleId: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  category: string;
  assignedTo?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  department: string;
  steps: TicketStep[];
  attachments: FileAttachment[];
  auditTrail: AuditEntry[];
  isExpanded?: boolean;
}

export type TicketStatus = 'DRAFT' | 'CREATED' | 'APPROVED' | 'ACTIVE' | 'IN_PROGRESS' | 'RESOLVED' | 'COMPLETED' | 'CLOSED' | 'CANCELLED';

export type StepStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CLOSED';

export interface TicketStep {
  id: string;
  ticketId: string;
  stepNumber: string;
  title: string;
  description: string;
  status: StepStatus;
  assignedTo?: string;
  createdBy: string;
  createdAt: Date;
  completedAt?: Date;
  dueDate?: Date;
  managerDueDate?: Date;
  is_parallel?: boolean;
  dependencies?: string[];
  mandatory_documents?: string[];
  optional_documents?: string[];
  certificateUploaded?: boolean;
  comments: StepComment[];
  attachments: FileAttachment[];
  referenceFiles?: ReferenceFile[];
  documentRequirements?: DocumentRequirement[];
}

export interface ReferenceFile {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: Date;
  uploadedBy: string;
  fileData?: File;
}

export interface DocumentRequirement {
  id: string;
  name: string;
  description: string;
  type: 'mandatory' | 'optional';
  userUploadedFile?: {
    id: string;
    name: string;
    url: string;
    size: number;
    type: string;
    uploadedAt: Date;
    fileData?: File;
  };
}

export interface StepComment {
  id: string;
  stepId: string;
  content: string;
  createdBy: string;
  createdAt: Date;
}

export interface FileAttachment {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedBy: string;
  uploadedAt: Date;
  url: string;
}

export interface AuditEntry {
  id: string;
  ticketId: string;
  userId: string;
  action: string;
  oldValue?: string;
  newValue?: string;
  remarks?: string;
  timestamp: Date;
}

export interface StatusTransitionRequest {
  ticketId: string;
  newStatus: TicketStatus;
  remarks: string;
}