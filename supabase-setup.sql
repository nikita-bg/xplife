-- ============================================
-- XPLife App — Full Database Setup
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. USERS TABLE
create table public.users (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  display_name text,
  avatar_url text,
  total_xp integer default 0,
  level integer default 1,
  personality_type text,
  onboarding_completed boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. GOALS TABLE
create table public.goals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users on delete cascade not null,
  title text not null,
  category text not null,
  created_at timestamptz default now()
);

-- 3. TASKS TABLE
create table public.tasks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users on delete cascade not null,
  title text not null,
  description text,
  category text not null,
  difficulty text default 'medium',
  xp_reward integer default 50,
  status text default 'pending',
  proof_url text,
  due_date timestamptz,
  created_at timestamptz default now(),
  completed_at timestamptz
);

-- 4. STREAKS TABLE
create table public.streaks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users on delete cascade not null unique,
  current_streak integer default 0,
  longest_streak integer default 0,
  last_activity_date date,
  updated_at timestamptz default now()
);

-- 5. XP LOGS TABLE
create table public.xp_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users on delete cascade not null,
  amount integer not null,
  source text not null,
  task_id uuid references public.tasks on delete set null,
  created_at timestamptz default now()
);

-- 6. TASK PROOFS TABLE
create table public.task_proofs (
  id uuid default gen_random_uuid() primary key,
  task_id uuid references public.tasks on delete cascade not null,
  user_id uuid references public.users on delete cascade not null,
  file_url text not null,
  created_at timestamptz default now()
);

-- 7. LEADERBOARD TABLE
create table public.leaderboard (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users on delete cascade not null unique,
  total_xp integer default 0,
  level integer default 1,
  rank integer default 0,
  display_name text,
  avatar_url text,
  current_streak integer default 0,
  updated_at timestamptz default now()
);

-- 8. AI CHAT HISTORY TABLE
create table public.ai_chat_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users on delete cascade not null,
  role text not null,
  content text not null,
  created_at timestamptz default now()
);

-- 9. LEVEL CONFIG TABLE
create table public.level_config (
  level integer primary key,
  title text not null,
  xp_required integer not null
);

-- Insert level config data
insert into public.level_config (level, title, xp_required) values
  (1, 'Novice', 0),
  (2, 'Apprentice', 100),
  (3, 'Initiate', 250),
  (4, 'Adventurer', 500),
  (5, 'Warrior', 800),
  (6, 'Veteran', 1200),
  (7, 'Elite', 1700),
  (8, 'Champion', 2300),
  (9, 'Hero', 3000),
  (10, 'Legend', 4000),
  (11, 'Mythic', 5200),
  (12, 'Immortal', 6500),
  (13, 'Ascendant', 8000),
  (14, 'Titan', 10000),
  (15, 'Demigod', 12500),
  (16, 'Celestial', 15500),
  (17, 'Eternal', 19000),
  (18, 'Transcendent', 23000),
  (19, 'Omniscient', 28000),
  (20, 'Godlike', 35000);

-- ============================================
-- AUTO-CREATE USER PROFILE ON SIGNUP
-- ============================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );

  insert into public.streaks (user_id)
  values (new.id);

  insert into public.leaderboard (user_id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );

  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- AUTO-UPDATE LEADERBOARD WHEN USER CHANGES
-- ============================================

create or replace function public.sync_leaderboard()
returns trigger as $$
begin
  update public.leaderboard
  set
    total_xp = new.total_xp,
    level = new.level,
    display_name = new.display_name,
    avatar_url = new.avatar_url,
    updated_at = now()
  where user_id = new.id;

  return new;
end;
$$ language plpgsql security definer;

create trigger on_user_updated
  after update on public.users
  for each row execute procedure public.sync_leaderboard();

-- Auto-sync streak to leaderboard
create or replace function public.sync_streak_to_leaderboard()
returns trigger as $$
begin
  update public.leaderboard
  set current_streak = new.current_streak, updated_at = now()
  where user_id = new.user_id;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_streak_updated
  after update on public.streaks
  for each row execute procedure public.sync_streak_to_leaderboard();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

alter table public.users enable row level security;
alter table public.goals enable row level security;
alter table public.tasks enable row level security;
alter table public.streaks enable row level security;
alter table public.xp_logs enable row level security;
alter table public.task_proofs enable row level security;
alter table public.leaderboard enable row level security;
alter table public.ai_chat_history enable row level security;
alter table public.level_config enable row level security;

-- Users: can read/update own profile
create policy "Users can view own profile" on public.users for select using (auth.uid() = id);
create policy "Users can update own profile" on public.users for update using (auth.uid() = id);

-- Goals: full access to own goals
create policy "Users can view own goals" on public.goals for select using (auth.uid() = user_id);
create policy "Users can insert own goals" on public.goals for insert with check (auth.uid() = user_id);
create policy "Users can update own goals" on public.goals for update using (auth.uid() = user_id);
create policy "Users can delete own goals" on public.goals for delete using (auth.uid() = user_id);

-- Tasks: full access to own tasks
create policy "Users can view own tasks" on public.tasks for select using (auth.uid() = user_id);
create policy "Users can insert own tasks" on public.tasks for insert with check (auth.uid() = user_id);
create policy "Users can update own tasks" on public.tasks for update using (auth.uid() = user_id);

-- Streaks: read/update own
create policy "Users can view own streak" on public.streaks for select using (auth.uid() = user_id);
create policy "Users can update own streak" on public.streaks for update using (auth.uid() = user_id);

-- XP Logs: read/insert own
create policy "Users can view own xp logs" on public.xp_logs for select using (auth.uid() = user_id);
create policy "Users can insert own xp logs" on public.xp_logs for insert with check (auth.uid() = user_id);

-- Task Proofs: read/insert own
create policy "Users can view own proofs" on public.task_proofs for select using (auth.uid() = user_id);
create policy "Users can insert own proofs" on public.task_proofs for insert with check (auth.uid() = user_id);

-- Leaderboard: everyone can read, only own can update
create policy "Anyone can view leaderboard" on public.leaderboard for select using (true);
create policy "Users can update own leaderboard" on public.leaderboard for update using (auth.uid() = user_id);

-- AI Chat History: own only
create policy "Users can view own chat" on public.ai_chat_history for select using (auth.uid() = user_id);
create policy "Users can insert own chat" on public.ai_chat_history for insert with check (auth.uid() = user_id);

-- Level Config: everyone can read
create policy "Anyone can view level config" on public.level_config for select using (true);
