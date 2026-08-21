import { Link, Outlet, useLocation } from 'react-router-dom'
import { AdminGuard } from '../../../components/admin/AdminGuard'

export function DashboardLayout() {
  const location = useLocation()
  const isDashboardHome = location.pathname === '/admin/dashboard'
  
  return (
    <AdminGuard>
      <div className="mx-auto max-w-6xl px-6 py-12 md:px-10">
        <header className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-line pb-4">
          <div className="flex items-center justify-between sm:justify-start gap-4">
            <Link to="/admin/dashboard" className="font-display text-base sm:text-lg font-bold text-paper hover:text-signal transition-colors">
              Creative CTRL Collective
            </Link>
            <span className="font-mono text-[10px] sm:text-xs uppercase text-mute border-l border-line pl-3 sm:pl-4">Admin Hub</span>
          </div>

          <div className="flex items-center gap-4 font-mono text-[10px] sm:text-xs uppercase justify-end">
            {!isDashboardHome && (
              <Link 
                to="/admin/dashboard" 
                className="text-signal hover:text-paper transition-colors"
              >
                ← Back
              </Link>
            )}
            <Link 
              to="/" 
              className="text-paper hover:text-signal transition-colors"
            >
              Public Site →
            </Link>
          </div>
        </header>
        <main>
          <Outlet />
        </main>
      </div>
    </AdminGuard>
  )
}
