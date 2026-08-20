import type { ReactNode } from 'react'

export function MediaGrid({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={`grid min-w-0 grid-cols-2 gap-px bg-line md:grid-cols-3 lg:grid-cols-4 ${className}`}
    >
      {children}
    </div>
  )
}

export function PhotoTile({
  src,
  alt,
  kicker,
  title,
}: {
  src: string
  alt: string
  kicker?: string
  title?: string
}) {
  return (
    <article className="group relative aspect-[4/5] min-w-0 overflow-hidden bg-surface">
      <img
        src={src}
        alt={alt}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-void via-void/30 to-transparent" />
      {(kicker || title) && (
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-4 md:p-5">
          {kicker ? (
            <p className="font-mono text-kicker uppercase text-signal">{kicker}</p>
          ) : null}
          {title ? (
            <h3 className="font-display text-lg font-bold tracking-tight text-paper md:text-2xl">
              {title}
            </h3>
          ) : null}
        </div>
      )}
    </article>
  )
}

export function MediaTile({
  kicker,
  title,
  tone = 'signal',
}: {
  kicker: string
  title: string
  tone?: 'signal' | 'alert' | 'paper'
}) {
  const wash =
    tone === 'alert'
      ? 'from-alert/25'
      : tone === 'paper'
        ? 'from-paper/15'
        : 'from-signal/20'

  return (
    <article className="group relative aspect-[4/5] min-w-0 overflow-hidden bg-surface">
      <div
        className={`absolute inset-0 bg-gradient-to-br ${wash} to-transparent transition-transform duration-500 group-hover:scale-105`}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,transparent_0%,var(--color-void)_78%)]" />
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-4 md:p-5">
        <p className="font-mono text-kicker uppercase text-mute">{kicker}</p>
        <h3 className="font-display text-lg font-bold tracking-tight text-pretty text-paper md:text-2xl">
          {title}
        </h3>
      </div>
    </article>
  )
}
