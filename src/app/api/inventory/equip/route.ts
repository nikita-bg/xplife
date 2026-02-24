import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/inventory/equip — Equip or unequip an item
 * Body: { itemId: string } — equips item (replaces current in that slot)
 * Body: { slot: string, unequip: true } — unequips from slot
 */
export async function POST(request: Request) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const body = await request.json()

        // Unequip a slot
        if (body.unequip && body.slot) {
            await supabase
                .from('user_equipped')
                .delete()
                .eq('user_id', user.id)
                .eq('slot', body.slot)

            return NextResponse.json({ success: true, action: 'unequipped', slot: body.slot })
        }

        const { itemId } = body
        if (!itemId) return NextResponse.json({ error: 'itemId is required' }, { status: 400 })

        // Verify user owns the item
        const { data: owned } = await supabase
            .from('user_inventory')
            .select('id')
            .eq('user_id', user.id)
            .eq('item_id', itemId)
            .maybeSingle()

        if (!owned) {
            return NextResponse.json({ error: 'You do not own this item' }, { status: 403 })
        }

        // Get item to know its slot type
        const { data: item } = await supabase
            .from('shop_items')
            .select('type, name')
            .eq('id', itemId)
            .single()

        if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 })

        // Upsert to equipped (replaces existing item in same slot)
        const { error } = await supabase
            .from('user_equipped')
            .upsert(
                { user_id: user.id, slot: item.type, item_id: itemId, equipped_at: new Date().toISOString() },
                { onConflict: 'user_id,slot' }
            )

        if (error) {
            console.error('[INVENTORY] Equip error:', error)
            return NextResponse.json({ error: 'Failed to equip item' }, { status: 500 })
        }

        return NextResponse.json({ success: true, action: 'equipped', slot: item.type, item: item.name })
    } catch {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
}
