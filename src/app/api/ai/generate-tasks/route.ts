import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { aggregateQuestHistory, calculateCategoryStats } from '@/lib/quest-history'
import { calculateAdaptiveDifficulty } from '@/lib/adaptive-difficulty'
import { getClassFlavorProfile } from '@/lib/class-flavoring'
import { checkWeeklyTaskLimit, checkYearlyQuestLimit } from '@/lib/rate-limiter'
import type { QuestTimeframe, PersonalityType } from '@/lib/types'

export const maxDuration = 60

const LOCALE_TO_LANGUAGE: Record<string, string> = {
    en: 'English',
    bg: 'Bulgarian',
    es: 'Spanish',
    zh: 'Chinese',
    ja: 'Japanese',
}

const PERSONALITY_TASK_LIMITS: Record<PersonalityType, Record<QuestTimeframe, { min: number; max: number }>> = {
    dopamine: { yearly: { min: 1, max: 3 }, monthly: { min: 3, max: 4 }, weekly: { min: 5, max: 7 }, daily: { min: 4, max: 6 } },
    acetylcholine: { yearly: { min: 1, max: 3 }, monthly: { min: 2, max: 3 }, weekly: { min: 3, max: 4 }, daily: { min: 2, max: 3 } },
    gaba: { yearly: { min: 1, max: 3 }, monthly: { min: 2, max: 3 }, weekly: { min: 3, max: 5 }, daily: { min: 3, max: 4 } },
    serotonin: { yearly: { min: 1, max: 3 }, monthly: { min: 3, max: 4 }, weekly: { min: 4, max: 5 }, daily: { min: 3, max: 5 } },
}

const DEFAULT_TASK_LIMITS: Record<QuestTimeframe, { min: number; max: number }> = {
    yearly: { min: 1, max: 3 },
    monthly: { min: 3, max: 5 },
    weekly: { min: 5, max: 7 },
    daily: { min: 3, max: 5 },
}

function getTaskLimits(timeframe: QuestTimeframe, personalityType?: string | null): { min: number; max: number } {
    if (personalityType && personalityType in PERSONALITY_TASK_LIMITS) {
        return PERSONALITY_TASK_LIMITS[personalityType as PersonalityType][timeframe]
    }
    return DEFAULT_TASK_LIMITS[timeframe]
}

