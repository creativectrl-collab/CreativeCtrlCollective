import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import {
  SEO_DEFAULTS,
  absoluteUrl,
  organizationJsonLd,
  pageTitle,
} from '../seo/defaults'

export type SeoProps = {
  title?: string
  description?: string
  path?: string
  image?: string
  type?: 'website' | 'article' | 'event'
  jsonLd?: Record<string, unknown> | Record<string, unknown>[]
  noIndex?: boolean
}

function upsertMeta(selector: string, attrs: Record<string, string>) {
  const attrName = selector.startsWith('property=') ? 'property' : 'name'
  const attrValue = selector.split('=')[1]
  let el = document.head.querySelector(`meta[${attrName}="${attrValue}"]`) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attrName, attrValue)
    document.head.appendChild(el)
  }
  Object.entries(attrs).forEach(([key, value]) => el!.setAttribute(key, value))
}

function setCanonical(href: string) {
  let link = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
  if (!link) {
    link = document.createElement('link')
    link.rel = 'canonical'
    document.head.appendChild(link)
  }
  link.href = href
}

function setJsonLd(id: string, data: unknown) {
  let script = document.getElementById(id) as HTMLScriptElement | null
  if (!script) {
    script = document.createElement('script')
    script.id = id
    script.type = 'application/ld+json'
    document.head.appendChild(script)
  }
  script.textContent = JSON.stringify(data)
}

export function Seo({
  title,
  description = SEO_DEFAULTS.description,
  path,
  image,
  type = 'website',
  jsonLd,
  noIndex = false,
}: SeoProps) {
  const location = useLocation()
  const canonical = absoluteUrl(path ?? location.pathname)
  const fullTitle = pageTitle(title)
  const ogImage = absoluteUrl(image ?? SEO_DEFAULTS.ogImagePath)

  useEffect(() => {
    document.title = fullTitle
    upsertMeta('name=description', { content: description })
    upsertMeta('name=robots', { content: noIndex ? 'noindex, nofollow' : 'index, follow' })
    setCanonical(canonical)

    upsertMeta('property=og:site_name', { content: SEO_DEFAULTS.siteName })
    upsertMeta('property=og:locale', { content: SEO_DEFAULTS.locale })
    upsertMeta('property=og:type', { content: type === 'event' ? 'website' : type })
    upsertMeta('property=og:title', { content: fullTitle })
    upsertMeta('property=og:description', { content: description })
    upsertMeta('property=og:url', { content: canonical })
    upsertMeta('property=og:image', { content: ogImage })
    upsertMeta('property=og:image:width', { content: String(SEO_DEFAULTS.ogImageWidth) })
    upsertMeta('property=og:image:height', { content: String(SEO_DEFAULTS.ogImageHeight) })
    upsertMeta('property=og:image:alt', { content: fullTitle })

    upsertMeta('name=twitter:card', { content: SEO_DEFAULTS.twitterCard })
    upsertMeta('name=twitter:title', { content: fullTitle })
    upsertMeta('name=twitter:description', { content: description })
    upsertMeta('name=twitter:image', { content: ogImage })

    const graph = jsonLd
      ? [organizationJsonLd, ...(Array.isArray(jsonLd) ? jsonLd : [jsonLd])]
      : organizationJsonLd
    setJsonLd('seo-jsonld', graph)
  }, [fullTitle, description, canonical, ogImage, type, jsonLd, noIndex])

  return null
}
