-- ============================================================
-- XPLife 2.0 — Weekly Boss Events Tables
-- Run this in Supabase SQL Editor
-- ============================================================

-- Boss Events
CREATE TABLE IF NOT EXISTS boss_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  tier TEXT NOT NULL DEFAULT 'common' CHECK (tier IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
  max_hp INT NOT NULL DEFAULT 1000,
  current_hp INT NOT NULL DEFAULT 1000,
  xp_reward INT NOT NULL DEFAULT 500,
  gold_reward INT NOT NULL DEFAULT 100,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'defeated', 'expired')),
  started_at TIMESTAMPTZ DEFAULT now(),
  ends_at TIMESTAMPTZ,
  defeated_at TIMESTAMPTZ
);

ALTER TABLE boss_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view boss events"
  ON boss_events FOR SELECT TO authenticated
  USING (true);

-- Only server/n8n can insert (via service role)
CREATE POLICY "Service can manage bosses"
  ON boss_events FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Allow updates from authenticated for HP changes
CREATE POLICY "Authenticated can update boss HP"
  ON boss_events FOR UPDATE TO authenticated
  USING (status = 'active');

-- Boss Contributions
CREATE TABLE IF NOT EXISTS boss_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  boss_id UUID REFERENCES boss_events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  guild_id UUID REFERENCES guilds(id) ON DELETE SET NULL,
  damage_dealt INT NOT NULL DEFAULT 0,
  tasks_completed INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE boss_contributions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own contributions"
  ON boss_contributions FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can view all contributions for leaderboard"
  ON boss_contributions FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can insert contributions"
  ON boss_contributions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own contributions"
  ON boss_contributions FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- Index for fast leaderboard queries
CREATE INDEX IF NOT EXISTS idx_boss_contributions_boss_damage
  ON boss_contributions (boss_id, damage_dealt DESC);

CREATE INDEX IF NOT EXISTS idx_boss_events_status
  ON boss_events (status) WHERE status = 'active';
