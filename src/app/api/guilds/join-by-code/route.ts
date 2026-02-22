import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/guilds/join-by-code — Join a guild using just an invite code
 * (without knowing the guild ID upfront)
 */
export async function POST(request: Request) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { inviteCode } = body

        if (!inviteCode?.trim()) {
            return NextResponse.json({ error: 'Invite code is required' }, { status: 400 })
        }

        // Find invite by code
        const { data: invite } = await supabase
            .from('guild_invites')
            .select('*')
            .eq('invite_code', inviteCode.trim())
            .single()

        if (!invite) {
            return NextResponse.json({ error: 'Invalid invite code' }, { status: 404 })
        }

        // Check expiry
        if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
            return NextResponse.json({ error: 'Invite has expired' }, { status: 410 })
        }

        // Check max uses
        if (invite.max_uses > 0 && invite.uses >= invite.max_uses) {
            return NextResponse.json({ error: 'Invite has reached maximum uses' }, { status: 410 })
        }

        // Check if already a member
        const { data: existing } = await supabase
            .from('guild_members')
            .select('user_id')
            .eq('guild_id', invite.guild_id)
            .eq('user_id', user.id)
            .single()

        if (existing) {
            return NextResponse.json({ error: 'Already a member of this guild', guildId: invite.guild_id }, { status: 409 })
        }

        // Join
        const { error: joinError } = await supabase
            .from('guild_members')
            .insert({
                guild_id: invite.guild_id,
                user_id: user.id,
                role: 'member',
            })

        if (joinError) {
            console.error('[GUILD-JOIN] Join error:', joinError)
            return NextResponse.json({ error: 'Failed to join guild' }, { status: 500 })
        }

        // Increment invite uses
        await supabase
            .from('guild_invites')
            .update({ uses: invite.uses + 1 })
            .eq('id', invite.id)

        return NextResponse.json({ success: true, guildId: invite.guild_id })
    } catch {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
}
