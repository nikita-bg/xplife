'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TaskCard } from './task-card'
import type { Task } from '@/lib/types'

interface DailyTasksProps {
  tasks: Task[]
  userId: string
}

export function DailyTasks({ tasks, userId }: DailyTasksProps) {
  const router = useRouter()
  const [generating, setGenerating] = useState(false)

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      await fetch('/api/ai/generate-tasks', { method: 'POST' })
      router.refresh()
    } catch {
      // n8n not configured
    } finally {
      setGenerating(false)
    }
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
          onClick={handleGenerate}
          disabled={generating}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Sparkles className="h-4 w-4" />
          {generating ? 'Generating...' : 'Generate Quests'}
        </Button>
      </div>

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
