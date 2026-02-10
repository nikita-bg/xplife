'use client'

import { Zap } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface XpBarProps {
  currentXp: number
  requiredXp: number
  totalXp: number
}

export function XpBar({ currentXp, requiredXp, totalXp }: XpBarProps) {
  const t = useTranslations('dashboard.stats')
  const percentage = requiredXp > 0 ? Math.min((currentXp / requiredXp) * 100, 100) : 0

  return (
    <div className="glass-card gradient-border rounded-2xl p-6">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-accent" />
          <span className="text-sm text-muted-foreground">{t('experience')}</span>
        </div>
        <span className="font-display text-sm text-primary">
          {totalXp.toLocaleString()} XP
        </span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-1000 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {t('xpToNextLevel', { current: currentXp, required: requiredXp })}
      </p>
    </div>
  )
}
