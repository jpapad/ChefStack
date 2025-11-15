import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase URL from env:', supabaseUrl);
/**
 * Αν έχεις βάλει σωστά τα env, αυτό θα είναι ένα έγκυρο Supabase client.
 * Αν ΔΕΝ έχουν μπει env, θα είναι null και η app σου θα γυρίσει σε mock mode.
 */
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
