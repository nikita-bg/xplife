import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/balance — Get user's dual currency balances
 * Returns: { questGold, realWorldEarnings }
 */
export async function GET() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
        .from('users')
        .select('gold_balance, real_world_earnings')
        .eq('id', user.id)
        .single()

    return NextResponse.json({
        questGold: profile?.gold_balance || 0,
        realWorldEarnings: profile?.real_world_earnings || 0,
    })
}

/**
 * POST /api/balance — Add real-world earnings (private, only user sees)
 * Body: { amount: number, description?: string }
 */
export async function POST(request: Request) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { amount, description } = await request.json()

        if (typeof amount !== 'number' || amount <= 0) {
            return NextResponse.json({ error: 'Amount must be a positive number' }, { status: 400 })
        }

        // Get current earnings
        const { data: profile } = await supabase
            .from('users')
            .select('real_world_earnings')
            .eq('id', user.id)
            .single()

        const currentEarnings = profile?.real_world_earnings || 0

        // Update earnings
        const { error } = await supabase
            .from('users')
            .update({ real_world_earnings: currentEarnings + amount })
            .eq('id', user.id)

        if (error) {
            console.error('[BALANCE] Update error:', error)
            return NextResponse.json({ error: 'Failed to update earnings' }, { status: 500 })
        }

        // Log the earning entry (table may not exist yet — that's OK)
        try {
            await supabase.from('earnings_log').insert({
                user_id: user.id,
                amount,
                description: description || 'Manual entry',
                created_at: new Date().toISOString(),
            })
        } catch {
            // earnings_log table may not exist yet
        }

        return NextResponse.json({
            realWorldEarnings: currentEarnings + amount,
            added: amount,
        })
    } catch {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }
}
