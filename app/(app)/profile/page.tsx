import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProfileHeader } from '@/components/profile/profile-header'
import { SettingsForm } from '@/components/profile/settings-form'
import { StatsCard } from '@/components/profile/stats-card'
import { BalanceCard } from '@/components/profile/balance-card'

export default async function ProfilePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

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

      <SettingsForm
        userId={user.id}
        currentDisplayName={profile?.display_name ?? ''}
        currentAvatarUrl={profile?.avatar_url}
      />
    </div>
  )
}
