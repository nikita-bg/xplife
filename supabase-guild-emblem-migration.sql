-- ============================================================
-- XPLife 2.0 — Guild Emblem Column
-- Run this in Supabase SQL Editor
-- ============================================================

-- Add emblem column to guilds table
ALTER TABLE guilds ADD COLUMN IF NOT EXISTS emblem TEXT DEFAULT 'shield';

-- Enable realtime for guild_members (so UI updates when someone joins/leaves)
ALTER publication supabase_realtime ADD TABLE guild_members;
