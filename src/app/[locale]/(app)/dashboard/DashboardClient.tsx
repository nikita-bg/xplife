'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import gsap from 'gsap';
import { Sparkles, Check, Brain, Camera, Loader2, X, Lock, Unlock, History } from 'lucide-react';
import { useTranslations } from 'next-intl';
import QuestCompleteModal from '@/components/quest/QuestCompleteModal';
import QuestTimer from '@/components/quest/QuestTimer';
import StreakWarning from '@/components/notifications/StreakWarning';
import { useProfile } from '@/hooks/use-profile';
import { getXPProgress, getRankFromLevel, type RankTier } from '@/lib/xpUtils';
import { usePathname } from 'next/navigation';
import type { Task, QuestTimeframe } from '@/lib/types';
import { getUnlockStatus, hasRequirements, type UnlockStatus } from '@/lib/quest-requirements';
import { PERSONALITY_TO_CLASS } from '@/components/avatar/avatar-data';
import type { CharacterClass } from '@/components/avatar/avatar-data';
import type { EquippedItemData } from '@/components/avatar/VoxelAvatar';

const AvatarCanvas = dynamic(() => import('@/components/avatar/AvatarCanvas'), { ssr: false });

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

/* ── Period boundary helpers ── */
function getPeriodStart(timeframe: QuestTimeframe): Date {
    const now = new Date();
    switch (timeframe) {
        case 'daily':
            return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        case 'weekly': {
            const dow = now.getDay();
            const monOffset = dow === 0 ? 6 : dow - 1;
            const mon = new Date(now.getFullYear(), now.getMonth(), now.getDate() - monOffset, 0, 0, 0, 0);
            return mon;
        }
        case 'monthly':
            return new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
        case 'yearly':
            return new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
    }
}

function filterCurrentPeriodQuests(quests: Task[], timeframe: QuestTimeframe): Task[] {
    const periodStart = getPeriodStart(timeframe);
    return quests.filter(q => new Date(q.created_at) >= periodStart);
}

/* ── Loading Skeleton ── */
function SkeletonCard({ className = '' }: { className?: string }) {
    return (
        <div className={`bg-[#0C1021] rounded-[2rem] border border-white/5 p-6 animate-pulse ${className}`}>
            <div className="flex flex-col items-center gap-4">
                <div className="w-32 h-32 rounded-full bg-white/5" />
                <div className="w-24 h-4 bg-white/5 rounded-lg" />
                <div className="w-16 h-3 bg-white/5 rounded-lg" />
                <div className="w-full h-2 bg-white/5 rounded-full mt-4" />
            </div>
        </div>
    );
}

function SkeletonQuestList() {
    return (
        <div className="space-y-3">
            {[1, 2, 3].map(i => (
                <div key={i} className="bg-[#0C1021] rounded-2xl border border-white/5 p-4 flex items-center gap-4 animate-pulse">
                    <div className="w-6 h-6 rounded-full bg-white/5" />
                    <div className="flex-1 space-y-2">
                        <div className="w-3/4 h-3.5 bg-white/5 rounded-lg" />
                        <div className="w-1/3 h-2.5 bg-white/5 rounded-lg" />
                    </div>
                    <div className="w-12 h-3 bg-white/5 rounded-lg" />
                </div>
            ))}
        </div>
    );
}

function SkeletonStats() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="bg-[#0C1021] rounded-[2rem] border border-white/5 p-6 text-center">
                <div className="w-20 h-3 bg-white/5 rounded-lg mx-auto mb-3" />
                <div className="w-28 h-8 bg-white/5 rounded-lg mx-auto" />
            </div>
            <div className="bg-[#0C1021] rounded-[2rem] border border-white/5 p-5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5" />
                <div className="space-y-2 flex-1">
                    <div className="w-16 h-4 bg-white/5 rounded-lg" />
                    <div className="w-24 h-2.5 bg-white/5 rounded-lg" />
                </div>
            </div>
        </div>
    );
}

