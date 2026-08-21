import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { authRedirectTo, supabase } from '../../lib/supabase'
import { Button } from '../../components/Button'

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const [email, setEmail] = useState(() => searchParams.get('email') ?? '')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: authRedirectTo('/admin/profile'),
    })

    if (error) {
      setError(error.message)
    } else {
      setMessage('Password reset instructions sent to your email.')
    }
    setLoading(false)
  }

  return (
    <div className="mx-auto max-w-sm px-6 py-16">
      <h1 className="font-display text-2xl text-paper mb-6">Reset Password</h1>
      <form onSubmit={handleReset} className="grid gap-4">
        <input
          type="email"
          placeholder="Your admin email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-line bg-surface p-3 text-paper outline-none focus:border-signal"
          required
        />
        <Button type="submit" disabled={loading}>
          {loading ? 'Sending...' : 'Send Reset Instructions'}
        </Button>
        {message && <p className="text-signal text-sm">{message}</p>}
        {error && <p className="text-alert text-sm">{error}</p>}
      </form>
      <div className="mt-8 border-t border-line pt-4 text-center">
        <Link to="/admin" className="font-mono text-xs uppercase text-signal hover:text-paper transition-colors">
          ← Back to login
        </Link>
      </div>
    </div>
  )
}
