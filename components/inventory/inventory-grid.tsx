'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface InventoryItem {
    id: string
    quantity: number
    equipped: boolean
    equipped_slot: string | null
    items: {
        id: string
        name: string
        description: string | null
        type: string
        rarity: string
        class_affinity: string | null
        thumbnail_url: string | null
        coin_value: number
    } | null
}

interface UserCase {
    id: string
    quantity: number
    cases: {
        id: string
        name: string
        description: string | null
        rarity: string
        thumbnail_url: string | null
    } | null
}

interface InventoryGridProps {
    inventory: InventoryItem[]
    userCases: UserCase[]
}

type TabType = 'all' | 'head' | 'body' | 'arm' | 'leg' | 'weapon' | 'consumable' | 'cases'

const TABS: Array<{ value: TabType; label: string }> = [
    { value: 'all', label: 'ALL' },
    { value: 'head', label: 'HEADS' },
    { value: 'body', label: 'BODIES' },
    { value: 'arm', label: 'ARMS' },
    { value: 'leg', label: 'LEGS' },
    { value: 'weapon', label: 'WEAPONS' },
    { value: 'consumable', label: 'CONSUMABLES' },
    { value: 'cases', label: 'CASES' },
]

const RARITY_COLORS: Record<string, string> = {
    common: 'var(--rarity-common)',
    uncommon: 'var(--rarity-uncommon)',
    rare: 'var(--rarity-rare)',
    epic: 'var(--rarity-epic)',
    legendary: 'var(--rarity-legendary)',
    mythic: 'var(--rarity-mythic)',
}

const RARITY_BG: Record<string, string> = {
    common: 'var(--gradient-case-common)',
    uncommon: 'linear-gradient(135deg, #065F46, #4ADE80)',
    rare: 'var(--gradient-case-rare)',
    epic: 'linear-gradient(135deg, #581C87, #A855F7)',
    legendary: 'var(--gradient-case-legendary)',
    mythic: 'var(--gradient-case-mythic)',
}

function ItemCard({ item, onClick }: { item: InventoryItem; onClick: () => void }) {
    const i = item.items
    if (!i) return null
    const rarityColor = RARITY_COLORS[i.rarity] ?? RARITY_COLORS.common

    return (
        <button
            onClick={onClick}
            className="group relative flex flex-col items-center rounded-xl p-3 text-left transition-all duration-200 hover:scale-105"
            style={{
                background: 'var(--bg-card)',
                border: `1px solid ${rarityColor}33`,
            }}
        >
            {/* Equipped badge */}
            {item.equipped && (
                <div className="absolute top-2 left-2 h-4 w-4 rounded-full bg-green-500 flex items-center justify-center text-[8px] text-white font-bold">
                    ✓
                </div>
            )}

            {/* Quantity badge */}
            {item.quantity > 1 && (
                <div className="absolute top-2 right-2 rounded-full px-1.5 py-0.5 text-[10px] font-bold"
                    style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)' }}>
                    x{item.quantity}
                </div>
            )}

            {/* Item preview */}
            <div className="mb-2 flex h-20 w-20 items-center justify-center rounded-lg"
                style={{ background: `${rarityColor}15` }}>
                {i.thumbnail_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={i.thumbnail_url} alt={i.name} className="h-16 w-16 object-contain" />
                ) : (
                    <div className="text-3xl opacity-50">
                        {i.type === 'head' ? '🪖' : i.type === 'body' ? '🛡️' : i.type === 'weapon' ? '⚔️' : '📦'}
                    </div>
                )}
            </div>

            {/* Rarity badge */}
            <span className="mb-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                style={{ color: rarityColor, background: `${rarityColor}20` }}>
                ◆ {i.rarity}
            </span>

            {/* Name */}
            <span className="text-center text-xs font-medium text-foreground line-clamp-1">
                {i.name}
            </span>

            {/* Type + class */}
            <span className="text-center text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                {i.type}{i.class_affinity && i.class_affinity !== 'neutral' ? ` • ${i.class_affinity}` : ''}
            </span>
        </button>
    )
}

function CaseCard({ userCase }: { userCase: UserCase }) {
    const c = userCase.cases
    if (!c) return null
    const rarityColor = RARITY_COLORS[c.rarity] ?? RARITY_COLORS.common

    return (
        <button
            className="group relative flex flex-col items-center rounded-xl p-3 text-left transition-all duration-200 hover:scale-105"
            style={{
                background: RARITY_BG[c.rarity] ?? 'var(--bg-card)',
                border: `1px solid ${rarityColor}55`,
            }}
        >
            {userCase.quantity > 1 && (
                <div className="absolute top-2 right-2 rounded-full px-1.5 py-0.5 text-[10px] font-bold bg-black/50 text-white">
                    x{userCase.quantity}
                </div>
            )}

            <div className="mb-2 flex h-20 w-20 items-center justify-center">
                <div className="text-4xl">📦</div>
            </div>

            <span className="mb-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                style={{ color: rarityColor, background: 'rgba(0,0,0,0.3)' }}>
                {c.rarity} CASE
            </span>

            <span className="text-center text-xs font-medium text-white line-clamp-1">
                {c.name}
            </span>
        </button>
    )
}

