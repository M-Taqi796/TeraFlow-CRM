import { createClient } from '@supabase/supabase-js';

const supabaseUrl     = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Supabase browser client — safe to use in Client Components and Route Handlers.
 * Uses the anon (public) key with Row Level Security enforced on the database.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
