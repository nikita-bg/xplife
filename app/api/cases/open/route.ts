/**
 * Case Opening API — POST to open a case
 * POST /api/cases/open { userCaseId: string }
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body: { userCaseId: string }
    try {
        body = await request.json()
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    if (!body.userCaseId) {
        return NextResponse.json({ error: 'userCaseId is required' }, { status: 400 })
    }

    // Verify ownership
    const { data: userCase } = await supabase
        .from('user_cases')
        .select('*, cases(*, drop_table)')
        .eq('id', body.userCaseId)
        .eq('user_id', user.id)
        .single()

    if (!userCase || !userCase.cases) {
        return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }

    const caseData = userCase.cases as {
        id: string
        drop_table: Array<{ item_id: string; weight: number }>
        rarity: string
    }

    // Weighted random selection
    const dropTable = caseData.drop_table
    const totalWeight = dropTable.reduce((sum: number, e: { weight: number }) => sum + e.weight, 0)
    let random = Math.random() * totalWeight
    let selectedItemId = dropTable[0].item_id

    for (const entry of dropTable) {
        random -= entry.weight
        if (random <= 0) {
            selectedItemId = entry.item_id
            break
        }
    }

    // Get item details
    const { data: item } = await supabase
        .from('items')
        .select('*')
        .eq('id', selectedItemId)
        .single()

    if (!item) {
        return NextResponse.json({ error: 'Item not found in catalog' }, { status: 500 })
    }

    // Decrement case quantity or remove
    if (userCase.quantity > 1) {
        await supabase
            .from('user_cases')
            .update({ quantity: userCase.quantity - 1 })
            .eq('id', body.userCaseId)
    } else {
        await supabase.from('user_cases').delete().eq('id', body.userCaseId)
    }

    // Add item to inventory (upsert)
    const { data: existingItem } = await supabase
        .from('user_inventory')
        .select('id, quantity')
        .eq('user_id', user.id)
        .eq('item_id', item.id)
        .single()

    const isNew = !existingItem

    if (existingItem) {
        await supabase
            .from('user_inventory')
            .update({ quantity: existingItem.quantity + 1 })
            .eq('id', existingItem.id)
    } else {
        await supabase.from('user_inventory').insert({
            user_id: user.id,
            item_id: item.id,
            quantity: 1,
            obtained_from: `case_${caseData.rarity}`,
        })
    }

    // Log opening
    await supabase.from('case_openings').insert({
        user_id: user.id,
        case_id: caseData.id,
        item_received: item.id,
    })

    return NextResponse.json({
        success: true,
        item: {
            id: item.id,
            name: item.name,
            rarity: item.rarity,
            type: item.type,
            thumbnail_url: item.thumbnail_url,
            isNew,
        },
    })
}
