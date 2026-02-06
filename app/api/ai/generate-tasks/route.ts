import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
      }),
    })

    if (!response.ok) {
      throw new Error('Webhook request failed')
    }

    const data = await response.json()
    const tasks = data.tasks || []

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
