import { User, Ticket, TicketStep, AuditEntry } from '../types';

export const mockUsers: User[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    username: 'admin',
    name: 'Administrator',
    email: 'admin@company.com',
    role: 'EO' as const,
    department: 'ADMINISTRATION',
    lastLogin: new Date('2024-12-28T10:30:00Z')
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    username: 'manager',
    name: 'Department Manager',
    email: 'manager@company.com',
    role: 'DO' as const,
    department: 'IT',
    lastLogin: new Date('2024-12-28T09:15:00Z')
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    username: 'user',
    name: 'John Employee',
    email: 'john@company.com',
    role: 'EMPLOYEE' as const,
    department: 'IT',
    lastLogin: new Date('2024-12-28T08:45:00Z')
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    username: 'jane.doe',
    name: 'Jane Doe',
    email: 'jane@company.com',
    role: 'EMPLOYEE' as const,
    department: 'HR',
    lastLogin: new Date('2024-12-28T09:00:00Z')
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440005',
    username: 'hr.manager',
    name: 'HR Manager',
    email: 'hrmanager@company.com',
    role: 'DO' as const,
    department: 'HR',
    lastLogin: new Date('2024-12-28T08:30:00Z')
  }
];

export const mockTickets: Ticket[] = [
  {
    id: '20000000-0000-4000-8000-000000000001',
    ticketNumber: 'MTKT-001',
    moduleId: '550e8400-e29b-41d4-a716-446655440101', // Maintenance Module
    title: 'System Login Issues',
    description: 'Multiple users unable to login to the main system. Error message appears after entering credentials.',
    status: 'ACTIVE',
    priority: 'HIGH',
    category: 'Equipment Repair',
    assignedTo: '550e8400-e29b-41d4-a716-446655440001',
    createdBy: '550e8400-e29b-41d4-a716-446655440002',
    createdAt: new Date('2024-12-27T10:00:00Z'),
    updatedAt: new Date('2024-12-28T09:30:00Z'),
    dueDate: new Date('2024-12-30T17:00:00Z'),
    department: 'IT',
    steps: [
      {
        id: '30000000-0000-4000-8000-000000000001',
        ticketId: '20000000-0000-4000-8000-000000000001',
        stepNumber: '1',
        title: 'Initial Investigation',
        description: 'Check server logs and database connectivity',
        status: 'COMPLETED',
        assignedTo: '550e8400-e29b-41d4-a716-446655440001',
        createdBy: '550e8400-e29b-41d4-a716-446655440001',
        createdAt: new Date('2024-12-27T11:00:00Z'),
        completedAt: new Date('2024-12-27T14:00:00Z'),
        referenceFiles: [],
        documentRequirements: [],
        comments: [],
        attachments: []
      },
      {
        id: '30000000-0000-4000-8000-000000000002',
        ticketId: '20000000-0000-4000-8000-000000000001',
        stepNumber: '2',
        title: 'Apply Security Patch',
        description: 'Deploy latest security updates to authentication service',
        status: 'IN_PROGRESS',
        assignedTo: '550e8400-e29b-41d4-a716-446655440001',
        createdBy: '550e8400-e29b-41d4-a716-446655440001',
        createdAt: new Date('2024-12-28T08:00:00Z'),
        referenceFiles: [],
        documentRequirements: [],
        comments: [],
        attachments: []
      }
    ],
    attachments: [],
    auditTrail: [
      {
        id: '40000000-0000-4000-8000-000000000001',
        ticketId: '20000000-0000-4000-8000-000000000001',
        userId: '550e8400-e29b-41d4-a716-446655440002',
        action: 'CREATED',
        newValue: 'DRAFT',
        timestamp: new Date('2024-12-27T10:00:00Z')
      },
      {
        id: '40000000-0000-4000-8000-000000000002',
        ticketId: '20000000-0000-4000-8000-000000000001',
        userId: '550e8400-e29b-41d4-a716-446655440002',
        action: 'STATUS_CHANGE',
        oldValue: 'DRAFT',
        newValue: 'CREATED',
        remarks: 'Issue confirmed and submitted for review',
        timestamp: new Date('2024-12-27T10:15:00Z')
      },
      {
        id: '40000000-0000-4000-8000-000000000003',
        ticketId: '20000000-0000-4000-8000-000000000001',
        userId: '550e8400-e29b-41d4-a716-446655440001',
        action: 'STATUS_CHANGE',
        oldValue: 'CREATED',
        newValue: 'ACTIVE',
        remarks: 'Assigned to IT team for resolution',
        timestamp: new Date('2024-12-27T11:00:00Z')
      }
    ]
  },
  {
    id: '20000000-0000-4000-8000-000000000002',
    ticketNumber: 'MTKT-002',
    moduleId: '550e8400-e29b-41d4-a716-446655440102', // Maintenance Tracker
    title: 'New Employee Onboarding Process',
    description: 'Setup access rights and accounts for new hire starting next week.',
    status: 'CREATED',
    priority: 'MEDIUM',
    category: 'General Maintenance',
    assignedTo: '550e8400-e29b-41d4-a716-446655440004',
    createdBy: '550e8400-e29b-41d4-a716-446655440003',
    createdAt: new Date('2024-12-28T08:30:00Z'),
    updatedAt: new Date('2024-12-28T08:30:00Z'),
    dueDate: new Date('2025-01-02T17:00:00Z'),
    department: 'HR',
    steps: [],
    attachments: [],
    auditTrail: [
      {
        id: '40000000-0000-4000-8000-000000000004',
        ticketId: '20000000-0000-4000-8000-000000000002',
        userId: '550e8400-e29b-41d4-a716-446655440003',
        action: 'CREATED',
        newValue: 'DRAFT',
        timestamp: new Date('2024-12-28T08:30:00Z')
      },
      {
        id: '40000000-0000-4000-8000-000000000005',
        ticketId: '20000000-0000-4000-8000-000000000002',
        userId: '550e8400-e29b-41d4-a716-446655440003',
        action: 'STATUS_CHANGE',
        oldValue: 'DRAFT',
        newValue: 'CREATED',
        remarks: 'All required information provided',
        timestamp: new Date('2024-12-28T08:35:00Z')
      }
    ]
  },
  {
    id: '20000000-0000-4000-8000-000000000003',
    ticketNumber: 'CTKT-001',
    moduleId: '550e8400-e29b-41d4-a716-446655440103', // Complaints Tracker
    title: 'Printer Maintenance Request',
    description: 'Office printer needs routine maintenance and toner replacement.',
    status: 'COMPLETED',
    priority: 'LOW',
    category: 'Service Quality',
    assignedTo: '550e8400-e29b-41d4-a716-446655440001',
    createdBy: '550e8400-e29b-41d4-a716-446655440002',
    createdAt: new Date('2024-12-26T14:00:00Z'),
    updatedAt: new Date('2024-12-27T16:00:00Z'),
    department: 'IT',
    steps: [
      {
        id: '30000000-0000-4000-8000-000000000003',
        ticketId: '20000000-0000-4000-8000-000000000003',
        stepNumber: '1',
        title: 'Schedule Maintenance',
        description: 'Contact vendor and schedule maintenance appointment',
        status: 'COMPLETED',
        assignedTo: '550e8400-e29b-41d4-a716-446655440001',
        createdBy: '550e8400-e29b-41d4-a716-446655440001',
        createdAt: new Date('2024-12-26T15:00:00Z'),
        completedAt: new Date('2024-12-26T16:00:00Z'),
        referenceFiles: [],
        documentRequirements: [],
        comments: [],
        attachments: []
      },
      {
        id: '30000000-0000-4000-8000-000000000004',
        ticketId: '20000000-0000-4000-8000-000000000003',
        stepNumber: '2',
        title: 'Perform Maintenance',
        description: 'Complete routine maintenance and replace consumables',
        status: 'COMPLETED',
        assignedTo: '550e8400-e29b-41d4-a716-446655440001',
        createdBy: '550e8400-e29b-41d4-a716-446655440001',
        createdAt: new Date('2024-12-27T14:00:00Z'),
        completedAt: new Date('2024-12-27T16:00:00Z'),
        referenceFiles: [],
        documentRequirements: [],
        comments: [],
        attachments: []
      }
    ],
    attachments: [],
    auditTrail: [
      {
        id: '40000000-0000-4000-8000-000000000006',
        ticketId: '20000000-0000-4000-8000-000000000003',
        userId: '550e8400-e29b-41d4-a716-446655440002',
        action: 'CREATED',
        newValue: 'DRAFT',
        timestamp: new Date('2024-12-26T14:00:00Z')
      },
      {
        id: '40000000-0000-4000-8000-000000000007',
        ticketId: '20000000-0000-4000-8000-000000000003',
        userId: '550e8400-e29b-41d4-a716-446655440002',
        action: 'STATUS_CHANGE',
        oldValue: 'DRAFT',
        newValue: 'CREATED',
        remarks: 'Maintenance request submitted',
        timestamp: new Date('2024-12-26T14:05:00Z')
      },
      {
        id: '40000000-0000-4000-8000-000000000008',
        ticketId: '20000000-0000-4000-8000-000000000003',
        userId: '550e8400-e29b-41d4-a716-446655440001',
        action: 'STATUS_CHANGE',
        oldValue: 'CREATED',
        newValue: 'ACTIVE',
        remarks: 'Maintenance scheduled',
        timestamp: new Date('2024-12-26T15:00:00Z')
      },
      {
        id: '40000000-0000-4000-8000-000000000009',
        ticketId: '20000000-0000-4000-8000-000000000003',
        userId: '550e8400-e29b-41d4-a716-446655440001',
        action: 'STATUS_CHANGE',
        oldValue: 'ACTIVE',
        newValue: 'COMPLETED',
        remarks: 'Maintenance completed successfully',
        timestamp: new Date('2024-12-27T16:00:00Z')
      }
    ]
  },
  {
    id: '20000000-0000-4000-8000-000000000004',
    ticketNumber: 'GTKT-001',
    moduleId: '550e8400-e29b-41d4-a716-446655440104', // Grievances Module
    title: 'Software License Renewal',
    description: 'Annual software license expires next month. Need to renew licenses for development tools.',
    status: 'DRAFT',
    priority: 'MEDIUM',
    category: 'Workplace Issues',
    createdBy: '550e8400-e29b-41d4-a716-446655440002',
    createdAt: new Date('2024-12-28T11:00:00Z'),
    updatedAt: new Date('2024-12-28T11:00:00Z'),
    dueDate: new Date('2025-01-15T17:00:00Z'),
    department: 'IT',
    steps: [],
    attachments: [],
    auditTrail: [
      {
        id: '40000000-0000-4000-8000-000000000010',
        ticketId: '20000000-0000-4000-8000-000000000004',
        userId: '550e8400-e29b-41d4-a716-446655440002',
        action: 'CREATED',
        newValue: 'DRAFT',
        timestamp: new Date('2024-12-28T11:00:00Z')
      }
    ]
  },
  {
    id: '20000000-0000-4000-8000-000000000005',
    ticketNumber: 'RTKT-001',
    moduleId: '550e8400-e29b-41d4-a716-446655440105', // RTI Tracker
    title: 'Network Connectivity Issues',
    description: 'Intermittent network outages affecting productivity in the east wing.',
    status: 'CANCELLED',
    priority: 'HIGH',
    category: 'Information Request',
    assignedTo: '550e8400-e29b-41d4-a716-446655440001',
    createdBy: '550e8400-e29b-41d4-a716-446655440002',
    createdAt: new Date('2024-12-25T09:00:00Z'),
    updatedAt: new Date('2024-12-26T10:00:00Z'),
    department: 'IT',
    steps: [],
    attachments: [],
    auditTrail: [
      {
        id: '40000000-0000-4000-8000-000000000011',
        ticketId: '20000000-0000-4000-8000-000000000005',
        userId: '550e8400-e29b-41d4-a716-446655440002',
        action: 'CREATED',
        newValue: 'DRAFT',
        timestamp: new Date('2024-12-25T09:00:00Z')
      },
      {
        id: '40000000-0000-4000-8000-000000000012',
        ticketId: '20000000-0000-4000-8000-000000000005',
        userId: '550e8400-e29b-41d4-a716-446655440002',
        action: 'STATUS_CHANGE',
        oldValue: 'DRAFT',
        newValue: 'CREATED',
        remarks: 'Network issues confirmed',
        timestamp: new Date('2024-12-25T09:15:00Z')
      },
      {
        id: '40000000-0000-4000-8000-000000000013',
        ticketId: '20000000-0000-4000-8000-000000000005',
        userId: '550e8400-e29b-41d4-a716-446655440001',
        action: 'STATUS_CHANGE',
        oldValue: 'CREATED',
        newValue: 'ACTIVE',
        remarks: 'Investigating network infrastructure',
        timestamp: new Date('2024-12-25T10:00:00Z')
      },
      {
        id: '40000000-0000-4000-8000-000000000014',
        ticketId: '20000000-0000-4000-8000-000000000005',
        userId: '550e8400-e29b-41d4-a716-446655440001',
        action: 'STATUS_CHANGE',
        oldValue: 'ACTIVE',
        newValue: 'CANCELLED',
        remarks: 'Issue resolved by external vendor - duplicate of infrastructure maintenance',
        timestamp: new Date('2024-12-26T10:00:00Z')
      }
    ]
  },
  // Additional tickets to demonstrate auto-increment
  {
    id: '20000000-0000-4000-8000-000000000006',
    ticketNumber: 'MTKT-003',
    moduleId: '550e8400-e29b-41d4-a716-446655440102', // Maintenance Tracker
    title: 'Air Conditioning Unit Repair',
    description: 'AC unit in conference room not cooling properly. Temperature control seems faulty.',
    status: 'CREATED',
    priority: 'MEDIUM',
    category: 'HVAC',
    assignedTo: '550e8400-e29b-41d4-a716-446655440002',
    createdBy: '550e8400-e29b-41d4-a716-446655440003',
    createdAt: new Date('2024-12-28T14:00:00Z'),
    updatedAt: new Date('2024-12-28T14:00:00Z'),
    dueDate: new Date('2024-12-31T17:00:00Z'),
    department: 'IT',
    steps: [],
    attachments: [],
    auditTrail: [
      {
        id: '40000000-0000-4000-8000-000000000015',
        ticketId: '20000000-0000-4000-8000-000000000006',
        userId: '550e8400-e29b-41d4-a716-446655440003',
        action: 'CREATED',
        newValue: 'DRAFT',
        timestamp: new Date('2024-12-28T14:00:00Z')
      },
      {
        id: '40000000-0000-4000-8000-000000000016',
        ticketId: '20000000-0000-4000-8000-000000000006',
        userId: '550e8400-e29b-41d4-a716-446655440003',
        action: 'STATUS_CHANGE',
        oldValue: 'DRAFT',
        newValue: 'CREATED',
        remarks: 'AC repair request submitted',
        timestamp: new Date('2024-12-28T14:05:00Z')
      }
    ]
  },
  {
    id: '20000000-0000-4000-8000-000000000007',
    ticketNumber: 'CTKT-002',
    moduleId: '550e8400-e29b-41d4-a716-446655440103', // Complaints Tracker
    title: 'Workplace Harassment Complaint',
    description: 'Employee reporting inappropriate behavior from supervisor. Requires immediate investigation.',
    status: 'ACTIVE',
    priority: 'HIGH',
    category: 'Staff Behavior',
    assignedTo: '550e8400-e29b-41d4-a716-446655440005',
    createdBy: '550e8400-e29b-41d4-a716-446655440004',
    createdAt: new Date('2024-12-28T15:30:00Z'),
    updatedAt: new Date('2024-12-28T16:00:00Z'),
    dueDate: new Date('2025-01-03T17:00:00Z'),
    department: 'HR',
    steps: [],
    attachments: [],
    auditTrail: [
      {
        id: '40000000-0000-4000-8000-000000000017',
        ticketId: '20000000-0000-4000-8000-000000000007',
        userId: '550e8400-e29b-41d4-a716-446655440004',
        action: 'CREATED',
        newValue: 'DRAFT',
        timestamp: new Date('2024-12-28T15:30:00Z')
      },
      {
        id: '40000000-0000-4000-8000-000000000018',
        ticketId: '20000000-0000-4000-8000-000000000007',
        userId: '550e8400-e29b-41d4-a716-446655440004',
        action: 'STATUS_CHANGE',
        oldValue: 'DRAFT',
        newValue: 'CREATED',
        remarks: 'Harassment complaint filed',
        timestamp: new Date('2024-12-28T15:35:00Z')
      },
      {
        id: '40000000-0000-4000-8000-000000000019',
        ticketId: '20000000-0000-4000-8000-000000000007',
        userId: '550e8400-e29b-41d4-a716-446655440005',
        action: 'STATUS_CHANGE',
        oldValue: 'CREATED',
        newValue: 'ACTIVE',
        remarks: 'Investigation started by HR team',
        timestamp: new Date('2024-12-28T16:00:00Z')
      }
    ]
  },
  {
    id: '20000000-0000-4000-8000-000000000008',
    ticketNumber: 'GTKT-002',
    moduleId: '550e8400-e29b-41d4-a716-446655440104', // Grievances Module
    title: 'Poor Service Quality at Reception',
    description: 'Multiple customers complained about long wait times and unprofessional behavior at reception desk.',
    status: 'CREATED',
    priority: 'MEDIUM',
    category: 'Workplace Issues',
    assignedTo: '550e8400-e29b-41d4-a716-446655440002',
    createdBy: '550e8400-e29b-41d4-a716-446655440001',
    createdAt: new Date('2024-12-28T16:30:00Z'),
    updatedAt: new Date('2024-12-28T16:30:00Z'),
    dueDate: new Date('2025-01-05T17:00:00Z'),
    department: 'ADMINISTRATION',
    steps: [],
    attachments: [],
    auditTrail: [
      {
        id: '40000000-0000-4000-8000-000000000020',
        ticketId: '20000000-0000-4000-8000-000000000008',
        userId: '550e8400-e29b-41d4-a716-446655440001',
        action: 'CREATED',
        newValue: 'DRAFT',
        timestamp: new Date('2024-12-28T16:30:00Z')
      },
      {
        id: '40000000-0000-4000-8000-000000000021',
        ticketId: '20000000-0000-4000-8000-000000000008',
        userId: '550e8400-e29b-41d4-a716-446655440001',
        action: 'STATUS_CHANGE',
        oldValue: 'DRAFT',
        newValue: 'CREATED',
        remarks: 'Service quality complaint registered',
        timestamp: new Date('2024-12-28T16:35:00Z')
      }
    ]
  }
];