import { createClient } from '@/lib/supabase/server'
import { setRequestLocale } from 'next-intl/server'
import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { DEFAULT_PARTS } from '@/components/character/CharacterConfig'
import type { ClassType, RankTier } from '@/components/character/CharacterConfig'

// Derive rank tier from level (no rank column in DB)
function getRankTier(level: number) {
  if (level >= 90) return 'challenger'
  if (level >= 70) return 'grandmaster'
  if (level >= 50) return 'master'
  if (level >= 35) return 'diamond'
  if (level >= 25) return 'platinum'
  if (level >= 15) return 'gold'
  if (level >= 8) return 'silver'
  if (level >= 3) return 'bronze'
  return 'iron'
}

// Derive character class from Braverman dominant type / personality_type
function getCharacterClass(personalityType: string | null) {
  const t = (personalityType ?? '').toLowerCase()
  if (t.includes('dopamine') || t.includes('adventurer')) return 'adventurer'
  if (t.includes('acetylcholine') || t.includes('thinker')) return 'thinker'
  if (t.includes('gaba') || t.includes('guardian')) return 'guardian'
  if (t.includes('serotonin') || t.includes('connector')) return 'connector'
  return 'adventurer'
}

const RANK_COLORS = {
  iron: { primary: '#9E9E9E', accent: '#BDBDBD', rankColor: '#9E9E9E', glowColor: '#9E9E9E40' },
  bronze: { primary: '#CD7F32', accent: '#E8A96E', rankColor: '#CD7F32', glowColor: '#CD7F3240' },
  silver: { primary: '#C0C0C0', accent: '#E0E0E0', rankColor: '#C0C0C0', glowColor: '#C0C0C040' },
  gold: { primary: '#FFB800', accent: '#FFD700', rankColor: '#FFB800', glowColor: '#FFB80040' },
  platinum: { primary: '#00F5FF', accent: '#80FAFF', rankColor: '#00F5FF', glowColor: '#00F5FF40' },
  diamond: { primary: '#6495ED', accent: '#9BB8FF', rankColor: '#6495ED', glowColor: '#6495ED40' },
  master: { primary: '#9D4EDD', accent: '#C17FFF', rankColor: '#9D4EDD', glowColor: '#9D4EDD40' },
  grandmaster: { primary: '#FF4500', accent: '#FF7043', rankColor: '#FF4500', glowColor: '#FF450040' },
  challenger: { primary: '#FFD700', accent: '#FFEF80', rankColor: '#FFD700', glowColor: '#FFD70040' },
}

export default async function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect(`/${locale}/login`)

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  // ── Streak logic ────────────────────────────────────────────
  const { data: streak } = await supabase
    .from('streaks')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (streak?.last_activity_date) {
    const today = new Date().toISOString().split('T')[0]
    if (streak.last_activity_date !== today) {
      const lastDate = new Date(streak.last_activity_date + 'T00:00:00')
      const todayDate = new Date(today + 'T00:00:00')
      const diffDays = Math.round((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
      if (diffDays > 1) {
        await supabase
          .from('streaks')
          .update({ current_streak: 0, updated_at: new Date().toISOString() })
          .eq('user_id', user.id)
        streak.current_streak = 0
      }
    }
  }

  // ── Stale task cleanup ───────────────────────────────────────
  const now = new Date()
  const todayStart = `${now.toISOString().split('T')[0]}T00:00:00`

  await supabase.from('tasks').update({ status: 'skipped' })
    .eq('user_id', user.id).eq('quest_timeframe', 'daily')
    .eq('status', 'pending').lt('created_at', todayStart)

  const dayOfWeek = now.getDay()
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  const thisMonday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - mondayOffset)
  thisMonday.setHours(0, 0, 0, 0)
  await supabase.from('tasks').update({ status: 'skipped' })
    .eq('user_id', user.id).eq('quest_timeframe', 'weekly')
    .eq('status', 'pending').lt('created_at', thisMonday.toISOString())

  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  await supabase.from('tasks').update({ status: 'skipped' })
    .eq('user_id', user.id).eq('quest_timeframe', 'monthly')
    .eq('status', 'pending').lt('created_at', thisMonthStart)

  // ── Daily quest count ────────────────────────────────────────
  const { data: dailyQuests } = await supabase
    .from('tasks')
    .select('status')
    .eq('user_id', user.id)
    .eq('quest_timeframe', 'daily')
    .gte('created_at', todayStart)

  const dailyCompleted = dailyQuests?.filter((q) => q.status === 'completed').length ?? 0
  const dailyTotal = Math.max(dailyQuests?.length ?? 5, 5)

  // ── Level / XP ───────────────────────────────────────────────
  const currentLvl = profile?.level ?? 1
  const { data: currentLevelData } = await supabase
    .from('level_config').select('*').eq('level', currentLvl).single()
  const { data: nextLevelData } = await supabase
    .from('level_config').select('*').eq('level', currentLvl + 1).single()

  const xpForCurrentLevel = currentLevelData?.xp_required ?? 0
  const xpForNextLevel = nextLevelData?.xp_required ?? xpForCurrentLevel + 500

  // ── Derive game data from profile ────────────────────────────
  const rank = getRankTier(currentLvl) as RankTier
  const characterClass = getCharacterClass(profile?.personality_type) as ClassType

  const character = {
    class: characterClass,
    rank,
    level: currentLvl,
    currentXP: (profile?.total_xp ?? 0) - xpForCurrentLevel,
    maxXP: xpForNextLevel - xpForCurrentLevel,
    parts: { ...DEFAULT_PARTS },
    colors: RANK_COLORS[rank] ?? RANK_COLORS.gold,
  }

  const dashUser = {
    avatar: profile?.avatar_url ?? null,
    username: profile?.display_name || user.email?.split('@')[0] || 'Hero',
    totalXP: profile?.total_xp ?? 0,
    rank,
    level: currentLvl,
    streak: streak?.current_streak ?? 0,
    dailyCompleted,
    dailyTotal,
  }

  return (
    <DashboardLayout
      character={character}
      user={dashUser}
      locale={locale}
    />
  )
}
