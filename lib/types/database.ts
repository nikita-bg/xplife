export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          display_name: string | null
          avatar_url: string | null
          total_xp: number
          level: number
          personality_type: string | null
          onboarding_completed: boolean
          created_at: string
          updated_at: string
          dopamine_score: number
          acetylcholine_score: number
          gaba_score: number
          serotonin_score: number
        }
        Insert: {
          id: string
          email: string
          display_name?: string | null
          avatar_url?: string | null
          total_xp?: number
          level?: number
          personality_type?: string | null
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
          dopamine_score?: number
          acetylcholine_score?: number
          gaba_score?: number
          serotonin_score?: number
        }
        Update: {
          id?: string
          email?: string
          display_name?: string | null
          avatar_url?: string | null
          total_xp?: number
          level?: number
          personality_type?: string | null
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
          dopamine_score?: number
          acetylcholine_score?: number
          gaba_score?: number
          serotonin_score?: number
        }
      }
      braverman_results: {
        Row: {
          id: string
          user_id: string
          dopamine_score: number
          acetylcholine_score: number
          gaba_score: number
          serotonin_score: number
          dominant_type: string
          completed_at: string
        }
        Insert: {
          id?: string
          user_id: string
          dopamine_score: number
          acetylcholine_score: number
          gaba_score: number
          serotonin_score: number
          dominant_type: string
          completed_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          dopamine_score?: number
          acetylcholine_score?: number
          gaba_score?: number
          serotonin_score?: number
          dominant_type?: string
          completed_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          category: string
          difficulty: string
          xp_reward: number
          status: string
          proof_url: string | null
          due_date: string | null
          created_at: string
          completed_at: string | null
          quest_timeframe: string
          parent_quest_id: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          category: string
          difficulty?: string
          xp_reward?: number
          status?: string
          proof_url?: string | null
          due_date?: string | null
          created_at?: string
          completed_at?: string | null
          quest_timeframe?: string
          parent_quest_id?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          category?: string
          difficulty?: string
          xp_reward?: number
          status?: string
          proof_url?: string | null
          due_date?: string | null
          created_at?: string
          completed_at?: string | null
          quest_timeframe?: string
          parent_quest_id?: string | null
        }
      }
      goals: {
        Row: {
          id: string
          user_id: string
          title: string
          category: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          category: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          category?: string
          created_at?: string
        }
      }
      streaks: {
        Row: {
          id: string
          user_id: string
          current_streak: number
          longest_streak: number
          last_activity_date: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          current_streak?: number
          longest_streak?: number
          last_activity_date?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          current_streak?: number
          longest_streak?: number
          last_activity_date?: string | null
          updated_at?: string
        }
      }
      xp_logs: {
        Row: {
          id: string
          user_id: string
          amount: number
          source: string
          task_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          source: string
          task_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          source?: string
          task_id?: string | null
          created_at?: string
        }
      }
      task_proofs: {
        Row: {
          id: string
          task_id: string
          user_id: string
          file_url: string
          created_at: string
        }
        Insert: {
          id?: string
          task_id: string
          user_id: string
          file_url: string
          created_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          user_id?: string
          file_url?: string
          created_at?: string
        }
      }
      leaderboard: {
        Row: {
          id: string
          user_id: string
          total_xp: number
          level: number
          rank: number
          display_name: string | null
          avatar_url: string | null
          current_streak: number
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          total_xp?: number
          level?: number
          rank?: number
          display_name?: string | null
          avatar_url?: string | null
          current_streak?: number
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          total_xp?: number
          level?: number
          rank?: number
          display_name?: string | null
          avatar_url?: string | null
          current_streak?: number
          updated_at?: string
        }
      }
      ai_chat_history: {
        Row: {
          id: string
          user_id: string
          role: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: string
          content?: string
          created_at?: string
        }
      }
      level_config: {
        Row: {
          level: number
          title: string
          xp_required: number
        }
        Insert: {
          level: number
          title: string
          xp_required: number
        }
        Update: {
          level?: number
          title?: string
          xp_required?: number
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
