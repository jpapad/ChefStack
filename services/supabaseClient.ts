import { createClient } from '@supabase/supabase-js';

// These variables should be configured in your environment (e.g., .env file or hosting provider settings).
// You can find these values in your Supabase project's dashboard under Settings > API.
const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY as string;

// Conditionally create the client. Export null if env vars are not set.
const supabase = (supabaseUrl && supabaseAnonKey) 
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export { supabase };
