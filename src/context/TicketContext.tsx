import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Ticket, TicketStatus, StatusTransitionRequest, User, Module } from '../types';
import { TicketService } from '../services/ticketService';
import { AuthService } from '../services/authService';
import { useAuth } from './AuthContext';

interface TicketContextType {
  tickets: Ticket[];
  users: User[];
  loading: boolean;
  error: string | null;
  selectedTicket: Ticket | null;
  fetchTickets: (moduleId: string) => Promise<void>;
  createTicket: (ticketData: Omit<Ticket, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt' | 'steps' | 'attachments' | 'auditTrail'>) => Promise<string>;
  updateTicket: (id: string, updates: Partial<Ticket>) => Promise<void>;
  changeTicketStatus: (request: StatusTransitionRequest) => Promise<void>;
  deleteTicket: (id: string) => Promise<void>;
  selectTicket: (ticket: Ticket | null) => void;
  addStep: (ticketId: string, stepData: any) => Promise<void>;
  updateStep: (ticketId: string, stepId: string, updates: any) => Promise<void>;
  deleteStep: (stepId: string, ticketId?: string) => Promise<void>;
}

const TicketContext = createContext<TicketContextType | undefined>(undefined);

interface TicketProviderProps {
  children: ReactNode;
}

export const TicketProvider: React.FC<TicketProviderProps> = ({ children }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const { user } = useAuth();

  // Fetch users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const allUsers = await AuthService.getAllUsers();
        setUsers(allUsers);
      } catch (err) {
        console.error('Failed to fetch users:', err);
      }
    };
    
    fetchUsers();
  }, []);

  const fetchTickets = useCallback(async (moduleId: string) => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔍 TicketContext: Fetching tickets for module:', moduleId);
      const fetchedTickets = await TicketService.getTicketsByModule(moduleId);
      console.log('🔍 TicketContext: Fetched tickets:', fetchedTickets.length);
      setTickets(fetchedTickets);
    } catch (err) {
      console.error('🔍 TicketContext: Error fetching tickets:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  }, []);

  const createTicket = async (ticketData: Omit<Ticket, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt' | 'steps' | 'attachments' | 'auditTrail'>): Promise<string> => {
    setError(null);
    try {
      const ticketId = await TicketService.createTicket(ticketData);
      // Refresh tickets after creation
      if (ticketData.moduleId) {
        await fetchTickets(ticketData.moduleId);
      }
      return ticketId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create ticket';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateTicket = async (id: string, updates: Partial<Ticket>) => {
    setError(null);
    try {
      if (!user) throw new Error('User not authenticated');
      await TicketService.updateTicket(id, updates, user.id);
      
      // Update local state
      setTickets(prevTickets => 
        prevTickets.map(ticket => 
          ticket.id === id ? { ...ticket, ...updates, updatedAt: new Date() } : ticket
        )
      );
      
      // Update selected ticket if it's the one being updated
      if (selectedTicket && selectedTicket.id === id) {
        setSelectedTicket(prev => prev ? { ...prev, ...updates, updatedAt: new Date() } : null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update ticket';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const changeTicketStatus = async (request: StatusTransitionRequest) => {
    setError(null);
    try {
      if (!user) throw new Error('User not authenticated');
      await TicketService.changeTicketStatus(request, user.id);
      
      // Update local state
      setTickets(prevTickets => 
        prevTickets.map(ticket => 
          ticket.id === request.ticketId 
            ? { ...ticket, status: request.newStatus, updatedAt: new Date() } 
            : ticket
        )
      );
      
      // Update selected ticket if it's the one being updated
      if (selectedTicket && selectedTicket.id === request.ticketId) {
        setSelectedTicket(prev => 
          prev ? { ...prev, status: request.newStatus, updatedAt: new Date() } : null
        );
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to change ticket status';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteTicket = async (id: string) => {
    setError(null);
    try {
      await TicketService.deleteTicket(id);
      
      // Update local state
      setTickets(prevTickets => prevTickets.filter(ticket => ticket.id !== id));
      
      // Clear selected ticket if it's the one being deleted
      if (selectedTicket && selectedTicket.id === id) {
        setSelectedTicket(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete ticket';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const selectTicket = (ticket: Ticket | null) => {
    setSelectedTicket(ticket);
  };

  const addStep = async (ticketId: string, stepData: any) => {
    setError(null);
    try {
      if (!user) throw new Error('User not authenticated');
      await TicketService.addStep(ticketId, stepData, user.id);
      
      // Refresh the specific ticket to get updated steps
      const ticket = tickets.find(t => t.id === ticketId);
      if (ticket) {
        await fetchTickets(ticket.moduleId);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add step';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateStep = async (ticketId: string, stepId: string, updates: any) => {
    setError(null);
    try {
      if (!user) throw new Error('User not authenticated');
      await TicketService.updateStep(ticketId, stepId, updates, user.id);
      
      // Update local state
      setTickets(prevTickets => 
        prevTickets.map(ticket => 
          ticket.id === ticketId 
            ? {
                ...ticket,
                steps: ticket.steps.map(step => 
                  step.id === stepId ? { ...step, ...updates } : step
                ),
                updatedAt: new Date()
              }
            : ticket
        )
      );
      
      // Update selected ticket if it's the one being updated
      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket(prev => 
          prev ? {
            ...prev,
            steps: prev.steps.map(step => 
              step.id === stepId ? { ...step, ...updates } : step
            ),
            updatedAt: new Date()
          } : null
        );
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update step';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteStep = async (stepId: string, ticketId?: string) => {
    setError(null);
    try {
      if (!user) throw new Error('User not authenticated');
      await TicketService.deleteStep(stepId, ticketId, user.id);
      
      // Update local state
      if (ticketId) {
        setTickets(prevTickets => 
          prevTickets.map(ticket => 
            ticket.id === ticketId 
              ? {
                  ...ticket,
                  steps: ticket.steps.filter(step => step.id !== stepId),
                  updatedAt: new Date()
                }
              : ticket
          )
        );
        
        // Update selected ticket if it's the one being updated
        if (selectedTicket && selectedTicket.id === ticketId) {
          setSelectedTicket(prev => 
            prev ? {
              ...prev,
              steps: prev.steps.filter(step => step.id !== stepId),
              updatedAt: new Date()
            } : null
          );
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete step';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const value: TicketContextType = {
    tickets,
    users,
    loading,
    error,
    selectedTicket,
    fetchTickets,
    createTicket,
    updateTicket,
    changeTicketStatus,
    deleteTicket,
    selectTicket,
    addStep,
    updateStep,
    deleteStep
  };

  return (
    <TicketContext.Provider value={value}>
      {children}
    </TicketContext.Provider>
  );
};

export const useTickets = (): TicketContextType => {
  const context = useContext(TicketContext);
  if (context === undefined) {
    throw new Error('useTickets must be used within a TicketProvider');
  }
  return context;
};