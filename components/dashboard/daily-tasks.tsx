'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { TaskCard } from './task-card'
import type { Task } from '@/lib/types'

interface DailyTasksProps {
  tasks: Task[]
  userId: string
}

export function DailyTasks({ tasks, userId }: DailyTasksProps) {
  const router = useRouter()
  const [generating, setGenerating] = useState(false)
  const [showGoalInput, setShowGoalInput] = useState(false)
  const [goalText, setGoalText] = useState('')
  const [error, setError] = useState<string | null>(null)

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
      setError('Please describe your goals before generating quests.')
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
        throw new Error(data?.error || 'Failed to generate quests')
      }
      setShowGoalInput(false)
      setGoalText('')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate quests')
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
          {"Today's Quests"}
        </h2>
        <Button
          onClick={handleGenerateClick}
          disabled={generating}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Sparkles className="h-4 w-4" />
          {generating ? 'Generating...' : 'Generate Quests'}
        </Button>
      </div>

      {showGoalInput && (
        <div className="glass-card rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground">
              Describe your goals
            </h3>
            <button
              onClick={handleCancel}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <Textarea
            placeholder="E.g. I want to exercise more, learn Spanish, read 20 pages daily..."
            value={goalText}
            onChange={(e) => setGoalText(e.target.value)}
            rows={3}
            className="resize-none"
          />
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <div className="flex gap-2 justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              disabled={generating}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleGenerate}
              disabled={generating}
              className="gap-2"
            >
              <Sparkles className="h-4 w-4" />
              {generating ? 'Generating...' : 'Generate'}
            </Button>
          </div>
        </div>
      )}

      {tasks.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <Sparkles className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
          <h3 className="font-display text-lg font-bold text-foreground">No Quests Yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Click &ldquo;Generate Quests&rdquo; to get your personalized daily challenges.
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
              <h3 className="text-sm font-medium text-muted-foreground">Completed</h3>
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
