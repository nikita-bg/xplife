import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        // Delete user data in order (respecting FK constraints)
        const tables = ['task_feedback', 'xp_logs', 'task_proofs', 'tasks', 'goals', 'braverman_results', 'ai_chat_history', 'streaks', 'leaderboard', 'boss_contributions']

        for (const table of tables) {
            await supabase.from(table).delete().eq('user_id', user.id)
        }

        // Delete user profile
        await supabase.from('users').delete().eq('id', user.id)

        // Sign out and delete auth user
        await supabase.auth.signOut()

        // Use admin client to delete the auth user
        const { createAdminClient } = await import('@/lib/supabase/admin')
        const admin = createAdminClient()
        await admin.auth.admin.deleteUser(user.id)

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('[ACCOUNT DELETE] Error:', error)
        return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
    }
}
