/**
 * Wallet API — GET user's wallet balance
 * GET /api/wallet?userId=xxx
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: wallet } = await supabase
        .from('user_wallet')
        .select('coins, gems, total_coins_earned')
        .eq('user_id', user.id)
        .single()

    if (!wallet) {
        // Create wallet if it doesn't exist
        await supabase.from('user_wallet').insert({
            user_id: user.id,
            coins: 0,
            gems: 0,
            total_coins_earned: 0,
        })
        return NextResponse.json({ coins: 0, gems: 0, total_coins_earned: 0 })
    }

    return NextResponse.json(wallet)
}
