import { useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import { Button } from '../components/Button'

export function CampaignForm() {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<string | null>(null)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setStatus('Sending...')

    const form = event.currentTarget
    const data = new FormData(form)
    
    // 1. Save campaign record
    const { data: campaign, error } = await supabase
      .from('email_campaigns')
      .insert([{
        subject: data.get('subject'),
        preview_text: data.get('preview'),
        body_html: data.get('body'),
        sent_by_email: 'admin@creativectrlcollective.org', 
        status: 'sending'
      }])
      .select()
      .single()

    if (error) {
      setStatus('Error: ' + error.message)
      setLoading(false)
      return
    }

    // 2. Invoke Edge Function (Mocked)
    // const { error: fnError } = await supabase.functions.invoke('send-campaign', {
    //   body: { campaignId: campaign.id }
    // })
    
    setStatus('Campaign triggered: ' + campaign.id)
    setLoading(false)
    form.reset()
  }

  return (
    <form className="grid max-w-lg gap-4 p-4" onSubmit={onSubmit}>
      <h1 className="font-mono text-xl uppercase text-mute">Dispatch Campaign</h1>
      <input name="subject" required placeholder="Subject" className="border border-line bg-surface p-2 text-paper outline-none" />
      <input name="preview" placeholder="Preview Text" className="border border-line bg-surface p-2 text-paper outline-none" />
      <textarea name="body" required placeholder="HTML Body" className="min-h-32 border border-line bg-surface p-2 text-paper outline-none" />
      <Button type="submit" disabled={loading}>Dispatch</Button>
      {status && <p className="font-mono text-xs text-signal">{status}</p>}
    </form>
  )
}
