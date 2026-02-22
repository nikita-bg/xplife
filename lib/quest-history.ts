import type { SupabaseClient } from '@supabase/supabase-js'
import type { QuestHistoryStats, CategoryAnalytics, CategoryStats } from './types'

const TASK_CATEGORIES = ['fitness', 'mindfulness', 'learning', 'productivity', 'social', 'health', 'creativity']
const TASK_DIFFICULTIES = ['easy', 'medium', 'hard', 'epic']

/**
 * Aggregate quest history from the last N days.
 * Returns completion rates by category and difficulty, total counts,
 * and average completion time — used to power adaptive difficulty and
 * enrich the n8n AI prompt with historical context.
 */
export async function aggregateQuestHistory(
    userId: string,
    supabase: SupabaseClient,
    periodDays = 30
): Promise<QuestHistoryStats> {
    const since = new Date()
    since.setDate(since.getDate() - periodDays)

    const { data: tasks } = await supabase
        .from('tasks')
        .select('category, difficulty, status, created_at, completed_at')
        .eq('user_id', userId)
        .gte('created_at', since.toISOString())
        .in('status', ['completed', 'skipped', 'pending'])

    if (!tasks || tasks.length === 0) {
        return {
            totalCompleted: 0,
            totalSkipped: 0,
            totalPending: 0,
            overallCompletionRate: 0,
            completionByCategory: {},
            completionByDifficulty: {},
            avgCompletionTimeHours: null,
            periodDays,
        }
    }

    const totalCompleted = tasks.filter(t => t.status === 'completed').length
    const totalSkipped = tasks.filter(t => t.status === 'skipped').length
    const totalPending = tasks.filter(t => t.status === 'pending').length
    const decidedTasks = totalCompleted + totalSkipped
    const overallCompletionRate = decidedTasks > 0 ? totalCompleted / decidedTasks : 0

    // ── By Category ──
    const completionByCategory: Record<string, { completed: number; total: number; rate: number }> = {}
    for (const cat of TASK_CATEGORIES) {
        const catTasks = tasks.filter(t => t.category === cat && t.status !== 'pending')
        if (catTasks.length > 0) {
            const completed = catTasks.filter(t => t.status === 'completed').length
            completionByCategory[cat] = {
                completed,
                total: catTasks.length,
                rate: completed / catTasks.length,
            }
        }
    }

    // ── By Difficulty ──
    const completionByDifficulty: Record<string, { completed: number; total: number; rate: number }> = {}
    for (const diff of TASK_DIFFICULTIES) {
        const diffTasks = tasks.filter(t => t.difficulty === diff && t.status !== 'pending')
        if (diffTasks.length > 0) {
            const completed = diffTasks.filter(t => t.status === 'completed').length
            completionByDifficulty[diff] = {
                completed,
                total: diffTasks.length,
                rate: completed / diffTasks.length,
            }
        }
    }

    // ── Average Completion Time ──
    let avgCompletionTimeHours: number | null = null
    const completedWithTime = tasks.filter(t => t.status === 'completed' && t.completed_at && t.created_at)
    if (completedWithTime.length > 0) {
        const totalHours = completedWithTime.reduce((sum, t) => {
            const created = new Date(t.created_at!).getTime()
            const completedAt = new Date(t.completed_at!).getTime()
            return sum + (completedAt - created) / (1000 * 60 * 60)
        }, 0)
        avgCompletionTimeHours = totalHours / completedWithTime.length
    }

    return {
        totalCompleted,
        totalSkipped,
        totalPending,
        overallCompletionRate,
        completionByCategory,
        completionByDifficulty,
        avgCompletionTimeHours,
        periodDays,
    }
}

/**
 * Calculate success rate analytics by category (all-time).
 * Used for identifying best/struggling categories and sending
 * to the n8n prompt for category weighting.
 */
export async function calculateCategoryStats(
    userId: string,
    supabase: SupabaseClient
): Promise<CategoryAnalytics> {
    const { data: allTasks } = await supabase
        .from('tasks')
        .select('category, status, created_at, completed_at')
        .eq('user_id', userId)
        .in('status', ['completed', 'skipped'])

    if (!allTasks || allTasks.length === 0) {
        return { categoryStats: {}, bestCategory: null, strugglingCategory: null }
    }

    const statsByCategory: Record<string, CategoryStats> = {}

    for (const category of TASK_CATEGORIES) {
        const categoryTasks = allTasks.filter(t => t.category === category)
        const completed = categoryTasks.filter(t => t.status === 'completed')
        const total = categoryTasks.length

        if (total > 0) {
            let avgTimeHours: number | null = null
            const completedWithTime = completed.filter(t => t.completed_at && t.created_at)
            if (completedWithTime.length > 0) {
                const totalHours = completedWithTime.reduce((sum, t) => {
                    const created = new Date(t.created_at!).getTime()
                    const completedAt = new Date(t.completed_at!).getTime()
                    return sum + (completedAt - created) / (1000 * 60 * 60)
                }, 0)
                avgTimeHours = totalHours / completedWithTime.length
            }

            statsByCategory[category] = {
                completion_rate: completed.length / total,
                total_completed: completed.length,
                total_tasks: total,
                avg_time_hours: avgTimeHours,
            }
        }
    }

    // Find best and worst (min 3 tasks required)
    const sorted = Object.entries(statsByCategory)
        .filter(([, stats]) => stats.total_tasks >= 3)
        .sort((a, b) => b[1].completion_rate - a[1].completion_rate)

    return {
        categoryStats: statsByCategory,
        bestCategory: sorted[0]?.[0] || null,
        strugglingCategory: sorted[sorted.length - 1]?.[0] || null,
    }
}
