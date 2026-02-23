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

    // Fetch members with user info
    const { data: members } = await admin
        .from('guild_members')
        .select('guild_id, user_id, role, joined_at, users(display_name, avatar_url, level, total_xp)')
        .eq('guild_id', guildId)
        .order('joined_at', { ascending: true })

    // Fetch active guild quests
    const { data: quests } = await admin
        .from('guild_quests')
        .select('*')
        .eq('guild_id', guildId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

    // Flatten member data
    const flatMembers = members?.map(m => {
        const userData = (m.users ?? {}) as unknown as Record<string, unknown>
        return {
            guild_id: m.guild_id,
            user_id: m.user_id,
            role: m.role,
            joined_at: m.joined_at,
            ...userData,
        }
    }) || []

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
