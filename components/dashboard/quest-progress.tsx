'use client'

import { useTranslations } from 'next-intl'
import type { QuestTimeframe } from '@/lib/types'

interface QuestProgressProps {
  completed: number
  total: number
  timeframe: QuestTimeframe
}

export function QuestProgress({ completed, total, timeframe }: QuestProgressProps) {
  const t = useTranslations('dashboard.questProgress')

  if (total === 0) {
    return (
      <p className="text-sm text-muted-foreground">{t('noQuests')}</p>
    )
  }

  const pct = Math.round((completed / total) * 100)

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-muted-foreground capitalize">{t('progress', { timeframe })}</span>
        <span className="font-medium text-foreground">
          {t('completed', { completed, total })}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
