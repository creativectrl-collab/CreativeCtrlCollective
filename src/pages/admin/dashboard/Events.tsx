import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { Button } from '../../../components/Button'

export function EventsManager() {
  const [events, setEvents] = useState<any[]>([])
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [venue, setVenue] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)

  useEffect(() => { loadEvents() }, [])

  async function loadEvents() {
    const { data } = await supabase.from('posts').select('*').eq('category', 'Event')
    setEvents(data || [])
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    
    if (file && file.size > 10 * 1024 * 1024) {
      alert('File too large. Please upload an image smaller than 10MB.')
      return
    }

    let cover_image_url = ''
    
    if (file) {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const { data, error } = await supabase.storage.from('public-media').upload(fileName, file)
      if (error) { alert('Upload failed: ' + error.message); return }
      const { data: urlData } = supabase.storage.from('public-media').getPublicUrl(data.path)
      cover_image_url = urlData.publicUrl
    }

    const slug = title.toLowerCase().replace(/ /g, '-')
    const { error } = await supabase.from('posts').insert({
      title, 
      slug, 
      category: 'Event', 
      content_markdown: description, 
      event_date: date,
      cover_image_url
    })
    if (!error) { loadEvents(); setTitle(''); setDate(''); setVenue(''); setDescription(''); setFile(null) }
  }

  return (
    <div className="grid gap-12">
      <form onSubmit={handleCreate} className="grid gap-4 p-6 border border-line bg-surface">
        <h2 className="text-lg text-paper">Create Event</h2>
        <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} className="bg-void p-2 border border-line text-paper" />
        <input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} className="bg-void p-2 border border-line text-paper" />
        <input placeholder="Venue Name" value={venue} onChange={e => setVenue(e.target.value)} className="bg-void p-2 border border-line text-paper" />
        <label className="text-mute text-sm">Flyer Image</label>
        <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} className="bg-void p-2 border border-line text-paper" />
        <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} className="bg-void p-2 border border-line text-paper h-32" />
        <Button type="submit">Publish Event</Button>
      </form>

      <div className="grid gap-4">
        {events.map(e => (
          <div key={e.id} className="p-4 border border-line flex justify-between">
            <span className="text-paper">{e.title}</span>
            <span className="text-mute">{new Date(e.event_date).toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
