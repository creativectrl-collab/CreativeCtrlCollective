import { Link, Outlet, useLocation } from 'react-router-dom'
import { AdminGuard } from '../../../components/admin/AdminGuard'

export function DashboardLayout() {
  const location = useLocation()
  const isDashboardHome = location.pathname === '/admin/dashboard'
  
  return (
    <AdminGuard>
      <div className="mx-auto max-w-6xl px-6 py-12 md:px-10">
        <header className="mb-8 flex items-center justify-between border-b border-line pb-4">
          <div className="flex items-center gap-4">
            <Link to="/admin/dashboard" className="font-display text-lg font-bold text-paper hover:text-signal transition-colors">
              Creative CTRL Collective
            </Link>
            <span className="font-mono text-xs uppercase text-mute border-l border-line pl-4">Admin Hub</span>
          </div>

          {!isDashboardHome && (
            <Link 
              to="/admin/dashboard" 
              className="font-mono text-xs uppercase text-signal hover:text-paper transition-colors flex items-center gap-1.5"
            >
              ← Back to Dashboard
            </Link>
          )}
        </header>
        <main>
          <Outlet />
        </main>
      </div>
    </AdminGuard>
  )
}
