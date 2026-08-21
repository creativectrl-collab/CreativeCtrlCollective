import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminGatePath, resolveAdminGate } from '../../lib/adminAuth'

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const [authorized, setAuthorized] = useState<boolean | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    async function checkAuth() {
      const gate = await resolveAdminGate()
      if (gate === 'dashboard') {
        setAuthorized(true)
        return
      }
      navigate(adminGatePath[gate])
    }
    checkAuth()
  }, [navigate])

  if (authorized === null) return <div className="p-16 text-center text-mute font-mono">Verifying...</div>
  return authorized ? <>{children}</> : null
}
