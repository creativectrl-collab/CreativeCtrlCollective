import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/** Auth email links must return to this origin, not the dashboard Site URL fallback. */
export function authRedirectTo(path: `/${string}`) {
  return `${window.location.origin}${path}`
}
