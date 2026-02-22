import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/guilds/[id]/quests — List guild quests
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

    // Verify membership
    const { data: membership } = await supabase
        .from('guild_members')
        .select('role')
        .eq('guild_id', params.id)
        .eq('user_id', user.id)
        .single()

    if (!membership) {
        return NextResponse.json({ error: 'Not a member' }, { status: 403 })
    }

    const { data: quests, error } = await supabase
        .from('guild_quests')
        .select('*')
        .eq('guild_id', params.id)
        .order('created_at', { ascending: false })

    if (error) {
        return NextResponse.json({ error: 'Failed to fetch quests' }, { status: 500 })
    }

    return NextResponse.json({ quests: quests || [] })
}

/**
 * POST /api/guilds/[id]/quests — Create guild quest (admin/owner)
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

    const { data: membership } = await supabase
        .from('guild_members')
        .select('role')
        .eq('guild_id', params.id)
        .eq('user_id', user.id)
        .single()

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
        return NextResponse.json({ error: 'Only admins can create guild quests' }, { status: 403 })
    }

    try {
        const body = await request.json()
        const { title, description, category, difficulty, xp_reward, target_contributions } = body

        if (!title?.trim()) {
            return NextResponse.json({ error: 'Title is required' }, { status: 400 })
        }

        const { data: quest, error } = await supabase
            .from('guild_quests')
            .insert({
                guild_id: params.id,
                title: title.trim(),
                description: description?.trim() || null,
                category: category || 'productivity',
                difficulty: difficulty || 'medium',
                xp_reward: xp_reward || 100,
                target_contributions: target_contributions || 10,
                created_by: user.id,
            })
            .select()
            .single()

        if (error) {
            console.error('[GUILD-QUEST] Create error:', error)
            return NextResponse.json({ error: 'Failed to create quest' }, { status: 500 })
        }

        return NextResponse.json({ quest })
    } catch {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
}

/**
 * PATCH /api/guilds/[id]/quests — Contribute to a guild quest
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

    // Verify membership
    const { data: membership } = await supabase
        .from('guild_members')
        .select('role')
        .eq('guild_id', params.id)
        .eq('user_id', user.id)
        .single()

    if (!membership) {
        return NextResponse.json({ error: 'Not a member' }, { status: 403 })
    }

    try {
        const body = await request.json()
        const { questId } = body

        if (!questId) {
            return NextResponse.json({ error: 'Quest ID is required' }, { status: 400 })
        }

        // Fetch quest
        const { data: quest } = await supabase
            .from('guild_quests')
            .select('*')
            .eq('id', questId)
            .eq('guild_id', params.id)
            .eq('status', 'active')
            .single()

        if (!quest) {
            return NextResponse.json({ error: 'Quest not found or already completed' }, { status: 404 })
        }

        const newContributions = quest.current_contributions + 1
        const isCompleted = newContributions >= quest.target_contributions

        const updates: Record<string, unknown> = {
            current_contributions: newContributions,
        }

        if (isCompleted) {
            updates.status = 'completed'
            updates.completed_at = new Date().toISOString()
        }

        const { data: updated, error } = await supabase
            .from('guild_quests')
            .update(updates)
            .eq('id', questId)
            .select()
            .single()

        if (error) {
            return NextResponse.json({ error: 'Failed to contribute' }, { status: 500 })
        }

        // Award XP to contributor
        const xpAmount = Math.round(quest.xp_reward / quest.target_contributions)
        const { data: profile } = await supabase
            .from('users')
            .select('total_xp')
            .eq('id', user.id)
            .single()

        if (profile) {
            await supabase
                .from('users')
                .update({ total_xp: (profile.total_xp || 0) + xpAmount })
                .eq('id', user.id)
        }

        // Add XP to guild total
        const { data: guild } = await supabase
            .from('guilds')
            .select('total_xp')
            .eq('id', params.id)
            .single()

        if (guild) {
            await supabase
                .from('guilds')
                .update({ total_xp: (guild.total_xp || 0) + xpAmount })
                .eq('id', params.id)
        }

        return NextResponse.json({
            quest: updated,
            xpEarned: xpAmount,
            completed: isCompleted,
        })
    } catch {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
}
