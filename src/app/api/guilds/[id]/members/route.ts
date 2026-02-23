import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * GET /api/guilds/[id]/members — List members (admin/owner only)
 * PATCH /api/guilds/[id]/members — Promote/demote a member { userId, role }
 * DELETE /api/guilds/[id]/members — Kick a member { userId }
 */

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const admin = createAdminClient()
    const guildId = params.id

    const { data: myRole } = await admin
        .from('guild_members')
        .select('role')
        .eq('guild_id', guildId)
        .eq('user_id', user.id)
        .single()

    if (!myRole || myRole.role !== 'owner') {
        return NextResponse.json({ error: 'Only the Guild Master can change roles' }, { status: 403 })
    }

    const { userId, role } = await request.json()

    if (!userId || !['admin', 'member'].includes(role)) {
        return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
    }

    if (userId === user.id) {
        return NextResponse.json({ error: 'Cannot change your own role' }, { status: 400 })
    }

    const { error } = await admin
        .from('guild_members')
        .update({ role })
        .eq('guild_id', guildId)
        .eq('user_id', userId)

    if (error) return NextResponse.json({ error: 'Failed to update role' }, { status: 500 })

    return NextResponse.json({ updated: true })
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const admin = createAdminClient()
    const guildId = params.id

    const { data: myRole } = await admin
        .from('guild_members')
        .select('role')
        .eq('guild_id', guildId)
        .eq('user_id', user.id)
        .single()

    if (!myRole || !['owner', 'admin'].includes(myRole.role)) {
        return NextResponse.json({ error: 'Insufficient permissions to kick members' }, { status: 403 })
    }

    const { userId } = await request.json()
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })
    if (userId === user.id) return NextResponse.json({ error: 'Cannot kick yourself' }, { status: 400 })

    // Admin cannot kick owner
    const { data: targetRole } = await admin
        .from('guild_members')
        .select('role')
        .eq('guild_id', guildId)
        .eq('user_id', userId)
        .single()

    if (targetRole?.role === 'owner') {
        return NextResponse.json({ error: 'Cannot kick the Guild Master' }, { status: 403 })
    }

    // Admin cannot kick other admin
    if (myRole.role === 'admin' && targetRole?.role === 'admin') {
        return NextResponse.json({ error: 'Co-admins cannot kick each other' }, { status: 403 })
    }

    const { error } = await admin
        .from('guild_members')
        .delete()
        .eq('guild_id', guildId)
        .eq('user_id', userId)

    if (error) return NextResponse.json({ error: 'Failed to kick member' }, { status: 500 })

    return NextResponse.json({ kicked: true })
}
