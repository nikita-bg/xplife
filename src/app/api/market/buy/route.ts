import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/market/buy — Purchase an item from the shop
 * Body: { itemId: string }
 */
export async function POST(request: Request) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const { itemId } = await request.json()
        if (!itemId) return NextResponse.json({ error: 'itemId is required' }, { status: 400 })

        // Check if already owned
        const { data: existing } = await supabase
            .from('user_inventory')
            .select('id')
            .eq('user_id', user.id)
            .eq('item_id', itemId)
            .maybeSingle()

        if (existing) {
            return NextResponse.json({ error: 'You already own this item' }, { status: 409 })
        }

        // Get item price
        const { data: item, error: itemError } = await supabase
            .from('shop_items')
            .select('id, name, price')
            .eq('id', itemId)
            .single()

        if (itemError || !item) {
            return NextResponse.json({ error: 'Item not found' }, { status: 404 })
        }

        // Get user gold balance
        const { data: profile } = await supabase
            .from('users')
            .select('gold_balance')
            .eq('id', user.id)
            .single()

        const goldBalance = profile?.gold_balance || 0

        if (goldBalance < item.price) {
            return NextResponse.json({
                error: `Not enough gold. Need ${item.price}, have ${goldBalance}`,
                needed: item.price,
                have: goldBalance,
            }, { status: 400 })
        }

        // Deduct gold
        const { error: updateError } = await supabase
            .from('users')
            .update({ gold_balance: goldBalance - item.price })
            .eq('id', user.id)

        if (updateError) {
            console.error('[MARKET] Gold deduction error:', updateError)
            return NextResponse.json({ error: 'Failed to process payment' }, { status: 500 })
        }

        // Add to inventory
        const { error: insertError } = await supabase
            .from('user_inventory')
            .insert({ user_id: user.id, item_id: itemId })

        if (insertError) {
            // Rollback gold
            await supabase
                .from('users')
                .update({ gold_balance: goldBalance })
                .eq('id', user.id)
            console.error('[MARKET] Inventory insert error:', insertError)
            return NextResponse.json({ error: 'Failed to add item to inventory' }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            item: item.name,
            spent: item.price,
            remainingGold: goldBalance - item.price,
        })
    } catch {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
}
