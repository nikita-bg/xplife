// ── Core Types for XPLife 2.0 ──

export type QuestTimeframe = 'daily' | 'weekly' | 'monthly' | 'yearly'
export type TaskStatus = 'pending' | 'completed' | 'skipped' | 'expired'
export type PersonalityType = 'dopamine' | 'acetylcholine' | 'gaba' | 'serotonin'

export interface UserProfile {
    id: string
    email: string
    display_name: string | null
    avatar_url: string | null
    personality_type: PersonalityType | null
    level: number
    total_xp: number
    gold_balance: number
    real_world_earnings: number
    plan: 'free' | 'premium' | 'lifetime'
    about_me: string | null
    time_preference: string | null
    preferred_task_duration: string | null
    occupation_type: string | null
    work_schedule: string | null
    life_phase: string | null
    main_challenge: string | null
    onboarding_complete: boolean
    braverman_complete: boolean
    created_at: string
    updated_at: string
}

export interface Task {
    id: string
    user_id: string
    title: string
    description: string | null
    category: string | null
    difficulty: 'easy' | 'medium' | 'hard' | 'epic'
    xp_reward: number
    status: TaskStatus
    timeframe: QuestTimeframe
    parent_quest_id: string | null
    proof_url: string | null
    completed_at: string | null
    expires_at: string | null
    created_at: string
}

export interface Streak {
    id: string
    user_id: string
    current_streak: number
    longest_streak: number
    last_activity_date: string | null
    freeze_count: number
    updated_at: string
}

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
