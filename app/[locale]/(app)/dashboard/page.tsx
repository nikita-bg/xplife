import { createClient } from '@/lib/supabase/server'
import { setRequestLocale } from 'next-intl/server'
import { redirect } from 'next/navigation'
import { LevelDisplay } from '@/components/dashboard/level-display'
import { XpBar } from '@/components/dashboard/xp-bar'
import { StreakCounter } from '@/components/dashboard/streak-counter'
import { GoldBalance } from '@/components/dashboard/gold-balance'
import { QuestsView } from '@/components/dashboard/quests-view'
import { OnboardingBanner } from '@/components/dashboard/onboarding-banner'
import { BravermanBanner } from '@/components/dashboard/braverman-banner'
import { UpgradeBanner } from '@/components/shared/upgrade-banner'

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
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

  const onboardingCompleted = profile?.onboarding_completed ?? false

  const { data: streak } = await supabase
    .from('streaks')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // Check and reset streak if inactive for more than 1 day
  if (streak && streak.last_activity_date) {
    const today = new Date().toISOString().split('T')[0]
    const lastActivity = streak.last_activity_date

    if (lastActivity !== today) {
      const lastDate = new Date(lastActivity + 'T00:00:00')
      const todayDate = new Date(today + 'T00:00:00')
      const diffDays = Math.round((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))

      // Reset streak if more than 1 day has passed
      if (diffDays > 1) {
        await supabase
          .from('streaks')
          .update({
            current_streak: 0,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id)

        // Update local streak object for display
        streak.current_streak = 0
      }
    }
  }

  // Fetch quests by timeframe
  // Yearly: all non-skipped yearly quests
  const { data: yearlyQuests } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', user.id)
    .eq('quest_timeframe', 'yearly')
    .neq('status', 'skipped')
    .order('created_at', { ascending: true })

  // Monthly: current month's quests
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const { data: monthlyQuests } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', user.id)
    .eq('quest_timeframe', 'monthly')
    .gte('created_at', startOfMonth)
    .order('created_at', { ascending: true })

  // Weekly: current week's quests (Monday start)
  const dayOfWeek = now.getDay()
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - mondayOffset)
  startOfWeek.setHours(0, 0, 0, 0)
  const { data: weeklyQuests } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', user.id)
    .eq('quest_timeframe', 'weekly')
    .gte('created_at', startOfWeek.toISOString())
    .order('created_at', { ascending: true })

  // Daily: today's quests
  const today = new Date().toISOString().split('T')[0]
  const { data: dailyQuests } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', user.id)
    .eq('quest_timeframe', 'daily')
    .gte('created_at', `${today}T00:00:00`)
    .order('created_at', { ascending: true })

  // Check if Braverman test completed
  const { data: bravermanResult } = await supabase
    .from('braverman_results')
    .select('id')
    .eq('user_id', user.id)
    .single()

  const showBravermanBanner = (profile?.level ?? 1) >= 2 && !bravermanResult

  // Get current level config
  const { data: currentLevel } = await supabase
    .from('level_config')
    .select('*')
    .eq('level', profile.level)
    .single()

  const { data: nextLevel } = await supabase
    .from('level_config')
    .select('*')
    .eq('level', profile.level + 1)
    .single()

  const xpForCurrentLevel = currentLevel?.xp_required ?? 0
  const xpForNextLevel = nextLevel?.xp_required ?? xpForCurrentLevel + 500
  const xpProgress = profile.total_xp - xpForCurrentLevel
  const xpNeeded = xpForNextLevel - xpForCurrentLevel

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
          Welcome back, <span className="gradient-text">{profile.display_name || 'Hero'}</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          {"Here's your quest status for today"}
        </p>
      </div>

      {!onboardingCompleted && <OnboardingBanner userId={user.id} />}
      {showBravermanBanner && <BravermanBanner />}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <LevelDisplay
          level={profile.level}
          title={currentLevel?.title ?? 'Novice'}
        />
        <XpBar
          currentXp={xpProgress}
          requiredXp={xpNeeded}
          totalXp={profile.total_xp}
        />
        <StreakCounter
          currentStreak={streak?.current_streak ?? 0}
          longestStreak={streak?.longest_streak ?? 0}
        />
        <GoldBalance
          balance={profile.gold_balance ?? 0}
          currency={profile.preferred_currency ?? 'EUR'}
        />
      </div>

      <UpgradeBanner variant="compact" plan={profile?.plan ?? 'free'} />

      <QuestsView
        yearlyQuests={yearlyQuests ?? []}
        monthlyQuests={monthlyQuests ?? []}
        weeklyQuests={weeklyQuests ?? []}
        dailyQuests={dailyQuests ?? []}
        plan={profile?.plan ?? 'free'}
      />
    </div>
  )
}
