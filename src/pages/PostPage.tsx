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
        const textStyle = block.attrs?.textAlign ? { textAlign: block.attrs.textAlign } : undefined
        
        switch (block.type) {
          case 'paragraph':
            return (
              <p key={idx} className="mb-4" style={textStyle}>
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
              <Level key={idx} className={`font-display font-bold text-paper mt-6 mb-3 ${sizeClass}`} style={textStyle}>
                {block.content?.map((span: any) => span.text).join('')}
              </Level>
            )
          case 'bulletList':
            return (
              <ul key={idx} className="list-disc pl-5 mb-4 space-y-1" style={textStyle}>
                {block.content?.map((item: any, liIdx: number) => (
                  <li key={liIdx}>
                    {item.content?.map((p: any) => p.content?.map((span: any) => span.text).join('')).join('')}
                  </li>
                ))}
              </ul>
            )
          case 'orderedList':
            return (
              <ol key={idx} className="list-decimal pl-5 mb-4 space-y-1" style={textStyle}>
                {block.content?.map((item: any, liIdx: number) => (
                  <li key={liIdx}>
                    {item.content?.map((p: any) => p.content?.map((span: any) => span.text).join('')).join('')}
                  </li>
                ))}
              </ol>
            )
          case 'blockquote':
            return (
              <blockquote key={idx} className="border-l-4 border-signal pl-4 italic text-paper my-4" style={textStyle}>
                {block.content?.map((p: any) => p.content?.map((span: any) => span.text).join('')).join('')}
              </blockquote>
            )
          case 'image':
            return (
              <img
                key={idx}
                src={block.attrs?.src}
                alt={block.attrs?.alt || ''}
                className={block.attrs?.class || "my-6 max-h-96 w-full object-cover border border-line rounded block mx-auto"}
              />
            )
          case 'audioPlayer':
            return (
              <div key={idx} className="border border-line bg-surface p-4 rounded my-6 max-w-md mx-auto">
                <p className="font-mono text-[10px] text-signal uppercase tracking-wider mb-2 font-bold">Audio Track: {block.attrs?.title}</p>
                <audio src={block.attrs?.src} controls className="w-full outline-none"></audio>
              </div>
            )
          case 'buttonLink':
            return (
              <div key={idx} className="my-6 text-center">
                <a href={block.attrs?.href} target="_blank" rel="noopener noreferrer" className="inline-block bg-signal text-void font-mono text-xs uppercase font-bold tracking-wider px-6 py-3 border border-signal hover:bg-void hover:text-signal transition-colors rounded">
                  {block.attrs?.text}
                </a>
              </div>
            )
          case 'socialLinks':
            const urls = [
              { name: 'INSTAGRAM', url: block.attrs?.instagram },
              { name: 'SOUNDCLOUD', url: block.attrs?.soundcloud },
              { name: 'SPOTIFY', url: block.attrs?.spotify }
            ].filter(u => u.url)
            return (
              <div key={idx} className="flex items-center justify-center gap-6 my-6 py-3 border-y border-line max-w-sm mx-auto">
                {urls.map((u, uIdx) => (
                  <a key={uIdx} href={u.url} target="_blank" rel="noopener noreferrer" className="text-xs font-mono text-mute hover:text-signal transition-colors">
                    {u.name}
                  </a>
                ))}
              </div>
            )
          case 'mediaIframe':
            return (
              <div key={idx} className="w-full aspect-video border border-line rounded bg-void overflow-hidden my-6">
                <iframe src={block.attrs?.src} className="w-full h-full border-none" allow="encrypted-media"></iframe>
              </div>
            )
          case 'imageGallery':
            const imagesList: string[] = block.attrs?.urls ? block.attrs.urls.split(',') : []
            return (
              <div key={idx} className={block.attrs?.class || "grid grid-cols-3 gap-4 my-6 w-full mx-auto block"}>
                {imagesList.map((url, imgIdx) => (
                  <img key={imgIdx} src={url} className="w-full aspect-square object-cover border border-line rounded" alt={`Gallery image ${imgIdx + 1}`} />
                ))}
              </div>
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
