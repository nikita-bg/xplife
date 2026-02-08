'use client'

import { useState } from 'react'
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
  const [timePreference, setTimePreference] = useState<TimePreferencesData['timePreference']>('morning')
  const [preferredTaskDuration, setPreferredTaskDuration] = useState<TimePreferencesData['preferredTaskDuration']>('medium')

  const handleSubmit = () => {
    onComplete({ timePreference, preferredTaskDuration })
  }

  const timeOptions = [
    { value: 'morning' as const, label: 'Morning Person', icon: Sun, description: 'Most energetic in the morning' },
    { value: 'afternoon' as const, label: 'Afternoon Peak', icon: Cloud, description: 'Best focus after lunch' },
    { value: 'evening' as const, label: 'Evening Energy', icon: Sunset, description: 'Productive in the evening' },
    { value: 'night' as const, label: 'Night Owl', icon: Moon, description: 'Work best at night' },
  ]

  const durationOptions = [
    { value: 'quick' as const, label: 'Quick Wins', icon: Zap, description: '5-15 minute tasks' },
    { value: 'medium' as const, label: 'Balanced Tasks', icon: Clock, description: '15-45 minute tasks' },
    { value: 'deep' as const, label: 'Deep Work', icon: Clock, description: '1+ hour sessions' },
  ]

  return (
    <div className="glass-card gradient-border rounded-2xl p-8 sm:p-12">
      <div className="mb-2 text-center">
        <span className="font-display text-xs font-bold uppercase tracking-widest text-accent">
          Personalize Your Experience
        </span>
      </div>

      <h2 className="mb-3 text-center font-display text-xl font-bold text-foreground sm:text-2xl">
        When Do You Work Best?
      </h2>
      <p className="mb-8 text-center text-sm text-muted-foreground">
        Help us schedule tasks at your peak performance times
      </p>

      {/* Time Preference Selection */}
      <div className="mb-8">
        <label className="mb-3 block text-sm font-medium text-foreground">
          When do you have the most energy?
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
          Preferred task length?
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
        Continue
      </Button>
    </div>
  )
}
