import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TaskDetail } from '@/components/task/task-detail'

export default async function TaskPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: task } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (!task) notFound()

  const { data: profile } = await supabase
    .from('users')
    .select('level, total_xp')
    .eq('id', user.id)
    .single()

  const { data: nextLevel } = await supabase
    .from('level_config')
    .select('*')
    .eq('level', (profile?.level ?? 1) + 1)
    .single()

  return (
    <TaskDetail
      task={task}
      userId={user.id}
      currentXp={profile?.total_xp ?? 0}
      currentLevel={profile?.level ?? 1}
      nextLevelXp={nextLevel?.xp_required ?? null}
      nextLevelTitle={nextLevel?.title ?? null}
    />
  )
}
