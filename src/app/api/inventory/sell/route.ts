import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

/**
 * POST /api/inventory/sell — Sell an item for 50% of its price
 * Body: { itemId: string }
 */
export async function POST(request: Request) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const db = createServiceClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    try {
        const { itemId } = await request.json()
        if (!itemId) return NextResponse.json({ error: 'itemId is required' }, { status: 400 })

        // Verify user owns the item
        const { data: owned } = await db
            .from('user_inventory')
            .select('id')
            .eq('user_id', user.id)
            .eq('item_id', itemId)
            .maybeSingle()

        if (!owned) {
            return NextResponse.json({ error: 'You do not own this item' }, { status: 403 })
        }

        // Get item price for refund
        const { data: item } = await db
            .from('shop_items')
            .select('name, price, type')
            .eq('id', itemId)
            .single()

        if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 })

        const sellPrice = Math.floor(item.price / 2)

        // Unequip if equipped
        await db
            .from('user_equipped')
            .delete()
            .eq('user_id', user.id)
            .eq('item_id', itemId)

        // Remove from inventory
        const { error: deleteError } = await db
            .from('user_inventory')
            .delete()
            .eq('user_id', user.id)
            .eq('item_id', itemId)

        if (deleteError) {
            console.error('[INVENTORY] Delete error:', deleteError)
            return NextResponse.json({ error: 'Failed to remove item' }, { status: 500 })
        }

        // Add gold back
        const { data: profile } = await db
            .from('users')
            .select('gold_balance')
            .eq('id', user.id)
            .single()

        await db
            .from('users')
            .update({ gold_balance: (profile?.gold_balance || 0) + sellPrice })
            .eq('id', user.id)

        return NextResponse.json({
            success: true,
            item: item.name,
            earned: sellPrice,
            newBalance: (profile?.gold_balance || 0) + sellPrice,
        })
    } catch {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
}
