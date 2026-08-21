import type { CSSProperties, ReactNode } from 'react'

type TipTapNode = {
  type?: string
  text?: string
  marks?: Array<{ type: string; attrs?: Record<string, string> }>
  attrs?: Record<string, string | undefined>
  content?: TipTapNode[]
}

function galleryColClass(cols?: string) {
  if (cols === '2') return 'grid-cols-2'
  if (cols === '4') return 'grid-cols-4'
  return 'grid-cols-3'
}

function renderInline(nodes?: TipTapNode[]): ReactNode {
  if (!nodes?.length) return null
  return nodes.map((span, sIdx) => {
    if (span.type === 'hardBreak') return <br key={sIdx} />
    if (span.type !== 'text' || span.text == null) return null
    let el: ReactNode = span.text
    for (const mark of span.marks ?? []) {
      if (mark.type === 'bold') el = <strong>{el}</strong>
      if (mark.type === 'italic') el = <em>{el}</em>
      if (mark.type === 'code') {
        el = (
          <code className="bg-surface px-1 py-0.5 rounded text-signal font-mono text-xs">{el}</code>
        )
      }
      if (mark.type === 'highlight') {
        el = <mark className="bg-signal/30 text-paper px-0.5 rounded-sm">{el}</mark>
      }
      if (mark.type === 'link' && mark.attrs?.href) {
        el = (
          <a
            href={mark.attrs.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-signal underline hover:text-paper"
          >
            {el}
          </a>
        )
      }
    }
    return <span key={sIdx}>{el}</span>
  })
}

function renderBlock(block: TipTapNode, idx: number): ReactNode {
  const textStyle: CSSProperties | undefined = block.attrs?.textAlign
    ? { textAlign: block.attrs.textAlign as CSSProperties['textAlign'] }
    : undefined

  switch (block.type) {
    case 'paragraph':
      return (
        <p key={idx} className="mb-4" style={textStyle}>
          {renderInline(block.content)}
        </p>
      )
    case 'heading': {
      const level = Number(block.attrs?.level) || 2
      const sizeClass = level === 1 ? 'text-3xl md:text-4xl' : level === 2 ? 'text-2xl' : 'text-xl'
      const className = `font-display font-bold text-paper tracking-tight mt-8 mb-3 ${sizeClass}`
      const children = renderInline(block.content)
      if (level === 1) return <h1 key={idx} className={className} style={textStyle}>{children}</h1>
      if (level === 3) return <h3 key={idx} className={className} style={textStyle}>{children}</h3>
      return <h2 key={idx} className={className} style={textStyle}>{children}</h2>
    }
    case 'bulletList':
      return (
        <ul key={idx} className="list-disc pl-5 mb-4 space-y-1" style={textStyle}>
          {block.content?.map((item, liIdx) => (
            <li key={liIdx}>{item.content?.map((child, cIdx) => renderBlock(child, cIdx))}</li>
          ))}
        </ul>
      )
    case 'orderedList':
      return (
        <ol key={idx} className="list-decimal pl-5 mb-4 space-y-1" style={textStyle}>
          {block.content?.map((item, liIdx) => (
            <li key={liIdx}>{item.content?.map((child, cIdx) => renderBlock(child, cIdx))}</li>
          ))}
        </ol>
      )
    case 'blockquote':
      return (
        <blockquote
          key={idx}
          className="border-l-4 border-signal pl-4 italic text-paper my-4 bg-surface p-4 rounded-r-md"
          style={textStyle}
        >
          {block.content?.map((child, cIdx) => renderBlock(child, cIdx))}
        </blockquote>
      )
    case 'codeBlock':
      return (
        <pre key={idx} className="bg-surface border border-line p-4 font-mono text-xs rounded my-4 text-signal overflow-x-auto">
          <code>{block.content?.map((span) => span.text).join('')}</code>
        </pre>
      )
    case 'horizontalRule':
      return <hr key={idx} className="border-line my-8" />
    case 'image':
      return (
        <img
          key={idx}
          src={block.attrs?.src}
          alt={block.attrs?.alt || ''}
          className={
            block.attrs?.class ||
            'my-6 max-h-96 w-full object-cover border border-line rounded block mx-auto'
          }
        />
      )
    case 'audioPlayer':
      return (
        <div key={idx} className="border border-line bg-surface p-4 rounded my-6 max-w-md mx-auto">
          <p className="font-mono text-[10px] text-signal uppercase tracking-wider mb-2 font-bold">
            Audio Track: {block.attrs?.title}
          </p>
          <audio src={block.attrs?.src} controls className="w-full outline-none" />
        </div>
      )
    case 'buttonLink':
      return (
        <div key={idx} className="my-6 text-center">
          <a
            href={block.attrs?.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-signal text-void font-mono text-xs uppercase font-bold tracking-wider px-6 py-3 border border-signal hover:bg-void hover:text-signal transition-colors rounded"
          >
            {block.attrs?.text}
          </a>
        </div>
      )
    case 'socialLinks': {
      const urls = [
        { name: 'INSTAGRAM', url: block.attrs?.instagram },
        { name: 'SOUNDCLOUD', url: block.attrs?.soundcloud },
        { name: 'SPOTIFY', url: block.attrs?.spotify },
      ].filter((u) => u.url)
      return (
        <div
          key={idx}
          className="flex items-center justify-center gap-6 my-6 py-3 border-y border-line max-w-sm mx-auto"
        >
          {urls.map((u) => (
            <a
              key={u.name}
              href={u.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono text-mute hover:text-signal transition-colors"
            >
              {u.name}
            </a>
          ))}
        </div>
      )
    }
    case 'mediaIframe':
      return (
        <div key={idx} className="w-full aspect-video border border-line rounded bg-void overflow-hidden my-6">
          <iframe
            src={block.attrs?.src}
            className="w-full h-full border-none"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            title="Embedded media"
          />
        </div>
      )
    case 'imageGallery': {
      const imagesList: string[] = block.attrs?.urls ? block.attrs.urls.split(',').filter(Boolean) : []
      return (
        <div
          key={idx}
          className={`grid ${galleryColClass(block.attrs?.cols)} gap-4 my-6 w-full mx-auto`}
        >
          {imagesList.map((url, imgIdx) => (
            <img
              key={imgIdx}
              src={url}
              className="w-full aspect-square object-cover border border-line rounded"
              alt={`Gallery image ${imgIdx + 1}`}
            />
          ))}
        </div>
      )
    }
    default:
      return null
  }
}

export function PostBody({ content }: { content: string }) {
  let json: TipTapNode | null = null
  try {
    json = JSON.parse(content) as TipTapNode
  } catch {
    json = null
  }
  if (json && json.type === 'doc' && Array.isArray(json.content)) {
    return <>{json.content.map((block, idx) => renderBlock(block, idx))}</>
  }
  return <div className="whitespace-pre-wrap">{content}</div>
}
