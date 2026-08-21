import { createClient, type AuthError, type User } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/** Auth email links must return to this origin, not the dashboard Site URL fallback. */
export function authRedirectTo(path: `/${string}`) {
  return `${window.location.origin}${path}`
}

/** Duplicate signup: explicit error, or obfuscated user (empty identities) when confirm-email is on. */
export function isExistingAuthAccount(error: AuthError | null, user: User | null) {
  const code = error?.code
  if (code === 'user_already_exists' || code === 'email_exists') return true
  const message = (error?.message ?? '').toLowerCase()
  if (message.includes('already registered') || message.includes('already exists')) return true
  return Boolean(user && user.identities && user.identities.length === 0)
}
