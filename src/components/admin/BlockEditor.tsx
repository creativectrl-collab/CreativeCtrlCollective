import { useState, useEffect, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Highlight from '@tiptap/extension-highlight'
import { supabase } from '../../lib/supabase'

export function BlockEditor({ initialContent, onChange }: { initialContent: string, onChange: (content: string) => void }) {
  const [showSlashMenu, setShowSlashMenu] = useState(false)
  const [slashMenuCoords, setSlashMenuCoords] = useState({ top: 0, left: 0 })
  const fileInputRef = useRef<HTMLInputElement>(null)

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
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-signal underline hover:text-paper transition-colors',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'w-full max-h-96 object-cover border border-line my-6 rounded',
        },
      }),
      Highlight.configure({
        multicolor: true,
      }),
    ],
    content: parsedContent,
    onUpdate: ({ editor }) => {
      onChange(JSON.stringify(editor.getJSON()))
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none min-h-[400px] outline-none text-paper font-sans text-sm leading-relaxed p-4 bg-void border border-line focus:border-signal transition-colors',
      },
      handleDOMEvents: {
        keydown: (view, event) => {
          if (event.key === '/' && !showSlashMenu) {
            // Get cursor coordinates to display menu at the cursor
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

  // Watch content updates from parent if changed externally (e.g. form resets)
  useEffect(() => {
    if (!editor || !initialContent) return
    try {
      const currentJson = JSON.stringify(editor.getJSON())
      if (initialContent !== currentJson) {
        editor.commands.setContent(JSON.parse(initialContent))
      }
    } catch {
      // If parent sets a plain text string, set it as content
      if (initialContent !== editor.getText()) {
        editor.commands.setContent(initialContent)
      }
    }
  }, [initialContent, editor])

  // Handle slash command clicks
  function runCommand(type: string) {
    if (!editor) return
    
    // Remove the "/" typed
    const { selection } = editor.state
    editor.commands.deleteRange({ from: selection.from - 1, to: selection.from })

    switch (type) {
      case 'h1':
        editor.chain().focus().toggleHeading({ level: 1 }).run()
        break
      case 'h2':
        editor.chain().focus().toggleHeading({ level: 2 }).run()
        break
      case 'h3':
        editor.chain().focus().toggleHeading({ level: 3 }).run()
        break
      case 'bullet':
        editor.chain().focus().toggleBulletList().run()
        break
      case 'ordered':
        editor.chain().focus().toggleOrderedList().run()
        break
      case 'quote':
        editor.chain().focus().toggleBlockquote().run()
        break
      case 'code':
        editor.chain().focus().toggleCodeBlock().run()
        break
      case 'divider':
        editor.chain().focus().setHorizontalRule().run()
        break
      case 'image':
        fileInputRef.current?.click()
        break
      case 'embed-youtube':
        const ytUrl = prompt('Enter YouTube URL:')
        if (ytUrl) {
          editor.chain().focus().insertContent(`<iframe src="${embedder(ytUrl)}" class="w-full aspect-video my-4 border border-line rounded"></iframe>`).run()
        }
        break
      case 'embed-spotify':
        const spotUrl = prompt('Enter Spotify Track/Playlist URL:')
        if (spotUrl) {
          editor.chain().focus().insertContent(`<iframe src="${embedder(spotUrl)}" class="w-full h-80 my-4 border border-line rounded" allow="encrypted-media"></iframe>`).run()
        }
        break
      case 'embed-soundcloud':
        const scUrl = prompt('Enter SoundCloud URL:')
        if (scUrl) {
          editor.chain().focus().insertContent(`<iframe src="${embedder(scUrl)}" class="w-full h-40 my-4 border border-line rounded"></iframe>`).run()
        }
        break
    }
    setShowSlashMenu(false)
  }

  // Helper to construct embed URLs
  function embedder(url: string) {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const id = url.split('v=')[1]?.split('&')[0] || url.split('/').pop()
      return `https://www.youtube.com/embed/${id}`
    }
    if (url.includes('spotify.com')) {
      return url.replace('spotify.com', 'spotify.com/embed')
    }
    if (url.includes('soundcloud.com')) {
      return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}`
    }
    return url
  }

  // Upload image to Supabase
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

      const caption = prompt('Add an optional caption for this image:')
      
      editor.chain().focus().setImage({ src: publicUrl, alt: caption || '' }).run()
      if (caption) {
        editor.chain().focus().insertContent(`<p class="text-center text-xs text-mute mt-1 mb-6">${caption}</p>`).run()
      }
    } catch (err: any) {
      alert(`Upload failed: ${err.message}`)
    }
  }

  // Close menus on click outside
  useEffect(() => {
    function handleClick() {
      setShowSlashMenu(false)
    }
    window.addEventListener('click', handleClick)
    return () => window.removeEventListener('click', handleClick)
  }, [])

  return (
    <div className="relative">
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

      {editor && (
        <BubbleMenu 
          editor={editor} 
          className="flex items-center gap-1 border border-line bg-surface p-1 shadow-xl rounded"
        >
          <button 
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`px-2 py-1 text-xs font-mono rounded ${editor.isActive('bold') ? 'bg-signal text-void' : 'text-paper hover:bg-void'}`}
          >
            B
          </button>
          <button 
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`px-2 py-1 text-xs font-mono rounded ${editor.isActive('italic') ? 'bg-signal text-void' : 'text-paper hover:bg-void'}`}
          >
            I
          </button>
          <button 
            type="button"
            onClick={() => {
              const url = prompt('Enter link URL:')
              if (url) {
                editor.chain().focus().setLink({ href: url }).run()
              } else {
                editor.chain().focus().unsetLink().run()
              }
            }}
            className={`px-2 py-1 text-xs font-mono rounded ${editor.isActive('link') ? 'bg-signal text-void' : 'text-paper hover:bg-void'}`}
          >
            Link
          </button>
          <button 
            type="button"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`px-2 py-1 text-xs font-mono rounded ${editor.isActive('code') ? 'bg-signal text-void' : 'text-paper hover:bg-void'}`}
          >
            Code
          </button>
          <button 
            type="button"
            onClick={() => {
              if (editor.isActive('highlight')) {
                editor.chain().focus().unsetHighlight().run()
              } else {
                editor.chain().focus().setHighlight({ color: '#d4ff3f' }).run()
              }
            }}
            className={`px-2 py-1 text-xs font-mono rounded ${editor.isActive('highlight') ? 'bg-signal text-void' : 'text-paper hover:bg-void'}`}
          >
            Highlight
          </button>
        </BubbleMenu>
      )}

      <EditorContent editor={editor} />

      {/* Slash Commands Dropdown */}
      {showSlashMenu && (
        <div 
          onClick={(e) => e.stopPropagation()}
          className="absolute z-50 flex flex-col gap-0.5 border border-line bg-surface p-1 shadow-2xl rounded max-h-60 overflow-y-auto w-56 font-mono text-xs text-paper"
          style={{ top: `${slashMenuCoords.top - 380}px`, left: `${slashMenuCoords.left - 20}px` }}
        >
          <p className="px-2 py-1 text-[10px] text-mute uppercase tracking-widest border-b border-line mb-1">Slash Commands</p>
          <button onClick={() => runCommand('h1')} className="flex items-center gap-2 px-2 py-1.5 hover:bg-void rounded text-left">Heading 1</button>
          <button onClick={() => runCommand('h2')} className="flex items-center gap-2 px-2 py-1.5 hover:bg-void rounded text-left">Heading 2</button>
          <button onClick={() => runCommand('h3')} className="flex items-center gap-2 px-2 py-1.5 hover:bg-void rounded text-left">Heading 3</button>
          <button onClick={() => runCommand('bullet')} className="flex items-center gap-2 px-2 py-1.5 hover:bg-void rounded text-left">Bulleted List</button>
          <button onClick={() => runCommand('ordered')} className="flex items-center gap-2 px-2 py-1.5 hover:bg-void rounded text-left">Ordered List</button>
          <button onClick={() => runCommand('quote')} className="flex items-center gap-2 px-2 py-1.5 hover:bg-void rounded text-left">Quote Block</button>
          <button onClick={() => runCommand('code')} className="flex items-center gap-2 px-2 py-1.5 hover:bg-void rounded text-left">Code Block</button>
          <button onClick={() => runCommand('divider')} className="flex items-center gap-2 px-2 py-1.5 hover:bg-void rounded text-left">Divider</button>
          <button onClick={() => runCommand('image')} className="flex items-center gap-2 px-2 py-1.5 hover:bg-void rounded text-left text-signal">Upload Image</button>
          <button onClick={() => runCommand('embed-youtube')} className="flex items-center gap-2 px-2 py-1.5 hover:bg-void rounded text-left">Embed YouTube</button>
          <button onClick={() => runCommand('embed-spotify')} className="flex items-center gap-2 px-2 py-1.5 hover:bg-void rounded text-left">Embed Spotify</button>
          <button onClick={() => runCommand('embed-soundcloud')} className="flex items-center gap-2 px-2 py-1.5 hover:bg-void rounded text-left">Embed SoundCloud</button>
        </div>
      )}
    </div>
  )
}
