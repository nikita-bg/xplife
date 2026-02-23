import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * POST /api/guilds/[id]/leave — Leave a guild
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
    const guildId = params.id

    // Check membership and role
    const { data: membership } = await admin
        .from('guild_members')
        .select('role')
        .eq('guild_id', guildId)
        .eq('user_id', user.id)
        .single()

    if (!membership) {
        return NextResponse.json({ error: 'Not a member' }, { status: 403 })
    }

    // If owner, check if there are other members
    if (membership.role === 'owner') {
        const { count } = await admin
            .from('guild_members')
            .select('*', { count: 'exact', head: true })
            .eq('guild_id', guildId)

        if ((count || 0) > 1) {
            return NextResponse.json({
                error: 'Transfer ownership to another member before leaving, or delete the guild.'
            }, { status: 400 })
        }

        // Only member = owner, delete the guild entirely
        await admin.from('guilds').delete().eq('id', guildId)
        return NextResponse.json({ deleted: true })
    }

    // Remove from guild_members
    const { error } = await admin
        .from('guild_members')
        .delete()
        .eq('guild_id', guildId)
        .eq('user_id', user.id)

    if (error) {
        return NextResponse.json({ error: 'Failed to leave guild' }, { status: 500 })
    }

    return NextResponse.json({ left: true })
}
