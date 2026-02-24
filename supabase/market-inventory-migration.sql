-- =====================================================
-- XPLife 2.0 — Market & Inventory System
-- Run this in Supabase Dashboard → SQL Editor
-- =====================================================

-- 1. Shop Items Catalog
CREATE TABLE IF NOT EXISTS shop_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('Head', 'Body', 'Arms', 'Legs', 'Weapon')),
    rarity TEXT NOT NULL CHECK (rarity IN ('Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythic')),
    price INTEGER NOT NULL DEFAULT 0,
    class_restriction TEXT DEFAULT NULL, -- NULL = any class, or 'Adventurer', 'Thinker', 'Guardian', 'Connector'
    description TEXT DEFAULT NULL,
    emoji TEXT DEFAULT '🛡️',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. User Inventory (items owned by users)
CREATE TABLE IF NOT EXISTS user_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES shop_items(id) ON DELETE CASCADE,
    acquired_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (user_id, item_id)
);

-- 3. User Equipped Items (one per slot per user)
CREATE TABLE IF NOT EXISTS user_equipped (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    slot TEXT NOT NULL CHECK (slot IN ('Head', 'Body', 'Arms', 'Legs', 'Weapon')),
    item_id UUID NOT NULL REFERENCES shop_items(id) ON DELETE CASCADE,
    equipped_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (user_id, slot)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_inventory_user ON user_inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_user_equipped_user ON user_equipped(user_id);
CREATE INDEX IF NOT EXISTS idx_shop_items_type ON shop_items(type);
CREATE INDEX IF NOT EXISTS idx_shop_items_rarity ON shop_items(rarity);

-- RLS Policies
ALTER TABLE shop_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_equipped ENABLE ROW LEVEL SECURITY;

-- Shop items: everyone can read
CREATE POLICY "shop_items_read" ON shop_items FOR SELECT USING (true);

-- User inventory: users can only see and modify their own
CREATE POLICY "user_inventory_select" ON user_inventory FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_inventory_insert" ON user_inventory FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_inventory_delete" ON user_inventory FOR DELETE USING (auth.uid() = user_id);

-- User equipped: users can only see and modify their own
CREATE POLICY "user_equipped_select" ON user_equipped FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_equipped_insert" ON user_equipped FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_equipped_update" ON user_equipped FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "user_equipped_delete" ON user_equipped FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- SEED DATA: 25 Shop Items (5 per slot)
-- =====================================================

INSERT INTO shop_items (name, type, rarity, price, emoji, description) VALUES
-- HEAD
('Leather Cap',       'Head',   'Common',    40,  '🧢', 'Basic headgear for aspiring heroes'),
('Scout Bandana',     'Head',   'Uncommon',  150, '🎀', 'Improves focus and awareness'),
('Arcane Circlet',    'Head',   'Rare',      450, '👑', 'Enhances mental clarity'),
('Shadow Hood',       'Head',   'Epic',      1000,'🦹', 'Shrouds the wearer in mystery'),
('Dragon Crown',      'Head',   'Legendary', 3000,'👸', 'Forged from ancient dragon scales'),

-- BODY
('Cloth Tunic',       'Body',   'Common',    50,  '👕', 'Simple but comfortable'),
('Scout Vest',        'Body',   'Uncommon',  200, '🦺', 'Light protection for mobile heroes'),
('Mystic Robe',       'Body',   'Rare',      500, '🧙', 'Woven with arcane threads'),
('Phoenix Plate',     'Body',   'Epic',      1200,'🔥', 'Burns with inner fire'),
('Void Armor',        'Body',   'Legendary', 4000,'🌑', 'Absorbs damage into the void'),

-- ARMS
('Cloth Gloves',      'Arms',   'Common',    30,  '🧤', 'Basic hand protection'),
('Iron Gauntlets',    'Arms',   'Uncommon',  180, '🤖', 'Sturdy metal grips'),
('Crystal Bracers',   'Arms',   'Rare',      420, '💎', 'Channels energy through crystals'),
('Storm Gauntlets',   'Arms',   'Epic',      900, '⚡', 'Crackling with electric power'),
('Titan Grips',       'Arms',   'Legendary', 3500,'💪', 'Strength of the ancient titans'),

-- LEGS
('Traveler Boots',    'Legs',   'Common',    35,  '👢', 'Made for long journeys'),
('Wind Runner',       'Legs',   'Uncommon',  160, '🌬️', 'Light as a breeze'),
('Stealth Treads',    'Legs',   'Rare',      380, '🥷', 'Silent as shadows'),
('Magma Greaves',     'Legs',   'Epic',      850, '🌋', 'Forged in volcanic heat'),
('Celestial Boots',   'Legs',   'Legendary', 2800,'✨', 'Walk among the stars'),

-- WEAPON
('Iron Blade',        'Weapon', 'Common',    60,  '⚔️', 'A trusty starter sword'),
('Flame Sword',       'Weapon', 'Uncommon',  250, '🗡️', 'Engulfed in eternal flame'),
('Crystal Staff',     'Weapon', 'Rare',      550, '🔮', 'Channels pure arcane energy'),
('Thunder Hammer',    'Weapon', 'Epic',      1100,'🔨', 'Strikes with the force of storms'),
('Void Scepter',      'Weapon', 'Legendary', 5000,'🌟', 'Commands the fabric of reality');
