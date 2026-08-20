export const site = {
  name: 'Creative CTRL Collective',
  instagram: 'https://www.instagram.com/creativectrl_org/',
  email: 'contact@creativectrlcollective.org',
  mission:
    'Creative CTRL fosters a symbiotic relationship between arts and music through collaboration, innovation, and community engagement. We build platforms where artists and audiences converge — sparking creativity, cultural exchange, and personal growth.',
  vision:
    'A pivotal force in the arts scene, where creativity knows no bounds and every individual can explore, express, and evolve through art and music. Art is not only consumed — it is created collectively, weaving a vibrant cultural fabric in Toronto and beyond.',
  objectives: [
    'Foster collaboration',
    'Curate dynamic events',
    'Community engagement',
    'Educational outreach',
  ],
} as const

export const events = {
  latest: {
    slug: 'with-obafs',
    title: 'With OBAFS',
    kicker: 'Latest event',
    date: 'Sunday 18 May 2025 · 5:45–8:45pm',
    venue: '303 Ottawa Street North, Hamilton',
    note: 'A mint event: curated art exhibition and wine tasting. Tickets $20.',
    image: '/media/events/latest.png',
  },
  past: [
    {
      slug: 'celeb-kids',
      title: 'Celeb Kids',
      kicker: 'Solo exhibition',
      date: '7–28 March',
      venue: 'BSTO · 1310 St. Clair Avenue West, Toronto',
      note: 'Portraits of Innocence. Opening reception 7 March.',
      image: '/media/events/celeb-kids-2.png',
    },
    {
      slug: 'celeb-kids-closing',
      title: 'Celeb Kids closing party',
      kicker: 'Open mic',
      date: '28 March · 8pm–late',
      venue: 'BSTO · 1310 St. Clair Avenue West, Toronto',
      note: 'Special performance by Sasky Mali, DJ Daddy Yo & more. $20.',
      image: '/media/events/celeb-kids-1.png',
    },
    {
      slug: 'crafting-our-legacy',
      title: 'Crafting Our Legacy',
      kicker: 'Black History Month',
      date: 'Saturday 1 February',
      venue: 'Airoli · 334 Queen Street West, Toronto',
      note: 'Art exhibition with Look It’s Kam & friends. $10 advance / $15 door.',
      image: '/media/events/colour-of-love.png',
    },
  ],
} as const

export const scenes = [
  '/media/scenes/01.jpg',
  '/media/scenes/02.jpg',
  '/media/scenes/03.jpg',
  '/media/scenes/04.jpg',
  '/media/scenes/05.jpg',
  '/media/scenes/06.jpg',
] as const

export const team = [
  {
    slug: 'kamorudeen',
    name: 'Kamorudeen Toluwani Aruna',
    role: 'Visual artist · photographer',
    image: '/media/team/kamorudeen.jpg',
    bio: [
      'Emerging visual artist and photographer from Lagos, Nigeria, with a Fine Arts Studio diploma from Centennial College in Toronto.',
      'Passionate about colour, form, and shape, his work captures everyday emotion — blending cultural influence with contemporary form. Surrealistic storytelling, often through children, traces innocence, joy, and complexity.',
      'He aspires to be a visionary artist and educator, guiding the next generation while opening new paths in surrealistic art.',
    ],
    links: [
      { label: 'Instagram', href: 'https://www.instagram.com/kamorudeenaruna/' },
      { label: 'X', href: 'https://x.com/look_itskam' },
      { label: 'Website', href: 'https://www.lookitskam.com/' },
    ],
  },
  {
    slug: 'kelly',
    name: 'Kelly Ugwu',
    role: 'Content · DJ · storyteller',
    image: '/media/team/kelly.jpg',
    bio: [
      'Dynamic content creator and storyteller working for cultural impact through music, conversation, and narrative. YouTuber, DJ, and podcaster — blending entertainment with insight.',
      'Whether curating a vibe, producing video, or hosting dialogue, the mission is to inspire, engage, and uplift.',
      'Guided by authenticity, creativity, and lasting value — offering something audiences did not know they needed.',
    ],
    links: [
      { label: 'Instagram', href: 'https://www.instagram.com/kelllyugwu/' },
      { label: 'X', href: 'https://x.com/kelllyugwu' },
      { label: 'YouTube', href: 'https://www.youtube.com/@daddyyomix' },
    ],
  },
  {
    slug: 'sasky',
    name: 'Sasky Mali',
    role: 'Afro-fusion · producer · DJ',
    image: '/media/team/sasky.jpg',
    bio: [
      'Uche Osakwe, known as Sasky Mali — Nigerian-born Afro-fusion artist, producer, and DJ based in Toronto.',
      'Music is the tool: speaking to the society he was born into and the one he lives in now, with the aim of moving a broad audience of passionate listeners, one sound at a time.',
    ],
    links: [
      { label: 'Instagram', href: 'https://www.instagram.com/saskymali/' },
      { label: 'X', href: 'https://x.com/Sasky_Mali' },
      { label: 'EPK', href: 'https://saskymalimusic.com/artiste-epk/' },
    ],
  },
] as const
