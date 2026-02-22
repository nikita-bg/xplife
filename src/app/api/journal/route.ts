import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/journal?month=YYYY-MM — Monthly progress journal
 */
export async function GET(request: Request) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month') || new Date().toISOString().slice(0, 7) // YYYY-MM

    const startDate = `${month}-01T00:00:00`
    const endDate = new Date(parseInt(month.slice(0, 4)), parseInt(month.slice(5, 7)), 0)
    const endDateStr = `${month}-${String(endDate.getDate()).padStart(2, '0')}T23:59:59`

    // Completed tasks this month
    const { data: tasks } = await supabase
        .from('tasks')
        .select('title, category, difficulty, xp_reward, completed_at')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .gte('completed_at', startDate)
        .lte('completed_at', endDateStr)
        .order('completed_at', { ascending: true })

    const completedTasks = tasks || []

    // Category breakdown
    const categories: Record<string, number> = {}
    const difficulties: Record<string, number> = {}
    let totalXp = 0

    for (const t of completedTasks) {
        categories[t.category] = (categories[t.category] || 0) + 1
        difficulties[t.difficulty] = (difficulties[t.difficulty] || 0) + 1
        totalXp += t.xp_reward || 0
    }

    // Daily activity (heatmap data)
    const dailyActivity: Record<string, number> = {}
    for (const t of completedTasks) {
        const day = t.completed_at?.split('T')[0] || ''
        if (day) dailyActivity[day] = (dailyActivity[day] || 0) + 1
    }

    // Streak info
    const { data: streak } = await supabase
        .from('streaks')
        .select('current_streak, longest_streak')
        .eq('user_id', user.id)
        .single()

    // Boss contributions this month
    const { data: bossContribs } = await supabase
        .from('boss_contributions')
        .select('damage_dealt, tasks_completed')
        .eq('user_id', user.id)
        .gte('created_at', startDate)
        .lte('created_at', endDateStr)

    const bossDamage = bossContribs?.reduce((sum, c) => sum + c.damage_dealt, 0) || 0

    // Top category
    const topCategory = Object.entries(categories).sort(([, a], [, b]) => b - a)[0]

    return NextResponse.json({
        month,
        summary: {
            questsCompleted: completedTasks.length,
            totalXp,
            activeDays: Object.keys(dailyActivity).length,
            topCategory: topCategory ? { name: topCategory[0], count: topCategory[1] } : null,
            bossDamage,
            currentStreak: streak?.current_streak || 0,
            longestStreak: streak?.longest_streak || 0,
        },
        categories,
        difficulties,
        dailyActivity,
    })
}
