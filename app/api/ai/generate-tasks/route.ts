import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let userGoals: string | undefined
  try {
    const body = await request.json()
    userGoals = body.goals
  } catch {
    // no body or invalid JSON — that's fine, we'll use DB goals
  }

  const webhookUrl = process.env.N8N_WEBHOOK_URL
  if (!webhookUrl) {
    return NextResponse.json(
      { error: 'AI task generation not configured yet' },
      { status: 503 }
    )
  }

  // Fetch user context
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: goals } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', user.id)

  const { data: recentTasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        personalityType: profile?.personality_type,
        level: profile?.level,
        goals: goals ?? [],
        recentTasks: recentTasks ?? [],
        userGoals: userGoals || '',
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Task generation webhook failed:', response.status, errorText)
      throw new Error('Webhook request failed')
    }

    let raw: unknown
    const responseText = await response.text()
    console.log('N8N tasks raw response:', responseText.substring(0, 500))
    try {
      raw = JSON.parse(responseText)
    } catch {
      console.error('N8N response is not valid JSON:', responseText.substring(0, 200))
      throw new Error('Invalid JSON from N8N')
    }

    type TaskItem = { title: string; description?: string; category: string; difficulty?: string; xp_reward?: number }
    let tasks: TaskItem[] = []
    try {
      // Extract content string from various N8N response formats
      let content: unknown = raw

      if (Array.isArray(raw) && raw.length > 0) {
        const first = raw[0]
        if (first?.message?.content) {
          // OpenAI chat format: [{ message: { content: "..." } }]
          content = first.message.content
        } else if (first?.output) {
          // N8N output format: [{ output: "..." }]
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
      console.error('Failed to parse N8N tasks response:', parseErr, raw)
    }

    if (tasks.length > 0) {
      const taskInserts = tasks.map((task: { title: string; description?: string; category: string; difficulty?: string; xp_reward?: number }) => ({
        user_id: user.id,
        title: task.title,
        description: task.description ?? null,
        category: task.category,
        difficulty: task.difficulty ?? 'medium',
        xp_reward: task.xp_reward ?? 50,
        status: 'pending',
      }))

      await supabase.from('tasks').insert(taskInserts)
    }

    return NextResponse.json({ success: true, count: tasks.length })
  } catch (error) {
    console.error('AI task generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate tasks' },
      { status: 500 }
    )
  }
}
