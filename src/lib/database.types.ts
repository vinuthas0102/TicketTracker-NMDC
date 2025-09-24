export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string // UUID
          name: string
          email: string
          role: 'employee' | 'eo' | 'dept_officer'
          department: string
          avatar: string | null
          active: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          email: string
          role: 'employee' | 'eo' | 'dept_officer'
          department: string
          avatar?: string | null
          active?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          role?: 'employee' | 'eo' | 'dept_officer'
          department?: string
          avatar?: string | null
          active?: boolean | null
          created_at?: string
          updated_at?: string
        }
      }
      tickets: {
        Row: {
          id: string
          ticket_number: string
          module_id: string
          title: string
          description: string
          status: string | null
          priority: string | null
          created_by: string
          assigned_to: string | null
          due_date: string | null
          data: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          ticket_number: string
          module_id: string
          title: string
          description: string
          status?: string | null
          priority?: string | null
          created_by: string
          assigned_to?: string | null
          due_date?: string | null
          data?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          ticket_number?: string
          module_id?: string
          title?: string
          description?: string
          status?: string | null
          priority?: string | null
          created_by?: string
          assigned_to?: string | null
          due_date?: string | null
          data?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      ticket_steps: {
        Row: {
          id: string
          ticket_id: string
          step_number: string
          title: string
          description: string | null
          status: string
          assigned_to: string | null
          level_1: number | null
          level_2: number | null
          level_3: number | null
          dependencies: string[] | null
          is_parallel: boolean | null
          mandatory_documents: string[] | null
          optional_documents: string[] | null
          due_date: string | null
          data: Json | null
          created_at: string
          updated_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          ticket_id: string
          step_number: string
          title: string
          description?: string | null
          status?: string
          assigned_to?: string | null
          level_1?: number | null
          level_2?: number | null
          level_3?: number | null
          dependencies?: string[] | null
          is_parallel?: boolean | null
          mandatory_documents?: string[] | null
          optional_documents?: string[] | null
          due_date?: string | null
          data?: Json | null
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          ticket_id?: string
          step_number?: string
          title?: string
          description?: string | null
          status?: string
          assigned_to?: string | null
          level_1?: number | null
          level_2?: number | null
          level_3?: number | null
          dependencies?: string[] | null
          is_parallel?: boolean | null
          mandatory_documents?: string[] | null
          optional_documents?: string[] | null
          due_date?: string | null
          data?: Json | null
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
      }
      step_comments: {
        Row: {
          id: string
          step_id: string
          content: string
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          step_id: string
          content: string
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          step_id?: string
          content?: string
          created_by?: string
          created_at?: string
        }
      }
      file_attachments: {
        Row: {
          id: string
          ticket_id: string | null
          step_id: string | null
          file_name: string
          file_size: number
          file_type: string
          file_url: string
          uploaded_by: string
          created_at: string
        }
        Insert: {
          id?: string
          ticket_id?: string | null
          step_id?: string | null
          file_name: string
          file_size: number
          file_type: string
          file_url: string
          uploaded_by: string
          created_at?: string
        }
        Update: {
          id?: string
          ticket_id?: string | null
          step_id?: string | null
          file_name?: string
          file_size?: number
          file_type?: string
          file_url?: string
          uploaded_by?: string
          created_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          ticket_id: string
          performed_by: string
          action: string
          old_data: string | null
          new_data: string | null
          description: string | null
          performed_at: string
        }
        Insert: {
          id?: string
          ticket_id: string
          performed_by: string
          action: string
          old_data?: string | null
          new_data?: string | null
          description?: string | null
          performed_at?: string
        }
        Update: {
          id?: string
          ticket_id?: string
          performed_by?: string
          action?: string
          old_data?: string | null
          new_data?: string | null
          description?: string | null
          performed_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}