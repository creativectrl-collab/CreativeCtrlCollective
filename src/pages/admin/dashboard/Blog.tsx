import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { Button } from '../../../components/Button'

export function BlogManager() {
  const [posts, setPosts] = useState<any[]>([])
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Update')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [file, setFile] = useState<File | null>(null)

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

    if (!error) { loadPosts(); setTitle(''); setExcerpt(''); setContent(''); setFile(null) }
  }

  async function handleDelete(id: string) {
    if (confirm('Delete this post?')) {
      await supabase.from('posts').delete().eq('id', id)
      loadPosts()
    }
  }

  return (
    <div className="grid gap-12">
      <div className="grid gap-4 p-4 border border-line bg-surface md:p-6">
        <h2 className="text-lg text-paper">Create Post</h2>
        <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} className="bg-void p-2 border border-line text-paper" />
        <select value={category} onChange={e => setCategory(e.target.value)} className="bg-void p-2 border border-line text-paper">
          {['Update', 'Showcase', 'Article', 'Announcement'].map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <input placeholder="Excerpt" value={excerpt} onChange={e => setExcerpt(e.target.value)} className="bg-void p-2 border border-line text-paper" />
        <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} className="bg-void p-2 border border-line text-paper" />
        <textarea placeholder="Markdown Content" value={content} onChange={e => setContent(e.target.value)} className="h-48 bg-void p-2 border border-line text-paper" />
        <div className="flex gap-4">
          <Button onClick={() => handleCreate(false)}>Save Draft</Button>
          <Button onClick={() => handleCreate(true)}>Publish Live</Button>
        </div>
      </div>

      <table className="w-full border-collapse border border-line text-paper">
        <thead>
          <tr className="border-b border-line">
            <th className="p-2 text-left">Title</th>
            <th className="p-2 text-left">Category</th>
            <th className="p-2 text-left">Status</th>
            <th className="p-2 text-left">Likes</th>
            <th className="p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {posts.map(p => (
            <tr key={p.id} className="border-b border-line">
              <td className="p-2">{p.title}</td>
              <td className="p-2">{p.category}</td>
              <td className="p-2">{p.is_published ? 'Published' : 'Draft'}</td>
              <td className="p-2">{p.likes_count}</td>
              <td className="p-2"><Button onClick={() => handleDelete(p.id)}>Delete</Button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
