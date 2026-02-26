import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { QuestTimeframe, TaskStatus } from '@/lib/types'

/**
 * GET /api/tasks — Fetch tasks for the authenticated user
 * Query params: timeframe, status, limit
 */
export async function GET(request: Request) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') as QuestTimeframe | null
    const status = searchParams.get('status') as TaskStatus | null
    const limit = parseInt(searchParams.get('limit') || '50', 10)

    let query = supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(Math.min(limit, 100))

    const includeHistory = searchParams.get('includeHistory') === 'true'

    if (timeframe) {
        query = query.eq('quest_timeframe', timeframe)

        if (!includeHistory) {
            // Filter to current period only — prevents expired quests from showing
            const now = new Date()
            let periodStart: string

            if (timeframe === 'daily') {
                periodStart = `${now.toISOString().split('T')[0]}T00:00:00`
            } else if (timeframe === 'weekly') {
                const dow = now.getDay()
                const monOffset = dow === 0 ? 6 : dow - 1
                const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - monOffset)
                monday.setHours(0, 0, 0, 0)
                periodStart = monday.toISOString()
            } else if (timeframe === 'monthly') {
                periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
            } else {
                // yearly — filter to current year
                periodStart = new Date(now.getFullYear(), 0, 1).toISOString()
            }

            query = query.gte('created_at', periodStart)
        }
    }

    if (status) {
        query = query.eq('status', status)
    }

    const { data: tasks, error } = await query

    if (error) {
        console.error('[TASKS] Fetch error:', error)
        return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
    }

    return NextResponse.json({ tasks: tasks || [] })
}

/**
 * POST /api/tasks — Create a manual task
 */
export async function POST(request: Request) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { title, description, category, difficulty, xp_reward, quest_timeframe, parent_quest_id } = body

        if (!title?.trim()) {
            return NextResponse.json({ error: 'Title is required' }, { status: 400 })
        }

        const { data: task, error } = await supabase
            .from('tasks')
            .insert({
                user_id: user.id,
                title: title.trim(),
                description: description?.trim() || null,
                category: category || 'productivity',
                difficulty: difficulty || 'medium',
                xp_reward: xp_reward || 50,
                status: 'pending',
                quest_timeframe: quest_timeframe || 'daily',
                parent_quest_id: parent_quest_id || null,
            })
            .select()
            .single()

        if (error) {
            console.error('[TASKS] Insert error:', error)
            return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
        }

        return NextResponse.json({ task })
    } catch {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
}

/**
 * PATCH /api/tasks — Update task status (complete/skip)
 */
