import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LevelDisplay } from '@/components/dashboard/level-display'
import { XpBar } from '@/components/dashboard/xp-bar'
import { StreakCounter } from '@/components/dashboard/streak-counter'
import { DailyTasks } from '@/components/dashboard/daily-tasks'
import { OnboardingBanner } from '@/components/dashboard/onboarding-banner'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

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

  const today = new Date().toISOString().split('T')[0]
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', user.id)
    .gte('created_at', `${today}T00:00:00`)
    .order('created_at', { ascending: true })

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

      <div className="grid gap-4 sm:grid-cols-3">
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
      </div>

      <DailyTasks tasks={tasks ?? []} userId={user.id} />
    </div>
  )
}
