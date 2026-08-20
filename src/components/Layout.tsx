import { NavLink, Outlet } from 'react-router-dom'
import { site } from '../content/site'
import { Seo } from './Seo'
import { SiteChrome } from './SiteChrome'

const nav = [
  { to: '/', label: 'Home', end: true },
  { to: '/events', label: 'Events', end: false },
  { to: '/team', label: 'Team', end: false },
  { to: '/#contact', label: 'Contact', end: false },
] as const

export function Layout() {
  return (
    <SiteChrome>
      <Seo />
      <header className="sticky top-0 z-20 border-b border-line bg-void/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4 md:px-10">
          <NavLink to="/" className="flex min-w-0 items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center bg-paper">
              <img src="/media/logo.png" alt="" className="h-7 w-7 object-contain" />
            </span>
            <span className="min-w-0 font-display text-xs font-bold leading-tight tracking-tight text-paper sm:text-sm md:text-base">
              {site.name}
            </span>
          </NavLink>
          <nav className="flex flex-wrap items-center justify-end gap-x-4 gap-y-2">
            {nav.map((item) =>
              item.to.includes('#') ? (
                <a
                  key={item.to}
                  href={item.to}
                  className="font-mono text-kicker uppercase text-mute hover:text-paper"
                >
                  {item.label}
                </a>
              ) : (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `font-mono text-kicker uppercase ${
                      isActive ? 'text-signal' : 'text-mute hover:text-paper'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ),
            )}
          </nav>
        </div>
      </header>
      <Outlet />
      <footer className="border-t border-line px-6 py-8 md:px-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-kicker uppercase text-mute">{site.name}</p>
          <div className="flex flex-wrap gap-4">
            <a
              href={site.instagram}
              className="font-mono text-kicker uppercase text-mute hover:text-signal"
            >
              Instagram
            </a>
            <a
              href={`mailto:${site.email}`}
              className="font-mono text-kicker uppercase text-mute hover:text-signal"
            >
              {site.email}
            </a>
          </div>
        </div>
      </footer>
    </SiteChrome>
  )
}
