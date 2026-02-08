import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getPlanLimits } from '@/lib/plan-limits'
import type { QuestTimeframe } from '@/lib/types'

const TASK_LIMITS: Record<QuestTimeframe, { min: number; max: number }> = {
  yearly: { min: 1, max: 3 },
  monthly: { min: 3, max: 5 },
  weekly: { min: 5, max: 7 },
  daily: { min: 3, max: 5 },
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
  let generationMode: 'manual' | 'from-parent' = 'manual'

  try {
    const body = await request.json()
    userGoals = body.goals
    questTimeframe = body.questTimeframe || 'daily'
    parentQuestId = body.parentQuestId
    generationMode = body.generationMode || 'manual'
  } catch {
    // no body or invalid JSON — that's fine, we'll use DB goals
  }

  const timestamp = new Date().toISOString()
  console.log(`[TASK-GEN ${timestamp}] Started for user:`, user.id, 'timeframe:', questTimeframe, 'mode:', generationMode)

  const webhookUrl = process.env.N8N_WEBHOOK_URL
  console.log(`[TASK-GEN ${timestamp}] N8N_WEBHOOK_URL:`, webhookUrl ? 'CONFIGURED' : 'MISSING')
  if (!webhookUrl) {
    console.error(`[TASK-GEN ${timestamp}] N8N_WEBHOOK_URL environment variable is not set`)
    return NextResponse.json(
      { error: 'AI task generation not configured yet' },
      { status: 503 }
    )
  }

  // Fetch user context
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    console.error(`[TASK-GEN ${timestamp}] No profile found for user:`, user.id, 'error:', profileError)
    return NextResponse.json(
      { error: 'User profile not found. Please complete your profile setup.' },
      { status: 404 }
    )
  }

  console.log(`[TASK-GEN ${timestamp}] Profile loaded:`, { plan: profile.plan, level: profile.level })

  const planLimits = getPlanLimits(profile?.plan)

  // Enforce weekly task generation limit for free users
  if (planLimits.maxTasksPerWeek !== -1) {
    const now = new Date()
    const dayOfWeek = now.getDay()
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - mondayOffset)
    startOfWeek.setHours(0, 0, 0, 0)

    const { count: weeklyCount, error: countError } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', startOfWeek.toISOString())

    if (countError) {
      console.error(`[TASK-GEN ${timestamp}] Failed to check weekly count:`, countError)
      return NextResponse.json(
        { error: 'Database error while checking limits. Please try again.' },
        { status: 500 }
      )
    }

    console.log(`[TASK-GEN ${timestamp}] Weekly task count:`, weeklyCount, '/', planLimits.maxTasksPerWeek)

    if ((weeklyCount ?? 0) >= planLimits.maxTasksPerWeek) {
      console.log(`[TASK-GEN ${timestamp}] Weekly limit reached for user:`, user.id)
      return NextResponse.json(
        { error: `Weekly limit reached (${weeklyCount}/${planLimits.maxTasksPerWeek}). Upgrade for unlimited.`, upgrade: true },
        { status: 429 }
      )
    }
  }

  // For yearly quests, check existing count using plan-based cap
  if (questTimeframe === 'yearly') {
    const { count, error: yearlyCountError } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('quest_timeframe', 'yearly')
      .neq('status', 'skipped')

    if (yearlyCountError) {
      console.error(`[TASK-GEN ${timestamp}] Failed to check yearly count:`, yearlyCountError)
      return NextResponse.json(
        { error: 'Database error while checking yearly quest limits. Please try again.' },
        { status: 500 }
      )
    }

    console.log(`[TASK-GEN ${timestamp}] Yearly quest count:`, count, '/', planLimits.maxYearlyQuests)

    if ((count ?? 0) >= planLimits.maxYearlyQuests) {
      console.log(`[TASK-GEN ${timestamp}] Yearly quest limit reached for user:`, user.id)
      return NextResponse.json(
        { error: `Maximum of ${planLimits.maxYearlyQuests} yearly quests reached` },
        { status: 400 }
      )
    }
  }

  const { data: goals, error: goalsError } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', user.id)

  if (goalsError) {
    console.error(`[TASK-GEN ${timestamp}] Failed to fetch goals:`, goalsError)
  }

  console.log(`[TASK-GEN ${timestamp}] Loaded ${goals?.length ?? 0} goals`)

  const { data: recentTasks, error: tasksError } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  if (tasksError) {
    console.error(`[TASK-GEN ${timestamp}] Failed to fetch recent tasks:`, tasksError)
  }

  console.log(`[TASK-GEN ${timestamp}] Loaded ${recentTasks?.length ?? 0} recent tasks`)

  // Fetch parent quest if generating from parent
  let parentQuest = null
  if (parentQuestId && generationMode === 'from-parent') {
    const { data, error: parentError } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', parentQuestId)
      .eq('user_id', user.id)
      .single()

    if (parentError) {
      console.error(`[TASK-GEN ${timestamp}] Failed to fetch parent quest:`, parentQuestId, parentError)
    } else {
      console.log(`[TASK-GEN ${timestamp}] Loaded parent quest:`, parentQuestId)
    }

    parentQuest = data
  }

  const limits = TASK_LIMITS[questTimeframe]

  try {
    const webhookHeaders: Record<string, string> = { 'Content-Type': 'application/json' }
    const webhookSecret = process.env.N8N_WEBHOOK_SECRET
    if (webhookSecret) {
      webhookHeaders['X-Webhook-Secret'] = webhookSecret
      console.log(`[TASK-GEN ${timestamp}] Webhook secret is configured`)
    } else {
      console.warn(`[TASK-GEN ${timestamp}] Webhook secret is NOT configured`)
    }

    const requestPayload = {
      userId: user.id,
      personalityType: profile?.personality_type,
      level: profile?.level,
      goals: goals ?? [],
      recentTasks: recentTasks ?? [],
      userGoals: userGoals || '',
      questTimeframe,
      generationMode,
      parentQuest,
      neurotransmitterScores: {
        dopamine: profile?.dopamine_score ?? 0,
        acetylcholine: profile?.acetylcholine_score ?? 0,
        gaba: profile?.gaba_score ?? 0,
        serotonin: profile?.serotonin_score ?? 0,
      },
      taskCount: { min: limits.min, max: limits.max },
    }

    console.log(`[TASK-GEN ${timestamp}] Calling N8N webhook:`, webhookUrl)
    console.log(`[TASK-GEN ${timestamp}] Request payload:`, JSON.stringify(requestPayload).substring(0, 200))

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: webhookHeaders,
      body: JSON.stringify(requestPayload),
    })

    console.log(`[TASK-GEN ${timestamp}] Fetch completed, status:`, response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[TASK-GEN ${timestamp}] N8N webhook failed with status ${response.status}:`, errorText)
      console.error(`[TASK-GEN ${timestamp}] Response headers:`, JSON.stringify(Object.fromEntries(response.headers.entries())))
      return NextResponse.json(
        { error: 'AI service temporarily unavailable. Please try again in a few moments.' },
        { status: 503 }
      )
    }

    console.log(`[TASK-GEN ${timestamp}] N8N webhook responded successfully with status:`, response.status)

    let raw: unknown
    const responseText = await response.text()
    console.log(`[TASK-GEN ${timestamp}] N8N tasks raw response:`, responseText.substring(0, 500))
    try {
      raw = JSON.parse(responseText)
    } catch (jsonError) {
      console.error(`[TASK-GEN ${timestamp}] N8N response is not valid JSON:`, responseText.substring(0, 200), jsonError)
      return NextResponse.json(
        { error: 'AI service returned invalid response. Please try again.' },
        { status: 503 }
      )
    }

    type TaskItem = { title: string; description?: string; category: string; difficulty?: string; xp_reward?: number }
    let tasks: TaskItem[] = []
    try {
      // Extract content string from various N8N response formats
      let content: unknown = raw

      if (Array.isArray(raw) && raw.length > 0) {
        const first = raw[0]
        if (first?.message?.content) {
          content = first.message.content
        } else if (first?.output) {
          content = first.output
        }
      }

      if (typeof content === 'string') {
        const parsed = JSON.parse(content)
        tasks = parsed.tasks || []
      } else if (typeof content === 'object' && content !== null && 'tasks' in content) {
        tasks = (content as { tasks: TaskItem[] }).tasks || []
      }
    } catch (parseErr) {
      console.error(`[TASK-GEN ${timestamp}] Failed to parse N8N tasks response:`, parseErr, raw)
    }

    console.log(`[TASK-GEN ${timestamp}] Parsed ${tasks.length} tasks from N8N response`)

    if (tasks.length > 0) {
      const taskInserts = tasks.map((task) => ({
        user_id: user.id,
        title: task.title,
        description: task.description ?? null,
        category: task.category,
        difficulty: task.difficulty ?? 'medium',
        xp_reward: task.xp_reward ?? 50,
        status: 'pending',
        quest_timeframe: questTimeframe,
        parent_quest_id: parentQuestId ?? null,
      }))

      console.log(`[TASK-GEN ${timestamp}] Inserting ${taskInserts.length} tasks into database`)

      const { error: insertError } = await supabase.from('tasks').insert(taskInserts)

      if (insertError) {
        console.error(`[TASK-GEN ${timestamp}] Failed to insert tasks:`, insertError)
        return NextResponse.json(
          { error: 'Database error while saving tasks. Please try again.' },
          { status: 500 }
        )
      }

      console.log(`[TASK-GEN ${timestamp}] Successfully inserted ${taskInserts.length} tasks`)
    } else {
      console.warn(`[TASK-GEN ${timestamp}] No tasks generated by N8N`)
    }

    return NextResponse.json({ success: true, count: tasks.length })
  } catch (error) {
    const isDev = process.env.NODE_ENV !== 'production'
    console.error(`[TASK-GEN ${timestamp}] AI task generation error:`, error)

    // Log detailed error information
    if (error instanceof Error) {
      console.error(`[TASK-GEN ${timestamp}] Error name:`, error.name)
      console.error(`[TASK-GEN ${timestamp}] Error message:`, error.message)
      console.error(`[TASK-GEN ${timestamp}] Error stack:`, error.stack)
    }

    // Check if it's a network error
    const isNetworkError = error instanceof Error && (
      error.message.includes('fetch') ||
      error.message.includes('network') ||
      error.message.includes('ECONNREFUSED') ||
      error.message.includes('timeout')
    )

    if (isNetworkError) {
      console.error(`[TASK-GEN ${timestamp}] Network error detected - cannot reach N8N webhook`)
    }

    return NextResponse.json(
      {
        error: 'Failed to generate tasks. Please try again.',
        ...(isDev && { details: error instanceof Error ? error.message : String(error) })
      },
      { status: 500 }
    )
  }
}
