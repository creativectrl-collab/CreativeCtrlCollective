import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../../lib/supabase'

interface Stats {
  subscribers: number
  dispatches: number
  events: number
  likes: number
}

export function DashboardIndex() {
  const [stats, setStats] = useState<Stats>({ subscribers: 0, dispatches: 0, events: 0, likes: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        const { count: subCount } = await supabase
          .from('community_members')
          .select('*', { count: 'exact', head: true })

        const { count: postCount } = await supabase
          .from('posts')
          .select('*', { count: 'exact', head: true })
          .neq('category', 'Event')

        const { count: eventCount } = await supabase
          .from('posts')
          .select('*', { count: 'exact', head: true })
          .eq('category', 'Event')

        const { data: likesData } = await supabase
          .from('posts')
          .select('likes_count')

        const totalLikes = likesData?.reduce((acc, p) => acc + (p.likes_count || 0), 0) || 0

        setStats({
          subscribers: subCount || 0,
          dispatches: postCount || 0,
          events: eventCount || 0,
          likes: totalLikes,
        })
      } catch (err) {
        console.error('Failed to load stats:', err)
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [])

  return (
    <div className="grid gap-10">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric Cards */}
        {[
          { label: 'Subscribers', val: stats.subscribers, color: 'text-signal' },
          { label: 'Blog Posts', val: stats.dispatches, color: 'text-paper' },
          { label: 'Event Showcases', val: stats.events, color: 'text-paper' },
          { label: 'Total Content Likes', val: stats.likes, color: 'text-signal' }
        ].map((card, idx) => (
          <div key={idx} className="border border-line bg-surface p-5 rounded flex flex-col justify-between min-h-32">
            <span className="font-mono text-xs uppercase text-mute tracking-wider">{card.label}</span>
            {loading ? (
              <span className="text-xl text-mute font-mono">...</span>
            ) : (
              <span className={`text-4xl font-display font-bold ${card.color}`}>{card.val}</span>
            )}
          </div>
        ))}
      </div>

      {/* Standalone Builder Access Panels */}
      <div className="grid gap-6 md:grid-cols-3">
        {[
          {
            title: 'Notion Block Editor',
            desc: 'Write dispatches, announcements, and blog articles using the Notion-style builder.',
            button: 'Launch Blog Builder',
            to: '/admin/dashboard/blog',
            color: 'border-line hover:border-signal'
          },
          {
            title: 'Event Showcase Creator',
            desc: 'Scaffold new events, set flyers, venue parameters, and publish events to the public grid.',
            button: 'Launch Event Builder',
            to: '/admin/dashboard/events',
            color: 'border-line hover:border-signal'
          },
          {
            title: 'Broadcast Email Dispatcher',
            desc: 'Compose newsletters or notification emails and bulk-send them to CASL-compliant members.',
            button: 'Launch Broadcast Builder',
            to: '/admin/dashboard/broadcasts',
            color: 'border-line hover:border-alert'
          }
        ].map((panel, idx) => (
          <div key={idx} className={`border p-6 bg-surface flex flex-col justify-between rounded group transition-all duration-300 ${panel.color}`}>
            <div>
              <h3 className="font-display text-xl font-bold text-paper mb-2">{panel.title}</h3>
              <p className="text-sm text-mute leading-relaxed mb-6">{panel.desc}</p>
            </div>
            <Link 
              to={panel.to}
              className="inline-block text-center font-mono text-xs uppercase tracking-wider border border-line hover:border-paper py-3 rounded text-paper hover:bg-void transition-colors"
            >
              {panel.button}
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
