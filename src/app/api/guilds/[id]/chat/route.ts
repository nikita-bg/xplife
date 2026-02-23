import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * GET /api/guilds/[id]/chat — Fetch recent chat messages
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

    // Verify membership
    const { data: membership } = await admin
        .from('guild_members')
        .select('role')
        .eq('guild_id', params.id)
        .eq('user_id', user.id)
        .single()

    if (!membership) {
        return NextResponse.json({ error: 'Not a member' }, { status: 403 })
    }

    // Fetch messages (no join — join breaks due to auth.users FK)
    const { data: messageRows, error } = await admin
        .from('guild_chat_messages')
        .select('id, guild_id, user_id, content, created_at')
        .eq('guild_id', params.id)
        .order('created_at', { ascending: true })
        .limit(100)

    if (error) {
        console.error('[GUILD-CHAT] Fetch error:', error)
        return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
    }

    // Fetch user profiles separately
    const userIds = Array.from(new Set((messageRows || []).map(m => m.user_id)))
    const profileMap: Record<string, { display_name: string | null; avatar_url: string | null }> = {}

    if (userIds.length > 0) {
        const { data: profiles } = await admin
            .from('users')
            .select('id, display_name, avatar_url')
            .in('id', userIds)

        if (profiles) {
            for (const p of profiles) {
                profileMap[p.id] = {
                    display_name: p.display_name,
                    avatar_url: p.avatar_url,
                }
            }
        }
    }

    // Merge
    const flatMessages = (messageRows || []).map(m => ({
        id: m.id,
        guild_id: m.guild_id,
        user_id: m.user_id,
        content: m.content,
        created_at: m.created_at,
        display_name: profileMap[m.user_id]?.display_name || null,
        avatar_url: profileMap[m.user_id]?.avatar_url || null,
    }))

    return NextResponse.json({ messages: flatMessages })
}

/**
 * POST /api/guilds/[id]/chat — Send a chat message
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

    // Verify membership
    const { data: membership } = await admin
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
        const { content } = body

        if (!content?.trim()) {
            return NextResponse.json({ error: 'Message content is required' }, { status: 400 })
        }

        if (content.trim().length > 1000) {
            return NextResponse.json({ error: 'Message too long (max 1000 characters)' }, { status: 400 })
        }

        // Fetch user display name
        const { data: userData } = await admin
            .from('users')
            .select('display_name, avatar_url')
            .eq('id', user.id)
            .single()

        const { data: message, error } = await admin
            .from('guild_chat_messages')
            .insert({
                guild_id: params.id,
                user_id: user.id,
                content: content.trim(),
            })
            .select()
            .single()

        if (error) {
            console.error('[GUILD-CHAT] Send error:', error)
            return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
        }

        return NextResponse.json({
            message: {
                ...message,
                display_name: userData?.display_name || null,
                avatar_url: userData?.avatar_url || null,
            }
        })
    } catch {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
}
