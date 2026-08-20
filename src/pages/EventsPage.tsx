import { events } from '../content/site'

export function EventsPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16 md:px-10 md:py-20">
      <p className="font-mono text-kicker uppercase text-signal">Archive</p>
      <h1 className="mt-4 font-display text-display text-paper">Events</h1>
      <p className="mt-4 max-w-xl text-mute">
        Dynamic nights, exhibitions, and community sessions — Toronto, Hamilton, and
        wherever the work needs to land.
      </p>

      <section className="mt-14">
        <p className="font-mono text-kicker uppercase text-mute">Latest</p>
        <article className="mt-6 grid gap-8 md:grid-cols-2">
          <img
            src={events.latest.image}
            alt={events.latest.title}
            className="w-full border border-line"
          />
          <EventCopy {...events.latest} />
        </article>
      </section>

      <section className="mt-20">
        <p className="font-mono text-kicker uppercase text-mute">Past events</p>
        <div className="mt-6 grid gap-px bg-line md:grid-cols-3">
          {events.past.map((event) => (
            <article key={event.slug} className="bg-void p-0">
              <img src={event.image} alt={event.title} className="aspect-square w-full object-cover" />
              <div className="border-t border-line p-5">
                <p className="font-mono text-kicker uppercase text-signal">{event.kicker}</p>
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
