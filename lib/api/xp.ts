import { createClient } from '@/lib/supabase/client'

export async function awardXp(userId: string, amount: number, source: string, taskId?: string) {
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

  const newXp = user.total_xp + amount

  // Check level up
  const { data: nextLevel } = await supabase
    .from('level_config')
    .select('*')
    .eq('level', user.level + 1)
    .single()

  const leveledUp = nextLevel && newXp >= nextLevel.xp_required

  await supabase
    .from('users')
    .update({
      total_xp: newXp,
      ...(leveledUp ? { level: user.level + 1 } : {}),
    })
    .eq('id', userId)

  return {
    newXp,
    leveledUp,
    newLevel: leveledUp ? user.level + 1 : user.level,
    levelTitle: leveledUp ? nextLevel!.title : null,
  }
}
