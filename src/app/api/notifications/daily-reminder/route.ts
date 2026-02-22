import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * POST /api/notifications/daily-reminder
 * Called by n8n cron at 09:00 — returns users with pending quests for today
 */
export async function POST(request: Request) {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.N8N_WEBHOOK_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()

    // Find users with pending daily tasks
    const today = new Date().toISOString().split('T')[0]

    const { data: pendingTasks } = await supabase
        .from('tasks')
        .select('user_id, title, xp_reward')
        .eq('status', 'pending')
        .eq('quest_timeframe', 'daily')
        .gte('created_at', `${today}T00:00:00`)
        .lte('created_at', `${today}T23:59:59`)

    if (!pendingTasks?.length) {
        return NextResponse.json({ users: [], message: 'No pending tasks today' })
    }

    // Group by user
    const userMap = new Map<string, { tasks: string[]; totalXp: number }>()
    for (const task of pendingTasks) {
        const existing = userMap.get(task.user_id) || { tasks: [], totalXp: 0 }
        existing.tasks.push(task.title)
        existing.totalXp += task.xp_reward || 0
        userMap.set(task.user_id, existing)
    }

    // Fetch user emails
    const userIds = Array.from(userMap.keys())
    const { data: users } = await supabase
        .from('users')
        .select('id, email, display_name')
        .in('id', userIds)

    const reminders = users?.map(u => ({
        email: u.email,
        displayName: u.display_name || 'Hero',
        pendingCount: userMap.get(u.id)?.tasks.length || 0,
        totalXp: userMap.get(u.id)?.totalXp || 0,
        questTitles: userMap.get(u.id)?.tasks.slice(0, 3) || [],
    })) || []

    return NextResponse.json({ users: reminders, count: reminders.length })
}
