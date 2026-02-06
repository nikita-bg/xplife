'use client'

import Link from 'next/link'
import { CheckCircle2, Circle, Zap } from 'lucide-react'
import type { Task } from '@/lib/types'

interface TaskCardProps {
  task: Task
}

const difficultyColors: Record<string, string> = {
  easy: 'bg-green-500/10 text-green-400',
  medium: 'bg-yellow-500/10 text-yellow-400',
  hard: 'bg-orange-500/10 text-orange-400',
  epic: 'bg-purple-500/10 text-purple-400',
}

export function TaskCard({ task }: TaskCardProps) {
  const isCompleted = task.status === 'completed'

  return (
    <Link
      href={`/tasks/${task.id}`}
      className={`glass-card flex items-center gap-4 rounded-xl p-4 transition-all hover:bg-card/80 ${
        isCompleted ? 'opacity-60' : ''
      }`}
    >
      {isCompleted ? (
        <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-accent" />
      ) : (
        <Circle className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
      )}

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${isCompleted ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
          {task.title}
        </p>
        {task.description && (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{task.description}</p>
        )}
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${difficultyColors[task.difficulty] ?? 'bg-muted text-muted-foreground'}`}>
          {task.difficulty}
        </span>
        <span className="flex items-center gap-1 font-display text-xs text-primary">
          <Zap className="h-3 w-3" />
          +{task.xp_reward}
        </span>
      </div>
    </Link>
  )
}
