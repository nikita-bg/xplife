import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * GET /api/boss/leaderboard — Top contributors for active/recent boss
 */
export async function GET() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = createAdminClient()

    // Find active or most recently defeated boss
    const { data: boss } = await admin
        .from('boss_events')
        .select('id, name, status')
        .in('status', ['active', 'defeated'])
        .order('started_at', { ascending: false })
        .limit(1)
        .single()

    if (!boss) {
        return NextResponse.json({ leaderboard: [], boss: null })
    }

    // Top 20 contributors with user info (admin bypasses RLS)
    const { data: contributions } = await admin
        .from('boss_contributions')
        .select('user_id, damage_dealt, tasks_completed, users(display_name, avatar_url)')
        .eq('boss_id', boss.id)
        .order('damage_dealt', { ascending: false })
        .limit(20)

    const leaderboard = contributions?.map((c, i) => {
        const userData = (c.users ?? {}) as unknown as Record<string, unknown>
        return {
            rank: i + 1,
            user_id: c.user_id,
            damage_dealt: c.damage_dealt,
            tasks_completed: c.tasks_completed,
            ...userData,
        }
    }) || []

    return NextResponse.json({ leaderboard, boss })
}
