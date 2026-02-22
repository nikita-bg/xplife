import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const taskId = params.id

    // Verify task belongs to user
    const { data: task, error: taskError } = await supabase
        .from('tasks')
        .select('id')
        .eq('id', taskId)
        .eq('user_id', user.id)
        .single()

    if (taskError || !task) {
        return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    try {
        const body = await request.json()
        const { difficulty_rating, enjoyment_score, time_taken, notes } = body

        // Validate ratings (1-5)
        if (
            !difficulty_rating ||
            !enjoyment_score ||
            difficulty_rating < 1 ||
            difficulty_rating > 5 ||
            enjoyment_score < 1 ||
            enjoyment_score > 5
        ) {
            return NextResponse.json(
                { error: 'Invalid ratings. Must be between 1 and 5.' },
                { status: 400 }
            )
        }

        const { error: insertError } = await supabase.from('task_feedback').insert({
            task_id: taskId,
            user_id: user.id,
            difficulty_rating,
            enjoyment_score,
            time_taken: time_taken || null,
            notes: notes || null,
        })

        if (insertError) {
            console.error('[FEEDBACK] Insert failed:', insertError)
            return NextResponse.json({ error: 'Failed to save feedback' }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
}
