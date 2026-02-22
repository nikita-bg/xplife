import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * POST /api/notifications/streak-check
 * Called by n8n cron at 20:00 — finds users at risk of losing streaks
 */
export async function POST(request: Request) {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.N8N_WEBHOOK_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()

    // Find users with active streaks who haven't completed a task today
    const today = new Date().toISOString().split('T')[0]

    const { data: streaks } = await supabase
        .from('streaks')
        .select('user_id, current_streak, last_activity_date')
        .gt('current_streak', 0)

    if (!streaks?.length) {
        return NextResponse.json({ users: [], message: 'No active streaks' })
    }

    // Filter users whose last activity was NOT today
    const atRisk = streaks.filter(s => {
        if (!s.last_activity_date) return true
        return s.last_activity_date < today
    })

    if (!atRisk.length) {
        return NextResponse.json({ users: [], message: 'All streaks safe' })
    }

    // Fetch user emails
    const userIds = atRisk.map(s => s.user_id)
    const { data: users } = await supabase
        .from('users')
        .select('id, email, display_name')
        .in('id', userIds)

    const warnings = users?.map(u => {
        const streak = atRisk.find(s => s.user_id === u.id)
        return {
            email: u.email,
            displayName: u.display_name || 'Hero',
            currentStreak: streak?.current_streak || 0,
            lastActivity: streak?.last_activity_date || 'never',
        }
    }) || []

    return NextResponse.json({ users: warnings, count: warnings.length })
}
