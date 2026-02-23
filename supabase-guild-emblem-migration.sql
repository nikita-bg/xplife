-- ============================================================
-- XPLife 2.0 — Guild Emblem + Cleanup Migration
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Add emblem column to guilds table
ALTER TABLE guilds ADD COLUMN IF NOT EXISTS emblem TEXT DEFAULT 'shield';

-- 2. Enable realtime for guild_members (so UI updates when someone joins/leaves)
-- Note: if this fails with "already member", ignore it
ALTER PUBLICATION supabase_realtime ADD TABLE guild_members;

-- 3. Clean up orphaned guilds (created by users who left without deleting)
-- This deletes guilds that have NO active owner in guild_members
DELETE FROM guilds
WHERE id NOT IN (
    SELECT guild_id FROM guild_members WHERE role = 'owner'
);

-- 4. Fix RLS on boss_events and boss_contributions to allow reads for authenticated users
-- boss_events
CREATE POLICY IF NOT EXISTS "Authenticated users can view boss events"
  ON boss_events FOR SELECT TO authenticated
  USING (true);

-- boss_contributions
CREATE POLICY IF NOT EXISTS "Authenticated users can view contributions"
  ON boss_contributions FOR SELECT TO authenticated
  USING (true);

CREATE POLICY IF NOT EXISTS "Users can insert own contributions"
  ON boss_contributions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update own contributions"
  ON boss_contributions FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- 5. Enable realtime for boss_events so HP updates live
ALTER PUBLICATION supabase_realtime ADD TABLE boss_events;
