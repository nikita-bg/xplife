'use client'

import { useState, useMemo } from 'react'
import CharacterSVG from '@/components/character/CharacterSVG'
import type { CharacterConfig, ClassType, RankTier } from '@/components/character/CharacterConfig'
import { DEFAULT_PARTS } from '@/components/character/CharacterConfig'
import { CLASS_CONFIG } from '@/lib/character/classConfig'
import { getRankConfig } from '@/lib/character/rankColors'

interface EquippedItem {
    id: string
    name: string
    type: string
    rarity: string
    thumbnail_url: string | null
}

interface CharacterCustomizationProps {
    characterClass: ClassType
    rank: RankTier
    level: number
    equippedItems: EquippedItem[]
}

const SLOT_LABELS: Record<string, { label: string; icon: string }> = {
    head: { label: 'Head', icon: '🪖' },
    body: { label: 'Body', icon: '🛡️' },
    arm: { label: 'Arms', icon: '💪' },
    leg: { label: 'Legs', icon: '🦿' },
    weapon: { label: 'Weapon', icon: '⚔️' },
    aura: { label: 'Aura', icon: '✨' },
}

const RARITY_COLORS: Record<string, string> = {
    common: 'var(--rarity-common)',
    uncommon: 'var(--rarity-uncommon)',
    rare: 'var(--rarity-rare)',
    epic: 'var(--rarity-epic)',
    legendary: 'var(--rarity-legendary)',
    mythic: 'var(--rarity-mythic)',
}

export function CharacterCustomization({
    characterClass,
    rank,
    level,
    equippedItems,
}: CharacterCustomizationProps) {
    const [activeSlot, setActiveSlot] = useState<string | null>(null)

    const classConfig = CLASS_CONFIG[characterClass]
    const rankConfig = getRankConfig(rank)

    const config: CharacterConfig = useMemo(() => ({
        class: characterClass,
        rank,
        parts: { ...DEFAULT_PARTS },
        colors: {
            primary: classConfig?.primary ?? '#FF4500',
            accent: classConfig?.accent ?? '#FFD700',
            rankColor: rankConfig.color,
            glowColor: rankConfig.glow,
        },
    }), [characterClass, rank, classConfig, rankConfig.color, rankConfig.glow])

    const equippedBySlot = useMemo(() => {
        const map: Record<string, EquippedItem> = {}
        equippedItems.forEach((item) => {
            map[item.type] = item
        })
        return map
    }, [equippedItems])

    return (
        <div className="rounded-2xl p-5" style={{ background: 'var(--bg-card-elevated)', border: '1px solid var(--glass-border)' }}>
            <h3 className="font-display text-lg font-bold text-foreground mb-4">
                Character
            </h3>

            <div className="flex flex-col sm:flex-row gap-6">
                {/* Character Preview */}
                <div className="flex flex-col items-center gap-3">
                    <div className="relative w-40 h-48 flex items-center justify-center">
                        <CharacterSVG config={config} className="w-full h-full" />
                    </div>

                    {/* Class & Rank labels */}
                    <div className="text-center">
                        <div className="font-display text-sm font-bold uppercase tracking-wider" style={{ color: classConfig?.primary ?? 'var(--accent-purple)' }}>
                            {classConfig?.label ?? 'Adventurer'}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                                style={{ color: rankConfig.color, background: `${rankConfig.color}20` }}>
                                {rank}
                            </span>
                            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                LVL {level}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Equipment Slots */}
                <div className="flex-1">
                    <p className="text-xs uppercase tracking-wider mb-3" style={{ color: 'var(--text-secondary)' }}>
                        Equipment Slots
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                        {Object.entries(SLOT_LABELS).map(([slot, { label, icon }]) => {
                            const equipped = equippedBySlot[slot]
                            const isActive = activeSlot === slot

                            return (
                                <button
                                    key={slot}
                                    onClick={() => setActiveSlot(isActive ? null : slot)}
                                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-150"
                                    style={{
                                        background: isActive ? 'var(--accent-cyan-dim)' : 'var(--bg-card)',
                                        border: `1px solid ${isActive ? 'var(--accent-cyan)' : equipped ? (RARITY_COLORS[equipped.rarity] ?? 'var(--glass-border)') + '55' : 'var(--glass-border)'}`,
                                    }}
                                >
                                    <span className="text-lg">{icon}</span>
                                    <div className="min-w-0 flex-1">
                                        <span className="block text-xs font-bold text-foreground truncate">
                                            {equipped ? equipped.name : label}
                                        </span>
                                        {equipped ? (
                                            <span className="text-[10px] uppercase tracking-wider"
                                                style={{ color: RARITY_COLORS[equipped.rarity] ?? 'var(--text-secondary)' }}>
                                                ◆ {equipped.rarity}
                                            </span>
                                        ) : (
                                            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                                                Empty
                                            </span>
                                        )}
                                    </div>
                                </button>
                            )
                        })}
                    </div>

                    {/* Empty state */}
                    {equippedItems.length === 0 && (
                        <div className="mt-4 rounded-lg p-3 text-center" style={{ background: 'var(--bg-card)' }}>
                            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                Complete quests and open cases to get equipment!
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
