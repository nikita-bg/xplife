'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Heart, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface InterestsStepProps {
  onComplete: (interests: string[]) => void
}

const INTEREST_KEYS = [
  'yoga',
  'running',
  'meditation',
  'reading',
  'writing',
  'coding',
  'painting',
  'music',
  'gaming',
  'cooking',
  'photography',
  'languages',
  'hiking',
  'gardening',
  'dancing',
  'cycling',
  'swimming',
  'drawing',
  'journaling',
  'podcasts',
]

export function InterestsStep({ onComplete }: InterestsStepProps) {
  const t = useTranslations('onboarding.interests')
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) => {
      if (prev.includes(interest)) {
        return prev.filter((i) => i !== interest)
      }
      if (prev.length >= 10) {
        return prev // Max 10 interests
      }
      return [...prev, interest]
    })
  }

  const handleSubmit = () => {
    onComplete(selectedInterests)
  }

  const handleSkip = () => {
    onComplete([])
  }

  return (
    <div className="glass-card gradient-border rounded-2xl p-8 sm:p-12">
      <div className="mb-2 text-center">
        <span className="font-display text-xs font-bold uppercase tracking-widest text-accent">
          {t('subtitle')}
        </span>
      </div>

      <h2 className="mb-3 text-center font-display text-xl font-bold text-foreground sm:text-2xl">
        {t('title')}
      </h2>
      <p className="mb-2 text-center text-sm text-muted-foreground">
        {t('description')}
      </p>
      <p className="mb-8 text-center text-xs text-muted-foreground">
        {t('selected', { count: selectedInterests.length })}
      </p>

      <div className="mb-8 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {INTEREST_KEYS.map((interestKey) => {
          const interestLabel = t(`options.${interestKey}`)
          const isSelected = selectedInterests.includes(interestLabel)
          return (
            <button
              key={interestKey}
              type="button"
              onClick={() => toggleInterest(interestLabel)}
              className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-medium transition-all ${
                isSelected
                  ? 'border-primary bg-primary/10 text-foreground'
                  : 'border-border bg-background/50 text-muted-foreground hover:border-primary/50'
              }`}
            >
              {isSelected && <Heart className="h-3 w-3 fill-primary text-primary" />}
              {interestLabel}
            </button>
          )
        })}
      </div>

      {selectedInterests.length > 0 && (
        <div className="mb-6 rounded-lg bg-primary/5 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            {t('youSelected')}
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedInterests.map((interest) => (
              <span
                key={interest}
                className="rounded-md bg-primary/10 px-2 py-1 text-xs text-foreground"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <Button onClick={handleSkip} variant="outline" className="flex-1" size="lg">
          {t('skip')}
        </Button>
        <Button
          onClick={handleSubmit}
          className="flex-1"
          size="lg"
          disabled={selectedInterests.length === 0}
        >
          {t('continue')}
        </Button>
      </div>
    </div>
  )
}
