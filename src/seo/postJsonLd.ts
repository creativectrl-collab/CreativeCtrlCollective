import type { Post } from '../lib/posts'
import { isEventPost } from '../lib/posts'
import { SEO_DEFAULTS, absoluteUrl } from './defaults'

export function postJsonLd(post: Post, canonical: string) {
  const image = post.cover_image_url
    ? absoluteUrl(post.cover_image_url)
    : absoluteUrl(SEO_DEFAULTS.ogImagePath)

  if (isEventPost(post)) {
    return {
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: post.title,
      description: post.excerpt ?? undefined,
      image,
      startDate: post.event_date,
      url: canonical,
      eventStatus: 'https://schema.org/EventScheduled',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      organizer: {
        '@type': 'Organization',
        name: SEO_DEFAULTS.siteName,
        url: absoluteUrl('/'),
      },
    }
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt ?? undefined,
    image,
    datePublished: post.created_at,
    mainEntityOfPage: canonical,
    url: canonical,
    author: {
      '@type': 'Organization',
      name: SEO_DEFAULTS.siteName,
    },
  }
}
