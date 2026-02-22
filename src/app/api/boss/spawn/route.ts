import { NextResponse } from 'next/server'
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
 * POST /api/boss/spawn — Spawn a new weekly boss
 * Called by n8n cron (Monday 00:00) or manually for testing
 */
export async function POST(request: Request) {
    // Authenticate via webhook secret
    const authHeader = request.headers.get('authorization')
    const secret = process.env.N8N_WEBHOOK_SECRET

    if (!secret || authHeader !== `Bearer ${secret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()

    // Expire any active bosses
    await supabase
        .from('boss_events')
        .update({ status: 'expired' })
        .eq('status', 'active')

    // Random tier (weighted: more common, less legendary)
    const tier = TIERS[Math.floor(Math.random() * TIERS.length)]
    const names = BOSS_NAMES[tier]
    const name = names[Math.floor(Math.random() * names.length)]

    const hpRange = TIER_HP[tier]
    const hp = Math.floor(Math.random() * (hpRange.max - hpRange.min)) + hpRange.min
    const rewards = TIER_REWARDS[tier]

    const endsAt = new Date()
    endsAt.setDate(endsAt.getDate() + 7) // 7-day duration

    const { data: boss, error } = await supabase
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
        console.error('[BOSS-SPAWN] Error:', error)
        return NextResponse.json({ error: 'Failed to spawn boss' }, { status: 500 })
    }

    return NextResponse.json({ boss, message: `${name} has appeared!` })
}
