import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Seo } from '../components/Seo'
import { fetchPublishedPosts, isEventPost, type Post } from '../lib/posts'

export function UpdatesPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPublishedPosts()
      .then(setPosts)
      .catch((err: Error) => setError(err.message))
  }, [])

  return (
    <main className="mx-auto max-w-3xl px-6 py-16 md:px-10 md:py-20">
      <Seo
        title="Updates"
        description="News, notes, and upcoming Creative Ctrl Collective events."
        path="/updates"
      />
      <p className="font-mono text-kicker uppercase text-signal">Journal</p>
      <h1 className="mt-4 font-display text-display text-paper">Updates</h1>
      {error ? <p className="mt-6 text-alert">{error}</p> : null}
      {posts.length === 0 && !error ? (
        <p className="mt-8 text-mute">No published updates yet.</p>
      ) : null}
      <div className="mt-10 grid gap-8">
        {posts.map((post) => (
          <article key={post.id} className="border border-line p-5">
            <p className="font-mono text-kicker uppercase text-mute">
              {isEventPost(post) ? 'Event' : post.category ?? 'Update'}
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold tracking-tight">
              <Link to={`/posts/${post.slug}`} className="hover:text-signal">
                {post.title}
              </Link>
            </h2>
            {post.excerpt ? <p className="mt-3 text-mute">{post.excerpt}</p> : null}
          </article>
        ))}
      </div>
    </main>
  )
}
