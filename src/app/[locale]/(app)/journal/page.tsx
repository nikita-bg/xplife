'use client';

import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, ChevronLeft, ChevronRight, Zap, Flame, Swords, Calendar, Trophy } from 'lucide-react';
import gsap from 'gsap';
import { useTranslations } from 'next-intl';

interface JournalData {
    month: string;
    summary: {
        questsCompleted: number;
        totalXp: number;
        activeDays: number;
        topCategory: { name: string; count: number } | null;
        bossDamage: number;
        currentStreak: number;
        longestStreak: number;
    };
    categories: Record<string, number>;
    difficulties: Record<string, number>;
    dailyActivity: Record<string, number>;
}

const categoryColors: Record<string, string> = {
    health: 'bg-green-400',
    productivity: 'bg-blue-400',
    learning: 'bg-emerald-400',
    social: 'bg-violet-400',
    mindfulness: 'bg-teal-400',
    creativity: 'bg-pink-400',
};

export default function JournalPage() {
    const t = useTranslations('journal');
    const st = useTranslations('journal.stats');
    const [data, setData] = useState<JournalData | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentMonth, setCurrentMonth] = useState(() => new Date().toISOString().slice(0, 7));
    const cardsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchJournal = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/journal?month=${currentMonth}`);
                if (res.ok) {
                    setData(await res.json());
                }
            } catch { /* silent */ }
            setLoading(false);
        };
        fetchJournal();
    }, [currentMonth]);

    useEffect(() => {
        if (cardsRef.current && data) {
            gsap.from(cardsRef.current.children, {
                y: 30, opacity: 0, stagger: 0.08, duration: 0.6, ease: 'power3.out',
            });
        }
    }, [data]);

    const navigateMonth = (dir: -1 | 1) => {
        const [y, m] = currentMonth.split('-').map(Number);
        const d = new Date(y, m - 1 + dir, 1);
        setCurrentMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    };

    const formatMonth = (m: string) => {
        const [y, mo] = m.split('-').map(Number);
        return new Date(y, mo - 1).toLocaleDateString('en', { year: 'numeric', month: 'long' });
    };

    const maxCategoryCount = data ? Math.max(...Object.values(data.categories), 1) : 1;

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                        <BookOpen size={20} className="text-accent" />
                    </div>
                    <h1 className="font-heading text-xl font-bold uppercase tracking-wider">{t('title')}</h1>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => navigateMonth(-1)} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                        <ChevronLeft size={16} className="text-ghost/50" />
                    </button>
                    <span className="font-data text-sm text-ghost/60 min-w-[140px] text-center">{formatMonth(currentMonth)}</span>
                    <button onClick={() => navigateMonth(1)} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                        <ChevronRight size={16} className="text-ghost/50" />
                    </button>
                </div>
            </div>

            {!data || data.summary.questsCompleted === 0 ? (
                <div className="bg-[#0C1021] rounded-[2rem] border border-white/5 p-12 text-center">
                    <BookOpen size={40} className="mx-auto text-accent/20 mb-4" />
                    <p className="font-sans text-ghost/40">{t('noData')}</p>
                </div>
            ) : (
                <div ref={cardsRef} className="space-y-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                            { icon: <Trophy size={18} />, label: st('quests'), value: data.summary.questsCompleted, color: 'text-accent' },
                            { icon: <Zap size={18} />, label: st('xpEarned'), value: data.summary.totalXp.toLocaleString(), color: 'text-accent-secondary' },
                            { icon: <Calendar size={18} />, label: st('activeDays'), value: data.summary.activeDays, color: 'text-tertiary' },
                            { icon: <Flame size={18} />, label: st('bestStreak'), value: data.summary.longestStreak, color: 'text-orange-400' },
                        ].map((s, i) => (
                            <div key={i} className="bg-[#0C1021] rounded-2xl border border-white/5 p-4 text-center">
                                <div className={`${s.color} mb-2 flex justify-center`}>{s.icon}</div>
                                <div className={`font-heading text-2xl font-bold ${s.color}`}>{s.value}</div>
                                <div className="font-data text-[9px] text-ghost/30 tracking-wider mt-1">{s.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Category Breakdown */}
                    <div className="bg-[#0C1021] rounded-[2rem] border border-white/5 p-6">
                        <h3 className="font-heading text-sm uppercase tracking-wider text-ghost/50 mb-4">{t('categoryBreakdown')}</h3>
                        <div className="space-y-3">
                            {Object.entries(data.categories)
                                .sort(([, a], [, b]) => b - a)
                                .map(([cat, count]) => (
                                    <div key={cat}>
                                        <div className="flex justify-between mb-1">
                                            <span className="font-data text-xs text-ghost/60 capitalize">{cat}</span>
                                            <span className="font-data text-xs text-ghost/40">{count}</span>
                                        </div>
                                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-700 ${categoryColors[cat] || 'bg-accent'}`}
                                                style={{ width: `${(count / maxCategoryCount) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>

                    {/* Boss Damage */}
                    {data.summary.bossDamage > 0 && (
                        <div className="bg-[#0C1021] rounded-[2rem] border border-red-400/10 p-6 text-center">
                            <Swords size={24} className="mx-auto text-red-400 mb-2" />
                            <div className="font-heading text-2xl font-bold text-red-400">{data.summary.bossDamage}</div>
                            <div className="font-data text-[10px] text-ghost/30 tracking-wider">{t('bossDamage')}</div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
