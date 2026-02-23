import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * POST /api/guilds/[id]/join — Join a guild
 * Supports:
 *   - Direct join (no body) — for guild discovery (respects join_mode + min_level)
 *   - Invite code join (body: { inviteCode }) — bypasses closed mode but not min_level
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

    // Fetch guild settings
    const { data: guild } = await admin
        .from('guilds')
        .select('id, min_level, join_mode')
        .eq('id', params.id)
        .single()

    if (!guild) {
        return NextResponse.json({ error: 'Guild not found' }, { status: 404 })
    }

    // Fetch user level
    const { data: userProfile } = await admin
        .from('users')
        .select('level')
        .eq('id', user.id)
        .single()

    const userLevel = userProfile?.level ?? 1

    // Check min_level
    if (guild.min_level && userLevel < guild.min_level) {
        return NextResponse.json({
            error: `You need to be at least Level ${guild.min_level} to join this guild. You are Level ${userLevel}.`,
        }, { status: 403 })
    }

    // Parse body for invite code (optional)
    let inviteCode: string | null = null
    try {
        const body = await request.json()
        inviteCode = body?.inviteCode?.trim() || null
    } catch {
        // No body = direct join
    }

    // If invite code provided, validate it
    const hasValidInvite = !!inviteCode
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

    // Enforce join_mode (invite codes bypass 'closed' but not 'approval')
    const joinMode = guild.join_mode || 'open'

    if (joinMode === 'closed' && !hasValidInvite) {
        return NextResponse.json({ error: 'This guild is closed to new members' }, { status: 403 })
    }

    if (joinMode === 'approval' && !hasValidInvite) {
        // Check if already has a pending request
        const { data: existingReq } = await admin
            .from('guild_join_requests')
            .select('id, status')
            .eq('guild_id', params.id)
            .eq('user_id', user.id)
            .single()

        if (existingReq) {
            if (existingReq.status === 'pending') {
                return NextResponse.json({ error: 'You already have a pending request', pending: true }, { status: 409 })
            }
            if (existingReq.status === 'rejected') {
                return NextResponse.json({ error: 'Your request was rejected' }, { status: 403 })
            }
        }

        // Create join request
        await admin.from('guild_join_requests').insert({
            guild_id: params.id,
            user_id: user.id,
            status: 'pending',
        })

        return NextResponse.json({ success: true, pending: true, message: 'Your request has been sent for approval' }, { status: 202 })
    }

    // Direct join (open mode or valid invite)
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

    return NextResponse.json({ success: true, guildId: params.id })
}
