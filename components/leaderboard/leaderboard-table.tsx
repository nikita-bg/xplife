'use client'

import Image from 'next/image'
import { Flame, Zap, Crown, Gem } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { RankBadge } from './rank-badge'
import type { LeaderboardEntry } from '@/lib/types'

interface LeaderboardTableProps {
  entries: LeaderboardEntry[]
  currentUserId: string
  myRank?: number
}

function PlanBadge({ plan }: { plan?: string }) {
  if (plan === 'premium') {
    return <span title="Premium"><Crown className="h-3 w-3" style={{ color: 'var(--accent-purple)' }} /></span>
  }
  if (plan === 'lifetime') {
    return <span title="Lifetime"><Gem className="h-3 w-3" style={{ color: 'var(--accent-gold)' }} /></span>
  }
  return null
}

export function LeaderboardTable({ entries, currentUserId, myRank }: LeaderboardTableProps) {
  const t = useTranslations('leaderboard')

  if (entries.length === 0) {
    return (
      <div className="rounded-2xl p-12 text-center" style={{
        background: 'var(--glass-bg)',
        border: '1px solid var(--glass-border)',
      }}>
        <Zap className="mx-auto mb-4 h-10 w-10" style={{ color: 'var(--text-muted)' }} />
        <h3 className="font-display text-lg font-bold text-foreground">{t('noRankingsTitle')}</h3>
        <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
          {t('noRankingsDescription')}
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {myRank && (
        <div className="rounded-xl p-4" style={{
          background: 'var(--glass-bg)',
          border: '1px solid var(--glass-border)',
        }}>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {t('yourRank')} <span className="font-display font-bold" style={{ color: 'var(--accent-cyan)' }}>#{myRank}</span>
          </p>
        </div>
      )}

      <div className="rounded-2xl overflow-hidden" style={{
        background: 'var(--glass-bg)',
        border: '1px solid var(--glass-border)',
      }}>
        {/* Desktop header */}
        <div className="hidden sm:grid grid-cols-[60px_1fr_100px_80px_60px] gap-2 px-4 py-3 text-xs font-medium" style={{
          borderBottom: '1px solid var(--glass-border)',
          color: 'var(--text-muted)',
        }}>
          <span>{t('rank')}</span>
          <span>{t('player')}</span>
          <span className="text-right">{t('xp')}</span>
          <span className="text-right">{t('level')}</span>
          <span className="text-right">{t('streak')}</span>
        </div>

        <div>
          {entries.map((entry, index) => {
            const rank = entry.rank || index + 1
            const isCurrentUser = entry.user_id === currentUserId

            return (
              <div
                key={entry.id}
                className="px-4 py-3"
                style={{
                  background: isCurrentUser ? 'var(--accent-cyan-dim)' : 'transparent',
                  borderBottom: '1px solid rgba(255,255,255,0.03)',
                }}
              >
                {/* Desktop row */}
                <div className="hidden sm:grid grid-cols-[60px_1fr_100px_80px_60px] items-center gap-2">
                  <RankBadge rank={rank} />

                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{
                      background: 'var(--gradient-brand)',
                    }}>
                      {entry.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={entry.avatar_url} alt={entry.display_name ? `${entry.display_name}'s avatar` : 'User avatar'} className="h-full w-full rounded-full object-cover" />
                      ) : (
                        (entry.display_name?.[0] || '?').toUpperCase()
                      )}
                    </div>
                    <span className={`truncate text-sm ${isCurrentUser ? 'font-bold' : ''} text-foreground`}>
                      {entry.display_name || t('anonymous')}
                      {isCurrentUser && <span className="ml-1 text-xs" style={{ color: 'var(--accent-cyan)' }}>{t('you')}</span>}
                    </span>
                    <PlanBadge plan={entry.plan} />
                  </div>

                  <div className="flex items-center justify-end gap-1 text-sm">
                    <Zap className="h-3 w-3" style={{ color: 'var(--accent-cyan)' }} />
                    <span className="font-display text-foreground">{entry.total_xp.toLocaleString()}</span>
                  </div>

                  <div className="text-right">
                    <span className="rounded px-1.5 py-0.5 font-display text-xs" style={{
                      color: 'var(--accent-purple)',
                      background: 'var(--accent-purple-dim)',
                    }}>
                      {t('lvl', { level: entry.level })}
                    </span>
                  </div>

                  <div className="flex items-center justify-end gap-1 text-sm">
                    <Flame className="h-3 w-3" style={{ color: 'var(--accent-gold)' }} />
                    <span style={{ color: 'var(--text-secondary)' }}>{entry.current_streak}</span>
                  </div>
                </div>

                {/* Mobile row */}
                <div className="flex items-center gap-3 sm:hidden">
                  <RankBadge rank={rank} />

                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{
                    background: 'var(--gradient-brand)',
                  }}>
                    {entry.avatar_url ? (
                      <div className="relative h-full w-full">
                        <Image src={entry.avatar_url} alt={entry.display_name ? `${entry.display_name}'s avatar` : 'User avatar'} fill className="rounded-full object-cover" />
                      </div>
                    ) : (
                      (entry.display_name?.[0] || '?').toUpperCase()
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className={`block truncate text-sm ${isCurrentUser ? 'font-bold' : ''} text-foreground`}>
                      {entry.display_name || t('anonymous')}
                      {isCurrentUser && <span className="ml-1 text-xs" style={{ color: 'var(--accent-cyan)' }}>{t('you')}</span>}
                      <PlanBadge plan={entry.plan} />
                    </span>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
                        <Zap className="h-3 w-3" style={{ color: 'var(--accent-cyan)' }} />
                        {entry.total_xp.toLocaleString()}
                      </span>
                      <span className="font-display text-xs" style={{ color: 'var(--accent-purple)' }}>
                        {t('lvl', { level: entry.level })}
                      </span>
                      <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
                        <Flame className="h-3 w-3" style={{ color: 'var(--accent-gold)' }} />
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
