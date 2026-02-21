import { redirect } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { ProfileHeader } from '@/components/profile/profile-header'
import { SettingsForm } from '@/components/profile/settings-form'
import { StatsCard } from '@/components/profile/stats-card'
import { BalanceCard } from '@/components/profile/balance-card'
import { UpgradeBanner } from '@/components/shared/upgrade-banner'
import { CharacterCustomization } from '@/components/profile/character-customization'
import { checkAndResetStreak } from '@/lib/streakUtils'
import { getXPProgress, getRankFromLevel } from '@/lib/xpUtils'
import type { ClassType } from '@/components/character/CharacterConfig'

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
    { data: userInterests },
    { data: equippedItems },
  ] = await Promise.all([
    supabase.from('users').select('*').eq('id', user.id).single(),
    checkAndResetStreak(supabase, user.id),
    supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'completed'),
    supabase.from('user_interests').select('interest').eq('user_id', user.id),
    supabase.from('user_inventory').select('*, items(*)').eq('user_id', user.id).eq('equipped', true),
  ])

  // Use formula-based level calculation
  const { level } = getXPProgress(profile?.total_xp ?? 0)

  // Map personality type to character class
  const PERSONALITY_TO_CLASS: Record<string, ClassType> = {
    dopamine: 'adventurer',
    acetylcholine: 'thinker',
    gaba: 'guardian',
    serotonin: 'connector',
  }
  const characterClass = PERSONALITY_TO_CLASS[profile?.personality_type ?? 'dopamine'] ?? 'adventurer'
  const rank = getRankFromLevel(level)

  // Get level title from config
  const { data: levelConfig } = await supabase
    .from('level_config')
    .select('title')
    .eq('level', level)
    .single()

  const interestList = userInterests?.map(i => i.interest) || []

  // Map equipped items for the customization panel
  const mappedEquipped = (equippedItems ?? [])
    .filter((e: Record<string, unknown>) => e.items)
    .map((e: Record<string, unknown>) => {
      const item = e.items as { id: string; name: string; type: string; rarity: string; thumbnail_url: string | null }
      return {
        id: item.id,
        name: item.name,
        type: item.type,
        rarity: item.rarity,
        thumbnail_url: item.thumbnail_url,
      }
    })

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8 flex flex-col gap-6">
      <ProfileHeader
        displayName={profile?.display_name || user.email?.split('@')[0] || 'Hero'}
        avatarUrl={profile?.avatar_url}
        level={profile?.level ?? 1}
        levelTitle={levelConfig?.title ?? 'Novice'}
        plan={profile?.plan ?? 'free'}
      />

      <CharacterCustomization
        characterClass={characterClass}
        rank={rank}
        level={level}
        equippedItems={mappedEquipped}
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
