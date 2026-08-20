import { Seo } from '../components/Seo'
import { team } from '../content/site'

export function TeamPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16 md:px-10 md:py-20">
      <Seo
        title="Team"
        description="Founding partners of Creative Ctrl Collective — visual practice, story, and sound in Toronto."
        path="/team"
      />
      <p className="font-mono text-kicker uppercase text-signal">Roster</p>
      <h1 className="mt-4 font-display text-display text-paper">Team</h1>
      <p className="mt-4 max-w-xl text-mute">
        Founding partners. Visual practice, story, and sound — one collective.
      </p>

      <div className="mt-14 flex flex-col gap-16">
        {team.map((member) => (
          <article
            key={member.slug}
            className="grid items-start gap-8 border-t border-line pt-10 md:grid-cols-2"
          >
            <img
              src={member.image}
              alt={member.name}
              className="aspect-[4/5] w-full object-cover"
            />
            <div>
              <p className="font-mono text-kicker uppercase text-signal">{member.role}</p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">
                {member.name}
              </h2>
              <div className="mt-5 flex flex-col gap-4 text-pretty text-mute">
                {member.bio.map((para) => (
                  <p key={para}>{para}</p>
                ))}
              </div>
              <p className="mt-6 flex flex-wrap gap-4">
                {member.links.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="font-mono text-kicker uppercase text-paper hover:text-signal"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {link.label}
                  </a>
                ))}
              </p>
            </div>
          </article>
        ))}
      </div>
    </main>
  )
}
