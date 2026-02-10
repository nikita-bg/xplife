'use client'

import { CheckCircle2, Flame, Sparkles, Zap } from 'lucide-react'
import { PERSONALITY_DESCRIPTIONS } from '@/lib/constants'
import { useTranslations } from 'next-intl'

interface StatsCardProps {
  totalXp: number
  totalTasks: number
  currentStreak: number
  personalityType: string | null
}

export function StatsCard({ totalXp, totalTasks, currentStreak, personalityType }: StatsCardProps) {
  const t = useTranslations('profile.stats')
  const personality = personalityType ? PERSONALITY_DESCRIPTIONS[personalityType] : null

  return (
    <div className="glass-card rounded-2xl p-6">
      <h2 className="mb-4 font-display text-lg font-bold text-foreground">{t('title')}</h2>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl bg-muted p-4 text-center">
          <Zap className="mx-auto mb-2 h-5 w-5 text-primary" />
          <p className="font-display text-xl font-bold text-foreground">{totalXp.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">{t('totalXp')}</p>
        </div>
        <div className="rounded-xl bg-muted p-4 text-center">
          <CheckCircle2 className="mx-auto mb-2 h-5 w-5 text-accent" />
          <p className="font-display text-xl font-bold text-foreground">{totalTasks}</p>
          <p className="text-xs text-muted-foreground">{t('questsDone')}</p>
        </div>
        <div className="rounded-xl bg-muted p-4 text-center">
          <Flame className="mx-auto mb-2 h-5 w-5 text-orange-400" />
          <p className="font-display text-xl font-bold text-foreground">{currentStreak}d</p>
          <p className="text-xs text-muted-foreground">{t('streak')}</p>
        </div>
      </div>

      {personality && (
        <div className="mt-4 rounded-xl bg-primary/5 p-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="font-display text-sm font-bold text-foreground">{personality.title}</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{personality.description}</p>
        </div>
      )}
    </div>
  )
}
