import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Seo } from '../components/Seo'
import { supabase } from '../lib/supabase'
import { getThumbnailUrl } from '../lib/imageOptimization'

interface EventItem {
  id: string
  slug: string
  title: string
  date: string
  venue?: string
  note?: string
  image?: string
  images: string[]
  galleryCount: number
}

function EventMediaCarousel({
  images = [],
  eventTitle,
  eventSlug,
  aspectRatio = 'aspect-[16/10]'
}: {
  images?: string[]
  eventTitle: string
  eventSlug: string
  aspectRatio?: string
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const list = images || []

  const handleScroll = () => {
    if (!scrollRef.current) return
    const { scrollLeft, clientWidth } = scrollRef.current
    if (clientWidth > 0) {
      const idx = Math.round(scrollLeft / clientWidth)
      setCurrentIndex(idx)
    }
  }

  const scrollToIndex = (idx: number, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!scrollRef.current) return
    scrollRef.current.scrollTo({
      left: idx * scrollRef.current.clientWidth,
      behavior: 'smooth'
    })
  }

  if (list.length === 0) {
    return (
      <div className={`${aspectRatio} w-full bg-surface/50 border-b border-line flex items-center justify-center text-mute font-mono text-xs`}>
        No image available
      </div>
    )
  }

  return (
    <div className={`relative group/carousel ${aspectRatio} w-full overflow-hidden bg-void select-none border-b border-line`}>
      {/* Scrollable track of images */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex w-full h-full overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-none"
      >
        {list.map((imgUrl, i) => (
          <Link
            key={i}
            to={`/gallery#${eventSlug}`}
            className="shrink-0 w-full h-full snap-start relative flex items-center justify-center cursor-pointer overflow-hidden bg-void"
            title={`View ${eventTitle} in gallery`}
          >
            {/* Ambient blurred backdrop so the container feels filled and atmospheric */}
            <img
              src={getThumbnailUrl(imgUrl)}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover filter blur-2xl opacity-35 scale-125 select-none pointer-events-none"
            />

            {/* Subtle darkening vignette */}
            <div className="absolute inset-0 bg-void/25 pointer-events-none" />

            {/* Main Flyer / Image: 100% visible, uncropped, centered with crisp shadow */}
            <img
              src={getThumbnailUrl(imgUrl)}
              onError={(e) => {
                if (e.currentTarget.src !== imgUrl) e.currentTarget.src = imgUrl
              }}
              alt={`${eventTitle} capture ${i + 1}`}
              loading="lazy"
              decoding="async"
              className="relative z-10 max-h-full max-w-full w-auto h-auto object-contain p-2 group-hover/carousel:scale-[1.02] transition-transform duration-500 drop-shadow-xl"
            />

            {/* Hover overlay hint */}
            <div className="absolute inset-0 z-20 bg-void/40 opacity-0 group-hover/carousel:opacity-100 transition-opacity flex items-center justify-center">
              <span className="font-mono text-[10px] uppercase tracking-widest text-void bg-signal font-bold px-3 py-1.5 rounded shadow-lg">
                View in Gallery ↗
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Multi-image indicators and navigation controls */}
      {list.length > 1 && (
        <>
          {/* Index Counter Pill */}
          <div className="absolute top-2.5 right-2.5 z-10 font-mono text-[9px] bg-void/80 backdrop-blur-xs border border-line text-paper px-2 py-0.5 rounded pointer-events-none">
            {currentIndex + 1} / {list.length}
          </div>

          {/* Desktop Arrow Buttons */}
          <button
            onClick={(e) => scrollToIndex(Math.max(0, currentIndex - 1), e)}
            disabled={currentIndex === 0}
            aria-label="Previous image"
            className="absolute left-2.5 top-1/2 -translate-y-1/2 z-10 font-mono text-xs text-paper bg-void/80 hover:bg-signal hover:text-void border border-line w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity disabled:opacity-0"
          >
            ←
          </button>
          <button
            onClick={(e) => scrollToIndex(Math.min(list.length - 1, currentIndex + 1), e)}
            disabled={currentIndex === list.length - 1}
            aria-label="Next image"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 z-10 font-mono text-xs text-paper bg-void/80 hover:bg-signal hover:text-void border border-line w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity disabled:opacity-0"
          >
            →
          </button>

          {/* Dots Indicator at bottom */}
          <div className="absolute bottom-2.5 inset-x-0 z-10 flex justify-center gap-1 pointer-events-none">
            {list.map((_, dotIdx) => (
              <span
                key={dotIdx}
                className={`h-1.5 rounded-full transition-all ${
                  currentIndex === dotIdx ? 'bg-signal w-3' : 'bg-paper/40 w-1.5'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([])

  useEffect(() => {
    async function fetchEvents() {
      const { data } = await supabase
        .from('posts')
        .select('*, gallery_photos(*)')
        .eq('category', 'Event')
        .eq('is_published', true)
        .order('event_date', { ascending: false })
      
      if (data) {
        setEvents(data.map((e: any) => {
          const rawPhotos = e.gallery_photos ? [...e.gallery_photos] : []
          rawPhotos.sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))
          const galleryUrls = rawPhotos.map((p: any) => p.image_url)
          const allImages = Array.from(new Set([e.cover_image_url, ...galleryUrls].filter(Boolean))) as string[]

          return {
            id: e.id,
            slug: e.slug,
            title: e.title,
            date: new Date(e.event_date).toLocaleDateString(undefined, {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }),
            note: e.content_markdown,
            image: e.cover_image_url,
            images: allImages,
            venue: e.venue_location,
            galleryCount: rawPhotos.length
          }
        }))
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

      {/* Latest Featured Event */}
      {latest && (
        <section className="mt-14">
          <p className="font-mono text-kicker uppercase text-mute">Latest</p>
          <article className="mt-6 grid gap-8 md:grid-cols-2 items-start border border-line bg-surface/20 rounded overflow-hidden p-6 md:p-8">
            <div className="overflow-hidden rounded border border-line">
              <EventMediaCarousel
                images={latest.images}
                eventTitle={latest.title}
                eventSlug={latest.slug}
                aspectRatio="aspect-[4/5] max-h-[580px]"
              />
            </div>
            <EventCopy 
              kicker="Latest event"
              title={latest.title}
              date={latest.date}
              venue={latest.venue}
              note={latest.note}
              slug={latest.slug}
              galleryCount={latest.galleryCount}
            />
          </article>
        </section>
      )}

      {/* Past Events: Independent Carousels without Grey Grid Leakage */}
      {past.length > 0 && (
        <section className="mt-20">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <p className="font-mono text-kicker uppercase text-mute">Past events</p>
            <span className="font-mono text-[10px] uppercase text-signal">
              {past.length} archived {past.length === 1 ? 'event' : 'events'}
            </span>
          </div>

          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-2">
            {past.map((event) => (
              <article
                key={event.slug}
                className="border border-line bg-surface/25 hover:border-signal/50 rounded overflow-hidden flex flex-col justify-between transition-colors shadow-sm"
              >
                <div>
                  {/* Independent Event Media Carousel */}
                  <EventMediaCarousel
                    images={event.images}
                    eventTitle={event.title}
                    eventSlug={event.slug}
                    aspectRatio="aspect-square sm:aspect-[4/3]"
                  />

                  {/* Event Details */}
                  <div className="p-6">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-mono text-kicker uppercase text-signal">Past event</p>
                      {event.galleryCount > 0 && (
                        <span className="font-mono text-[9px] uppercase bg-signal/10 border border-signal/30 text-signal px-2 py-0.5 rounded">
                          {event.galleryCount} {event.galleryCount === 1 ? 'capture' : 'captures'}
                        </span>
                      )}
                    </div>
                    
                    <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-paper">
                      {event.title}
                    </h2>
                    <p className="mt-2 text-sm text-mute">{event.date}</p>
                    {event.venue && <p className="text-sm text-mute mt-0.5">{event.venue}</p>}
                    {event.note && <p className="mt-3 text-sm text-paper leading-relaxed">{event.note}</p>}
                  </div>
                </div>

                {/* Bottom Action Card Footer */}
                <div className="px-6 pb-6 pt-0">
                  <Link
                    to={`/gallery#${event.slug}`}
                    className="inline-flex items-center justify-between font-mono text-[11px] uppercase tracking-wider text-signal hover:text-paper border-t border-line/40 pt-4 w-full group/link transition-colors"
                  >
                    <span>
                      {event.galleryCount > 0
                        ? `Explore Gallery (${event.galleryCount} captures)`
                        : 'View in Visual Gallery'}
                    </span>
                    <span className="group-hover/link:translate-x-1 transition-transform">→</span>
                  </Link>
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
  slug,
  galleryCount,
}: {
  kicker: string
  title: string
  date: string
  venue?: string
  note?: string
  slug?: string
  galleryCount?: number
}) {
  return (
    <div className="flex flex-col justify-between h-full">
      <div>
        <p className="font-mono text-kicker uppercase text-signal">{kicker}</p>
        <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold tracking-tight text-paper">{title}</h2>
        <p className="mt-3 text-mute">{date}</p>
        {venue && <p className="text-mute mt-0.5">{venue}</p>}
        {note && <p className="mt-4 text-pretty text-paper leading-relaxed">{note}</p>}
      </div>

      <div className="mt-8">
        <Link
          to={`/gallery#${slug}`}
          className="font-mono text-xs uppercase tracking-wider bg-signal text-void hover:bg-void hover:text-signal border border-signal px-5 py-3 rounded transition-colors inline-flex items-center gap-2 font-bold shadow-md"
        >
          <span>Explore Event Gallery</span>
          {galleryCount && galleryCount > 0 ? (
            <span>({galleryCount} captures)</span>
          ) : null}
          <span>→</span>
        </Link>
      </div>
    </div>
  )
}
