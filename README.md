# Ticket Tracker Application

A comprehensive, production-ready ticket tracking system built with React, TypeScript, and Supabase. This application provides role-based access control, complete ticket lifecycle management, and real-time data persistence.

## Features

### Core Functionality
- **User Authentication**: Secure login with role-based access control
- **Ticket Management**: Complete CRUD operations with status transitions
- **Step Management**: Add, edit, and track ticket steps with status updates
- **File Attachments**: Upload and manage files for tickets and steps
- **Audit Trail**: Complete history of all ticket changes and status transitions
- **Real-time Search**: Advanced filtering and search capabilities
- **Responsive Design**: Mobile-friendly interface using Tailwind CSS

### Role-Based Access Control
- **Employee**: Can view and manage their own tickets
- **Department Officer (DO)**: Can manage all tickets within their department
- **Executive Officer (EO)**: Full access to all tickets across departments

### Status Management
- **Ticket Lifecycle**: DRAFT → CREATED → ACTIVE → [COMPLETED | CANCELLED]
- **Status Validation**: Enforced business rules for status transitions
- **Audit Logging**: All status changes are logged with user and timestamp

## Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Lucide React Icons
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with custom user management
- **State Management**: React Context API
- **Build Tool**: Vite with TypeScript support

## Prerequisites

- Node.js 16+ and npm
- Supabase account and project

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd ticket-tracker
npm install
```

### 2. Database Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor in your Supabase dashboard
3. Run the schema creation script:
   ```sql
   -- Copy and paste the contents of supabase/migrations/create_ticket_tracker_schema.sql
   ```
4. Run the sample data script:
   ```sql
   -- Copy and paste the contents of supabase/migrations/insert_sample_data.sql
   ```

### 3. Environment Configuration

1. Copy the `.env` file and update with your Supabase credentials:
   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your Supabase project details:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

   You can find these values in your Supabase project settings under "API".

### 4. Run the Application

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Sample User Accounts

The application comes with pre-configured sample users for testing:

| Role | Username | Password | Department |
|------|----------|----------|------------|
| Executive Officer | admin | admin | ADMINISTRATION |
| Department Officer | manager | manager | IT |
| Employee | user | user | IT |
| Employee | jane.doe | password | HR |
| Department Officer | hr.manager | hrpass | HR |
| Employee | finance.user | finance | FINANCE |
| Department Officer | finance.manager | financepass | FINANCE |

## Database Schema

### Core Tables

- **users**: User accounts with roles and departments
- **tickets**: Main ticket information with status and metadata
- **ticket_steps**: Individual steps within tickets
- **step_comments**: Comments on ticket steps
- **file_attachments**: File uploads for tickets and steps
- **audit_entries**: Complete audit trail of all changes

### Security Features

- **Row Level Security (RLS)**: Enabled on all tables
- **Role-based Policies**: Users can only access data based on their role
- **Data Integrity**: Foreign key constraints and validation rules
- **Audit Logging**: Automatic tracking of all data changes

## Application Structure

```
src/
├── components/           # React components
│   ├── auth/            # Authentication components
│   ├── dashboard/       # Dashboard and ticket grid
│   ├── ticket/          # Ticket management components
│   ├── layout/          # Layout components
│   └── common/          # Shared components
├── context/             # React Context providers
├── services/            # API service layers
├── lib/                 # Utility libraries
├── types/               # TypeScript type definitions
└── data/                # Mock data (for fallback)
```

## Key Features Explained

### Ticket Status Transitions

The application enforces proper ticket lifecycle management:

- **DRAFT**: Initial state, can move to CREATED
- **CREATED**: Submitted for review, can move to ACTIVE or CANCELLED
- **ACTIVE**: Work in progress, can move to COMPLETED or CANCELLED
- **COMPLETED**: Finished work, can be reopened to ACTIVE
- **CANCELLED**: Cancelled tickets, can be reinstated to CREATED

### Role-Based Access Control

Access is controlled at the database level using Supabase RLS policies:

- **Employees**: Can only see and modify their own tickets
- **Department Officers**: Can manage all tickets in their department
- **Executive Officers**: Have full access to all tickets

### Step Management

Each ticket can have multiple steps with:
- Sequential numbering
- Individual status tracking
- File attachments
- Comments and notes
- Assignment to specific users

### Audit Trail

Every action is logged including:
- Ticket creation and updates
- Status changes with remarks
- User information and timestamps
- Old and new values for changes

## Deployment

### Production Build

```bash
npm run build
```

### Environment Variables for Production

Ensure your production environment has the correct Supabase credentials:

```env
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_supabase_anon_key
```

### Deployment Platforms

The application can be deployed to any static hosting service:
- Vercel
- Netlify
- AWS S3 + CloudFront
- GitHub Pages

## Security Considerations

- All database queries use parameterized statements
- Row Level Security prevents unauthorized data access
- Input validation on both client and server side
- File upload restrictions and validation
- Session-based authentication with proper timeout

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify Supabase URL and API key
   - Check if RLS policies are properly configured
   - Ensure database schema is created correctly

2. **Authentication Issues**
   - Verify user credentials match the sample data
   - Check browser console for authentication errors
   - Ensure Supabase project is active

3. **Permission Errors**
   - Verify RLS policies are enabled
   - Check user roles in the database
   - Ensure proper department assignments

### Development Tips

- Use browser developer tools to inspect network requests
- Check Supabase logs for database errors
- Enable verbose logging in development mode
- Test with different user roles to verify access control

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.