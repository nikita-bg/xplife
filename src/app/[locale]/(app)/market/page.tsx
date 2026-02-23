'use client';

import React, { useState, useEffect } from 'react';
import gsap from 'gsap';
import { Search, Coins, Check, Store } from 'lucide-react';
import { useTranslations } from 'next-intl';

const listings = [
    { id: 1, name: 'Flame Sword', type: 'Weapon', rarity: 'Rare', price: 350, seller: 'Knight42', time: '2h ago', avatar: '⚔️' },
    { id: 2, name: 'Mystic Robe', type: 'Body', rarity: 'Epic', price: 1200, seller: 'WizardX', time: '5h ago', avatar: '🧙' },
    { id: 3, name: 'Thunder Helm', type: 'Head', rarity: 'Legendary', price: 3500, seller: 'StormLord', time: '1d ago', avatar: '⛈️' },
    { id: 4, name: 'Stealth Boots', type: 'Legs', rarity: 'Uncommon', price: 180, seller: 'ShadowFox', time: '3h ago', avatar: '🦊' },
    { id: 5, name: 'Iron Gauntlets', type: 'Arms', rarity: 'Common', price: 60, seller: 'Smith99', time: '1h ago', avatar: '🔨' },
    { id: 6, name: 'Void Scepter', type: 'Weapon', rarity: 'Mythic', price: 8000, seller: 'DarkMage', time: '30m ago', avatar: '🌑' },
    { id: 7, name: 'Crystal Shield', type: 'Arms', rarity: 'Rare', price: 420, seller: 'Paladin7', time: '4h ago', avatar: '🛡️' },
    { id: 8, name: 'Wind Cloak', type: 'Body', rarity: 'Uncommon', price: 200, seller: 'Ranger12', time: '6h ago', avatar: '🌬️' },
];

const rarityColors: Record<string, string> = {
    Common: 'border-gray-500/30 text-gray-400', Uncommon: 'border-green-500/30 text-green-400',
    Rare: 'border-blue-500/30 text-blue-400', Epic: 'border-purple-500/30 text-purple-400',
    Legendary: 'border-yellow-500/30 text-yellow-400', Mythic: 'border-red-500/30 text-red-400'
};

export default function MarketPage() {
    const t = useTranslations('market');
    const [search, setSearch] = useState('');
    const [showConfirm, setShowConfirm] = useState<typeof listings[0] | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [tab, setTab] = useState('browse');

    const filtered = listings.filter(l => l.name.toLowerCase().includes(search.toLowerCase()));

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from('.market-card', { y: 30, opacity: 0, stagger: 0.05, duration: 0.4, ease: 'power3.out' });
        });
        return () => ctx.revert();
    }, [search]);

    const handleBuy = () => {
        setShowConfirm(null);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
    };

    return (
        <div className="relative">
            {/* Coming Soon Overlay */}
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#080B1A]/80 backdrop-blur-sm rounded-3xl">
                <Store size={48} className="text-accent/40 mb-4" />
                <h2 className="font-heading text-3xl font-bold text-white uppercase tracking-wider mb-2">Coming Soon</h2>
                <p className="font-sans text-sm text-ghost/40 max-w-xs text-center">The marketplace is under construction. Trade items with other heroes soon!</p>
            </div>
            {/* Blurred content behind */}
            <div className="pointer-events-none select-none opacity-40 blur-[2px]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="font-heading font-black text-3xl md:text-4xl uppercase tracking-tight text-white">{t('title')}</h1>
                        <p className="font-sans text-sm text-ghost/40 mt-1">{t('subtitle')}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 font-data text-lg text-accent-secondary"><Coins size={18} /><span className="font-bold">2,400</span></div>
                        <button className="btn-magnetic px-5 py-2.5 rounded-xl bg-accent-secondary/10 border border-accent-secondary/30 text-accent-secondary font-heading text-xs uppercase tracking-wider hover:bg-accent-secondary/20">
                            <span className="btn-content">{t('sellItem')}</span>
                        </button>
                    </div>
                </div>

                <div className="flex gap-2 mb-6">
                    {[{ key: 'browse', label: t('browse') }, { key: 'my listings', label: t('myListings') }].map(item => (
                        <button key={item.key} onClick={() => setTab(item.key)} className={`px-4 py-2 rounded-xl font-data text-xs uppercase tracking-wider transition-all ${tab === item.key ? 'bg-accent text-background font-bold' : 'bg-white/5 text-ghost/50 hover:text-ghost'}`}>{item.label}</button>
                    ))}
                </div>

                <div className="relative mb-6">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ghost/30" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('searchPlaceholder')} className="w-full bg-[#0C1021] border border-white/5 rounded-xl py-3 pl-11 pr-4 font-sans text-sm text-ghost placeholder:text-ghost/20 focus:outline-none focus:border-accent/30 transition-colors" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filtered.map(item => (
                        <div key={item.id} className={`market-card bg-[#0C1021] rounded-[1.5rem] border ${rarityColors[item.rarity].split(' ')[0]} p-5 hover:-translate-y-1 transition-all duration-300`}>
                            <div className={`font-data text-[10px] uppercase tracking-widest mb-3 ${rarityColors[item.rarity].split(' ')[1]}`}>{item.rarity}</div>
                            <div className="w-full aspect-square rounded-xl bg-white/5 flex items-center justify-center mb-4 text-3xl">{item.avatar}</div>
                            <div className="font-heading text-sm font-bold text-white uppercase tracking-wider mb-1">{item.name}</div>
                            <div className="font-data text-[10px] text-ghost/40 mb-3">{item.type}</div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[8px]">👤</div>
                                <span className="font-sans text-xs text-ghost/50">{item.seller}</span>
                                <span className="font-data text-[10px] text-ghost/20 ml-auto">{item.time}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="font-data text-sm text-accent-secondary font-bold">🪙 {item.price}</span>
                                <button onClick={() => setShowConfirm(item)} className="btn-magnetic px-4 py-2 rounded-lg bg-accent/10 border border-accent/30 text-accent font-data text-xs uppercase tracking-wider hover:bg-accent/20">
                                    <span className="btn-content">{t('buy')}</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {showConfirm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowConfirm(null)}>
                        <div className="bg-[#0E1226] rounded-[2rem] border border-white/10 p-8 max-w-sm w-full text-center" onClick={e => e.stopPropagation()}>
                            <h3 className="font-heading font-bold text-lg text-white mb-2">{t('confirmPurchase')}</h3>
                            <p className="font-sans text-sm text-ghost/60 mb-6">{t('buy')} <span className="text-accent font-bold">{showConfirm.name}</span> for <span className="text-accent-secondary font-bold">🪙 {showConfirm.price}</span>?</p>
                            <div className="flex gap-3">
                                <button onClick={handleBuy} className="btn-magnetic flex-1 py-3 rounded-xl bg-accent text-background font-heading text-sm uppercase tracking-wider font-bold"><span className="btn-content">{t('confirm')}</span></button>
                                <button onClick={() => setShowConfirm(null)} className="flex-1 py-3 rounded-xl bg-white/5 text-ghost/50 font-heading text-sm uppercase hover:bg-white/10">{t('cancel')}</button>
                            </div>
                        </div>
                    </div>
                )}

                {showSuccess && (
                    <div className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-50 bg-accent text-background px-6 py-3 rounded-full font-heading text-sm uppercase tracking-wider flex items-center gap-2 shadow-[0_0_30px_rgba(0,245,255,0.3)] animate-bounce">
                        <Check size={16} /> {t('purchaseSuccess')}
                    </div>
                )}
            </div>
        </div>
    );
}
