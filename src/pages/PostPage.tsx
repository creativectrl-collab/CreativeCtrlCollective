import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Seo } from '../components/Seo'
import { fetchPublishedPostBySlug, isEventPost, type Post } from '../lib/posts'
import { SEO_DEFAULTS, absoluteUrl } from '../seo/defaults'
import { postJsonLd } from '../seo/postJsonLd'

function renderContent(contentStr: string) {
  try {
    const json = JSON.parse(contentStr)
    if (json && json.type === 'doc' && Array.isArray(json.content)) {
      return json.content.map((block: any, idx: number) => {
        switch (block.type) {
          case 'paragraph':
            return (
              <p key={idx} className="mb-4">
                {block.content?.map((span: any, sIdx: number) => {
                  if (span.type === 'text') {
                    let el = <>{span.text}</>
                    if (span.marks) {
                      span.marks.forEach((mark: any) => {
                        if (mark.type === 'bold') el = <strong key={sIdx}>{el}</strong>
                        if (mark.type === 'italic') el = <em key={sIdx}>{el}</em>
                        if (mark.type === 'code') el = <code key={sIdx} className="bg-surface px-1 py-0.5 rounded text-signal font-mono text-xs">{el}</code>
                        if (mark.type === 'link') el = <a key={sIdx} href={mark.attrs.href} target="_blank" rel="noopener noreferrer" className="text-signal underline">{el}</a>
                      })
                    }
                    return <span key={sIdx}>{el}</span>
                  }
                  return null
                })}
              </p>
            )
          case 'heading':
            const Level = `h${block.attrs?.level || 2}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
            const sizeClass = block.attrs?.level === 1 ? 'text-3xl' : block.attrs?.level === 2 ? 'text-2xl' : 'text-xl'
            return (
              <Level key={idx} className={`font-display font-bold text-paper mt-6 mb-3 ${sizeClass}`}>
                {block.content?.map((span: any) => span.text).join('')}
              </Level>
            )
          case 'bulletList':
            return (
              <ul key={idx} className="list-disc pl-5 mb-4 space-y-1">
                {block.content?.map((item: any, liIdx: number) => (
                  <li key={liIdx}>
                    {item.content?.map((p: any) => p.content?.map((span: any) => span.text).join('')).join('')}
                  </li>
                ))}
              </ul>
            )
          case 'orderedList':
            return (
              <ol key={idx} className="list-decimal pl-5 mb-4 space-y-1">
                {block.content?.map((item: any, liIdx: number) => (
                  <li key={liIdx}>
                    {item.content?.map((p: any) => p.content?.map((span: any) => span.text).join('')).join('')}
                  </li>
                ))}
              </ol>
            )
          case 'blockquote':
            return (
              <blockquote key={idx} className="border-l-4 border-signal pl-4 italic text-paper my-4">
                {block.content?.map((p: any) => p.content?.map((span: any) => span.text).join('')).join('')}
              </blockquote>
            )
          case 'image':
            return (
              <img
                key={idx}
                src={block.attrs?.src}
                alt={block.attrs?.alt || ''}
                className="my-6 max-h-96 w-full object-cover border border-line"
              />
            )
          default:
            return null
        }
      })
    }
  } catch {
    // Fallback to plain text if not valid JSON
  }

  return <div className="whitespace-pre-wrap">{contentStr}</div>
}

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
          {renderContent(post.content_markdown)}
        </div>
      ) : null}
    </main>
  )
}
