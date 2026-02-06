import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const DAILY_LIMIT = 50

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

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

  // Check daily limit
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const { count } = await supabase
    .from('ai_chat_history')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('role', 'user')
    .gte('created_at', todayStart.toISOString())

  const usedToday = count ?? 0
  if (usedToday >= DAILY_LIMIT) {
    return NextResponse.json(
      { error: 'Daily message limit reached (50/day)', remainingMessages: 0 },
      { status: 429 }
    )
  }

  // Save user message
  await supabase.from('ai_chat_history').insert({
    user_id: user.id,
    role: 'user',
    content: message.trim(),
  })

  // Fetch user profile for context
  const { data: profile } = await supabase
    .from('users')
    .select('personality_type, level')
    .eq('id', user.id)
    .single()

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        message: message.trim(),
        personalityType: profile?.personality_type,
        level: profile?.level,
      }),
    })

    if (!response.ok) {
      throw new Error('Chat webhook request failed')
    }

    const data = await response.json()
    const reply = data.reply || 'Sorry, I could not generate a response.'

    // Save assistant reply
    await supabase.from('ai_chat_history').insert({
      user_id: user.id,
      role: 'assistant',
      content: reply,
    })

    return NextResponse.json({
      reply,
      remainingMessages: DAILY_LIMIT - usedToday - 1,
    })
  } catch (error) {
    console.error('AI chat error:', error)
    return NextResponse.json(
      { error: 'Failed to get AI response' },
      { status: 500 }
    )
  }
}
