import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { Seo } from '../components/Seo'

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
  event_date: string
  venue_location?: string
  gallery_photos: Photo[]
}

export function GalleryPage() {
  const [events, setEvents] = useState<EventWithPhotos[]>([])
  const [selectedTag, setSelectedTag] = useState('All Captures')
  const [loading, setLoading] = useState(true)

  // Lightbox State
  const [activePhoto, setActivePhoto] = useState<Photo | null>(null)
  const [activeEventPhotos, setActiveEventPhotos] = useState<Photo[]>([])

  useEffect(() => {
    async function loadGalleryData() {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('id, title, event_date, venue_location, gallery_photos(*)')
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

  // Lightbox Navigation
  const activeIndex = useMemo(() => {
    if (!activePhoto) return -1
    return activeEventPhotos.findIndex(p => p.id === activePhoto.id)
  }, [activePhoto, activeEventPhotos])

  const handlePrev = useCallback(() => {
    if (activeIndex > 0) {
      setActivePhoto(activeEventPhotos[activeIndex - 1])
    }
  }, [activeIndex, activeEventPhotos])

  const handleNext = useCallback(() => {
    if (activeIndex < activeEventPhotos.length - 1) {
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
    if (diff > 50) handleNext()    // Swiped left
    if (diff < -50) handlePrev()   // Swiped right
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
      // Fallback: open in new tab
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
            <section key={event.id} className="grid gap-6">
              {/* Event Header info */}
              <div className="border-b border-line pb-3 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                <div>
                  <h2 className="font-display text-xl sm:text-2xl font-bold text-paper">{event.title}</h2>
                  {event.venue_location && (
                    <p className="font-mono text-[10px] text-mute uppercase tracking-widest mt-1">{event.venue_location}</p>
                  )}
                </div>
                <span className="font-mono text-[10px] uppercase text-signal">
                  {new Date(event.event_date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>

              {/* Masonry Editorial Grid */}
              <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                {event.gallery_photos.map((photo) => (
                  <div 
                    key={photo.id} 
                    onClick={() => {
                      setActivePhoto(photo)
                      setActiveEventPhotos(event.gallery_photos)
                    }}
                    className="break-inside-avoid relative overflow-hidden group cursor-pointer border border-line hover:border-signal transition-colors bg-surface rounded"
                  >
                    <img 
                      src={photo.image_url} 
                      alt={photo.caption || 'Event visual'} 
                      loading="lazy"
                      className="w-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                    />
                    
                    {/* Hover Caption Info */}
                    {(photo.caption || photo.photographer_credit) && (
                      <div className="absolute inset-x-0 bottom-0 bg-void/90 border-t border-line p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-200 font-mono text-[9px] text-paper">
                        {photo.caption && <p className="text-pretty">{photo.caption}</p>}
                        {photo.photographer_credit && (
                          <p className="text-signal mt-1 uppercase tracking-wider">Credit: {photo.photographer_credit}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Fullscreen Lightbox / Carousel Modal */}
      {activePhoto && (
        <div 
          className="fixed inset-0 z-[100] flex flex-col justify-between bg-void/95 backdrop-blur-md p-4"
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

          {/* Main Visual Carousel View */}
          <div className="relative flex-1 flex items-center justify-center my-6">
            {/* Prev Trigger */}
            <button 
              onClick={handlePrev}
              disabled={activeIndex === 0}
              className="absolute left-2 z-10 font-mono text-lg text-paper hover:text-signal p-4 disabled:opacity-20 transition-opacity"
            >
              ←
            </button>

            {/* Image */}
            <img 
              src={activePhoto.image_url} 
              alt={activePhoto.caption || 'Lightbox view'} 
              className="max-h-[70vh] max-w-[85vw] object-contain border border-line rounded"
            />

            {/* Next Trigger */}
            <button 
              onClick={handleNext}
              disabled={activeIndex === activeEventPhotos.length - 1}
              className="absolute right-2 z-10 font-mono text-lg text-paper hover:text-signal p-4 disabled:opacity-20 transition-opacity"
            >
              →
            </button>
          </div>

          {/* Bottom Caption & Meta details */}
          <div className="border-t border-line pt-3 text-center max-w-xl mx-auto w-full pb-4">
            {activePhoto.caption && (
              <p className="font-mono text-xs text-paper text-pretty">{activePhoto.caption}</p>
            )}
            {activePhoto.photographer_credit && (
              <p className="font-mono text-[10px] text-signal uppercase tracking-wider mt-1.5">
                Shot by {activePhoto.photographer_credit}
              </p>
            )}
          </div>
        </div>
      )}
    </main>
  )
}
