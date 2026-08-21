import { Link } from 'react-router-dom'
import { controlClass } from '../components/control'
import { ContactForm } from '../components/ContactForm'
import { MediaGrid, PhotoTile } from '../components/MediaGrid'
import { events, scenes, site } from '../content/site'

const randomScene = scenes[Math.floor(Math.random() * scenes.length)]

export function HomePage() {
  return (
    <main>
      <section className="mx-auto max-w-6xl px-6 py-16 md:px-10 md:py-24">
        <p className="font-mono text-kicker uppercase text-signal">Collective</p>
        <h1 className="mt-5 font-display text-display text-paper">
          <span className="block">Arts and music,</span>
          <span className="block text-signal">made together.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-pretty font-sans text-sm leading-relaxed text-mute md:text-lede">
          {site.mission}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link to="/events" className={controlClass('primary')}>
            Events
          </Link>
          <Link to="/team" className={controlClass('ghost')}>
            Meet the team
          </Link>
        </div>
      </section>

      <section className="border-y border-line">
        <div className="mx-auto grid max-w-6xl gap-px bg-line md:grid-cols-4">
          {site.objectives.map((item) => (
            <p
              key={item}
              className="bg-void px-6 py-5 font-mono text-kicker uppercase text-paper md:px-8"
            >
              {item}
            </p>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 md:px-10">
        <p className="font-mono text-kicker uppercase text-mute">01 — Latest</p>
        <div className="mt-6 flex flex-col items-start gap-8 md:flex-row">
          <img
            src={events.latest.image}
            alt={events.latest.title}
            className="w-full border border-line bg-surface md:w-1/2"
          />
          <div>
            <p className="font-mono text-kicker uppercase text-signal">
              {events.latest.kicker}
            </p>
            <h2 className="mt-3 font-display text-4xl font-bold tracking-tight">
              {events.latest.title}
            </h2>
            <p className="mt-3 text-mute">{events.latest.date}</p>
            <p className="mt-1 text-mute">{events.latest.venue}</p>
            <p className="mt-4 max-w-md text-pretty text-paper">{events.latest.note}</p>
            <Link to="/events" className={`${controlClass('ghost')} mt-6`}>
              All events
            </Link>
          </div>
        </div>
      </section>

      <section className="pb-16">
        <div className="mx-auto max-w-6xl px-6 md:px-10">
          <p className="mb-6 font-mono text-kicker uppercase text-mute">
            02 — Event Gallery
          </p>
        </div>
        <MediaGrid>
          <Link to="/events" className="col-span-2 md:col-span-1">
             <img 
               src={randomScene} 
               alt="Gallery Spotlight"
               className="w-full h-full object-cover border border-line"
             />
          </Link>
          {scenes.map((src, index) => (
            <PhotoTile
              key={src}
              src={src}
              alt={`Creative CTRL event scene ${index + 1}`}
            />
          ))}
        </MediaGrid>
      </section>

      <section id="contact" className="border-t border-line px-6 py-16 md:px-10">
        <div className="mx-auto max-w-6xl">
          <p className="font-mono text-kicker uppercase text-mute">03 — Contact</p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight">
            We are just an email away.
          </h2>
          <p className="mt-3 max-w-xl text-mute">
            Artists, collaborators, and sponsors — write us. Inbound lands at{' '}
            <a href={`mailto:${site.email}`} className="text-signal">
              {site.email}
            </a>
            .
          </p>
          <div className="mt-8">
            <ContactForm />
          </div>
        </div>
      </section>
    </main>
  )
}
