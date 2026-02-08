-- ============================================
-- XPLife Personalization Migration
-- Adds fields for maximum task personalization
-- ============================================

-- ============================================
-- PHASE 1: Quick Win Fields on Users Table
-- ============================================

-- Time preferences and task duration
ALTER TABLE public.users
  ADD COLUMN time_preference VARCHAR(20) DEFAULT 'morning'
    CHECK (time_preference IN ('morning', 'afternoon', 'evening', 'night')),
  ADD COLUMN best_focus_times TEXT[] DEFAULT ARRAY['morning'],
  ADD COLUMN preferred_task_duration VARCHAR(20) DEFAULT 'medium'
    CHECK (preferred_task_duration IN ('quick', 'medium', 'deep'));

-- Occupation and lifestyle context
ALTER TABLE public.users
  ADD COLUMN occupation_type VARCHAR(50),
  ADD COLUMN work_schedule VARCHAR(30),
  ADD COLUMN life_phase VARCHAR(50),
  ADD COLUMN main_challenge VARCHAR(50);

-- ============================================
-- TASK FEEDBACK TABLE
-- ============================================

CREATE TABLE public.task_feedback (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id uuid REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  difficulty_rating integer CHECK (difficulty_rating BETWEEN 1 AND 5),
  enjoyment_score integer CHECK (enjoyment_score BETWEEN 1 AND 5),
  time_taken VARCHAR(50),
  notes TEXT,
  created_at timestamptz DEFAULT now()
);

-- Index for efficient feedback queries
CREATE INDEX idx_task_feedback_user ON public.task_feedback(user_id, created_at DESC);
CREATE INDEX idx_task_feedback_task ON public.task_feedback(task_id);

-- RLS policies for task_feedback
ALTER TABLE public.task_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own feedback"
  ON public.task_feedback FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own feedback"
  ON public.task_feedback FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own feedback"
  ON public.task_feedback FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- USER INTERESTS TABLE
-- ============================================

CREATE TABLE public.user_interests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  interest VARCHAR(50) NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, interest)
);

-- Index for efficient interest lookups
CREATE INDEX idx_user_interests_user ON public.user_interests(user_id);

-- RLS policies for user_interests
ALTER TABLE public.user_interests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own interests"
  ON public.user_interests FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own interests"
  ON public.user_interests FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own interests"
  ON public.user_interests FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- HELPER VIEWS FOR ANALYTICS
-- ============================================

-- View for category performance analytics
CREATE OR REPLACE VIEW public.category_analytics AS
SELECT
  user_id,
  category,
  COUNT(*) as total_tasks,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tasks,
  COUNT(CASE WHEN status = 'skipped' THEN 1 END) as skipped_tasks,
  ROUND(
    COUNT(CASE WHEN status = 'completed' THEN 1 END)::numeric /
    NULLIF(COUNT(*)::numeric, 0) * 100,
    2
  ) as completion_rate,
  AVG(
    CASE
      WHEN status = 'completed' AND completed_at IS NOT NULL
      THEN EXTRACT(epoch FROM (completed_at - created_at)) / 3600
    END
  ) as avg_hours_to_complete
FROM public.tasks
WHERE status IN ('completed', 'skipped')
GROUP BY user_id, category;

-- Grant access to view
ALTER VIEW public.category_analytics OWNER TO postgres;

-- RLS on view (inherits from tasks table)
