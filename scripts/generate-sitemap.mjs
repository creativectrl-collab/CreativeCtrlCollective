import { writeFileSync, readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const SITE = (
  process.env.VITE_SITE_URL ||
  process.env.SITE_URL ||
  'https://www.creativectrlcollective.org'
).replace(/\/$/, '')

function loadDotEnv() {
  for (const file of ['.env.local', '.env']) {
    const path = resolve(file)
    if (!existsSync(path)) continue
    for (const line of readFileSync(path, 'utf8').split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue
      const [key, ...rest] = trimmed.split('=')
      const name = key.trim()
      if (process.env[name]) continue
      process.env[name] = rest.join('=').trim().replace(/^['"]|['"]$/g, '')
    }
  }
}

function escapeXml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

function urlEntry(loc, lastmod, changefreq, priority) {
  return `  <url>
    <loc>${escapeXml(loc)}</loc>
    ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
}

async function fetchPublishedPosts() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseKey) {
    console.warn('generate-sitemap: missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY; static routes only')
    return []
  }

  const endpoint = `${supabaseUrl.replace(/\/$/, '')}/rest/v1/posts?select=slug,created_at,event_date&is_published=eq.true&order=created_at.desc`
  const response = await fetch(endpoint, {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
    },
  })
  if (!response.ok) {
    const body = await response.text()
    throw new Error(`posts fetch failed ${response.status}: ${body.slice(0, 240)}`)
  }
  return /** @type {{ slug: string, created_at: string, event_date: string | null }[]} */ (
    await response.json()
  )
}

function isoDay(value) {
  if (!value) return undefined
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return undefined
  return date.toISOString().slice(0, 10)
}

async function main() {
  loadDotEnv()
  const today = new Date().toISOString().slice(0, 10)
  const staticRoutes = [
    { path: '/', priority: '1.0', changefreq: 'weekly' },
    { path: '/events', priority: '0.8', changefreq: 'weekly' },
    { path: '/team', priority: '0.7', changefreq: 'monthly' },
    { path: '/updates', priority: '0.8', changefreq: 'daily' },
  ]

  const posts = await fetchPublishedPosts()
  const urls = [
    ...staticRoutes.map((route) => urlEntry(`${SITE}${route.path}`, today, route.changefreq, route.priority)),
    ...posts
      .filter((post) => post.slug)
      .map((post) =>
        urlEntry(
          `${SITE}/posts/${post.slug}`,
          isoDay(post.event_date || post.created_at),
          'weekly',
          '0.6',
        ),
      ),
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`
  const out = resolve('public/sitemap.xml')
  writeFileSync(out, xml)
  console.log(`wrote ${out} (${posts.length} published posts)`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
