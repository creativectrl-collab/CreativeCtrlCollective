import { useState, useEffect, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Highlight from '@tiptap/extension-highlight'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import { Node } from '@tiptap/core'
import { embedSrcFromUrl } from '../../lib/embedUrl'
import { supabase } from '../../lib/supabase'

// 1. Audio Custom Node
const AudioNode = Node.create({
  name: 'audioPlayer',
  group: 'block',
  atom: true,
  addAttributes() {
    return {
      src: { default: null },
      title: { default: 'Audio Track' }
    }
  },
  parseHTML() {
    return [{ tag: 'audio-player' }]
  },
  renderHTML({ HTMLAttributes }) {
    return [
      'div', 
      { class: 'border border-line bg-surface p-4 rounded my-6 max-w-md mx-auto pointer-events-auto' },
      ['p', { class: 'font-mono text-[10px] text-signal uppercase tracking-wider mb-2 font-bold' }, `Audio Track: ${HTMLAttributes.title}`],
      ['audio', { src: HTMLAttributes.src, controls: 'true', class: 'w-full outline-none' }]
    ]
  }
})

// 2. Button Link Custom Node
const ButtonLinkNode = Node.create({
  name: 'buttonLink',
  group: 'block',
  atom: true,
  addAttributes() {
    return {
      href: { default: '#' },
      text: { default: 'Click Here' }
    }
  },
  parseHTML() {
    return [{ tag: 'button-link' }]
  },
  renderHTML({ HTMLAttributes }) {
    return [
      'div', 
      { class: 'my-6 text-center' },
      [
        'a', 
        { 
          href: HTMLAttributes.href, 
          target: '_blank', 
          class: 'inline-block bg-signal text-void font-mono text-xs uppercase font-bold tracking-wider px-6 py-3 border border-signal hover:bg-void hover:text-signal transition-colors rounded'
        }, 
        HTMLAttributes.text
      ]
    ]
  }
})

// 3. Social Links Custom Node
const SocialLinksNode = Node.create({
  name: 'socialLinks',
  group: 'block',
  atom: true,
  addAttributes() {
    return {
      instagram: { default: '' },
      soundcloud: { default: '' },
      spotify: { default: '' }
    }
  },
  parseHTML() {
    return [{ tag: 'social-links' }]
  },
  renderHTML({ HTMLAttributes }) {
    const list: any[] = ['div', { class: 'flex items-center justify-center gap-6 my-6 py-3 border-y border-line max-w-sm mx-auto' }]
    if (HTMLAttributes.instagram) {
      list.push(['a', { href: HTMLAttributes.instagram, target: '_blank', class: 'text-xs font-mono text-mute hover:text-signal transition-colors' }, 'INSTAGRAM'])
    }
    if (HTMLAttributes.soundcloud) {
      list.push(['a', { href: HTMLAttributes.soundcloud, target: '_blank', class: 'text-xs font-mono text-mute hover:text-signal transition-colors' }, 'SOUNDCLOUD'])
    }
    if (HTMLAttributes.spotify) {
      list.push(['a', { href: HTMLAttributes.spotify, target: '_blank', class: 'text-xs font-mono text-mute hover:text-signal transition-colors' }, 'SPOTIFY'])
    }
    return list as any
  }
})

// 4. Iframe Custom Node
const IframeNode = Node.create({
  name: 'mediaIframe',
  group: 'block',
  atom: true,
  addAttributes() {
    return {
      src: { default: '' }
    }
  },
  parseHTML() {
    return [{ tag: 'media-iframe' }]
  },
  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      { class: 'w-full aspect-video border border-line rounded bg-void overflow-hidden my-6' },
      ['iframe', { src: HTMLAttributes.src, class: 'w-full h-full border-none', allow: 'encrypted-media' }]
    ]
  }
})

