import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * POST /api/integrations/webhook — Generic inbound webhook for external services
 * Creates tasks from external sources (Google Calendar, Fitbit, etc. via n8n)
 */
export async function POST(request: Request) {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.N8N_WEBHOOK_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()

    try {
        const body = await request.json()
        const { userId, tasks } = body

        if (!userId || !Array.isArray(tasks) || tasks.length === 0) {
            return NextResponse.json({ error: 'userId and tasks[] are required' }, { status: 400 })
        }

        if (tasks.length > 10) {
            return NextResponse.json({ error: 'Max 10 tasks per webhook call' }, { status: 400 })
        }

        const taskRows = tasks.map((t: Record<string, unknown>) => ({
            user_id: userId,
            title: String(t.title || 'Untitled Quest').slice(0, 200),
            description: t.description ? String(t.description).slice(0, 500) : null,
            category: String(t.category || 'productivity'),
            difficulty: ['easy', 'medium', 'hard', 'epic'].includes(String(t.difficulty)) ? String(t.difficulty) : 'medium',
            xp_reward: Math.min(Math.max(Number(t.xp_reward) || 20, 5), 100),
            status: 'pending',
            quest_timeframe: String(t.timeframe || 'daily'),
            source: String(t.source || 'external'),
        }))

        const { data: created, error } = await supabase
            .from('tasks')
            .insert(taskRows)
            .select()

        if (error) {
            console.error('[WEBHOOK] Insert error:', error)
            return NextResponse.json({ error: 'Failed to create tasks' }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            tasksCreated: created?.length || 0,
        })
    } catch {
        return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }
}
