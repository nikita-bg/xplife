import type { Database } from './database'

export type UserProfile = Database['public']['Tables']['users']['Row']
export type Task = Database['public']['Tables']['tasks']['Row']
export type Goal = Database['public']['Tables']['goals']['Row']
export type Streak = Database['public']['Tables']['streaks']['Row']
export type XpLog = Database['public']['Tables']['xp_logs']['Row']
export type LevelConfig = Database['public']['Tables']['level_config']['Row']
export type LeaderboardEntry = Database['public']['Tables']['leaderboard']['Row']

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'skipped'
export type TaskDifficulty = 'easy' | 'medium' | 'hard' | 'epic'
export type TaskCategory = 'fitness' | 'mindfulness' | 'learning' | 'productivity' | 'social' | 'health' | 'creativity'

export type PersonalityType = 'dopamine' | 'acetylcholine' | 'gaba' | 'serotonin'

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