// 5. Gallery Custom Node
const GalleryNode = Node.create({
  name: 'imageGallery',
  group: 'block',
  atom: true,
  addAttributes() {
    return {
      urls: { default: '' },
      cols: { default: '3' },
      class: { default: 'grid grid-cols-3 gap-4 my-6 w-full mx-auto' }
    }
  },
  parseHTML() {
    return [{ tag: 'image-gallery' }]
  },
  renderHTML({ HTMLAttributes }) {
    const urls: string[] = HTMLAttributes.urls ? HTMLAttributes.urls.split(',') : []
    const colClass = HTMLAttributes.cols === '2' ? 'grid-cols-2' : HTMLAttributes.cols === '4' ? 'grid-cols-4' : 'grid-cols-3'
    const list: any[] = ['div', { class: HTMLAttributes.class || `grid ${colClass} gap-4 my-6 w-full mx-auto` }]
    urls.forEach((url, i) => {
      list.push(['img', { src: url, class: 'w-full aspect-square object-cover border border-line rounded', alt: `Gallery image ${i + 1}` }])
    })
    return list as any
  }
})

interface ModalConfig {
  title: string
  inputs: Array<{ key: string; label: string; placeholder?: string }>
  onSubmit: (values: Record<string, string>) => void
}

export function BlockEditor({ initialContent, onChange }: { initialContent: string, onChange: (content: string) => void }) {
  const [showSlashMenu, setShowSlashMenu] = useState(false)
  const [slashMenuCoords, setSlashMenuCoords] = useState({ top: 0, left: 0 })
  
  // Custom Modal state
  const [modalConfig, setModalConfig] = useState<ModalConfig | null>(null)
  const [modalValues, setModalValues] = useState<Record<string, string>>({})

  const fileInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const audioInputRef = useRef<HTMLInputElement>(null)

  // Parse initial content safely
  const parsedContent = (() => {
    if (!initialContent) return undefined
    try {
      return JSON.parse(initialContent)
    } catch {
      return {
        type: 'doc',
        content: [{ type: 'paragraph', content: [{ type: 'text', text: initialContent }] }]
      }
    }
  })()

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        blockquote: {
          HTMLAttributes: {
            class: 'border-l-4 border-signal pl-4 italic text-paper my-6 bg-surface p-4 rounded-r-md',
          },
        },
        codeBlock: {
          HTMLAttributes: {
            class: 'bg-surface border border-line p-4 font-mono text-xs rounded my-4 text-signal overflow-x-auto',
          },
        },
      }),
      Placeholder.configure({
        placeholder: 'Write the story. Type / for headings, lists, and widgets.',
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-signal underline hover:text-paper transition-colors',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto border border-line my-6 rounded transition-all duration-300 block mx-auto',
        },
      }),
      Highlight.configure({
        multicolor: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      AudioNode,
      ButtonLinkNode,
      SocialLinksNode,
      IframeNode,
      GalleryNode,
    ],
    content: parsedContent,
    onUpdate: ({ editor }) => {
      onChange(JSON.stringify(editor.getJSON()))
    },
    editorProps: {
      attributes: {
        class: 'min-h-[450px] outline-none text-paper font-sans text-sm leading-relaxed p-6 bg-void border border-line focus:border-signal transition-colors',
      },
      handleDOMEvents: {
        keydown: (view, event) => {
          if (event.key === '/' && !showSlashMenu) {
            const { selection } = view.state
            const coords = view.coordsAtPos(selection.from)
            setSlashMenuCoords({
              top: coords.bottom + window.scrollY,
              left: coords.left + window.scrollX,
            })
            setShowSlashMenu(true)
          } else if (event.key === 'Escape') {
            setShowSlashMenu(false)
          }
          return false
        },
        drop: (_view, event) => {
          event.preventDefault()
          const files = event.dataTransfer?.files
          if (files && files.length > 0) {
            handleImageUpload(files[0])
          }
          return true
        },
      },
    },
  })

  useEffect(() => {
    if (!editor) return
    if (!initialContent) {
      editor.commands.clearContent()
      return
    }
    try {
      const currentJson = JSON.stringify(editor.getJSON())
      if (initialContent !== currentJson) {
        editor.commands.setContent(JSON.parse(initialContent))
      }
    } catch {
      if (initialContent !== editor.getText()) {
        editor.commands.setContent(initialContent)
      }
    }
  }, [initialContent, editor])

  // Open the custom modal
  function openModal(config: ModalConfig) {
    const initialVals: Record<string, string> = {}
    config.inputs.forEach(inp => {
      initialVals[inp.key] = ''
    })
    setModalValues(initialVals)
    setModalConfig(config)
  }

  // Helper to ensure editor gets focused and commands run correctly
  function executeCommand(cb: () => void) {
    if (!editor) return
    editor.commands.focus()
    cb()
  }

  // Handle slash commands
  async function runCommand(type: string) {
    if (!editor) return
    
    // Remove the "/"
    const { selection } = editor.state
    editor.commands.deleteRange({ from: selection.from - 1, to: selection.from })

    switch (type) {
      case 'h1':
        executeCommand(() => editor.chain().toggleHeading({ level: 1 }).run())
        break
      case 'h2':
        executeCommand(() => editor.chain().toggleHeading({ level: 2 }).run())
        break
      case 'h3':
        executeCommand(() => editor.chain().toggleHeading({ level: 3 }).run())
        break
      case 'bullet':
        executeCommand(() => editor.chain().toggleBulletList().run())
        break
      case 'ordered':
        executeCommand(() => editor.chain().toggleOrderedList().run())
        break
      case 'quote':
        executeCommand(() => editor.chain().toggleBlockquote().run())
        break
      case 'divider':
        executeCommand(() => editor.chain().setHorizontalRule().run())
        break
      case 'image':
        fileInputRef.current?.click()
        break
      case 'gallery':
        galleryInputRef.current?.click()
        break
      case 'audio':
        audioInputRef.current?.click()
        break
      case 'btn':
        openModal({
          title: 'Insert Link Button',
          inputs: [
            { key: 'text', label: 'Button Label', placeholder: 'e.g. Listen Now' },
            { key: 'href', label: 'Button URL', placeholder: 'e.g. https://spotify.com/track' }
          ],
          onSubmit: (vals) => {
            if (vals.text && vals.href) {
              executeCommand(() => {
                editor.commands.insertContent({
                  type: 'buttonLink',
                  attrs: { href: vals.href, text: vals.text }
                })
              })
            }
          }
        })
        break
      case 'social':
        openModal({
          title: 'Insert Social Icons Row',
          inputs: [
            { key: 'instagram', label: 'Instagram URL (optional)', placeholder: 'https://instagram.com/...' },
            { key: 'soundcloud', label: 'SoundCloud URL (optional)', placeholder: 'https://soundcloud.com/...' },
            { key: 'spotify', label: 'Spotify URL (optional)', placeholder: 'https://open.spotify.com/...' }
          ],
          onSubmit: (vals) => {
            if (vals.instagram || vals.soundcloud || vals.spotify) {
              executeCommand(() => {
                editor.commands.insertContent({
                  type: 'socialLinks',
                  attrs: { instagram: vals.instagram || '', soundcloud: vals.soundcloud || '', spotify: vals.spotify || '' }
                })
              })
            }
          }
        })
        break
      case 'embed':
        openModal({
          title: 'Insert Media Embed Link',
          inputs: [
            { key: 'url', label: 'YouTube, Spotify, or SoundCloud link', placeholder: 'Enter share URL' }
          ],
          onSubmit: (vals) => {
            if (vals.url) {
              executeCommand(() => {
                editor.commands.insertContent({
                  type: 'mediaIframe',
                  attrs: { src: embedSrcFromUrl(vals.url) }
                })
              })
            }
          }
        })
        break
    }
    setShowSlashMenu(false)
  }

  // Upload Single Image
  async function handleImageUpload(file: File) {
    if (!editor) return
    const fileName = `${Date.now()}-${file.name}`
    try {
      const { data, error } = await supabase.storage
        .from('public-media')
        .upload(`uploads/${fileName}`, file, { upsert: true })

      if (error) throw error

      const publicUrl = supabase.storage
        .from('public-media')
        .getPublicUrl(data.path).data.publicUrl

      executeCommand(() => {
        editor.chain().setImage({ src: publicUrl, alt: 'Blog Image' }).run()
      })
    } catch (err: any) {
      alert(`Upload failed: ${err.message}`)
    }
  }

  // Upload Multi-Image Gallery
  async function handleGalleryUpload(files: FileList) {
    if (!editor) return
    const uploadedUrls: string[] = []
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const fileName = `${Date.now()}-${i}-${file.name}`
      try {
        const { data, error } = await supabase.storage
          .from('public-media')
          .upload(`uploads/${fileName}`, file, { upsert: true })

        if (error) throw error

        const publicUrl = supabase.storage
          .from('public-media')
          .getPublicUrl(data.path).data.publicUrl
        uploadedUrls.push(publicUrl)
      } catch (err: any) {
        console.error('Gallery file upload failed:', err.message)
      }
    }

    if (uploadedUrls.length > 0) {
      openModal({
        title: 'Choose Gallery Layout Columns',
        inputs: [
          { key: 'cols', label: 'Columns (2, 3, or 4)', placeholder: '3' }
        ],
        onSubmit: (vals) => {
          const colsCount = ['2', '3', '4'].includes(vals.cols) ? vals.cols : '3'
          executeCommand(() => {
            editor.commands.insertContent({
              type: 'imageGallery',
              attrs: {
                urls: uploadedUrls.join(','),
                cols: colsCount,
              }
            })
          })
        }
      })
    }
  }

  // Upload Audio File
  async function handleAudioUpload(file: File) {
    if (!editor) return
    const fileName = `${Date.now()}-${file.name}`
    try {
      const { data, error } = await supabase.storage
        .from('public-media')
        .upload(`uploads/${fileName}`, file, { upsert: true })

      if (error) throw error

      const publicUrl = supabase.storage
        .from('public-media')
        .getPublicUrl(data.path).data.publicUrl

      executeCommand(() => {
        editor.commands.insertContent({
          type: 'audioPlayer',
          attrs: { src: publicUrl, title: file.name.split('.')[0] }
        })
      })
    } catch (err: any) {
      alert(`Audio upload failed: ${err.message}`)
    }
  }

  // Apply align classes/floats stably (does not move bubble menu)
  function applyFloat(alignment: 'left' | 'right' | 'center' | 'full') {
    if (!editor) return
    executeCommand(() => {
      if (editor.isActive('image')) {
        const currentAttrs = editor.getAttributes('image')
        const currentClass = currentAttrs?.class || ''
        
        let widthClass = 'w-full'
        if (currentClass.includes('w-1/4')) widthClass = 'w-1/4'
        else if (currentClass.includes('w-1/2')) widthClass = 'w-1/2'
        else if (currentClass.includes('w-3/4')) widthClass = 'w-3/4'
        
        let floatClass = 'mx-auto block'
        if (alignment === 'left') floatClass = 'float-left mr-6 mb-4'
        else if (alignment === 'right') floatClass = 'float-right ml-6 mb-4'
        else if (alignment === 'full') {
          floatClass = 'block mx-auto'
          widthClass = 'w-full'
        }
        
        const alignClass = `${widthClass} h-auto border border-line my-4 rounded ${floatClass} transition-all duration-300`
        editor.chain().updateAttributes('image', { class: alignClass }).run()
      } else if (editor.isActive('imageGallery')) {
        const currentAttrs = editor.getAttributes('imageGallery')
        const cols = currentAttrs?.cols || '3'
        const colClass = cols === '2' ? 'grid-cols-2' : cols === '4' ? 'grid-cols-4' : 'grid-cols-3'
        
        let floatClass = 'mx-auto block w-full'
        if (alignment === 'left') floatClass = 'float-left mr-6 mb-4 w-[48%]'
        else if (alignment === 'right') floatClass = 'float-right ml-6 mb-4 w-[48%]'
        else if (alignment === 'center') floatClass = 'mx-auto block w-[75%]'
        
        const alignClass = `grid ${colClass} gap-4 my-6 rounded ${floatClass} transition-all duration-300`
        editor.chain().updateAttributes('imageGallery', { class: alignClass }).run()
      }
    })
  }

  // Resize image width stably
  function applyImageWidth(width: '25' | '50' | '75' | '100') {
    if (!editor) return
    executeCommand(() => {
      if (editor.isActive('image')) {
        const currentAttrs = editor.getAttributes('image')
        const currentClass = currentAttrs?.class || ''
        
        let floatClass = 'mx-auto block'
        if (currentClass.includes('float-left')) floatClass = 'float-left mr-6 mb-4'
        else if (currentClass.includes('float-right')) floatClass = 'float-right ml-6 mb-4'
        
        let widthClass = 'w-full'
        if (width === '25') widthClass = 'w-1/4'
        else if (width === '50') widthClass = 'w-1/2'
        else if (width === '75') widthClass = 'w-3/4'
        
        const alignClass = `${widthClass} h-auto border border-line my-4 rounded ${floatClass} transition-all duration-300`
        editor.chain().updateAttributes('image', { class: alignClass }).run()
      }
    })
  }

  // Change Gallery columns
  function applyGalleryCols(cols: string) {
    if (!editor) return
    executeCommand(() => {
      if (editor.isActive('imageGallery')) {
        const currentAttrs = editor.getAttributes('imageGallery')
        const currentClass = currentAttrs?.class || ''
        const colClass = cols === '2' ? 'grid-cols-2' : cols === '4' ? 'grid-cols-4' : 'grid-cols-3'
        const stripped = currentClass.replace(/grid-cols-\d+/g, '').trim()
        editor.chain().updateAttributes('imageGallery', {
          cols,
          class: `grid ${colClass} gap-4 my-6 ${stripped}`.replace(/\s+/g, ' ').trim(),
        }).run()
      }
    })
  }

  // Close menus on click outside
  useEffect(() => {
    function handleClick() {
      setShowSlashMenu(false)
    }
    window.addEventListener('click', handleClick)
    return () => window.removeEventListener('click', handleClick)
  }, [])

  // Explicitly verify the selection is text and not any of our custom blocks/widgets
  const isSelectionText = editor ? (
    !editor.state.selection.empty && 
    !editor.isActive('image') && 
    !editor.isActive('imageGallery') && 
    !editor.isActive('audioPlayer') && 
    !editor.isActive('buttonLink') && 
    !editor.isActive('socialLinks') && 
    !editor.isActive('mediaIframe')
  ) : false
  const isSelectionImage = editor ? editor.isActive('image') : false
  const isSelectionGallery = editor ? editor.isActive('imageGallery') : false

  return (
    <div className="relative border border-line bg-void rounded overflow-hidden">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={(e) => {
          const files = e.target.files
          if (files && files.length > 0) handleImageUpload(files[0])
        }}
        className="hidden" 
        accept="image/*"
      />
      <input 
        type="file" 
        ref={galleryInputRef} 
        multiple
        onChange={(e) => {
          const files = e.target.files
          if (files && files.length > 0) handleGalleryUpload(files)
        }}
        className="hidden" 
        accept="image/*"
      />
      <input 
        type="file" 
        ref={audioInputRef} 
        onChange={(e) => {
          const files = e.target.files
          if (files && files.length > 0) handleAudioUpload(files[0])
        }}
        className="hidden" 
        accept="audio/*"
      />

      {/* Visual Wix/WordPress Style Toolbar */}
      {editor && (
        <div className="flex flex-col gap-2 border-b border-line bg-surface p-3 font-mono text-[10px]">
          {/* Main Toolbar */}
          <div className="flex flex-wrap items-center gap-y-2 gap-x-3">
            <div className="flex items-center gap-1">
              <span className="text-mute uppercase mr-1">Blocks:</span>
              {([
                ['H1', () => editor.chain().focus().toggleHeading({ level: 1 }).run(), editor.isActive('heading', { level: 1 })],
                ['H2', () => editor.chain().focus().toggleHeading({ level: 2 }).run(), editor.isActive('heading', { level: 2 })],
                ['H3', () => editor.chain().focus().toggleHeading({ level: 3 }).run(), editor.isActive('heading', { level: 3 })],
                ['List', () => editor.chain().focus().toggleBulletList().run(), editor.isActive('bulletList')],
                ['Quote', () => editor.chain().focus().toggleBlockquote().run(), editor.isActive('blockquote')],
              ] as const).map(([label, onClick, active]) => (
                <button
                  key={label}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={onClick}
                  className={`px-2 py-1 border rounded ${active ? 'border-signal bg-signal text-void' : 'border-line text-paper hover:bg-void'}`}
                >
                  {label}
                </button>
              ))}
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().setHorizontalRule().run()} className="px-2 py-1 border border-line text-paper hover:bg-void rounded">Divider</button>
            </div>

            <span className="h-5 w-[1px] bg-line hidden sm:inline-block"></span>

            <div className="flex flex-wrap items-center gap-1">
              <span className="text-signal uppercase mr-1 font-bold">Widgets:</span>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => fileInputRef.current?.click()} className="px-2 py-1 border border-signal text-signal hover:bg-void rounded">+ Image</button>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => galleryInputRef.current?.click()} className="px-2 py-1 border border-line text-paper hover:bg-void rounded">+ Gallery</button>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => audioInputRef.current?.click()} className="px-2 py-1 border border-line text-paper hover:bg-void rounded">+ Audio Player</button>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => {
                openModal({
                  title: 'Insert Link Button',
                  inputs: [
                    { key: 'text', label: 'Button Label', placeholder: 'e.g. Listen Now' },
                    { key: 'href', label: 'Button URL', placeholder: 'e.g. https://spotify.com/track' }
                  ],
                  onSubmit: (vals) => {
                    if (vals.text && vals.href) {
                      executeCommand(() => {
                        editor.commands.insertContent({
                          type: 'buttonLink',
                          attrs: { href: vals.href, text: vals.text }
                        })
                      })
                    }
                  }
                })
              }} className="px-2 py-1 border border-line text-paper hover:bg-void rounded">+ Button Link</button>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => {
                openModal({
                  title: 'Insert Social Icons Row',
                  inputs: [
                    { key: 'instagram', label: 'Instagram URL (optional)', placeholder: 'https://instagram.com/...' },
                    { key: 'soundcloud', label: 'SoundCloud URL (optional)', placeholder: 'https://soundcloud.com/...' },
                    { key: 'spotify', label: 'Spotify URL (optional)', placeholder: 'https://open.spotify.com/...' }
                  ],
                  onSubmit: (vals) => {
                    if (vals.instagram || vals.soundcloud || vals.spotify) {
                      executeCommand(() => {
                        editor.commands.insertContent({
                          type: 'socialLinks',
                          attrs: { instagram: vals.instagram || '', soundcloud: vals.soundcloud || '', spotify: vals.spotify || '' }
                        })
                      })
                    }
                  }
                })
              }} className="px-2 py-1 border border-line text-paper hover:bg-void rounded">+ Social Icons</button>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => {
                openModal({
                  title: 'Insert Media Embed Link',
                  inputs: [
                    { key: 'url', label: 'YouTube, Spotify, or SoundCloud link', placeholder: 'Enter share URL' }
                  ],
                  onSubmit: (vals) => {
                    if (vals.url) {
                      executeCommand(() => {
                        editor.commands.insertContent({
                          type: 'mediaIframe',
                          attrs: { src: embedSrcFromUrl(vals.url) },
                        })
                      })
                    }
                  }
                })
              }} className="px-2 py-1 border border-line text-paper hover:bg-void rounded">+ Embed Link</button>
            </div>
          </div>

          {/* Stable Image Settings Sub-Bar */}
          {isSelectionImage && (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 pt-1.5 border-t border-line transition-all duration-300">
              <span className="text-signal uppercase mr-1">Image Align:</span>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => applyFloat('left')} className="px-2 py-0.5 border border-line hover:border-paper text-paper rounded">Float Left</button>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => applyFloat('right')} className="px-2 py-0.5 border border-line hover:border-paper text-paper rounded">Float Right</button>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => applyFloat('center')} className="px-2 py-0.5 border border-line hover:border-paper text-paper rounded">Center</button>
              
              <span className="h-4 w-[1px] bg-line mx-1"></span>
              
              <span className="text-signal uppercase mr-1">Image Size:</span>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => applyImageWidth('25')} className="px-2 py-0.5 border border-line hover:border-paper text-paper rounded">25%</button>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => applyImageWidth('50')} className="px-2 py-0.5 border border-line hover:border-paper text-paper rounded">50%</button>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => applyImageWidth('75')} className="px-2 py-0.5 border border-line hover:border-paper text-paper rounded">75%</button>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => applyImageWidth('100')} className="px-2 py-0.5 border border-line hover:border-paper text-paper rounded">100%</button>
            </div>
          )}

          {/* Stable Gallery Settings Sub-Bar */}
          {isSelectionGallery && (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 pt-1.5 border-t border-line transition-all duration-300">
              <span className="text-signal uppercase mr-1">Gallery Align:</span>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => applyFloat('left')} className="px-2 py-0.5 border border-line hover:border-paper text-paper rounded">Float Left</button>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => applyFloat('right')} className="px-2 py-0.5 border border-line hover:border-paper text-paper rounded">Float Right</button>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => applyFloat('center')} className="px-2 py-0.5 border border-line hover:border-paper text-paper rounded">Center</button>
              
              <span className="h-4 w-[1px] bg-line mx-1"></span>
              
              <span className="text-signal uppercase mr-1">Columns:</span>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => applyGalleryCols('2')} className="px-2 py-0.5 border border-line hover:border-paper text-paper rounded">2 Cols</button>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => applyGalleryCols('3')} className="px-2 py-0.5 border border-line hover:border-paper text-paper rounded">3 Cols</button>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => applyGalleryCols('4')} className="px-2 py-0.5 border border-line hover:border-paper text-paper rounded">4 Cols</button>
            </div>
          )}
        </div>
      )}

      {editor && (
        <BubbleMenu 
          editor={editor} 
          className="flex flex-wrap items-center gap-1 border border-line bg-surface p-1 shadow-xl rounded max-w-xs sm:max-w-md"
        >
          {/* Format Settings (ONLY show when actual text is selected) */}
          {isSelectionText && (
            <>
              <button 
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`px-2 py-1 text-xs font-mono rounded ${editor.isActive('bold') ? 'bg-signal text-void' : 'text-paper hover:bg-void'}`}
              >
                B
              </button>
              <button 
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`px-2 py-1 text-xs font-mono rounded ${editor.isActive('italic') ? 'bg-signal text-void' : 'text-paper hover:bg-void'}`}
              >
                I
              </button>
              <button 
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => editor.chain().focus().toggleCode().run()}
                className={`px-2 py-1 text-xs font-mono rounded ${editor.isActive('code') ? 'bg-signal text-void' : 'text-paper hover:bg-void'}`}
              >
                Code
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  if (editor.isActive('link')) {
                    editor.chain().focus().unsetLink().run()
                    return
                  }
                  openModal({
                    title: 'Add link',
                    inputs: [{ key: 'href', label: 'URL', placeholder: 'https://' }],
                    onSubmit: (vals) => {
                      if (vals.href) editor.chain().focus().setLink({ href: vals.href }).run()
                    },
                  })
                }}
                className={`px-2 py-1 text-xs font-mono rounded ${editor.isActive('link') ? 'bg-signal text-void' : 'text-paper hover:bg-void'}`}
              >
                Link
              </button>
              <button 
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  if (editor.isActive('highlight')) {
                    editor.chain().focus().unsetHighlight().run()
                  } else {
                    editor.chain().focus().setHighlight({ color: '#d4ff3f' }).run()
                  }
                }}
                className={`px-2 py-1 text-xs font-mono rounded ${editor.isActive('highlight') ? 'bg-signal text-void' : 'text-paper hover:bg-void'}`}
              >
                Glow
              </button>

              {/* Alignment controls */}
              <span className="h-4 w-[1px] bg-line mx-1"></span>
              <button 
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => editor.chain().focus().setTextAlign('left').run()}
                className={`px-2 py-1 text-xs font-mono rounded ${editor.isActive({ textAlign: 'left' }) ? 'bg-signal text-void' : 'text-paper hover:bg-void'}`}
              >
                Left
              </button>
              <button 
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => editor.chain().focus().setTextAlign('center').run()}
                className={`px-2 py-1 text-xs font-mono rounded ${editor.isActive({ textAlign: 'center' }) ? 'bg-signal text-void' : 'text-paper hover:bg-void'}`}
              >
                Ctr
              </button>
              <button 
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => editor.chain().focus().setTextAlign('right').run()}
                className={`px-2 py-1 text-xs font-mono rounded ${editor.isActive({ textAlign: 'right' }) ? 'bg-signal text-void' : 'text-paper hover:bg-void'}`}
              >
                Rgt
              </button>
            </>
          )}
        </BubbleMenu>
      )}

      <EditorContent editor={editor} />

      {/* Slash Commands Dropdown */}
      {showSlashMenu && (
        <div 
          onClick={(e) => e.stopPropagation()}
          className="absolute z-50 flex flex-col gap-0.5 border border-line bg-surface p-1 shadow-2xl rounded max-h-64 overflow-y-auto w-56 font-mono text-xs text-paper"
          style={{ top: `${slashMenuCoords.top - 420}px`, left: `${slashMenuCoords.left - 20}px` }}
        >
          <p className="px-2 py-1 text-[10px] text-mute uppercase tracking-widest border-b border-line mb-1">Visual Toolbox</p>
          <button onClick={() => runCommand('h1')} className="flex items-center gap-2 px-2 py-1.5 hover:bg-void rounded text-left">Heading 1</button>
          <button onClick={() => runCommand('h2')} className="flex items-center gap-2 px-2 py-1.5 hover:bg-void rounded text-left">Heading 2</button>
          <button onClick={() => runCommand('h3')} className="flex items-center gap-2 px-2 py-1.5 hover:bg-void rounded text-left">Heading 3</button>
          <button onClick={() => runCommand('bullet')} className="flex items-center gap-2 px-2 py-1.5 hover:bg-void rounded text-left">Bulleted List</button>
          <button onClick={() => runCommand('ordered')} className="flex items-center gap-2 px-2 py-1.5 hover:bg-void rounded text-left">Ordered List</button>
          <button onClick={() => runCommand('quote')} className="flex items-center gap-2 px-2 py-1.5 hover:bg-void rounded text-left">Quote Block</button>
          <button onClick={() => runCommand('divider')} className="flex items-center gap-2 px-2 py-1.5 hover:bg-void rounded text-left">Divider Line</button>
          
          <p className="px-2 py-1 text-[10px] text-signal uppercase tracking-widest border-y border-line my-1">Media & Widgets</p>
          <button onClick={() => runCommand('image')} className="flex items-center gap-2 px-2 py-1.5 hover:bg-void rounded text-left text-signal">Upload Image</button>
          <button onClick={() => runCommand('gallery')} className="flex items-center gap-2 px-2 py-1.5 hover:bg-void rounded text-left">Image Gallery</button>
          <button onClick={() => runCommand('audio')} className="flex items-center gap-2 px-2 py-1.5 hover:bg-void rounded text-left">Upload Audio Player</button>
          <button onClick={() => runCommand('btn')} className="flex items-center gap-2 px-2 py-1.5 hover:bg-void rounded text-left">Link Button</button>
          <button onClick={() => runCommand('social')} className="flex items-center gap-2 px-2 py-1.5 hover:bg-void rounded text-left">Social Icons Row</button>
          <button onClick={() => runCommand('embed')} className="flex items-center gap-2 px-2 py-1.5 hover:bg-void rounded text-left">Media Embed Link</button>
        </div>
      )}

      {/* Built-in Custom Overlay Modal Module */}
      {modalConfig && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-void/80 backdrop-blur-sm p-4 font-sans">
          <div className="w-full max-w-sm border border-line bg-surface p-6 rounded shadow-2xl grid gap-4">
            <div className="flex items-center justify-between border-b border-line pb-2">
              <h3 className="font-display font-bold text-base text-paper uppercase tracking-wide">{modalConfig.title}</h3>
              <button 
                type="button" 
                onClick={() => setModalConfig(null)}
                className="text-mute hover:text-paper font-mono text-xs"
              >
                ✕ CLOSE
              </button>
            </div>

            <div className="grid gap-3">
              {modalConfig.inputs.map((inp) => (
                <div key={inp.key} className="grid gap-1">
                  <label className="font-mono text-[10px] uppercase text-mute">{inp.label}</label>
                  <input 
                    type="text" 
                    placeholder={inp.placeholder || ''}
                    value={modalValues[inp.key] || ''}
                    onChange={(e) => setModalValues({ ...modalValues, [inp.key]: e.target.value })}
                    className="bg-void p-2 border border-line text-paper text-xs outline-none focus:border-signal"
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-3 justify-end border-t border-line pt-3 mt-1">
              <button 
                type="button" 
                onClick={() => setModalConfig(null)}
                className="font-mono text-xs uppercase px-3 py-1.5 border border-line text-mute hover:text-paper"
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={() => {
                  modalConfig.onSubmit(modalValues)
                  setModalConfig(null)
                }}
                className="font-mono text-xs uppercase px-4 py-1.5 bg-signal text-void font-bold border border-signal hover:bg-void hover:text-signal"
              >
                Insert
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
