import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../../components/Button'
import { adminGatePath, resolveAdminGate } from '../../lib/adminAuth'
import { supabase } from '../../lib/supabase'

export function MfaSetupPage() {
  const navigate = useNavigate()
  const [factorId, setFactorId] = useState('')
  const [qr, setQr] = useState('')
  const [secret, setSecret] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function start() {
      const gate = await resolveAdminGate()
      if (cancelled) return
      if (gate !== 'setup') {
        navigate(adminGatePath[gate], { replace: true })
        return
      }

      const listed = await supabase.auth.mfa.listFactors()
      if (listed.error) {
        setError(listed.error.message)
        return
      }
      for (const factor of listed.data.all) {
        if (factor.factor_type === 'totp' && factor.status !== 'verified') {
          await supabase.auth.mfa.unenroll({ factorId: factor.id })
        }
      }

      const enrolled = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'Authenticator',
      })
      if (cancelled) return
      if (enrolled.error) {
        setError(
          enrolled.error.message.includes('not enabled') || enrolled.error.message.includes('disabled')
            ? 'TOTP is not enabled on this project. In Supabase: Authentication → Multi-Factor → enable TOTP enroll and verify.'
            : enrolled.error.message,
        )
        return
      }
      setFactorId(enrolled.data.id)
      setQr(enrolled.data.totp.qr_code)
      setSecret(enrolled.data.totp.secret)
    }

    void start()
    return () => {
      cancelled = true
    }
  }, [navigate])

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const challenge = await supabase.auth.mfa.challenge({ factorId })
    if (challenge.error) {
      setError(challenge.error.message)
      setLoading(false)
      return
    }
    const verified = await supabase.auth.mfa.verify({
      factorId,
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
      <h1 className="font-display text-2xl text-paper mb-2">Set up authenticator</h1>
      <p className="text-mute text-sm mb-6">
        Scan this QR code with 1Password, Authy, or Google Authenticator, then enter the 6-digit code. Admin access requires this every login.
      </p>
      {qr && (
        <div className="mb-4 bg-paper p-4">
          <img src={qr} alt="Authenticator QR code" className="mx-auto h-48 w-48" />
        </div>
      )}
      {secret && (
        <p className="font-mono text-xs text-mute break-all mb-4">
          Manual key: {secret}
        </p>
      )}
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
        <Button type="submit" disabled={loading || !factorId}>
          {loading ? 'Verifying...' : 'Enable authenticator'}
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
