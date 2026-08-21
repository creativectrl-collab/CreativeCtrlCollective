import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { Button } from '../../../components/Button'

interface StagedPhoto {
  id: string
  file?: File // Undefined if it's an existing photo loaded from DB
  url: string  // Local object URL for preview, or DB public URL
  caption: string
  credit: string
  dbId?: string // Present if it's already in the database
}

export function EventsManager() {
  const [events, setEvents] = useState<any[]>([])
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [venue, setVenue] = useState('')
  const [ticketLink, setTicketLink] = useState('')
  const [description, setDescription] = useState('')
  const [flyerFile, setFlyerFile] = useState<File | null>(null)
  const [existingFlyerUrl, setExistingFlyerUrl] = useState('')

  // Gallery Photos State
  const [stagedPhotos, setStagedPhotos] = useState<StagedPhoto[]>([])
  const [deletedDbPhotoIds, setDeletedDbPhotoIds] = useState<string[]>([])
  const [uploadStatus, setUploadStatus] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => { loadEvents() }, [])

  async function loadEvents() {
    const { data } = await supabase.from('posts').select('*').eq('category', 'Event').order('event_date', { ascending: false })
    setEvents(data || [])
  }

  // Load an event into Edit Mode
  async function handleEdit(event: any) {
    setEditingId(event.id)
    setTitle(event.title)
    setDate(event.event_date ? event.event_date.substring(0, 16) : '')
    setVenue(event.venue_location || '')
    setTicketLink(event.ticket_link || '')
    setDescription(event.content_markdown || '')
    setExistingFlyerUrl(event.cover_image_url || '')
    setFlyerFile(null)
    setDeletedDbPhotoIds([])

    // Fetch existing gallery photos
    const { data: photos } = await supabase
      .from('gallery_photos')
      .select('*')
      .eq('post_id', event.id)
      .order('display_order', { ascending: true })

    if (photos) {
      setStagedPhotos(photos.map(p => ({
        id: p.id,
        url: p.image_url,
        caption: p.caption || '',
        credit: p.photographer_credit || '',
        dbId: p.id
      })))
    } else {
      setStagedPhotos([])
    }
  }

  // Cancel edit mode and reset form
  function handleCancelEdit() {
    setEditingId(null)
    setTitle('')
    setDate('')
    setVenue('')
    setTicketLink('')
    setDescription('')
    setExistingFlyerUrl('')
    setFlyerFile(null)
    setStagedPhotos([])
    setDeletedDbPhotoIds([])
  }

  // Add photos to stage
  function handleAddPhotos(files: FileList | null) {
    if (!files) return
    const newPhotos: StagedPhoto[] = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      newPhotos.push({
        id: Math.random().toString(36).substring(2, 9),
        file,
        url: URL.createObjectURL(file),
        caption: '',
        credit: ''
      })
    }
    setStagedPhotos(prev => [...prev, ...newPhotos])
  }

  // Remove photo from stage
  function handleRemovePhoto(photo: StagedPhoto) {
    if (photo.dbId) {
      setDeletedDbPhotoIds(prev => [...prev, photo.dbId!])
    }
    setStagedPhotos(prev => prev.filter(p => p.id !== photo.id))
    if (photo.file) {
      URL.revokeObjectURL(photo.url)
    }
  }

  // Reorder photos
  function movePhoto(index: number, direction: 'up' | 'down') {
    const newPhotos = [...stagedPhotos]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= newPhotos.length) return
    
    const temp = newPhotos[index]
    newPhotos[index] = newPhotos[targetIndex]
    newPhotos[targetIndex] = temp
    setStagedPhotos(newPhotos)
  }

  // Submit form (Publish or Update)
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    setUploadStatus('Publishing event details...')

    try {
      // 1. Upload Flyer Image if newly selected
      let cover_image_url = existingFlyerUrl
      if (flyerFile) {
        if (flyerFile.size > 10 * 1024 * 1024) {
          alert('Flyer too large. Please upload an image smaller than 10MB.')
          setIsSubmitting(false)
          setUploadStatus('')
          return
        }
        const fileExt = flyerFile.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const { data, error } = await supabase.storage.from('public-media').upload(fileName, flyerFile)
        if (error) throw error
        cover_image_url = supabase.storage.from('public-media').getPublicUrl(data.path).data.publicUrl
      }

      const slug = title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')
      let postId = editingId

      // 2. Insert or Update Event Post
      if (editingId) {
        const { error } = await supabase.from('posts').update({
          title,
          slug,
          content_markdown: description,
          event_date: date,
          venue_location: venue,
          ticket_link: ticketLink,
          cover_image_url
        }).eq('id', editingId)
        if (error) throw error
      } else {
        const { data: newPost, error } = await supabase.from('posts').insert({
          title,
          slug,
          category: 'Event',
          content_markdown: description,
          event_date: date,
          venue_location: venue,
          ticket_link: ticketLink,
          cover_image_url
        }).select().single()
        if (error) throw error
        postId = newPost.id
      }

      // 3. Process Deleted DB Photos
      if (editingId && deletedDbPhotoIds.length > 0) {
        setUploadStatus('Removing deleted gallery images...')
        const { error } = await supabase.from('gallery_photos').delete().in('id', deletedDbPhotoIds)
        if (error) throw error
      }

      // 4. Upload and Save Staged Photos
      for (let i = 0; i < stagedPhotos.length; i++) {
        const photo = stagedPhotos[i]
        
        if (photo.file) {
          setUploadStatus(`Uploading gallery photo ${i + 1}/${stagedPhotos.length}...`)
          const fileExt = photo.file.name.split('.').pop()
          const fileName = `${Math.random()}.${fileExt}`
          const { data, error } = await supabase.storage.from('public-media').upload(fileName, photo.file)
          if (error) throw error
          
          const imageUrl = supabase.storage.from('public-media').getPublicUrl(data.path).data.publicUrl
          
          const { error: insErr } = await supabase.from('gallery_photos').insert({
            post_id: postId,
            image_url: imageUrl,
            caption: photo.caption,
            photographer_credit: photo.credit,
            display_order: i
          })
          if (insErr) throw insErr
        } else if (photo.dbId) {
          // Update display order and text fields of existing photo
          const { error: updErr } = await supabase.from('gallery_photos').update({
            display_order: i,
            caption: photo.caption,
            photographer_credit: photo.credit
          }).eq('id', photo.dbId)
          if (updErr) throw updErr
        }
      }

      // Clean up object URLs
      stagedPhotos.forEach(p => {
        if (p.file) URL.revokeObjectURL(p.url)
      })

      // Finish up
      setUploadStatus('Success!')
      setTimeout(() => {
        handleCancelEdit()
        loadEvents()
        setIsSubmitting(false)
        setUploadStatus('')
      }, 1000)

    } catch (err: any) {
      alert('Operation failed: ' + err.message)
      setIsSubmitting(false)
      setUploadStatus('')
    }
  }

  // Delete event post completely
  async function handleDeleteEvent(id: string) {
    if (!confirm('Are you sure you want to delete this event? This will delete the flyer and all gallery photos.')) return
    const { error } = await supabase.from('posts').delete().eq('id', id)
    if (!error) {
      loadEvents()
      if (editingId === id) handleCancelEdit()
    } else {
      alert('Delete failed: ' + error.message)
    }
  }

  return (
    <div className="grid gap-12">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 p-4 border border-line bg-surface md:p-6 rounded">
        <div className="flex justify-between items-center col-span-full border-b border-line pb-2">
          <h2 className="text-lg text-paper font-display uppercase tracking-wider">{editingId ? 'Edit Event' : 'Create Event'}</h2>
          {editingId && (
            <button 
              type="button" 
              onClick={handleCancelEdit}
              className="text-xs font-mono text-mute hover:text-signal"
            >
              Cancel Edit [✕]
            </button>
          )}
        </div>
        
        <div className="grid gap-1">
          <label className="font-mono text-[10px] uppercase text-mute">Event Title</label>
          <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} className="bg-void p-2 border border-line text-paper text-sm outline-none focus:border-signal" required />
        </div>

        <div className="grid gap-1">
          <label className="font-mono text-[10px] uppercase text-mute">Date & Time</label>
          <input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} className="bg-void p-2 border border-line text-paper text-sm outline-none focus:border-signal" required />
        </div>

        <div className="grid gap-1">
          <label className="font-mono text-[10px] uppercase text-mute">Venue Name / Location</label>
          <input placeholder="e.g. Standard Time, Toronto" value={venue} onChange={e => setVenue(e.target.value)} className="bg-void p-2 border border-line text-paper text-sm outline-none focus:border-signal" />
        </div>

        <div className="grid gap-1">
          <label className="font-mono text-[10px] uppercase text-mute">Ticket / RSVP URL (Optional)</label>
          <input placeholder="e.g. https://ra.co/events/..." value={ticketLink} onChange={e => setTicketLink(e.target.value)} className="bg-void p-2 border border-line text-paper text-sm outline-none focus:border-signal" />
        </div>

        <div className="grid gap-1">
          <label className="font-mono text-[10px] uppercase text-mute">Flyer Image</label>
          {existingFlyerUrl && !flyerFile && (
            <div className="mb-2 flex items-center gap-3">
              <img src={existingFlyerUrl} className="w-12 h-12 object-cover border border-line rounded" alt="Current flyer" />
              <span className="text-[10px] font-mono text-mute">Current flyer active</span>
            </div>
          )}
          <input type="file" onChange={e => setFlyerFile(e.target.files?.[0] || null)} className="bg-void p-2 border border-line text-paper text-sm file:bg-surface file:border-line file:text-paper file:px-3 file:py-1 file:rounded file:mr-4 file:font-mono file:text-xs" accept="image/*" />
        </div>

        <div className="grid gap-1">
          <label className="font-mono text-[10px] uppercase text-mute">Description</label>
          <textarea placeholder="Lineup, details, notes..." value={description} onChange={e => setDescription(e.target.value)} className="bg-void p-2 border border-line text-paper text-sm outline-none focus:border-signal h-32" />
        </div>

        {/* Multi-Image Gallery Dropzone & Staging Area */}
        <div className="grid gap-3 border border-line bg-void/50 p-4 rounded col-span-full">
          <h3 className="font-mono text-xs uppercase text-signal font-bold">Event Photo Gallery</h3>
          
          {/* Uploader Input */}
          <div className="border-2 border-dashed border-line hover:border-signal p-6 text-center cursor-pointer transition-colors relative">
            <input 
              type="file" 
              multiple 
              onChange={e => handleAddPhotos(e.target.files)} 
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              accept="image/*"
            />
            <p className="font-mono text-[10px] uppercase text-paper">Drag & Drop or click to add archive photos</p>
            <p className="font-mono text-[9px] text-mute mt-1">Select multiple images at once</p>
          </div>

          {/* Staged Visuals Queue */}
          {stagedPhotos.length > 0 && (
            <div className="grid gap-2 mt-2">
              <span className="font-mono text-[9px] text-mute uppercase">Gallery roll ({stagedPhotos.length} photos):</span>
              <div className="grid gap-2 max-h-80 overflow-y-auto pr-1">
                {stagedPhotos.map((photo, index) => (
                  <div key={photo.id} className="flex items-start gap-4 p-3 border border-line bg-surface rounded">
                    {/* Visual Preview */}
                    <img src={photo.url} className="w-16 h-16 object-cover border border-line rounded" alt="Staged gallery preview" />
                    
                    {/* Metadata Editors */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1">
                      <input 
                        type="text" 
                        placeholder="Caption (Optional)"
                        value={photo.caption}
                        onChange={e => {
                          const updated = [...stagedPhotos]
                          updated[index].caption = e.target.value
                          setStagedPhotos(updated)
                        }}
                        className="bg-void p-1 border border-line text-paper text-xs outline-none focus:border-signal"
                      />
                      <input 
                        type="text" 
                        placeholder="Photo Credit (Optional)"
                        value={photo.credit}
                        onChange={e => {
                          const updated = [...stagedPhotos]
                          updated[index].credit = e.target.value
                          setStagedPhotos(updated)
                        }}
                        className="bg-void p-1 border border-line text-paper text-xs outline-none focus:border-signal"
                      />
                    </div>

                    {/* Order & Remove Controls */}
                    <div className="flex flex-col gap-1">
                      <button 
                        type="button" 
                        onClick={() => movePhoto(index, 'up')}
                        disabled={index === 0}
                        className="text-[9px] font-mono border border-line hover:border-paper text-paper px-1 disabled:opacity-30 rounded"
                      >
                        ▲
                      </button>
                      <button 
                        type="button" 
                        onClick={() => movePhoto(index, 'down')}
                        disabled={index === stagedPhotos.length - 1}
                        className="text-[9px] font-mono border border-line hover:border-paper text-paper px-1 disabled:opacity-30 rounded"
                      >
                        ▼
                      </button>
                    </div>
                    
                    <button 
                      type="button" 
                      onClick={() => handleRemovePhoto(photo)}
                      className="text-xs font-mono text-mute hover:text-signal p-1"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {uploadStatus && (
          <div className="col-span-full bg-void border border-signal p-3 rounded font-mono text-xs text-signal text-center animate-pulse">
            {uploadStatus}
          </div>
        )}

        <Button type="submit" className="w-full mt-2" disabled={isSubmitting}>
          {editingId ? 'Save Event Details' : 'Publish Event'}
        </Button>
      </form>

      {/* Published Events list */}
      <div className="grid gap-4">
        <h3 className="font-mono text-xs uppercase text-mute border-b border-line pb-2">Active Events ({events.length})</h3>
        {events.length === 0 ? (
          <p className="text-mute text-xs italic font-mono">No events published yet.</p>
        ) : (
          <div className="grid gap-2">
            {events.map(e => (
              <div key={e.id} className="p-4 border border-line bg-surface flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 hover:border-signal transition-colors rounded">
                <div className="grid flex-1 cursor-pointer" onClick={() => handleEdit(e)}>
                  <div className="flex items-center gap-2">
                    <span className="text-paper font-bold text-sm hover:text-signal transition-colors">{e.title}</span>
                    <span className="text-[9px] font-mono bg-void border border-line px-1 text-mute rounded">Click to edit</span>
                  </div>
                  {e.venue_location && <span className="text-[10px] font-mono text-mute mt-0.5">{e.venue_location}</span>}
                  {e.ticket_link && (
                    <a href={e.ticket_link} target="_blank" rel="noopener noreferrer" className="text-[10px] font-mono text-signal underline mt-1" onClick={e => e.stopPropagation()}>
                      Ticket Link →
                    </a>
                  )}
                </div>
                
                <div className="flex items-center gap-4">
                  <span className="text-mute font-mono text-xs">{new Date(e.event_date).toLocaleString()}</span>
                  <button 
                    type="button" 
                    onClick={() => handleDeleteEvent(e.id)}
                    className="text-xs font-mono text-mute hover:text-signal border border-line px-2 py-1 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
