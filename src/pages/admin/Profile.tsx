import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Button } from '../../components/Button'

export function AdminProfilePage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleUpdateEmail(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)
    const { error } = await supabase.auth.updateUser({ email })
    if (error) setError(error.message)
    else setMessage('Email update request sent. Check both old and new emails.')
    setLoading(false)
  }

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) setError(error.message)
    else setMessage('Password updated successfully.')
    setLoading(false)
  }

  return (
    <div className="mx-auto max-w-sm px-6 py-16">
      <h1 className="font-display text-2xl text-paper mb-6">Profile Settings</h1>
      
      <form onSubmit={handleUpdateEmail} className="grid gap-4 mb-8">
        <h2 className="text-paper">Update Email</h2>
        <input
          type="email"
          placeholder="New email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-line bg-surface p-3 text-paper outline-none focus:border-signal"
          required
        />
        <Button type="submit" disabled={loading}>Update Email</Button>
      </form>

      <form onSubmit={handleUpdatePassword} className="grid gap-4">
        <h2 className="text-paper">Update Password</h2>
        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-line bg-surface p-3 text-paper outline-none focus:border-signal"
          required
        />
        <Button type="submit" disabled={loading}>Update Password</Button>
      </form>

      {message && <p className="text-signal text-sm mt-4">{message}</p>}
      {error && <p className="text-alert text-sm mt-4">{error}</p>}
    </div>
  )
}
