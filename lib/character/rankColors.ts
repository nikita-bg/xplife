/**
 * Rank tier → visual configuration mapping.
 * Controls glow colors, labels, and sort order for the character system.
 */

import type { RankTier } from '@/components/character/CharacterConfig'

export interface RankConfig {
  color: string
  glow: string
  label: string
  order: number
}

/** Full rank configuration map — sorted by ascending progression order */
export const RANK_CONFIG: Record<RankTier, RankConfig> = {
  iron: { color: '#8B8B8B', glow: '#8B8B8B40', label: 'Iron', order: 1 },
  bronze: { color: '#CD7F32', glow: '#CD7F3240', label: 'Bronze', order: 2 },
  silver: { color: '#C0C0C0', glow: '#C0C0C040', label: 'Silver', order: 3 },
  gold: { color: '#FFD700', glow: '#FFD70050', label: 'Gold', order: 4 },
  platinum: { color: '#00CED1', glow: '#00CED150', label: 'Platinum', order: 5 },
  diamond: { color: '#00BFFF', glow: '#00BFFF60', label: 'Diamond', order: 6 },
  master: { color: '#9B59B6', glow: '#9B59B660', label: 'Master', order: 7 },
  grandmaster: { color: '#FF4500', glow: '#FF450060', label: 'Grandmaster', order: 8 },
  challenger: { color: '#FFFFFF', glow: '#FFFFFF80', label: 'Challenger', order: 9 },
}

/** All rank tiers sorted by progression order */
export const RANK_TIERS_SORTED: RankTier[] = (
  Object.entries(RANK_CONFIG) as [RankTier, RankConfig][]
)
  .sort((a, b) => a[1].order - b[1].order)
  .map(([tier]) => tier)

/**
 * Get the rank config for a given tier.
 * Falls back to 'iron' if the tier is invalid.
 */
export function getRankConfig(tier: RankTier): RankConfig {
  return RANK_CONFIG[tier] ?? RANK_CONFIG.iron
}

/**
 * Check if rankA is higher than or equal to rankB in progression order.
 */
export function isRankAtLeast(current: RankTier, required: RankTier): boolean {
  return RANK_CONFIG[current].order >= RANK_CONFIG[required].order
}
