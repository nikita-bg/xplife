'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { Sparkles, Check, Brain, Camera, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import QuestCompleteModal from '@/components/quest/QuestCompleteModal';
import StreakWarning from '@/components/notifications/StreakWarning';
import { useProfile } from '@/hooks/use-profile';
import { getXPProgress, getRankFromLevel } from '@/lib/xpUtils';
import { usePathname } from 'next/navigation';
import type { Task } from '@/lib/types';

const diffColors: Record<string, string> = {
    easy: 'text-green-400 bg-green-400/10',
    medium: 'text-yellow-400 bg-yellow-400/10',
    hard: 'text-orange-400 bg-orange-400/10',
    epic: 'text-red-400 bg-red-400/10',
};

const PERSONALITY_CLASSES: Record<string, string> = {
    dopamine: 'Adventurer',
    acetylcholine: 'Thinker',
    gaba: 'Guardian',
    serotonin: 'Connector',
};

const CLASS_EMOJI: Record<string, string> = {
    Adventurer: '🗺️',
    Thinker: '🧠',
    Guardian: '🛡️',
    Connector: '🌿',
};

/* ── Character Card (real data) ── */
function CharacterCard({ displayName, className, level, totalXP, rankTier }: {
    displayName: string; className: string; level: number; totalXP: number; rankTier: string;
}) {
    const svgRef = useRef<SVGSVGElement>(null);
    const xpProgress = getXPProgress(totalXP);

    useEffect(() => {
        if (!svgRef.current) return;
        const ctx = gsap.context(() => {
            gsap.to(svgRef.current, { rotation: 360, duration: 15, ease: 'none', repeat: -1 });
        });
        return () => ctx.revert();
    }, []);

    return (
        <div className="bg-[#0C1021] rounded-[2rem] border border-white/5 p-6 flex flex-col items-center text-center">
            <div className="w-40 h-40 mb-6 flex items-center justify-center">
                <svg ref={svgRef} viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_30px_rgba(0,245,255,0.4)]">
                    <polygon points="50,5 95,50 50,95 5,50" fill="none" stroke="#00F5FF" strokeWidth="2" />
                    <polygon points="50,15 85,50 50,85 15,50" fill="none" stroke="#9B4EDD" strokeWidth="1.5" opacity="0.5" />
                    <circle cx="50" cy="50" r="12" fill="#FFB800" opacity="0.8" className="animate-pulse" />
                    <line x1="50" y1="5" x2="50" y2="95" stroke="white" strokeWidth="0.3" opacity="0.2" />
                    <line x1="5" y1="50" x2="95" y2="50" stroke="white" strokeWidth="0.3" opacity="0.2" />
                </svg>
            </div>
            <h3 className="font-heading font-bold text-xl text-white mb-1">{displayName}</h3>
            <div className="font-data text-xs text-accent-secondary tracking-wider mb-1">{className}</div>
            <div className="font-data text-[10px] text-ghost/50 mb-4 tracking-wider uppercase">{rankTier} RANK</div>
            <div className="w-full space-y-2">
                <div className="flex justify-between font-data text-xs text-ghost/60">
                    <span>Level {level}</span>
                    <span>{xpProgress.currentXP.toLocaleString()} / {xpProgress.maxXP.toLocaleString()} XP</span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-accent to-tertiary transition-all duration-1000" style={{ width: `${xpProgress.percentage}%` }}></div>
                </div>
            </div>
            <div className="mt-6 w-full p-3 rounded-xl border border-dashed border-white/10 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-xl">{CLASS_EMOJI[className] || '⚡'}</div>
                <div className="text-left">
                    <div className="font-sans text-xs text-ghost/80">{className}</div>
                    <div className="font-data text-[10px] text-ghost/40">Active Class</div>
                </div>
            </div>
        </div>
    );
}

