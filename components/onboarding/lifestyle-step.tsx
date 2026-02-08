'use client'

import { useState } from 'react'
import { Briefcase, Calendar, Target, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface LifestyleData {
  occupationType: string | null
  workSchedule: string | null
  lifePhase: string | null
  mainChallenge: string | null
}

interface LifestyleStepProps {
  onComplete: (data: LifestyleData) => void
}

export function LifestyleStep({ onComplete }: LifestyleStepProps) {
  const [occupationType, setOccupationType] = useState<string | null>(null)
  const [workSchedule, setWorkSchedule] = useState<string | null>(null)
  const [lifePhase, setLifePhase] = useState<string | null>(null)
  const [mainChallenge, setMainChallenge] = useState<string | null>(null)

  const handleSubmit = () => {
    onComplete({ occupationType, workSchedule, lifePhase, mainChallenge })
  }

  const canSubmit = occupationType && mainChallenge

  const occupationOptions = [
    'Student',
    'Office Worker',
    'Remote Worker',
    'Entrepreneur',
    'Freelancer',
    'Healthcare',
    'Creative',
    'Other',
  ]

  const scheduleOptions = [
    'Full-time',
    'Part-time',
    'Flexible',
    'Shift work',
  ]

  const phaseOptions = [
    'Building career',
    'Work-life balance',
    'Student life',
    'Exploring',
  ]

  const challengeOptions = [
    'Finding time',
    'Low energy',
    'Staying focused',
    'Motivation',
    'Being consistent',
  ]

  return (
    <div className="glass-card gradient-border rounded-2xl p-8 sm:p-12">
      <div className="mb-2 text-center">
        <span className="font-display text-xs font-bold uppercase tracking-widest text-accent">
          Tell Us About You
        </span>
      </div>

      <h2 className="mb-3 text-center font-display text-xl font-bold text-foreground sm:text-2xl">
        Your Lifestyle Context
      </h2>
      <p className="mb-8 text-center text-sm text-muted-foreground">
        This helps us create tasks that fit your daily life
      </p>

      {/* Occupation Type */}
      <div className="mb-6">
        <label className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
          <Briefcase className="h-4 w-4" />
          What describes you best?
        </label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {occupationOptions.map((option) => {
            const isSelected = occupationType === option
            return (
              <button
                key={option}
                type="button"
                onClick={() => setOccupationType(option)}
                className={`rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/10 text-foreground'
                    : 'border-border bg-background/50 text-muted-foreground hover:border-primary/50'
                }`}
              >
                {option}
              </button>
            )
          })}
        </div>
      </div>

      {/* Work Schedule */}
      <div className="mb-6">
        <label className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
          <Calendar className="h-4 w-4" />
          Work schedule (optional)
        </label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {scheduleOptions.map((option) => {
            const isSelected = workSchedule === option
            return (
              <button
                key={option}
                type="button"
                onClick={() => setWorkSchedule(option)}
                className={`rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/10 text-foreground'
                    : 'border-border bg-background/50 text-muted-foreground hover:border-primary/50'
                }`}
              >
                {option}
              </button>
            )
          })}
        </div>
      </div>

      {/* Life Phase */}
      <div className="mb-6">
        <label className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
          <Target className="h-4 w-4" />
          Current life phase (optional)
        </label>
        <div className="grid grid-cols-2 gap-2">
          {phaseOptions.map((option) => {
            const isSelected = lifePhase === option
            return (
              <button
                key={option}
                type="button"
                onClick={() => setLifePhase(option)}
                className={`rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/10 text-foreground'
                    : 'border-border bg-background/50 text-muted-foreground hover:border-primary/50'
                }`}
              >
                {option}
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Challenge */}
      <div className="mb-8">
        <label className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
          <AlertCircle className="h-4 w-4" />
          What&apos;s your biggest challenge?
        </label>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {challengeOptions.map((option) => {
            const isSelected = mainChallenge === option
            return (
              <button
                key={option}
                type="button"
                onClick={() => setMainChallenge(option)}
                className={`rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/10 text-foreground'
                    : 'border-border bg-background/50 text-muted-foreground hover:border-primary/50'
                }`}
              >
                {option}
              </button>
            )
          })}
        </div>
      </div>

      <Button onClick={handleSubmit} disabled={!canSubmit} className="w-full" size="lg">
        Continue
      </Button>
    </div>
  )
}
