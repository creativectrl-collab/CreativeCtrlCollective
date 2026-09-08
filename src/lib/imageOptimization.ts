/**
 * Image optimization utilities for Creative CTRL Collective.
 * Handles client-side compression on upload and URL resolution for thumbnails.
 */

export interface OptimizeOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  format?: 'image/webp' | 'image/jpeg' | 'image/png'
}

/**
 * Derives a thumbnail URL for gallery and preview grids.
 * Works with both newly uploaded -full.webp files and existing -thumb companion files.
 */
export function getThumbnailUrl(imageUrl: string | null | undefined): string {
  if (!imageUrl) return ''
  
  // Already a thumbnail
  if (imageUrl.includes('-thumb.')) {
    return imageUrl
  }

  // Modern naming convention: ...-full.webp -> ...-thumb.webp
  if (imageUrl.includes('-full.')) {
    return imageUrl.replace('-full.', '-thumb.')
  }

  // Existing companion files: .../photo.png -> .../photo-thumb.png
  const lastDot = imageUrl.lastIndexOf('.')
  const lastSlash = imageUrl.lastIndexOf('/')
  if (lastDot > lastSlash) {
    const base = imageUrl.substring(0, lastDot)
    const ext = imageUrl.substring(lastDot)
    return `${base}-thumb${ext}`
  }

  return imageUrl
}

/**
 * Compresses an image in the browser using HTML5 Canvas.
 * Keeps aspect ratio intact while constraining dimensions and file size.
 */
export async function compressImage(
  fileOrBlob: Blob | File,
  options: OptimizeOptions = {}
): Promise<Blob> {
  const {
    maxWidth = 2560,
    maxHeight = 2560,
    quality = 0.85,
    format = 'image/webp'
  } = options

  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(fileOrBlob)

    img.onload = () => {
      URL.revokeObjectURL(url)

      let { width, height } = img

      // Calculate constrained dimensions
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        return reject(new Error('Canvas context not available'))
      }

      // High-quality image rendering
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(img, 0, 0, width, height)

      // Try saving as requested format (WebP by default)
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            // Fallback to JPEG if WebP export is unsupported
            canvas.toBlob(
              (fallbackBlob) => {
                if (fallbackBlob) resolve(fallbackBlob)
                else reject(new Error('Image compression failed'))
              },
              'image/jpeg',
              quality
            )
          }
        },
        format,
        quality
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image for compression'))
    }

    img.src = url
  })
}

/**
 * Creates both Full (zoom-ready, ~1MB-3MB) and Thumbnail (~50KB-90KB) variants
 * for a gallery image upload.
 */
export async function createGalleryPhotoVariants(file: File) {
  const baseId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

  // 1. Full zoomable version (max 2560px, WebP quality 0.85)
  const fullBlob = await compressImage(file, {
    maxWidth: 2560,
    maxHeight: 2560,
    quality: 0.85,
    format: 'image/webp'
  })

  // 2. Thumbnail preview version (max 720px, WebP quality 0.75)
  const thumbBlob = await compressImage(file, {
    maxWidth: 720,
    maxHeight: 720,
    quality: 0.75,
    format: 'image/webp'
  })

  return {
    fullBlob,
    thumbBlob,
    fullFilename: `gallery/${baseId}-full.webp`,
    thumbFilename: `gallery/${baseId}-thumb.webp`
  }
}
