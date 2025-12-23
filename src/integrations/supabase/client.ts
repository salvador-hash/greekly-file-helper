import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://bliuiewjvvxemivdiies.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsaXVpZXdqdnZ4ZW1pdmRpaWVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ4NDE1NjIsImV4cCI6MjA1MDQxNzU2Mn0.placeholder";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
  },
});
