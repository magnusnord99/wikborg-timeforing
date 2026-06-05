import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''
const supabaseConfigured = !!supabaseUrl && !!supabaseAnonKey

export const supabase: SupabaseClient = createClient(
  supabaseConfigured ? supabaseUrl : 'https://placeholder.supabase.co',
  supabaseConfigured ? supabaseAnonKey : 'placeholder-anon-key',
)

export function isSupabaseConfigured(): boolean {
  return supabaseConfigured
}