export async function PATCH(request: Request) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { id, status, proof_url } = body

        if (!id) {
            return NextResponse.json({ error: 'Task ID is required' }, { status: 400 })
        }

        // ── Double-completion guard ──
        if (status === 'completed') {
            const { data: existingTask } = await supabase
                .from('tasks')
                .select('status')
                .eq('id', id)
                .eq('user_id', user.id)
                .single()

            if (existingTask?.status === 'completed') {
                return NextResponse.json({ error: 'Quest already completed' }, { status: 409 })
            }
        }

        const updates: Record<string, unknown> = { status }

        if (status === 'completed') {
            updates.completed_at = new Date().toISOString()
        }

        if (proof_url) {
            updates.proof_url = proof_url
        }

        const { data: task, error } = await supabase
            .from('tasks')
            .update(updates)
            .eq('id', id)
            .eq('user_id', user.id)
            .select()
            .single()

        if (error) {
            console.error('[TASKS] Update error:', error)
            return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
        }

        // ── Award XP on completion ──
        if (status === 'completed' && task) {
            const xpAmount = task.xp_reward || 50

            // ── Gold reward based on difficulty ──
            const difficultyGold: Record<string, number> = { easy: 5, medium: 10, hard: 20, epic: 35 }
            const goldAmount = difficultyGold[task.difficulty] || 8

            // Update user total XP + gold balance
            const { data: profile } = await supabase
                .from('users')
                .select('total_xp, gold_balance')
                .eq('id', user.id)
                .single()

            if (profile) {
                await supabase
                    .from('users')
                    .update({
                        total_xp: (profile.total_xp || 0) + xpAmount,
                        gold_balance: (profile.gold_balance || 0) + goldAmount,
                    })
                    .eq('id', user.id)
            }

            // Log XP
            await supabase.from('xp_logs').insert({
                user_id: user.id,
                amount: xpAmount,
                source: 'quest_completion',
                task_id: id,
            })

            // ── Update level from total XP ──
            const { getLevelFromTotalXP } = await import('@/lib/xpUtils')
            const newTotalXP = (profile?.total_xp || 0) + xpAmount
            const newLevel = getLevelFromTotalXP(newTotalXP)
            if (profile && newLevel !== profile.total_xp) {
                await supabase
                    .from('users')
                    .update({ level: newLevel })
                    .eq('id', user.id)
            }

            // ── Update streak ──
            const today = new Date().toISOString().split('T')[0]
            const { data: streak } = await supabase
                .from('streaks')
                .select('*')
                .eq('user_id', user.id)
                .single()

            if (streak) {
                const lastDate = streak.last_activity_date
                if (lastDate !== today) {
                    let newStreak = 1
                    if (lastDate) {
                        const last = new Date(lastDate + 'T00:00:00')
                        const todayDate = new Date(today + 'T00:00:00')
                        const diffDays = Math.round((todayDate.getTime() - last.getTime()) / (1000 * 60 * 60 * 24))
                        if (diffDays === 1) {
                            newStreak = (streak.current_streak || 0) + 1
                        }
                        // diffDays > 1 means streak broken, reset to 1
                    }
                    const newLongest = Math.max(streak.longest_streak || 0, newStreak)
                    await supabase
                        .from('streaks')
                        .update({
                            current_streak: newStreak,
                            longest_streak: newLongest,
                            last_activity_date: today,
                            updated_at: new Date().toISOString(),
                        })
                        .eq('user_id', user.id)
                }
            } else {
                // Create streak record if it doesn't exist
                await supabase.from('streaks').insert({
                    user_id: user.id,
                    current_streak: 1,
                    longest_streak: 1,
                    last_activity_date: today,
                })
            }

            // ── Auto-deal boss damage ──
            const difficultyDamage: Record<string, number> = { easy: 10, medium: 20, hard: 35, epic: 50 }
            const damage = difficultyDamage[task.difficulty] || 15

            const { data: activeBoss } = await supabase
                .from('boss_events')
                .select('id, current_hp, max_hp, xp_reward, gold_reward')
                .eq('status', 'active')
                .limit(1)
                .single()

            if (activeBoss) {
                const newHp = Math.max(0, activeBoss.current_hp - damage)
                const defeated = newHp === 0

                const bossUpdates: Record<string, unknown> = { current_hp: newHp }
                if (defeated) {
                    bossUpdates.status = 'defeated'
                    bossUpdates.defeated_at = new Date().toISOString()
                }

                await supabase.from('boss_events').update(bossUpdates).eq('id', activeBoss.id)

                // Upsert contribution
                const { data: existingContrib } = await supabase
                    .from('boss_contributions')
                    .select('id, damage_dealt, tasks_completed')
                    .eq('boss_id', activeBoss.id)
                    .eq('user_id', user.id)
                    .single()

                if (existingContrib) {
                    await supabase.from('boss_contributions').update({
                        damage_dealt: existingContrib.damage_dealt + damage,
                        tasks_completed: existingContrib.tasks_completed + 1,
                    }).eq('id', existingContrib.id)
                } else {
                    await supabase.from('boss_contributions').insert({
                        boss_id: activeBoss.id,
                        user_id: user.id,
                        damage_dealt: damage,
                        tasks_completed: 1,
                    })
                }
            }
        }

        return NextResponse.json({ task })
    } catch {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
}
