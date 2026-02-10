'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Sun, Cloud, Sunset, Moon, Zap, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TimePreferencesData {
  timePreference: 'morning' | 'afternoon' | 'evening' | 'night'
  preferredTaskDuration: 'quick' | 'medium' | 'deep'
}

interface TimePreferencesStepProps {
  onComplete: (data: TimePreferencesData) => void
}

export function TimePreferencesStep({ onComplete }: TimePreferencesStepProps) {
  const t = useTranslations('onboarding.timePreferences')
  const [timePreference, setTimePreference] = useState<TimePreferencesData['timePreference']>('morning')
  const [preferredTaskDuration, setPreferredTaskDuration] = useState<TimePreferencesData['preferredTaskDuration']>('medium')

  const handleSubmit = () => {
    onComplete({ timePreference, preferredTaskDuration })
  }

  const timeOptions = [
    { value: 'morning' as const, label: t('timeOptions.morning.label'), icon: Sun, description: t('timeOptions.morning.description') },
    { value: 'afternoon' as const, label: t('timeOptions.afternoon.label'), icon: Cloud, description: t('timeOptions.afternoon.description') },
    { value: 'evening' as const, label: t('timeOptions.evening.label'), icon: Sunset, description: t('timeOptions.evening.description') },
    { value: 'night' as const, label: t('timeOptions.night.label'), icon: Moon, description: t('timeOptions.night.description') },
  ]

  const durationOptions = [
    { value: 'quick' as const, label: t('durationOptions.quick.label'), icon: Zap, description: t('durationOptions.quick.description') },
    { value: 'medium' as const, label: t('durationOptions.medium.label'), icon: Clock, description: t('durationOptions.medium.description') },
    { value: 'deep' as const, label: t('durationOptions.deep.label'), icon: Clock, description: t('durationOptions.deep.description') },
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

      {/* Time Preference Selection */}
      <div className="mb-8">
        <label className="mb-3 block text-sm font-medium text-foreground">
          {t('energyQuestion')}
        </label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {timeOptions.map((option) => {
            const Icon = option.icon
            const isSelected = timePreference === option.value
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setTimePreference(option.value)}
                className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/10 text-foreground'
                    : 'border-border bg-background/50 text-muted-foreground hover:border-primary/50'
                }`}
              >
                <Icon className={`h-5 w-5 flex-shrink-0 ${isSelected ? 'text-primary' : ''}`} />
                <div>
                  <div className={`text-sm font-medium ${isSelected ? 'text-foreground' : ''}`}>
                    {option.label}
                  </div>
                  <div className="text-xs text-muted-foreground">{option.description}</div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Task Duration Preference */}
      <div className="mb-8">
        <label className="mb-3 block text-sm font-medium text-foreground">
          {t('durationQuestion')}
        </label>
        <div className="grid grid-cols-1 gap-3">
          {durationOptions.map((option) => {
            const Icon = option.icon
            const isSelected = preferredTaskDuration === option.value
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setPreferredTaskDuration(option.value)}
                className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/10 text-foreground'
                    : 'border-border bg-background/50 text-muted-foreground hover:border-primary/50'
                }`}
              >
                <Icon className={`h-5 w-5 flex-shrink-0 ${isSelected ? 'text-primary' : ''}`} />
                <div>
                  <div className={`text-sm font-medium ${isSelected ? 'text-foreground' : ''}`}>
                    {option.label}
                  </div>
                  <div className="text-xs text-muted-foreground">{option.description}</div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <Button onClick={handleSubmit} className="w-full" size="lg">
        {t('continue')}
      </Button>
    </div>
  )
}
