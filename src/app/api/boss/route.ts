import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * GET /api/boss — Fetch active boss event + user's contribution
 */
export async function GET() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = createAdminClient()

    // Find active boss
    const { data: boss } = await admin
        .from('boss_events')
        .select('*')
        .eq('status', 'active')
        .order('started_at', { ascending: false })
        .limit(1)
        .single()

    if (!boss) {
        // Check recently defeated
        const { data: recent } = await admin
            .from('boss_events')
            .select('*')
            .eq('status', 'defeated')
            .order('defeated_at', { ascending: false })
            .limit(1)
            .single()

        return NextResponse.json({ boss: recent || null, active: false, contribution: null })
    }

    // Fetch user's contribution (admin to bypass RLS)
    const { data: contribution } = await admin
        .from('boss_contributions')
        .select('*')
        .eq('boss_id', boss.id)
        .eq('user_id', user.id)
        .single()

    // HP percentage
    const hpPercent = boss.max_hp > 0 ? Math.max(0, (boss.current_hp / boss.max_hp) * 100) : 0

    return NextResponse.json({
        boss,
        active: true,
        hpPercent,
        contribution: contribution || { damage_dealt: 0, tasks_completed: 0 },
    })
}

/**
 * POST /api/boss — Deal damage to active boss
 * Called when a user completes a quest
 */
export async function POST(request: Request) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { damage, guildId } = body
        const dmg = Math.max(1, Math.min(damage || 10, 100)) // 1-100 damage cap

        // Find active boss
        const { data: boss } = await supabase
            .from('boss_events')
            .select('*')
            .eq('status', 'active')
            .limit(1)
            .single()

        if (!boss) {
            return NextResponse.json({ error: 'No active boss', active: false }, { status: 404 })
        }

        // Deal damage
        const newHp = Math.max(0, boss.current_hp - dmg)
        const defeated = newHp === 0

        const bossUpdates: Record<string, unknown> = { current_hp: newHp }
        if (defeated) {
            bossUpdates.status = 'defeated'
            bossUpdates.defeated_at = new Date().toISOString()
        }

        await supabase
            .from('boss_events')
            .update(bossUpdates)
            .eq('id', boss.id)

        // Upsert contribution
        const { data: existing } = await supabase
            .from('boss_contributions')
            .select('id, damage_dealt, tasks_completed')
            .eq('boss_id', boss.id)
            .eq('user_id', user.id)
            .single()

        if (existing) {
            await supabase
                .from('boss_contributions')
                .update({
                    damage_dealt: existing.damage_dealt + dmg,
                    tasks_completed: existing.tasks_completed + 1,
                })
                .eq('id', existing.id)
        } else {
            await supabase
                .from('boss_contributions')
                .insert({
                    boss_id: boss.id,
                    user_id: user.id,
                    guild_id: guildId || null,
                    damage_dealt: dmg,
                    tasks_completed: 1,
                })
        }

        // If defeated, distribute rewards
        if (defeated) {
            await distributeRewards(supabase, boss.id, boss.xp_reward, boss.gold_reward)
        }

        return NextResponse.json({
            damage: dmg,
            newHp,
            defeated,
            bossId: boss.id,
        })
    } catch {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function distributeRewards(supabase: any, bossId: string, totalXp: number, totalGold: number) {
    // Fetch all contributors
    const { data: contributors } = await supabase
        .from('boss_contributions')
        .select('user_id, damage_dealt')
        .eq('boss_id', bossId)

    if (!contributors?.length) return

    const totalDamage = contributors.reduce((sum: number, c: { damage_dealt: number }) => sum + c.damage_dealt, 0)

    for (const contributor of contributors) {
        const ratio = totalDamage > 0 ? contributor.damage_dealt / totalDamage : 1 / contributors.length
        const xpReward = Math.round(totalXp * ratio)
        const goldReward = Math.round(totalGold * ratio)

        // Update user XP and gold
        const { data: profile } = await supabase
            .from('users')
            .select('total_xp, gold_balance')
            .eq('id', contributor.user_id)
            .single()

        if (profile) {
            await supabase
                .from('users')
                .update({
                    total_xp: (profile.total_xp || 0) + xpReward,
                    gold_balance: (profile.gold_balance || 0) + goldReward,
                })
                .eq('id', contributor.user_id)
        }

        // Log XP
        await supabase.from('xp_logs').insert({
            user_id: contributor.user_id,
            amount: xpReward,
            source: 'boss_defeat',
            task_id: null,
        })
    }
}
