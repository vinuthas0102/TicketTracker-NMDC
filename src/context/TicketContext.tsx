import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Ticket, TicketStatus, StatusTransitionRequest, TicketStep, User, Module } from '../types';
import { TicketService } from '../services/ticketService';
import { AuthService } from '../services/authService';
import { useAuth } from './AuthContext';

interface TicketContextType {
  tickets: Ticket[];
  users: User[];
  loading: boolean;
  error: string | null;
  createTicket: (ticket: Omit<Ticket, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt' | 'steps' | 'attachments' | 'auditTrail'>) => Promise<void>;
  updateTicket: (id: string, updates: Partial<Ticket>) => Promise<void>;
  changeTicketStatus: (request: StatusTransitionRequest) => Promise<void>;
  deleteTicket: (id: string) => Promise<void>;
  getTicketById: (id: string) => Ticket | undefined;
  getFilteredTickets: (filters: TicketFilters) => Ticket[];
  addStep: (ticketId: string, step: Omit<TicketStep, 'id' | 'createdAt' | 'comments' | 'attachments'>) => Promise<void>;
  updateStep: (ticketId: string, stepId: string, updates: Partial<TicketStep>) => Promise<void>;
  deleteStep: (ticketId: string, stepId: string) => Promise<void>;
}

interface TicketFilters {
  search?: string;
  status?: TicketStatus;
  assignedTo?: string;
  department?: string;
  priority?: string;
  createdBy?: string;
}

const TicketContext = createContext<TicketContextType | undefined>(undefined);

export const useTickets = () => {
  const context = useContext(TicketContext);
  if (context === undefined) {
    throw new Error('useTickets must be used within a TicketProvider');
  }
  return context;
};

interface TicketProviderProps {
  children: ReactNode;
}

export const TicketProvider: React.FC<TicketProviderProps> = ({ children }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, selectedModule } = useAuth();

