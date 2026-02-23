'use client';

import React, { useState, useEffect } from 'react';
import gsap from 'gsap';
import { Coins, Shield, Sword, Shirt, Footprints, HardHat, Backpack, type LucideIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

const rarityStyles: Record<string, { border: string; text: string; bg: string; glow: string }> = {
    Common: { border: 'border-gray-500/30', text: 'text-gray-400', bg: 'bg-gray-500', glow: '' },
    Uncommon: { border: 'border-green-500/30', text: 'text-green-400', bg: 'bg-green-500', glow: '' },
    Rare: { border: 'border-blue-500/30', text: 'text-blue-400', bg: 'bg-blue-500', glow: 'shadow-[0_0_15px_rgba(59,130,246,0.2)]' },
    Epic: { border: 'border-purple-500/30', text: 'text-purple-400', bg: 'bg-purple-500', glow: 'shadow-[0_0_15px_rgba(168,85,247,0.2)]' },
    Legendary: { border: 'border-yellow-500/30', text: 'text-yellow-400', bg: 'bg-yellow-500', glow: 'shadow-[0_0_20px_rgba(234,179,8,0.3)]' },
    Mythic: { border: 'border-red-500/30', text: 'text-red-400', bg: 'bg-red-500', glow: 'shadow-[0_0_20px_rgba(239,68,68,0.3)]' },
};

const items = [
    { id: 1, name: 'Iron Blade', type: 'Weapon', rarity: 'Common', cls: 'Adventurer', coins: 50, equipped: true },
    { id: 2, name: 'Leather Cap', type: 'Head', rarity: 'Common', cls: 'Adventurer', coins: 30, equipped: true },
    { id: 3, name: 'Scout Vest', type: 'Body', rarity: 'Uncommon', cls: 'Adventurer', coins: 120, equipped: true },
    { id: 4, name: 'Traveler Boots', type: 'Legs', rarity: 'Common', cls: 'Adventurer', coins: 40, equipped: true },
    { id: 5, name: 'Cloth Gloves', type: 'Arms', rarity: 'Common', cls: 'Adventurer', coins: 25, equipped: true },
    { id: 6, name: 'Crystal Staff', type: 'Weapon', rarity: 'Rare', cls: 'Thinker', coins: 450, equipped: false },
    { id: 7, name: 'Shadow Hood', type: 'Head', rarity: 'Epic', cls: 'Guardian', coins: 800, equipped: false },
    { id: 8, name: 'Phoenix Plate', type: 'Body', rarity: 'Legendary', cls: 'Guardian', coins: 2200, equipped: false },
    { id: 9, name: 'Void Gauntlets', type: 'Arms', rarity: 'Mythic', cls: 'Connector', coins: 5000, equipped: false },
    { id: 10, name: 'Wanderer Belt', type: 'Legs', rarity: 'Uncommon', cls: 'Adventurer', coins: 150, equipped: false },
];

const filterTypes = ['All', 'Head', 'Body', 'Arms', 'Legs', 'Weapon'];
const slotIcons: Record<string, LucideIcon> = { Head: HardHat, Body: Shirt, Arms: Shield, Legs: Footprints, Weapon: Sword };

export default function InventoryPage() {
    const t = useTranslations('inventory');
    const [filter, setFilter] = useState('All');
    const [selectedItem, setSelectedItem] = useState<typeof items[0] | null>(null);

    const filtered = filter === 'All' ? items : items.filter(i => i.type === filter);
    const equippedSlots = ['Head', 'Body', 'Arms', 'Legs', 'Weapon'];

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from('.inv-card', { y: 30, opacity: 0, stagger: 0.05, duration: 0.4, ease: 'power3.out' });
        });
        return () => ctx.revert();
    }, [filter]);

    return (
        <div className="relative">
            {/* Coming Soon Overlay */}
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#080B1A]/80 backdrop-blur-sm rounded-3xl">
                <Backpack size={48} className="text-accent/40 mb-4" />
                <h2 className="font-heading text-3xl font-bold text-white uppercase tracking-wider mb-2">Coming Soon</h2>
                <p className="font-sans text-sm text-ghost/40 max-w-xs text-center">Your inventory is being prepared. Equip items and customize your hero soon!</p>
            </div>
            {/* Blurred content behind */}
            <div className="pointer-events-none select-none opacity-40 blur-[2px]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                    <div className="flex items-center gap-3">
                        <h1 className="font-heading font-black text-3xl md:text-4xl uppercase tracking-tight text-white">{t('title')}</h1>
                        <span className="font-data text-xs bg-white/10 px-2 py-1 rounded-full text-ghost/60">{items.length} items</span>
                    </div>
                    <div className="flex items-center gap-2 font-data text-lg text-accent-secondary">
                        <Coins size={18} /><span className="font-bold">2,400 {t('coins')}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-9">
                        <div className="flex gap-2 mb-6 flex-wrap">
                            {filterTypes.map(f => (
                                <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-xl font-data text-xs uppercase tracking-wider transition-all ${filter === f ? 'bg-accent text-background font-bold' : 'bg-white/5 text-ghost/50 hover:text-ghost hover:bg-white/10'}`}>{f}</button>
                            ))}
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filtered.map(item => {
                                const rs = rarityStyles[item.rarity];
                                const Icon = slotIcons[item.type] || Shield;
                                return (
                                    <div key={item.id} onClick={() => setSelectedItem(item)}
                                        className={`inv-card bg-[#0C1021] rounded-[1.5rem] border ${rs.border} ${rs.glow} p-4 cursor-pointer hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group`}>
                                        {item.rarity === 'Mythic' && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_2s_infinite] pointer-events-none"></div>}
                                        {item.equipped && <div className="absolute top-3 right-3 font-data text-[9px] bg-accent/20 text-accent px-1.5 py-0.5 rounded border border-accent/30">{t('equipped').toUpperCase()}</div>}
                                        <div className={`w-full aspect-square rounded-xl ${rs.bg}/10 flex items-center justify-center mb-3`}>
                                            <div className={`w-12 h-12 ${rs.bg}/20 rounded-lg flex items-center justify-center`}>
                                                <Icon size={24} className={rs.text} />
                                            </div>
                                        </div>
                                        <div className="font-heading text-xs font-bold text-white uppercase tracking-wider truncate">{item.name}</div>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className={`font-data text-[10px] ${rs.text}`}>{item.rarity}</span>
                                            <span className="font-data text-[10px] text-accent-secondary">⚡ {item.coins}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="lg:col-span-3">
                        <div className="bg-[#0C1021] rounded-[2rem] border border-white/5 p-5 sticky top-8">
                            <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-ghost/60 mb-4">{t('equipped')}</h3>
                            <div className="space-y-3">
                                {equippedSlots.map(slot => {
                                    const equipped = items.find(i => i.type === slot && i.equipped);
                                    const Icon = slotIcons[slot];
                                    return (
                                        <div key={slot} className={`flex items-center gap-3 p-3 rounded-xl border ${equipped ? 'border-accent/20 bg-accent/5' : 'border-dashed border-white/10'}`}>
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${equipped ? 'bg-accent/10 text-accent' : 'bg-white/5 text-ghost/20'}`}>
                                                <Icon size={16} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className={`font-sans text-xs ${equipped ? 'text-white' : 'text-ghost/20'} truncate`}>{equipped ? equipped.name : t('empty')}</div>
                                                <div className="font-data text-[10px] text-ghost/30">{slot}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {selectedItem && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setSelectedItem(null)}>
                        <div className="bg-[#0E1226] rounded-[2rem] border border-white/10 p-8 max-w-md w-full" onClick={e => e.stopPropagation()}>
                            {(() => {
                                const Icon = slotIcons[selectedItem.type] || Shield; return (
                                    <div className={`w-20 h-20 mx-auto rounded-2xl ${rarityStyles[selectedItem.rarity].bg}/10 flex items-center justify-center mb-4`}>
                                        <Icon size={36} className={rarityStyles[selectedItem.rarity].text} />
                                    </div>
                                );
                            })()}
                            <h3 className="font-heading font-bold text-xl text-white text-center mb-1">{selectedItem.name}</h3>
                            <div className={`font-data text-xs text-center ${rarityStyles[selectedItem.rarity].text} mb-1`}>{selectedItem.rarity} {selectedItem.type}</div>
                            <div className="font-data text-xs text-ghost/40 text-center mb-6">Class: {selectedItem.cls}</div>
                            <div className="flex gap-3">
                                <button className="btn-magnetic flex-1 py-3 rounded-xl bg-accent text-background font-heading text-sm uppercase tracking-wider font-bold">
                                    <span className="btn-content">{selectedItem.equipped ? t('sell') : t('equip')}</span>
                                </button>
                                <button onClick={() => setSelectedItem(null)} className="px-4 py-3 rounded-xl bg-white/5 text-ghost/50 font-heading text-sm uppercase tracking-wider hover:bg-white/10 transition-all">Close</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
