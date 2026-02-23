import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * POST /api/guilds/[id]/join — Join a guild
 * Supports two modes:
 *   1. Direct join (no body needed) — for guild discovery
 *   2. Invite code join (body: { inviteCode }) — for private invites
 */
export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = createAdminClient()

    // Check if already a member
    const { data: existing } = await admin
        .from('guild_members')
        .select('user_id')
        .eq('guild_id', params.id)
        .eq('user_id', user.id)
        .single()

    if (existing) {
        return NextResponse.json({ error: 'Already a member of this guild', guildId: params.id }, { status: 409 })
    }

    // Try to parse body for invite code (optional)
    let inviteCode: string | null = null
    try {
        const body = await request.json()
        inviteCode = body?.inviteCode?.trim() || null
    } catch {
        // No body = direct join
    }

    // If invite code provided, validate it
    if (inviteCode) {
        const { data: invite } = await admin
            .from('guild_invites')
            .select('*')
            .ilike('invite_code', inviteCode)
            .eq('guild_id', params.id)
            .single()

        if (!invite) {
            return NextResponse.json({ error: 'Invalid invite code' }, { status: 404 })
        }

        if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
            return NextResponse.json({ error: 'Invite has expired' }, { status: 410 })
        }

        if (invite.max_uses > 0 && invite.uses >= invite.max_uses) {
            return NextResponse.json({ error: 'Invite has reached maximum uses' }, { status: 410 })
        }

        // Increment invite uses
        await admin
            .from('guild_invites')
            .update({ uses: invite.uses + 1 })
            .eq('id', invite.id)
    }

    // Verify guild exists
    const { data: guild } = await admin
        .from('guilds')
        .select('id')
        .eq('id', params.id)
        .single()

    if (!guild) {
        return NextResponse.json({ error: 'Guild not found' }, { status: 404 })
    }

    // Join
    const { error: joinError } = await admin
        .from('guild_members')
        .insert({
            guild_id: params.id,
            user_id: user.id,
            role: 'member',
        })

    if (joinError) {
        console.error('[GUILD-JOIN] Join error:', joinError)
        return NextResponse.json({ error: 'Failed to join guild' }, { status: 500 })
    }

    // Update member count
    const { data: guildData } = await admin
        .from('guilds')
        .select('member_count')
        .eq('id', params.id)
        .single()

    if (guildData) {
        await admin
            .from('guilds')
            .update({ member_count: (guildData.member_count || 0) + 1 })
            .eq('id', params.id)
    }

    return NextResponse.json({ success: true, guildId: params.id })
}
