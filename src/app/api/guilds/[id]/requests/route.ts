import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * GET /api/guilds/[id]/requests — List pending join requests (owner/admin only)
 */
export async function GET(
    _request: Request,
    { params }: { params: { id: string } }
) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const admin = createAdminClient()

    // Verify admin/owner
    const { data: membership } = await admin
        .from('guild_members')
        .select('role')
        .eq('guild_id', params.id)
        .eq('user_id', user.id)
        .single()

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Fetch pending requests
    const { data: requests } = await admin
        .from('guild_join_requests')
        .select('id, guild_id, user_id, status, created_at')
        .eq('guild_id', params.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: true })

    // Fetch user profiles
    const userIds = (requests || []).map(r => r.user_id)
    const profileMap: Record<string, { display_name: string | null; avatar_url: string | null; level: number }> = {}

    if (userIds.length > 0) {
        const { data: profiles } = await admin
            .from('users')
            .select('id, display_name, avatar_url, level')
            .in('id', userIds)

        if (profiles) {
            for (const p of profiles) {
                profileMap[p.id] = {
                    display_name: p.display_name,
                    avatar_url: p.avatar_url,
                    level: p.level ?? 1,
                }
            }
        }
    }

    const enriched = (requests || []).map(r => ({
        ...r,
        display_name: profileMap[r.user_id]?.display_name || null,
        avatar_url: profileMap[r.user_id]?.avatar_url || null,
        level: profileMap[r.user_id]?.level ?? 1,
    }))

    return NextResponse.json({ requests: enriched })
}

/**
 * PATCH /api/guilds/[id]/requests — Approve or reject a join request
 */
export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const admin = createAdminClient()

    // Verify admin/owner
    const { data: membership } = await admin
        .from('guild_members')
        .select('role')
        .eq('guild_id', params.id)
        .eq('user_id', user.id)
        .single()

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    try {
        const body = await request.json()
        const { requestId, action } = body

        if (!requestId || !['approve', 'reject'].includes(action)) {
            return NextResponse.json({ error: 'requestId and action (approve/reject) required' }, { status: 400 })
        }

        // Fetch the request
        const { data: joinReq } = await admin
            .from('guild_join_requests')
            .select('*')
            .eq('id', requestId)
            .eq('guild_id', params.id)
            .eq('status', 'pending')
            .single()

        if (!joinReq) {
            return NextResponse.json({ error: 'Request not found or already processed' }, { status: 404 })
        }

        if (action === 'approve') {
            // Add to guild_members
            const { error: joinErr } = await admin
                .from('guild_members')
                .insert({
                    guild_id: params.id,
                    user_id: joinReq.user_id,
                    role: 'member',
                })

            if (joinErr) {
                console.error('[GUILD-REQUESTS] Approve error:', joinErr)
                return NextResponse.json({ error: 'Failed to add member' }, { status: 500 })
            }
        }

        // Update request status
        await admin
            .from('guild_join_requests')
            .update({ status: action === 'approve' ? 'approved' : 'rejected' })
            .eq('id', requestId)

        return NextResponse.json({ success: true, action })
    } catch {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
}
