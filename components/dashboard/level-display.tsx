import { Shield } from 'lucide-react'

interface LevelDisplayProps {
  level: number
  title: string
}

export function LevelDisplay({ level, title }: LevelDisplayProps) {
  return (
    <div className="glass-card gradient-border rounded-2xl p-6">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/20">
          <Shield className="h-7 w-7 text-primary" />
        </div>
        <div>
          <p className="font-display text-3xl font-bold text-foreground">{level}</p>
          <p className="text-sm text-muted-foreground">{title}</p>
        </div>
      </div>
    </div>
  )
}
