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
      const errorText = await response.text()
      console.error('Chat webhook failed:', response.status, errorText)
      throw new Error('Chat webhook request failed')
    }

    let raw: unknown
    const responseText = await response.text()
    console.log('N8N chat raw response:', responseText.substring(0, 500))
    try {
      raw = JSON.parse(responseText)
    } catch {
      console.error('N8N response is not valid JSON:', responseText.substring(0, 200))
      throw new Error('Invalid JSON from N8N')
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
      console.error('Failed to parse N8N chat response:', parseErr, raw)
    }

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
