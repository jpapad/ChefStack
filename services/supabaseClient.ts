// src/services/supabaseClient.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Αν λείπουν τα env, δεν φτιάχνουμε client και πέφτουμε σε mock mode
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

if (!isSupabaseConfigured) {
  console.warn(
    'Supabase is NOT configured. Using mock data. ' +
    'Set VITE_SUPABASE_URL και VITE_SUPABASE_ANON_KEY στο .env.local.'
  );
}
