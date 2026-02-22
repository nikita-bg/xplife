import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { randomBytes } from 'crypto'

/**
 * POST /api/guilds/[id]/invite — Generate invite link
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

    // Verify admin/owner
    const { data: membership } = await supabase
        .from('guild_members')
        .select('role')
        .eq('guild_id', params.id)
        .eq('user_id', user.id)
        .single()

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
        return NextResponse.json({ error: 'Only admins can create invites' }, { status: 403 })
    }

    const inviteCode = randomBytes(6).toString('hex') // 12 char code
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 day expiry

    const { data: invite, error } = await supabase
        .from('guild_invites')
        .insert({
            guild_id: params.id,
            invited_by: user.id,
            invite_code: inviteCode,
            expires_at: expiresAt.toISOString(),
            max_uses: 0, // unlimited
        })
        .select()
        .single()

    if (error) {
        console.error('[GUILD-INVITE] Create error:', error)
        return NextResponse.json({ error: 'Failed to create invite' }, { status: 500 })
    }

    return NextResponse.json({ invite, inviteCode })
}
