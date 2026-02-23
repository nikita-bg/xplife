import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { dominantType, scores } = body

        if (!dominantType || !scores) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // Upsert Braverman results
        const { error: bravermanError } = await supabase
            .from('braverman_results')
            .upsert({
                user_id: user.id,
                dopamine_score: scores.dopamine || 0,
                acetylcholine_score: scores.acetylcholine || 0,
                gaba_score: scores.gaba || 0,
                serotonin_score: scores.serotonin || 0,
                dominant_type: dominantType,
                completed_at: new Date().toISOString(),
            }, { onConflict: 'user_id' })

        if (bravermanError) {
            console.error('[BRAVERMAN] Failed to save results:', bravermanError)
            return NextResponse.json({ error: 'Failed to save results' }, { status: 500 })
        }

        // Update user profile with personality type and scores
        const { error: profileError } = await supabase
            .from('users')
            .update({
                personality_type: dominantType,
                dopamine_score: scores.dopamine || 0,
                acetylcholine_score: scores.acetylcholine || 0,
                gaba_score: scores.gaba || 0,
                serotonin_score: scores.serotonin || 0,
                updated_at: new Date().toISOString(),
            })
            .eq('id', user.id)

        if (profileError) {
            console.error('[BRAVERMAN] Failed to update profile:', profileError)
        }

        return NextResponse.json({ success: true, dominantType })
    } catch (error) {
        console.error('[BRAVERMAN] Error:', error)
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
}
