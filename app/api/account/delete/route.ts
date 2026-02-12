import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const admin = createAdminClient()
  const userId = user.id

  // Delete all user data from tables (order matters for foreign keys)
  const tables = [
    'ai_chat_history',
    'task_feedback',
    'xp_logs',
    'tasks',
    'goals',
    'user_interests',
    'streaks',
    'braverman_results',
    'users',
  ]

  for (const table of tables) {
    await admin.from(table).delete().eq('user_id', userId)
  }

  // Delete the 'users' row which uses 'id' not 'user_id'
  await admin.from('users').delete().eq('id', userId)

  // Delete storage files
  const { data: avatarFiles } = await admin.storage.from('avatars').list(userId)
  if (avatarFiles?.length) {
    await admin.storage.from('avatars').remove(avatarFiles.map(f => `${userId}/${f.name}`))
  }

  const { data: proofFiles } = await admin.storage.from('task-proofs').list(userId)
  if (proofFiles?.length) {
    await admin.storage.from('task-proofs').remove(proofFiles.map(f => `${userId}/${f.name}`))
  }

  // Delete the auth user
  const { error } = await admin.auth.admin.deleteUser(userId)

  if (error) {
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
