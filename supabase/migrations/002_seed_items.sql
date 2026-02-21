-- ══════════════════════════════════════════════════════════════
-- XPLife — Seed 20 base equipment items into the items table
-- Run in: Supabase Dashboard → SQL Editor
-- ══════════════════════════════════════════════════════════════

INSERT INTO items (name, description, type, rarity, class_affinity, svg_content, thumbnail_url, coin_value)
VALUES

-- ── ADVENTURER (orange/gold) ──────────────────────────────────
(
  'Flame Helm',
  'Forged in dragon fire. The visor glows with battle hunger.',
  'head', 'common', 'adventurer',
  NULL,
  '/character-system/items/flame_helm_adventurer.svg',
  50
),
(
  'Berserker Plate',
  'Wide shoulderpads embossed with a fire emblem. Pure aggression.',
  'body', 'common', 'adventurer',
  NULL,
  '/character-system/items/berserker_plate_adventurer.svg',
  60
),
(
  'Crusher Gauntlets',
  'Spiked knuckles that crunch through any obstacle.',
  'arm', 'common', 'adventurer',
  NULL,
  '/character-system/items/crusher_gauntlets_adventurer.svg',
  45
),
(
  'Warlord Greaves',
  'Knee-spiked leg armor built for charging into battle.',
  'leg', 'common', 'adventurer',
  NULL,
  '/character-system/items/warlord_greaves_adventurer.svg',
  45
),
(
  'Inferno Blade',
  'A blade of stacked fire cubes. Burns everything it touches.',
  'weapon', 'common', 'adventurer',
  NULL,
  '/character-system/items/inferno_blade_adventurer.svg',
  80
),

-- ── THINKER (blue/ice) ────────────────────────────────────────
(
  'Neural Crown',
  'Circuit-trace headset with a holographic visor and antenna.',
  'head', 'common', 'thinker',
  NULL,
  '/character-system/items/neural_crown_thinker.svg',
  50
),
(
  'Circuit Robe',
  'Slim torso with hexagonal patterns and inner circuit glow.',
  'body', 'common', 'thinker',
  NULL,
  '/character-system/items/circuit_robe_thinker.svg',
  60
),
(
  'Data Gloves',
  'Elegant arm pieces with holographic forearm projections.',
  'arm', 'common', 'thinker',
  NULL,
  '/character-system/items/data_gloves_thinker.svg',
  45
),
(
  'Flux Boots',
  'Streamlined leg pieces with upward energy flow lines.',
  'leg', 'common', 'thinker',
  NULL,
  '/character-system/items/flux_boots_thinker.svg',
  45
),
(
  'Arcane Staff',
  'Crystalline cube orbiting atop a tall staff. Pure arcane power.',
  'weapon', 'common', 'thinker',
  NULL,
  '/character-system/items/arcane_staff_thinker.svg',
  80
),

-- ── GUARDIAN (green/gray) ─────────────────────────────────────
(
  'Bastion Helm',
  'Ultra-wide shield-helmet with slit visor and ridge spikes.',
  'head', 'common', 'guardian',
  NULL,
  '/character-system/items/bastion_helm_guardian.svg',
  50
),
(
  'Fortress Chest',
  'Massive stone-plated torso with shield emblem. Unbreakable.',
  'body', 'common', 'guardian',
  NULL,
  '/character-system/items/fortress_chest_guardian.svg',
  60
),
(
  'Tower Shields',
  'Rectangular arm shields with green emblem and stone texture.',
  'arm', 'common', 'guardian',
  NULL,
  '/character-system/items/tower_shields_guardian.svg',
  45
),
(
  'Rampart Stompers',
  'Thick stone leg blocks with green energy veins at joints.',
  'leg', 'common', 'guardian',
  NULL,
  '/character-system/items/rampart_stompers_guardian.svg',
  45
),
(
  'Siege Hammer',
  'Massive warhammer with stone head and glowing green rune.',
  'weapon', 'common', 'guardian',
  NULL,
  '/character-system/items/siege_hammer_guardian.svg',
  80
),

-- ── CONNECTOR (purple/gold) ───────────────────────────────────
(
  'Spirit Mask',
  'Organic mask with hollow glowing eyes and gold filigree.',
  'head', 'common', 'connector',
  NULL,
  '/character-system/items/spirit_mask_connector.svg',
  50
),
(
  'Harmony Vest',
  'Smooth rounded torso with swirling gold chest pattern.',
  'body', 'common', 'connector',
  NULL,
  '/character-system/items/harmony_vest_connector.svg',
  60
),
(
  'Bond Bracers',
  'Elegant bracers with gold ring accents and trailing geometry.',
  'arm', 'common', 'connector',
  NULL,
  '/character-system/items/bond_bracers_connector.svg',
  45
),
(
  'Flow Walkers',
  'Tapered legs with gold ankle rings and fabric-wrap effect.',
  'leg', 'common', 'connector',
  NULL,
  '/character-system/items/flow_walkers_connector.svg',
  45
),
(
  'Soul Orb',
  'Hovering cube-octahedron with golden inner cube and orbiting orbs.',
  'weapon', 'common', 'connector',
  NULL,
  '/character-system/items/soul_orb_connector.svg',
  80
)

ON CONFLICT DO NOTHING;

-- ══════════════════════════════════════════════════════════════
-- Grant ALL 20 items to a specific user
-- Replace YOUR_USER_ID_HERE with your actual auth.users UUID
-- You can find it in Supabase → Authentication → Users
-- ══════════════════════════════════════════════════════════════

-- Uncomment and run this after getting your user ID:
/*
INSERT INTO user_inventory (user_id, item_id, quantity, equipped, equipped_slot)
SELECT
  '49ea838e-f4a7-41a7-a0c6-32caceb1445b'::uuid,
  id,
  1,
  FALSE,
  NULL
FROM items
ON CONFLICT (user_id, item_id) DO NOTHING;
*/

-- ── Verify ──────────────────────────────────────────────────
SELECT id, name, type, class_affinity, rarity, thumbnail_url FROM items ORDER BY class_affinity, type;
SELECT id, user_id, item_id, quantity, equipped, equipped_slot FROM user_inventory ORDER BY user_id