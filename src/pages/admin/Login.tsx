import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authRedirectTo, isExistingAuthAccount, supabase } from '../../lib/supabase'
import { Button } from '../../components/Button'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [existingAccount, setExistingAccount] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const navigate = useNavigate()
  const resetPath = email
    ? `/admin/reset-password?email=${encodeURIComponent(email)}`
    : '/admin/reset-password'

  useEffect(() => {
    async function routeIfAdmin() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) return

      const { data: profile } = await supabase
        .from('team_profiles')
        .select('is_admin')
        .ilike('email', user.email)
        .single()

      if (profile?.is_admin) {
        navigate('/admin/dashboard')
      }
    }

    void routeIfAdmin()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        void routeIfAdmin()
      }
    })
    return () => subscription.unsubscribe()
  }, [navigate])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setNotice(null)
    setExistingAccount(false)

    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: authRedirectTo('/admin'),
        },
      })
      if (isExistingAuthAccount(error, data.user)) {
        setIsSignUp(false)
        setExistingAccount(true)
      } else if (error) {
        setError(error.message)
      } else {
        setNotice('Check your email for confirmation. Click the link to finish signing in.')
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) setError(error.message)
      else navigate('/admin/dashboard')
    }
    setLoading(false)
  }

  return (
    <div className="mx-auto max-w-sm px-6 py-16">
      <h1 className="font-display text-2xl text-paper mb-6">
        {isSignUp ? 'Admin Sign Up' : 'Admin Login'}
      </h1>
      <form onSubmit={handleSubmit} className="grid gap-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-line bg-surface p-3 text-paper outline-none focus:border-signal"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-line bg-surface p-3 text-paper outline-none focus:border-signal"
          required
        />
        <Button type="submit" disabled={loading}>
          {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Login'}
        </Button>
        {!isSignUp && (
          <Link to={resetPath} className="text-mute text-sm hover:text-paper text-left">
            Forgot password?
          </Link>
        )}
        <button
          type="button"
          onClick={() => {
            setIsSignUp(!isSignUp)
            setError(null)
            setNotice(null)
            setExistingAccount(false)
          }}
          className="text-mute text-sm hover:text-paper"
        >
          {isSignUp ? 'Already have an account? Login' : 'Need an account? Sign Up'}
        </button>
        {existingAccount && (
          <p className="text-signal text-sm">
            An account already exists for this email. Sign in, or{' '}
            <Link to={resetPath} className="underline hover:text-paper">
              reset your password
            </Link>{' '}
            if you forgot it.
          </p>
        )}
        {notice && <p className="text-signal text-sm">{notice}</p>}
        {error && <p className="text-alert text-sm">{error}</p>}
      </form>
      <div className="mt-8 border-t border-line pt-4 text-center">
        <Link to="/" className="font-mono text-xs uppercase text-signal hover:text-paper transition-colors">
          ← Return to Public Site
        </Link>
      </div>
    </div>
  )
}
