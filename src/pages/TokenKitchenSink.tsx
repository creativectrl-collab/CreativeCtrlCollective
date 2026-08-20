import { Button } from '../components/Button'
import { MediaGrid, MediaTile } from '../components/MediaGrid'
import { SiteChrome } from '../components/SiteChrome'

const swatches = [
  { name: 'void', className: 'bg-void border border-line' },
  { name: 'surface', className: 'bg-surface' },
  { name: 'raised', className: 'bg-raised' },
  { name: 'line', className: 'bg-line' },
  { name: 'paper', className: 'bg-paper' },
  { name: 'mute', className: 'bg-mute' },
  { name: 'signal', className: 'bg-signal' },
  { name: 'alert', className: 'bg-alert' },
] as const

export function TokenKitchenSink() {
  return (
    <SiteChrome>
      <header className="flex items-end justify-between gap-6 border-b border-line px-6 py-6 md:px-10">
        <div>
          <p className="font-mono text-kicker uppercase text-signal">
            Creative CTRL Collective
          </p>
          <p className="mt-2 font-display text-2xl font-bold tracking-tight md:text-3xl">
            Design tokens
          </p>
        </div>
        <p className="hidden font-mono text-xs text-mute md:block">Slice 2 · kitchen sink</p>
      </header>

      <main className="mx-auto flex w-full min-w-0 max-w-6xl flex-col gap-16 px-6 py-12 md:px-10 md:py-16">
        <section>
          <SectionLabel n="01">Type</SectionLabel>
          <h1 className="mt-6 font-display text-display text-paper">
            <span className="block">Bold grotesque.</span>
            <span className="block text-signal">High impact.</span>
          </h1>
          <p className="mt-6 w-full max-w-2xl text-pretty font-sans text-sm leading-relaxed text-mute md:text-lede">
            Minimalist dark mode for a multi-partner collective: manifesto,
            showcase grids, roster, submissions, and a gated partner portal.
          </p>
          <p className="mt-4 font-mono text-sm text-signal">
            IBM Plex Mono · captions, kickers, data
          </p>
        </section>

        <section>
          <SectionLabel n="02">Color</SectionLabel>
          <div className="mt-6 grid min-w-0 grid-cols-2 gap-px bg-line sm:grid-cols-4">
            {swatches.map((swatch) => (
              <div key={swatch.name} className={`${swatch.className} min-h-28 min-w-0 p-4`}>
                <p
                  className={`font-mono text-xs uppercase tracking-widest ${
                    swatch.name === 'paper' ||
                    swatch.name === 'signal' ||
                    swatch.name === 'mute'
                      ? 'text-void'
                      : 'text-paper'
                  }`}
                >
                  {swatch.name}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <SectionLabel n="03">Controls</SectionLabel>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button>Primary action</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="partner">Partner</Button>
            <Button disabled>Disabled</Button>
          </div>
          <form
            className="mt-8 grid gap-4 md:max-w-lg"
            onSubmit={(event) => event.preventDefault()}
          >
            <label className="flex flex-col gap-2">
              <span className="font-mono text-kicker uppercase text-mute">Name</span>
              <input
                className="border border-line bg-surface px-4 py-3 text-paper outline-none placeholder:text-mute focus:border-signal"
                placeholder="Artist or sponsor"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="font-mono text-kicker uppercase text-mute">Message</span>
              <textarea
                className="min-h-28 border border-line bg-surface px-4 py-3 text-paper outline-none placeholder:text-mute focus:border-signal"
                placeholder="Inquiry"
              />
            </label>
          </form>
        </section>

        <section>
          <SectionLabel n="04">Media grid</SectionLabel>
          <div className="mt-6">
            <MediaGrid>
              <MediaTile kicker="Initiative" title="Amapiano Nights" />
              <MediaTile kicker="Archive" title="Digital drop 01" tone="alert" />
              <MediaTile kicker="Roster" title="Founding partners" tone="paper" />
              <MediaTile kicker="Live" title="Showcase reel" />
            </MediaGrid>
          </div>
        </section>

        <section>
          <SectionLabel n="05">Partner surface</SectionLabel>
          <div className="mt-6 border border-line bg-raised/80 p-6 shadow-glow md:p-8">
            <p className="font-mono text-kicker uppercase text-signal">Gated</p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight">
              Open-book ledger
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-mute md:text-base">
              Governance docs, production schedules, and project ledgers sit on
              raised surfaces. Public pages stay on void.
            </p>
          </div>
        </section>
      </main>
    </SiteChrome>
  )
}

function SectionLabel({ n, children }: { n: string; children: string }) {
  return (
    <p className="font-mono text-kicker uppercase text-mute">
      {n} — {children}
    </p>
  )
}