/* ── Character Card (real data) ── */
function CharacterCard({ displayName, className, level, totalXP, rankTier, personalityType, equipped }: {
    displayName: string; className: string; level: number; totalXP: number; rankTier: string; personalityType: string; equipped?: EquippedItemData[];
}) {
    const xpProgress = getXPProgress(totalXP);
    const charCard = useTranslations('dashboard.characterCard');

    return (
        <div className="bg-[#0C1021] rounded-[2rem] border border-white/5 p-6 flex flex-col items-center text-center">
            <AvatarCanvas
                characterClass={(PERSONALITY_TO_CLASS[personalityType] || 'Adventurer') as CharacterClass}
                rank={rankTier as RankTier}
                size="md"
                interactive={false}
                equipped={equipped}
            />
            <h3 className="font-heading font-bold text-xl text-white mb-1">{displayName}</h3>
            <div className="font-data text-xs text-accent-secondary tracking-wider mb-1">{className}</div>
            <div className="font-data text-[10px] text-ghost/50 mb-4 tracking-wider uppercase">{rankTier} {charCard('rank')}</div>
            <div className="w-full space-y-2">
                <div className="flex justify-between font-data text-xs text-ghost/60">
                    <span>{charCard('level', { level })}</span>
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
                    <div className="font-data text-[10px] text-ghost/40">{charCard('activeClass')}</div>
                </div>
            </div>
        </div>
    );
}

