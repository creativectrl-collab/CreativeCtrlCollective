import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Seo } from '../components/Seo'
import { PostBody } from '../components/PostBody'
import { fetchPublishedPostBySlug, isEventPost, type Post } from '../lib/posts'
import { SEO_DEFAULTS, absoluteUrl } from '../seo/defaults'
import { postJsonLd } from '../seo/postJsonLd'

export function PostPage() {
  const { slug = '' } = useParams()
  const [post, setPost] = useState<Post | null>(null)
  const [loadedSlug, setLoadedSlug] = useState<string | null>(null)
  const status: 'loading' | 'ready' | 'missing' =
    loadedSlug !== slug ? 'loading' : post ? 'ready' : 'missing'

  useEffect(() => {
    let cancelled = false
    fetchPublishedPostBySlug(slug)
      .then((row) => {
        if (cancelled) return
        setPost(row)
        setLoadedSlug(slug)
      })
      .catch(() => {
        if (cancelled) return
        setPost(null)
        setLoadedSlug(slug)
      })
    return () => {
      cancelled = true
    }
  }, [slug])

  const canonical = post ? absoluteUrl(`/posts/${post.slug}`) : absoluteUrl(`/posts/${slug}`)
  const jsonLd = useMemo(
    () => (post ? postJsonLd(post, canonical) : undefined),
    [post, canonical],
  )

  if (status === 'loading') {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16 md:px-10">
        <Seo title="Loading" noIndex />
        <p className="font-mono text-kicker uppercase text-mute">Loading</p>
      </main>
    )
  }

  if (status === 'missing' || !post) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16 md:px-10">
        <Seo title="Not found" noIndex />
        <p className="font-mono text-kicker uppercase text-alert">404</p>
        <h1 className="mt-4 font-display text-4xl font-bold tracking-tight">Not found</h1>
        <p className="mt-3 text-mute">That update is unpublished or does not exist.</p>
        <Link to="/updates" className="mt-6 inline-block font-mono text-kicker uppercase text-signal">
          All updates
        </Link>
      </main>
    )
  }

  const image = post.cover_image_url ?? SEO_DEFAULTS.ogImagePath

  return (
    <main className="mx-auto max-w-3xl px-6 py-16 md:px-10 md:py-20">
      <Seo
        title={post.title}
        description={post.excerpt ?? SEO_DEFAULTS.description}
        path={`/posts/${post.slug}`}
        image={image}
        type={isEventPost(post) ? 'event' : 'article'}
        jsonLd={jsonLd}
      />
      <p className="font-mono text-kicker uppercase text-signal">
        {isEventPost(post) ? 'Event' : post.category ?? 'Update'}
      </p>
      <h1 className="mt-4 font-display text-4xl font-bold tracking-tight md:text-5xl">
        {post.title}
      </h1>
      {post.event_date ? (
        <p className="mt-3 text-mute">
          {new Date(post.event_date).toLocaleString('en-CA', {
            dateStyle: 'long',
            timeStyle: 'short',
          })}
        </p>
      ) : (
        <p className="mt-3 text-mute">
          {new Date(post.created_at).toLocaleDateString('en-CA', { dateStyle: 'long' })}
        </p>
      )
      }
      {post.cover_image_url ? (
        <img
          src={post.cover_image_url}
          alt=""
          className="mt-8 w-full border border-line"
        />
      ) : null}
      {post.excerpt ? <p className="mt-8 text-lede text-paper">{post.excerpt}</p> : null}
      {post.content_markdown ? (
        <div className="mt-8 text-pretty leading-relaxed text-mute">
          <PostBody content={post.content_markdown} />
        </div>
      ) : null}
    </main>
  )
}
