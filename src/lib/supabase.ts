import { createClient } from '@supabase/supabase-js';

// In a production app, these should be environment variables.
// Since we cannot write to .env.local in this environment, we are using them directly here for the MVP.
const supabaseUrl = 'https://hymwsxrmujmmjyawnots.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5bXdzeHJtdWptbWp5YXdub3RzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0OTk0NDUsImV4cCI6MjA4MDA3NTQ0NX0.C9wGc8aLjP_TQy2pFiXuEpAp6slAI9zI8SbQPEWingA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
