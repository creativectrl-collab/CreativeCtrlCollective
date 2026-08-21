import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../../components/Button'
import { adminGatePath, resolveAdminGate } from '../../lib/adminAuth'
import { supabase } from '../../lib/supabase'

export function MfaChallengePage() {
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function gate() {
      const next = await resolveAdminGate()
      if (!cancelled && next !== 'challenge') {
        navigate(adminGatePath[next], { replace: true })
      }
    }
    void gate()
    return () => {
      cancelled = true
    }
  }, [navigate])

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const factors = await supabase.auth.mfa.listFactors()
    if (factors.error) {
      setError(factors.error.message)
      setLoading(false)
      return
    }
    const totp = factors.data.totp[0]
    if (!totp) {
      navigate('/admin/mfa-setup', { replace: true })
      return
    }

    const challenge = await supabase.auth.mfa.challenge({ factorId: totp.id })
    if (challenge.error) {
      setError(challenge.error.message)
      setLoading(false)
      return
    }
    const verified = await supabase.auth.mfa.verify({
      factorId: totp.id,
      challengeId: challenge.data.id,
      code,
    })
    if (verified.error) {
      setError(verified.error.message)
      setLoading(false)
      return
    }
    navigate('/admin/dashboard', { replace: true })
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/admin', { replace: true })
  }

  return (
    <div className="mx-auto max-w-sm px-6 py-16">
      <h1 className="font-display text-2xl text-paper mb-2">Authenticator code</h1>
      <p className="text-mute text-sm mb-6">
        Enter the 6-digit code from your authenticator app to continue.
      </p>
      <form onSubmit={handleVerify} className="grid gap-4">
        <input
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="6-digit code"
          value={code}
          onChange={(e) => setCode(e.target.value.trim())}
          className="border border-line bg-surface p-3 text-paper outline-none focus:border-signal"
          required
          minLength={6}
        />
        <Button type="submit" disabled={loading}>
          {loading ? 'Verifying...' : 'Verify'}
        </Button>
        {error && <p className="text-alert text-sm">{error}</p>}
      </form>
      <div className="mt-8 border-t border-line pt-4 flex flex-col gap-3 text-center">
        <button type="button" onClick={() => void handleSignOut()} className="text-mute text-sm hover:text-paper">
          Sign out
        </button>
        <Link to="/" className="font-mono text-xs uppercase text-signal hover:text-paper transition-colors">
          ← Return to Public Site
        </Link>
      </div>
    </div>
  )
}
