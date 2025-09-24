import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';
import { getEnvironmentMode } from './environment';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Only create client if environment mode is 'database'
export const supabase = getEnvironmentMode() === 'database'
  ? createClient<Database>(supabaseUrl, supabaseAnonKey)
  : null;

// Check if Supabase is available
export const isSupabaseAvailable = (): boolean => {
  return supabase !== null;
};

// Helper function to handle Supabase errors
export const handleSupabaseError = (error: any) => {
  console.error('Supabase error:', error);
  if (error?.message) {
    throw new Error(error.message);
  }
  throw new Error('An unexpected database error occurred');
};