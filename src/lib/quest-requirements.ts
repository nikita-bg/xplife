'use client';

import type { QuestTimeframe } from '@/lib/types';

/* ─── Quest Unlock Requirement System ───
 *
 * Thresholds are PERSONALIZED based on the user's personality type (Braverman):
 * - dopamine (Adventurer): High-intensity focus — fewer hard quests needed  
 * - acetylcholine (Thinker): Balanced, analytical — standard thresholds
 * - gaba (Guardian): Steady, consistent — more easy/medium, fewer hard
 * - serotonin (Connector): Social/collaborative — moderate all-around
 *
 * Formula:  progress = max(easy/req, med/req, hard/req, weighted_sum)
 * Quest unlocks when ANY single tier >= 100% OR weighted_sum >= 1.0
 */

export interface DifficultyThresholds {
    easy: number;
    medium: number;
    hard: number;
}

export interface UnlockRequirement {
    childTimeframe: QuestTimeframe;
    thresholds: DifficultyThresholds;
}

// ── Per-personality thresholds ──
// Each personality type emphasizes different difficulty distributions

type PersonalityType = 'dopamine' | 'acetylcholine' | 'gaba' | 'serotonin';

const PERSONALITY_REQUIREMENTS: Record<PersonalityType, Record<string, UnlockRequirement>> = {
    // Adventurer: thrives on challenge — needs fewer hard quests, more easy to compensate
    dopamine: {
        weekly: { childTimeframe: 'daily', thresholds: { hard: 2, medium: 5, easy: 10 } },
        monthly: { childTimeframe: 'weekly', thresholds: { hard: 1, medium: 2, easy: 3 } },
        yearly: { childTimeframe: 'monthly', thresholds: { hard: 1, medium: 2, easy: 3 } },
    },
    // Thinker: balanced, analytical — standard thresholds
    acetylcholine: {
        weekly: { childTimeframe: 'daily', thresholds: { hard: 3, medium: 7, easy: 13 } },
        monthly: { childTimeframe: 'weekly', thresholds: { hard: 1, medium: 2, easy: 3 } },
        yearly: { childTimeframe: 'monthly', thresholds: { hard: 1, medium: 2, easy: 3 } },
    },
    // Guardian: steady, prefers consistency — fewer hard, more easy/medium
    gaba: {
        weekly: { childTimeframe: 'daily', thresholds: { hard: 2, medium: 6, easy: 15 } },
        monthly: { childTimeframe: 'weekly', thresholds: { hard: 1, medium: 2, easy: 4 } },
        yearly: { childTimeframe: 'monthly', thresholds: { hard: 1, medium: 2, easy: 3 } },
    },
    // Connector: social, moderate all-around  
    serotonin: {
        weekly: { childTimeframe: 'daily', thresholds: { hard: 3, medium: 6, easy: 12 } },
        monthly: { childTimeframe: 'weekly', thresholds: { hard: 1, medium: 2, easy: 3 } },
        yearly: { childTimeframe: 'monthly', thresholds: { hard: 1, medium: 2, easy: 3 } },
    },
};

// Fallback for unknown types
const DEFAULT_PERSONALITY: PersonalityType = 'acetylcholine';

function getRequirementsForPersonality(personalityType: string): Record<string, UnlockRequirement> {
    const key = (personalityType || DEFAULT_PERSONALITY) as PersonalityType;
    return PERSONALITY_REQUIREMENTS[key] || PERSONALITY_REQUIREMENTS[DEFAULT_PERSONALITY];
}

// ── Progress calculation ──

export interface DifficultyProgress {
    easy: { done: number; required: number };
    medium: { done: number; required: number };
    hard: { done: number; required: number };
}

export interface UnlockStatus {
    unlocked: boolean;
    progress: number; // 0–1
    breakdown: DifficultyProgress;
    childTimeframe: QuestTimeframe;
}

/**
 * Calculate unlock status for a quest based on user's personality type.
 */
export function getUnlockStatus(
    questTimeframe: QuestTimeframe,
    completedChildTasks: Array<{ difficulty?: string }>,
    personalityType?: string
): UnlockStatus | null {
    const reqs = getRequirementsForPersonality(personalityType || DEFAULT_PERSONALITY);
    const req = reqs[questTimeframe];
    if (!req) return null; // daily quests have no requirements

    const counts = { easy: 0, medium: 0, hard: 0 };
    for (const task of completedChildTasks) {
        const d = (task.difficulty || 'medium') as keyof typeof counts;
        if (d in counts) counts[d]++;
    }

    const t = req.thresholds;
    const easyRatio = t.easy > 0 ? counts.easy / t.easy : 0;
    const medRatio = t.medium > 0 ? counts.medium / t.medium : 0;
    const hardRatio = t.hard > 0 ? counts.hard / t.hard : 0;

    // Unlock: ANY single tier at 100% OR weighted sum >= 1.0
    const weightedSum = easyRatio + medRatio + hardRatio;
    const isUnlocked = easyRatio >= 1 || medRatio >= 1 || hardRatio >= 1 || weightedSum >= 1;
    const bestSingle = Math.max(easyRatio, medRatio, hardRatio);

    return {
        unlocked: isUnlocked,
        progress: Math.min(1, Math.max(bestSingle, weightedSum / 3)),
        breakdown: {
            easy: { done: counts.easy, required: t.easy },
            medium: { done: counts.medium, required: t.medium },
            hard: { done: counts.hard, required: t.hard },
        },
        childTimeframe: req.childTimeframe,
    };
}

export function hasRequirements(timeframe: QuestTimeframe): boolean {
    return timeframe !== 'daily';
}
