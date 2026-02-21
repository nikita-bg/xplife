-- ════════════════════════════════════════════════════════════
-- XPLife Inventory System — Supabase Migration
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- ════════════════════════════════════════════════════════════

-- ── Item definitions (global catalog) ───────────────────────

CREATE TABLE IF NOT EXISTS items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('head','body','arm','leg','base','weapon','aura','consumable','currency')),
  rarity TEXT NOT NULL CHECK (rarity IN ('common','uncommon','rare','epic','legendary','mythic')),
  class_affinity TEXT CHECK (class_affinity IN ('adventurer','thinker','guardian','connector','neutral')),
  svg_content TEXT,
  thumbnail_url TEXT,
  effect_data JSONB,
  coin_value INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── User inventory ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS user_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id UUID REFERENCES items(id),
  quantity INTEGER DEFAULT 1,
  equipped BOOLEAN DEFAULT FALSE,
  equipped_slot TEXT,
  obtained_at TIMESTAMPTZ DEFAULT NOW(),
  obtained_from TEXT,
  UNIQUE(user_id, item_id)
);

-- ── Case definitions ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  rarity TEXT NOT NULL CHECK (rarity IN ('common','rare','legendary','mythic')),
  thumbnail_url TEXT,
  drop_table JSONB NOT NULL,
  obtainable_from TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── User cases (unopened) ───────────────────────────────────

CREATE TABLE IF NOT EXISTS user_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  case_id UUID REFERENCES cases(id),
  quantity INTEGER DEFAULT 1,
  obtained_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Case opening history ────────────────────────────────────

CREATE TABLE IF NOT EXISTS case_openings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  case_id UUID REFERENCES cases(id),
  item_received UUID REFERENCES items(id),
  opened_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Internal currency wallet ────────────────────────────────

CREATE TABLE IF NOT EXISTS user_wallet (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  coins INTEGER DEFAULT 0,
  gems INTEGER DEFAULT 0,
  total_coins_earned INTEGER DEFAULT 0,
  pity_counter_legendary INTEGER DEFAULT 0,
  pity_counter_mythic INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Coin transaction history ────────────────────────────────

CREATE TABLE IF NOT EXISTS coin_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('quest_reward','case_drop','item_sell','market_buy','market_sell','level_bonus')),
  reference_id UUID,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Marketplace listings ────────────────────────────────────

CREATE TABLE IF NOT EXISTS market_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id UUID REFERENCES items(id),
  user_inventory_id UUID REFERENCES user_inventory(id),
  price_coins INTEGER NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','sold','cancelled')),
  listed_at TIMESTAMPTZ DEFAULT NOW(),
  sold_at TIMESTAMPTZ
);

-- ════════════════════════════════════════════════════════════
-- Row Level Security (RLS)
-- ════════════════════════════════════════════════════════════

-- Items: read-only for all authenticated users
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "items_select" ON items FOR SELECT TO authenticated USING (true);

-- User inventory: users can only see/modify their own
ALTER TABLE user_inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "inventory_select" ON user_inventory FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "inventory_insert" ON user_inventory FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "inventory_update" ON user_inventory FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "inventory_delete" ON user_inventory FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Cases: read-only for all
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cases_select" ON cases FOR SELECT TO authenticated USING (true);

-- User cases: own only
ALTER TABLE user_cases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_cases_select" ON user_cases FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "user_cases_insert" ON user_cases FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_cases_update" ON user_cases FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "user_cases_delete" ON user_cases FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Case openings: own only
ALTER TABLE case_openings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "case_openings_select" ON case_openings FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "case_openings_insert" ON case_openings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- User wallet: own only
ALTER TABLE user_wallet ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wallet_select" ON user_wallet FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "wallet_insert" ON user_wallet FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "wallet_update" ON user_wallet FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Coin transactions: own only
ALTER TABLE coin_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "transactions_select" ON coin_transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "transactions_insert" ON coin_transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Market listings: all can read active, only sellers can modify own
ALTER TABLE market_listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "market_select_all" ON market_listings FOR SELECT TO authenticated USING (true);
CREATE POLICY "market_insert" ON market_listings FOR INSERT TO authenticated WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "market_update" ON market_listings FOR UPDATE TO authenticated USING (auth.uid() = seller_id);

-- ════════════════════════════════════════════════════════════
-- Indexes for performance
-- ════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_user_inventory_user_id ON user_inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_user_inventory_item_id ON user_inventory(item_id);
CREATE INDEX IF NOT EXISTS idx_user_cases_user_id ON user_cases(user_id);
CREATE INDEX IF NOT EXISTS idx_case_openings_user_id ON case_openings(user_id);
CREATE INDEX IF NOT EXISTS idx_coin_transactions_user_id ON coin_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_market_listings_status ON market_listings(status);
CREATE INDEX IF NOT EXISTS idx_market_listings_seller ON market_listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_items_type ON items(type);
CREATE INDEX IF NOT EXISTS idx_items_rarity ON items(rarity);