export function InventoryGrid({ inventory, userCases }: InventoryGridProps) {
    const [activeTab, setActiveTab] = useState<TabType>('all')
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
    const [items, setItems] = useState(inventory)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleEquip = async (item: InventoryItem) => {
        if (loading || !item.items) return
        setLoading(true)
        const action = item.equipped ? 'unequip' : 'equip'
        try {
            const res = await fetch('/api/inventory/equip', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ inventoryId: item.id, action }),
            })
            if (res.ok) {
                // Optimistic update
                setItems((prev) =>
                    prev.map((inv) => {
                        if (inv.id === item.id) {
                            return { ...inv, equipped: action === 'equip', equipped_slot: action === 'equip' ? inv.items?.type ?? null : null }
                        }
                        // Unequip any item in the same slot
                        if (action === 'equip' && inv.equipped && inv.items?.type === item.items?.type) {
                            return { ...inv, equipped: false, equipped_slot: null }
                        }
                        return inv
                    })
                )
                setSelectedItem((prev) => {
                    if (prev?.id === item.id) {
                        return { ...prev, equipped: action === 'equip', equipped_slot: action === 'equip' ? prev.items?.type ?? null : null }
                    }
                    return prev
                })
                router.refresh()
            }
        } finally {
            setLoading(false)
        }
    }

    const filteredItems = activeTab === 'all'
        ? items
        : activeTab === 'cases'
            ? []
            : items.filter((item) => item.items?.type === activeTab)

    const showCases = activeTab === 'all' || activeTab === 'cases'

    return (
        <div className="flex flex-col lg:flex-row gap-6">
            {/* Main content */}
            <div className="flex-1">
                {/* Tabs */}
                <div className="mb-4 flex flex-wrap gap-2">
                    {TABS.map((tab) => (
                        <button
                            key={tab.value}
                            onClick={() => { setActiveTab(tab.value); setSelectedItem(null) }}
                            className="rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors"
                            style={{
                                background: activeTab === tab.value ? 'var(--accent-cyan)' : 'var(--bg-card)',
                                color: activeTab === tab.value ? 'var(--bg-base)' : 'var(--text-secondary)',
                                border: `1px solid ${activeTab === tab.value ? 'var(--accent-cyan)' : 'var(--glass-border)'}`,
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Grid */}
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
                    {filteredItems.map((item) => (
                        <ItemCard key={item.id} item={item} onClick={() => setSelectedItem(item)} />
                    ))}
                    {showCases && userCases.map((uc) => (
                        <CaseCard key={uc.id} userCase={uc} />
                    ))}
                </div>

                {filteredItems.length === 0 && (!showCases || userCases.length === 0) && (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="text-4xl mb-4">🎒</div>
                        <h3 className="font-display text-lg font-bold text-foreground mb-1">No items yet</h3>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            Complete quests to earn cases and discover items!
                        </p>
                    </div>
                )}
            </div>

            {/* Detail panel */}
            {selectedItem && selectedItem.items && (
                <div className="w-full lg:w-80 rounded-2xl p-5"
                    style={{ background: 'var(--bg-card-elevated)', border: '1px solid var(--glass-border)' }}>
                    <div className="flex flex-col items-center gap-4">
                        <div className="h-32 w-32 rounded-xl flex items-center justify-center"
                            style={{ background: `${RARITY_COLORS[selectedItem.items.rarity]}15` }}>
                            {selectedItem.items.thumbnail_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={selectedItem.items.thumbnail_url} alt={selectedItem.items.name}
                                    className="h-24 w-24 object-contain" />
                            ) : (
                                <div className="text-6xl opacity-50">📦</div>
                            )}
                        </div>

                        <div className="text-center">
                            <h3 className="font-display text-lg font-bold text-foreground">
                                {selectedItem.items.name}
                            </h3>
                            <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                                style={{
                                    color: RARITY_COLORS[selectedItem.items.rarity],
                                    background: `${RARITY_COLORS[selectedItem.items.rarity]}20`,
                                }}>
                                ◆ {selectedItem.items.rarity}
                            </span>
                        </div>

                        {selectedItem.items.description && (
                            <p className="text-sm text-center" style={{ color: 'var(--text-secondary)' }}>
                                {selectedItem.items.description}
                            </p>
                        )}

                        <div className="w-full flex flex-col gap-2 mt-2">
                            <button
                                onClick={() => handleEquip(selectedItem)}
                                disabled={loading}
                                className="w-full rounded-lg px-4 py-2.5 font-display text-sm font-bold uppercase tracking-wider text-white transition-all hover:opacity-90 disabled:opacity-50"
                                style={{ background: 'var(--gradient-brand)' }}>
                                {loading ? '...' : selectedItem.equipped ? 'Unequip' : 'Equip'}
                            </button>
                            <button className="w-full rounded-lg px-4 py-2.5 font-display text-sm font-bold uppercase tracking-wider transition-all hover:opacity-90"
                                style={{ background: 'var(--accent-gold-dim)', color: 'var(--coin-color)', border: '1px solid var(--coin-color)' }}>
                                Sell for {selectedItem.items.coin_value} 🪙
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
