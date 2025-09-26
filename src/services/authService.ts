import { supabase, handleSupabaseError, isSupabaseAvailable } from '../lib/supabase';
import { User, Module } from '../types';
import { mockUsers } from '../data/mockData';
import { getAuthMode } from '../lib/environment';
import { isValidUUID, validateUUID } from '../lib/utils';

export class AuthService {
  static async login(usernameOrEmail: string, password: string): Promise<User | null> {
    // Check if we should use mock authentication
    if (getAuthMode() === 'mock') {
      return this.mockLogin(usernameOrEmail, password);
    }

    // If Supabase is not available, fallback to mock
    if (!isSupabaseAvailable()) {
      return this.mockLogin(usernameOrEmail, password);
    }

    try {
      // For demo purposes, validate credentials first
      const validCredentials = (
        (usernameOrEmail === 'admin' && password === 'admin') ||
        (usernameOrEmail === 'manager' && password === 'manager') ||
        (usernameOrEmail === 'user' && password === 'user') ||
        (usernameOrEmail === 'jane.doe' && password === 'password') ||
        (usernameOrEmail === 'hr.manager' && password === 'hrpass') ||
        (usernameOrEmail === 'admin@company.com' && password === 'admin') ||
        (usernameOrEmail === 'manager@company.com' && password === 'manager') ||
        (usernameOrEmail === 'user@company.com' && password === 'user') ||
        (usernameOrEmail === 'jane@company.com' && password === 'password') ||
        (usernameOrEmail === 'hrmanager@company.com' && password === 'hrpass')
      );

      if (!validCredentials) {
        return null;
      }

      // Get the corresponding mock user data
      const mockUser = mockUsers.find(u => u.username === usernameOrEmail || u.email === usernameOrEmail);
      if (!mockUser) {
        console.error('No mock user data found for:', usernameOrEmail);
        return null;
      }

      // Ensure user exists in database before returning
      await this.ensureUserExistsInDatabase(mockUser);
      
      return {
        ...mockUser,
        lastLogin: new Date()
      };
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  }

  private static async ensureUserExistsInDatabase(mockUser: User): Promise<void> {
    if (!isSupabaseAvailable()) {
      return;
    }

    try {
      // Check if user exists
      const { data: existingUser, error: fetchError } = await supabase
        ?.from('users')
        .select('id')
        .eq('id', mockUser.id)
        .maybeSingle();

      // If user doesn't exist, create them
      if (fetchError?.code === 'PGRST116' || !existingUser) {
        console.log('Creating user in database:', mockUser.name);
        
        // Map application roles to database roles
        const roleMapping: Record<string, string> = {
          'DO': 'dept_officer',
          'EO': 'eo',
          'Employee': 'employee'
        };
        
        const dbRole = roleMapping[mockUser.role] || mockUser.role.toLowerCase();
        
        const { error: insertError } = await supabase
          ?.from('users')
          .insert({
            id: mockUser.id,
            email: mockUser.email,
            name: mockUser.name,
            role: dbRole,
            department: mockUser.department,
            active: true
          });

        if (insertError && insertError.code !== '23505') { // Ignore duplicate key errors
          console.error('Failed to create user in database:', insertError);
        }
      }
    } catch (error) {
      console.error('Error ensuring user exists in database:', error);
    }
  }

  private static mockLogin(usernameOrEmail: string, password: string): User | null {
    // Simple password validation for mock mode
    const validCredentials = (
      (usernameOrEmail === 'admin' && password === 'admin') ||
      (usernameOrEmail === 'manager' && password === 'manager') ||
      (usernameOrEmail === 'user' && password === 'user') ||
      (usernameOrEmail === 'jane.doe' && password === 'password') ||
      (usernameOrEmail === 'hr.manager' && password === 'hrpass') ||
      (usernameOrEmail === 'admin@company.com' && password === 'admin') ||
      (usernameOrEmail === 'manager@company.com' && password === 'manager') ||
      (usernameOrEmail === 'user@company.com' && password === 'user') ||
      (usernameOrEmail === 'jane@company.com' && password === 'password') ||
      (usernameOrEmail === 'hrmanager@company.com' && password === 'hrpass')
    );

    if (!validCredentials) {
      return null;
    }

    const user = mockUsers.find(u => u.username === usernameOrEmail || u.email === usernameOrEmail);
    if (user) {
      // Validate mock user ID format
      try {
        validateUUID(user.id, 'User ID');
      } catch (error) {
        console.error('Invalid mock user ID:', user.id);
        return null;
      }
      
      return {
        ...user,
        lastLogin: new Date()
      };
    }

    return null;
  }

  static async getAllUsers(): Promise<User[]> {
    // If Supabase is not available or configured, return mock users
    if (!isSupabaseAvailable()) {
      return mockUsers;
    }

    try {
      const { data: users, error } = await supabase
        ?.from('users')
        .select('*')
        .order('name');

      if (error) {
        console.warn('Supabase users query failed, falling back to mock data:', error);
        return mockUsers;
      }

      return users?.map(user => ({
        id: user.id,
        username: user.email.split('@')[0],
        name: user.name,
        email: user.email,
        role: user.role === 'dept_officer' ? 'DO' : user.role === 'eo' ? 'EO' : user.role === 'employee' ? 'Employee' : user.role,
        department: user.department,
        lastLogin: user.last_login ? new Date(user.last_login) : undefined
      }))
      .filter(user => {
        // Filter out users with invalid UUID format
        if (!isValidUUID(user.id)) {
          console.warn(`Filtering out user with invalid UUID: ${user.id} (${user.name})`);
          return false;
        }
        return true;
      }) || [];
    } catch (error) {
      console.warn('Supabase connection failed, using mock data:', error);
      return mockUsers;
    }
  }

  static async getAvailableModules(): Promise<Module[]> {
    // FORCE MOCK MODE - Always use mock modules for now
    const mockModules: Module[] = [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Maintenance Tracker',
        description: 'Track and manage maintenance requests and work orders',
        icon: 'Wrench',
        color: 'from-blue-500 to-indigo-500',
        schema_id: 'maintenance',
        config: { categories: ['Electrical', 'Plumbing', 'HVAC', 'General Maintenance', 'Equipment Repair'] },
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        name: 'RTI Tracker',
        description: 'Right to Information request tracking and management',
        icon: 'FileText',
        color: 'from-purple-500 to-indigo-500',
        schema_id: 'rti',
        config: { categories: ['Information Request', 'Appeal', 'Compliance', 'Documentation', 'Other'] },
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440003',
        name: 'Complaints Tracker',
        description: 'Manage customer complaints and resolution workflows',
        icon: 'Users',
        color: 'from-orange-500 to-red-500',
        schema_id: 'complaints',
        config: { categories: ['Service Quality', 'Staff Behavior', 'Product Issues', 'Billing', 'Other'] },
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440004',
        name: 'Grievances Management',
        description: 'Handle employee grievances and HR processes',
        icon: 'FileText',
        color: 'from-green-500 to-teal-500',
        schema_id: 'grievances',
        config: { categories: ['Workplace Issues', 'Policy Concerns', 'Discrimination', 'Safety Issues', 'Other'] },
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440005',
        name: 'Project Execution Platform',
        description: 'Track project milestones and deliverables',
        icon: 'Briefcase',
        color: 'from-indigo-500 to-purple-500',
        schema_id: 'pep',
        config: { categories: ['Planning', 'Execution', 'Monitoring', 'Resource Management', 'Quality Control'] },
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    console.log('🔍 AuthService: FORCED MOCK MODE - Loading modules...');
    console.log('🔍 AuthService: Total mock modules defined:', mockModules.length);
    console.log('🔍 AuthService: Mock modules details:', mockModules.map(m => ({ 
      id: m.id, 
      name: m.name, 
      active: m.active,
      categories: m.config.categories.length,
      validUUID: isValidUUID(m.id)
    })));

    // Filter only active modules (all should be active)
    const activeModules = mockModules.filter(module => module.active !== false);
    console.log('🔍 AuthService: Active modules after filtering:', activeModules.length);

    // NO UUID VALIDATION FOR NOW - Return all active modules
    console.log('🔍 AuthService: Final modules being returned:', activeModules.length);
    console.log('🔍 AuthService: Module names:', activeModules.map(m => m.name));
    
    return activeModules;
  }
}