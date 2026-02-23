import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { randomBytes } from 'crypto'

/**
 * POST /api/guilds/[id]/invite — Generate invite code
 */
export async function POST(
    _request: Request,
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
        return NextResponse.json({ error: 'Only admins can create invites' }, { status: 403 })
    }

    // Check if there's already an active invite for this guild
    const { data: existing } = await admin
        .from('guild_invites')
        .select('invite_code, expires_at')
        .eq('guild_id', params.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

    // If there's a non-expired invite, return it
    if (existing && (!existing.expires_at || new Date(existing.expires_at) > new Date())) {
        return NextResponse.json({ inviteCode: existing.invite_code })
    }

    // Create new invite
    const inviteCode = randomBytes(4).toString('hex').toUpperCase() // 8-char code like "A1B2C3D4"

    const { error } = await admin
        .from('guild_invites')
        .insert({
            guild_id: params.id,
            invited_by: user.id,
            invite_code: inviteCode,
            expires_at: null, // permanent
            max_uses: 0, // unlimited
        })

    if (error) {
        console.error('[GUILD-INVITE] Create error:', error)
        return NextResponse.json({ error: 'Failed to create invite' }, { status: 500 })
    }

    return NextResponse.json({ inviteCode })
}
