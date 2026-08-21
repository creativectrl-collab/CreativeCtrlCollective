import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Button } from '../../components/Button'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSignUp, setIsSignUp] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Double check if admin
        const { data: profile } = await supabase
          .from('team_profiles')
          .select('is_admin')
          .eq('email', user.email)
          .single()
        
        if (profile?.is_admin) {
          navigate('/admin/dashboard')
        }
      }
    }
    checkUser()
  }, [navigate])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      })
      if (error) setError(error.message)
      else setError('Check your email for confirmation.')
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
        <button
          type="button"
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-mute text-sm hover:text-paper"
        >
          {isSignUp ? 'Already have an account? Login' : 'Need an account? Sign Up'}
        </button>
        {error && <p className="text-alert text-sm">{error}</p>}
      </form>
    </div>
  )
}
