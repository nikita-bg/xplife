/**
 * Item Registry — all 20 base equipment items for XPLife.
 * References SVG files in public/character-system/items/ rather than inlining.
 */

export type ItemType = 'head' | 'body' | 'arms' | 'legs' | 'weapon'
export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic'
export type ClassAffinity = 'adventurer' | 'thinker' | 'guardian' | 'connector' | 'neutral'

export interface GameItem {
    id: string
    name: string
    type: ItemType
    rarity: ItemRarity
    classAffinity: ClassAffinity
    primaryColor: string
    accentColor: string
    svgPath: string
    coinValue: number
    description: string
}

export const ITEM_REGISTRY: GameItem[] = [
    // ── Adventurer (orange/gold) ──────────────────────────────────
    {
        id: 'flame_helm_adventurer',
        name: 'Flame Helm',
        type: 'head',
        rarity: 'common',
        classAffinity: 'adventurer',
        primaryColor: '#FF4500',
        accentColor: '#FFD700',
        svgPath: '/character-system/items/flame_helm_adventurer.svg',
        coinValue: 50,
        description: 'Forged in dragon fire. The visor glows with battle hunger.',
    },
    {
        id: 'berserker_plate_adventurer',
        name: 'Berserker Plate',
        type: 'body',
        rarity: 'common',
        classAffinity: 'adventurer',
        primaryColor: '#FF4500',
        accentColor: '#FFD700',
        svgPath: '/character-system/items/berserker_plate_adventurer.svg',
        coinValue: 60,
        description: 'Wide shoulderpads embossed with a fire emblem. Pure aggression.',
    },
    {
        id: 'crusher_gauntlets_adventurer',
        name: 'Crusher Gauntlets',
        type: 'arms',
        rarity: 'common',
        classAffinity: 'adventurer',
        primaryColor: '#FF4500',
        accentColor: '#FFD700',
        svgPath: '/character-system/items/crusher_gauntlets_adventurer.svg',
        coinValue: 45,
        description: 'Spiked knuckles that crunch through any obstacle.',
    },
    {
        id: 'warlord_greaves_adventurer',
        name: 'Warlord Greaves',
        type: 'legs',
        rarity: 'common',
        classAffinity: 'adventurer',
        primaryColor: '#FF4500',
        accentColor: '#FFD700',
        svgPath: '/character-system/items/warlord_greaves_adventurer.svg',
        coinValue: 45,
        description: 'Knee-spiked leg armor built for charging into battle.',
    },
    {
        id: 'inferno_blade_adventurer',
        name: 'Inferno Blade',
        type: 'weapon',
        rarity: 'common',
        classAffinity: 'adventurer',
        primaryColor: '#FF4500',
        accentColor: '#FFD700',
        svgPath: '/character-system/items/inferno_blade_adventurer.svg',
        coinValue: 80,
        description: 'A blade of stacked fire cubes. Burns everything it touches.',
    },

    // ── Thinker (blue/ice) ────────────────────────────────────────
    {
        id: 'neural_crown_thinker',
        name: 'Neural Crown',
        type: 'head',
        rarity: 'common',
        classAffinity: 'thinker',
        primaryColor: '#00BFFF',
        accentColor: '#E0F4FF',
        svgPath: '/character-system/items/neural_crown_thinker.svg',
        coinValue: 50,
        description: 'Circuit-trace headset with a holographic visor and antenna.',
    },
    {
        id: 'circuit_robe_thinker',
        name: 'Circuit Robe',
        type: 'body',
        rarity: 'common',
        classAffinity: 'thinker',
        primaryColor: '#00BFFF',
        accentColor: '#E0F4FF',
        svgPath: '/character-system/items/circuit_robe_thinker.svg',
        coinValue: 60,
        description: 'Slim torso with hexagonal patterns and inner circuit glow.',
    },
    {
        id: 'data_gloves_thinker',
        name: 'Data Gloves',
        type: 'arms',
        rarity: 'common',
        classAffinity: 'thinker',
        primaryColor: '#00BFFF',
        accentColor: '#E0F4FF',
        svgPath: '/character-system/items/data_gloves_thinker.svg',
        coinValue: 45,
        description: 'Elegant arm pieces with holographic forearm projections.',
    },
    {
        id: 'flux_boots_thinker',
        name: 'Flux Boots',
        type: 'legs',
        rarity: 'common',
        classAffinity: 'thinker',
        primaryColor: '#00BFFF',
        accentColor: '#E0F4FF',
        svgPath: '/character-system/items/flux_boots_thinker.svg',
        coinValue: 45,
        description: 'Streamlined leg pieces with upward energy flow lines.',
    },
    {
        id: 'arcane_staff_thinker',
        name: 'Arcane Staff',
        type: 'weapon',
        rarity: 'common',
        classAffinity: 'thinker',
        primaryColor: '#00BFFF',
        accentColor: '#E0F4FF',
        svgPath: '/character-system/items/arcane_staff_thinker.svg',
        coinValue: 80,
        description: 'Crystalline cube orbiting atop a tall staff. Pure arcane power.',
    },

    // ── Guardian (green/gray) ─────────────────────────────────────
    {
        id: 'bastion_helm_guardian',
        name: 'Bastion Helm',
        type: 'head',
        rarity: 'common',
        classAffinity: 'guardian',
        primaryColor: '#00C896',
        accentColor: '#A0AEC0',
        svgPath: '/character-system/items/bastion_helm_guardian.svg',
        coinValue: 50,
        description: 'Ultra-wide shield-helmet with slit visor and ridge spikes.',
    },
    {
        id: 'fortress_chest_guardian',
        name: 'Fortress Chest',
        type: 'body',
        rarity: 'common',
        classAffinity: 'guardian',
        primaryColor: '#00C896',
        accentColor: '#A0AEC0',
        svgPath: '/character-system/items/fortress_chest_guardian.svg',
        coinValue: 60,
        description: 'Massive stone-plated torso with shield emblem. Unbreakable.',
    },
    {
        id: 'tower_shields_guardian',
        name: 'Tower Shields',
        type: 'arms',
        rarity: 'common',
        classAffinity: 'guardian',
        primaryColor: '#00C896',
        accentColor: '#A0AEC0',
        svgPath: '/character-system/items/tower_shields_guardian.svg',
        coinValue: 45,
        description: 'Rectangular arm shields with green emblem and stone texture.',
    },
    {
        id: 'rampart_stompers_guardian',
        name: 'Rampart Stompers',
        type: 'legs',
        rarity: 'common',
        classAffinity: 'guardian',
        primaryColor: '#00C896',
        accentColor: '#A0AEC0',
        svgPath: '/character-system/items/rampart_stompers_guardian.svg',
        coinValue: 45,
        description: 'Thick stone leg blocks with green energy veins at joints.',
    },
    {
        id: 'siege_hammer_guardian',
        name: 'Siege Hammer',
        type: 'weapon',
        rarity: 'common',
        classAffinity: 'guardian',
        primaryColor: '#00C896',
        accentColor: '#A0AEC0',
        svgPath: '/character-system/items/siege_hammer_guardian.svg',
        coinValue: 80,
        description: 'Massive warhammer with stone head and glowing green rune.',
    },

    // ── Connector (purple/gold) ───────────────────────────────────
    {
        id: 'spirit_mask_connector',
        name: 'Spirit Mask',
        type: 'head',
        rarity: 'common',
        classAffinity: 'connector',
        primaryColor: '#C77DFF',
        accentColor: '#FFD166',
        svgPath: '/character-system/items/spirit_mask_connector.svg',
        coinValue: 50,
        description: 'Organic mask with hollow glowing eyes and gold filigree.',
    },
    {
        id: 'harmony_vest_connector',
        name: 'Harmony Vest',
        type: 'body',
        rarity: 'common',
        classAffinity: 'connector',
        primaryColor: '#C77DFF',
        accentColor: '#FFD166',
        svgPath: '/character-system/items/harmony_vest_connector.svg',
        coinValue: 60,
        description: 'Smooth rounded torso with swirling gold chest pattern.',
    },
    {
        id: 'bond_bracers_connector',
        name: 'Bond Bracers',
        type: 'arms',
        rarity: 'common',
        classAffinity: 'connector',
        primaryColor: '#C77DFF',
        accentColor: '#FFD166',
        svgPath: '/character-system/items/bond_bracers_connector.svg',
        coinValue: 45,
        description: 'Elegant bracers with gold ring accents and trailing geometry.',
    },
    {
        id: 'flow_walkers_connector',
        name: 'Flow Walkers',
        type: 'legs',
        rarity: 'common',
        classAffinity: 'connector',
        primaryColor: '#C77DFF',
        accentColor: '#FFD166',
        svgPath: '/character-system/items/flow_walkers_connector.svg',
        coinValue: 45,
        description: 'Tapered legs with gold ankle rings and fabric-wrap effect.',
    },
    {
        id: 'soul_orb_connector',
        name: 'Soul Orb',
        type: 'weapon',
        rarity: 'common',
        classAffinity: 'connector',
        primaryColor: '#C77DFF',
        accentColor: '#FFD166',
        svgPath: '/character-system/items/soul_orb_connector.svg',
        coinValue: 80,
        description: 'Hovering cube-octahedron with golden inner cube and orbiting orbs.',
    },
]

/** Look up an item by its id */
export function getItemById(id: string): GameItem | undefined {
    return ITEM_REGISTRY.find((item) => item.id === id)
}

/** Get all items for a specific class */
export function getItemsByClass(classAffinity: ClassAffinity): GameItem[] {
    return ITEM_REGISTRY.filter((item) => item.classAffinity === classAffinity)
}

/** Get all items of a specific type */
export function getItemsByType(type: ItemType): GameItem[] {
    return ITEM_REGISTRY.filter((item) => item.type === type)
}
