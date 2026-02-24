import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

/**
 * GET /api/inventory — Get user's inventory + equipped items + gold
 */
export async function GET() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const db = createServiceClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get inventory items with shop_items join
    const { data: inventory, error: invError } = await db
        .from('user_inventory')
        .select('id, item_id, acquired_at, shop_items(id, name, type, rarity, price, emoji, description, class_restriction)')
        .eq('user_id', user.id)

    if (invError) {
        console.error('[INVENTORY] Fetch error:', invError)
        return NextResponse.json({ error: 'Failed to load inventory' }, { status: 500 })
    }

    // Get equipped items
    const { data: equipped } = await db
        .from('user_equipped')
        .select('slot, item_id, shop_items(id, name, type, rarity, emoji)')
        .eq('user_id', user.id)

    // Get gold balance
    const { data: profile } = await db
        .from('users')
        .select('gold_balance')
        .eq('id', user.id)
        .single()

    // Build equipped map: slot → item
    const equippedMap: Record<string, unknown> = {}
    for (const eq of (equipped || [])) {
        equippedMap[eq.slot] = eq.shop_items
    }

    return NextResponse.json({
        items: (inventory || []).map(inv => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const shopItem = (Array.isArray(inv.shop_items) ? inv.shop_items[0] : inv.shop_items) as any;
            return {
                inventoryId: inv.id,
                acquiredAt: inv.acquired_at,
                ...(shopItem || {}),
            };
        }),
        equipped: equippedMap,
        goldBalance: profile?.gold_balance || 0,
    })
}