export async function POST(request: Request) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let userGoals: string | undefined
    let questTimeframe: QuestTimeframe = 'daily'
    let parentQuestId: string | undefined
    let parentQuestIds: string[] | undefined
    let generationMode: 'manual' | 'from-parent' | 'cascade' = 'manual'
    let locale = 'en'

    try {
        const body = await request.json()
        userGoals = body.goals
        questTimeframe = body.questTimeframe || 'daily'
        parentQuestId = body.parentQuestId
        parentQuestIds = body.parentQuestIds
        generationMode = body.generationMode || 'manual'
        locale = body.locale || 'en'
    } catch {
        // no body or invalid JSON
    }

    const language = LOCALE_TO_LANGUAGE[locale] || 'English'
    const ts = new Date().toISOString()
    console.log(`[TASK-GEN ${ts}] Started for user:`, user.id, 'timeframe:', questTimeframe, 'mode:', generationMode)

    // ── Check webhook config ──
    const webhookUrl = process.env.N8N_WEBHOOK_URL
    if (!webhookUrl) {
        console.error(`[TASK-GEN ${ts}] N8N_WEBHOOK_URL not set`)
        return NextResponse.json({ error: 'AI task generation not configured yet' }, { status: 503 })
    }

    // ── Fetch user profile ──
    const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

    if (profileError || !profile) {
        console.error(`[TASK-GEN ${ts}] No profile:`, profileError)
        return NextResponse.json({ error: 'User profile not found. Complete your profile setup.' }, { status: 404 })
    }

    // ── Rate Limiting: Weekly task limit ──
    const weeklyLimit = await checkWeeklyTaskLimit(user.id, profile.plan, supabase)
    if (!weeklyLimit.allowed) {
        return NextResponse.json(
            { error: `Weekly limit reached (${weeklyLimit.current}/${weeklyLimit.limit}). Upgrade for unlimited.`, upgrade: true },
            { status: 429 }
        )
    }

    // ── Rate Limiting: Yearly quest limit ──
    if (questTimeframe === 'yearly') {
        const yearlyLimit = await checkYearlyQuestLimit(user.id, profile.plan, supabase)
        if (!yearlyLimit.allowed) {
            return NextResponse.json(
                { error: `Maximum of ${yearlyLimit.limit} yearly quests reached` },
                { status: 400 }
            )
        }
    }

    // ── Duplicate generation guard ──
    if (questTimeframe !== 'yearly') {
        let periodStart: string
        const now = new Date()

        if (questTimeframe === 'daily') {
            periodStart = `${now.toISOString().split('T')[0]}T00:00:00`
        } else if (questTimeframe === 'weekly') {
            const dow = now.getDay()
            const monOffset = dow === 0 ? 6 : dow - 1
            const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - monOffset)
            monday.setHours(0, 0, 0, 0)
            periodStart = monday.toISOString()
        } else {
            periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
        }

        const { count: existingCount } = await supabase
            .from('tasks')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('quest_timeframe', questTimeframe)
            .neq('status', 'skipped')
            .gte('created_at', periodStart)

        if ((existingCount ?? 0) > 0) {
            console.log(`[TASK-GEN ${ts}] Duplicate guard: ${existingCount} ${questTimeframe} tasks already exist`)
            return NextResponse.json({ success: true, count: 0, alreadyExists: true })
        }
    }

    // ── Fetch goals ──
    const { data: goals } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)

    // ── Fetch recent tasks ──
    const { data: recentTasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)

    // ── Fetch parent quest(s) ──
    let parentQuest = null
    let parentQuests: typeof parentQuest[] = []

    if (parentQuestIds?.length && generationMode === 'cascade') {
        const { data } = await supabase
            .from('tasks')
            .select('*')
            .in('id', parentQuestIds)
            .eq('user_id', user.id)
        parentQuests = data || []
    } else if (parentQuestId && generationMode === 'from-parent') {
        const { data } = await supabase
            .from('tasks')
            .select('*')
            .eq('id', parentQuestId)
            .eq('user_id', user.id)
            .single()
        parentQuest = data
    }

    // ── NEW: Quest History Aggregation (30 days) ──
    console.log(`[TASK-GEN ${ts}] Aggregating 30-day quest history...`)
    const questHistory = await aggregateQuestHistory(user.id, supabase, 30)
    console.log(`[TASK-GEN ${ts}] Quest history: ${questHistory.totalCompleted} completed, ${questHistory.totalSkipped} skipped, rate: ${(questHistory.overallCompletionRate * 100).toFixed(0)}%`)

    // ── NEW: Adaptive Difficulty ──
    const difficultyHint = calculateAdaptiveDifficulty(questHistory)
    console.log(`[TASK-GEN ${ts}] Difficulty hint: ${difficultyHint.recommendation} — ${difficultyHint.reasoning}`)

    // ── NEW: Class-Based Flavor Profile ──
    const classProfile = getClassFlavorProfile(profile.personality_type)
    console.log(`[TASK-GEN ${ts}] Class: ${classProfile.displayName} (${classProfile.className})`)

    // ── Category stats (all-time) ──
    const categoryAnalytics = await calculateCategoryStats(user.id, supabase)

    // ── Fetch interests ──
    const { data: interests } = await supabase
        .from('user_interests')
        .select('interest')
        .eq('user_id', user.id)

    // ── Fetch feedback ──
    const { data: feedbackHistory } = await supabase
        .from('task_feedback')
        .select('*, tasks(category, title)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)

    // ── Calculate category preferences from feedback ──
    const categoryPreferences: Record<string, { avgEnjoyment: number; avgDifficulty: number; count: number }> = {}
    if (feedbackHistory?.length) {
        const feedbackByCategory: Record<string, Array<{ enjoyment: number; difficulty: number }>> = {}
        for (const fb of feedbackHistory) {
            const category = (fb.tasks as { category?: string })?.category
            if (category && fb.enjoyment_score && fb.difficulty_rating) {
                if (!feedbackByCategory[category]) feedbackByCategory[category] = []
                feedbackByCategory[category].push({ enjoyment: fb.enjoyment_score, difficulty: fb.difficulty_rating })
            }
        }
        for (const [category, feedbacks] of Object.entries(feedbackByCategory)) {
            categoryPreferences[category] = {
                avgEnjoyment: feedbacks.reduce((s, f) => s + f.enjoyment, 0) / feedbacks.length,
                avgDifficulty: feedbacks.reduce((s, f) => s + f.difficulty, 0) / feedbacks.length,
                count: feedbacks.length,
            }
        }
    }

    const limits = getTaskLimits(questTimeframe, profile.personality_type)

    try {
        const webhookHeaders: Record<string, string> = { 'Content-Type': 'application/json' }
        const webhookSecret = process.env.N8N_WEBHOOK_SECRET
        if (webhookSecret) {
            webhookHeaders['X-Webhook-Secret'] = webhookSecret
        }

        const requestPayload = {
            userId: user.id,
            personalityType: profile.personality_type,
            level: profile.level,
            goals: goals ?? [],
            recentTasks: recentTasks ?? [],
            userGoals: userGoals || '',
            questTimeframe,
            generationMode,
            locale,
            language,
            parentQuest,
            parentQuests: parentQuests.length > 0 ? parentQuests : undefined,
            neurotransmitterScores: {
                dopamine: profile.dopamine_score ?? 0,
                acetylcholine: profile.acetylcholine_score ?? 0,
                gaba: profile.gaba_score ?? 0,
                serotonin: profile.serotonin_score ?? 0,
            },
            taskCount: { min: limits.min, max: limits.max },
            // Personalization (existing)
            categoryStats: categoryAnalytics.categoryStats,
            bestCategory: categoryAnalytics.bestCategory,
            strugglingCategory: categoryAnalytics.strugglingCategory,
            timePreference: profile.time_preference || null,
            bestFocusTimes: profile.best_focus_times || null,
            preferredTaskDuration: profile.preferred_task_duration || null,
            occupation: profile.occupation_type || null,
            workSchedule: profile.work_schedule || null,
            lifePhase: profile.life_phase || null,
            mainChallenge: profile.main_challenge || null,
            aboutMe: profile.about_me || null,
            interests: interests?.map(i => i.interest) || [],
            recentFeedback: feedbackHistory || [],
            categoryPreferences,
            // ── NEW Phase 1 fields ──
            questHistory,
            difficultyHint,
            classProfile: {
                className: classProfile.className,
                displayName: classProfile.displayName,
                questStyle: classProfile.questStyle,
                tone: classProfile.tone,
                priorityCategories: classProfile.priorityCategories,
                questPrefixes: classProfile.questPrefixes,
            },
        }

        console.log(`[TASK-GEN ${ts}] Calling N8N webhook...`)

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 55_000)

        let response: Response
        try {
            response = await fetch(webhookUrl, {
                method: 'POST',
                headers: webhookHeaders,
                body: JSON.stringify(requestPayload),
                signal: controller.signal,
            })
        } catch (fetchErr) {
            clearTimeout(timeoutId)
            const isTimeout = fetchErr instanceof Error && fetchErr.name === 'AbortError'
            console.error(`[TASK-GEN ${ts}] Fetch failed:`, isTimeout ? 'TIMEOUT' : fetchErr)
            return NextResponse.json(
                {
                    error: isTimeout
                        ? 'AI generation timed out. The service may be busy — please try again.'
                        : 'Could not reach AI service. Please try again in a few moments.'
                },
                { status: 503 }
            )
        }
        clearTimeout(timeoutId)

        if (!response.ok) {
            const errorText = await response.text()
            console.error(`[TASK-GEN ${ts}] N8N webhook failed (${response.status}):`, errorText)
            return NextResponse.json(
                { error: 'AI service temporarily unavailable. Please try again in a few moments.' },
                { status: 503 }
            )
        }

        // ── Parse response ──
        let raw: unknown
        const responseText = await response.text()
        console.log(`[TASK-GEN ${ts}] N8N raw response:`, responseText.substring(0, 500))

        try {
            raw = JSON.parse(responseText)
        } catch {
            console.error(`[TASK-GEN ${ts}] N8N response not valid JSON`)
            return NextResponse.json({ error: 'AI service returned invalid response. Please try again.' }, { status: 503 })
        }

        type TaskItem = { title: string; description?: string; category: string; difficulty?: string; xp_reward?: number }
        let tasks: TaskItem[] = []

        try {
            let content: unknown = raw

            if (Array.isArray(raw) && raw.length > 0) {
                const first = raw[0]
                if (first?.message?.content) content = first.message.content
                else if (first?.output) content = first.output
                else if (first?.text) content = first.text
            }

            const extractJson = (str: string): string => {
                const fenceMatch = str.match(/```(?:json)?\s*([\s\S]*?)```/)
                return fenceMatch ? fenceMatch[1].trim() : str.trim()
            }

            if (typeof content === 'string') {
                const cleaned = extractJson(content)
                const parsed = JSON.parse(cleaned)
                tasks = parsed.tasks || []
            } else if (typeof content === 'object' && content !== null && 'tasks' in content) {
                tasks = (content as { tasks: TaskItem[] }).tasks || []
            }
        } catch (parseErr) {
            console.error(`[TASK-GEN ${ts}] Failed to parse tasks:`, parseErr, raw)
        }

        console.log(`[TASK-GEN ${ts}] Parsed ${tasks.length} tasks`)

        if (tasks.length > 0) {
            const taskInserts = tasks.map(task => ({
                user_id: user.id,
                title: task.title,
                description: task.description ?? null,
                category: task.category,
                difficulty: task.difficulty ?? 'medium',
                xp_reward: task.xp_reward ?? 50,
                status: 'pending',
                quest_timeframe: questTimeframe,
                parent_quest_id: generationMode === 'cascade' ? null : (parentQuestId ?? null),
            }))

            const { error: insertError } = await supabase.from('tasks').insert(taskInserts)

            if (insertError) {
                console.error(`[TASK-GEN ${ts}] Insert failed:`, insertError)
                return NextResponse.json({ error: 'Database error while saving tasks. Please try again.' }, { status: 500 })
            }

            console.log(`[TASK-GEN ${ts}] Inserted ${taskInserts.length} tasks`)
        } else {
            console.warn(`[TASK-GEN ${ts}] No tasks generated`)
            return NextResponse.json(
                { error: 'AI could not generate tasks for this request. Try rephrasing your goals.' },
                { status: 422 }
            )
        }

        return NextResponse.json({ success: true, count: tasks.length })
    } catch (error) {
        const isDev = process.env.NODE_ENV !== 'production'
        console.error(`[TASK-GEN ${ts}] Error:`, error)

        const isNetworkError = error instanceof Error && (
            error.message.includes('fetch') ||
            error.message.includes('network') ||
            error.message.includes('ECONNREFUSED') ||
            error.message.includes('timeout')
        )

        return NextResponse.json(
            {
                error: isNetworkError
                    ? 'Could not reach AI service. Please try again in a few moments.'
                    : 'Failed to generate tasks. Please try again.',
                ...(isDev && { details: error instanceof Error ? error.message : String(error) })
            },
            { status: isNetworkError ? 503 : 500 }
        )
    }
}
