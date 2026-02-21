import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/inventory/equip
 * Body: { inventoryId: string, action: 'equip' | 'unequip' }
 *
 * Equip: sets equipped=true, equipped_slot=item.type
 *        unequips any other item in the same slot first
 * Unequip: sets equipped=false, equipped_slot=null
 */
export async function POST(req: NextRequest) {
    try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { inventoryId, action } = await req.json()

        if (!inventoryId || !['equip', 'unequip'].includes(action)) {
            return NextResponse.json(
                { error: 'Invalid request. Provide inventoryId and action (equip|unequip).' },
                { status: 400 }
            )
        }

        // Fetch the inventory entry (must belong to this user)
        const { data: invEntry, error: fetchError } = await supabase
            .from('user_inventory')
            .select('*, items(type)')
            .eq('id', inventoryId)
            .eq('user_id', user.id)
            .single()

        if (fetchError || !invEntry) {
            return NextResponse.json({ error: 'Item not found in inventory' }, { status: 404 })
        }

        const itemType = (invEntry.items as { type: string } | null)?.type

        if (action === 'equip') {
            if (!itemType) {
                return NextResponse.json({ error: 'Item has no type' }, { status: 400 })
            }

            // Unequip any currently-equipped item in the same slot
            await supabase
                .from('user_inventory')
                .update({ equipped: false, equipped_slot: null })
                .eq('user_id', user.id)
                .eq('equipped', true)
                .eq('equipped_slot', itemType)

            // Equip the new item
            const { error: equipError } = await supabase
                .from('user_inventory')
                .update({ equipped: true, equipped_slot: itemType })
                .eq('id', inventoryId)
                .eq('user_id', user.id)

            if (equipError) {
                return NextResponse.json({ error: 'Failed to equip item' }, { status: 500 })
            }

            return NextResponse.json({ success: true, action: 'equipped', slot: itemType })
        }

        // Unequip
        const { error: unequipError } = await supabase
            .from('user_inventory')
            .update({ equipped: false, equipped_slot: null })
            .eq('id', inventoryId)
            .eq('user_id', user.id)

        if (unequipError) {
            return NextResponse.json({ error: 'Failed to unequip item' }, { status: 500 })
        }

        return NextResponse.json({ success: true, action: 'unequipped', slot: itemType })
    } catch {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
