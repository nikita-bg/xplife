'use client';

import React, { useEffect, useState } from 'react';
import gsap from 'gsap';
import { Crown, TrendingUp, TrendingDown } from 'lucide-react';

const players = [
    { rank: 1, name: 'QuantumKnight', cls: 'Guardian', level: 42, xp: 128400, streak: 45, change: 0, avatar: '🛡️', isUser: false },
    { rank: 2, name: 'NeonSorcerer', cls: 'Thinker', level: 39, xp: 115200, streak: 32, change: 2, avatar: '🧠', isUser: false },
    { rank: 3, name: 'BlazePath', cls: 'Adventurer', level: 37, xp: 108900, streak: 28, change: -1, avatar: '🗺️', isUser: false },
    { rank: 4, name: 'CyberMonk', cls: 'Guardian', level: 35, xp: 98700, streak: 21, change: 1, avatar: '⚔️', isUser: false },
    { rank: 5, name: 'PixelDruid', cls: 'Connector', level: 33, xp: 92100, streak: 18, change: -2, avatar: '🌿', isUser: false },
    { rank: 6, name: 'StarForge', cls: 'Thinker', level: 31, xp: 87400, streak: 15, change: 0, avatar: '⭐', isUser: false },
    { rank: 7, name: 'Hero', cls: 'Adventurer', level: 3, xp: 4920, streak: 7, change: 3, isUser: true, avatar: '🎮' },
    { rank: 8, name: 'IronWill88', cls: 'Guardian', level: 28, xp: 78600, streak: 12, change: -1, avatar: '💪', isUser: false },
    { rank: 9, name: 'ZenRunner', cls: 'Connector', level: 26, xp: 71300, streak: 9, change: 0, avatar: '🏃', isUser: false },
    { rank: 10, name: 'CodeNinja', cls: 'Thinker', level: 24, xp: 65800, streak: 5, change: 1, avatar: '🥷', isUser: false },
];

const podiumColors = ['from-yellow-400 to-yellow-600', 'from-gray-300 to-gray-500', 'from-amber-600 to-amber-800'];
const podiumIcons = [
    <Crown key="g" className="text-yellow-400" size={20} />,
    <Crown key="s" className="text-gray-300" size={16} />,
    <Crown key="b" className="text-amber-600" size={16} />,
];

export default function LeaderboardPage() {
    const leaderboardTabs = ['All Time', 'This Week', 'Friends'];
    const [activeTab, setActiveTab] = useState('All Time');

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from('.podium-card', { scale: 0, opacity: 0, stagger: 0.15, duration: 0.6, ease: 'back.out(1.7)', delay: 0.2 });
            gsap.from('.lb-row', { y: 20, opacity: 0, stagger: 0.06, duration: 0.5, ease: 'power3.out', delay: 0.6 });
        });
        return () => ctx.revert();
    }, []);

    const top3 = players.slice(0, 3);
    const rest = players.slice(3);

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="font-heading font-black text-3xl md:text-4xl uppercase tracking-tight text-white">Global Leaderboard</h1>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span></span>
                        <span className="font-data text-xs text-ghost/50 tracking-wider">Updated live</span>
                    </div>
                </div>
                <div className="flex gap-2 bg-white/5 rounded-xl p-1">
                    {leaderboardTabs.map(t => (
                        <button key={t} onClick={() => setActiveTab(t)} className={`px-4 py-2 rounded-lg font-data text-xs uppercase tracking-wider transition-all ${activeTab === t ? 'bg-accent text-background font-bold' : 'text-ghost/50 hover:text-ghost'}`}>{t}</button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                {top3.map((p, i) => (
                    <div key={p.rank} className={`podium-card bg-[#0C1021] rounded-[2rem] border border-white/5 p-6 text-center ${i === 0 ? 'sm:order-2 sm:scale-105 sm:border-yellow-500/30 sm:shadow-[0_0_30px_rgba(255,184,0,0.1)]' : i === 1 ? 'sm:order-1' : 'sm:order-3'}`}>
                        <div className="flex justify-center mb-3">{podiumIcons[i]}</div>
                        <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-br ${podiumColors[i]} flex items-center justify-center text-2xl mb-3`}>{p.avatar}</div>
                        <div className="font-heading font-bold text-white text-lg">{p.name}</div>
                        <div className="font-data text-xs text-accent-secondary tracking-wider mb-2">{p.cls} · Lvl {p.level}</div>
                        <div className="font-data text-sm text-accent font-bold">{p.xp.toLocaleString()} XP</div>
                        <div className="font-data text-[10px] text-ghost/30 mt-1">🔥 {p.streak} days</div>
                    </div>
                ))}
            </div>

            <div className="bg-[#0C1021] rounded-[2rem] border border-white/5 overflow-hidden">
                {rest.map((p) => (
                    <div key={p.rank} className={`lb-row flex items-center gap-4 px-6 py-4 border-b border-white/5 last:border-0 hover:-translate-y-0.5 transition-all cursor-pointer ${p.isUser ? 'bg-accent/5 border-l-2 border-l-accent shadow-[inset_0_0_20px_rgba(0,245,255,0.03)]' : ''}`}>
                        <div className="font-data text-sm text-ghost/40 w-8 text-center">{p.rank}</div>
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm">{p.avatar}</div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="font-sans text-sm text-white font-medium truncate">{p.name}</span>
                                {p.isUser && <span className="font-data text-[10px] bg-accent text-background px-1.5 py-0.5 rounded font-bold">YOU</span>}
                            </div>
                            <div className="font-data text-[10px] text-ghost/40 tracking-wider">{p.cls} · Lvl {p.level}</div>
                        </div>
                        <div className="font-data text-xs text-ghost/60 hidden sm:block">{p.xp.toLocaleString()} XP</div>
                        <div className="font-data text-xs text-ghost/40 hidden sm:block">🔥 {p.streak}</div>
                        <div className="w-12 text-right">
                            {p.change > 0 && <span className="font-data text-xs text-green-400 flex items-center gap-0.5 justify-end"><TrendingUp size={12} />+{p.change}</span>}
                            {p.change < 0 && <span className="font-data text-xs text-red-400 flex items-center gap-0.5 justify-end"><TrendingDown size={12} />{p.change}</span>}
                            {p.change === 0 && <span className="font-data text-xs text-ghost/20">—</span>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
