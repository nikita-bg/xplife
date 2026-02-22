import type { PersonalityType, ClassFlavorProfile } from './types'

/**
 * Maps personality type → character class → quest flavor profile.
 * The profile includes quest style preferences, tone, priority categories,
 * and quest title prefixes that the AI uses to make quests feel class-specific.
 */
const CLASS_PROFILES: Record<PersonalityType, ClassFlavorProfile> = {
    dopamine: {
        className: 'adventurer',
        displayName: 'The Adventurer',
        questStyle: 'Bold challenges, time-pressure sprints, novel experiences, competitive elements. Prefer high-energy tasks with clear wins and exciting rewards.',
        tone: 'Competitive, exciting, high-energy. Use action verbs, urgency, and reward language. Make every quest feel like an epic mission.',
        priorityCategories: ['fitness', 'productivity', 'creativity'],
        avoidCategories: [],
        questPrefixes: ['⚔️ Challenge:', '🏆 Sprint:', '💥 Power Move:', '🔥 Boss Rush:', '⚡ Lightning Quest:'],
    },
    acetylcholine: {
        className: 'thinker',
        displayName: 'The Thinker',
        questStyle: 'Deep focus sessions, learning goals, creative projects, intellectual puzzles. Prefer longer, meaningful tasks with knowledge payoff.',
        tone: 'Intellectual, curious, thoughtful. Use discovery language, reference growth and mastery. Frame quests as unlocking knowledge.',
        priorityCategories: ['learning', 'creativity', 'productivity'],
        avoidCategories: [],
        questPrefixes: ['🧠 Deep Dive:', '📚 Knowledge Quest:', '💡 Insight:', '🔬 Experiment:', '🎯 Focus Session:'],
    },
    gaba: {
        className: 'guardian',
        displayName: 'The Guardian',
        questStyle: 'Habit-building rituals, routine maintenance, health check-ins, calm structured tasks. Prefer consistent, reliable tasks that build stability.',
        tone: 'Calm, structured, supportive. Use nurturing language, emphasize consistency and progress. Frame quests as fortifying your foundation.',
        priorityCategories: ['health', 'mindfulness', 'fitness'],
        avoidCategories: [],
        questPrefixes: ['🛡️ Daily Ritual:', '🏰 Foundation:', '🌿 Balance Check:', '⚖️ Steady Progress:', '🔒 Habit Lock:'],
    },
    serotonin: {
        className: 'connector',
        displayName: 'The Connector',
        questStyle: 'Social challenges, team activities, community engagement, relationship building. Prefer meaningful interactions and collective goals.',
        tone: 'Warm, encouraging, community-focused. Use connection language, highlight relationships and shared impact. Frame quests as strengthening bonds.',
        priorityCategories: ['social', 'mindfulness', 'health'],
        avoidCategories: [],
        questPrefixes: ['💜 Connection Quest:', '🤝 Team Challenge:', '🌟 Community:', '💌 Bond Builder:', '🎭 Social Mission:'],
    },
}

/**
 * Get the class flavor profile for a given personality type.
 * Falls back to a neutral adventurer profile if personality is unknown.
 */
export function getClassFlavorProfile(personalityType: string | null | undefined): ClassFlavorProfile {
    if (personalityType && personalityType in CLASS_PROFILES) {
        return CLASS_PROFILES[personalityType as PersonalityType]
    }

    // Default: neutral adventurer
    return {
        className: 'adventurer',
        displayName: 'Hero',
        questStyle: 'Varied challenges across all categories. Mix of difficulty levels to discover your strengths.',
        tone: 'Motivating and encouraging. Balance between challenge and support.',
        priorityCategories: ['fitness', 'learning', 'productivity'],
        avoidCategories: [],
        questPrefixes: ['⭐ Quest:', '🎯 Mission:', '✨ Challenge:'],
    }
}

/**
 * Get the class name from personality type.
 */
export function getClassName(personalityType: string | null | undefined): string {
    if (personalityType && personalityType in CLASS_PROFILES) {
        return CLASS_PROFILES[personalityType as PersonalityType].displayName
    }
    return 'Hero'
}
