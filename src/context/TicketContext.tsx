import { supabase, handleSupabaseError, isSupabaseAvailable } from '../lib/supabase';
import { Ticket, TicketStatus, StatusTransitionRequest, User, Module } from '../types';
import { mockTickets, mockUsers } from '../data/mockData';
import { validateUUID, generateUUID } from '../lib/utils';
import { AuthService } from './authService';

export class TicketService {
  static async getTicketsByModule(moduleId: string): Promise<Ticket[]> {
    // Validate module ID
    try {
      validateUUID(moduleId, 'Module ID');
    } catch (error) {
      console.error('UUID validation failed:', error);
      throw new Error(`Invalid module ID format: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // If Supabase is not available, return mock tickets
    if (!isSupabaseAvailable()) {
      return mockTickets.filter(ticket => ticket.moduleId === moduleId);
    }

    try {
      const { data: tickets, error } = await supabase
        ?.from('tickets')
        .select(`
          *,
          steps (
            *,
            documents (*)
          ),
          documents (*),
          audit_logs (*)
        `)
        .eq('module_id', moduleId)
        .order('created_at', { ascending: false });

      if (error) {
        handleSupabaseError(error);
      }

      return tickets?.map(ticket => this.mapTicketFromDatabase(ticket)) || [];
    } catch (error) {
      handleSupabaseError(error);
      return mockTickets.filter(ticket => ticket.moduleId === moduleId); // Fallback to mock data on error
    }
  }

  static async createTicket(ticketData: Omit<Ticket, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt' | 'steps' | 'attachments' | 'auditTrail'>): Promise<string> {
    // Validate user IDs before proceeding
    try {
      validateUUID(ticketData.moduleId, 'Module ID');
      validateUUID(ticketData.createdBy, 'Created By User ID');
      if (ticketData.assignedTo) {
        validateUUID(ticketData.assignedTo, 'Assigned To User ID');
      }
    } catch (error) {
      console.error('UUID validation failed:', error);
      throw new Error(`Invalid user ID format: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Ensure the creating user exists in database
    if (isSupabaseAvailable()) {
      await this.ensureUserExistsForTicketCreation(ticketData.createdBy);
      if (ticketData.assignedTo) {
        await this.ensureUserExistsForTicketCreation(ticketData.assignedTo);
      }
    }

    // Get module-specific ticket prefix
    const ticketPrefix = this.getTicketPrefix(ticketData.moduleId);

    // If Supabase is not available, simulate creation with mock data
    if (!isSupabaseAvailable()) {
      // Get the highest ticket number for this module
      const moduleTickets = mockTickets.filter(t => t.moduleId === ticketData.moduleId);
      const existingNumbers = moduleTickets.map(t => {
        const match = t.ticketNumber.match(new RegExp(`${ticketPrefix}-(\\d+)`));
        return match ? parseInt(match[1]) : 0;
      });
      const nextNumber = Math.max(...existingNumbers, 0) + 1;
      const ticketNumber = `${ticketPrefix}-${String(nextNumber).padStart(3, '0')}`;
      const ticketId = generateUUID();
      const newTicket: Ticket = {
        id: ticketId,
        ticketNumber,
        ...ticketData,
        createdAt: new Date(),
        updatedAt: new Date(),
        steps: [],
        attachments: [],
        auditTrail: [{
          id: `AUDIT-${ticketId}-1`,
          ticketId,
          userId: ticketData.createdBy,
          action: 'CREATED',
          newValue: ticketData.status,
          timestamp: new Date()
        }]
      };
      mockTickets.unshift(newTicket);
      return ticketId;
    }

    // Retry mechanism for handling duplicate ticket number conflicts
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Get the highest ticket number for this module from database
        const { data: existingTickets } = await supabase
          ?.from('tickets')
          .select('ticket_number')
          .eq('module_id', ticketData.moduleId)
          .order('created_at', { ascending: false });

        // Extract and find the highest number
        const existingNumbers = existingTickets?.map(ticket => {
          const match = ticket.ticket_number.match(new RegExp(`${ticketPrefix}-(\\d+)`));
          return match ? parseInt(match[1]) : 0;
        }) || [];
        
        // Add some randomness to avoid conflicts in concurrent requests
        const baseNumber = Math.max(...existingNumbers, 0) + 1;
        const nextNumber = attempt > 1 ? baseNumber + Math.floor(Math.random() * 100) : baseNumber;
        
        const ticketNumberString = `${ticketPrefix}-${String(nextNumber).padStart(3, '0')}`;

        // Insert ticket
        const { data: insertedTicket, error: ticketError } = await supabase
          ?.from('tickets')
          .insert({
            ticket_number: ticketNumberString,
            module_id: ticketData.moduleId,
            title: ticketData.title,
            description: ticketData.description,
            status: ticketData.status.toLowerCase(),
            priority: ticketData.priority.toLowerCase(),
            assigned_to: ticketData.assignedTo || null,
            created_by: ticketData.createdBy,
            due_date: ticketData.dueDate?.toISOString() || null,
            data: {
              category: ticketData.category,
              department: ticketData.department
            }
          })
          .select()
          .single();

        // Check for duplicate key constraint violation (PostgreSQL error code 23505)
        if (ticketError && ticketError.code === '23505') {
          console.warn(`Ticket number conflict on attempt ${attempt}, retrying...`);
          lastError = new Error(`Duplicate ticket number: ${ticketError.message}`);
          
          // If this is not the last attempt, continue to retry
          if (attempt < maxRetries) {
            // Add a small delay before retrying to reduce race conditions
            await new Promise(resolve => setTimeout(resolve, 100 * attempt));
            continue;
          }
        } else if (ticketError) {
          // For other errors, throw immediately
          console.error('Ticket creation error:', ticketError);
          throw new Error(`Failed to create ticket: ${ticketError.message}`);
        }

        const actualTicketId = insertedTicket?.id;
        if (!actualTicketId) {
          throw new Error('Failed to get ticket ID from database');
        }

        // Create audit entry
        await this.createAuditEntry(actualTicketId, ticketData.createdBy, 'CREATED', null, ticketData.status, null);

        return actualTicketId;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error occurred');
        
        // If this is a duplicate key error and we have retries left, continue
        if (error instanceof Error && error.message.includes('23505') && attempt < maxRetries) {
          console.warn(`Ticket creation attempt ${attempt} failed with duplicate key, retrying...`);
          await new Promise(resolve => setTimeout(resolve, 100 * attempt));
          continue;
        }
        
        // For other errors or if we've exhausted retries, break the loop
        break;
      }
    }

    // If we reach here, all retries failed
    console.error('Ticket creation failed after all retries:', lastError);
    throw new Error(`Failed to create ticket after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`);
  }

