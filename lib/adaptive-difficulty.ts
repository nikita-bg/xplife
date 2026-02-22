import type { QuestHistoryStats, DifficultyHint } from './types'

/**
 * Analyze quest history and produce an adaptive difficulty hint
 * that the n8n GPT prompt will consume to adjust quest difficulty.
 *
 * Thresholds:
 *  - Overall completion rate < 40%  →  reduce_difficulty
 *  - Overall completion rate 40–70% →  balanced
 *  - Overall completion rate > 70%  →  increase_challenge
 *
 * Per-category overrides:
 *  - Category completion rate < 30% →  force_easier for that category
 *  - Category completion rate > 80% →  increase_challenge for that category
 */
export function calculateAdaptiveDifficulty(history: QuestHistoryStats): DifficultyHint {
    const { overallCompletionRate, completionByCategory } = history

    // Need at least some decided tasks to be meaningful
    const totalDecided = history.totalCompleted + history.totalSkipped
    if (totalDecided < 5) {
        return {
            recommendation: 'balanced',
            overallCompletionRate,
            categoryOverrides: {},
            reasoning: 'Not enough quest history yet (< 5 decided tasks). Using balanced difficulty.',
        }
    }

    // ── Overall recommendation ──
    let recommendation: DifficultyHint['recommendation']
    let reasoning: string

    if (overallCompletionRate < 0.4) {
        recommendation = 'reduce_difficulty'
        reasoning = `Low completion rate (${(overallCompletionRate * 100).toFixed(0)}%). User may be overwhelmed — generate easier, shorter quests.`
    } else if (overallCompletionRate > 0.7) {
        recommendation = 'increase_challenge'
        reasoning = `High completion rate (${(overallCompletionRate * 100).toFixed(0)}%). User is crushing it — increase difficulty to maintain engagement.`
    } else {
        recommendation = 'balanced'
        reasoning = `Healthy completion rate (${(overallCompletionRate * 100).toFixed(0)}%). Maintain balanced difficulty mix.`
    }

    // ── Per-category overrides ──
    const categoryOverrides: Record<string, 'force_easier' | 'increase_challenge'> = {}

    for (const [category, stats] of Object.entries(completionByCategory)) {
        // Only override if there are enough tasks in this category
        if (stats.total < 3) continue

        if (stats.rate < 0.3) {
            categoryOverrides[category] = 'force_easier'
        } else if (stats.rate > 0.8) {
            categoryOverrides[category] = 'increase_challenge'
        }
    }

    return {
        recommendation,
        overallCompletionRate,
        categoryOverrides,
        reasoning,
    }
}
