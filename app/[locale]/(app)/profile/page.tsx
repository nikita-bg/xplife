import { redirect } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { ProfileHeader } from '@/components/profile/profile-header'
import { SettingsForm } from '@/components/profile/settings-form'
import { StatsCard } from '@/components/profile/stats-card'
import { BalanceCard } from '@/components/profile/balance-card'
import { UpgradeBanner } from '@/components/shared/upgrade-banner'
import { checkAndResetStreak } from '@/lib/streakUtils'
import { getXPProgress } from '@/lib/xpUtils'

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect(`/${locale}/login`)

  // Fetch independent data in parallel to avoid waterfall
  const [
    { data: profile },
    streak,
    { count: totalTasks },
    { data: userInterests }
  ] = await Promise.all([
    supabase.from('users').select('*').eq('id', user.id).single(),
    checkAndResetStreak(supabase, user.id),
    supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'completed'),
    supabase.from('user_interests').select('interest').eq('user_id', user.id)
  ])

  // Use formula-based level calculation
  const { level } = getXPProgress(profile?.total_xp ?? 0)

  // Get level title from config
  const { data: levelConfig } = await supabase
    .from('level_config')
    .select('title')
    .eq('level', level)
    .single()

  const interestList = userInterests?.map(i => i.interest) || []

  return (
    <div className="mx-auto max-w-2xl flex flex-col gap-6">
      <ProfileHeader
        displayName={profile?.display_name || user.email?.split('@')[0] || 'Hero'}
        avatarUrl={profile?.avatar_url}
        level={profile?.level ?? 1}
        levelTitle={levelConfig?.title ?? 'Novice'}
        plan={profile?.plan ?? 'free'}
      />

      <StatsCard
        totalXp={profile?.total_xp ?? 0}
        totalTasks={totalTasks ?? 0}
        currentStreak={streak?.current_streak ?? 0}
        personalityType={profile?.personality_type}
      />

      <BalanceCard
        balance={profile?.gold_balance ?? 0}
        currency={profile?.preferred_currency ?? 'EUR'}
      />

      <UpgradeBanner plan={profile?.plan ?? 'free'} />

      <SettingsForm
        userId={user.id}
        currentDisplayName={profile?.display_name ?? ''}
        currentAvatarUrl={profile?.avatar_url}
        currentAboutMe={profile?.about_me ?? ''}
        // Personalization Data
        initialTimePreference={profile?.time_preference}
        initialTaskDuration={profile?.preferred_task_duration}
        initialOccupation={profile?.occupation_type}
        initialWorkSchedule={profile?.work_schedule}
        initialLifePhase={profile?.life_phase}
        initialMainChallenge={profile?.main_challenge}
        // We need to fetch interests separately
        initialInterests={interestList}
      />
    </div>
  )
}