  private static getTicketPrefix(moduleId: string): string {
    // Module-specific ticket prefixes
    const modulePrefixes: Record<string, string> = {
      '550e8400-e29b-41d4-a716-446655440101': 'MTKT', // Maintenance Module
      '550e8400-e29b-41d4-a716-446655440102': 'MTKT', // Maintenance Tracker
      '550e8400-e29b-41d4-a716-446655440103': 'CTKT', // Complaints Tracker
      '550e8400-e29b-41d4-a716-446655440104': 'GTKT', // Grievances Module
      '550e8400-e29b-41d4-a716-446655440105': 'RTKT', // RTI Tracker
      '550e8400-e29b-41d4-a716-446655440106': 'PTKT'  // Project Execution Plan (PEP)
    };
    
    return modulePrefixes[moduleId] || 'TKT';
  }
  private static async ensureUserExistsForTicketCreation(userId: string): Promise<void> {
    try {
      // Check if user exists in database
      const { data: existingUser, error: fetchError } = await supabase
        ?.from('users')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      // If user doesn't exist, create them from mock data
      if (fetchError?.code === 'PGRST116' || !existingUser) {
        console.log('User not found in database, creating from mock data:', userId);
        
        // Find user in mock data
        const mockUser = mockUsers.find(u => u.id === userId);
        if (mockUser) {
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
            console.error('Failed to create user for ticket creation:', insertError);
            throw new Error(`Failed to create user profile: ${insertError.message}`);
          }
        } else {
          throw new Error(`User data not found for ID: ${userId}`);
        }
      }
    } catch (error) {
      console.error('Error ensuring user exists for ticket creation:', error);
      throw error;
    }
  }

  static async updateTicket(id: string, updates: Partial<Ticket>, userId: string): Promise<void> {
    // Validate UUIDs
    try {
      validateUUID(id, 'Ticket ID');
      validateUUID(userId, 'User ID');
      if (updates.assignedTo) {
        validateUUID(updates.assignedTo, 'Assigned To User ID');
      }
    } catch (error) {
      console.error('UUID validation failed:', error);
      throw new Error(`Invalid UUID format: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // If Supabase is not available, update mock data
    if (!isSupabaseAvailable()) {
      const ticketIndex = mockTickets.findIndex(t => t.id === id);
      if (ticketIndex !== -1) {
        const oldTicket = { ...mockTickets[ticketIndex] };
        mockTickets[ticketIndex] = { ...mockTickets[ticketIndex], ...updates, updatedAt: new Date() };
        
        // Add audit entry for mock data
        const auditEntry = {
          id: `AUDIT-${id}-${mockTickets[ticketIndex].auditTrail.length + 1}`,
          ticketId: id,
          userId,
          action: 'UPDATED',
          oldValue: JSON.stringify(oldTicket),
          newValue: JSON.stringify(mockTickets[ticketIndex]),
          remarks: 'Ticket details updated',
          timestamp: new Date()
        };
        mockTickets[ticketIndex].auditTrail.push(auditEntry);
      }
      return;
    }

    try {
      // Get current ticket data for audit trail
      const { data: currentTicket, error: fetchCurrentError } = await supabase
        ?.from('tickets')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchCurrentError) {
        handleSupabaseError(fetchCurrentError);
      }

      const updateData: any = {};
      
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.priority !== undefined) updateData.priority = updates.priority.toLowerCase();
      if (updates.assignedTo !== undefined) updateData.assigned_to = updates.assignedTo;
      if (updates.dueDate !== undefined) updateData.due_date = updates.dueDate?.toISOString() || null;

      // Handle category and department updates in the data JSONB column
      if (updates.category !== undefined || updates.department !== undefined) {
        // First, get the current data
        const { data: currentTicket, error: fetchError } = await supabase
          ?.from('tickets')
          .select('data')
          .eq('id', id)
          .single();

        if (fetchError) {
          handleSupabaseError(fetchError);
        }

        // Merge the updates into the existing data
        const currentData = currentTicket?.data || {};
        const updatedData = { ...currentData };
        
        if (updates.category !== undefined) updatedData.category = updates.category;
        if (updates.department !== undefined) updatedData.department = updates.department;
        
        updateData.data = updatedData;
      }

      const { error } = await supabase
        ?.from('tickets')
        .update(updateData)
        .eq('id', id);

      if (error) {
        handleSupabaseError(error);
      }

      // Create audit entry for update
      const changeDetails = Object.keys(updates).map(key => {
        const oldValue = currentTicket?.[key] || currentTicket?.data?.[key];
        const newValue = updates[key as keyof Ticket];
        return `${key}: ${oldValue} → ${newValue}`;
      }).join(', ');
      
      await this.createAuditEntry(
        id, 
        userId, 
        'UPDATED', 
        JSON.stringify(currentTicket), 
        JSON.stringify(updates), 
        `Updated: ${changeDetails}`
      );
    } catch (error) {
      handleSupabaseError(error);
      throw error;
    }
  }

  static async changeTicketStatus(request: StatusTransitionRequest, userId: string): Promise<void> {
    // Validate UUIDs
    try {
      validateUUID(request.ticketId, 'Ticket ID');
      validateUUID(userId, 'User ID');
    } catch (error) {
      console.error('UUID validation failed:', error);
      throw new Error(`Invalid UUID format: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    console.log('TicketService.changeTicketStatus called with:', {
      ticketId: request.ticketId,
      newStatus: request.newStatus,
      userId,
      remarks: request.remarks
    });

    // If Supabase is not available, update mock data
    if (!isSupabaseAvailable()) {
      console.log('Using mock data for status change');
      const ticket = mockTickets.find(t => t.id === request.ticketId);
      if (ticket) {
        // Validate status transition
        const validTransitions: Record<TicketStatus, TicketStatus[]> = {
          'DRAFT': ['CREATED'],
          'CREATED': ['ACTIVE', 'CANCELLED'],
          'ACTIVE': ['IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
          'IN_PROGRESS': ['RESOLVED', 'CANCELLED'],
          'RESOLVED': ['COMPLETED'],
          'COMPLETED': ['ACTIVE'],
          'CANCELLED': ['CREATED']
        };

        if (!validTransitions[ticket.status].includes(request.newStatus)) {
          throw new Error(`Invalid status transition from ${ticket.status} to ${request.newStatus}`);
        }

        const oldStatus = ticket.status;
        ticket.status = request.newStatus;
        ticket.updatedAt = new Date();
        
        // Add audit entry
        ticket.auditTrail.push({
          id: `AUDIT-${ticket.id}-${ticket.auditTrail.length + 1}`,
          ticketId: ticket.id,
          userId,
          action: 'STATUS_CHANGE',
          oldValue: oldStatus,
          newValue: request.newStatus,
          remarks: request.remarks,
          timestamp: new Date()
        });
        
        console.log('Mock status change successful:', {
          oldStatus,
          newStatus: request.newStatus,
          ticketId: ticket.id
        });
      } else {
        throw new Error('Ticket not found');
      }
      return;
    }

    try {
      // Get current ticket
      const { data: ticket, error: fetchError } = await supabase
        ?.from('tickets')
        .select('status')
        .eq('id', request.ticketId)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching ticket for status change:', fetchError);
        throw new Error(`Failed to fetch ticket: ${fetchError.message}`);
      }

      if (!ticket) {
        throw new Error('Ticket not found');
      }

      // Validate status transition
      const currentStatus = ticket.status.toUpperCase() as TicketStatus;
      const validTransitions: Record<TicketStatus, TicketStatus[]> = {
        'DRAFT': ['CREATED'],
        'CREATED': ['APPROVED', 'CANCELLED'],
        'APPROVED': ['ACTIVE', 'CANCELLED'],
        'ACTIVE': ['IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
        'IN_PROGRESS': ['RESOLVED', 'CANCELLED'],
        'RESOLVED': ['COMPLETED'],
        'CLOSED': ['ACTIVE'],
        'COMPLETED': ['CLOSED'],
        'CANCELLED': ['CREATED']
      };

      if (!validTransitions[currentStatus] || !validTransitions[currentStatus].includes(request.newStatus)) {
        throw new Error(`Invalid status transition from ${currentStatus} to ${request.newStatus}`);
      }

      // Update ticket status
      const { error: updateError } = await supabase
        ?.from('tickets')
        .update({ status: request.newStatus.toLowerCase() })
        .eq('id', request.ticketId);

      if (updateError) {
        console.error('Error updating ticket status:', updateError);
        throw new Error(`Failed to update ticket status: ${updateError.message}`);
      }

      // Create audit entry
      await this.createAuditEntry(
        request.ticketId,
        userId,
        'STATUS_CHANGE',
        currentStatus,
        request.newStatus,
        request.remarks
      );
      
      console.log('Database status change successful:', {
        oldStatus: currentStatus,
        newStatus: request.newStatus,
        ticketId: request.ticketId
      });
    } catch (error) {
      console.error('Status change failed:', error);
      throw error;
    }
  }

  static async deleteTicket(id: string): Promise<void> {
    // Validate UUID
    try {
      validateUUID(id, 'Ticket ID');
    } catch (error) {
      console.error('UUID validation failed:', error);
      throw new Error(`Invalid UUID format: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // If Supabase is not available, remove from mock data
    if (!isSupabaseAvailable()) {
      const ticketIndex = mockTickets.findIndex(t => t.id === id);
      if (ticketIndex !== -1) {
        mockTickets.splice(ticketIndex, 1);
      }
      return;
    }

    try {
      const { error } = await supabase
        ?.from('tickets')
        .delete()
        .eq('id', id);

      if (error) {
        handleSupabaseError(error);
      }
    } catch (error) {
      handleSupabaseError(error);
      throw error;
    }
  }

  static async addStep(ticketId: string, stepData: any, userId: string): Promise<void> {
    // Validate UUIDs
    try {
      validateUUID(ticketId, 'Ticket ID');
      validateUUID(userId, 'User ID');
      if (stepData.assignedTo) {
        validateUUID(stepData.assignedTo, 'Assigned To User ID');
      }
    } catch (error) {
      console.error('UUID validation failed:', error);
      throw new Error(`Invalid UUID format: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    console.log('Adding step with data:', {
      ...stepData,
      referenceFilesCount: stepData.referenceFiles?.length || 0,
      documentRequirementsCount: stepData.documentRequirements?.length || 0
    });

    // If Supabase is not available, add to mock data
    if (!isSupabaseAvailable()) {
      const ticket = mockTickets.find(t => t.id === ticketId);
      if (ticket) {
        // Process reference files with proper file data storage
        const processedReferenceFiles = (stepData.referenceFiles || []).map((file: any) => ({
          ...file,
          // Ensure file data is preserved
          fileData: file.fileData || null,
          // Generate blob URL if file data exists
          url: file.fileData ? URL.createObjectURL(file.fileData) : file.url || ''
        }));

        // Process document requirements with proper file data storage
        const processedDocumentRequirements = (stepData.documentRequirements || []).map((req: any) => ({
          ...req,
          userUploadedFile: req.userUploadedFile ? {
            ...req.userUploadedFile,
            fileData: req.userUploadedFile.fileData || null,
            url: req.userUploadedFile.fileData ? URL.createObjectURL(req.userUploadedFile.fileData) : req.userUploadedFile.url || ''
          } : undefined
        }));

        const newStep: any = {
          id: generateUUID(),
          ticketId,
          stepNumber: stepData.stepNumber,
          title: stepData.title,
          description: stepData.description || '',
          status: stepData.status,
          assignedTo: stepData.assignedTo,
          createdBy: userId,
          createdAt: new Date(),
          referenceFiles: processedReferenceFiles,
          documentRequirements: processedDocumentRequirements,
          comments: [],
          attachments: []
        };
        
        console.log('Created new step with processed files:', {
          stepId: newStep.id,
          referenceFiles: newStep.referenceFiles.length,
          documentRequirements: newStep.documentRequirements.length,
          hasFileData: newStep.referenceFiles.some((f: any) => f.fileData) || 
                      newStep.documentRequirements.some((r: any) => r.userUploadedFile?.fileData)
        });
        
        ticket.steps.push(newStep);
        
        // Add audit entry for step creation
        const auditEntry = {
          id: `AUDIT-${ticketId}-${ticket.auditTrail.length + 1}`,
          ticketId,
          userId,
          action: 'STEP_ADDED',
          newValue: `Step ${stepData.stepNumber}: ${stepData.title}`,
          remarks: `Added step "${stepData.title}" with status ${stepData.status}${processedReferenceFiles.length ? ` (${processedReferenceFiles.length} reference files)` : ''}${processedDocumentRequirements.length ? ` (${processedDocumentRequirements.length} document requirements)` : ''}`,
          timestamp: new Date()
        };
        ticket.auditTrail.push(auditEntry);
        
        console.log('Step added successfully to ticket:', {
          ticketId: ticket.id,
          totalSteps: ticket.steps.length,
          newStepId: newStep.id
        });
      }
      return;
    }

    try {
      // Prepare step data with files and requirements
      const stepInsertData = {
        ticket_id: ticketId,
        step_number: stepData.stepNumber.toString(),
        title: stepData.title,
        description: stepData.description || null,
        status: stepData.status.toLowerCase(),
        assigned_to: stepData.assignedTo || null,
        is_parallel: stepData.is_parallel !== false,
        dependencies: stepData.dependencies || [],
        mandatory_documents: stepData.mandatory_documents || [],
        optional_documents: stepData.optional_documents || [],
        data: {
          referenceFiles: stepData.referenceFiles || [],
          documentRequirements: stepData.documentRequirements || []
        }
      };

      const { data: insertedStep, error } = await supabase
        ?.from('steps')
        .insert(stepInsertData)
        .select()
        .single();

      if (error) {
        handleSupabaseError(error);
      }
      
      // Create audit entry for step addition
      await this.createAuditEntry(
        ticketId,
        userId,
        'STEP_ADDED',
        null,
        `Step ${stepData.stepNumber}: ${stepData.title}`,
        `Added step "${stepData.title}" with status ${stepData.status}${stepData.assignedTo ? ` assigned to user ${stepData.assignedTo}` : ''}`
      );
    } catch (error) {
      handleSupabaseError(error);
      throw error;
    }
  }

  static async updateStep(ticketId: string, stepId: string, updates: any): Promise<void> {
  }
  static async updateStep(ticketId: string, stepId: string, updates: any, userId: string): Promise<void> {
    // Validate UUIDs
    try {
      validateUUID(ticketId, 'Ticket ID');
      validateUUID(stepId, 'Step ID');
      validateUUID(userId, 'User ID');
      if (updates.assignedTo) {
        validateUUID(updates.assignedTo, 'Assigned To User ID');
      }
    } catch (error) {
      console.error('UUID validation failed:', error);
      // Don't throw on UUID validation errors, just log them
      console.warn(`UUID validation warning: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // If Supabase is not available, update mock data
    if (!isSupabaseAvailable()) {
      const ticket = mockTickets.find(t => t.id === ticketId);
      if (ticket) {
        const stepIndex = ticket.steps.findIndex(s => s.id === stepId);
        if (stepIndex !== -1) {
          const oldStep = { ...ticket.steps[stepIndex] };
          ticket.steps[stepIndex] = { ...ticket.steps[stepIndex], ...updates };
          
          // Handle file attachments for mock data
          if (updates.attachments && updates.attachments.length > 0) {
            ticket.steps[stepIndex].attachments = [
              ...(ticket.steps[stepIndex].attachments || []),
              ...updates.attachments.map((file: any) => ({
                id: generateUUID(),
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type,
                url: file.url || URL.createObjectURL(file),
                uploadedBy: userId,
                uploadedAt: new Date()
              }))
            ];
          }
          
          // Add audit entry for step update
          const auditEntry = {
            id: `AUDIT-${ticketId}-${ticket.auditTrail.length + 1}`,
            ticketId,
            userId: 'current-user', // In mock mode, we don't have userId here
            action: 'STEP_UPDATED',
            oldValue: `${oldStep.title} (${oldStep.status})`,
            newValue: `${ticket.steps[stepIndex].title} (${ticket.steps[stepIndex].status})`,
            remarks: `Updated step "${ticket.steps[stepIndex].title}"${updates.attachments ? ` (${updates.attachments.length} files uploaded)` : ''}`,
            timestamp: new Date()
          };
          ticket.auditTrail.push(auditEntry);
        }
      }
      return;
    }

    try {
      // Get current step data for audit trail
      const { data: currentStep, error: fetchError } = await supabase
        ?.from('steps')
        .select('*')
        .eq('id', stepId)
        .single();

      if (fetchError) {
        handleSupabaseError(fetchError);
      }

      const updateData: any = {};
      
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.status !== undefined) updateData.status = updates.status.toLowerCase();
      if (updates.assignedTo !== undefined) updateData.assigned_to = updates.assignedTo;
      if (updates.completedAt !== undefined) updateData.completed_at = updates.completedAt?.toISOString() || null;
      if (updates.stepNumber !== undefined) updateData.step_number = updates.stepNumber.toString();
      if (updates.is_parallel !== undefined) updateData.is_parallel = updates.is_parallel;
      if (updates.dependencies !== undefined) updateData.dependencies = updates.dependencies;
      if (updates.mandatory_documents !== undefined) updateData.mandatory_documents = updates.mandatory_documents;
      if (updates.optional_documents !== undefined) updateData.optional_documents = updates.optional_documents;

      // Handle file attachments in database
      if (updates.attachments && updates.attachments.length > 0) {
        // Store file information in step data
        const currentData = currentStep?.data || {};
        const existingAttachments = currentData.attachments || [];
        const newAttachments = updates.attachments.map((file: any) => ({
          id: generateUUID(),
          name: file.name,
          size: file.size,
          type: file.type,
          url: file.url || '',
          uploadedBy: userId,
          uploadedAt: new Date().toISOString()
        }));
        
        updateData.data = {
          ...currentData,
          attachments: [...existingAttachments, ...newAttachments]
        };
      }
      const { error } = await supabase
        ?.from('steps')
        .update(updateData)
        .eq('id', stepId);

      if (error) {
        handleSupabaseError(error);
      }
      
      // Create audit entry for step update
      const changeDetails = Object.keys(updates).map(key => {
        const oldValue = currentStep?.[key === 'assignedTo' ? 'assigned_to' : key];
        const newValue = updates[key];
        return `${key}: ${oldValue} → ${newValue}`;
      }).join(', ');
      
      const attachmentInfo = updates.attachments ? ` (${updates.attachments.length} files uploaded)` : '';
      
      await this.createAuditEntry(
        ticketId,
        userId,
        'STEP_UPDATED',
        JSON.stringify(currentStep),
        JSON.stringify(updates),
        `Updated step "${currentStep?.title}": ${changeDetails}${attachmentInfo}`
      );
    } catch (error) {
      handleSupabaseError(error);
      throw error;
    }
  }

  static async deleteStep(stepId: string, ticketId?: string, userId?: string): Promise<void> {
    // Validate UUID
    try {
      validateUUID(stepId, 'Step ID');
      if (ticketId) validateUUID(ticketId, 'Ticket ID');
      if (userId) validateUUID(userId, 'User ID');
    } catch (error) {
      console.error('UUID validation failed:', error);
      // Don't throw on UUID validation errors, just log them
      console.warn(`UUID validation warning: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // If Supabase is not available, remove from mock data
    if (!isSupabaseAvailable()) {
      for (const ticket of mockTickets) {
        const stepIndex = ticket.steps.findIndex(s => s.id === stepId);
        if (stepIndex !== -1) {
          ticket.steps.splice(stepIndex, 1);
          break;
        }
      }
      return;
    }

    try {
      // Get step data for audit trail before deletion
      const { data: stepToDelete, error: fetchError } = await supabase
        ?.from('steps')
        .select('*')
        .eq('id', stepId)
        .single();

      if (fetchError) {
        handleSupabaseError(fetchError);
      }

      // Create audit entry for step deletion
      if (stepToDelete) {
        await this.createAuditEntry(
          ticketId || stepToDelete.ticket_id,
          userId || 'system',
          'STEP_DELETED',
          JSON.stringify(stepToDelete),
          null,
          `Deleted step "${stepToDelete.title}"`
        );
      }

      const { error } = await supabase
        ?.from('steps')
        .delete()
        .eq('id', stepId);

      if (error) {
        handleSupabaseError(error);
      }
    } catch (error) {
      handleSupabaseError(error);
      throw error;
    }
  }

  private static async createAuditEntry(
    ticketId: string,
    userId: string,
    action: string,
    oldValue: string | null,
    newValue: string | null,
    remarks: string | null
  ): Promise<void> {
    // Validate UUIDs
    try {
      validateUUID(ticketId, 'Ticket ID');
      validateUUID(userId, 'User ID');
    } catch (error) {
      console.error('UUID validation failed in audit entry:', error);
      // Don't throw here as audit entries are not critical for main functionality
      console.warn(`Audit entry UUID validation warning: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return;
    }

    // Skip audit entry creation if Supabase is not available
    if (!isSupabaseAvailable()) {
      return;
    }

    try {
      // Ensure user exists in database before creating audit entry
      await this.ensureUserExistsForTicketCreation(userId);

      const { error } = await supabase
        ?.from('audit_logs')
        .insert({
          ticket_id: ticketId,
          performed_by: userId,
          action,
          old_data: oldValue,
          new_data: newValue,
          description: remarks
        });

      if (error) {
        handleSupabaseError(error);
      }
    } catch (error) {
      console.error('Failed to create audit entry:', error);
      // Don't throw here as audit entries are not critical for main functionality
    }
  }

  private static mapTicketFromDatabase(dbTicket: any): Ticket {
    return {
      id: dbTicket.id,
      ticketNumber: dbTicket.ticket_number,
      moduleId: dbTicket.module_id,
      title: dbTicket.title || '',
      description: dbTicket.description,
      status: dbTicket.status.toUpperCase(),
      priority: dbTicket.priority.toUpperCase(),
      category: dbTicket.data?.category || 'General',
      assignedTo: dbTicket.assigned_to || undefined,
      createdBy: dbTicket.created_by,
      department: dbTicket.data?.department || 'General',
      dueDate: dbTicket.due_date ? new Date(dbTicket.due_date) : undefined,
      createdAt: new Date(dbTicket.created_at),
      updatedAt: new Date(dbTicket.updated_at),
      steps: (dbTicket.steps || []).map((step: any) => ({
        id: step.id,
        ticketId: step.ticket_id,
        stepNumber: step.step_number,
        title: step.title,
        description: step.description || '',
        status: step.status,
        assignedTo: step.assigned_to,
        createdBy: step.created_by,
        createdAt: new Date(step.created_at),
        completedAt: step.completed_at ? new Date(step.completed_at) : undefined,
        is_parallel: step.is_parallel !== false,
        dependencies: step.dependencies || [],
        mandatory_documents: step.mandatory_documents || [],
        optional_documents: step.optional_documents || [],
        referenceFiles: step.data?.referenceFiles || [],
        documentRequirements: step.data?.documentRequirements || [],
        comments: [],
        attachments: []
      })),
      attachments: (dbTicket.documents || []).filter((doc: any) => doc.ticket_id).map((attachment: any) => ({
        id: attachment.id,
        fileName: attachment.name,
        fileSize: attachment.size,
        fileType: attachment.type,
        url: attachment.file_url,
        uploadedBy: attachment.uploaded_by,
        uploadedAt: new Date(attachment.uploaded_at)
      })),
      auditTrail: (dbTicket.audit_logs || []).map((entry: any) => ({
        id: entry.id,
        ticketId: entry.ticket_id,
        userId: entry.performed_by,
        action: entry.action,
        oldValue: entry.old_data,
        newValue: entry.new_data,
        remarks: entry.description,
        timestamp: new Date(entry.performed_at)
      }))
    };
  }
}