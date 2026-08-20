export const SITE_ORIGIN = (
  import.meta.env.VITE_SITE_URL ?? 'https://www.creativectrlcollective.org'
).replace(/\/$/, '')

export const SEO_DEFAULTS = {
  siteName: 'Creative Ctrl Collective',
  titleTemplate: '%s | Creative Ctrl Collective',
  defaultTitle: 'Creative Ctrl Collective | Sound, Culture & Community',
  description:
    'A multidisciplinary creative collective and production hub in Toronto, ON dedicated to sound curation, artist equity, and live cultural events.',
  ogImagePath: '/og-banner.png',
  ogImageWidth: 1200,
  ogImageHeight: 630,
  locale: 'en_CA',
  twitterCard: 'summary_large_image' as const,
}

export function absoluteUrl(path = '/') {
  if (/^https?:\/\//i.test(path)) return path
  const normalised = path.startsWith('/') ? path : `/${path}`
  return `${SITE_ORIGIN}${normalised}`
}

export function pageTitle(title?: string) {
  if (!title) return SEO_DEFAULTS.defaultTitle
  if (title.includes('Creative Ctrl Collective') || title.includes('Creative CTRL Collective')) {
    return title
  }
  return SEO_DEFAULTS.titleTemplate.replace('%s', title)
}

export const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Creative Ctrl Collective',
  url: SITE_ORIGIN,
  logo: absoluteUrl('/logo.png'),
  sameAs: ['https://instagram.com/creativectrlcollective'],
}
