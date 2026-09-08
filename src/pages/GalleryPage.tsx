import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { Seo } from '../components/Seo'
import { getThumbnailUrl } from '../lib/imageOptimization'

interface Photo {
  id: string
  image_url: string
  caption?: string
  photographer_credit?: string
  display_order: number
}

interface EventWithPhotos {
  id: string
  title: string
  slug: string
  event_date: string
  venue_location?: string
  gallery_photos: Photo[]
}

function EventGalleryRow({
  event,
  onSelectPhoto,
}: {
  event: EventWithPhotos
  onSelectPhoto: (photo: Photo, allPhotos: Photo[]) => void
}) {
  const rowRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [copied, setCopied] = useState(false)

  const checkScroll = useCallback(() => {
    if (!rowRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = rowRef.current
    setCanScrollLeft(scrollLeft > 10)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
  }, [])

  useEffect(() => {
    checkScroll()
    const el = rowRef.current
    if (el) {
      el.addEventListener('scroll', checkScroll, { passive: true })
      window.addEventListener('resize', checkScroll)
      return () => {
        el.removeEventListener('scroll', checkScroll)
        window.removeEventListener('resize', checkScroll)
      }
    }
  }, [checkScroll, event.gallery_photos])

  const scroll = (direction: 'left' | 'right') => {
    if (!rowRef.current) return
    const scrollAmount = rowRef.current.clientWidth * 0.75
    rowRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    })
  }

  const handleCopyLink = () => {
    const url = `${window.location.origin}/gallery#${event.slug}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section id={event.slug} className="grid gap-4 scroll-mt-28">
      {/* Event Header with Navigation Controls */}
      <div className="border-b border-line pb-3 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-paper">{event.title}</h2>
            <span className="font-mono text-[10px] uppercase text-signal bg-signal/10 border border-signal/30 px-2 py-0.5 rounded">
              {event.gallery_photos.length} {event.gallery_photos.length === 1 ? 'capture' : 'captures'}
            </span>
          </div>
          {event.venue_location && (
            <p className="font-mono text-[10px] text-mute uppercase tracking-widest mt-1">
              {event.venue_location}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="font-mono text-[10px] uppercase text-mute">
            {new Date(event.event_date).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </span>

          {/* Action: Open Full Event Gallery Directly */}
          <button
            onClick={() => onSelectPhoto(event.gallery_photos[0], event.gallery_photos)}
            className="font-mono text-[10px] uppercase tracking-wider bg-surface hover:bg-signal hover:text-void border border-line text-paper px-3 py-1 rounded transition-colors font-semibold flex items-center gap-1.5 shrink-0"
            title="Open fullscreen gallery for this event"
          >
            <span>Open Gallery</span>
            <span className="text-signal hover:text-inherit">({event.gallery_photos.length})</span>
            <span>↗</span>
          </button>

          {/* Share / Direct Link button */}
          <button
            onClick={handleCopyLink}
            className="font-mono text-[10px] uppercase text-mute hover:text-signal border border-line hover:border-signal px-2 py-1 rounded transition-colors"
            title="Copy link to this event gallery"
          >
            {copied ? 'Link Copied!' : 'Share #'}
          </button>

          {/* Desktop Carousel Arrow Controls */}
          <div className="hidden sm:flex items-center gap-1">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              aria-label="Previous photos"
              className="font-mono text-xs border border-line hover:border-signal hover:text-signal text-paper px-2.5 py-1 rounded transition-colors disabled:opacity-20 disabled:hover:border-line disabled:hover:text-paper"
            >
              ←
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              aria-label="Next photos"
              className="font-mono text-xs border border-line hover:border-signal hover:text-signal text-paper px-2.5 py-1 rounded transition-colors disabled:opacity-20 disabled:hover:border-line disabled:hover:text-paper"
            >
              →
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Swipe Carousel Row (Uniform Dimensions) */}
      <div
        ref={rowRef}
        className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-none pb-2 pt-1 -mx-2 px-2 select-none"
      >
        {event.gallery_photos.map((photo, idx) => (
          <div
            key={photo.id}
            onClick={() => onSelectPhoto(photo, event.gallery_photos)}
            className="shrink-0 snap-start w-64 sm:w-80 aspect-[16/10] relative overflow-hidden rounded border border-line hover:border-signal transition-all duration-300 cursor-pointer bg-surface group/item"
          >
            <img
              src={getThumbnailUrl(photo.image_url)}
              onError={(e) => {
                if (e.currentTarget.src !== photo.image_url) {
                  e.currentTarget.src = photo.image_url
                }
              }}
              alt={photo.caption || `${event.title} capture ${idx + 1}`}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-500"
            />

            {/* Index Pill */}
            <div className="absolute top-2 left-2 font-mono text-[9px] bg-void/80 backdrop-blur-xs border border-line text-mute px-1.5 py-0.5 rounded">
              {(idx + 1).toString().padStart(2, '0')}
            </div>

            {/* Hover Caption Info */}
            {(photo.caption || photo.photographer_credit) && (
              <div className="absolute inset-x-0 bottom-0 bg-void/90 backdrop-blur-xs border-t border-line p-2.5 translate-y-full group-hover/item:translate-y-0 transition-transform duration-200 font-mono text-[9px] text-paper">
                {photo.caption && <p className="line-clamp-2">{photo.caption}</p>}
                {photo.photographer_credit && (
                  <p className="text-signal mt-1 uppercase tracking-wider">
                    Credit: {photo.photographer_credit}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}

        {/* End Card: Direct Navigation to Full Gallery Roll */}
        <div
          onClick={() => onSelectPhoto(event.gallery_photos[0], event.gallery_photos)}
          className="shrink-0 snap-start w-52 sm:w-64 aspect-[16/10] relative flex flex-col items-center justify-center p-6 rounded border border-dashed border-line hover:border-signal text-center cursor-pointer bg-surface/30 hover:bg-surface/80 transition-all group/end select-none"
        >
          <div className="w-9 h-9 rounded-full border border-signal/40 bg-signal/10 flex items-center justify-center text-signal text-xs font-mono mb-2 group-hover/end:scale-110 group-hover/end:bg-signal group-hover/end:text-void transition-all">
            ↗
          </div>
          <span className="font-display text-sm font-bold text-paper group-hover/end:text-signal transition-colors">
            View All {event.gallery_photos.length} Captures
          </span>
          <span className="font-mono text-[9px] uppercase tracking-wider text-mute mt-1">
            Open Fullscreen Roll →
          </span>
        </div>
      </div>
    </section>
  )
}

export function GalleryPage() {
  const [events, setEvents] = useState<EventWithPhotos[]>([])
  const [selectedTag, setSelectedTag] = useState('All Captures')
  const [loading, setLoading] = useState(true)

  // Lightbox State
  const [activePhoto, setActivePhoto] = useState<Photo | null>(null)
  const [activeEventPhotos, setActiveEventPhotos] = useState<Photo[]>([])
  const [isFullImageLoaded, setIsFullImageLoaded] = useState(false)

  useEffect(() => {
    async function loadGalleryData() {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('id, title, slug, event_date, venue_location, gallery_photos(*)')
          .eq('category', 'Event')
          .order('event_date', { ascending: false })

        if (error) throw error

        // Sort sub-photos locally by display_order
        const processed = (data || []).map((e: any) => {
          const photos = e.gallery_photos ? [...e.gallery_photos] : []
          photos.sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
          return { ...e, gallery_photos: photos }
        }).filter(e => e.gallery_photos.length > 0)

        setEvents(processed)
      } catch (err) {
        console.error('Error loading gallery photos:', err)
      } finally {
        setLoading(false)
      }
    }

    loadGalleryData()
  }, [])

  // Auto-scroll to event hash if present in URL (e.g. /gallery#amapiano-nights)
  useEffect(() => {
    if (!loading && window.location.hash) {
      const hashId = window.location.hash.replace('#', '')
      const el = document.getElementById(hashId)
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 150)
      }
    }
  }, [loading])

  // Create tag list (All + unique years sorted descending)
  const tags = useMemo(() => {
    const years = events.map(e => new Date(e.event_date).getFullYear().toString())
    const uniqueYears = Array.from(new Set(years)).sort((a, b) => b.localeCompare(a))
    return ['All Captures', ...uniqueYears]
  }, [events])

  // Filter events based on selected tag (Year or All)
  const filteredEvents = useMemo(() => {
    if (selectedTag === 'All Captures') return events
    return events.filter(e => new Date(e.event_date).getFullYear().toString() === selectedTag)
  }, [events, selectedTag])

  // Open Lightbox handler
  const handleSelectPhoto = useCallback((photo: Photo, allPhotos: Photo[]) => {
    setIsFullImageLoaded(false)
    setActivePhoto(photo)
    setActiveEventPhotos(allPhotos)
  }, [])

  // Lightbox Navigation
  const activeIndex = useMemo(() => {
    if (!activePhoto) return -1
    return activeEventPhotos.findIndex(p => p.id === activePhoto.id)
  }, [activePhoto, activeEventPhotos])

  const handlePrev = useCallback(() => {
    if (activeIndex > 0) {
      setIsFullImageLoaded(false)
      setActivePhoto(activeEventPhotos[activeIndex - 1])
    }
  }, [activeIndex, activeEventPhotos])

  const handleNext = useCallback(() => {
    if (activeIndex < activeEventPhotos.length - 1) {
      setIsFullImageLoaded(false)
      setActivePhoto(activeEventPhotos[activeIndex + 1])
    }
  }, [activeIndex, activeEventPhotos])

  // Keyboard navigation for Lightbox
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!activePhoto) return
      if (e.key === 'ArrowLeft') handlePrev()
      if (e.key === 'ArrowRight') handleNext()
      if (e.key === 'Escape') setActivePhoto(null)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activePhoto, handlePrev, handleNext])

  // Touch Swipe navigation for Mobile Lightbox
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX
    touchEndX.current = e.targetTouches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX
  }

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current
    if (diff > 45) handleNext()    // Swiped left -> next
    if (diff < -45) handlePrev()   // Swiped right -> prev
  }

  // Handle image download
  async function downloadImage(url: string, filename: string) {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = filename || 'creative-ctrl-capture.jpg'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(blobUrl)
    } catch (err) {
      console.error('Failed to download image:', err)
      window.open(url, '_blank')
    }
  }

  // Handle share
  function shareImage(url: string) {
    if (navigator.share) {
      navigator.share({
        title: 'Creative CTRL Collective Capture',
        url: url
      }).catch(console.error)
    } else {
      navigator.clipboard.writeText(url)
      alert('Link copied to clipboard!')
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-16 md:px-10 md:py-20">
      <Seo 
        title="Visual Archives"
        description="Explore visual history, event roll captures, and editorial community galleries from Creative Ctrl Collective."
        path="/gallery"
      />

      <p className="font-mono text-kicker uppercase text-signal">Archive</p>
      <h1 className="mt-4 font-display text-display text-paper">Visual Roll</h1>
      <p className="mt-4 max-w-xl text-mute">
        Live captures, gallery drops, and documentation rolls mapping events across the creative scene.
      </p>

      {/* Horizontal Scrollable Filter Text Row (Timeline Style) */}
      <div className="mt-10 overflow-x-auto scrollbar-none border-b border-line pb-4 flex items-center gap-6 w-full font-mono text-xs uppercase tracking-widest select-none">
        {tags.map((tag, idx) => (
          <span key={tag} className="flex items-center gap-6 shrink-0">
            {idx > 0 && <span className="text-mute/30">/</span>}
            <button
              onClick={() => setSelectedTag(tag)}
              className={`transition-colors whitespace-nowrap pb-1 border-b-2 ${
                selectedTag === tag
                  ? 'text-signal border-signal font-bold'
                  : 'text-mute border-transparent hover:text-paper'
              }`}
            >
              {tag}
            </button>
          </span>
        ))}
      </div>

      {loading ? (
        <div className="mt-16 flex items-center justify-center font-mono text-xs text-signal animate-pulse">
          Loading archive roll...
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="mt-16 text-center font-mono text-xs text-mute italic">
          No captures uploaded yet. Check back soon.
        </div>
      ) : (
        <div className="grid gap-16 mt-12">
          {filteredEvents.map((event) => (
            <EventGalleryRow
              key={event.id}
              event={event}
              onSelectPhoto={handleSelectPhoto}
            />
          ))}
        </div>
      )}

      {/* Fullscreen Lightbox / Carousel Modal with Natural Dimensions & Touch Swipe */}
      {activePhoto && (
        <div 
          className="fixed inset-0 z-[100] flex flex-col justify-between bg-void/95 backdrop-blur-md p-4 select-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Top Actions */}
          <div className="flex items-center justify-between border-b border-line pb-3">
            <span className="font-mono text-[10px] text-mute uppercase tracking-widest">
              Capture {activeIndex + 1} / {activeEventPhotos.length}
            </span>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => downloadImage(activePhoto.image_url, `creativectrl-${activePhoto.id}.jpg`)}
                className="font-mono text-[10px] uppercase text-paper hover:text-signal transition-colors border border-line px-3 py-1 rounded"
              >
                Download
              </button>
              <button 
                onClick={() => shareImage(activePhoto.image_url)}
                className="font-mono text-[10px] uppercase text-paper hover:text-signal transition-colors border border-line px-3 py-1 rounded"
              >
                Share
              </button>
              <button 
                onClick={() => setActivePhoto(null)}
                className="font-mono text-[10px] uppercase text-signal font-bold hover:text-paper transition-colors px-3 py-1"
              >
                ✕ Close
              </button>
            </div>
          </div>

          {/* Main Visual: Original Aspect-Ratio Preservation with Touch-Swipe */}
          <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden">
            {/* Prev Trigger */}
            <button 
              onClick={handlePrev}
              disabled={activeIndex === 0}
              aria-label="Previous capture"
              className="absolute left-2 sm:left-4 z-20 font-mono text-xl text-paper hover:text-signal bg-void/60 hover:bg-void/90 border border-line p-3 sm:p-4 rounded-full disabled:opacity-10 transition-all"
            >
              ←
            </button>

            {/* Image Container with Original Dimensions */}
            <div className="relative flex items-center justify-center max-h-[75vh] max-w-[88vw]">
              {/* Progressive Thumbnail placeholder while full loads */}
              {!isFullImageLoaded && (
                <img
                  src={getThumbnailUrl(activePhoto.image_url)}
                  alt=""
                  aria-hidden="true"
                  className="max-h-[75vh] max-w-[88vw] w-auto h-auto object-contain rounded filter blur-xs"
                />
              )}

              {/* Full High-Resolution Image (Natural Dimensions) */}
              <img 
                src={activePhoto.image_url} 
                alt={activePhoto.caption || 'Lightbox capture'} 
                onLoad={() => setIsFullImageLoaded(true)}
                className={`max-h-[75vh] max-w-[88vw] w-auto h-auto object-contain border border-line rounded shadow-2xl transition-opacity duration-300 ${
                  isFullImageLoaded ? 'opacity-100' : 'opacity-0 absolute inset-0 m-auto'
                }`}
              />
            </div>

            {/* Next Trigger */}
            <button 
              onClick={handleNext}
              disabled={activeIndex === activeEventPhotos.length - 1}
              aria-label="Next capture"
              className="absolute right-2 sm:right-4 z-20 font-mono text-xl text-paper hover:text-signal bg-void/60 hover:bg-void/90 border border-line p-3 sm:p-4 rounded-full disabled:opacity-10 transition-all"
            >
              →
            </button>
          </div>

          {/* Bottom Caption, Credit & Mobile Swipe Hint */}
          <div className="border-t border-line pt-3 text-center max-w-xl mx-auto w-full pb-2">
            {activePhoto.caption && (
              <p className="font-mono text-xs text-paper text-pretty">{activePhoto.caption}</p>
            )}
            {activePhoto.photographer_credit && (
              <p className="font-mono text-[10px] text-signal uppercase tracking-wider mt-1">
                Shot by {activePhoto.photographer_credit}
              </p>
            )}
            <p className="font-mono text-[9px] text-mute/60 uppercase tracking-widest mt-2 block sm:hidden">
              Swipe left / right to navigate
            </p>
          </div>
        </div>
      )}
    </main>
  )
}
