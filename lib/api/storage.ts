import { createClient } from '@/lib/supabase/client'

export async function uploadTaskProof(userId: string, taskId: string, file: File) {
  const supabase = createClient()
  const ext = file.name.split('.').pop()
  const path = `${userId}/${taskId}-${Date.now()}.${ext}`

  const { data, error } = await supabase.storage
    .from('task-proofs')
    .upload(path, file)

  if (error) throw error

  const { data: { publicUrl } } = supabase.storage
    .from('task-proofs')
    .getPublicUrl(data.path)

  return publicUrl
}

export async function uploadAvatar(userId: string, file: File) {
  const supabase = createClient()
  const ext = file.name.split('.').pop()
  const path = `${userId}/avatar-${Date.now()}.${ext}`

  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true })

  if (error) throw error

  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(data.path)

  // Update user profile
  await supabase
    .from('users')
    .update({ avatar_url: publicUrl })
    .eq('id', userId)

  return publicUrl
}
