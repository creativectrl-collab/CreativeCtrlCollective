import { useState, type FormEvent } from 'react'
import { Button } from './Button'
import { supabase } from '../lib/supabase'

export function ContactForm() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)
    
    const form = event.currentTarget
    const data = new FormData(form)
    const name = String(data.get('name') ?? '')
    const email = String(data.get('email') ?? '')
    const message = String(data.get('message') ?? '')
    const inquiryType = String(data.get('inquiry_type') ?? 'general')
    const consent = data.get('consent') === 'on'

    try {
      // 1. Persist to Supabase
      const { error: dbError } = await supabase
        .from('community_members')
        .insert([{
          full_name: name,
          email,
          inquiry_type: inquiryType,
          notes: message,
          casl_consent_given: consent,
          consent_source: 'contact_form'
        }])

      if (dbError) throw dbError

      // 2. Dispatch notification email via Edge Function
      const { error: fnError } = await supabase.functions.invoke('notify-contact', {
        body: {
          name,
          email,
          inquiryType,
          message
        }
      })

      if (fnError) {
        console.error('Email notification failed:', fnError)
      }
      
      setSuccess(true)
      form.reset()
    } catch (e) {
      console.error(e)
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="grid max-w-lg gap-4" onSubmit={onSubmit}>
      <label className="flex flex-col gap-2">
        <span className="font-mono text-kicker uppercase text-mute">Name</span>
        <input
          required
          name="name"
          className="border border-line bg-surface px-4 py-3 text-paper outline-none placeholder:text-mute focus:border-signal"
          placeholder="Your name"
        />
      </label>
      <label className="flex flex-col gap-2">
        <span className="font-mono text-kicker uppercase text-mute">Email</span>
        <input
          required
          type="email"
          name="email"
          className="border border-line bg-surface px-4 py-3 text-paper outline-none placeholder:text-mute focus:border-signal"
          placeholder="you@email.com"
        />
      </label>
      <label className="flex flex-col gap-2">
        <span className="font-mono text-kicker uppercase text-mute">Inquiry Type</span>
        <select
          name="inquiry_type"
          className="border border-line bg-surface px-4 py-3 text-paper outline-none focus:border-signal"
        >
          <option value="general">General</option>
          <option value="artist_submission">Artist Submission</option>
          <option value="booking">Booking</option>
          <option value="sponsor">Sponsor</option>
        </select>
      </label>
      <label className="flex flex-col gap-2">
        <span className="font-mono text-kicker uppercase text-mute">Message</span>
        <textarea
          required
          name="message"
          className="min-h-32 border border-line bg-surface px-4 py-3 text-paper outline-none placeholder:text-mute focus:border-signal"
          placeholder="Tell us what you are building"
        />
      </label>
      <label className="flex items-center gap-2">
        <input
          required
          type="checkbox"
          name="consent"
          className="accent-signal"
        />
        <span className="font-mono text-xs text-mute">
          I consent to receive communication from Creative CTRL Collective.
        </span>
      </label>
      <Button type="submit" disabled={loading}>
        {loading ? 'Sending...' : 'Send'}
      </Button>
      {success ? (
        <p className="font-mono text-xs text-signal">Thank you — your inquiry has been received.</p>
      ) : null}
      {error ? (
        <p className="font-mono text-xs text-error">{error}</p>
      ) : null}
    </form>
  )
}
