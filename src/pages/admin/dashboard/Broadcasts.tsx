import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { Button } from '../../../components/Button'

export function BroadcastsManager() {
  const [subject, setSubject] = useState('')
  const [preview, setPreview] = useState('')
  const [body, setBody] = useState('')
  const [recipientCount, setRecipientCount] = useState(0)
  const [loading, setLoading] = useState(false)

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

  async function handleDispatch() {
    if (!confirm(`Dispatch campaign to ${recipientCount} recipients?`)) return
    
    setLoading(true)
    const { data: campaign, error } = await supabase
      .from('email_campaigns')
      .insert({ subject, preview_text: preview, body_html: body, status: 'sending', sent_by_email: 'updates@creativectrlcollective.org' })
      .select()
      .single()

    if (error) { alert('Failed to create campaign'); setLoading(false); return }

    // Mocking function invocation - this would call your Edge Function
    alert(`Campaign ${campaign.id} sent to ${recipientCount} recipients!`)
    setLoading(false)
  }

  return (
    <div className="grid gap-12">
      <div className="grid gap-4 p-6 border border-line bg-surface">
        <h2 className="text-lg text-paper">Create Campaign</h2>
        <p className="text-mute">Targeting {recipientCount} CASL-compliant recipients.</p>
        <input placeholder="Subject" value={subject} onChange={e => setSubject(e.target.value)} className="bg-void p-2 border border-line text-paper" />
        <input placeholder="Preview Text" value={preview} onChange={e => setPreview(e.target.value)} className="bg-void p-2 border border-line text-paper" />
        <textarea placeholder="HTML Body" value={body} onChange={e => setBody(e.target.value)} className="h-48 bg-void p-2 border border-line text-paper" />
        <Button onClick={handleDispatch} disabled={loading || recipientCount === 0}>
          {loading ? 'Dispatching...' : 'Dispatch Campaign'}
        </Button>
      </div>
    </div>
  )
}
