import { Flame } from 'lucide-react'

interface StreakCounterProps {
  currentStreak: number
  longestStreak: number
}

export function StreakCounter({ currentStreak, longestStreak }: StreakCounterProps) {
  return (
    <div className="glass-card gradient-border rounded-2xl p-6">
      <div className="flex items-center gap-4">
        <div className={`flex h-14 w-14 items-center justify-center rounded-xl bg-accent/20 ${currentStreak > 0 ? 'animate-pulse-glow' : ''}`}>
          <Flame className="h-7 w-7 text-accent" />
        </div>
        <div>
          <p className="font-display text-3xl font-bold text-foreground">
            {currentStreak}
            <span className="ml-1 text-base text-muted-foreground">days</span>
          </p>
          <p className="text-sm text-muted-foreground">Best: {longestStreak}d</p>
        </div>
      </div>
    </div>
  )
}
