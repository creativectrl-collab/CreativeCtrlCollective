import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

type Post = {
  id: string
  title: string
  excerpt: string
  content_markdown: string
  likes_count: number
}

export function UpdatesPage() {
  const [posts, setPosts] = useState<Post[]>([])

  useEffect(() => {
    async function fetchPosts() {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
      
      if (error) console.error(error)
      else setPosts(data || [])
    }
    fetchPosts()
  }, [])

  async function handleLike(postId: string) {
    let clientId = localStorage.getItem('ccc_client_id')
    if (!clientId) {
      clientId = crypto.randomUUID()
      localStorage.setItem('ccc_client_id', clientId)
    }

    const { error } = await supabase
      .from('post_likes')
      .insert([{ post_id: postId, client_identifier: clientId }])
      
    if (error) {
       console.error('Like failed:', error)
       return
    }
    
    // Update local state to show updated count
    setPosts(posts.map(p => p.id === postId ? { ...p, likes_count: p.likes_count + 1 } : p))
  }

  return (
    <div className="grid gap-8 p-4">
      <h1 className="font-mono text-xl uppercase text-mute">Updates</h1>
      {posts.map(post => (
        <article key={post.id} className="border border-line p-4">
          <h2 className="text-lg text-paper">{post.title}</h2>
          <p className="text-mute">{post.excerpt}</p>
          <button onClick={() => handleLike(post.id)} className="font-mono text-signal mt-2">Like ({post.likes_count})</button>
        </article>
      ))}
    </div>
  )
}
