'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Skull, Swords, Trophy, Shield, Timer, Zap, Users } from 'lucide-react';
import gsap from 'gsap';
import { useTranslations } from 'next-intl';

interface BossData {
    id: string;
    name: string;
    description: string | null;
    tier: string;
    max_hp: number;
    current_hp: number;
    xp_reward: number;
    gold_reward: number;
    status: string;
    ends_at: string | null;
}

interface ContributionData {
    damage_dealt: number;
    tasks_completed: number;
}

interface LeaderboardEntry {
    rank: number;
    user_id: string;
    damage_dealt: number;
    tasks_completed: number;
    display_name?: string | null;
}

const tierColors: Record<string, { text: string; bg: string; border: string; glow: string }> = {
    common: { text: 'text-gray-300', bg: 'bg-gray-400/10', border: 'border-gray-400/20', glow: '' },
    uncommon: { text: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/20', glow: '' },
    rare: { text: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20', glow: 'shadow-[0_0_15px_rgba(59,130,246,0.1)]' },
    epic: { text: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20', glow: 'shadow-[0_0_20px_rgba(147,51,234,0.15)]' },
    legendary: { text: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20', glow: 'shadow-[0_0_30px_rgba(234,179,8,0.2)]' },
};

export default function BossPage() {
    const t = useTranslations('boss');
    const [boss, setBoss] = useState<BossData | null>(null);
    const [active, setActive] = useState(false);
    const [contribution, setContribution] = useState<ContributionData | null>(null);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const hpBarRef = useRef<HTMLDivElement>(null);
    const bossCardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchBoss = async () => {
            setLoading(true);
            try {
                const [bossRes, lbRes] = await Promise.all([
                    fetch('/api/boss'),
                    fetch('/api/boss/leaderboard'),
                ]);

                if (bossRes.ok) {
                    const data = await bossRes.json();
                    setBoss(data.boss);
                    setActive(data.active);
                    setContribution(data.contribution);
                }

                if (lbRes.ok) {
                    const data = await lbRes.json();
                    setLeaderboard(data.leaderboard || []);
                }
            } catch { /* silent */ }
            setLoading(false);
        };
        fetchBoss();
    }, []);

    useEffect(() => {
        if (bossCardRef.current) {
            gsap.from(bossCardRef.current, { y: 40, opacity: 0, duration: 0.8, ease: 'power3.out' });
        }
    }, [boss]);

    // Animate HP bar
    useEffect(() => {
        if (hpBarRef.current && boss) {
            const percent = boss.max_hp > 0 ? Math.max(0, (boss.current_hp / boss.max_hp) * 100) : 0;
            gsap.to(hpBarRef.current, { width: `${percent}%`, duration: 1, ease: 'power2.out' });
        }
    }, [boss]);

    const getTimeRemaining = () => {
        if (!boss?.ends_at) return 'Unknown';
        const diff = new Date(boss.ends_at).getTime() - Date.now();
        if (diff <= 0) return 'Expired';
        const days = Math.floor(diff / 86400000);
        const hours = Math.floor((diff % 86400000) / 3600000);
        return `${days}d ${hours}h remaining`;
    };

    const hpPercent = boss && boss.max_hp > 0 ? Math.max(0, (boss.current_hp / boss.max_hp) * 100) : 0;
    const tierStyle = boss ? tierColors[boss.tier] || tierColors.common : tierColors.common;

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
            </div>
        );
    }

    if (!boss) {
        return (
            <div className="max-w-xl mx-auto text-center py-16">
                <div className="w-20 h-20 rounded-2xl bg-red-400/10 border border-red-400/20 flex items-center justify-center mx-auto mb-4">
                    <Skull size={40} className="text-red-400/40" />
                </div>
                <h2 className="font-heading text-2xl font-bold uppercase tracking-wider mb-2">{t('noBoss')}</h2>
                <p className="font-sans text-sm text-ghost/40">
                    {t('noBossDesc')}
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Boss Card */}
            <div ref={bossCardRef} className={`bg-[#0C1021] rounded-[2rem] border ${tierStyle.border} p-8 ${tierStyle.glow}`}>
                {/* Status Badge */}
                <div className="flex items-center justify-between mb-6">
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${tierStyle.bg} ${tierStyle.border} border`}>
                        <Skull size={14} className={tierStyle.text} />
                        <span className={`font-data text-[10px] uppercase tracking-widest ${tierStyle.text}`}>
                            {boss.tier} tier
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-ghost/40">
                        <Timer size={12} />
                        <span className="font-data text-[10px] tracking-wider">{active ? getTimeRemaining() : boss.status.toUpperCase()}</span>
                    </div>
                </div>

                {/* Boss Name */}
                <div className="text-center mb-8">
                    <div className="w-24 h-24 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
                        <Skull size={48} className={`${boss.status === 'defeated' ? 'text-green-400' : 'text-red-400'} ${active ? 'animate-pulse' : ''}`} />
                    </div>
                    <h1 className={`font-heading text-3xl font-bold uppercase tracking-wider ${boss.status === 'defeated' ? 'line-through text-ghost/30' : ''}`}>
                        {boss.name}
                    </h1>
                    {boss.description && (
                        <p className="font-sans text-sm text-ghost/40 mt-2 max-w-md mx-auto">{boss.description}</p>
                    )}
                </div>

                {/* HP Bar */}
                <div className="mb-6">
                    <div className="flex justify-between mb-2">
                        <span className="font-data text-xs text-ghost/40 tracking-wider flex items-center gap-1">
                            <Shield size={12} /> {t('hp')}
                        </span>
                        <span className="font-data text-xs text-ghost/60">
                            {boss.current_hp.toLocaleString()} / {boss.max_hp.toLocaleString()}
                        </span>
                    </div>
                    <div className="w-full h-4 bg-white/5 rounded-full overflow-hidden relative">
                        <div
                            ref={hpBarRef}
                            className={`h-full rounded-full transition-all ${hpPercent > 50 ? 'bg-gradient-to-r from-green-500 to-green-400' :
                                hpPercent > 25 ? 'bg-gradient-to-r from-yellow-500 to-yellow-400' :
                                    'bg-gradient-to-r from-red-500 to-red-400'
                                }`}
                            style={{ width: `${hpPercent}%` }}
                        />
                        {active && hpPercent > 0 && (
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
                        )}
                    </div>
                </div>

                {/* Rewards Preview */}
                <div className="flex justify-center gap-8">
                    <div className="text-center">
                        <div className="font-heading text-lg text-accent font-bold flex items-center gap-1">
                            <Zap size={16} /> {boss.xp_reward.toLocaleString()}
                        </div>
                        <div className="font-data text-[10px] text-ghost/40 tracking-wider">XP REWARD</div>
                    </div>
                    <div className="text-center">
                        <div className="font-heading text-lg text-accent-secondary font-bold">
                            🪙 {boss.gold_reward.toLocaleString()}
                        </div>
                        <div className="font-data text-[10px] text-ghost/40 tracking-wider">GOLD REWARD</div>
                    </div>
                </div>

                {/* Defeated Banner */}
                {boss.status === 'defeated' && (
                    <div className="mt-6 py-4 px-6 rounded-2xl bg-green-400/10 border border-green-400/20 text-center">
                        <Trophy size={24} className="text-green-400 mx-auto mb-2" />
                        <p className="font-heading text-sm uppercase tracking-wider text-green-400">{t('defeated')}!</p>
                        <p className="font-data text-[10px] text-ghost/40 mt-1">Rewards distributed to all contributors</p>
                    </div>
                )}
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Your Contribution */}
                <div className="bg-[#0C1021] rounded-[2rem] border border-white/5 p-6">
                    <div className="font-heading text-xs uppercase tracking-widest text-ghost/40 mb-4 flex items-center gap-2">
                        <Swords size={14} /> {t('yourContribution')}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center py-3 rounded-xl bg-white/[0.02]">
                            <div className="font-heading text-2xl text-accent font-bold">{contribution?.damage_dealt || 0}</div>
                            <div className="font-data text-[10px] text-ghost/30 tracking-wider">{t('damageDealt')}</div>
                        </div>
                        <div className="text-center py-3 rounded-xl bg-white/[0.02]">
                            <div className="font-heading text-2xl text-tertiary font-bold">{contribution?.tasks_completed || 0}</div>
                            <div className="font-data text-[10px] text-ghost/30 tracking-wider">{t('tasksCompleted')}</div>
                        </div>
                    </div>
                </div>

                {/* Leaderboard */}
                <div className="bg-[#0C1021] rounded-[2rem] border border-white/5 p-6">
                    <div className="font-heading text-xs uppercase tracking-widest text-ghost/40 mb-4 flex items-center gap-2">
                        <Users size={14} /> {t('topDamage')}
                    </div>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                        {leaderboard.length > 0 ? (
                            leaderboard.slice(0, 10).map(entry => (
                                <div key={entry.user_id} className="flex items-center gap-2 py-1">
                                    <span className={`font-data text-xs w-5 ${entry.rank <= 3 ? 'text-accent-secondary font-bold' : 'text-ghost/30'}`}>
                                        #{entry.rank}
                                    </span>
                                    <span className="font-sans text-xs text-ghost/70 flex-1 truncate">
                                        {entry.display_name || 'Hero'}
                                    </span>
                                    <span className="font-data text-xs text-red-400">
                                        {entry.damage_dealt} DMG
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="font-sans text-xs text-ghost/30 text-center py-4">No contributors yet</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
