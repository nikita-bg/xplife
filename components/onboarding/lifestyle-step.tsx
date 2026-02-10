'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
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
  const t = useTranslations('onboarding.lifestyle')
  const [occupationType, setOccupationType] = useState<string | null>(null)
  const [workSchedule, setWorkSchedule] = useState<string | null>(null)
  const [lifePhase, setLifePhase] = useState<string | null>(null)
  const [mainChallenge, setMainChallenge] = useState<string | null>(null)

  const handleSubmit = () => {
    onComplete({ occupationType, workSchedule, lifePhase, mainChallenge })
  }

  const canSubmit = occupationType && mainChallenge

  const occupationOptions = [
    t('occupationOptions.student'),
    t('occupationOptions.officeWorker'),
    t('occupationOptions.remoteWorker'),
    t('occupationOptions.entrepreneur'),
    t('occupationOptions.freelancer'),
    t('occupationOptions.healthcare'),
    t('occupationOptions.creative'),
    t('occupationOptions.other'),
  ]

  const scheduleOptions = [
    t('scheduleOptions.fullTime'),
    t('scheduleOptions.partTime'),
    t('scheduleOptions.flexible'),
    t('scheduleOptions.shiftWork'),
  ]

  const phaseOptions = [
    t('phaseOptions.buildingCareer'),
    t('phaseOptions.workLifeBalance'),
    t('phaseOptions.studentLife'),
    t('phaseOptions.exploring'),
  ]

  const challengeOptions = [
    t('challengeOptions.findingTime'),
    t('challengeOptions.lowEnergy'),
    t('challengeOptions.stayingFocused'),
    t('challengeOptions.motivation'),
    t('challengeOptions.beingConsistent'),
  ]

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
      <p className="mb-8 text-center text-sm text-muted-foreground">
        {t('description')}
      </p>

      {/* Occupation Type */}
      <div className="mb-6">
        <label className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
          <Briefcase className="h-4 w-4" />
          {t('occupationQuestion')}
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
          {t('scheduleQuestion')}
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
          {t('phaseQuestion')}
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
          {t('challengeQuestion')}
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
        {t('continue')}
      </Button>
    </div>
  )
}
