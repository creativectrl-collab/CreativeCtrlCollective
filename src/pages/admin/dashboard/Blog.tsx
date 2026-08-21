import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { Button } from '../../../components/Button'
import { BlockEditor } from '../../../components/admin/BlockEditor'
import { PostBody } from '../../../components/PostBody'

// Helper to calculate reading time
function getReadingTime(contentJsonStr: string): number {
  if (!contentJsonStr) return 0
  try {
    const json = JSON.parse(contentJsonStr)
    let text = ''
    if (json && json.type === 'doc' && Array.isArray(json.content)) {
      json.content.forEach((block: any) => {
        if (block.content) {
          block.content.forEach((span: any) => {
            if (span.text) text += ' ' + span.text
          })
        }
      })
    }
    const words = text.trim().split(/\s+/).filter(w => w.length > 0).length
    return Math.max(1, Math.ceil(words / 200))
  } catch {
    const words = contentJsonStr.trim().split(/\s+/).filter(w => w.length > 0).length
    return Math.max(1, Math.ceil(words / 200))
  }
}

export function BlogManager() {
  const [posts, setPosts] = useState<any[]>([])
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Update')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [file, setFile] = useState<File | null>(null)
  
  // Custom states for rich features
  const [isSplitView, setIsSplitView] = useState(false)
  const [isDistractionFree, setIsDistractionFree] = useState(false)

  useEffect(() => { loadPosts() }, [])

  async function loadPosts() {
    const { data } = await supabase.from('posts').select('*').neq('category', 'Event')
    setPosts(data || [])
  }

  async function handleCreate(isPublished: boolean) {
    if (file && file.size > 10 * 1024 * 1024) {
      alert('File too large (max 10MB)')
      return
    }

    let cover_image_url = ''
    if (file) {
      const fileName = `${Math.random()}-${file.name}`
      const { data, error } = await supabase.storage.from('public-media').upload(fileName, file)
      if (error) { alert('Upload failed'); return }
      cover_image_url = supabase.storage.from('public-media').getPublicUrl(data.path).data.publicUrl
    }

    const { error } = await supabase.from('posts').insert({
      title, slug: title.toLowerCase().replace(/ /g, '-'), category, excerpt, content_markdown: content, cover_image_url, is_published: isPublished
    })

    if (!error) { 
      loadPosts()
      setTitle('')
      setExcerpt('')
      setContent('')
      setFile(null)
      setIsDistractionFree(false)
      setIsSplitView(false)
    }
  }

  async function handleDelete(id: string) {
    if (confirm('Delete this post?')) {
      await supabase.from('posts').delete().eq('id', id)
      loadPosts()
    }
  }

  const readingTime = getReadingTime(content)

  // Editor Area Component to allow full-screen distraction-free mode
  const editorArea = (
    <div className="grid gap-4 bg-surface p-4 border border-line md:p-6 rounded">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
        <h2 className="text-lg text-paper font-mono uppercase">
          {isDistractionFree ? 'Distraction-Free Editor' : 'Create Post'}
        </h2>
        <div className="flex gap-2 font-mono text-xs">
          <button 
            onClick={() => setIsSplitView(!isSplitView)}
            className={`px-3 py-1.5 border border-line rounded transition-colors ${isSplitView ? 'bg-signal text-void' : 'text-paper hover:bg-void'}`}
          >
            {isSplitView ? 'Hide Preview' : 'Split View'}
          </button>
          <button 
            onClick={() => setIsDistractionFree(!isDistractionFree)}
            className={`px-3 py-1.5 border border-line rounded transition-colors ${isDistractionFree ? 'bg-signal text-void' : 'text-paper hover:bg-void'}`}
          >
            {isDistractionFree ? 'Exit Fullscreen' : 'Fullscreen'}
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <input 
          placeholder="Title" 
          value={title} 
          onChange={e => setTitle(e.target.value)} 
          className="bg-void p-2.5 border border-line text-paper font-sans outline-none focus:border-signal transition-colors" 
        />
        <select 
          value={category} 
          onChange={e => setCategory(e.target.value)} 
          className="bg-void p-2.5 border border-line text-paper font-mono outline-none focus:border-signal transition-colors"
        >
          {['Update', 'Showcase', 'Article', 'Announcement'].map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <input 
        placeholder="Excerpt" 
        value={excerpt} 
        onChange={e => setExcerpt(e.target.value)} 
        className="bg-void p-2.5 border border-line text-paper font-sans outline-none focus:border-signal transition-colors" 
      />

      <div className="flex flex-col gap-2 font-mono text-xs border border-line p-3 bg-void rounded">
        <span className="text-mute uppercase">Featured Cover Image:</span>
        <input 
          type="file" 
          onChange={e => setFile(e.target.files?.[0] || null)} 
          className="text-paper file:bg-surface file:border-line file:text-paper file:px-3 file:py-1 file:rounded file:mr-4 file:font-mono file:text-xs" 
        />
      </div>

      {/* Editor Content Area */}
      <div className={`grid gap-6 ${isSplitView ? 'lg:grid-cols-2' : ''}`}>
        <div className="flex flex-col gap-2">
          <BlockEditor initialContent={content} onChange={setContent} />
          <div className="flex justify-between font-mono text-[10px] text-mute px-1">
            <span>Reading Time: {readingTime} min</span>
            <span>Character Count: {content.length}</span>
          </div>
        </div>

        {/* Live Reader Preview (Matches site styling) */}
        {isSplitView && (
          <div className="border border-line bg-void p-6 rounded max-h-[460px] overflow-y-auto">
            <p className="font-mono text-[10px] text-signal uppercase tracking-wider mb-2 border-b border-line pb-2">Live Reader Preview</p>
            {title ? <h1 className="font-display text-2xl font-bold text-paper mb-3">{title}</h1> : null}
            {file ? (
              <img 
                src={URL.createObjectURL(file)} 
                alt="Local preview" 
                className="w-full object-cover border border-line my-4 rounded max-h-40" 
              />
            ) : null}
            <div className="font-sans text-sm text-mute leading-relaxed">
              <PostBody content={content} />
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-4 border-t border-line pt-4 mt-2">
        <Button onClick={() => handleCreate(false)}>Save Draft</Button>
        <Button onClick={() => handleCreate(true)}>Publish Live</Button>
      </div>
    </div>
  )

  return (
    <div className="grid gap-12">
      {/* Distraction Free Mode Wrapper */}
      {isDistractionFree ? (
        <div className="fixed inset-0 z-50 bg-void p-6 md:p-12 overflow-y-auto max-w-7xl mx-auto">
          {editorArea}
        </div>
      ) : (
        editorArea
      )}

      <table className="w-full border-collapse border border-line text-paper font-sans text-sm">
        <thead>
          <tr className="border-b border-line bg-surface font-mono text-xs uppercase text-mute">
            <th className="p-3 text-left">Title</th>
            <th className="p-3 text-left">Category</th>
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-left">Likes</th>
            <th className="p-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {posts.map(p => (
            <tr key={p.id} className="border-b border-line hover:bg-surface transition-colors">
              <td className="p-3 font-medium">{p.title}</td>
              <td className="p-3 font-mono text-xs">{p.category}</td>
              <td className="p-3 font-mono text-xs">
                <span className={`px-2 py-0.5 rounded ${p.is_published ? 'bg-signal/10 text-signal border border-signal/20' : 'bg-mute/10 text-mute border border-mute/20'}`}>
                  {p.is_published ? 'Published' : 'Draft'}
                </span>
              </td>
              <td className="p-3 font-mono text-xs">{p.likes_count || 0}</td>
              <td className="p-3"><Button onClick={() => handleDelete(p.id)}>Delete</Button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
