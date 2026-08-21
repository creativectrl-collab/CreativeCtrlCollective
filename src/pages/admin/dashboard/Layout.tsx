import { Link, Outlet, useLocation } from 'react-router-dom'
import { AdminGuard } from '../../../components/admin/AdminGuard'

const tabs = [
  { to: '/admin/dashboard/events', label: 'Events & Showcases' },
  { to: '/admin/dashboard/blog', label: 'Dispatches & Blog' },
  { to: '/admin/dashboard/broadcasts', label: 'Community Broadcasts' },
]

export function DashboardLayout() {
  const location = useLocation()
  
  return (
    <AdminGuard>
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-6 lg:px-10">
        <header className="mb-12">
          <div className="flex flex-col-reverse gap-4 mb-8 sm:flex-row sm:justify-between sm:items-center">
            <h1 className="font-display text-3xl text-paper">Admin Dashboard</h1>
            <Link to="/" className="font-mono text-sm uppercase text-signal hover:text-paper sm:ml-auto">
              ← Return to Site
            </Link>
          </div>
          <nav className="flex gap-4 border-b border-line pb-4">
            {tabs.map(tab => (
              <Link 
                key={tab.to} 
                to={tab.to}
                className={`font-mono text-sm uppercase ${location.pathname === tab.to ? 'text-signal' : 'text-mute hover:text-paper'}`}
              >
                {tab.label}
              </Link>
            ))}
          </nav>
        </header>
        <Outlet />
      </div>
    </AdminGuard>
  )
}
