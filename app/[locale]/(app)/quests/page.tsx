import { redirect } from 'next/navigation'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { QuestsView } from '@/components/dashboard/quests-view'
import type { Task } from '@/lib/types'

export default async function QuestsPage({
    params,
}: {
    params: Promise<{ locale: string }>
}) {
    const { locale } = await params
    setRequestLocale(locale)
    const t = await getTranslations('dashboard')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect(`/${locale}/login`)

    const { data: profile } = await supabase
        .from('users')
        .select('plan')
        .eq('id', user.id)
        .single()

    // Fetch all quest timeframes in parallel
    const [
        { data: yearlyQuests },
        { data: monthlyQuests },
        { data: weeklyQuests },
        { data: dailyQuests },
    ] = await Promise.all([
        supabase
            .from('tasks')
            .select('*')
            .eq('user_id', user.id)
            .eq('quest_timeframe', 'yearly')
            .order('created_at', { ascending: false }),
        supabase
            .from('tasks')
            .select('*')
            .eq('user_id', user.id)
            .eq('quest_timeframe', 'monthly')
            .neq('status', 'skipped')
            .order('created_at', { ascending: false }),
        supabase
            .from('tasks')
            .select('*')
            .eq('user_id', user.id)
            .eq('quest_timeframe', 'weekly')
            .neq('status', 'skipped')
            .order('created_at', { ascending: false }),
        supabase
            .from('tasks')
            .select('*')
            .eq('user_id', user.id)
            .eq('quest_timeframe', 'daily')
            .neq('status', 'skipped')
            .order('created_at', { ascending: false }),
    ])

    // Find active quest (in_progress)
    const activeQuest = [
        ...(dailyQuests ?? []),
        ...(weeklyQuests ?? []),
        ...(monthlyQuests ?? []),
        ...(yearlyQuests ?? []),
    ].find((q) => q.status === 'in_progress')

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
                    <span className="gradient-text">{t('questTabs.questsTitle', { fallback: 'QUESTS' })}</span>
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    {t('questTabs.questsSubtitle', { fallback: 'Complete quests to earn XP, cases, and coins' })}
                </p>
            </div>

            {/* Active Quest Banner */}
            {activeQuest && (
                <div className="glass-card gradient-border rounded-2xl p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs text-muted-foreground">Active Quest:</span>
                                <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-green-400">
                                    IN PROGRESS
                                </span>
                            </div>
                            <h2 className="font-display text-lg font-bold text-foreground">
                                {activeQuest.title}
                            </h2>
                        </div>
                        <div className="text-right">
                            <span className="font-display text-sm text-primary">
                                +{activeQuest.xp_reward} XP
                            </span>
                        </div>
                    </div>
                </div>
            )}

            <QuestsView
                yearlyQuests={(yearlyQuests as Task[]) ?? []}
                monthlyQuests={(monthlyQuests as Task[]) ?? []}
                weeklyQuests={(weeklyQuests as Task[]) ?? []}
                dailyQuests={(dailyQuests as Task[]) ?? []}
                plan={profile?.plan ?? 'free'}
            />
        </div>
    )
}
