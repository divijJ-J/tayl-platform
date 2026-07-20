import { createClient } from '@supabase/supabase-js';

// These come from your Supabase project: Settings > API
// Set them in Vercel: Project Settings > Environment Variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
