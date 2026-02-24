import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/market — List all shop items
 * Query params: ?type=Weapon&rarity=Rare
 */
export async function GET(request: Request) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const url = new URL(request.url)
    const type = url.searchParams.get('type')
    const rarity = url.searchParams.get('rarity')

    let query = supabase
        .from('shop_items')
        .select('*')
        .order('price', { ascending: true })

    if (type) query = query.eq('type', type)
    if (rarity) query = query.eq('rarity', rarity)

    const { data: items, error } = await query

    if (error) {
        console.error('[MARKET] List error:', error)
        return NextResponse.json({ error: 'Failed to load shop' }, { status: 500 })
    }

    // Also get user's owned item IDs so we can mark them as "owned"
    const { data: owned } = await supabase
        .from('user_inventory')
        .select('item_id')
        .eq('user_id', user.id)

    const ownedIds = new Set((owned || []).map(o => o.item_id))

    // Get gold balance
    const { data: profile } = await supabase
        .from('users')
        .select('gold_balance')
        .eq('id', user.id)
        .single()

    return NextResponse.json({
        items: (items || []).map(item => ({
            ...item,
            owned: ownedIds.has(item.id),
        })),
        goldBalance: profile?.gold_balance || 0,
    })
}
