import { Seo } from '../components/Seo'
import { site } from '../content/site'

export function PrivacyPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16 md:px-10 md:py-20 font-sans text-paper">
      <Seo 
        title="Privacy Policy"
        description="Privacy Policy and compliance terms for subscribers and community members of Creative Ctrl Collective."
        path="/privacy"
      />

      <p className="font-mono text-kicker uppercase text-signal">Legal</p>
      <h1 className="mt-4 font-display text-display text-paper">Privacy Policy</h1>
      <p className="mt-2 text-xs font-mono text-mute uppercase">Last updated: August 21, 2026</p>

      <div className="mt-12 space-y-8 text-sm leading-relaxed text-mute">
        <section className="space-y-3">
          <h2 className="font-display text-lg font-bold text-paper uppercase tracking-wide">1. Overview</h2>
          <p>
            Creative Ctrl Collective ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your personal information when you subscribe to our newsletters, submit inquiries, or interact with our site.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-bold text-paper uppercase tracking-wide">2. Information We Collect</h2>
          <p>
            We only collect information that you voluntarily provide to us:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Subscription Details:</strong> Your email address and opt-in preferences when you subscribe to our campaigns.</li>
            <li><strong>Inquiry Details:</strong> Your name, email, and message content when submitting the contact or community submission forms.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-bold text-paper uppercase tracking-wide">3. How We Use Your Information</h2>
          <p>
            Your information is used strictly to support your connection with the Collective:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>To dispatch updates, news, and notifications about upcoming events.</li>
            <li>To respond to submissions, inquiries, or collaboration requests.</li>
            <li>To comply with anti-spam legislation (CASL/GDPR), ensuring you only receive communications you have explicitly opted into.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-bold text-paper uppercase tracking-wide">4. Consent and Opt-Out</h2>
          <p>
            We operate on an explicit opt-in basis. Every broadcast email campaign sent from our hub contains a clear, functional unsubscribe link at the bottom. You can revoke consent and opt-out of communications at any time by clicking the unsubscribe link, or by contacting us at{' '}
            <a href={`mailto:${site.email}`} className="text-signal hover:underline">
              {site.email}
            </a>.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-bold text-paper uppercase tracking-wide">5. Data Sharing and Protection</h2>
          <p>
            We do not sell, rent, or trade your personal information. Data is stored securely using Supabase database services and processed safely via Resend integration engines. We implement standard security measures to prevent unauthorized access or disclosure.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-bold text-paper uppercase tracking-wide">6. Contact Us</h2>
          <p>
            If you have questions about this policy or want to inspect, update, or remove your data from our systems, please write to us at{' '}
            <a href={`mailto:${site.email}`} className="text-signal hover:underline">
              {site.email}
            </a>.
          </p>
        </section>
      </div>
    </main>
  )
}
