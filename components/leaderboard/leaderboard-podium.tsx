'use client'

import Image from 'next/image'
import { Trophy, Crown } from 'lucide-react'
import type { LeaderboardEntry } from '@/lib/types'

interface PodiumProps {
    entries: LeaderboardEntry[]
}

function PodiumPlayer({
    entry,
    position,
    height,
}: {
    entry: LeaderboardEntry
    position: number
    height: string
}) {
    const colors = {
        1: { bg: 'linear-gradient(135deg, #FFD700, #F59E0B)', ring: '#FFD700', glow: 'rgba(255,215,0,0.4)', icon: '👑' },
        2: { bg: 'linear-gradient(135deg, #C0C0C0, #9CA3AF)', ring: '#C0C0C0', glow: 'rgba(192,192,192,0.3)', icon: '🥈' },
        3: { bg: 'linear-gradient(135deg, #CD7F32, #B8860B)', ring: '#CD7F32', glow: 'rgba(205,127,50,0.3)', icon: '🥉' },
    }[position] ?? { bg: 'var(--bg-card)', ring: 'var(--glass-border)', glow: 'transparent', icon: '' }

    return (
        <div className="flex flex-col items-center" style={{ order: position === 1 ? 0 : position === 2 ? -1 : 1 }}>
            {/* Avatar */}
            <div className="relative mb-2">
                {position === 1 && (
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-2xl">
                        <Crown className="h-6 w-6 text-yellow-400" />
                    </div>
                )}
                <div
                    className="flex h-16 w-16 items-center justify-center rounded-full text-lg font-bold text-white sm:h-20 sm:w-20"
                    style={{
                        background: colors.bg,
                        boxShadow: `0 0 20px ${colors.glow}`,
                        border: `3px solid ${colors.ring}`,
                    }}
                >
                    {entry.avatar_url ? (
                        <Image
                            src={entry.avatar_url}
                            alt={entry.display_name ?? 'Player'}
                            width={80}
                            height={80}
                            className="h-full w-full rounded-full object-cover"
                        />
                    ) : (
                        (entry.display_name?.[0] ?? '?').toUpperCase()
                    )}
                </div>
                {/* Position badge */}
                <div
                    className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ background: colors.bg }}
                >
                    {position}
                </div>
            </div>

            {/* Name */}
            <span className="mb-1 max-w-[100px] truncate text-center text-sm font-bold text-foreground">
                {entry.display_name ?? 'Anonymous'}
            </span>

            {/* XP */}
            <span className="mb-2 text-xs font-display" style={{ color: 'var(--accent-cyan)' }}>
                {entry.total_xp.toLocaleString()} XP
            </span>

            {/* Podium block */}
            <div
                className="w-24 rounded-t-lg sm:w-28"
                style={{
                    height,
                    background: colors.bg,
                    opacity: 0.8,
                }}
            />
        </div>
    )
}

export function LeaderboardPodium({ entries }: PodiumProps) {
    if (entries.length < 3) return null

    const top3 = entries.slice(0, 3)

    return (
        <div className="mb-6 flex items-end justify-center gap-3 sm:gap-6">
            {/* Silver (2nd) — Left */}
            <PodiumPlayer entry={top3[1]} position={2} height="80px" />
            {/* Gold (1st) — Center */}
            <PodiumPlayer entry={top3[0]} position={1} height="110px" />
            {/* Bronze (3rd) — Right */}
            <PodiumPlayer entry={top3[2]} position={3} height="60px" />
        </div>
    )
}
