import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getPlanLimits } from '@/lib/plan-limits'

export async function GET(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const displayName = searchParams.get('displayName')
  const userId = searchParams.get('userId')

  if (!displayName && !userId) {
    return NextResponse.json(
      { error: 'Missing required parameter: displayName or userId' },
      { status: 400 }
    )
  }

  try {
    // Find user profile
    let query = supabase.from('users').select('*')

    if (userId) {
      query = query.eq('id', userId)
    } else if (displayName) {
      query = query.eq('display_name', displayName)
    }

    const { data: profile, error: profileError } = await query.single()

    if (profileError || !profile) {
      return NextResponse.json({
        found: false,
        searchCriteria: { displayName, userId },
        error: profileError?.message || 'Profile not found',
      })
    }

    // Note: We cannot check auth user existence without admin privileges
    // The debug endpoint will only show profile data from public.users table

    // Get plan limits
    const planLimits = getPlanLimits(profile.plan)

    // Calculate start of week (Monday)
    const now = new Date()
    const dayOfWeek = now.getDay()
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - mondayOffset)
    startOfWeek.setHours(0, 0, 0, 0)

    // Get task counts
    const { count: weeklyTaskCount } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', profile.id)
      .gte('created_at', startOfWeek.toISOString())

    const { count: yearlyDailyCount } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', profile.id)
      .eq('quest_timeframe', 'daily')

    const { count: yearlyWeeklyCount } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', profile.id)
      .eq('quest_timeframe', 'weekly')

    const { count: yearlyMonthlyCount } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', profile.id)
      .eq('quest_timeframe', 'monthly')

    const { count: yearlyYearlyCount } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', profile.id)
      .eq('quest_timeframe', 'yearly')
      .neq('status', 'skipped')

    // Get goals count
    const { count: goalsCount } = await supabase
      .from('goals')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', profile.id)

    return NextResponse.json({
      found: true,
      searchCriteria: { displayName, userId },
      profile: {
        id: profile.id,
        displayName: profile.display_name,
        plan: profile.plan,
        level: profile.level,
        xp: profile.xp,
        personalityType: profile.personality_type,
        neurotransmitters: {
          dopamine: profile.dopamine_score,
          acetylcholine: profile.acetylcholine_score,
          gaba: profile.gaba_score,
          serotonin: profile.serotonin_score,
        },
        createdAt: profile.created_at,
        updatedAt: profile.updated_at,
      },
      planLimits: {
        maxGoals: planLimits.maxGoals,
        maxTasksPerWeek: planLimits.maxTasksPerWeek,
        maxYearlyQuests: planLimits.maxYearlyQuests,
        chatPerDay: planLimits.chatPerDay,
      },
      taskCounts: {
        thisWeek: {
          count: weeklyTaskCount ?? 0,
          limit: planLimits.maxTasksPerWeek,
          limitReached: planLimits.maxTasksPerWeek !== -1 && (weeklyTaskCount ?? 0) >= planLimits.maxTasksPerWeek,
        },
        yearly: {
          daily: yearlyDailyCount ?? 0,
          weekly: yearlyWeeklyCount ?? 0,
          monthly: yearlyMonthlyCount ?? 0,
          yearly: {
            count: yearlyYearlyCount ?? 0,
            limit: planLimits.maxYearlyQuests,
            limitReached: (yearlyYearlyCount ?? 0) >= planLimits.maxYearlyQuests,
          },
        },
      },
      goalsCount: goalsCount ?? 0,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[DEBUG] User profile lookup error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
