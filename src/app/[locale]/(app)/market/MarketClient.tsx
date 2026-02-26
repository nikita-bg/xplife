'use client';

import React, { useState, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { Search, Coins, Check, AlertTriangle } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ShopItem {
    id: string;
    name: string;
    type: string;
    rarity: string;
    price: number;
    emoji: string;
    description: string | null;
    class_restriction: string | null;
    owned: boolean;
}

const rarityColors: Record<string, string> = {
    Common: 'border-gray-500/30 text-gray-400',
    Uncommon: 'border-green-500/30 text-green-400',
    Rare: 'border-blue-500/30 text-blue-400',
    Epic: 'border-purple-500/30 text-purple-400',
    Legendary: 'border-yellow-500/30 text-yellow-400',
    Mythic: 'border-red-500/30 text-red-400',
};

const rarityGlow: Record<string, string> = {
    Legendary: 'shadow-[0_0_20px_rgba(234,179,8,0.15)]',
    Mythic: 'shadow-[0_0_20px_rgba(239,68,68,0.15)]',
    Epic: 'shadow-[0_0_15px_rgba(168,85,247,0.1)]',
};

export default function MarketClient() {
    const t = useTranslations('market');
    const [items, setItems] = useState<ShopItem[]>([]);
    const [goldBalance, setGoldBalance] = useState(0);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('All');
    const [showConfirm, setShowConfirm] = useState<ShopItem | null>(null);
    const [showSuccess, setShowSuccess] = useState('');
    const [showError, setShowError] = useState('');
    const [buying, setBuying] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchMarket = useCallback(async () => {
        try {
            const res = await fetch('/api/market');
            if (res.ok) {
                const data = await res.json();
                setItems(data.items || []);
                setGoldBalance(data.goldBalance || 0);
            }
        } catch (err) {
            console.error('Failed to load market:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchMarket(); }, [fetchMarket]);

    const filtered = items
        .filter(l => typeFilter === 'All' || l.type === typeFilter)
        .filter(l => l.name.toLowerCase().includes(search.toLowerCase()));

    useEffect(() => {
        if (!loading && filtered.length > 0) {
            gsap.from('.market-card', { y: 30, opacity: 0, stagger: 0.05, duration: 0.4, ease: 'power3.out' });
        }
    }, [search, typeFilter, loading, filtered.length]);

    const handleBuy = async () => {
        if (!showConfirm || buying) return;
        setBuying(true);
        setShowError('');
        try {
            const res = await fetch('/api/market/buy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ itemId: showConfirm.id }),
            });
            const data = await res.json();
            if (data.success) {
                setShowConfirm(null);
                setShowSuccess(data.item);
                setGoldBalance(data.remainingGold);
                // Mark as owned in local state
                setItems(prev => prev.map(i => i.id === showConfirm.id ? { ...i, owned: true } : i));
                setTimeout(() => setShowSuccess(''), 3000);
            } else {
                setShowError(data.error || 'Purchase failed');
            }
        } catch {
            setShowError('Failed to connect');
        } finally {
            setBuying(false);
        }
    };

    const types = ['All', 'Head', 'Body', 'Arms', 'Legs', 'Weapon'];

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
                <div>
                    <h1 className="font-heading font-black text-3xl md:text-4xl uppercase tracking-tight text-white">{t('title')}</h1>
                    <p className="font-sans text-sm text-ghost/40 mt-1">{t('subtitle')}</p>
                </div>
                <div className="flex items-center gap-2 font-data text-lg text-amber-400">
                    <Coins size={18} />
                    <span className="font-bold">{goldBalance.toLocaleString()}</span>
                    <span className="text-xs text-ghost/40">🪙</span>
                </div>
            </div>

            {/* Type Filter */}
            <div className="flex gap-2 mb-6 flex-wrap">
                {types.map(f => (
                    <button key={f} onClick={() => setTypeFilter(f)}
                        className={`px-4 py-2 rounded-xl font-data text-xs uppercase tracking-wider transition-all ${typeFilter === f ? 'bg-accent text-background font-bold' : 'bg-white/5 text-ghost/50 hover:text-ghost hover:bg-white/10'}`}>
                        {f}
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className="relative mb-6">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ghost/30" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('searchPlaceholder')}
                    className="w-full bg-[#0C1021] border border-white/5 rounded-xl py-3 pl-11 pr-4 font-sans text-sm text-ghost placeholder:text-ghost/20 focus:outline-none focus:border-accent/30 transition-colors" />
            </div>

            {/* Items Grid */}
            {filtered.length === 0 ? (
                <div className="text-center py-16">
                    <p className="font-data text-xs text-ghost/30 uppercase tracking-wider">No items found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filtered.map(item => (
                        <div key={item.id}
                            className={`market-card bg-[#0C1021] rounded-[1.5rem] border ${(rarityColors[item.rarity] || '').split(' ')[0]} ${rarityGlow[item.rarity] || ''} p-5 hover:-translate-y-1 transition-all duration-300`}>
                            <div className={`font-data text-[10px] uppercase tracking-widest mb-3 ${(rarityColors[item.rarity] || '').split(' ')[1]}`}>{item.rarity}</div>
                            <div className="w-full aspect-square rounded-xl bg-white/5 flex items-center justify-center mb-4 text-4xl">{item.emoji}</div>
                            <div className="font-heading text-sm font-bold text-white uppercase tracking-wider mb-1">{item.name}</div>
                            <div className="font-data text-[10px] text-ghost/40 mb-1">{item.type}</div>
                            {item.description && <div className="font-sans text-[11px] text-ghost/30 mb-3 line-clamp-2">{item.description}</div>}
                            <div className="flex items-center justify-between mt-auto pt-2">
                                <span className="font-data text-sm text-amber-400 font-bold">🪙 {item.price}</span>
                                {item.owned ? (
                                    <span className="font-data text-[10px] text-accent px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/30 uppercase tracking-wider">
                                        Owned
                                    </span>
                                ) : (
                                    <button onClick={() => setShowConfirm(item)}
                                        disabled={goldBalance < item.price}
                                        className={`px-4 py-2 rounded-lg font-data text-xs uppercase tracking-wider transition-all ${goldBalance >= item.price ? 'bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20' : 'bg-white/5 border border-white/10 text-ghost/30 cursor-not-allowed'}`}>
                                        {goldBalance >= item.price ? t('buy') : 'Need more 🪙'}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Buy Confirm Modal */}
            {showConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => !buying && setShowConfirm(null)}>
                    <div className="bg-[#0E1226] rounded-[2rem] border border-white/10 p-8 max-w-sm w-full text-center" onClick={e => e.stopPropagation()}>
                        <div className="text-5xl mb-4">{showConfirm.emoji}</div>
                        <h3 className="font-heading font-bold text-lg text-white mb-2">{t('confirmPurchase')}</h3>
                        <p className="font-sans text-sm text-ghost/60 mb-2">
                            {t('buy')} <span className="text-accent font-bold">{showConfirm.name}</span>
                        </p>
                        <p className="font-data text-lg text-amber-400 font-bold mb-6">🪙 {showConfirm.price}</p>
                        {showError && (
                            <div className="flex items-center gap-2 text-red-400 text-xs font-sans mb-4 justify-center">
                                <AlertTriangle size={14} /> {showError}
                            </div>
                        )}
                        <div className="flex gap-3">
                            <button onClick={handleBuy} disabled={buying}
                                className="flex-1 py-3 rounded-xl bg-accent text-background font-heading text-sm uppercase tracking-wider font-bold disabled:opacity-50">
                                {buying ? '...' : t('confirm')}
                            </button>
                            <button onClick={() => setShowConfirm(null)} disabled={buying}
                                className="flex-1 py-3 rounded-xl bg-white/5 text-ghost/50 font-heading text-sm uppercase hover:bg-white/10">
                                {t('cancel')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Toast */}
            {showSuccess && (
                <div className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-50 bg-accent text-background px-6 py-3 rounded-full font-heading text-sm uppercase tracking-wider flex items-center gap-2 shadow-[0_0_30px_rgba(0,245,255,0.3)] animate-bounce">
                    <Check size={16} /> {showSuccess} purchased!
                </div>
            )}
        </div>
    );
}
