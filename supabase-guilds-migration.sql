-- ============================================================
-- XPLife 2.0 — Guild System Tables
-- Run this in Supabase SQL Editor
-- ============================================================

-- Guilds
CREATE TABLE IF NOT EXISTS guilds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  banner_url TEXT,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  member_count INT DEFAULT 1,
  total_xp BIGINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE guilds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view guilds"
  ON guilds FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create guilds"
  ON guilds FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Guild owner can update"
  ON guilds FOR UPDATE TO authenticated
  USING (created_by = auth.uid());

-- Guild Members
CREATE TABLE IF NOT EXISTS guild_members (
  guild_id UUID REFERENCES guilds(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (guild_id, user_id)
);

ALTER TABLE guild_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view guild members"
  ON guild_members FOR SELECT TO authenticated
  USING (
    guild_id IN (SELECT guild_id FROM guild_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Can join guilds"
  ON guild_members FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owner/admin can manage members"
  ON guild_members FOR DELETE TO authenticated
  USING (
    guild_id IN (
      SELECT guild_id FROM guild_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Guild Invites
CREATE TABLE IF NOT EXISTS guild_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id UUID REFERENCES guilds(id) ON DELETE CASCADE NOT NULL,
  invited_by UUID REFERENCES auth.users(id) NOT NULL,
  invite_code TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ,
  max_uses INT DEFAULT 0, -- 0 = unlimited
  uses INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE guild_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view invites"
  ON guild_invites FOR SELECT TO authenticated
  USING (
    guild_id IN (SELECT guild_id FROM guild_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Admin/owner can create invites"
  ON guild_invites FOR INSERT TO authenticated
  WITH CHECK (
    guild_id IN (
      SELECT guild_id FROM guild_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Anyone can read invites by code (for joining)
CREATE POLICY "Anyone can read invite by code"
  ON guild_invites FOR SELECT TO authenticated
  USING (true);

-- Guild Quests
CREATE TABLE IF NOT EXISTS guild_quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id UUID REFERENCES guilds(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'productivity',
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard', 'epic')),
  xp_reward INT DEFAULT 100,
  target_contributions INT DEFAULT 10,
  current_contributions INT DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'expired')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE guild_quests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view guild quests"
  ON guild_quests FOR SELECT TO authenticated
  USING (
    guild_id IN (SELECT guild_id FROM guild_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Admin/owner can create guild quests"
  ON guild_quests FOR INSERT TO authenticated
  WITH CHECK (
    guild_id IN (
      SELECT guild_id FROM guild_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Admin/owner can update guild quests"
  ON guild_quests FOR UPDATE TO authenticated
  USING (
    guild_id IN (
      SELECT guild_id FROM guild_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
    OR guild_id IN (SELECT guild_id FROM guild_members WHERE user_id = auth.uid())
  );

-- Guild Chat Messages
CREATE TABLE IF NOT EXISTS guild_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id UUID REFERENCES guilds(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE guild_chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view guild chat"
  ON guild_chat_messages FOR SELECT TO authenticated
  USING (
    guild_id IN (SELECT guild_id FROM guild_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Members can send messages"
  ON guild_chat_messages FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND guild_id IN (SELECT guild_id FROM guild_members WHERE user_id = auth.uid())
  );

-- Enable Realtime for chat
ALTER PUBLICATION supabase_realtime ADD TABLE guild_chat_messages;

-- Helper function: increment guild member count
CREATE OR REPLACE FUNCTION increment_guild_member_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE guilds SET member_count = member_count + 1 WHERE id = NEW.guild_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_guild_member_join
  AFTER INSERT ON guild_members
  FOR EACH ROW EXECUTE FUNCTION increment_guild_member_count();

-- Helper function: decrement guild member count
CREATE OR REPLACE FUNCTION decrement_guild_member_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE guilds SET member_count = GREATEST(member_count - 1, 0) WHERE id = OLD.guild_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_guild_member_leave
  AFTER DELETE ON guild_members
  FOR EACH ROW EXECUTE FUNCTION decrement_guild_member_count();
