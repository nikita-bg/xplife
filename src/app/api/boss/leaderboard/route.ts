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

    // Top 20 contributors (no join — join breaks due to auth.users FK)
    const { data: contributions } = await admin
        .from('boss_contributions')
        .select('user_id, damage_dealt, tasks_completed')
        .eq('boss_id', boss.id)
        .order('damage_dealt', { ascending: false })
        .limit(20)

    // Fetch user profiles separately
    const userIds = Array.from(new Set((contributions || []).map(c => c.user_id)))
    const profileMap: Record<string, { display_name: string | null; avatar_url: string | null }> = {}

    if (userIds.length > 0) {
        const { data: profiles } = await admin
            .from('users')
            .select('id, display_name, avatar_url')
            .in('id', userIds)

        if (profiles) {
            for (const p of profiles) {
                profileMap[p.id] = {
                    display_name: p.display_name,
                    avatar_url: p.avatar_url,
                }
            }
        }
    }

    const leaderboard = (contributions || []).map((c, i) => ({
        rank: i + 1,
        user_id: c.user_id,
        damage_dealt: c.damage_dealt,
        tasks_completed: c.tasks_completed,
        display_name: profileMap[c.user_id]?.display_name || null,
        avatar_url: profileMap[c.user_id]?.avatar_url || null,
    }))

    return NextResponse.json({ leaderboard, boss })
}
