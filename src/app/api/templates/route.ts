import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { TEMPLATE_PACKS } from '@/lib/quest-templates'

/**
 * GET /api/templates — List all available template packs
 */
export async function GET() {
    return NextResponse.json({
        packs: TEMPLATE_PACKS.map(p => ({
            id: p.id,
            name: p.name,
            description: p.description,
            icon: p.icon,
            color: p.color,
            questCount: p.quests.length,
            totalXp: p.quests.reduce((sum, q) => sum + q.xp_reward, 0),
        })),
    })
}

/**
 * POST /api/templates — Apply a template pack → create tasks
 */
export async function POST(request: Request) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { packId } = body

        const pack = TEMPLATE_PACKS.find(p => p.id === packId)
        if (!pack) {
            return NextResponse.json({ error: 'Template pack not found' }, { status: 404 })
        }

        // Create tasks from template
        const tasks = pack.quests.map(q => ({
            user_id: user.id,
            title: q.title,
            description: q.description,
            category: q.category,
            difficulty: q.difficulty,
            xp_reward: q.xp_reward,
            status: 'pending',
            quest_timeframe: 'daily',
            source: 'template',
        }))

        const { data: created, error } = await supabase
            .from('tasks')
            .insert(tasks)
            .select()

        if (error) {
            console.error('[TEMPLATES] Apply error:', error)
            return NextResponse.json({ error: 'Failed to apply template' }, { status: 500 })
        }

        return NextResponse.json({
            applied: pack.name,
            tasksCreated: created?.length || 0,
            tasks: created,
        })
    } catch {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
}
