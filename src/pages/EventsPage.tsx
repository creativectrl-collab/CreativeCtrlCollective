import { useState, useEffect } from 'react'
import { Seo } from '../components/Seo'
import { supabase } from '../lib/supabase'

export function EventsPage() {
  const [events, setEvents] = useState<any[]>([])

  useEffect(() => {
    async function fetchEvents() {
      const { data } = await supabase
        .from('posts')
        .select('*')
        .eq('category', 'Event')
        .eq('is_published', true)
        .order('event_date', { ascending: false })
      
      if (data) {
        setEvents(data.map(e => ({
          ...e,
          date: new Date(e.event_date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
          note: e.content_markdown,
          image: e.cover_image_url,
          venue: e.venue_location
        })))
      }
    }
    fetchEvents()
  }, [])

  const latest = events[0]
  const past = events.slice(1)

  return (
    <main className="mx-auto max-w-6xl px-6 py-16 md:px-10 md:py-20">
      <Seo
        title="Events"
        description="Live cultural events, exhibitions, and community sessions from Creative Ctrl Collective in Toronto and beyond."
        path="/events"
      />
      <p className="font-mono text-kicker uppercase text-signal">Archive</p>
      <h1 className="mt-4 font-display text-display text-paper">Events</h1>
      <p className="mt-4 max-w-xl text-mute">
        Dynamic nights, exhibitions, and community sessions — Toronto, Hamilton, and
        wherever the work needs to land.
      </p>

      {latest && (
        <section className="mt-14">
          <p className="font-mono text-kicker uppercase text-mute">Latest</p>
          <article className="mt-6 grid gap-8 md:grid-cols-2">
            <img
              src={latest.image}
              alt={latest.title}
              className="w-full border border-line"
            />
            <EventCopy 
              kicker="Latest event"
              title={latest.title}
              date={latest.date}
              venue={latest.venue}
              note={latest.note}
            />
          </article>
        </section>
      )}

      {past.length > 0 && (
        <section className="mt-20">
          <p className="font-mono text-kicker uppercase text-mute">Past events</p>
          <div className="mt-6 grid gap-px bg-line md:grid-cols-3">
            {past.map((event) => (
              <article key={event.slug} className="bg-void p-0">
                <img src={event.image} alt={event.title} className="aspect-square w-full object-cover" />
                <div className="border-t border-line p-5">
                  <p className="font-mono text-kicker uppercase text-signal">Past event</p>
                  <h2 className="mt-2 font-display text-2xl font-bold tracking-tight">
                    {event.title}
                  </h2>
                  <p className="mt-2 text-sm text-mute">{event.date}</p>
                  <p className="text-sm text-mute">{event.venue}</p>
                  <p className="mt-3 text-sm text-paper">{event.note}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}

function EventCopy({
  kicker,
  title,
  date,
  venue,
  note,
}: {
  kicker: string
  title: string
  date: string
  venue: string
  note: string
}) {
  return (
    <div>
      <p className="font-mono text-kicker uppercase text-signal">{kicker}</p>
      <h2 className="mt-3 font-display text-4xl font-bold tracking-tight">{title}</h2>
      <p className="mt-3 text-mute">{date}</p>
      <p className="text-mute">{venue}</p>
      <p className="mt-4 max-w-md text-pretty text-paper">{note}</p>
    </div>
  )
}
