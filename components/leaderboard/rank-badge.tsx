import { Trophy } from 'lucide-react'

interface RankBadgeProps {
  rank: number
}

export function RankBadge({ rank }: RankBadgeProps) {
  if (rank <= 3) {
    const colors = {
      1: 'text-yellow-400',
      2: 'text-gray-300',
      3: 'text-amber-600',
    } as Record<number, string>

    return (
      <div className="flex items-center justify-center">
        <Trophy className={`h-5 w-5 ${colors[rank]}`} />
      </div>
    )
  }

  return (
    <span className="text-center font-display text-sm text-muted-foreground">
      #{rank}
    </span>
  )
}