/* ── Quest Card ── */
function QuestCard({ quest, onClick }: { quest: Task; onClick: (quest: Task) => void }) {
    const done = quest.status === 'completed';
    const difficulty = quest.difficulty || 'medium';
    return (
        <div className="group bg-[#0C1021] rounded-2xl border border-white/5 p-4 flex items-center gap-4 hover:-translate-y-1 hover:border-accent/30 hover:shadow-[0_0_20px_rgba(0,245,255,0.05)] transition-all duration-300 cursor-pointer"
            onClick={() => !done && onClick(quest)}>
            <div className="relative shrink-0">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${done ? 'bg-accent border-accent' : 'border-white/20 group-hover:border-accent/50'}`}>
                    {done && <Check size={14} className="text-background" />}
                </div>
            </div>
            <div className="flex-1 min-w-0">
                <div className={`font-sans text-sm ${done ? 'line-through text-ghost/30' : 'text-ghost'}`}>{quest.title}</div>
                <div className="flex items-center gap-2 mt-1">
                    <span className="font-data text-[10px] text-ghost/40 tracking-wider capitalize">{quest.category}</span>
                    <span className={`font-data text-[10px] px-1.5 py-0.5 rounded capitalize ${diffColors[difficulty] || diffColors.medium}`}>{difficulty}</span>
                    {quest.proof_url && <Camera size={10} className="text-green-400" />}
                </div>
            </div>
            <div className="font-data text-xs text-accent-secondary tracking-wider shrink-0">+{quest.xp_reward} XP</div>
        </div>
    );
}

/* ── Stats Panel (real data) ── */
function StatsPanel({ totalXP, currentStreak, longestStreak, quests, onGenerateQuests, generating }: {
    totalXP: number; currentStreak: number; longestStreak: number;
    quests: Record<string, Task[]>; onGenerateQuests: () => void; generating: boolean;
}) {
    const stats = useTranslations('dashboard.stats');
    const questSection = useTranslations('dashboard.questSection');
    const xpRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!xpRef.current) return;
        const ctx = gsap.context(() => {
            gsap.fromTo(xpRef.current, { innerText: '0' }, {
                innerText: String(totalXP), duration: 2, ease: 'power2.out', snap: { innerText: 1 },
                onUpdate: function () {
                    if (xpRef.current) xpRef.current.innerText = Math.round(Number(this.targets()[0].innerText)).toLocaleString();
                }
            });
        });
        return () => ctx.revert();
    }, [totalXP]);

    const rings = [
        { label: 'Daily', current: quests.daily?.filter(q => q.status === 'completed').length || 0, max: quests.daily?.length || 0, color: '#00F5FF' },
        { label: 'Weekly', current: quests.weekly?.filter(q => q.status === 'completed').length || 0, max: quests.weekly?.length || 0, color: '#FFB800' },
        { label: 'Monthly', current: quests.monthly?.filter(q => q.status === 'completed').length || 0, max: quests.monthly?.length || 0, color: '#9B4EDD' },
    ];

    return (
        <div className="space-y-6">
            <div className="bg-[#0C1021] rounded-[2rem] border border-white/5 p-6 text-center">
                <div className="font-data text-xs text-ghost/40 tracking-widest uppercase mb-2">{stats('totalXP')}</div>
                <div className="font-heading font-black text-4xl text-accent text-shadow-glow" ref={xpRef}>0</div>
            </div>
            <div className="bg-[#0C1021] rounded-[2rem] border border-white/5 p-5 flex items-center gap-3">
                <div className="text-2xl">🔥</div>
                <div>
                    <div className="font-heading text-lg text-orange-400 font-bold">{currentStreak} {stats('days')}</div>
                    <div className="font-data text-[10px] text-ghost/40 tracking-wider">{stats('currentStreak')} · {stats('best', { streak: longestStreak })}</div>
                </div>
            </div>
            <div className="bg-[#0C1021] rounded-[2rem] border border-white/5 p-5 flex justify-around">
                {rings.map(r => {
                    const pct = r.max > 0 ? r.current / r.max : 0;
                    const circ = 2 * Math.PI * 20;
                    return (
                        <div key={r.label} className="flex flex-col items-center gap-2">
                            <svg width="52" height="52" viewBox="0 0 52 52">
                                <circle cx="26" cy="26" r="20" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                                <circle cx="26" cy="26" r="20" fill="none" stroke={r.color} strokeWidth="4" strokeLinecap="round"
                                    strokeDasharray={`${pct * circ} ${circ}`} transform="rotate(-90 26 26)" style={{ filter: `drop-shadow(0 0 4px ${r.color})` }} />
                            </svg>
                            <div className="font-data text-[10px] text-ghost/50">{r.current}/{r.max} {r.label}</div>
                        </div>
                    );
                })}
            </div>
            <button
                onClick={onGenerateQuests}
                disabled={generating}
                className="btn-magnetic w-full py-4 rounded-2xl bg-tertiary/20 border border-tertiary/30 text-tertiary font-heading text-sm uppercase tracking-wider hover:bg-tertiary/30 transition-all disabled:opacity-50"
            >
                <span className="btn-content flex items-center justify-center gap-2">
                    {generating ? <Loader2 size={16} className="animate-spin" /> : <Brain size={16} />}
                    {generating ? questSection('generate') + '...' : questSection('generate')}
                </span>
            </button>
        </div>
    );
}

/* ── Dashboard Page ── */
export default function DashboardPage() {
    const questSection = useTranslations('dashboard.questSection');
    const questTabs = useTranslations('dashboard.questTabs');
    const tabs = ['daily', 'weekly', 'monthly', 'yearly'] as const;
    const [activeTab, setActiveTab] = useState<string>('daily');
    const [quests, setQuests] = useState<Record<string, Task[]>>({ daily: [], weekly: [], monthly: [], yearly: [] });
    const [selectedQuest, setSelectedQuest] = useState<Task | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [loadingQuests, setLoadingQuests] = useState(true);
    const { profile, streak, refresh } = useProfile();
    const pathname = usePathname();
    const locale = pathname.split('/')[1] || 'en';

    const displayName = profile?.display_name || 'Hero';
    const personalityType = profile?.personality_type || 'dopamine';
    const className = PERSONALITY_CLASSES[personalityType] || 'Adventurer';
    const level = profile?.level || 1;
    const totalXP = profile?.total_xp || 0;
    const rankTier = getRankFromLevel(level);
    const currentStreak = streak?.current_streak || 0;
    const longestStreak = streak?.longest_streak || 0;

    /* ── Fetch quests from API ── */
    const fetchQuests = useCallback(async () => {
        setLoadingQuests(true);
        try {
            const results: Record<string, Task[]> = { daily: [], weekly: [], monthly: [], yearly: [] };
            const responses = await Promise.all(
                tabs.map(tf => fetch(`/api/tasks?timeframe=${tf}`).then(r => r.json()))
            );
            tabs.forEach((tf, i) => {
                results[tf] = responses[i]?.tasks || [];
            });
            setQuests(results);
        } catch (err) {
            console.error('Failed to fetch quests:', err);
        }
        setLoadingQuests(false);
    }, []);

    useEffect(() => {
        fetchQuests();
    }, [fetchQuests]);

    /* ── Generate quests via AI ── */
    const handleGenerateQuests = async () => {
        setGenerating(true);
        try {
            const res = await fetch('/api/ai/generate-tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ questTimeframe: activeTab, locale }),
            });
            const data = await res.json();
            if (data.success || data.count > 0) {
                await fetchQuests();
            } else if (data.alreadyExists) {
                // Quests already exist for this period — just refresh
                await fetchQuests();
            } else if (data.error) {
                console.error('Quest generation error:', data.error);
            }
        } catch (err) {
            console.error('Failed to generate quests:', err);
        }
        setGenerating(false);
    };

    /* ── Complete quest ── */
    const handleQuestClick = (quest: Task) => {
        if (quest.status === 'completed') return;
        setSelectedQuest(quest);
        setModalOpen(true);
    };

    const handleQuestConfirm = async (questId: string | number, proofUrl?: string) => {
        try {
            const res = await fetch('/api/tasks', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: questId, status: 'completed', proof_url: proofUrl }),
            });
            if (res.ok) {
                await fetchQuests();
                refresh(); // Refresh profile to get updated XP, streak, level
            }
        } catch (err) {
            console.error('Failed to complete quest:', err);
        }
        setModalOpen(false);
        setSelectedQuest(null);
    };

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from('.dash-card', { y: 30, opacity: 0, stagger: 0.15, duration: 0.6, ease: 'power3.out' });
        });
        return () => ctx.revert();
    }, []);

    const currentQuests = quests[activeTab] || [];
    const pendingQuests = currentQuests.filter(q => q.status !== 'completed');
    const completedQuests = currentQuests.filter(q => q.status === 'completed');

    return (
        <div>
            <StreakWarning />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="dash-card lg:col-span-3">
                    <CharacterCard displayName={displayName} className={className} level={level} totalXP={totalXP} rankTier={rankTier} />
                </div>
                <div className="dash-card lg:col-span-6">
                    <div className="bg-[#0C1021] rounded-[2rem] border border-white/5 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="font-heading font-bold text-xl uppercase tracking-wider">{questTabs('questsTitle')}</h2>
                            <div className="font-data text-[10px] text-ghost/30 tracking-wider">
                                {completedQuests.length}/{currentQuests.length} {questSection('completed')}
                            </div>
                        </div>
                        <div className="flex gap-2 mb-6 bg-white/5 rounded-xl p-1">
                            {tabs.map(tab => (
                                <button key={tab} onClick={() => setActiveTab(tab)}
                                    className={`flex-1 py-2 rounded-lg font-data text-xs uppercase tracking-wider transition-all ${activeTab === tab ? 'bg-accent text-background font-bold' : 'text-ghost/50 hover:text-ghost'}`}>
                                    {questTabs(tab as 'daily' | 'weekly' | 'monthly' | 'yearly')}
                                </button>
                            ))}
                        </div>
                        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                            {loadingQuests ? (
                                <div className="flex justify-center py-16">
                                    <Loader2 size={24} className="animate-spin text-accent/50" />
                                </div>
                            ) : currentQuests.length > 0 ? (
                                <>
                                    {pendingQuests.length > 0 && pendingQuests.map(q => (
                                        <QuestCard key={q.id} quest={q} onClick={handleQuestClick} />
                                    ))}
                                    {completedQuests.length > 0 && (
                                        <>
                                            <div className="font-data text-xs text-ghost/30 tracking-wider uppercase mt-4 mb-2">Completed</div>
                                            {completedQuests.map(q => (
                                                <QuestCard key={q.id} quest={q} onClick={handleQuestClick} />
                                            ))}
                                        </>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-16">
                                    <Sparkles size={40} className="mx-auto text-accent/30 mb-4 animate-bounce" />
                                    <p className="font-sans text-ghost/40">No quests yet — Generate your first quest!</p>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={handleGenerateQuests}
                            disabled={generating}
                            className="btn-magnetic w-full mt-6 py-4 rounded-2xl bg-accent-secondary/10 border border-accent-secondary/30 text-accent-secondary font-heading text-sm uppercase tracking-wider hover:bg-accent-secondary/20 transition-all disabled:opacity-50"
                        >
                            <span className="btn-content flex items-center justify-center gap-2">
                                {generating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                                {generating ? 'Generating...' : 'Generate New Quests'}
                            </span>
                        </button>
                    </div>

                    {/* Quest Complete Modal */}
                    {selectedQuest && (
                        <QuestCompleteModal
                            quest={selectedQuest}
                            isOpen={modalOpen}
                            onClose={() => { setModalOpen(false); setSelectedQuest(null); }}
                            onConfirm={handleQuestConfirm}
                        />
                    )}
                </div>
                <div className="dash-card lg:col-span-3">
                    <StatsPanel
                        totalXP={totalXP}
                        currentStreak={currentStreak}
                        longestStreak={longestStreak}
                        quests={quests}
                        onGenerateQuests={handleGenerateQuests}
                        generating={generating}
                    />
                </div>
            </div>
        </div>
    );
}
