/**
 * XP & Level calculation utilities.
 * Formula: xpForLevel(n) = Math.floor(100 * n^1.5)
 */

export type RankTier = 'iron' | 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'master' | 'grandmaster' | 'challenger'

// ─── XP Math ────────────────────────────────────────────────────────────────

export function xpForLevel(level: number): number {
    if (level <= 1) return 0
    return Math.floor(100 * Math.pow(level, 1.5))
}

export function totalXPForLevel(level: number): number {
    let total = 0
    for (let i = 1; i <= level; i++) {
        total += xpForLevel(i)
    }
    return total
}

export function getLevelFromTotalXP(totalXP: number): number {
    let level = 1
    while (totalXPForLevel(level + 1) <= totalXP) {
        level++
        if (level >= 200) break
    }
    return level
}

export function getXPProgress(totalXP: number): {
    level: number
    currentXP: number
    maxXP: number
    percentage: number
} {
    const level = getLevelFromTotalXP(totalXP)
    const xpAtLevelStart = totalXPForLevel(level)
    const xpForThisLevel = xpForLevel(level + 1)
    const currentXP = totalXP - xpAtLevelStart
    const percentage = xpForThisLevel > 0
        ? Math.min(100, Math.max(0, (currentXP / xpForThisLevel) * 100))
        : 0

    return { level, currentXP, maxXP: xpForThisLevel, percentage }
}

// ─── Rank ───────────────────────────────────────────────────────────────────

const RANK_THRESHOLDS: Array<{ min: number; max: number; rank: RankTier }> = [
    { min: 100, max: Infinity, rank: 'challenger' },
    { min: 91, max: 99, rank: 'grandmaster' },
    { min: 71, max: 90, rank: 'master' },
    { min: 51, max: 70, rank: 'diamond' },
    { min: 36, max: 50, rank: 'platinum' },
    { min: 21, max: 35, rank: 'gold' },
    { min: 11, max: 20, rank: 'silver' },
    { min: 6, max: 10, rank: 'bronze' },
    { min: 1, max: 5, rank: 'iron' },
]

export function getRankFromLevel(level: number): RankTier {
    for (const t of RANK_THRESHOLDS) {
        if (level >= t.min && level <= t.max) return t.rank
    }
    return 'iron'
}

export function getRankLevelRange(rank: RankTier): string {
    const t = RANK_THRESHOLDS.find((r) => r.rank === rank)
    if (!t) return '1-5'
    if (t.max === Infinity) return `${t.min}+`
    return `${t.min}-${t.max}`
}

// ─── Rank Colors ────────────────────────────────────────────────────────────

export interface RankColors {
    primary: string
    accent: string
    rankColor: string
    glowColor: string
}

export const RANK_COLOR_MAP: Record<RankTier, RankColors> = {
    iron: { primary: '#8B8B8B', accent: '#BDBDBD', rankColor: '#8B8B8B', glowColor: '#8B8B8B40' },
    bronze: { primary: '#CD7F32', accent: '#E8A96E', rankColor: '#CD7F32', glowColor: '#CD7F3240' },
    silver: { primary: '#C0C0C0', accent: '#E0E0E0', rankColor: '#C0C0C0', glowColor: '#C0C0C040' },
    gold: { primary: '#FFD700', accent: '#FFE44D', rankColor: '#FFD700', glowColor: '#FFD70050' },
    platinum: { primary: '#00CED1', accent: '#80FAFF', rankColor: '#00CED1', glowColor: '#00CED150' },
    diamond: { primary: '#00BFFF', accent: '#9BB8FF', rankColor: '#00BFFF', glowColor: '#00BFFF60' },
    master: { primary: '#9B59B6', accent: '#C17FFF', rankColor: '#9B59B6', glowColor: '#9B59B660' },
    grandmaster: { primary: '#FF4500', accent: '#FF7043', rankColor: '#FF4500', glowColor: '#FF450060' },
    challenger: { primary: '#FFFFFF', accent: '#E0E0E0', rankColor: '#FFFFFF', glowColor: '#FFFFFF80' },
}

export function getRankColors(rank: RankTier): RankColors {
    return RANK_COLOR_MAP[rank] ?? RANK_COLOR_MAP.iron
}
