import { createClient } from '@/lib/supabase/server'
import { setRequestLocale } from 'next-intl/server'
import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { DEFAULT_PARTS } from '@/components/character/CharacterConfig'
import type { ClassType, RankTier } from '@/components/character/CharacterConfig'
import { getXPProgress, getRankFromLevel, getRankColors } from '@/lib/xpUtils'
import { checkAndResetStreak } from '@/lib/streakUtils'

/** Derive character class from Braverman personality_type */
function getCharacterClass(personalityType: string | null): ClassType {
  const t = (personalityType ?? '').toLowerCase()
  if (t.includes('dopamine') || t.includes('adventurer')) return 'adventurer'
  if (t.includes('acetylcholine') || t.includes('thinker')) return 'thinker'
  if (t.includes('gaba') || t.includes('guardian')) return 'guardian'
  if (t.includes('serotonin') || t.includes('connector')) return 'connector'
  return 'adventurer'
}

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect(`/${locale}/login`)

  // ── Parallel data fetching ───────────────────────────────
  const [{ data: profile }, streak, { data: equippedItems }] = await Promise.all([
    supabase.from('users').select('*').eq('id', user.id).single(),
    checkAndResetStreak(supabase, user.id),
    supabase
      .from('user_inventory')
      .select('equipped_slot, items(type, svg_content, thumbnail_url)')
      .eq('user_id', user.id)
      .eq('equipped', true),
  ])

  // ── Stale task cleanup ───────────────────────────────────────
  const now = new Date()
  const todayStart = `${now.toISOString().split('T')[0]}T00:00:00`

  await supabase
    .from('tasks')
    .update({ status: 'skipped' })
    .eq('user_id', user.id)
    .eq('quest_timeframe', 'daily')
    .eq('status', 'pending')
    .lt('created_at', todayStart)

  const dayOfWeek = now.getDay()
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  const thisMonday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - mondayOffset
  )
  thisMonday.setHours(0, 0, 0, 0)
  await supabase
    .from('tasks')
    .update({ status: 'skipped' })
    .eq('user_id', user.id)
    .eq('quest_timeframe', 'weekly')
    .eq('status', 'pending')
    .lt('created_at', thisMonday.toISOString())

  const thisMonthStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    1
  ).toISOString()
  await supabase
    .from('tasks')
    .update({ status: 'skipped' })
    .eq('user_id', user.id)
    .eq('quest_timeframe', 'monthly')
    .eq('status', 'pending')
    .lt('created_at', thisMonthStart)

  // ── Quest counts per timeframe ───────────────────────────────
  const [{ data: dailyQuests }, { data: weeklyQuests }, { data: monthlyQuests }] = await Promise.all([
    supabase
      .from('tasks')
      .select('status')
      .eq('user_id', user.id)
      .eq('quest_timeframe', 'daily')
      .gte('created_at', todayStart),
    supabase
      .from('tasks')
      .select('status')
      .eq('user_id', user.id)
      .eq('quest_timeframe', 'weekly')
      .gte('created_at', thisMonday.toISOString()),
    supabase
      .from('tasks')
      .select('status')
      .eq('user_id', user.id)
      .eq('quest_timeframe', 'monthly')
      .gte('created_at', thisMonthStart),
  ])

  const dailyCompleted =
    dailyQuests?.filter((q) => q.status === 'completed').length ?? 0
  const dailyTotal = Math.max(dailyQuests?.length ?? 5, 5)
  const weeklyCompleted =
    weeklyQuests?.filter((q) => q.status === 'completed').length ?? 0
  const weeklyTotal = Math.max(weeklyQuests?.length ?? 3, 3)
  const monthlyCompleted =
    monthlyQuests?.filter((q) => q.status === 'completed').length ?? 0
  const monthlyTotal = Math.max(monthlyQuests?.length ?? 1, 1)

  // ── XP / Level / Rank (formula-based, not level_config) ─────
  const totalXP = profile?.total_xp ?? 0
  const { level, currentXP, maxXP } = getXPProgress(totalXP)
  const rank: RankTier = getRankFromLevel(level)
  const characterClass: ClassType = getCharacterClass(profile?.personality_type)
  const colors = getRankColors(rank)

  // If derived level differs from stored level, sync it
  if (profile && profile.level !== level) {
    await supabase
      .from('users')
      .update({ level })
      .eq('id', user.id)
  }

  // Find equipped weapon SVG path
  interface EquippedRow { equipped_slot: string | null; items: { type: string; svg_content: string | null; thumbnail_url: string | null } | null }
  const equippedWeapon = (equippedItems as unknown as EquippedRow[] | null)?.find(
    (e) => e.items?.type === 'weapon'
  )
  const weaponSvgUrl = equippedWeapon?.items?.thumbnail_url ?? null

  const character = {
    class: characterClass,
    rank,
    level,
    currentXP,
    maxXP,
    parts: { ...DEFAULT_PARTS },
    colors,
    equippedWeaponSvg: weaponSvgUrl,
  }

  const dashUser = {
    avatar: profile?.avatar_url ?? null,
    username:
      profile?.display_name || user.email?.split('@')[0] || 'Hero',
    totalXP,
    rank,
    level,
    streak: streak?.current_streak ?? 0,
    dailyCompleted,
    dailyTotal,
    weeklyCompleted,
    weeklyTotal,
    monthlyCompleted,
    monthlyTotal,
  }

  return (
    <DashboardLayout
      character={character}
      user={dashUser}
      locale={locale}
    />
  )
}
