/**
 * Shared streak reset logic.
 * Call from any server component that needs to check & reset stale streaks.
 */

import { SupabaseClient } from '@supabase/supabase-js'

export async function checkAndResetStreak(
    supabase: SupabaseClient,
    userId: string
): Promise<{ current_streak: number; longest_streak: number; last_activity_date: string | null }> {
    const { data: streak } = await supabase
        .from('streaks')
        .select('*')
        .eq('user_id', userId)
        .single()

    if (!streak) {
        return { current_streak: 0, longest_streak: 0, last_activity_date: null }
    }

    if (streak.last_activity_date) {
        const today = new Date().toISOString().split('T')[0]
        if (streak.last_activity_date !== today) {
            const lastDate = new Date(streak.last_activity_date + 'T00:00:00')
            const todayDate = new Date(today + 'T00:00:00')
            const diffDays = Math.round(
                (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
            )

            if (diffDays > 1) {
                await supabase
                    .from('streaks')
                    .update({ current_streak: 0, updated_at: new Date().toISOString() })
                    .eq('user_id', userId)
                streak.current_streak = 0
            }
        }
    }

    return streak
}
