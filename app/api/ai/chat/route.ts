import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getPlanLimits } from '@/lib/plan-limits'

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
    .select('personality_type, level, plan')
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

    console.log(`[AI-CHAT ${timestamp}] Calling N8N chat webhook`)

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: webhookHeaders,
      body: JSON.stringify({
        userId: user.id,
        message: message.trim(),
        personalityType: profile?.personality_type,
        level: profile?.level,
      }),
    })

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
    try {
      if (typeof raw === 'object' && raw !== null && 'reply' in raw) {
        // Direct JSON: { reply: "..." }
        reply = (raw as { reply: string }).reply || reply
      } else if (typeof raw === 'string') {
        // JSON string: '{"reply":"..."}'
        const parsed = JSON.parse(raw)
        reply = parsed.reply || reply
      } else if (Array.isArray(raw) && raw[0]?.output) {
        // Array format: [{ output: "..." }] or [{ output: { reply: "..." } }]
        const output = raw[0].output
        if (typeof output === 'string') {
          const parsed = JSON.parse(output)
          reply = parsed.reply || reply
        } else if (typeof output === 'object' && output.reply) {
          reply = output.reply
        }
      }
    } catch (parseErr) {
      console.error(`[AI-CHAT ${timestamp}] Failed to parse N8N chat response:`, parseErr, raw)
    }

    console.log(`[AI-CHAT ${timestamp}] Parsed reply, length:`, reply.length)

    // Save assistant reply
    const { error: insertAssistantError } = await supabase.from('ai_chat_history').insert({
      user_id: user.id,
      role: 'assistant',
      content: reply,
    })

    if (insertAssistantError) {
      console.error(`[AI-CHAT ${timestamp}] Failed to save assistant reply:`, insertAssistantError)
      // Don't fail the request, just log the error
    }

    console.log(`[AI-CHAT ${timestamp}] Successfully completed chat interaction`)

    return NextResponse.json({
      reply,
      remainingMessages: dailyLimit === -1 ? -1 : dailyLimit - usedToday - 1,
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
