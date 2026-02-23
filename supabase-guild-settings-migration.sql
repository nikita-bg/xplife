-- ============================================================
-- XPLife 2.0 — Guild Settings + Join Requests Migration
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Add settings columns to guilds
ALTER TABLE guilds ADD COLUMN IF NOT EXISTS min_level INT DEFAULT 1;
ALTER TABLE guilds ADD COLUMN IF NOT EXISTS join_mode TEXT DEFAULT 'open';

-- 2. Create join_requests table
CREATE TABLE IF NOT EXISTS guild_join_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id UUID REFERENCES guilds(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (guild_id, user_id)
);
ALTER TABLE guild_join_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view join requests"
  ON guild_join_requests FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert own requests"
  ON guild_join_requests FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update requests"
  ON guild_join_requests FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Admins can delete requests"
  ON guild_join_requests FOR DELETE TO authenticated USING (true);

-- 3. Auto-sync member_count via trigger
CREATE OR REPLACE FUNCTION sync_guild_member_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE guilds SET member_count = (
    SELECT COUNT(*) FROM guild_members WHERE guild_id = COALESCE(NEW.guild_id, OLD.guild_id)
  ) WHERE id = COALESCE(NEW.guild_id, OLD.guild_id);
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_member_count ON guild_members;
CREATE TRIGGER trg_sync_member_count
AFTER INSERT OR DELETE ON guild_members
FOR EACH ROW EXECUTE FUNCTION sync_guild_member_count();

-- 4. Fix existing member counts NOW
UPDATE guilds g SET member_count = (
  SELECT COUNT(*) FROM guild_members gm WHERE gm.guild_id = g.id
);

-- 5. Enable Realtime for join requests
ALTER PUBLICATION supabase_realtime ADD TABLE guild_join_requests;
