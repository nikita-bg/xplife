'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Sparkles, X, AlertCircle, ArrowUpRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { TaskCard } from './task-card'
import type { Task } from '@/lib/types'
import Link from 'next/link'

interface DailyTasksProps {
  tasks: Task[]
  userId: string
}

type ErrorType = {
  message: string
  canRetry: boolean
  showUpgrade: boolean
  showProfileLink: boolean
}

export function DailyTasks({ tasks, userId }: DailyTasksProps) {
  const router = useRouter()
  const t = useTranslations('dashboard.dailyTasks')
  const [generating, setGenerating] = useState(false)
  const [showGoalInput, setShowGoalInput] = useState(false)
  const [goalText, setGoalText] = useState('')
  const [error, setError] = useState<ErrorType | null>(null)

  const handleGenerateClick = () => {
    if (!showGoalInput) {
      setShowGoalInput(true)
      setError(null)
      return
    }
  }

  const handleGenerate = async () => {
    const trimmed = goalText.trim()
    if (!trimmed) {
      setError({
        message: t('emptyGoalsError'),
        canRetry: false,
        showUpgrade: false,
        showProfileLink: false,
      })
      return
    }

    setError(null)
    setGenerating(true)
    try {
      const res = await fetch('/api/ai/generate-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goals: trimmed }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        const errorMessage = data?.error || 'Failed to generate quests'

        const errorType: ErrorType = {
          message: errorMessage,
          canRetry: false,
          showUpgrade: false,
          showProfileLink: false,
        }

        if (res.status === 429 || errorMessage.toLowerCase().includes('limit')) {
          errorType.showUpgrade = true
          errorType.canRetry = false
        } else if (res.status === 404 || errorMessage.toLowerCase().includes('profile not found')) {
          errorType.showProfileLink = true
          errorType.canRetry = false
        } else if (res.status === 503 || errorMessage.toLowerCase().includes('temporarily unavailable')) {
          errorType.canRetry = true
        } else if (res.status >= 500) {
          errorType.canRetry = true
        }

        setError(errorType)
        return
      }

      setShowGoalInput(false)
      setGoalText('')
      setError(null)
      router.refresh()
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : 'Failed to generate quests',
        canRetry: true,
        showUpgrade: false,
        showProfileLink: false,
      })
    } finally {
      setGenerating(false)
    }
  }

  const handleCancel = () => {
    setShowGoalInput(false)
    setGoalText('')
    setError(null)
  }

  const pendingTasks = tasks.filter((t) => t.status !== 'completed')
  const completedTasks = tasks.filter((t) => t.status === 'completed')

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-foreground">
          {t('title')}
        </h2>
        <Button
          onClick={handleGenerateClick}
          disabled={generating}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Sparkles className="h-4 w-4" />
          {generating ? t('generating') : t('generateQuests')}
        </Button>
      </div>

      {showGoalInput && (
        <div className="glass-card rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground">
              {t('describeGoals')}
            </h3>
            <button
              onClick={handleCancel}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <Textarea
            placeholder={t('placeholder')}
            value={goalText}
            onChange={(e) => setGoalText(e.target.value)}
            rows={3}
            className="resize-none"
          />
          {error && (
            <div className="glass-card rounded-lg p-3 border border-destructive/20 bg-destructive/5">
              <div className="flex gap-2">
                <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                <div className="flex-1 space-y-2">
                  <p className="text-sm text-destructive">{error.message}</p>
                  <div className="flex gap-2 flex-wrap">
                    {error.canRetry && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleGenerate}
                        disabled={generating}
                        className="h-7 text-xs"
                      >
                        {t('tryAgain')}
                      </Button>
                    )}
                    {error.showUpgrade && (
                      <Link href="/profile">
                        <Button
                          size="sm"
                          variant="default"
                          className="h-7 text-xs gap-1"
                        >
                          {t('upgradePlan')}
                          <ArrowUpRight className="h-3 w-3" />
                        </Button>
                      </Link>
                    )}
                    {error.showProfileLink && (
                      <Link href="/profile">
                        <Button
                          size="sm"
                          variant="default"
                          className="h-7 text-xs gap-1"
                        >
                          {t('completeProfile')}
                          <ArrowUpRight className="h-3 w-3" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="flex gap-2 justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              disabled={generating}
            >
              {t('cancel')}
            </Button>
            <Button
              size="sm"
              onClick={handleGenerate}
              disabled={generating}
              className="gap-2"
            >
              <Sparkles className="h-4 w-4" />
              {generating ? t('generating') : t('generate')}
            </Button>
          </div>
        </div>
      )}

      {tasks.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <Sparkles className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
          <h3 className="font-display text-lg font-bold text-foreground">{t('noQuestsTitle')}</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {t('noQuestsDescription')}
          </p>
        </div>
      ) : (
        <>
          {pendingTasks.length > 0 && (
            <div className="flex flex-col gap-3">
              {pendingTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          )}

          {completedTasks.length > 0 && (
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-medium text-muted-foreground">{t('completed')}</h3>
              {completedTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
