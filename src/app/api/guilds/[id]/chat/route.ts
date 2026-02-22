import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

    const { data: messages, error } = await supabase
        .from('guild_chat_messages')
        .select('*, users(display_name, avatar_url)')
        .eq('guild_id', params.id)
        .order('created_at', { ascending: true })
        .limit(50)

    if (error) {
        return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
    }

    // Flatten user data
    const flatMessages = messages?.map(m => {
        const userData = (m.users ?? {}) as unknown as Record<string, unknown>
        return {
            id: m.id,
            guild_id: m.guild_id,
            user_id: m.user_id,
            content: m.content,
            created_at: m.created_at,
            ...userData,
        }
    }) || []

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
        const { content } = body

        if (!content?.trim()) {
            return NextResponse.json({ error: 'Message content is required' }, { status: 400 })
        }

        if (content.trim().length > 1000) {
            return NextResponse.json({ error: 'Message too long (max 1000 characters)' }, { status: 400 })
        }

        const { data: message, error } = await supabase
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

        return NextResponse.json({ message })
    } catch {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
}
