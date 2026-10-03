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
 * Derives base-thumb.webp from master base.webp, preserves legacy -full.webp to -thumb.webp rewrite,
 * and leaves existing -thumb companion files intact without double-suffixing.
 */
export function getThumbnailUrl(imageUrl: string | null | undefined): string {
  if (!imageUrl) return ''
  
  // Already a thumbnail
  if (imageUrl.includes('-thumb.')) {
    return imageUrl
  }

  // Legacy naming convention: ...-full.webp -> ...-thumb.webp
  if (imageUrl.includes('-full.')) {
    return imageUrl.replace('-full.', '-thumb.')
  }

  // Master companion files: .../base.webp -> .../base-thumb.webp (also supports legacy photo.png -> photo-thumb.png)
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
    maxWidth = 2048,
    maxHeight = 2048,
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

export interface PhotoVariantsOptions {
  folder?: string
  fullMaxEdge?: number
}

/**
 * Creates both Master (zoom-ready, max edge 2048) and Thumbnail (preview, max edge 480) variants
 * for an image upload. Supports custom target folder and master-image max edge.
 */
export async function createGalleryPhotoVariants(
  file: File,
  optionsOrFolder?: PhotoVariantsOptions | string,
  legacyFullMaxEdge?: number
) {
  let folder = 'gallery'
  let fullMaxEdge = 2048

  if (typeof optionsOrFolder === 'string') {
    folder = optionsOrFolder
    if (typeof legacyFullMaxEdge === 'number') {
      fullMaxEdge = legacyFullMaxEdge
    }
  } else if (optionsOrFolder && typeof optionsOrFolder === 'object') {
    if (optionsOrFolder.folder !== undefined) {
      folder = optionsOrFolder.folder
    }
    if (optionsOrFolder.fullMaxEdge !== undefined) {
      fullMaxEdge = optionsOrFolder.fullMaxEdge
    }
  }

  // Strip trailing slashes from folder
  folder = folder.replace(/\/+$/, '')

  const baseId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

  // 1. Master zoomable version (default max 2048px or custom fullMaxEdge, WebP quality 0.85)
  const fullBlob = await compressImage(file, {
    maxWidth: fullMaxEdge,
    maxHeight: fullMaxEdge,
    quality: 0.85,
    format: 'image/webp'
  })

  // 2. Thumbnail preview version (max 480px, WebP quality 0.75)
  const thumbBlob = await compressImage(file, {
    maxWidth: 480,
    maxHeight: 480,
    quality: 0.75,
    format: 'image/webp'
  })

  return {
    fullBlob,
    thumbBlob,
    fullFilename: `${folder}/${baseId}.webp`,
    thumbFilename: `${folder}/${baseId}-thumb.webp`
  }
}

