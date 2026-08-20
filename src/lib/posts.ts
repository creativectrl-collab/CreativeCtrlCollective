import { supabase } from './supabase'

export type Post = {
  id: string
  slug: string
  title: string
  excerpt: string | null
  content_markdown: string | null
  cover_image_url: string | null
  event_date: string | null
  is_published: boolean
  created_at: string
  likes_count: number | null
  category: string | null
}

const postSelect =
  'id, slug, title, excerpt, content_markdown, cover_image_url, event_date, is_published, created_at, likes_count, category'

export async function fetchPublishedPosts() {
  const { data, error } = await supabase
    .from('posts')
    .select(postSelect)
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as Post[]
}

export async function fetchPublishedPostBySlug(slug: string) {
  const { data, error } = await supabase
    .from('posts')
    .select(postSelect)
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle()

  if (error) throw error
  return (data ?? null) as Post | null
}

export function isEventPost(post: Post) {
  return Boolean(post.event_date)
}
