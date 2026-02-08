'use client'

import { useState } from 'react'
import { Heart, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface InterestsStepProps {
  onComplete: (interests: string[]) => void
}

const INTEREST_OPTIONS = [
  'Yoga',
  'Running',
  'Meditation',
  'Reading',
  'Writing',
  'Coding',
  'Painting',
  'Music',
  'Gaming',
  'Cooking',
  'Photography',
  'Languages',
  'Hiking',
  'Gardening',
  'Dancing',
  'Cycling',
  'Swimming',
  'Drawing',
  'Journaling',
  'Podcasts',
]

export function InterestsStep({ onComplete }: InterestsStepProps) {
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
          Optional
        </span>
      </div>

      <h2 className="mb-3 text-center font-display text-xl font-bold text-foreground sm:text-2xl">
        What Are Your Interests?
      </h2>
      <p className="mb-2 text-center text-sm text-muted-foreground">
        Select up to 10 interests to personalize your tasks
      </p>
      <p className="mb-8 text-center text-xs text-muted-foreground">
        {selectedInterests.length}/10 selected
      </p>

      <div className="mb-8 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {INTEREST_OPTIONS.map((interest) => {
          const isSelected = selectedInterests.includes(interest)
          return (
            <button
              key={interest}
              type="button"
              onClick={() => toggleInterest(interest)}
              className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-medium transition-all ${
                isSelected
                  ? 'border-primary bg-primary/10 text-foreground'
                  : 'border-border bg-background/50 text-muted-foreground hover:border-primary/50'
              }`}
            >
              {isSelected && <Heart className="h-3 w-3 fill-primary text-primary" />}
              {interest}
            </button>
          )
        })}
      </div>

      {selectedInterests.length > 0 && (
        <div className="mb-6 rounded-lg bg-primary/5 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            You selected:
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
          Skip
        </Button>
        <Button
          onClick={handleSubmit}
          className="flex-1"
          size="lg"
          disabled={selectedInterests.length === 0}
        >
          Continue
        </Button>
      </div>
    </div>
  )
}