/* ── Quest Card ── */
function QuestCard({ quest, onClick, unlockStatus }: { quest: Task; onClick: (quest: Task) => void; unlockStatus?: UnlockStatus | null }) {
    const done = quest.status === 'completed';
    const difficulty = quest.difficulty || 'medium';
    const locked = unlockStatus && !unlockStatus.unlocked && !done;
    return (
        <div
            className={`group bg-[#0C1021] rounded-2xl border p-4 transition-all duration-300 ${locked
                ? 'border-white/5 opacity-70 cursor-not-allowed'
                : 'border-white/5 hover:-translate-y-1 hover:border-accent/30 hover:shadow-[0_0_20px_rgba(0,245,255,0.05)] cursor-pointer'
                }`}
            onClick={() => !done && !locked && onClick(quest)}
        >
            <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${done ? 'bg-accent border-accent' : locked ? 'border-white/10' : 'border-white/20 group-hover:border-accent/50'
                        }`}>
                        {done ? <Check size={14} className="text-background" /> : locked ? <Lock size={10} className="text-ghost/30" /> : null}
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
                <div className="flex flex-col items-end gap-0.5 shrink-0">
                    <div className="font-data text-xs text-accent-secondary tracking-wider">+{quest.xp_reward} XP</div>
                    <div className="font-data text-[10px] text-amber-400 tracking-wider">+{{ easy: 5, medium: 10, hard: 20, epic: 35 }[difficulty] || 8} 🪙</div>
                </div>
            </div>
            {/* Unlock requirement progress */}
            {locked && unlockStatus && (
                <div className="mt-3 pt-3 border-t border-white/5">
                    <div className="flex items-center gap-2 mb-1.5">
                        <Lock size={10} className="text-amber-400" />
                        <span className="font-data text-[9px] text-amber-400/80 tracking-wider uppercase">
                            Complete {unlockStatus.childTimeframe} quests to unlock
                        </span>
                    </div>
                    <div className="flex gap-3">
                        {(['hard', 'medium', 'easy'] as const).map(d => {
                            const b = unlockStatus.breakdown[d];
                            const pct = Math.min(100, (b.done / b.required) * 100);
                            const full = b.done >= b.required;
                            return (
                                <div key={d} className="flex-1">
                                    <div className="flex items-center justify-between mb-0.5">
                                        <span className={`font-data text-[8px] tracking-wider uppercase ${d === 'hard' ? 'text-red-400/60' : d === 'medium' ? 'text-amber-400/60' : 'text-green-400/60'
                                            }`}>{d}</span>
                                        <span className={`font-data text-[8px] ${full ? 'text-accent' : 'text-ghost/30'}`}>
                                            {b.done}/{b.required}
                                        </span>
                                    </div>
                                    <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all ${full ? 'bg-accent' : 'bg-white/20'}`}
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="mt-1.5">
                        <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all ${unlockStatus.progress >= 1 ? 'bg-accent' : 'bg-amber-400/50'}`}
                                style={{ width: `${Math.min(100, unlockStatus.progress * 100)}%` }}
                            />
                        </div>
                        <div className="font-data text-[8px] text-ghost/30 text-right mt-0.5">{Math.round(unlockStatus.progress * 100)}% overall</div>
                    </div>
                </div>
            )}
            {done && unlockStatus?.unlocked && (
                <div className="mt-2 flex items-center gap-1">
                    <Unlock size={9} className="text-accent/50" />
                    <span className="font-data text-[8px] text-accent/50 tracking-wider">UNLOCKED</span>
                </div>
            )}
        </div>
    );
}

/* ── Stats Panel (real data) ── */
function StatsPanel({ totalXP, currentStreak, longestStreak, goldBalance, quests, onGenerateQuests, generating }: {
    totalXP: number; currentStreak: number; longestStreak: number; goldBalance: number;
    quests: Record<string, Task[]>; onGenerateQuests: () => void; generating: boolean;
}) {
    const stats = useTranslations('dashboard.stats');
    const questSection = useTranslations('dashboard.questSection');
    const xpRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!xpRef.current) return;
        const ctx = gsap.context(() => {
            const counter = { val: 0 };
            gsap.to(counter, {
                val: totalXP,
                duration: 2,
                ease: 'power2.out',
                onUpdate: () => {
                    if (xpRef.current) xpRef.current.innerText = Math.round(counter.val).toLocaleString();
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
                <div className="text-2xl">🪙</div>
                <div>
                    <div className="font-heading text-lg text-amber-400 font-bold">{goldBalance.toLocaleString()}</div>
                    <div className="font-data text-[10px] text-ghost/40 tracking-wider">{stats('goldBalance')}</div>
                </div>
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
const tabs = ['daily', 'weekly', 'monthly', 'yearly'] as const;

export default function DashboardClient() {
    const questSection = useTranslations('dashboard.questSection');
    const questTabs = useTranslations('dashboard.questTabs');
    const dashT = useTranslations('dashboard');
    const [activeTab, setActiveTab] = useState<string>('daily');
    const [quests, setQuests] = useState<Record<string, Task[]>>({ daily: [], weekly: [], monthly: [], yearly: [] });
    const [selectedQuest, setSelectedQuest] = useState<Task | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [loadingQuests, setLoadingQuests] = useState(true);
    const [showHistory, setShowHistory] = useState(false);
    const [historyQuests, setHistoryQuests] = useState<Task[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [childHistory, setChildHistory] = useState<Task[]>([]);
    const [equippedItems, setEquippedItems] = useState<EquippedItemData[]>([]);
    const { profile, streak, loading: profileLoading, refresh } = useProfile();
    const pathname = usePathname();
    const locale = pathname.split('/')[1] || 'en';

    // ── Goal description state ──
    const [showGoalInput, setShowGoalInput] = useState(false);
    const [goalText, setGoalText] = useState('');
    const [genMode, setGenMode] = useState<'custom' | 'parent'>('custom');
    const [selectedParentIds, setSelectedParentIds] = useState<Set<string>>(new Set());

    // ── Auto-generation guard ──
    const autoGenAttempted = useRef<Set<string>>(new Set());

    const displayName = profile?.display_name || 'Hero';
    const personalityType = profile?.personality_type || 'dopamine';
    const className = PERSONALITY_CLASSES[personalityType] || 'Adventurer';
    const level = profile?.level || 1;
    const totalXP = profile?.total_xp || 0;
    const goldBalance = profile?.gold_balance || 0;
    const rankTier = getRankFromLevel(level);
    const currentStreak = streak?.current_streak || 0;
    const longestStreak = streak?.longest_streak || 0;

    /* ── Fetch equipped items for avatar ── */
    useEffect(() => {
        (async () => {
            try {
                const res = await fetch('/api/inventory');
                if (res.ok) {
                    const data = await res.json();
                    const equipped = data.equipped || {};
                    const items: EquippedItemData[] = [];
                    for (const [slot, item] of Object.entries(equipped)) {
                        if (item && typeof item === 'object') {
                            const i = item as { name?: string; rarity?: string };
                            items.push({ slot: slot as EquippedItemData['slot'], name: i.name || '', rarity: i.rarity || 'Common' });
                        }
                    }
                    setEquippedItems(items);
                }
            } catch {
                // Non-critical — avatar just renders without equipment
            }
        })();
    }, []);

    /* ── Fetch quests from API ── */
    const fetchQuests = useCallback(async () => {
        setLoadingQuests(true);
        try {
            const results: Record<string, Task[]> = { daily: [], weekly: [], monthly: [], yearly: [] };
            const responses = await Promise.all(
                tabs.map(tf => fetch(`/api/tasks?timeframe=${tf}`).then(r => r.json()))
            );
            tabs.forEach((tf, i) => {
                const allQuests = responses[i]?.tasks || [];
                // Filter to current period only for display
                results[tf] = filterCurrentPeriodQuests(allQuests, tf);
            });
            setQuests(results);
            return results;
        } catch (err) {
            console.error('Failed to fetch quests:', err);
            return null;
        } finally {
            setLoadingQuests(false);
        }
    }, []);

    useEffect(() => {
        fetchQuests().then(results => {
            if (!results) return;
            // Auto-generate for empty periods that have parent quests (Bug 4)
            const autoGenOrder: QuestTimeframe[] = ['monthly', 'weekly', 'daily'];
            for (const tf of autoGenOrder) {
                if (results[tf].length > 0) continue;
                const parentTf = tf === 'daily' ? 'weekly' : tf === 'weekly' ? 'monthly' : 'yearly';
                const parentQuests = results[parentTf] || [];
                if (parentQuests.length === 0) continue;
                if (autoGenAttempted.current.has(tf)) continue;

                autoGenAttempted.current.add(tf);
                fetch('/api/ai/generate-tasks', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        questTimeframe: tf,
                        generationMode: 'cascade',
                        parentQuestIds: parentQuests.map(q => q.id),
                        locale,
                    }),
                })
                    .then(() => fetchQuests())
                    .catch(() => { /* autoGenAttempted prevents retry */ });
                break; // Only one at a time
            }
        });
    }, [fetchQuests, locale]);

    /* ── Fetch quest history (all completed, no period filter) ── */
    const fetchHistory = useCallback(async () => {
        setLoadingHistory(true);
        try {
            const res = await fetch(`/api/tasks?timeframe=${activeTab}&includeHistory=true&status=completed`);
            const data = await res.json();
            setHistoryQuests((data.tasks || []).filter((q: Task) => q.status === 'completed'));
        } catch (err) {
            console.error('Failed to fetch history:', err);
        } finally {
            setLoadingHistory(false);
        }
    }, [activeTab]);

    useEffect(() => {
        if (showHistory) fetchHistory();
    }, [showHistory, fetchHistory]);

    /* ── Fetch child history for lock progress ── */
    const fetchChildHistory = useCallback(async (currentTab: string) => {
        if (!hasRequirements(currentTab as QuestTimeframe)) return;
        const childTf = currentTab === 'weekly' ? 'daily' : currentTab === 'monthly' ? 'weekly' : currentTab === 'yearly' ? 'monthly' : null;
        if (!childTf) return;

        const parentPeriodStart = getPeriodStart(currentTab as QuestTimeframe).toISOString();
        try {
            const res = await fetch(`/api/tasks?timeframe=${childTf}&startDate=${parentPeriodStart}&status=completed&limit=200`);
            const data = await res.json();
            setChildHistory(data.tasks || []);
        } catch (err) {
            console.error('Failed to fetch child history', err);
        }
    }, []);

    useEffect(() => {
        fetchChildHistory(activeTab);
    }, [activeTab, fetchChildHistory]);

    /* ── Generate quests via AI ── */
    const handleGenerateQuests = async () => {
        if (!showGoalInput) {
            setShowGoalInput(true);
            return;
        }

        setGenerating(true);
        try {
            const parentTf = activeTab === 'daily' ? 'weekly' : activeTab === 'weekly' ? 'monthly' : activeTab === 'monthly' ? 'yearly' : null;
            const allParents = parentTf ? (quests[parentTf] || []) : [];

            const payload: Record<string, unknown> = {
                questTimeframe: activeTab,
                locale,
                force: true, // Allow manual re-generation even if tasks exist
            };

            if (genMode === 'parent' && allParents.length > 0) {
                // Use selected parents, or all if none selected
                const chosen = selectedParentIds.size > 0
                    ? allParents.filter(q => selectedParentIds.has(q.id))
                    : allParents;
                payload.generationMode = 'cascade';
                payload.parentQuestIds = chosen.map(q => q.id);
                payload.parentQuests = chosen.map(q => ({ id: q.id, title: q.title, description: q.description }));
            } else if (goalText.trim()) {
                payload.userGoals = goalText.trim();
            }

            const res = await fetch('/api/ai/generate-tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (data.alreadyExists) {
                await fetchQuests();
                // Quests already exist for this period — just show them
            } else if (data.success || data.count > 0) {
                await fetchQuests();
            } else if (data.error) {
                console.error('Quest generation error:', data.error);
                // TODO: show toast
            }
        } catch (err) {
            console.error('Failed to generate quests:', err);
        }
        setGenerating(false);
        setShowGoalInput(false);
        setGoalText('');
        setSelectedParentIds(new Set());
    };

    const handleGenerateSkipGoals = async () => {
        setGenerating(true);
        try {
            const res = await fetch('/api/ai/generate-tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ questTimeframe: activeTab, locale, force: true }),
            });
            const data2 = await res.json();
            if (data2.alreadyExists) {
                await fetchQuests();
            } else if (data2.success || data2.count > 0) {
                await fetchQuests();
            } else if (data2.error) {
                console.error('Quest generation error (skip-goals):', data2.error);
                // TODO: show toast
            }
        } catch (err) {
            console.error('Failed to generate quests:', err);
        }
        setGenerating(false);
        setShowGoalInput(false);
        setGoalText('');
        setGenMode('custom');
        setSelectedParentIds(new Set());
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
                fetchChildHistory(activeTab); // Update unlock progress
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
    }, [profileLoading]);

    const currentQuests = quests[activeTab] || [];
    const pendingQuests = currentQuests.filter(q => q.status !== 'completed');
    const completedQuests = currentQuests.filter(q => q.status === 'completed');

    // Compute unlock status for the active tab (personality-dependent)
    const currentUnlockStatus = useMemo(() => {
        if (!hasRequirements(activeTab as QuestTimeframe)) return null;
        const childTf = activeTab === 'weekly' ? 'daily' : activeTab === 'monthly' ? 'weekly' : activeTab === 'yearly' ? 'monthly' : null;
        if (!childTf) return null;

        // Use the fetched child history which contains all child tasks completed since the parent period start
        const parentPeriodStart = getPeriodStart(activeTab as QuestTimeframe);
        const childCompleted = childHistory.filter(
            q => q.status === 'completed' && new Date(q.completed_at || q.created_at) >= parentPeriodStart
        );
        return getUnlockStatus(activeTab as QuestTimeframe, childCompleted, personalityType);
    }, [activeTab, childHistory, personalityType]);

    const isLoading = profileLoading || loadingQuests;

    return (
        <div>
            <StreakWarning />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Character Card */}
                <div className="dash-card lg:col-span-3">
                    {isLoading ? (
                        <SkeletonCard />
                    ) : (
                        <CharacterCard displayName={displayName} className={className} level={level} totalXP={totalXP} rankTier={rankTier} personalityType={personalityType} equipped={equippedItems} />
                    )}
                </div>

                {/* Center: Quests */}
                <div className="dash-card lg:col-span-6">
                    <div className="bg-[#0C1021] rounded-[2rem] border border-white/5 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="font-heading font-bold text-xl uppercase tracking-wider">{questTabs('questsTitle')}</h2>
                            <div className="flex items-center gap-3">
                                {/* Quest Timer */}
                                <QuestTimer timeframe={activeTab as QuestTimeframe} />
                                <button
                                    onClick={() => setShowHistory(h => !h)}
                                    className={`flex items-center gap-1 px-2 py-1 rounded-lg font-data text-[10px] uppercase tracking-wider transition-all ${showHistory ? 'bg-accent/10 text-accent border border-accent/30' : 'text-ghost/30 hover:text-ghost/50'}`}
                                    title={dashT('questHistory') || 'Quest History'}
                                >
                                    <History size={12} />
                                </button>
                                <div className="font-data text-[10px] text-ghost/30 tracking-wider">
                                    {completedQuests.length}/{currentQuests.length} {questSection('completed')}
                                </div>
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

                        {/* Generate panel: goal description + parent mode */}
                        {showGoalInput && (() => {
                            const parentTf = activeTab === 'daily' ? 'weekly' : activeTab === 'weekly' ? 'monthly' : activeTab === 'monthly' ? 'yearly' : null;
                            const parentLabel = parentTf ? parentTf.charAt(0).toUpperCase() + parentTf.slice(1) : null;
                            const hasParentQuests = parentTf ? (quests[parentTf] || []).length > 0 : false;
                            return (
                                <div className="bg-white/[0.03] rounded-2xl border border-white/10 p-4 mb-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        {/* Mode tabs */}
                                        <div className="flex gap-1 bg-white/5 rounded-lg p-0.5">
                                            <button
                                                onClick={() => setGenMode('custom')}
                                                className={`px-3 py-1 rounded-md font-data text-[10px] uppercase tracking-wider transition-all ${genMode === 'custom' ? 'bg-accent/20 text-accent' : 'text-ghost/40 hover:text-ghost/60'}`}
                                            >
                                                Custom Goal
                                            </button>
                                            {hasParentQuests && parentLabel && (
                                                <button
                                                    onClick={() => setGenMode('parent')}
                                                    className={`px-3 py-1 rounded-md font-data text-[10px] uppercase tracking-wider transition-all ${genMode === 'parent' ? 'bg-tertiary/20 text-tertiary' : 'text-ghost/40 hover:text-ghost/60'}`}
                                                >
                                                    From {parentLabel}
                                                </button>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => { setShowGoalInput(false); setGoalText(''); setGenMode('custom'); setSelectedParentIds(new Set()); }}
                                            className="text-ghost/30 hover:text-ghost/60 transition-colors"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>

                                    {genMode === 'custom' ? (
                                        <textarea
                                            value={goalText}
                                            onChange={(e) => setGoalText(e.target.value)}
                                            placeholder={dashT('goalsPlaceholder') || 'e.g. I want to focus on fitness and meditation today...'}
                                            rows={3}
                                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 font-sans text-sm text-ghost placeholder:text-ghost/20 focus:outline-none focus:border-accent/30 transition-colors resize-none"
                                        />
                                    ) : (
                                        <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                                            <div className="font-data text-[9px] text-ghost/30 tracking-wider mb-1">SELECT QUESTS TO GENERATE FROM:</div>
                                            {(quests[parentTf!] || []).map(q => {
                                                const isSelected = selectedParentIds.has(q.id);
                                                return (
                                                    <button
                                                        key={q.id}
                                                        onClick={() => {
                                                            setSelectedParentIds(prev => {
                                                                const next = new Set(prev);
                                                                if (next.has(q.id)) next.delete(q.id);
                                                                else next.add(q.id);
                                                                return next;
                                                            });
                                                        }}
                                                        className={`w-full flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${isSelected
                                                            ? 'bg-tertiary/10 border-tertiary/30'
                                                            : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                                                            }`}
                                                    >
                                                        <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${isSelected ? 'bg-tertiary border-tertiary' : 'border-white/20'
                                                            }`}>
                                                            {isSelected && <Check size={10} className="text-background" />}
                                                        </div>
                                                        <span className={`font-sans text-xs truncate ${isSelected ? 'text-ghost' : 'text-ghost/50'}`}>{q.title}</span>
                                                    </button>
                                                );
                                            })}
                                            {selectedParentIds.size > 0 && (
                                                <div className="font-data text-[9px] text-tertiary/60 tracking-wider">
                                                    {selectedParentIds.size} quest{selectedParentIds.size > 1 ? 's' : ''} selected
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex gap-2 justify-end">
                                        <button
                                            onClick={handleGenerateSkipGoals}
                                            disabled={generating}
                                            className="px-4 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-ghost/50 font-data text-xs uppercase tracking-wider hover:bg-white/[0.06] transition-colors disabled:opacity-30"
                                        >
                                            {dashT('skipGenerate') || 'Skip & Generate'}
                                        </button>
                                        <button
                                            onClick={handleGenerateQuests}
                                            disabled={generating}
                                            className="px-4 py-2 rounded-xl bg-accent/10 border border-accent/20 text-accent font-data text-xs uppercase tracking-wider hover:bg-accent/20 transition-colors disabled:opacity-30 flex items-center gap-2"
                                        >
                                            {generating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                                            {generating ? (dashT('generatingQuests') || 'Generating...') : (dashT('generateWithGoals') || 'Generate')}
                                        </button>
                                    </div>
                                </div>
                            );
                        })()}

                        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                            {loadingQuests ? (
                                <SkeletonQuestList />
                            ) : currentQuests.length > 0 ? (
                                <>
                                    {pendingQuests.length > 0 && pendingQuests.map(q => (
                                        <QuestCard key={q.id} quest={q} onClick={handleQuestClick} unlockStatus={currentUnlockStatus} />
                                    ))}
                                    {completedQuests.length > 0 && (
                                        <>
                                            <div className="font-data text-xs text-ghost/30 tracking-wider uppercase mt-4 mb-2">{questSection('completed')}</div>
                                            {completedQuests.map(q => (
                                                <QuestCard key={q.id} quest={q} onClick={handleQuestClick} unlockStatus={currentUnlockStatus} />
                                            ))}
                                        </>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-16">
                                    <Sparkles size={40} className="mx-auto text-accent/30 mb-4 animate-bounce" />
                                    <p className="font-sans text-ghost/40">{dashT('noQuestsMessage')}</p>
                                </div>
                            )}
                            {/* Quest History (past periods) */}
                            {showHistory && (
                                <div className="mt-6 pt-4 border-t border-white/5">
                                    <div className="flex items-center gap-2 mb-3">
                                        <History size={14} className="text-ghost/40" />
                                        <span className="font-data text-xs text-ghost/40 tracking-wider uppercase">{dashT('questHistory') || 'Past Quest History'}</span>
                                    </div>
                                    {loadingHistory ? (
                                        <SkeletonQuestList />
                                    ) : historyQuests.filter(hq => !currentQuests.some(cq => cq.id === hq.id)).length > 0 ? (
                                        <div className="space-y-2 opacity-60">
                                            {historyQuests
                                                .filter(hq => !currentQuests.some(cq => cq.id === hq.id))
                                                .map(q => (
                                                    <QuestCard key={q.id} quest={q} onClick={() => { }} />
                                                ))}
                                        </div>
                                    ) : (
                                        <p className="font-sans text-xs text-ghost/20 text-center py-4">{dashT('noHistory') || 'No past quests found'}</p>
                                    )}
                                </div>
                            )}
                        </div>
                        {!showGoalInput && (
                            <button
                                onClick={handleGenerateQuests}
                                disabled={generating}
                                className="btn-magnetic w-full mt-6 py-4 rounded-2xl bg-accent-secondary/10 border border-accent-secondary/30 text-accent-secondary font-heading text-sm uppercase tracking-wider hover:bg-accent-secondary/20 transition-all disabled:opacity-50"
                            >
                                <span className="btn-content flex items-center justify-center gap-2">
                                    {generating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                                    {generating ? (dashT('generatingQuests') || 'Generating...') : (dashT('generateNewQuests') || 'Generate New Quests')}
                                </span>
                            </button>
                        )}
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

                {/* Right: Stats */}
                <div className="dash-card lg:col-span-3">
                    {isLoading ? (
                        <SkeletonStats />
                    ) : (
                        <StatsPanel
                            totalXP={totalXP}
                            currentStreak={currentStreak}
                            longestStreak={longestStreak}
                            goldBalance={goldBalance}
                            quests={quests}
                            onGenerateQuests={handleGenerateQuests}
                            generating={generating}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
