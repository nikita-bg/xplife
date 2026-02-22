import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * POST /api/notifications/weekly-report
 * Called by n8n cron Sunday 18:00 — aggregates weekly stats per user
 */
export async function POST(request: Request) {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.N8N_WEBHOOK_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()

    // Last 7 days
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const weekAgoStr = weekAgo.toISOString()

    // Fetch all completed tasks this week
    const { data: completedTasks } = await supabase
        .from('tasks')
        .select('user_id, xp_reward, difficulty, category')
        .eq('status', 'completed')
        .gte('completed_at', weekAgoStr)

    if (!completedTasks?.length) {
        return NextResponse.json({ users: [], message: 'No completions this week' })
    }

    // Aggregate per user
    const userMap = new Map<string, {
        questsCompleted: number
        totalXp: number
        categories: Record<string, number>
        difficulties: Record<string, number>
    }>()

    for (const task of completedTasks) {
        const existing = userMap.get(task.user_id) || {
            questsCompleted: 0,
            totalXp: 0,
            categories: {},
            difficulties: {},
        }
        existing.questsCompleted++
        existing.totalXp += task.xp_reward || 0
        existing.categories[task.category] = (existing.categories[task.category] || 0) + 1
        existing.difficulties[task.difficulty] = (existing.difficulties[task.difficulty] || 0) + 1
        userMap.set(task.user_id, existing)
    }

    // Fetch boss contributions this week
    const { data: bossContribs } = await supabase
        .from('boss_contributions')
        .select('user_id, damage_dealt')
        .gte('created_at', weekAgoStr)

    const bossMap = new Map<string, number>()
    for (const c of bossContribs || []) {
        bossMap.set(c.user_id, (bossMap.get(c.user_id) || 0) + c.damage_dealt)
    }

    // Fetch user info
    const userIds = Array.from(userMap.keys())
    const { data: users } = await supabase
        .from('users')
        .select('id, email, display_name, total_xp, level')
        .in('id', userIds)

    const reports = users?.map(u => {
        const stats = userMap.get(u.id)
        const topCategory = stats ? Object.entries(stats.categories).sort(([, a], [, b]) => b - a)[0]?.[0] : null
        return {
            email: u.email,
            displayName: u.display_name || 'Hero',
            level: u.level || 1,
            totalXp: u.total_xp || 0,
            weeklyStats: {
                questsCompleted: stats?.questsCompleted || 0,
                xpEarned: stats?.totalXp || 0,
                topCategory,
                bossDamage: bossMap.get(u.id) || 0,
            },
        }
    }) || []

    return NextResponse.json({ users: reports, count: reports.length })
}
