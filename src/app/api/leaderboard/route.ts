import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/leaderboard — Global leaderboard from real users
 */
export async function GET() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Top 50 users by total_xp
    const { data: users } = await supabase
        .from('users')
        .select('id, display_name, avatar_url, total_xp, level, class')
        .order('total_xp', { ascending: false })
        .limit(50)

    // Get streaks for these users
    const userIds = users?.map(u => u.id) || []
    const { data: streaks } = await supabase
        .from('streaks')
        .select('user_id, current_streak')
        .in('user_id', userIds)

    const streakMap = new Map<string, number>()
    for (const s of streaks || []) {
        streakMap.set(s.user_id, s.current_streak)
    }

    const leaderboard = users?.map((u, i) => ({
        rank: i + 1,
        id: u.id,
        name: u.display_name || 'Hero',
        avatar_url: u.avatar_url,
        cls: u.class || 'Adventurer',
        level: u.level || 1,
        xp: u.total_xp || 0,
        streak: streakMap.get(u.id) || 0,
        isUser: u.id === user.id,
    })) || []

    return NextResponse.json({ leaderboard })
}
