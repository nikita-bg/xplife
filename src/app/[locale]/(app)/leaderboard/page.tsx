'use client';

import React, { useEffect, useState } from 'react';
import gsap from 'gsap';
import { Crown, TrendingUp } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface Player {
    rank: number;
    id: string;
    name: string;
    avatar_url: string | null;
    cls: string;
    level: number;
    xp: number;
    streak: number;
    isUser: boolean;
}

const podiumColors = ['from-yellow-400 to-yellow-600', 'from-gray-300 to-gray-500', 'from-amber-600 to-amber-800'];
const podiumIcons = [
    <Crown key="g" className="text-yellow-400" size={20} />,
    <Crown key="s" className="text-gray-300" size={16} />,
    <Crown key="b" className="text-amber-600" size={16} />,
];

const classEmoji: Record<string, string> = {
    Adventurer: '🗺️', Thinker: '🧠', Guardian: '🛡️', Connector: '🌿',
};

export default function LeaderboardPage() {
    const t = useTranslations('leaderboard');
    const [players, setPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const res = await fetch('/api/leaderboard');
                if (res.ok) {
                    const data = await res.json();
                    setPlayers(data.leaderboard || []);
                }
            } catch { /* silent */ }
            setLoading(false);
        };
        fetchLeaderboard();
    }, []);

    useEffect(() => {
        if (players.length > 0) {
            const ctx = gsap.context(() => {
                gsap.from('.podium-card', { scale: 0, opacity: 0, stagger: 0.15, duration: 0.6, ease: 'back.out(1.7)', delay: 0.2 });
                gsap.from('.lb-row', { y: 20, opacity: 0, stagger: 0.06, duration: 0.5, ease: 'power3.out', delay: 0.6 });
            });
            return () => ctx.revert();
        }
    }, [players]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
            </div>
        );
    }

    const top3 = players.slice(0, 3);
    const rest = players.slice(3);

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="font-heading font-black text-3xl md:text-4xl uppercase tracking-tight text-white">{t('title')}</h1>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span></span>
                        <span className="font-data text-xs text-ghost/50 tracking-wider">{t('updatedLive')}</span>
                    </div>
                </div>
            </div>

            {players.length === 0 ? (
                <div className="bg-[#0C1021] rounded-[2rem] border border-white/5 p-12 text-center">
                    <TrendingUp size={40} className="mx-auto text-accent/20 mb-4" />
                    <p className="font-sans text-ghost/40">{t('noRankingsDescription')}</p>
                </div>
            ) : (
                <>
                    {/* Top 3 Podium */}
                    {top3.length >= 3 && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                            {top3.map((p, i) => (
                                <div key={p.id} className={`podium-card bg-[#0C1021] rounded-[2rem] border border-white/5 p-6 text-center ${i === 0 ? 'sm:order-2 sm:scale-105 sm:border-yellow-500/30 sm:shadow-[0_0_30px_rgba(255,184,0,0.1)]' : i === 1 ? 'sm:order-1' : 'sm:order-3'}`}>
                                    <div className="flex justify-center mb-3">{podiumIcons[i]}</div>
                                    <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-br ${podiumColors[i]} flex items-center justify-center text-2xl mb-3`}>
                                        {p.avatar_url ? <img src={p.avatar_url} alt="" className="w-full h-full rounded-full object-cover" /> : classEmoji[p.cls] || '🎮'}
                                    </div>
                                    <div className="font-heading font-bold text-white text-lg">{p.name}</div>
                                    <div className="font-data text-xs text-accent-secondary tracking-wider mb-2">{p.cls} · {t('lvlShort', { level: p.level })}</div>
                                    <div className="font-data text-sm text-accent font-bold">{p.xp.toLocaleString()} XP</div>
                                    <div className="font-data text-[10px] text-ghost/30 mt-1">🔥 {t('daysShort', { count: p.streak })}</div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Rest */}
                    <div className="bg-[#0C1021] rounded-[2rem] border border-white/5 overflow-hidden">
                        {rest.map(p => (
                            <div key={p.id} className={`lb-row flex items-center gap-4 px-6 py-4 border-b border-white/5 last:border-0 hover:-translate-y-0.5 transition-all cursor-pointer ${p.isUser ? 'bg-accent/5 border-l-2 border-l-accent shadow-[inset_0_0_20px_rgba(0,245,255,0.03)]' : ''}`}>
                                <div className="font-data text-sm text-ghost/40 w-8 text-center">{p.rank}</div>
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm overflow-hidden">
                                    {p.avatar_url ? <img src={p.avatar_url} alt="" className="w-full h-full object-cover" /> : classEmoji[p.cls] || '🎮'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="font-sans text-sm text-white font-medium truncate">{p.name}</span>
                                        {p.isUser && <span className="font-data text-[10px] bg-accent text-background px-1.5 py-0.5 rounded font-bold">{t('youTag')}</span>}
                                    </div>
                                    <div className="font-data text-[10px] text-ghost/40 tracking-wider">{p.cls} · {t('lvlShort', { level: p.level })}</div>
                                </div>
                                <div className="font-data text-xs text-ghost/60 hidden sm:block">{p.xp.toLocaleString()} XP</div>
                                <div className="font-data text-xs text-ghost/40 hidden sm:block">🔥 {p.streak}</div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
