import { useState, type FormEvent } from 'react'
import { site } from '../content/site'
import { Button } from './Button'

export function ContactForm() {
  const [sent, setSent] = useState(false)

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    const name = String(data.get('name') ?? '')
    const email = String(data.get('email') ?? '')
    const message = String(data.get('message') ?? '')
    const subject = encodeURIComponent(`Creative CTRL — ${name}`)
    const body = encodeURIComponent(`From: ${name} <${email}>\n\n${message}`)
    window.location.href = `mailto:${site.email}?subject=${subject}&body=${body}`
    setSent(true)
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
        <span className="font-mono text-kicker uppercase text-mute">Message</span>
        <textarea
          required
          name="message"
          className="min-h-32 border border-line bg-surface px-4 py-3 text-paper outline-none placeholder:text-mute focus:border-signal"
          placeholder="Tell us what you are building"
        />
      </label>
      <Button type="submit">Send</Button>
      {sent ? (
        <p className="font-mono text-xs text-signal">Thank you — your mail client should open.</p>
      ) : null}
    </form>
  )
}
