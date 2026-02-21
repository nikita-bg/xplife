/**
 * XP Award — server-safe function to grant XP and handle level-ups.
 * Uses formula-based calculation (not level_config table).
 */

import { createClient } from '@/lib/supabase/client'
import { getXPProgress, getLevelFromTotalXP, xpForLevel } from '@/lib/xpUtils'

interface XPAwardResult {
  newXp: number
  leveledUp: boolean
  oldLevel: number
  newLevel: number
  levelsGained: number
}

export async function awardXp(
  userId: string,
  amount: number,
  source: string,
  taskId?: string
): Promise<XPAwardResult | null> {
  const supabase = createClient()

  // Log XP
  await supabase.from('xp_logs').insert({
    user_id: userId,
    amount,
    source,
    task_id: taskId ?? null,
  })

  // Get current user data
  const { data: user } = await supabase
    .from('users')
    .select('total_xp, level')
    .eq('id', userId)
    .single()

  if (!user) return null

  const oldLevel = user.level
  const newXp = user.total_xp + amount

  // Derive correct level from new total XP (handles multi-level-up)
  const newLevel = getLevelFromTotalXP(newXp)
  const leveledUp = newLevel > oldLevel

  await supabase
    .from('users')
    .update({
      total_xp: newXp,
      level: newLevel,
    })
    .eq('id', userId)

  // Update leaderboard
  await supabase
    .from('leaderboard')
    .upsert(
      {
        user_id: userId,
        total_xp: newXp,
        level: newLevel,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )

  return {
    newXp,
    leveledUp,
    oldLevel,
    newLevel,
    levelsGained: newLevel - oldLevel,
  }
}
