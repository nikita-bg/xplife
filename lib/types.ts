// ── XPLife Core Types ──

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'skipped'
export type TaskDifficulty = 'easy' | 'medium' | 'hard' | 'epic'
export type TaskCategory = 'fitness' | 'mindfulness' | 'learning' | 'productivity' | 'social' | 'health' | 'creativity'

export type PersonalityType = 'dopamine' | 'acetylcholine' | 'gaba' | 'serotonin'
export type ClassType = 'adventurer' | 'thinker' | 'guardian' | 'connector'
export type QuestTimeframe = 'yearly' | 'monthly' | 'weekly' | 'daily'
export type PlanType = 'free' | 'premium' | 'lifetime'

// ── Database Row Types ──

export interface Task {
    id: string
    user_id: string
    title: string
    description: string | null
    category: TaskCategory
    difficulty: TaskDifficulty
    xp_reward: number
    status: TaskStatus
    quest_timeframe: QuestTimeframe
    parent_quest_id: string | null
    proof_url: string | null
    due_date: string | null
    created_at: string
    completed_at: string | null
}

export interface Goal {
    id: string
    user_id: string
    title: string
    category: TaskCategory
    created_at: string
}

export interface UserProfile {
    id: string
    email: string
    display_name: string | null
    avatar_url: string | null
    total_xp: number
    level: number
    personality_type: PersonalityType | null
    onboarding_completed: boolean
    dopamine_score: number
    acetylcholine_score: number
    gaba_score: number
    serotonin_score: number
    gold_balance: number
    preferred_currency: string | null
    plan: PlanType
    // Personalization fields
    time_preference: string | null
    best_focus_times: string[] | null
    preferred_task_duration: string | null
    occupation_type: string | null
    work_schedule: string | null
    life_phase: string | null
    main_challenge: string | null
    about_me: string | null
    created_at: string
    updated_at: string
}

export interface Streak {
    user_id: string
    current_streak: number
    longest_streak: number
    last_activity_date: string | null
}

export interface TaskFeedback {
    id: string
    task_id: string
    user_id: string
    difficulty_rating: number // 1-5
    enjoyment_score: number  // 1-5
    time_taken: number | null
    notes: string | null
    created_at: string
}

// ── Quest Generation Types ──

export interface CategoryStats {
    completion_rate: number
    total_completed: number
    total_tasks: number
    avg_time_hours: number | null
}

export interface CategoryAnalytics {
    categoryStats: Record<string, CategoryStats>
    bestCategory: string | null
    strugglingCategory: string | null
}

export interface QuestHistoryStats {
    totalCompleted: number
    totalSkipped: number
    totalPending: number
    overallCompletionRate: number
    completionByCategory: Record<string, { completed: number; total: number; rate: number }>
    completionByDifficulty: Record<string, { completed: number; total: number; rate: number }>
    avgCompletionTimeHours: number | null
    periodDays: number
}

export interface DifficultyHint {
    recommendation: 'reduce_difficulty' | 'balanced' | 'increase_challenge'
    overallCompletionRate: number
    categoryOverrides: Record<string, 'force_easier' | 'increase_challenge'>
    reasoning: string
}

export interface ClassFlavorProfile {
    className: ClassType
    displayName: string
    questStyle: string
    tone: string
    priorityCategories: TaskCategory[]
    avoidCategories: TaskCategory[]
    questPrefixes: string[]
}

export interface RateLimitResult {
    allowed: boolean
    current: number
    limit: number
    resetAt: string
}

// ── Guild Types ──

export type GuildRole = 'owner' | 'admin' | 'member'
export type GuildQuestStatus = 'active' | 'completed' | 'expired'

export interface Guild {
    id: string
    name: string
    description: string | null
    banner_url: string | null
    created_by: string
    member_count: number
    total_xp: number
    created_at: string
}

export interface GuildMember {
    guild_id: string
    user_id: string
    role: GuildRole
    joined_at: string
    // Joined from users table
    display_name?: string | null
    avatar_url?: string | null
    level?: number
    total_xp?: number
}

export interface GuildInvite {
    id: string
    guild_id: string
    invited_by: string
    invite_code: string
    expires_at: string | null
    max_uses: number
    uses: number
    created_at: string
}

export interface GuildQuest {
    id: string
    guild_id: string
    title: string
    description: string | null
    category: string
    difficulty: TaskDifficulty
    xp_reward: number
    target_contributions: number
    current_contributions: number
    status: GuildQuestStatus
    created_by: string | null
    created_at: string
    completed_at: string | null
}

export interface GuildChatMessage {
    id: string
    guild_id: string
    user_id: string
    content: string
    created_at: string
    // Joined from users
    display_name?: string | null
    avatar_url?: string | null
}

// ── Blog Types ──

export interface BlogPost {
    id: string
    title: string
    slug: string
    content: string
    excerpt: string | null
    cover_image_url: string | null
    status: 'draft' | 'published'
    published_at: string | null
    created_at: string
    updated_at: string | null
}

// ── Boss Event Types ──

export type BossTier = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
export type BossStatus = 'active' | 'defeated' | 'expired'

export interface BossEvent {
    id: string
    name: string
    description: string | null
    tier: BossTier
    max_hp: number
    current_hp: number
    xp_reward: number
    gold_reward: number
    status: BossStatus
    started_at: string
    ends_at: string | null
    defeated_at: string | null
}

export interface BossContribution {
    id: string
    boss_id: string
    user_id: string
    guild_id: string | null
    damage_dealt: number
    tasks_completed: number
    created_at: string
    // Joined from users
    display_name?: string | null
    avatar_url?: string | null
}

// ── Quiz Types ──

export interface QuizQuestion {
    id: number
    question: string
    options: QuizOption[]
}

export interface QuizOption {
    label: string
    value: string
    personality: PersonalityType
}

export interface QuizAnswer {
    questionId: number
    personality: PersonalityType
}

export interface OnboardingData {
    quizAnswers: QuizAnswer[]
    personalityType: PersonalityType
    goals: {
        category: TaskCategory
        title: string
    }[]
}
