import type { SupabaseClient } from '@supabase/supabase-js'
import type { RateLimitResult } from './types'
import { getPlanLimits } from './plan-limits'

/**
 * Check if the user can generate more quests today.
 * Free: 3 generations/day, Premium/Lifetime: unlimited
 */
export async function checkQuestGenerationLimit(
    userId: string,
    plan: string | null | undefined,
    supabase: SupabaseClient
): Promise<RateLimitResult> {
    const limits = getPlanLimits(plan)

    if (limits.questGenerationsPerDay === -1) {
        return { allowed: true, current: 0, limit: -1, resetAt: '' }
    }

    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    // Count distinct generation batches today (grouped by created_at within 5 seconds)
    // We approximate by counting unique created_at timestamps truncated to minute
    const { count, error } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', todayStart.toISOString())

    if (error) {
        console.error('[RATE-LIMIT] Failed to check daily generation count:', error)
        // Fail open — allow the request but log the error
        return { allowed: true, current: 0, limit: limits.questGenerationsPerDay, resetAt: '' }
    }

    const tomorrow = new Date(todayStart)
    tomorrow.setDate(tomorrow.getDate() + 1)

    return {
        allowed: (count ?? 0) < limits.questGenerationsPerDay * 6, // ~6 tasks per generation × N generations
        current: count ?? 0,
        limit: limits.questGenerationsPerDay * 6,
        resetAt: tomorrow.toISOString(),
    }
}

/**
 * Check if the user has reached their weekly task limit.
 * Free: 15 tasks/week, Premium/Lifetime: unlimited
 */
export async function checkWeeklyTaskLimit(
    userId: string,
    plan: string | null | undefined,
    supabase: SupabaseClient
): Promise<RateLimitResult> {
    const limits = getPlanLimits(plan)

    if (limits.maxTasksPerWeek === -1) {
        return { allowed: true, current: 0, limit: -1, resetAt: '' }
    }

    const now = new Date()
    const dayOfWeek = now.getDay()
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - mondayOffset)
    startOfWeek.setHours(0, 0, 0, 0)

    const { count, error } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', startOfWeek.toISOString())

    if (error) {
        console.error('[RATE-LIMIT] Failed to check weekly task count:', error)
        return { allowed: true, current: 0, limit: limits.maxTasksPerWeek, resetAt: '' }
    }

    // Next Monday
    const nextMonday = new Date(startOfWeek)
    nextMonday.setDate(nextMonday.getDate() + 7)

    return {
        allowed: (count ?? 0) < limits.maxTasksPerWeek,
        current: count ?? 0,
        limit: limits.maxTasksPerWeek,
        resetAt: nextMonday.toISOString(),
    }
}

/**
 * Check yearly quest limit.
 */
export async function checkYearlyQuestLimit(
    userId: string,
    plan: string | null | undefined,
    supabase: SupabaseClient
): Promise<RateLimitResult> {
    const limits = getPlanLimits(plan)

    const { count, error } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('quest_timeframe', 'yearly')
        .neq('status', 'skipped')

    if (error) {
        console.error('[RATE-LIMIT] Failed to check yearly quest count:', error)
        return { allowed: true, current: 0, limit: limits.maxYearlyQuests, resetAt: '' }
    }

    const nextYear = new Date()
    nextYear.setFullYear(nextYear.getFullYear() + 1, 0, 1)

    return {
        allowed: (count ?? 0) < limits.maxYearlyQuests,
        current: count ?? 0,
        limit: limits.maxYearlyQuests,
        resetAt: nextYear.toISOString(),
    }
}

/**
 * Check chat messages per day limit.
 */
export async function checkChatLimit(
    userId: string,
    plan: string | null | undefined,
    supabase: SupabaseClient
): Promise<RateLimitResult> {
    const limits = getPlanLimits(plan)

    if (limits.chatPerDay === -1) {
        return { allowed: true, current: 0, limit: -1, resetAt: '' }
    }

    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const { count, error } = await supabase
        .from('ai_chat_history')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('role', 'user')
        .gte('created_at', todayStart.toISOString())

    if (error) {
        console.error('[RATE-LIMIT] Failed to check chat limit:', error)
        return { allowed: true, current: 0, limit: limits.chatPerDay, resetAt: '' }
    }

    const tomorrow = new Date(todayStart)
    tomorrow.setDate(tomorrow.getDate() + 1)

    return {
        allowed: (count ?? 0) < limits.chatPerDay,
        current: count ?? 0,
        limit: limits.chatPerDay,
        resetAt: tomorrow.toISOString(),
    }
}
