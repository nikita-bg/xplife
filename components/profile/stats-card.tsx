'use client'

import { CheckCircle2, Flame, Sparkles, Zap } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface StatsCardProps {
  totalXp: number
  totalTasks: number
  currentStreak: number
  personalityType: string | null
}

export function StatsCard({ totalXp, totalTasks, currentStreak, personalityType }: StatsCardProps) {
  const t = useTranslations('profile.stats')
  const tPersonality = useTranslations('personalities')

  const personality = personalityType ? {
    title: tPersonality(`${personalityType}.title`),
    description: tPersonality(`${personalityType}.description`)
  } : null

  const stats = [
    { icon: Zap, value: totalXp.toLocaleString(), label: t('totalXp'), color: 'var(--accent-cyan)', glow: 'var(--accent-cyan-dim)' },
    { icon: CheckCircle2, value: totalTasks.toString(), label: t('questsDone'), color: 'var(--accent-purple)', glow: 'var(--accent-purple-dim)' },
    { icon: Flame, value: `${currentStreak}d`, label: t('streak'), color: 'var(--accent-gold)', glow: 'var(--accent-gold-dim)' },
  ]

  return (
    <div className="rounded-2xl p-6" style={{
      background: 'var(--glass-bg)',
      border: '1px solid var(--glass-border)',
      backdropFilter: 'blur(12px)',
    }}>
      <h2 className="mb-4 font-display text-lg font-bold text-foreground">{t('title')}</h2>

      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl p-4 text-center" style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--glass-border)',
          }}>
            <stat.icon className="mx-auto mb-2 h-5 w-5" style={{ color: stat.color }} />
            <p className="font-display text-xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {personality && (
        <div className="mt-4 rounded-xl p-4" style={{
          background: 'var(--accent-purple-dim)',
          border: '1px solid rgba(139,92,246,0.15)',
        }}>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" style={{ color: 'var(--accent-purple)' }} />
            <span className="font-display text-sm font-bold text-foreground">{personality.title}</span>
          </div>
          <p className="mt-1 text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{personality.description}</p>
        </div>
      )}
    </div>
  )
}
