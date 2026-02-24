import type { RankTier } from '@/lib/xpUtils'

// ─── Class Base Styles ─────────────────────────────────────────────────────
export type CharacterClass = 'Adventurer' | 'Thinker' | 'Guardian' | 'Connector'

export interface ClassStyle {
    bodyColor: string
    accentColor: string
    skinTone: string
    proportions: { headScale: number; torsoWidth: number; limbWidth: number }
}

export const CLASS_STYLES: Record<CharacterClass, ClassStyle> = {
    Adventurer: {
        bodyColor: '#2D4A6F',   // dark blue-gray armor
        accentColor: '#00F5FF', // cyan accent
        skinTone: '#E8C4A0',
        proportions: { headScale: 1.0, torsoWidth: 1.0, limbWidth: 1.0 },
    },
    Thinker: {
        bodyColor: '#4A2D6F',   // purple robe
        accentColor: '#C17FFF', // lavender
        skinTone: '#F0D5B8',
        proportions: { headScale: 1.1, torsoWidth: 0.9, limbWidth: 0.85 },
    },
    Guardian: {
        bodyColor: '#5A3A2A',   // brown leather
        accentColor: '#CD7F32', // bronze
        skinTone: '#D4A574',
        proportions: { headScale: 0.95, torsoWidth: 1.2, limbWidth: 1.15 },
    },
    Connector: {
        bodyColor: '#2A5A3A',   // forest green
        accentColor: '#22C55E', // emerald
        skinTone: '#E8C4A0',
        proportions: { headScale: 1.0, torsoWidth: 0.95, limbWidth: 0.95 },
    },
}

// Map personality_type from Supabase to class
export const PERSONALITY_TO_CLASS: Record<string, CharacterClass> = {
    adventurer: 'Adventurer',
    thinker: 'Thinker',
    guardian: 'Guardian',
    connector: 'Connector',
}

// ─── Equipment Visual Config ────────────────────────────────────────────────

export type EquipSlot = 'Head' | 'Body' | 'Arms' | 'Legs' | 'Weapon'

export interface EquipVisual {
    color: string
    emissive: string
    emissiveIntensity: number
    scaleMultiplier: number
}

const RARITY_VISUALS: Record<string, { color: string; emissive: string; emissiveIntensity: number }> = {
    Common: { color: '#9CA3AF', emissive: '#000000', emissiveIntensity: 0 },
    Uncommon: { color: '#22C55E', emissive: '#22C55E', emissiveIntensity: 0.1 },
    Rare: { color: '#3B82F6', emissive: '#3B82F6', emissiveIntensity: 0.2 },
    Epic: { color: '#9B4EDD', emissive: '#9B4EDD', emissiveIntensity: 0.3 },
    Legendary: { color: '#FFD700', emissive: '#FFD700', emissiveIntensity: 0.5 },
    Mythic: { color: '#00F5FF', emissive: '#00F5FF', emissiveIntensity: 0.8 },
}

export function getEquipVisual(rarity: string): EquipVisual {
    const rv = RARITY_VISUALS[rarity] || RARITY_VISUALS.Common
    return { ...rv, scaleMultiplier: 1.0 }
}

// ─── Rank Effects ───────────────────────────────────────────────────────────

export interface RankEffect {
    glowIntensity: number
    bloomStrength: number
    auraColor: string
    hasParticles: boolean
    autoRotateSpeed: number
}

export const RANK_EFFECTS: Record<RankTier, RankEffect> = {
    iron: { glowIntensity: 0, bloomStrength: 0, auraColor: '#8B8B8B', hasParticles: false, autoRotateSpeed: 1.5 },
    bronze: { glowIntensity: 0.1, bloomStrength: 0.2, auraColor: '#CD7F32', hasParticles: false, autoRotateSpeed: 1.5 },
    silver: { glowIntensity: 0.15, bloomStrength: 0.3, auraColor: '#C0C0C0', hasParticles: false, autoRotateSpeed: 1.8 },
    gold: { glowIntensity: 0.3, bloomStrength: 0.5, auraColor: '#FFD700', hasParticles: false, autoRotateSpeed: 2.0 },
    platinum: { glowIntensity: 0.4, bloomStrength: 0.6, auraColor: '#00CED1', hasParticles: true, autoRotateSpeed: 2.0 },
    diamond: { glowIntensity: 0.5, bloomStrength: 0.7, auraColor: '#00BFFF', hasParticles: true, autoRotateSpeed: 2.2 },
    master: { glowIntensity: 0.6, bloomStrength: 0.8, auraColor: '#9B59B6', hasParticles: true, autoRotateSpeed: 2.5 },
    grandmaster: { glowIntensity: 0.8, bloomStrength: 1.0, auraColor: '#FF4500', hasParticles: true, autoRotateSpeed: 2.8 },
    challenger: { glowIntensity: 1.0, bloomStrength: 1.2, auraColor: '#FFFFFF', hasParticles: true, autoRotateSpeed: 3.0 },
}

// ─── Weapon Shape Types ─────────────────────────────────────────────────────

export type WeaponShape = 'sword' | 'staff' | 'hammer' | 'dagger' | 'scepter'

// Map item names to weapon shapes
export function getWeaponShape(itemName: string): WeaponShape {
    const lower = itemName.toLowerCase()
    if (lower.includes('staff') || lower.includes('scepter') || lower.includes('rod')) return 'staff'
    if (lower.includes('hammer') || lower.includes('mace')) return 'hammer'
    if (lower.includes('dagger') || lower.includes('knife')) return 'dagger'
    if (lower.includes('scepter') || lower.includes('void')) return 'scepter'
    return 'sword'
}
