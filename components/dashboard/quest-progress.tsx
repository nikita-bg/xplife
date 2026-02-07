import type { QuestTimeframe } from '@/lib/types'

interface QuestProgressProps {
  completed: number
  total: number
  timeframe: QuestTimeframe
}

export function QuestProgress({ completed, total, timeframe }: QuestProgressProps) {
  if (total === 0) {
    return (
      <p className="text-sm text-muted-foreground">No quests yet</p>
    )
  }

  const pct = Math.round((completed / total) * 100)

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-muted-foreground capitalize">{timeframe} progress</span>
        <span className="font-medium text-foreground">
          {completed}/{total} completed
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
