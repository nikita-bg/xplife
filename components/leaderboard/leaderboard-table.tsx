import { Flame, Zap, Crown, Gem } from 'lucide-react'
import { RankBadge } from './rank-badge'
import type { LeaderboardEntry } from '@/lib/types'

interface LeaderboardTableProps {
  entries: LeaderboardEntry[]
  currentUserId: string
  myRank?: number
}

function PlanBadge({ plan }: { plan?: string }) {
  if (plan === 'premium') {
    return <span title="Premium"><Crown className="h-3 w-3 text-primary" /></span>
  }
  if (plan === 'lifetime') {
    return <span title="Lifetime"><Gem className="h-3 w-3 text-amber-400" /></span>
  }
  return null
}

export function LeaderboardTable({ entries, currentUserId, myRank }: LeaderboardTableProps) {
  if (entries.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-12 text-center">
        <Zap className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
        <h3 className="font-display text-lg font-bold text-foreground">No Rankings Yet</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Complete quests to appear on the leaderboard.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {myRank && (
        <div className="glass-card rounded-xl p-4">
          <p className="text-sm text-muted-foreground">
            Your rank: <span className="font-display font-bold text-primary">#{myRank}</span>
          </p>
        </div>
      )}

      <div className="glass-card rounded-2xl overflow-hidden">
        {/* Desktop header */}
        <div className="hidden sm:grid grid-cols-[60px_1fr_100px_80px_60px] gap-2 border-b border-border/50 px-4 py-3 text-xs font-medium text-muted-foreground">
          <span>Rank</span>
          <span>Player</span>
          <span className="text-right">XP</span>
          <span className="text-right">Level</span>
          <span className="text-right">Streak</span>
        </div>

        <div className="divide-y divide-border/30">
          {entries.map((entry, index) => {
            const rank = entry.rank || index + 1
            const isCurrentUser = entry.user_id === currentUserId

            return (
              <div
                key={entry.id}
                className={`px-4 py-3 ${isCurrentUser ? 'bg-primary/5' : ''}`}
              >
                {/* Desktop row */}
                <div className="hidden sm:grid grid-cols-[60px_1fr_100px_80px_60px] items-center gap-2">
                  <RankBadge rank={rank} />

                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-xs font-bold text-primary-foreground">
                      {entry.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={entry.avatar_url} alt="" className="h-full w-full rounded-full object-cover" />
                      ) : (
                        (entry.display_name?.[0] || '?').toUpperCase()
                      )}
                    </div>
                    <span className={`truncate text-sm ${isCurrentUser ? 'font-bold text-foreground' : 'text-foreground'}`}>
                      {entry.display_name || 'Anonymous'}
                      {isCurrentUser && <span className="ml-1 text-xs text-primary">(You)</span>}
                    </span>
                    <PlanBadge plan={entry.plan} />
                  </div>

                  <div className="flex items-center justify-end gap-1 text-sm">
                    <Zap className="h-3 w-3 text-primary" />
                    <span className="font-display text-foreground">{entry.total_xp.toLocaleString()}</span>
                  </div>

                  <div className="text-right">
                    <span className="rounded bg-primary/10 px-1.5 py-0.5 font-display text-xs text-primary">
                      LVL {entry.level}
                    </span>
                  </div>

                  <div className="flex items-center justify-end gap-1 text-sm">
                    <Flame className="h-3 w-3 text-orange-400" />
                    <span className="text-muted-foreground">{entry.current_streak}</span>
                  </div>
                </div>

                {/* Mobile row */}
                <div className="flex items-center gap-3 sm:hidden">
                  <RankBadge rank={rank} />

                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-xs font-bold text-primary-foreground">
                    {entry.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={entry.avatar_url} alt="" className="h-full w-full rounded-full object-cover" />
                    ) : (
                      (entry.display_name?.[0] || '?').toUpperCase()
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className={`block truncate text-sm ${isCurrentUser ? 'font-bold text-foreground' : 'text-foreground'}`}>
                      {entry.display_name || 'Anonymous'}
                      {isCurrentUser && <span className="ml-1 text-xs text-primary">(You)</span>}
                      <PlanBadge plan={entry.plan} />
                    </span>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Zap className="h-3 w-3 text-primary" />
                        {entry.total_xp.toLocaleString()}
                      </span>
                      <span className="font-display text-xs text-primary">LVL {entry.level}</span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Flame className="h-3 w-3 text-orange-400" />
                        {entry.current_streak}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
