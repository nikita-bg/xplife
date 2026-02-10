import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getPlanLimits } from '@/lib/plan-limits'

// Allow up to 30 seconds for AI chat responses
export const maxDuration = 30

interface ChatTask {
  title: string
  description?: string
  category?: string
  difficulty?: string
  xp_reward?: number
  quest_timeframe?: string
}

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const timestamp = new Date().toISOString()
  console.log(`[AI-CHAT ${timestamp}] Started for user:`, user.id)

  const webhookUrl = process.env.N8N_CHAT_WEBHOOK_URL
  if (!webhookUrl) {
    return NextResponse.json(
      { error: 'AI chat not configured yet' },
      { status: 503 }
    )
  }

  const { message } = await request.json()
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 })
  }

  console.log(`[AI-CHAT ${timestamp}] Message length:`, message.trim().length)

  // Fetch user profile for context and plan
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('personality_type, level, plan, display_name, about_me')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    console.error(`[AI-CHAT ${timestamp}] No profile found for user:`, user.id, 'error:', profileError)
    return NextResponse.json(
      { error: 'User profile not found. Please complete your profile setup.' },
      { status: 404 }
    )
  }

  console.log(`[AI-CHAT ${timestamp}] Profile loaded:`, { plan: profile.plan, level: profile.level })

  const planLimits = getPlanLimits(profile?.plan)
  const dailyLimit = planLimits.chatPerDay

  // Check daily limit (skip if unlimited)
  let usedToday = 0
  if (dailyLimit !== -1) {
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const { count, error: countError } = await supabase
      .from('ai_chat_history')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('role', 'user')
      .gte('created_at', todayStart.toISOString())

    if (countError) {
      console.error(`[AI-CHAT ${timestamp}] Failed to check daily message count:`, countError)
      return NextResponse.json(
        { error: 'Database error while checking message limits. Please try again.' },
        { status: 500 }
      )
    }

    usedToday = count ?? 0
    console.log(`[AI-CHAT ${timestamp}] Daily message count:`, usedToday, '/', dailyLimit)

    if (usedToday >= dailyLimit) {
      console.log(`[AI-CHAT ${timestamp}] Daily limit reached for user:`, user.id)
      return NextResponse.json(
        { error: `Daily message limit reached (${dailyLimit}/day). Upgrade for unlimited.`, remainingMessages: 0, upgrade: true },
        { status: 429 }
      )
    }
  }

  // Save user message
  const { error: insertUserError } = await supabase.from('ai_chat_history').insert({
    user_id: user.id,
    role: 'user',
    content: message.trim(),
  })

  if (insertUserError) {
    console.error(`[AI-CHAT ${timestamp}] Failed to save user message:`, insertUserError)
    return NextResponse.json(
      { error: 'Database error while saving message. Please try again.' },
      { status: 500 }
    )
  }

  console.log(`[AI-CHAT ${timestamp}] User message saved`)

  try {
    const webhookHeaders: Record<string, string> = { 'Content-Type': 'application/json' }
    const webhookSecret = process.env.N8N_WEBHOOK_SECRET
    if (webhookSecret) {
      webhookHeaders['X-Webhook-Secret'] = webhookSecret
    }

    // Fetch recent tasks and goals for context
    const { data: recentTasks } = await supabase
      .from('tasks')
      .select('title, category, status, quest_timeframe')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    const { data: goals } = await supabase
      .from('goals')
      .select('title, category')
      .eq('user_id', user.id)

    console.log(`[AI-CHAT ${timestamp}] Calling N8N chat webhook`)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 25_000)

    let response: Response
    try {
      response = await fetch(webhookUrl, {
        method: 'POST',
        headers: webhookHeaders,
        body: JSON.stringify({
          userId: user.id,
          message: message.trim(),
          personalityType: profile?.personality_type,
          level: profile?.level,
          aboutMe: profile?.about_me || null,
          recentTasks: recentTasks ?? [],
          goals: goals ?? [],
        }),
        signal: controller.signal,
      })
    } catch (fetchErr) {
      clearTimeout(timeoutId)
      const isTimeout = fetchErr instanceof Error && fetchErr.name === 'AbortError'
      console.error(`[AI-CHAT ${timestamp}] Fetch failed:`, isTimeout ? 'TIMEOUT' : fetchErr)
      return NextResponse.json(
        { error: isTimeout
          ? 'AI response timed out. Please try again.'
          : 'Could not reach AI service. Please try again.' },
        { status: 503 }
      )
    }
    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[AI-CHAT ${timestamp}] Chat webhook failed:`, response.status, errorText)
      return NextResponse.json(
        { error: 'AI service temporarily unavailable. Please try again in a few moments.' },
        { status: 503 }
      )
    }

    console.log(`[AI-CHAT ${timestamp}] N8N webhook responded with status:`, response.status)

    let raw: unknown
    const responseText = await response.text()
    console.log(`[AI-CHAT ${timestamp}] N8N chat raw response:`, responseText.substring(0, 500))
    try {
      raw = JSON.parse(responseText)
    } catch (jsonError) {
      console.error(`[AI-CHAT ${timestamp}] N8N response is not valid JSON:`, responseText.substring(0, 200), jsonError)
      return NextResponse.json(
        { error: 'AI service returned invalid response. Please try again.' },
        { status: 503 }
      )
    }

    let reply = 'Sorry, I could not generate a response.'
    let createdTasks: ChatTask[] = []
    try {
      // Helper: extract JSON from markdown fences
      const extractJson = (str: string): string => {
        const fenceMatch = str.match(/```(?:json)?\s*([\s\S]*?)```/)
        return fenceMatch ? fenceMatch[1].trim() : str.trim()
      }

      const extractFromParsed = (obj: Record<string, unknown>) => {
        if (obj.reply) reply = obj.reply as string
        if (Array.isArray(obj.createTasks)) createdTasks = obj.createTasks as ChatTask[]
      }

      // Extract content from various response formats
      let content: unknown = raw

      if (Array.isArray(raw) && raw.length > 0) {
        const first = raw[0]
        if (first?.message?.content) {
          content = first.message.content
        } else if (first?.output) {
          content = first.output
        } else if (first?.text) {
          content = first.text
        }
      }

      if (typeof content === 'object' && content !== null && 'reply' in content) {
        extractFromParsed(content as Record<string, unknown>)
      } else if (typeof content === 'string') {
        const parsed = JSON.parse(extractJson(content))
        extractFromParsed(parsed)
      } else if (typeof content === 'object' && content !== null) {
        extractFromParsed(content as Record<string, unknown>)
      }
    } catch (parseErr) {
      console.error(`[AI-CHAT ${timestamp}] Failed to parse N8N chat response:`, parseErr, raw)
    }

    console.log(`[AI-CHAT ${timestamp}] Parsed reply, length:`, reply.length, 'tasks:', createdTasks.length)

    // If AI suggested tasks, create them in the database
    let tasksCreated = 0
    if (createdTasks.length > 0) {
      const validCategories = ['fitness', 'mindfulness', 'learning', 'productivity', 'social', 'health', 'creativity']
      const validDifficulties = ['easy', 'medium', 'hard', 'epic']
      const validTimeframes = ['yearly', 'monthly', 'weekly', 'daily']

      const taskInserts = createdTasks
        .filter((t) => t.title && typeof t.title === 'string')
        .slice(0, 5) // max 5 tasks per chat message
        .map((t) => ({
          user_id: user.id,
          title: t.title,
          description: t.description ?? null,
          category: validCategories.includes(t.category || '') ? t.category : 'productivity',
          difficulty: validDifficulties.includes(t.difficulty || '') ? t.difficulty : 'medium',
          xp_reward: t.xp_reward ?? 50,
          status: 'pending',
          quest_timeframe: validTimeframes.includes(t.quest_timeframe || '') ? t.quest_timeframe : 'daily',
        }))

      if (taskInserts.length > 0) {
        const { error: insertTasksError } = await supabase.from('tasks').insert(taskInserts)
        if (insertTasksError) {
          console.error(`[AI-CHAT ${timestamp}] Failed to insert chat tasks:`, insertTasksError)
        } else {
          tasksCreated = taskInserts.length
          console.log(`[AI-CHAT ${timestamp}] Created ${tasksCreated} tasks from chat`)
        }
      }
    }

    // Save assistant reply
    const { error: insertAssistantError } = await supabase.from('ai_chat_history').insert({
      user_id: user.id,
      role: 'assistant',
      content: reply,
    })

    if (insertAssistantError) {
      console.error(`[AI-CHAT ${timestamp}] Failed to save assistant reply:`, insertAssistantError)
    }

    console.log(`[AI-CHAT ${timestamp}] Successfully completed chat interaction`)

    return NextResponse.json({
      reply,
      remainingMessages: dailyLimit === -1 ? -1 : dailyLimit - usedToday - 1,
      tasksCreated,
    })
  } catch (error) {
    const isDev = process.env.NODE_ENV !== 'production'
    console.error(`[AI-CHAT ${timestamp}] AI chat error:`, error)

    return NextResponse.json(
      {
        error: 'Failed to get AI response. Please try again.',
        ...(isDev && { details: error instanceof Error ? error.message : String(error) })
      },
      { status: 500 }
    )
  }
}
