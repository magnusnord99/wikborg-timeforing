import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''
const hasSupabaseConfig = !!supabaseUrl && !!supabaseAnonKey

export const supabase: SupabaseClient = createClient(
  hasSupabaseConfig ? supabaseUrl : 'http://localhost',
  hasSupabaseConfig ? supabaseAnonKey : 'missing-anon-key',
)

export function isSupabaseConfigured(): boolean {
  return hasSupabaseConfig
}
