export function embedSrcFromUrl(url: string) {
  try {
    if (url.includes('youtube.com/watch')) {
      const id = new URL(url).searchParams.get('v')
      return id ? `https://www.youtube.com/embed/${id}` : url
    }
  } catch {
    // keep original
  }
  if (url.includes('youtu.be/')) {
    const id = url.split('youtu.be/')[1]?.split(/[?&]/)[0]
    return id ? `https://www.youtube.com/embed/${id}` : url
  }
  if (url.includes('open.spotify.com/') && !url.includes('/embed/')) {
    return url.replace('open.spotify.com/', 'open.spotify.com/embed/')
  }
  if (url.includes('soundcloud.com') && !url.includes('w.soundcloud.com')) {
    return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}`
  }
  return url
}
