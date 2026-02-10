'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { PERSONALITY_DESCRIPTIONS } from '@/lib/constants'
import type { PersonalityType } from '@/lib/types'

interface BravermanResultsProps {
  scores: {
    dopamine: number
    acetylcholine: number
    gaba: number
    serotonin: number
  }
  dominantType: string
}

const NT_COLORS: Record<PersonalityType, string> = {
  dopamine: 'bg-red-500',
  acetylcholine: 'bg-blue-500',
  gaba: 'bg-green-500',
  serotonin: 'bg-purple-500',
}

const NT_KEYS: PersonalityType[] = ['dopamine', 'acetylcholine', 'gaba', 'serotonin']

const MAX_SCORE = 105 // 35 questions * max 3 per question

export function BravermanResults({ scores, dominantType }: BravermanResultsProps) {
  const t = useTranslations('braverman.results')
  const personality = PERSONALITY_DESCRIPTIONS[dominantType]

  return (
    <div className="flex flex-col gap-6">
      <div className="glass-card rounded-2xl p-6 text-center">
        <h2 className="font-display text-2xl font-bold text-foreground mb-2">
          {t('dominantType')} <span className="gradient-text">{personality?.title ?? dominantType}</span>
        </h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          {personality?.description}
        </p>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <h3 className="font-display text-lg font-bold text-foreground mb-4">
          {t('deficiencyScores')}
        </h3>
        <p className="text-xs text-muted-foreground mb-4">
          {t('deficiencyDescription')}
        </p>
        <div className="flex flex-col gap-4">
          {NT_KEYS.map((key) => {
              const color = NT_COLORS[key]
              const label = t(key as any)
              const score = scores[key]
              const percentage = Math.round((score / MAX_SCORE) * 100)
              const isDominant = key === dominantType

              return (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-medium ${isDominant ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {label}
                      {isDominant && (
                        <span className="ml-2 text-xs text-primary">{t('dominant')}</span>
                      )}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {score} / {MAX_SCORE}
                    </span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${color}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            }
          )}
        </div>
      </div>

      <div className="flex justify-center">
        <Button asChild>
          <Link href="/dashboard">{t('backToDashboard')}</Link>
        </Button>
      </div>
    </div>
  )
}
