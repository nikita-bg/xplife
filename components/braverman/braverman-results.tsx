'use client'

import Link from 'next/link'
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

const NT_LABELS: Record<PersonalityType, { label: string; color: string }> = {
  dopamine: { label: 'Dopamine', color: 'bg-red-500' },
  acetylcholine: { label: 'Acetylcholine', color: 'bg-blue-500' },
  gaba: { label: 'GABA', color: 'bg-green-500' },
  serotonin: { label: 'Serotonin', color: 'bg-purple-500' },
}

const MAX_SCORE = 105 // 35 questions * max 3 per question

export function BravermanResults({ scores, dominantType }: BravermanResultsProps) {
  const personality = PERSONALITY_DESCRIPTIONS[dominantType]

  return (
    <div className="flex flex-col gap-6">
      <div className="glass-card rounded-2xl p-6 text-center">
        <h2 className="font-display text-2xl font-bold text-foreground mb-2">
          Your Dominant Type: <span className="gradient-text">{personality?.title ?? dominantType}</span>
        </h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          {personality?.description}
        </p>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <h3 className="font-display text-lg font-bold text-foreground mb-4">
          Deficiency Scores
        </h3>
        <p className="text-xs text-muted-foreground mb-4">
          Higher scores indicate greater deficiency — your quests will target these areas.
        </p>
        <div className="flex flex-col gap-4">
          {(Object.entries(NT_LABELS) as [PersonalityType, { label: string; color: string }][]).map(
            ([key, { label, color }]) => {
              const score = scores[key]
              const percentage = Math.round((score / MAX_SCORE) * 100)
              const isDominant = key === dominantType

              return (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-medium ${isDominant ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {label}
                      {isDominant && (
                        <span className="ml-2 text-xs text-primary">(Dominant)</span>
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
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    </div>
  )
}
