import { redirect } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { ProfileHeader } from '@/components/profile/profile-header'
import { SettingsForm } from '@/components/profile/settings-form'
import { StatsCard } from '@/components/profile/stats-card'
import { BalanceCard } from '@/components/profile/balance-card'
import { UpgradeBanner } from '@/components/shared/upgrade-banner'

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

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

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

  const { data: levelConfig } = await supabase
    .from('level_config')
    .select('title')
    .eq('level', profile?.level ?? 1)
    .single()

  const { count: totalTasks } = await supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'completed')

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
      />
    </div>
  )
}
