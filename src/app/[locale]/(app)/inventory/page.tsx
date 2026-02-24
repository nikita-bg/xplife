'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import gsap from 'gsap';
import { Coins, Shield, Sword, Shirt, Footprints, HardHat, Check, AlertTriangle, type LucideIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { EquippedItemData } from '@/components/avatar/VoxelAvatar';

const AvatarCanvas = dynamic(() => import('@/components/avatar/AvatarCanvas'), { ssr: false });

interface InventoryItem {
    inventoryId: string;
    id: string;
    name: string;
    type: string;
    rarity: string;
    price: number;
    emoji: string;
    description: string | null;
    class_restriction: string | null;
    acquiredAt: string;
}

interface EquippedItem {
    id: string;
    name: string;
    type: string;
    rarity: string;
    emoji: string;
}

const rarityStyles: Record<string, { border: string; text: string; bg: string; glow: string }> = {
    Common: { border: 'border-gray-500/30', text: 'text-gray-400', bg: 'bg-gray-500', glow: '' },
    Uncommon: { border: 'border-green-500/30', text: 'text-green-400', bg: 'bg-green-500', glow: '' },
    Rare: { border: 'border-blue-500/30', text: 'text-blue-400', bg: 'bg-blue-500', glow: 'shadow-[0_0_15px_rgba(59,130,246,0.2)]' },
    Epic: { border: 'border-purple-500/30', text: 'text-purple-400', bg: 'bg-purple-500', glow: 'shadow-[0_0_15px_rgba(168,85,247,0.2)]' },
    Legendary: { border: 'border-yellow-500/30', text: 'text-yellow-400', bg: 'bg-yellow-500', glow: 'shadow-[0_0_20px_rgba(234,179,8,0.3)]' },
    Mythic: { border: 'border-red-500/30', text: 'text-red-400', bg: 'bg-red-500', glow: 'shadow-[0_0_20px_rgba(239,68,68,0.3)]' },
};

const filterTypes = ['All', 'Head', 'Body', 'Arms', 'Legs', 'Weapon'];
const slotIcons: Record<string, LucideIcon> = { Head: HardHat, Body: Shirt, Arms: Shield, Legs: Footprints, Weapon: Sword };
const equippedSlots = ['Head', 'Body', 'Arms', 'Legs', 'Weapon'];

export default function InventoryPage() {
    const t = useTranslations('inventory');
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [equipped, setEquipped] = useState<Record<string, EquippedItem | null>>({});
    const [goldBalance, setGoldBalance] = useState(0);
    const [filter, setFilter] = useState('All');
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [toast, setToast] = useState('');
    const [toastError, setToastError] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchInventory = useCallback(async () => {
        try {
            const res = await fetch('/api/inventory');
            if (res.ok) {
                const data = await res.json();
                setItems(data.items || []);
                setEquipped(data.equipped || {});
                setGoldBalance(data.goldBalance || 0);
            }
        } catch (err) {
            console.error('Failed to load inventory:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchInventory(); }, [fetchInventory]);

    const avatarEquipped = useMemo<EquippedItemData[]>(() => {
        const result: EquippedItemData[] = [];
        for (const [slot, item] of Object.entries(equipped)) {
            if (item && typeof item === 'object') {
                const i = item as EquippedItem;
                result.push({ slot: slot as EquippedItemData['slot'], name: i.name || '', rarity: i.rarity || 'Common' });
            }
        }
        return result;
    }, [equipped]);

    const filtered = filter === 'All' ? items : items.filter(i => i.type === filter);

    useEffect(() => {
        if (!loading && filtered.length > 0) {
            gsap.from('.inv-card', { y: 30, opacity: 0, stagger: 0.05, duration: 0.4, ease: 'power3.out' });
        }
    }, [filter, loading, filtered.length]);

    const isEquipped = (itemId: string) => {
        return Object.values(equipped).some(eq => eq && eq.id === itemId);
    };

    const handleEquip = async (item: InventoryItem) => {
        setActionLoading(true);
        try {
            const res = await fetch('/api/inventory/equip', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ itemId: item.id }),
            });
            const data = await res.json();
            if (data.success) {
                setToast(`${item.name} equipped!`);
                setSelectedItem(null);
                await fetchInventory();
                setTimeout(() => setToast(''), 3000);
            } else {
                setToastError(data.error || 'Failed to equip');
                setTimeout(() => setToastError(''), 3000);
            }
        } catch {
            setToastError('Connection error');
            setTimeout(() => setToastError(''), 3000);
        } finally {
            setActionLoading(false);
        }
    };

    const handleUnequip = async (slot: string) => {
        setActionLoading(true);
        try {
            const res = await fetch('/api/inventory/equip', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ slot, unequip: true }),
            });
            const data = await res.json();
            if (data.success) {
                setToast(`${slot} unequipped`);
                await fetchInventory();
                setTimeout(() => setToast(''), 3000);
            }
        } catch {
            setToastError('Connection error');
            setTimeout(() => setToastError(''), 3000);
        } finally {
            setActionLoading(false);
        }
    };

    const handleSell = async (item: InventoryItem) => {
        setActionLoading(true);
        try {
            const res = await fetch('/api/inventory/sell', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ itemId: item.id }),
            });
            const data = await res.json();
            if (data.success) {
                setToast(`Sold ${item.name} for 🪙 ${data.earned}`);
                setSelectedItem(null);
                setGoldBalance(data.newBalance);
                await fetchInventory();
                setTimeout(() => setToast(''), 3000);
            } else {
                setToastError(data.error || 'Failed to sell');
                setTimeout(() => setToastError(''), 3000);
            }
        } catch {
            setToastError('Connection error');
            setTimeout(() => setToastError(''), 3000);
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-32">
                <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <div className="flex items-center gap-3">
                    <h1 className="font-heading font-black text-3xl md:text-4xl uppercase tracking-tight text-white">{t('title')}</h1>
                    <span className="font-data text-xs bg-white/10 px-2 py-1 rounded-full text-ghost/60">{items.length} items</span>
                </div>
                <div className="flex items-center gap-2 font-data text-lg text-amber-400">
                    <Coins size={18} /><span className="font-bold">{goldBalance.toLocaleString()}</span>
                    <span className="text-xs text-ghost/40">🪙</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Main Grid */}
                <div className="lg:col-span-9">
                    <div className="flex gap-2 mb-6 flex-wrap">
                        {filterTypes.map(f => (
                            <button key={f} onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-xl font-data text-xs uppercase tracking-wider transition-all ${filter === f ? 'bg-accent text-background font-bold' : 'bg-white/5 text-ghost/50 hover:text-ghost hover:bg-white/10'}`}>
                                {f}
                            </button>
                        ))}
                    </div>

                    {filtered.length === 0 ? (
                        <div className="text-center py-16">
                            <p className="font-data text-xs text-ghost/30 uppercase tracking-wider mb-2">
                                {items.length === 0 ? 'No items yet' : 'No items in this category'}
                            </p>
                            {items.length === 0 && (
                                <p className="font-sans text-sm text-ghost/40">Visit the Market to buy your first item!</p>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filtered.map(item => {
                                const rs = rarityStyles[item.rarity] || rarityStyles.Common;
                                const Icon = slotIcons[item.type] || Shield;
                                const eq = isEquipped(item.id);
                                return (
                                    <div key={item.inventoryId} onClick={() => setSelectedItem(item)}
                                        className={`inv-card bg-[#0C1021] rounded-[1.5rem] border ${rs.border} ${rs.glow} p-4 cursor-pointer hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group`}>
                                        {item.rarity === 'Mythic' && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_2s_infinite] pointer-events-none" />}
                                        {eq && <div className="absolute top-3 right-3 font-data text-[9px] bg-accent/20 text-accent px-1.5 py-0.5 rounded border border-accent/30">{t('equipped').toUpperCase()}</div>}
                                        <div className={`w-full aspect-square rounded-xl ${rs.bg}/10 flex items-center justify-center mb-3 text-3xl`}>
                                            {item.emoji}
                                        </div>
                                        <div className="font-heading text-xs font-bold text-white uppercase tracking-wider truncate">{item.name}</div>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className={`font-data text-[10px] ${rs.text}`}>{item.rarity}</span>
                                            <span className="font-data text-[10px] text-amber-400">🪙 {Math.floor(item.price / 2)}</span>
                                        </div>
                                        <div className="flex items-center gap-1 mt-1">
                                            <Icon size={10} className="text-ghost/30" />
                                            <span className="font-data text-[9px] text-ghost/30">{item.type}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Equipped Panel */}
                <div className="lg:col-span-3">
                    {/* Live 3D Avatar Preview */}
                    <div className="bg-[#0C1021] rounded-[2rem] border border-white/5 p-4 mb-4">
                        <AvatarCanvas
                            rank="iron"
                            equipped={avatarEquipped}
                            size="sm"
                            interactive={false}
                        />
                    </div>
                    <div className="bg-[#0C1021] rounded-[2rem] border border-white/5 p-5 sticky top-8">
                        <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-ghost/60 mb-4">{t('equipped')}</h3>
                        <div className="space-y-3">
                            {equippedSlots.map(slot => {
                                const eq = equipped[slot] as EquippedItem | null;
                                const Icon = slotIcons[slot];
                                return (
                                    <div key={slot}
                                        onClick={() => eq && handleUnequip(slot)}
                                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${eq ? 'border-accent/20 bg-accent/5 cursor-pointer hover:border-accent/40' : 'border-dashed border-white/10'}`}>
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${eq ? 'bg-accent/10 text-accent' : 'bg-white/5 text-ghost/20'}`}>
                                            {eq ? <span className="text-sm">{eq.emoji}</span> : <Icon size={16} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className={`font-sans text-xs ${eq ? 'text-white' : 'text-ghost/20'} truncate`}>{eq ? eq.name : t('empty')}</div>
                                            <div className="font-data text-[10px] text-ghost/30">{slot}</div>
                                        </div>
                                        {eq && <span className="font-data text-[8px] text-ghost/20 uppercase">tap to remove</span>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Item Detail Modal */}
            {selectedItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => !actionLoading && setSelectedItem(null)}>
                    <div className="bg-[#0E1226] rounded-[2rem] border border-white/10 p-8 max-w-md w-full" onClick={e => e.stopPropagation()}>
                        <div className="text-5xl text-center mb-4">{selectedItem.emoji}</div>
                        <h3 className="font-heading font-bold text-xl text-white text-center mb-1">{selectedItem.name}</h3>
                        <div className={`font-data text-xs text-center ${(rarityStyles[selectedItem.rarity] || rarityStyles.Common).text} mb-1`}>
                            {selectedItem.rarity} {selectedItem.type}
                        </div>
                        {selectedItem.description && (
                            <p className="font-sans text-xs text-ghost/40 text-center mb-4">{selectedItem.description}</p>
                        )}
                        <div className="font-data text-xs text-center text-amber-400 mb-6">
                            Sell value: 🪙 {Math.floor(selectedItem.price / 2)}
                        </div>
                        <div className="flex gap-3">
                            {isEquipped(selectedItem.id) ? (
                                <button onClick={() => handleUnequip(selectedItem.type)} disabled={actionLoading}
                                    className="flex-1 py-3 rounded-xl bg-white/10 text-ghost font-heading text-sm uppercase tracking-wider font-bold disabled:opacity-50">
                                    {actionLoading ? '...' : 'Unequip'}
                                </button>
                            ) : (
                                <button onClick={() => handleEquip(selectedItem)} disabled={actionLoading}
                                    className="flex-1 py-3 rounded-xl bg-accent text-background font-heading text-sm uppercase tracking-wider font-bold disabled:opacity-50">
                                    {actionLoading ? '...' : t('equip')}
                                </button>
                            )}
                            <button onClick={() => handleSell(selectedItem)} disabled={actionLoading}
                                className="flex-1 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-heading text-sm uppercase tracking-wider font-bold disabled:opacity-50">
                                {actionLoading ? '...' : `${t('sell')} 🪙${Math.floor(selectedItem.price / 2)}`}
                            </button>
                        </div>
                        <button onClick={() => setSelectedItem(null)} disabled={actionLoading}
                            className="w-full mt-3 py-2 rounded-xl bg-white/5 text-ghost/40 font-sans text-xs hover:bg-white/10 transition-all">
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* Success Toast */}
            {toast && (
                <div className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-50 bg-accent text-background px-6 py-3 rounded-full font-heading text-sm uppercase tracking-wider flex items-center gap-2 shadow-[0_0_30px_rgba(0,245,255,0.3)]">
                    <Check size={16} /> {toast}
                </div>
            )}

            {/* Error Toast */}
            {toastError && (
                <div className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-50 bg-red-500/90 text-white px-6 py-3 rounded-full font-heading text-sm uppercase tracking-wider flex items-center gap-2">
                    <AlertTriangle size={16} /> {toastError}
                </div>
            )}
        </div>
    );
}
