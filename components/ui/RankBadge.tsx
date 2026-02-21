'use client'

import type { RankTier } from '@/components/character/CharacterConfig'

const RANK_STYLES: Record<RankTier, { bg: string; border: string; color: string }> = {
    iron: { bg: 'rgba(140,140,140,0.15)', border: 'rgba(140,140,140,0.4)', color: '#9E9E9E' },
    bronze: { bg: 'rgba(205,127,50,0.15)', border: 'rgba(205,127,50,0.4)', color: '#CD7F32' },
    silver: { bg: 'rgba(192,192,192,0.15)', border: 'rgba(192,192,192,0.4)', color: '#C0C0C0' },
    gold: { bg: 'rgba(255,184,0,0.15)', border: 'rgba(255,184,0,0.4)', color: '#FFB800' },
    platinum: { bg: 'rgba(0,245,255,0.12)', border: 'rgba(0,245,255,0.4)', color: '#00F5FF' },
    diamond: { bg: 'rgba(100,149,237,0.15)', border: 'rgba(100,149,237,0.4)', color: '#6495ED' },
    master: { bg: 'rgba(155,78,221,0.15)', border: 'rgba(155,78,221,0.4)', color: '#9D4EDD' },
    grandmaster: { bg: 'rgba(255,69,0,0.15)', border: 'rgba(255,69,0,0.4)', color: '#FF4500' },
    challenger: { bg: 'rgba(255,215,0,0.2)', border: 'rgba(255,215,0,0.5)', color: '#FFD700' },
}

interface RankBadgeProps {
    rank: RankTier
}

export function RankBadge({ rank }: RankBadgeProps) {
    const s = RANK_STYLES[rank] ?? RANK_STYLES.iron
    const label = rank ? rank.toUpperCase() : 'IRON'

    return (
        <span
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: s.bg,
                border: `1px solid ${s.border}`,
                color: s.color,
                borderRadius: '20px',
                padding: '6px 20px',
                fontFamily: 'var(--font-orbitron), sans-serif',
                fontSize: '12px',
                letterSpacing: '0.1em',
                fontWeight: 700,
            }}
        >
            ◆ {label} RANK
        </span>
    )
}
