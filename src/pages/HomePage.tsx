import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { controlClass } from '../components/control'
import { ContactForm } from '../components/ContactForm'
import { events, site } from '../content/site'
import { supabase } from '../lib/supabase'

function ArtifactFrame() {
  const [photo, setPhoto] = useState<{ url: string; title: string; date?: string; caption?: string } | null>(null)
  const [fade, setFade] = useState(false)

  useEffect(() => {
    async function fetchRandomVisual() {
      try {
        const { data, error } = await supabase
          .from('gallery_photos')
          .select('image_url, caption, posts(title, event_date)')
        
        if (error) throw error

        if (data && data.length > 0) {
          const randomItem = data[Math.floor(Math.random() * data.length)]
          const post = randomItem.posts as any
          setPhoto({
            url: randomItem.image_url,
            title: post?.title || 'Creative CTRL Capture',
            date: post?.event_date ? new Date(post.event_date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : undefined,
            caption: randomItem.caption
          })
        } else {
          // Fallback to static scenes
          const fallbackScenes = [
            'https://xzfdmrjxwkcxdcbqvwbd.supabase.co/storage/v1/object/public/public-media/scenes/01.jpg',
            'https://xzfdmrjxwkcxdcbqvwbd.supabase.co/storage/v1/object/public/public-media/scenes/02.jpg',
            'https://xzfdmrjxwkcxdcbqvwbd.supabase.co/storage/v1/object/public/public-media/scenes/03.jpg',
            'https://xzfdmrjxwkcxdcbqvwbd.supabase.co/storage/v1/object/public/public-media/scenes/04.jpg',
            'https://xzfdmrjxwkcxdcbqvwbd.supabase.co/storage/v1/object/public/public-media/scenes/05.jpg',
            'https://xzfdmrjxwkcxdcbqvwbd.supabase.co/storage/v1/object/public/public-media/scenes/06.jpg',
          ]
          const randomFallback = fallbackScenes[Math.floor(Math.random() * fallbackScenes.length)]
          setPhoto({
            url: randomFallback,
            title: 'Creative CTRL Scene',
            caption: 'Archived capture from past session.'
          })
        }
        
        setTimeout(() => setFade(true), 50)
      } catch (err) {
        console.error('Failed to fetch visual archive:', err)
      }
    }

    fetchRandomVisual()
  }, [])

  if (!photo) return <div className="h-96 w-full max-w-4xl mx-auto bg-surface border border-line animate-pulse rounded"></div>

  return (
    <div className={`overflow-hidden border border-line bg-surface rounded transition-opacity duration-700 max-w-4xl mx-auto ${fade ? 'opacity-100' : 'opacity-0'}`}>
      <img 
        src={photo.url} 
        alt={photo.title}
        loading="lazy"
        className="w-full object-cover max-h-[500px]"
      />
      {/* Information badge cleanly below the visual */}
      <div className="bg-surface p-4 md:p-6 border-t border-line flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="font-mono text-[9px] text-signal uppercase tracking-widest font-bold">Featured Capture</span>
          <h3 className="font-display text-base md:text-lg font-bold text-paper mt-1">{photo.title}</h3>
          {photo.date && <p className="font-mono text-[9px] text-mute uppercase mt-0.5">{photo.date}</p>}
          {photo.caption && <p className="text-xs text-mute mt-1.5 line-clamp-2">{photo.caption}</p>}
        </div>
        <Link 
          to="/gallery" 
          className="font-mono text-xs uppercase tracking-wider bg-signal text-void font-bold px-4 py-2 border border-signal hover:bg-void hover:text-signal transition-colors text-center shrink-0 rounded"
        >
          View Full Gallery →
        </Link>
      </div>
    </div>
  )
}

export function HomePage() {
  return (
    <main>
      <section className="mx-auto max-w-6xl px-4 py-12 md:px-6 lg:px-10 md:py-24">
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
              className="bg-void px-4 py-5 font-mono text-kicker uppercase text-paper md:px-8"
            >
              {item}
            </p>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 md:px-6 lg:px-10">
        <p className="font-mono text-kicker uppercase text-mute">Latest</p>
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

      <section className="pb-16 px-4 md:px-6 lg:px-10">
        <div className="mx-auto max-w-6xl mb-6">
          <p className="font-mono text-kicker uppercase text-mute">
            Event Gallery
          </p>
        </div>
        <ArtifactFrame />
      </section>

      <section id="contact" className="border-t border-line px-4 py-12 md:px-6 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <p className="font-mono text-kicker uppercase text-mute">Contact</p>
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
