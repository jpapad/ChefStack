// src/services/supabaseClient.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const publicUrl = import.meta.env.VITE_PUBLIC_URL as string | undefined;

// Αν λείπουν τα env, δεν φτιάχνουμε client και πέφτουμε σε mock mode
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Determine redirect URL (production URL or localhost for dev)
const getRedirectUrl = () => {
  if (publicUrl) {
    return publicUrl;
  }
  // Fallback to current window location for dev
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return 'http://localhost:3000';
};

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true, // Let Supabase do its job
        flowType: 'pkce',
        redirectTo: getRedirectUrl()
      }
    })
  : null;

if (!isSupabaseConfigured) {
  console.warn(
    'Supabase is NOT configured. Using mock data. ' +
    'Set VITE_SUPABASE_URL και VITE_SUPABASE_ANON_KEY στο .env.local.'
  );
}
