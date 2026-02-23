import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * GET /api/guilds/discover — List public guilds for discovery (not already a member)
 */
export async function GET() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = createAdminClient()

    // Get user's current guild memberships
    const { data: myMemberships } = await admin
        .from('guild_members')
        .select('guild_id')
        .eq('user_id', user.id)

    const myGuildIds = (myMemberships || []).map(m => m.guild_id)

    // Fetch all guilds, excluding ones user is already in
    let query = admin
        .from('guilds')
        .select('id, name, description, emblem, member_count, total_xp, created_at, join_mode, min_level')
        .order('member_count', { ascending: false })
        .limit(20)

    if (myGuildIds.length > 0) {
        query = query.not('id', 'in', `(${myGuildIds.join(',')})`)
    }

    const { data: guilds, error } = await query

    if (error) {
        console.error('[GUILD-DISCOVER] Error:', error)
        return NextResponse.json({ error: 'Failed to fetch guilds' }, { status: 500 })
    }

    return NextResponse.json({ guilds: guilds || [] })
}
