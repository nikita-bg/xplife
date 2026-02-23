import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPlanLimits } from '@/lib/plan-limits'

/**
 * GET /api/guilds — List guilds the user belongs to
 */
export async function GET() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = createAdminClient()

    const { data: memberships } = await admin
        .from('guild_members')
        .select('guild_id, role')
        .eq('user_id', user.id)

    if (!memberships?.length) {
        return NextResponse.json({ guilds: [] })
    }

    const guildIds = memberships.map(m => m.guild_id)
    const { data: guilds, error } = await admin
        .from('guilds')
        .select('*')
        .in('id', guildIds)
        .order('created_at', { ascending: false })

    if (error) {
        return NextResponse.json({ error: 'Failed to fetch guilds' }, { status: 500 })
    }

    // Attach user's role
    const guildsWithRole = guilds?.map(g => ({
        ...g,
        userRole: memberships.find(m => m.guild_id === g.id)?.role || 'member',
    })) || []

    return NextResponse.json({ guilds: guildsWithRole })
}

/**
 * POST /api/guilds — Create a new guild
 */
export async function POST(request: Request) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = createAdminClient()

    // Check plan limit
    const { data: profile } = await admin
        .from('users')
        .select('plan')
        .eq('id', user.id)
        .single()

    const limits = getPlanLimits(profile?.plan)

    // Count guilds user owns
    const { count: ownedCount } = await admin
        .from('guild_members')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('role', 'owner')

    const maxGuilds = limits.maxGoals // reuse maxGoals as maxGuilds (1 free, 3 premium)
    if ((ownedCount ?? 0) >= maxGuilds) {
        return NextResponse.json(
            { error: `Maximum ${maxGuilds} guild(s) for your plan. Upgrade for more.`, upgrade: true },
            { status: 403 }
        )
    }

    try {
        const body = await request.json()
        const { name, description } = body

        if (!name?.trim() || name.trim().length < 2) {
            return NextResponse.json({ error: 'Guild name must be at least 2 characters' }, { status: 400 })
        }

        // Create guild
        const { data: guild, error: guildError } = await admin
            .from('guilds')
            .insert({
                name: name.trim(),
                description: description?.trim() || null,
                created_by: user.id,
            })
            .select()
            .single()

        if (guildError) {
            console.error('[GUILDS] Create error:', guildError)
            return NextResponse.json({ error: 'Failed to create guild' }, { status: 500 })
        }

        // Add creator as owner
        await admin.from('guild_members').insert({
            guild_id: guild.id,
            user_id: user.id,
            role: 'owner',
        })

        return NextResponse.json({ guild })
    } catch {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
}
