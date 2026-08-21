import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { Button } from '../../../components/Button'

interface HeroBlock {
  type: 'hero'
  headline: string
  coverImageUrl?: string
  preheader: string
}

interface StoryBlock {
  type: 'story'
  heading?: string
  body: string
}

interface EventBlock {
  type: 'event'
  dateTime: string
  venue: string
  lineup: string
  rsvpUrl: string
}

interface AudioBlock {
  type: 'audio'
  artworkUrl?: string
  title: string
  artist: string
  listenUrl: string
}

interface ShoutoutBlock {
  type: 'shoutout'
  col1Title: string
  col1Body: string
  col2Title: string
  col2Body: string
}

interface DividerBlock {
  type: 'divider'
  dividerStyle: 'solid' | 'dashed' | 'spacer'
}

type CampaignBlock = HeroBlock | StoryBlock | EventBlock | AudioBlock | ShoutoutBlock | DividerBlock

// Inline CSS Email Compiler
function compileEmailHtml(blocks: CampaignBlock[], subject: string): string {
  const contentHtml = blocks
    .map((block) => {
      switch (block.type) {
        case 'hero':
          return `
            <tr>
              <td align="center" style="padding: 30px 20px; background-color: #08080c;">
                ${block.coverImageUrl ? `<img src="${block.coverImageUrl}" alt="Hero Image" style="width: 100%; max-width: 560px; height: auto; border: 1px solid #1a1a1a; margin-bottom: 24px; display: block;" />` : ''}
                <span style="font-family: 'Courier New', Courier, monospace; font-size: 11px; text-transform: uppercase; color: #d4ff3f; letter-spacing: 2px; display: block; margin-bottom: 10px;">${block.preheader}</span>
                <h1 style="font-family: sans-serif; font-size: 28px; font-weight: bold; color: #f1eee6; margin: 0; line-height: 1.2;">${block.headline}</h1>
              </td>
            </tr>
          `
        case 'story':
          return `
            <tr>
              <td style="padding: 20px; background-color: #08080c; font-family: sans-serif; font-size: 14px; line-height: 1.6; color: #b3b3b3;">
                ${block.heading ? `<h2 style="font-family: sans-serif; font-size: 18px; font-weight: bold; color: #f1eee6; margin-top: 0; margin-bottom: 12px;">${block.heading}</h2>` : ''}
                <div style="margin: 0; white-space: pre-wrap;">${block.body}</div>
              </td>
            </tr>
          `
        case 'event':
          return `
            <tr>
              <td style="padding: 20px; background-color: #08080c;">
                <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #d4ff3f; background-color: #111115; border-radius: 4px;">
                  <tr>
                    <td style="padding: 20px; font-family: sans-serif;">
                      <table cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="background-color: #d4ff3f; color: #08080c; font-family: 'Courier New', Courier, monospace; font-size: 10px; font-weight: bold; padding: 4px 8px; text-transform: uppercase; display: inline-block; margin-bottom: 12px; border-radius: 2px;">
                            ${block.dateTime}
                          </td>
                        </tr>
                      </table>
                      <h3 style="font-size: 18px; color: #f1eee6; margin: 0 0 8px 0; font-weight: bold;">${block.venue}</h3>
                      <p style="font-size: 12px; color: #b3b3b3; margin: 0 0 16px 0; font-family: 'Courier New', Courier, monospace; line-height: 1.4;">
                        ${block.lineup ? `Lineup: ${block.lineup}` : ''}
                      </p>
                      <table cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="background-color: #d4ff3f; border-radius: 2px;">
                            <a href="${block.rsvpUrl || '#'}" target="_blank" style="font-family: sans-serif; font-size: 12px; font-weight: bold; color: #08080c; text-decoration: none; padding: 10px 20px; display: inline-block; text-transform: uppercase; letter-spacing: 1px;">
                              RSVP NOW
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          `
        case 'audio':
          return `
            <tr>
              <td style="padding: 20px; background-color: #08080c;">
                <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #1a1a1a; background-color: #111115; border-radius: 4px;">
                  <tr>
                    <td style="padding: 16px; font-family: sans-serif;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          ${block.artworkUrl ? `
                          <td width="80" valign="top" style="padding-right: 16px;">
                            <img src="${block.artworkUrl}" alt="Artwork" style="width: 80px; height: 80px; object-fit: cover; border: 1px solid #1a1a1a; display: block;" />
                          </td>
                          ` : ''}
                          <td valign="middle">
                            <span style="font-family: 'Courier New', Courier, monospace; font-size: 10px; color: #d4ff3f; text-transform: uppercase; display: block; margin-bottom: 4px;">Audio Feature</span>
                            <h4 style="font-size: 16px; color: #f1eee6; margin: 0 0 4px 0; font-weight: bold;">${block.title}</h4>
                            <p style="font-size: 13px; color: #b3b3b3; margin: 0 0 12px 0;">by ${block.artist}</p>
                            <a href="${block.listenUrl || '#'}" target="_blank" style="font-size: 11px; font-weight: bold; color: #d4ff3f; text-decoration: underline; text-transform: uppercase; letter-spacing: 0.5px;">
                              Listen Now →
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          `
        case 'shoutout':
          return `
            <tr>
              <td style="padding: 20px; background-color: #08080c;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td width="48%" valign="top" style="border: 1px solid #1a1a1a; background-color: #111115; padding: 16px; border-radius: 4px;">
                      <h4 style="font-family: sans-serif; font-size: 14px; font-weight: bold; color: #f1eee6; margin: 0 0 8px 0; border-bottom: 1px solid #1a1a1a; padding-bottom: 6px;">${block.col1Title}</h4>
                      <p style="font-family: sans-serif; font-size: 12px; color: #b3b3b3; margin: 0; line-height: 1.5;">${block.col1Body}</p>
                    </td>
                    <td width="4%">&nbsp;</td>
                    <td width="48%" valign="top" style="border: 1px solid #1a1a1a; background-color: #111115; padding: 16px; border-radius: 4px;">
                      <h4 style="font-family: sans-serif; font-size: 14px; font-weight: bold; color: #f1eee6; margin: 0 0 8px 0; border-bottom: 1px solid #1a1a1a; padding-bottom: 6px;">${block.col2Title}</h4>
                      <p style="font-family: sans-serif; font-size: 12px; color: #b3b3b3; margin: 0; line-height: 1.5;">${block.col2Body}</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          `
        case 'divider':
          const borderStyle = block.dividerStyle === 'spacer' ? 'none' : `1px ${block.dividerStyle} #1a1a1a`
          const height = block.dividerStyle === 'spacer' ? '30px' : '20px'
          return `
            <tr>
              <td style="padding: 10px 20px; background-color: #08080c; height: ${height};" align="center" valign="middle">
                ${block.dividerStyle !== 'spacer' ? `<div style="border-top: ${borderStyle}; width: 100%;"></div>` : ''}
              </td>
            </tr>
          `
        default:
          return ''
      }
    })
    .join('')

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <title>${subject}</title>
      </head>
      <body style="background-color: #08080c; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; width: 100% !important;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #08080c; min-height: 100vh;">
          <tr>
            <td align="center" valign="top" style="padding: 20px 0;">
              <!-- Container Table (600px Max standard email container) -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; width: 100%; border: 1px solid #1a1a1a;">
                
                <!-- Content Rows -->
                ${contentHtml}

                <!-- CASL Compliant Footer (Mandatory) -->
                <tr>
                  <td align="center" style="padding: 40px 20px; border-t: 1px solid #1a1a1a; background-color: #08080c; font-family: 'Courier New', Courier, monospace; font-size: 10px; color: #666666; line-height: 1.5;">
                    <p style="margin: 0 0 10px 0; text-transform: uppercase; tracking-wider: 1px;">Creative CTRL Collective</p>
                    <p style="margin: 0 0 16px 0;">Toronto, ON, Canada &bull; contact@creativectrlcollective.org</p>
                    <p style="margin: 0;">
                      You received this email because you opted into community updates. 
                      <br />
                      <a href="{{unsubscribe_link}}" style="color: #d4ff3f; text-decoration: underline;">Unsubscribe</a> at any time.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `
}

export function BroadcastsManager() {
  const [subject, setSubject] = useState('')
  const [previewText, setPreviewText] = useState('')
  const [blocks, setBlocks] = useState<CampaignBlock[]>([
    { type: 'hero', headline: 'Collective Dispatch #01', preheader: 'COMMUNITY NOTIFICATION', coverImageUrl: '' }
  ])
  const [recipientCount, setRecipientCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop')

  useEffect(() => {
    async function getCount() {
      const { count } = await supabase
        .from('community_members')
        .select('*', { count: 'exact', head: true })
        .eq('casl_consent_given', true)
        .eq('is_unsubscribed', false)
      setRecipientCount(count || 0)
    }
    getCount()
  }, [])

  // Block handlers
  function addBlock(type: CampaignBlock['type']) {
    let newBlock: CampaignBlock
    switch (type) {
      case 'hero':
        newBlock = { type: 'hero', headline: 'Headline Text', preheader: 'Kicker Text' }
        break
      case 'story':
        newBlock = { type: 'story', heading: 'Section Title', body: 'Story contents here...' }
        break
      case 'event':
        newBlock = { type: 'event', dateTime: 'Oct 31, 8:00 PM', venue: 'The Vault', lineup: 'Artist A, Artist B', rsvpUrl: '' }
        break
      case 'audio':
        newBlock = { type: 'audio', title: 'Track Title', artist: 'Artist Name', listenUrl: '' }
        break
      case 'shoutout':
        newBlock = { type: 'shoutout', col1Title: 'Left Col Title', col1Body: 'Left column content...', col2Title: 'Right Col Title', col2Body: 'Right column content...' }
        break
      case 'divider':
        newBlock = { type: 'divider', dividerStyle: 'solid' }
        break
    }
    setBlocks([...blocks, newBlock])
  }

  function deleteBlock(idx: number) {
    setBlocks(blocks.filter((_, i) => i !== idx))
  }

  function moveBlock(idx: number, dir: 'up' | 'down') {
    if (dir === 'up' && idx === 0) return
    if (dir === 'down' && idx === blocks.length - 1) return
    const newBlocks = [...blocks]
    const swapWith = dir === 'up' ? idx - 1 : idx + 1
    const temp = newBlocks[idx]
    newBlocks[idx] = newBlocks[swapWith]
    newBlocks[swapWith] = temp
    setBlocks(newBlocks)
  }

  function updateBlock(idx: number, updatedFields: Partial<CampaignBlock>) {
    setBlocks(
      blocks.map((b, i) => (i === idx ? ({ ...b, ...updatedFields } as CampaignBlock) : b))
    )
  }

  // Upload artwork / flyer to storage bucket
  async function handleMediaUpload(idx: number, file: File, field: 'coverImageUrl' | 'artworkUrl') {
    const fileName = `${Date.now()}-${file.name}`
    try {
      const { data, error } = await supabase.storage
        .from('public-media')
        .upload(`campaigns/${fileName}`, file, { upsert: true })

      if (error) throw error

      const publicUrl = supabase.storage
        .from('public-media')
        .getPublicUrl(data.path).data.publicUrl

      updateBlock(idx, { [field]: publicUrl })
    } catch (err: any) {
      alert(`Media upload failed: ${err.message}`)
    }
  }

  const compiledHtml = compileEmailHtml(blocks, subject || 'No Subject')

  async function handleDispatch() {
    if (!subject) {
      alert('Please enter an email subject line.')
      return
    }
    if (!confirm(`Dispatch campaign to ${recipientCount} CASL-compliant recipients?`)) return
    
    setLoading(true)
    const { data: campaign, error } = await supabase
      .from('email_campaigns')
      .insert({ 
        subject, 
        preview_text: previewText, 
        body_html: compiledHtml, 
        status: 'sending', 
        sent_by_email: 'updates@creativectrlcollective.org' 
      })
      .select()
      .single()

    if (error) { 
      alert('Failed to create campaign: ' + error.message)
      setLoading(false)
      return 
    }

    alert(`Campaign ${campaign.id} successfully queued and dispatched!`)
    setLoading(false)
  }

  return (
    <div className="grid gap-8 lg:grid-cols-12 min-h-screen">
      {/* LEFT CANVAS: Controls & Fields */}
      <div className="lg:col-span-7 flex flex-col gap-6 bg-surface p-4 border border-line md:p-6 rounded">
        <div>
          <h2 className="text-xl text-paper font-mono uppercase tracking-wider mb-2">Campaign settings</h2>
          <p className="text-xs text-mute font-mono">Targeting {recipientCount} CASL-compliant subscribers.</p>
        </div>

        <div className="grid gap-4">
          <input 
            placeholder="Email Subject Line" 
            value={subject} 
            onChange={e => setSubject(e.target.value)} 
            className="bg-void p-2.5 border border-line text-paper font-sans outline-none focus:border-signal transition-colors text-sm" 
          />
          <input 
            placeholder="Preheader Text (Inboxes short preview)" 
            value={previewText} 
            onChange={e => setPreviewText(e.target.value)} 
            className="bg-void p-2.5 border border-line text-paper font-sans outline-none focus:border-signal transition-colors text-sm" 
          />
        </div>

        {/* Modular Block List */}
        <div className="border-t border-line pt-6 flex flex-col gap-4">
          <h3 className="font-mono text-xs uppercase tracking-widest text-mute mb-2">Email Modular Blocks</h3>

          {blocks.map((block, idx) => (
            <div key={idx} className="border border-line bg-void p-4 rounded flex flex-col gap-4 group">
              <div className="flex items-center justify-between border-b border-line pb-2">
                <span className="font-mono text-[10px] uppercase text-signal tracking-widest">{block.type} block</span>
                <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => moveBlock(idx, 'up')} className="px-1.5 py-0.5 border border-line text-[10px] text-paper font-mono hover:bg-surface rounded">▲</button>
                  <button onClick={() => moveBlock(idx, 'down')} className="px-1.5 py-0.5 border border-line text-[10px] text-paper font-mono hover:bg-surface rounded">▼</button>
                  <button onClick={() => deleteBlock(idx)} className="px-1.5 py-0.5 border border-line text-[10px] text-alert font-mono hover:bg-surface rounded">Remove</button>
                </div>
              </div>

              {/* Block Input Configurations */}
              {block.type === 'hero' && (
                <div className="grid gap-3">
                  <input 
                    placeholder="Headline" 
                    value={block.headline} 
                    onChange={e => updateBlock(idx, { headline: e.target.value })} 
                    className="bg-surface p-2 border border-line text-paper text-xs outline-none" 
                  />
                  <input 
                    placeholder="Kicker Preheader" 
                    value={block.preheader} 
                    onChange={e => updateBlock(idx, { preheader: e.target.value })} 
                    className="bg-surface p-2 border border-line text-paper text-xs outline-none" 
                  />
                  <div className="grid gap-1.5 font-mono text-[10px] text-mute">
                    <span>Flyer Image Upload:</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={e => {
                        const file = e.target.files?.[0]
                        if (file) handleMediaUpload(idx, file, 'coverImageUrl')
                      }}
                      className="text-paper" 
                    />
                  </div>
                </div>
              )}

              {block.type === 'story' && (
                <div className="grid gap-3">
                  <input 
                    placeholder="Story Title (Optional)" 
                    value={block.heading || ''} 
                    onChange={e => updateBlock(idx, { heading: e.target.value })} 
                    className="bg-surface p-2 border border-line text-paper text-xs outline-none" 
                  />
                  <textarea 
                    placeholder="Body Text (Supports spacing)" 
                    value={block.body} 
                    onChange={e => updateBlock(idx, { body: e.target.value })} 
                    className="bg-surface p-2 border border-line text-paper text-xs outline-none h-24 font-sans" 
                  />
                </div>
              )}

              {block.type === 'event' && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <input 
                    placeholder="Date & Time" 
                    value={block.dateTime} 
                    onChange={e => updateBlock(idx, { dateTime: e.target.value })} 
                    className="bg-surface p-2 border border-line text-paper text-xs outline-none" 
                  />
                  <input 
                    placeholder="Venue Name" 
                    value={block.venue} 
                    onChange={e => updateBlock(idx, { venue: e.target.value })} 
                    className="bg-surface p-2 border border-line text-paper text-xs outline-none" 
                  />
                  <input 
                    placeholder="Lineup Artists" 
                    value={block.lineup} 
                    onChange={e => updateBlock(idx, { lineup: e.target.value })} 
                    className="bg-surface p-2 border border-line text-paper text-xs outline-none sm:col-span-2" 
                  />
                  <input 
                    placeholder="RSVP Link URL" 
                    value={block.rsvpUrl} 
                    onChange={e => updateBlock(idx, { rsvpUrl: e.target.value })} 
                    className="bg-surface p-2 border border-line text-paper text-xs outline-none sm:col-span-2" 
                  />
                </div>
              )}

              {block.type === 'audio' && (
                <div className="grid gap-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input 
                      placeholder="Track Title" 
                      value={block.title} 
                      onChange={e => updateBlock(idx, { title: e.target.value })} 
                      className="bg-surface p-2 border border-line text-paper text-xs outline-none" 
                    />
                    <input 
                      placeholder="Artist Name" 
                      value={block.artist} 
                      onChange={e => updateBlock(idx, { artist: e.target.value })} 
                      className="bg-surface p-2 border border-line text-paper text-xs outline-none" 
                    />
                  </div>
                  <input 
                    placeholder="Listen URL (SoundCloud, Spotify, Bandcamp)" 
                    value={block.listenUrl} 
                    onChange={e => updateBlock(idx, { listenUrl: e.target.value })} 
                    className="bg-surface p-2 border border-line text-paper text-xs outline-none" 
                  />
                  <div className="grid gap-1.5 font-mono text-[10px] text-mute">
                    <span>Artwork Thumbnail Image:</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={e => {
                        const file = e.target.files?.[0]
                        if (file) handleMediaUpload(idx, file, 'artworkUrl')
                      }}
                      className="text-paper" 
                    />
                  </div>
                </div>
              )}

              {block.type === 'shoutout' && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="grid gap-2 border border-line p-2 bg-surface rounded">
                    <input 
                      placeholder="Col 1 Title" 
                      value={block.col1Title} 
                      onChange={e => updateBlock(idx, { col1Title: e.target.value })} 
                      className="bg-void p-1.5 border border-line text-paper text-xs outline-none" 
                    />
                    <textarea 
                      placeholder="Col 1 Body" 
                      value={block.col1Body} 
                      onChange={e => updateBlock(idx, { col1Body: e.target.value })} 
                      className="bg-void p-1.5 border border-line text-paper text-xs outline-none h-16" 
                    />
                  </div>
                  <div className="grid gap-2 border border-line p-2 bg-surface rounded">
                    <input 
                      placeholder="Col 2 Title" 
                      value={block.col2Title} 
                      onChange={e => updateBlock(idx, { col2Title: e.target.value })} 
                      className="bg-void p-1.5 border border-line text-paper text-xs outline-none" 
                    />
                    <textarea 
                      placeholder="Col 2 Body" 
                      value={block.col2Body} 
                      onChange={e => updateBlock(idx, { col2Body: e.target.value })} 
                      className="bg-void p-1.5 border border-line text-paper text-xs outline-none h-16" 
                    />
                  </div>
                </div>
              )}

              {block.type === 'divider' && (
                <div className="grid gap-2">
                  <select 
                    value={block.dividerStyle} 
                    onChange={e => updateBlock(idx, { dividerStyle: e.target.value as any })}
                    className="bg-surface p-2 border border-line text-paper text-xs outline-none font-mono"
                  >
                    <option value="solid">Solid Line</option>
                    <option value="dashed">Dashed Line</option>
                    <option value="spacer">Blank Space</option>
                  </select>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add Block Toolbar */}
        <div className="border-t border-line pt-4 flex flex-wrap gap-2 font-mono text-[10px]">
          <button onClick={() => addBlock('hero')} className="px-2.5 py-1.5 border border-line hover:border-signal text-paper hover:bg-void rounded">+ Hero</button>
          <button onClick={() => addBlock('story')} className="px-2.5 py-1.5 border border-line hover:border-signal text-paper hover:bg-void rounded">+ Story</button>
          <button onClick={() => addBlock('event')} className="px-2.5 py-1.5 border border-line hover:border-signal text-paper hover:bg-void rounded">+ Event</button>
          <button onClick={() => addBlock('audio')} className="px-2.5 py-1.5 border border-line hover:border-signal text-paper hover:bg-void rounded">+ Audio</button>
          <button onClick={() => addBlock('shoutout')} className="px-2.5 py-1.5 border border-line hover:border-signal text-paper hover:bg-void rounded">+ Grid</button>
          <button onClick={() => addBlock('divider')} className="px-2.5 py-1.5 border border-line hover:border-signal text-paper hover:bg-void rounded">+ Divider</button>
        </div>

        <div className="border-t border-line pt-4 flex justify-end">
          <Button onClick={handleDispatch} disabled={loading || recipientCount === 0}>
            {loading ? 'Dispatching...' : 'Dispatch Campaign'}
          </Button>
        </div>
      </div>

      {/* RIGHT PREVIEW PANE: Interactive Mockup inside Frame */}
      <div className="lg:col-span-5 flex flex-col gap-4 border border-line bg-void p-4 rounded max-h-[85vh]">
        <div className="flex items-center justify-between border-b border-line pb-2">
          <span className="font-mono text-xs text-signal uppercase tracking-wider">Live Mockup Preview</span>
          <div className="flex gap-1.5 font-mono text-[10px]">
            <button 
              onClick={() => setPreviewMode('desktop')}
              className={`px-2 py-1 border border-line rounded ${previewMode === 'desktop' ? 'bg-signal text-void' : 'text-paper hover:bg-surface'}`}
            >
              Desktop
            </button>
            <button 
              onClick={() => setPreviewMode('mobile')}
              className={`px-2 py-1 border border-line rounded ${previewMode === 'mobile' ? 'bg-signal text-void' : 'text-paper hover:bg-surface'}`}
            >
              Mobile
            </button>
          </div>
        </div>

        {/* Viewport Frame */}
        <div className="flex justify-center bg-[#0d0d12] border border-line overflow-y-auto rounded p-4 h-full">
          <div 
            style={{ width: previewMode === 'desktop' ? '100%' : '375px' }} 
            className="transition-all duration-300 shadow-2xl h-fit max-w-[600px] border border-line rounded bg-void"
          >
            <iframe 
              srcDoc={compiledHtml} 
              title="Email Preview"
              className="w-full min-h-[500px] border-none"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
