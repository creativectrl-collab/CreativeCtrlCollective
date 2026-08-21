import { supabase } from './supabase'

export type AdminGate = 'login' | 'home' | 'setup' | 'challenge' | 'dashboard'

export const adminGatePath: Record<AdminGate, string> = {
  login: '/admin',
  home: '/',
  setup: '/admin/mfa-setup',
  challenge: '/admin/mfa',
  dashboard: '/admin/dashboard',
}

export async function isTeamAdmin(email: string | undefined) {
  if (!email) return false
  const { data: profile } = await supabase
    .from('team_profiles')
    .select('is_admin')
    .ilike('email', email)
    .single()
  return !!profile?.is_admin
}

/** Where an admin session should go: enroll TOTP, challenge, or dashboard. */
export async function resolveAdminGate(): Promise<AdminGate> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return 'login'
  if (!(await isTeamAdmin(user.email))) return 'home'

  const { data: aal, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
  if (error || !aal) return 'login'
  if (aal.currentLevel === 'aal2') return 'dashboard'
  if (aal.nextLevel === 'aal2') return 'challenge'
  return 'setup'
}