  useEffect(() => {
    const loadTickets = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const usersData = await AuthService.getAllUsers();
        setUsers(usersData);

        if (selectedModule) {
          const ticketsData = await TicketService.getTicketsByModule(selectedModule.id);
          setTickets(ticketsData);
        } else {
          setTickets([]);
        }
      } catch (err) {
        console.warn('Failed to load data, using fallback:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
        // Set fallback data to prevent blank screen
        if (users.length === 0) {
          const fallbackUsers = await AuthService.getAllUsers();
          setUsers(fallbackUsers);
        }
      } finally {
        setLoading(false);
      }
    };

    loadTickets();
  }, [selectedModule]);

  const createTicket = async (ticketData: Omit<Ticket, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt' | 'steps' | 'attachments' | 'auditTrail'>) => {
    try {
      if (!selectedModule) {
        throw new Error('No module selected');
      }
      
      const ticketId = await TicketService.createTicket(ticketData);
      
      // Reload tickets to get the updated list
      const updatedTickets = await TicketService.getTicketsByModule(selectedModule.id);
      setTickets(updatedTickets);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create ticket');
      throw err;
    }
  };

  const updateTicket = async (id: string, updates: Partial<Ticket>) => {
    try {
      if (!user) throw new Error('User not authenticated');
      if (!selectedModule) throw new Error('No module selected');
      
      await TicketService.updateTicket(id, updates, user.id);
      
      // Reload tickets to get the updated list
      const updatedTickets = await TicketService.getTicketsByModule(selectedModule.id);
      setTickets(updatedTickets);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update ticket');
      throw err;
    }
  };

  const changeTicketStatus = async (request: StatusTransitionRequest) => {
    try {
      if (!user) throw new Error('User not authenticated');
      if (!selectedModule) throw new Error('No module selected');
      
      console.log('TicketContext.changeTicketStatus called:', request);
      
      await TicketService.changeTicketStatus(request, user.id);
      
      // Reload tickets to get the updated list
      const updatedTickets = await TicketService.getTicketsByModule(selectedModule.id);
      setTickets(updatedTickets);
      
      // Clear any previous errors
      setError(null);
      
      console.log('Status change completed successfully');
    } catch (err) {
      console.error('Status change error in context:', err);
      setError(err instanceof Error ? err.message : 'Failed to change status');
      throw err;
    }
  };

  const deleteTicket = async (id: string) => {
    try {
      if (!selectedModule) throw new Error('No module selected');
      
      await TicketService.deleteTicket(id);
      
      // Reload tickets to get the updated list
      const updatedTickets = await TicketService.getTicketsByModule(selectedModule.id);
      setTickets(updatedTickets);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete ticket');
      throw err;
    }
  };

  const getTicketById = (id: string): Ticket | undefined => {
    return tickets.find(ticket => ticket.id === id);
  };

  const getFilteredTickets = (filters: TicketFilters): Ticket[] => {
    let filtered = tickets;

    // Apply role-based filtering
    if (user) {
      switch (user.role) {
        case 'EMPLOYEE':
          filtered = filtered.filter(ticket => ticket.createdBy === user.id);
          break;
        case 'DO':
          filtered = filtered.filter(ticket => ticket.department === user.department);
          break;
        case 'EO':
          // EO can see all tickets
          break;
      }
    }

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(ticket =>
        ticket.id.toLowerCase().includes(searchLower) ||
        ticket.title.toLowerCase().includes(searchLower) ||
        ticket.description.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter(ticket => ticket.status === filters.status);
    }

    // Apply assignee filter
    if (filters.assignedTo) {
      filtered = filtered.filter(ticket => ticket.assignedTo === filters.assignedTo);
    }

    // Apply department filter
    if (filters.department) {
      filtered = filtered.filter(ticket => ticket.department === filters.department);
    }

    // Apply priority filter
    if (filters.priority) {
      filtered = filtered.filter(ticket => ticket.priority === filters.priority);
    }

    return filtered;
  };

  const addStep = async (ticketId: string, stepData: Omit<TicketStep, 'id' | 'createdAt' | 'comments' | 'attachments'>) => {
    try {
      if (!user) throw new Error('User not authenticated');
      if (!selectedModule) throw new Error('No module selected');
      
      console.log('TicketContext.addStep called with:', {
        ticketId,
        stepData,
        userId: user.id
      });
      
      await TicketService.addStep(ticketId, stepData, user.id);
      
      // Reload tickets to get the updated list
      const updatedTickets = await TicketService.getTicketsByModule(selectedModule.id);
      setTickets(updatedTickets);
      
      console.log('Step added and tickets reloaded successfully');
    } catch (err) {
      console.error('Error in TicketContext.addStep:', err);
      setError(err instanceof Error ? err.message : 'Failed to add step');
      throw err;
    }
  };

  const updateStep = async (ticketId: string, stepId: string, updates: Partial<TicketStep>) => {
    try {
      if (!user) throw new Error('User not authenticated');
      if (!selectedModule) throw new Error('No module selected');
      
      // Check if file upload is required for DO users completing steps
      if (user.role === 'DO' && updates.status === 'COMPLETED') {
        // Check if attachments are provided
        if (!updates.attachments || updates.attachments.length === 0) {
          throw new Error('File upload is mandatory for department officers when completing steps. Please upload at least one document.');
        }
      }
      
      await TicketService.updateStep(ticketId, stepId, updates, user.id);
      
      // Reload tickets to get the updated list
      const updatedTickets = await TicketService.getTicketsByModule(selectedModule.id);
      setTickets(updatedTickets);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update step');
      throw err;
    }
  };

  const deleteStep = async (ticketId: string, stepId: string) => {
    try {
      if (!user) throw new Error('User not authenticated');
      if (!selectedModule) throw new Error('No module selected');
      
      await TicketService.deleteStep(stepId, ticketId, user.id);
      
      // Reload tickets to get the updated list
      const updatedTickets = await TicketService.getTicketsByModule(selectedModule.id);
      setTickets(updatedTickets);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete step');
      throw err;
    }
  };

  const value: TicketContextType = {
    tickets,
    users,
    loading,
    error,
    createTicket,
    updateTicket,
    changeTicketStatus,
    deleteTicket,
    getTicketById,
    getFilteredTickets,
    addStep,
    updateStep,
    deleteStep,
  };

  return (
    <TicketContext.Provider value={value}>
      {children}
    </TicketContext.Provider>
  );
};