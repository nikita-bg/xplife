/**
 * Case Drop System
 * Handles case opening with weighted drop tables and pity mechanics.
 */

import { createClient } from '@/lib/supabase/client'

// ─── Types ──────────────────────────────────────────────────────────────────

export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic'

export interface DropTableEntry {
    item_id: string
    weight: number
    guaranteed?: boolean
}

export interface CaseDropResult {
    itemId: string
    itemName: string
    rarity: Rarity
    isNew: boolean
}

// ─── Drop Rate Tables ───────────────────────────────────────────────────────

export const DROP_RATES: Record<string, Record<Rarity, number>> = {
    daily: {
        common: 60,
        uncommon: 25,
        rare: 12,
        epic: 2.5,
        legendary: 0.4,
        mythic: 0.1,
    },
    weekly: {
        common: 30,
        uncommon: 30,
        rare: 25,
        epic: 10,
        legendary: 4,
        mythic: 1,
    },
    monthly: {
        common: 10,
        uncommon: 20,
        rare: 30,
        epic: 25,
        legendary: 12,
        mythic: 3,
    },
    levelup: {
        common: 20,
        uncommon: 30,
        rare: 30,
        epic: 15,
        legendary: 4,
        mythic: 1,
    },
}

// ─── Quest Completion Rewards ───────────────────────────────────────────────

export interface QuestReward {
    caseType: string | null
    bonusCaseType: string | null
    bonusChance: number
    coinMin: number
    coinMax: number
}

export const QUEST_REWARDS: Record<string, QuestReward> = {
    easy: { caseType: 'daily', bonusCaseType: null, bonusChance: 0, coinMin: 10, coinMax: 25 },
    medium: { caseType: 'daily', bonusCaseType: 'weekly', bonusChance: 0.2, coinMin: 25, coinMax: 50 },
    hard: { caseType: 'weekly', bonusCaseType: 'monthly', bonusChance: 0.15, coinMin: 50, coinMax: 100 },
    epic: { caseType: 'monthly', bonusCaseType: null, bonusChance: 0.1, coinMin: 100, coinMax: 250 },
}

export function getRandomCoinReward(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

// ─── Weighted Random Selection ──────────────────────────────────────────────

function weightedRandom(entries: DropTableEntry[]): DropTableEntry {
    const totalWeight = entries.reduce((sum, e) => sum + e.weight, 0)
    let random = Math.random() * totalWeight
    for (const entry of entries) {
        random -= entry.weight
        if (random <= 0) return entry
    }
    return entries[entries.length - 1]
}

// ─── Pity System ────────────────────────────────────────────────────────────

const PITY_LEGENDARY_THRESHOLD = 50
const PITY_MYTHIC_THRESHOLD = 10

interface PityCounters {
    pity_counter_legendary: number
    pity_counter_mythic: number
}

function applyPity(
    selectedRarity: Rarity,
    counters: PityCounters
): { finalRarity: Rarity; newCounters: PityCounters } {
    const newCounters = { ...counters }

    // Check mythic pity (after N legendaries without mythic)
    if (counters.pity_counter_mythic >= PITY_MYTHIC_THRESHOLD) {
        newCounters.pity_counter_mythic = 0
        newCounters.pity_counter_legendary = 0
        return { finalRarity: 'mythic', newCounters }
    }

    // Check legendary pity (after N opens without legendary)
    if (counters.pity_counter_legendary >= PITY_LEGENDARY_THRESHOLD) {
        newCounters.pity_counter_legendary = 0
        newCounters.pity_counter_mythic += 1
        return { finalRarity: 'legendary', newCounters }
    }

    // Normal drop
    if (selectedRarity === 'legendary') {
        newCounters.pity_counter_legendary = 0
        newCounters.pity_counter_mythic += 1
    } else if (selectedRarity === 'mythic') {
        newCounters.pity_counter_legendary = 0
        newCounters.pity_counter_mythic = 0
    } else {
        newCounters.pity_counter_legendary += 1
    }

    return { finalRarity: selectedRarity, newCounters }
}

// ─── Open Case ──────────────────────────────────────────────────────────────

export async function openCase(
    userId: string,
    userCaseId: string
): Promise<CaseDropResult | null> {
    const supabase = createClient()

    // Get the user case
    const { data: userCase } = await supabase
        .from('user_cases')
        .select('*, cases(*)')
        .eq('id', userCaseId)
        .eq('user_id', userId)
        .single()

    if (!userCase || !userCase.cases) return null

    const caseData = userCase.cases as { id: string; drop_table: DropTableEntry[]; rarity: string }
    const dropTable = caseData.drop_table

    // Get pity counters
    const { data: wallet } = await supabase
        .from('user_wallet')
        .select('pity_counter_legendary, pity_counter_mythic')
        .eq('user_id', userId)
        .single()

    const counters: PityCounters = {
        pity_counter_legendary: wallet?.pity_counter_legendary ?? 0,
        pity_counter_mythic: wallet?.pity_counter_mythic ?? 0,
    }

    // Select item from drop table
    const selected = weightedRandom(dropTable)

    // Get item details
    const { data: item } = await supabase
        .from('items')
        .select('*')
        .eq('id', selected.item_id)
        .single()

    if (!item) return null

    // Apply pity
    const { newCounters } = applyPity(item.rarity as Rarity, counters)

    // Decrement case quantity or remove
    if (userCase.quantity > 1) {
        await supabase
            .from('user_cases')
            .update({ quantity: userCase.quantity - 1 })
            .eq('id', userCaseId)
    } else {
        await supabase.from('user_cases').delete().eq('id', userCaseId)
    }

    // Add item to inventory (upsert: increment quantity if already owned)
    const { data: existingItem } = await supabase
        .from('user_inventory')
        .select('id, quantity')
        .eq('user_id', userId)
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
            user_id: userId,
            item_id: item.id,
            quantity: 1,
            obtained_from: `case_${caseData.rarity}`,
        })
    }

    // Log opening
    await supabase.from('case_openings').insert({
        user_id: userId,
        case_id: caseData.id,
        item_received: item.id,
    })

    // Update pity counters
    await supabase
        .from('user_wallet')
        .upsert({
            user_id: userId,
            pity_counter_legendary: newCounters.pity_counter_legendary,
            pity_counter_mythic: newCounters.pity_counter_mythic,
            updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' })

    // Add coin value from item
    if (item.coin_value > 0) {
        try {
            await supabase.rpc('increment_coins', {
                p_user_id: userId,
                p_amount: item.coin_value,
            })
        } catch {
            // RPC might not exist yet, silently fail
        }
    }

    return {
        itemId: item.id,
        itemName: item.name,
        rarity: item.rarity as Rarity,
        isNew,
    }
}
