/**
 * Quest Template Packs — pre-built quest collections users can apply in 1 click
 */

export interface QuestTemplate {
    title: string
    description: string
    category: string
    difficulty: 'easy' | 'medium' | 'hard' | 'epic'
    xp_reward: number
}

export interface TemplatePack {
    id: string
    name: string
    description: string
    icon: string // Lucide icon name
    color: string // Tailwind color
    quests: QuestTemplate[]
}

export const TEMPLATE_PACKS: TemplatePack[] = [
    {
        id: 'morning-routine',
        name: 'Morning Routine',
        description: 'Start every day with energy and focus',
        icon: 'Sunrise',
        color: 'amber',
        quests: [
            { title: 'Wake up at 7 AM', description: 'Start the day early and refreshed', category: 'health', difficulty: 'easy', xp_reward: 15 },
            { title: 'Drink a glass of water', description: 'Hydrate first thing in the morning', category: 'health', difficulty: 'easy', xp_reward: 10 },
            { title: '10 min stretching', description: 'Wake up your body with gentle movement', category: 'health', difficulty: 'easy', xp_reward: 20 },
            { title: 'Healthy breakfast', description: 'Fuel your body with nutritious food', category: 'health', difficulty: 'medium', xp_reward: 25 },
            { title: 'Journal 3 gratitudes', description: 'Write down what you are grateful for', category: 'mindfulness', difficulty: 'easy', xp_reward: 15 },
        ],
    },
    {
        id: 'fitness-warrior',
        name: 'Fitness Warrior',
        description: 'Build strength and endurance',
        icon: 'Dumbbell',
        color: 'red',
        quests: [
            { title: '30 push-ups', description: 'Build upper body strength', category: 'health', difficulty: 'medium', xp_reward: 30 },
            { title: '50 squats', description: 'Strengthen your legs and core', category: 'health', difficulty: 'medium', xp_reward: 30 },
            { title: '1 min plank', description: 'Core stability challenge', category: 'health', difficulty: 'hard', xp_reward: 40 },
            { title: '20 min cardio', description: 'Get your heart rate up', category: 'health', difficulty: 'medium', xp_reward: 35 },
        ],
    },
    {
        id: 'deep-focus',
        name: 'Deep Focus',
        description: 'Eliminate distractions and get things done',
        icon: 'Brain',
        color: 'blue',
        quests: [
            { title: '2-hour focus session', description: 'Deep work without distractions', category: 'productivity', difficulty: 'hard', xp_reward: 50 },
            { title: 'No social media until noon', description: 'Protect your morning focus', category: 'productivity', difficulty: 'medium', xp_reward: 25 },
            { title: 'Complete top 3 priorities', description: 'Finish your most important tasks', category: 'productivity', difficulty: 'hard', xp_reward: 45 },
            { title: 'Clean workspace', description: 'Declutter your desk for clarity', category: 'productivity', difficulty: 'easy', xp_reward: 15 },
        ],
    },
    {
        id: 'self-care',
        name: 'Self-Care',
        description: 'Prioritize your well-being',
        icon: 'Heart',
        color: 'pink',
        quests: [
            { title: 'Take a relaxing bath/shower', description: 'Unwind and relax your body', category: 'health', difficulty: 'easy', xp_reward: 15 },
            { title: 'Read for 30 minutes', description: 'Give your mind something positive', category: 'learning', difficulty: 'easy', xp_reward: 20 },
            { title: 'Skincare routine', description: 'Take care of your skin', category: 'health', difficulty: 'easy', xp_reward: 15 },
            { title: 'Digital detox (1 hour)', description: 'Disconnect from screens', category: 'mindfulness', difficulty: 'medium', xp_reward: 30 },
            { title: 'Sleep by 11 PM', description: 'Get quality rest', category: 'health', difficulty: 'medium', xp_reward: 25 },
        ],
    },
    {
        id: 'learning-quest',
        name: 'Learning Quest',
        description: 'Expand your knowledge daily',
        icon: 'BookOpen',
        color: 'emerald',
        quests: [
            { title: 'Read 20 pages', description: 'Read from a non-fiction book', category: 'learning', difficulty: 'medium', xp_reward: 25 },
            { title: 'Watch an educational video', description: 'Learn something new in 15 min', category: 'learning', difficulty: 'easy', xp_reward: 15 },
            { title: 'Practice a skill for 30 min', description: 'Deliberate practice of any skill', category: 'learning', difficulty: 'medium', xp_reward: 30 },
            { title: 'Teach someone what you learned', description: 'Solidify knowledge by teaching', category: 'social', difficulty: 'hard', xp_reward: 40 },
        ],
    },
    {
        id: 'social-hero',
        name: 'Social Hero',
        description: 'Strengthen your connections',
        icon: 'Users',
        color: 'violet',
        quests: [
            { title: 'Call a friend or family', description: 'Meaningful conversation for 10+ min', category: 'social', difficulty: 'easy', xp_reward: 20 },
            { title: 'Send an encouraging message', description: 'Brighten someone\'s day', category: 'social', difficulty: 'easy', xp_reward: 15 },
            { title: 'Help someone with a task', description: 'Offer assistance without being asked', category: 'social', difficulty: 'medium', xp_reward: 30 },
        ],
    },
    {
        id: 'mindfulness',
        name: 'Mindfulness',
        description: 'Cultivate inner peace and awareness',
        icon: 'Leaf',
        color: 'teal',
        quests: [
            { title: '10 min meditation', description: 'Sit quietly and focus on breath', category: 'mindfulness', difficulty: 'medium', xp_reward: 25 },
            { title: 'Mindful walk (15 min)', description: 'Walk slowly with full awareness', category: 'mindfulness', difficulty: 'easy', xp_reward: 20 },
            { title: 'Body scan before sleep', description: 'Release tension from head to toe', category: 'mindfulness', difficulty: 'easy', xp_reward: 15 },
            { title: 'No complaining for 24 hours', description: 'Practice positive mindset', category: 'mindfulness', difficulty: 'epic', xp_reward: 60 },
        ],
    },
    {
        id: 'productivity-master',
        name: 'Productivity Master',
        description: 'Optimize your day for maximum output',
        icon: 'Rocket',
        color: 'orange',
        quests: [
            { title: 'Plan tomorrow tonight', description: 'Write your schedule and priorities', category: 'productivity', difficulty: 'easy', xp_reward: 15 },
            { title: 'Process inbox to zero', description: 'Clear all email and messages', category: 'productivity', difficulty: 'medium', xp_reward: 25 },
            { title: 'Review weekly goals', description: 'Track progress on your goals', category: 'productivity', difficulty: 'medium', xp_reward: 20 },
            { title: 'Automate one repetitive task', description: 'Find and eliminate busywork', category: 'productivity', difficulty: 'hard', xp_reward: 45 },
        ],
    },
]
