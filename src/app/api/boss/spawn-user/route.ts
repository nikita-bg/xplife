import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const BOSS_NAMES: Record<string, string[]> = {
    common: ['Void Crawler', 'Shadow Rat', 'Dust Fiend', 'Iron Golem'],
    uncommon: ['Flame Serpent', 'Storm Wraith', 'Frost Giant', 'Stone Colossus'],
    rare: ['Crystal Dragon', 'Temporal Lich', 'Void Leviathan', 'Thunder Phoenix'],
    epic: ['Chaos Hydra', 'Nebula Titan', 'World Eater', 'Astral Behemoth'],
    legendary: ['Chronos the Timeless', 'Oblivion Prime', 'The Architect', 'Entropy Incarnate'],
}

const TIER_HP: Record<string, { min: number; max: number }> = {
    common: { min: 500, max: 1000 },
    uncommon: { min: 1000, max: 2000 },
    rare: { min: 2000, max: 5000 },
    epic: { min: 5000, max: 10000 },
    legendary: { min: 10000, max: 25000 },
}

const TIER_REWARDS: Record<string, { xp: number; gold: number }> = {
    common: { xp: 300, gold: 50 },
    uncommon: { xp: 500, gold: 100 },
    rare: { xp: 1000, gold: 200 },
    epic: { xp: 2500, gold: 500 },
    legendary: { xp: 5000, gold: 1000 },
}

const TIERS = ['common', 'common', 'common', 'uncommon', 'uncommon', 'rare', 'rare', 'epic', 'legendary']

/**
 * POST /api/boss/spawn-user — Spawn a boss (authenticated user)
 */
export async function POST() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = createAdminClient()

    // Check if there's already an active boss
    const { data: existing } = await admin
        .from('boss_events')
        .select('id')
        .eq('status', 'active')
        .limit(1)
        .single()

    if (existing) {
        return NextResponse.json({ error: 'A boss is already active', active: true }, { status: 409 })
    }

    // Random tier (weighted)
    const tier = TIERS[Math.floor(Math.random() * TIERS.length)]
    const names = BOSS_NAMES[tier]
    const name = names[Math.floor(Math.random() * names.length)]

    const hpRange = TIER_HP[tier]
    const hp = Math.floor(Math.random() * (hpRange.max - hpRange.min)) + hpRange.min
    const rewards = TIER_REWARDS[tier]

    const endsAt = new Date()
    endsAt.setDate(endsAt.getDate() + 7)

    const { data: boss, error } = await admin
        .from('boss_events')
        .insert({
            name,
            description: `A ${tier} tier boss has appeared! Rally your heroes and defeat it before the week ends.`,
            tier,
            max_hp: hp,
            current_hp: hp,
            xp_reward: rewards.xp,
            gold_reward: rewards.gold,
            status: 'active',
            ends_at: endsAt.toISOString(),
        })
        .select()
        .single()

    if (error) {
        console.error('[BOSS-SPAWN-USER] Error:', error)
        return NextResponse.json({ error: 'Failed to spawn boss', details: error.message }, { status: 500 })
    }

    return NextResponse.json({ boss, message: `${name} has appeared!` })
}
