'use client'

import { useState } from 'react'
import { Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TASK_CATEGORIES } from '@/lib/constants'
import type { TaskCategory } from '@/lib/types'

interface GoalSettingStepProps {
  onComplete: (goals: { category: TaskCategory; title: string }[]) => void
  loading: boolean
}

export function GoalSettingStep({ onComplete, loading }: GoalSettingStepProps) {
  const [selectedCategories, setSelectedCategories] = useState<TaskCategory[]>([])
  const [goalTitles, setGoalTitles] = useState<Record<string, string>>({})

  const toggleCategory = (cat: TaskCategory) => {
    setSelectedCategories((prev) => {
      if (prev.includes(cat)) return prev.filter((c) => c !== cat)
      if (prev.length >= 3) return prev
      return [...prev, cat]
    })
  }

  const handleSubmit = () => {
    const goals = selectedCategories
      .filter((cat) => goalTitles[cat]?.trim())
      .map((cat) => ({
        category: cat,
        title: goalTitles[cat].trim(),
      }))

    if (goals.length === 0) return
    onComplete(goals)
  }

  const canSubmit = selectedCategories.some((cat) => goalTitles[cat]?.trim())

  return (
    <div className="glass-card gradient-border rounded-2xl p-8 sm:p-12">
      <div className="mb-2 text-center">
        <span className="font-display text-xs font-bold uppercase tracking-widest text-accent">
          Set Your Goals
        </span>
      </div>

      <h2 className="mb-3 text-center font-display text-xl font-bold text-foreground sm:text-2xl">
        Choose Your Quest Lines
      </h2>
      <p className="mb-8 text-center text-sm text-muted-foreground">
        Select 1-3 categories and write a goal for each
      </p>

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {TASK_CATEGORIES.map((cat) => {
          const isSelected = selectedCategories.includes(cat.value)
          return (
            <button
              key={cat.value}
              type="button"
              onClick={() => toggleCategory(cat.value)}
              className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all ${
                isSelected
                  ? 'border-primary bg-primary/10 text-foreground'
                  : 'border-border bg-background/50 text-muted-foreground hover:border-primary/50'
              }`}
            >
              <Target className={`h-5 w-5 ${isSelected ? 'text-primary' : ''}`} />
              <span className="text-xs font-medium">{cat.label}</span>
            </button>
          )
        })}
      </div>

      {selectedCategories.length > 0 && (
        <div className="mb-8 flex flex-col gap-4">
          {selectedCategories.map((cat) => {
            const label = TASK_CATEGORIES.find((c) => c.value === cat)?.label
            return (
              <div key={cat} className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  {label} Goal
                </label>
                <Input
                  placeholder={`e.g., "Run 5K in under 30 minutes"`}
                  value={goalTitles[cat] || ''}
                  onChange={(e) =>
                    setGoalTitles((prev) => ({ ...prev, [cat]: e.target.value }))
                  }
                  className="bg-background/50"
                />
              </div>
            )
          })}
        </div>
      )}

      <Button
        onClick={handleSubmit}
        disabled={!canSubmit || loading}
        className="w-full"
        size="lg"
      >
        {loading ? 'Setting up your quest...' : 'Start Your Adventure'}
      </Button>
    </div>
  )
}
