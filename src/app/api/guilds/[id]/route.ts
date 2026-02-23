import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * GET /api/guilds/[id] — Guild details with members and quests
 */
export async function GET(
    _request: Request,
    { params }: { params: { id: string } }
) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = createAdminClient()
    const guildId = params.id

    // Verify membership
    const { data: membership } = await admin
        .from('guild_members')
        .select('role')
        .eq('guild_id', guildId)
        .eq('user_id', user.id)
        .single()

    if (!membership) {
        return NextResponse.json({ error: 'Not a member of this guild' }, { status: 403 })
    }

    // Fetch guild
    const { data: guild } = await admin
        .from('guilds')
        .select('*')
        .eq('id', guildId)
        .single()

    if (!guild) {
        return NextResponse.json({ error: 'Guild not found' }, { status: 404 })
    }

    // Fetch members (WITHOUT join — join fails due to auth.users FK)
    const { data: memberRows } = await admin
        .from('guild_members')
        .select('guild_id, user_id, role, joined_at')
        .eq('guild_id', guildId)
        .order('joined_at', { ascending: true })

    // Fetch user profiles separately
    const userIds = (memberRows || []).map(m => m.user_id)
    const profileMap: Record<string, { display_name: string | null; avatar_url: string | null; level: number; total_xp: number }> = {}

    if (userIds.length > 0) {
        const { data: profiles } = await admin
            .from('users')
            .select('id, display_name, avatar_url, level, total_xp')
            .in('id', userIds)

        if (profiles) {
            for (const p of profiles) {
                profileMap[p.id] = {
                    display_name: p.display_name,
                    avatar_url: p.avatar_url,
                    level: p.level ?? 1,
                    total_xp: p.total_xp ?? 0,
                }
            }
        }
    }

    // Merge members with profiles
    const flatMembers = (memberRows || []).map(m => ({
        guild_id: m.guild_id,
        user_id: m.user_id,
        role: m.role,
        joined_at: m.joined_at,
        display_name: profileMap[m.user_id]?.display_name || null,
        avatar_url: profileMap[m.user_id]?.avatar_url || null,
        level: profileMap[m.user_id]?.level ?? 1,
        total_xp: profileMap[m.user_id]?.total_xp ?? 0,
    }))

    // Fetch active guild quests
    const { data: quests } = await admin
        .from('guild_quests')
        .select('*')
        .eq('guild_id', guildId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

    return NextResponse.json({
        guild,
        members: flatMembers,
        quests: quests || [],
        userRole: membership.role,
    })
}

/**
 * PATCH /api/guilds/[id] — Update guild settings (owner/admin)
 */
export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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
        const updates: Record<string, unknown> = {}

        if (body.name?.trim()) updates.name = body.name.trim()
        if (body.description !== undefined) updates.description = body.description?.trim() || null
        if (body.banner_url !== undefined) updates.banner_url = body.banner_url || null
        if (body.emblem !== undefined) updates.emblem = body.emblem || 'shield'
        if (body.min_level !== undefined) updates.min_level = Math.max(1, Math.min(100, parseInt(body.min_level) || 1))
        if (body.join_mode !== undefined && ['open', 'closed', 'approval'].includes(body.join_mode)) {
            updates.join_mode = body.join_mode
        }

        const { data: guild, error } = await admin
            .from('guilds')
            .update(updates)
            .eq('id', params.id)
            .select()
            .single()

        if (error) {
            return NextResponse.json({ error: 'Failed to update guild' }, { status: 500 })
        }

        return NextResponse.json({ guild })
    } catch {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
}

/**
 * DELETE /api/guilds/[id] — Delete guild (owner only)
 */
export async function DELETE(
    _request: Request,
    { params }: { params: { id: string } }
) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const admin = createAdminClient()

    const { data: membership } = await admin
        .from('guild_members')
        .select('role')
        .eq('guild_id', params.id)
        .eq('user_id', user.id)
        .single()

    if (!membership || membership.role !== 'owner') {
        return NextResponse.json({ error: 'Only the Guild Master can delete the guild' }, { status: 403 })
    }

    const { error } = await admin
        .from('guilds')
        .delete()
        .eq('id', params.id)

    if (error) return NextResponse.json({ error: 'Failed to delete guild' }, { status: 500 })

    return NextResponse.json({ deleted: true })
}
