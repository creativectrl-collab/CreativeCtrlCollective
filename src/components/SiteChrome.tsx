import type { ReactNode } from 'react'

export function SiteChrome({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-svh min-w-0 overflow-x-clip bg-void text-paper">
      <div className="ambient-glow" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />
      <div className="relative z-10">{children}</div>
    </div>
  )
}
