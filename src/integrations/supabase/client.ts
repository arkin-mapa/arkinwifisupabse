import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://edrxvegggschpnpnsfmp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkcnh2ZWdnZ3NjaHBucG5zZm1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM3MjUyOTMsImV4cCI6MjA0OTMwMTI5M30.-7dTiADMZQUfOVuMzkIPvn9AqGWYZbkDYqYwkDWg4G4";

export const supabase = createClient<Database>(
  SUPABASE_URL, 
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: true,
      storageKey: 'wifi-portal-auth',
      storage: window.localStorage,
      autoRefreshToken: true,
    },
  }
);