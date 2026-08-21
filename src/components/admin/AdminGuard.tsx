import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const [authorized, setAuthorized] = useState<boolean | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) {
        navigate('/admin')
        return
      }

      const { data: profile } = await supabase
        .from('team_profiles')
        .select('is_admin')
        .ilike('email', user.email)
        .single()

      if (profile?.is_admin) {
        setAuthorized(true)
      } else {
        navigate('/')
      }
    }
    checkAuth()
  }, [navigate])

  if (authorized === null) return <div className="p-16 text-center text-mute font-mono">Verifying...</div>
  return authorized ? <>{children}</> : null
}
