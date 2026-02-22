'use client';

import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Sparkles, Check, Zap, Brain, Camera } from 'lucide-react';
import QuestCompleteModal from '@/components/quest/QuestCompleteModal';

/* ── Placeholder Data ── */
const questsData: Record<string, Array<{ id: number; title: string; category: string; difficulty: string; xp: number; done: boolean }>> = {
    daily: [
        { id: 1, title: 'Morning workout — 30min cardio', category: 'Fitness', difficulty: 'Easy', xp: 50, done: false },
        { id: 2, title: 'Read 20 pages of current book', category: 'Learning', difficulty: 'Easy', xp: 30, done: true },
        { id: 3, title: 'Meditate for 10 minutes', category: 'Mindfulness', difficulty: 'Easy', xp: 25, done: false },
        { id: 4, title: 'Write 500 words on project', category: 'Productivity', difficulty: 'Medium', xp: 75, done: false },
        { id: 5, title: 'Cook a healthy meal', category: 'Health', difficulty: 'Easy', xp: 40, done: true },
    ],
    weekly: [
        { id: 6, title: 'Run 15km total', category: 'Fitness', difficulty: 'Medium', xp: 120, done: false },
        { id: 7, title: 'Read 3 chapters of a book', category: 'Learning', difficulty: 'Medium', xp: 100, done: false },
        { id: 8, title: 'Complete a coding challenge', category: 'Productivity', difficulty: 'Hard', xp: 200, done: false },
    ],
    monthly: [
        { id: 9, title: 'Run 50km total', category: 'Fitness', difficulty: 'Epic', xp: 500, done: false },
        { id: 10, title: 'Finish a complete book', category: 'Learning', difficulty: 'Hard', xp: 300, done: false },
    ],
    yearly: [
        { id: 11, title: 'Complete a marathon', category: 'Fitness', difficulty: 'Epic', xp: 2000, done: false },
    ]
};

const recentXP = [
    { text: '+50 XP — Morning Workout', time: '2m ago' },
    { text: '+30 XP — Read 20 pages', time: '1h ago' },
    { text: '+120 XP — Weekly goal achieved', time: '3h ago' },
    { text: '+200 XP — 7-day streak bonus', time: '1d ago' },
];

const diffColors: Record<string, string> = { Easy: 'text-green-400 bg-green-400/10', Medium: 'text-yellow-400 bg-yellow-400/10', Hard: 'text-orange-400 bg-orange-400/10', Epic: 'text-red-400 bg-red-400/10' };

/* ── Character Card ── */
const CharacterCard = () => {
    const svgRef = useRef<SVGSVGElement>(null);
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
            <h3 className="font-heading font-bold text-xl text-white mb-1">Hero</h3>
            <div className="font-data text-xs text-accent-secondary tracking-wider mb-1">Adventurer</div>
            <div className="font-data text-[10px] text-ghost/50 mb-4 tracking-wider">IRON RANK</div>
            <div className="w-full space-y-2">
                <div className="flex justify-between font-data text-xs text-ghost/60">
                    <span>Level 3</span>
                    <span>920 / 1,500 XP</span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-accent to-tertiary animate-pulse" style={{ width: '61%' }}></div>
                </div>
            </div>
            <div className="mt-6 w-full p-3 rounded-xl border border-dashed border-white/10 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent"><Zap size={16} /></div>
                <div className="text-left">
                    <div className="font-sans text-xs text-ghost/80">Iron Blade</div>
                    <div className="font-data text-[10px] text-ghost/40">Common Weapon</div>
                </div>
            </div>
        </div>
    );
};

/* ── Quest Card ── */
type QuestItem = { id: number; title: string; category: string; difficulty: string; xp: number; done: boolean; proofUrl?: string };

const QuestCard = ({ quest, onClick }: { quest: QuestItem; onClick: (quest: QuestItem) => void }) => {
    return (
        <div className="group bg-[#0C1021] rounded-2xl border border-white/5 p-4 flex items-center gap-4 hover:-translate-y-1 hover:border-accent/30 hover:shadow-[0_0_20px_rgba(0,245,255,0.05)] transition-all duration-300 cursor-pointer"
            onClick={() => !quest.done && onClick(quest)}>
            <div className="relative shrink-0">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${quest.done ? 'bg-accent border-accent' : 'border-white/20 group-hover:border-accent/50'}`}>
                    {quest.done && <Check size={14} className="text-background" />}
                </div>
            </div>
            <div className="flex-1 min-w-0">
                <div className={`font-sans text-sm ${quest.done ? 'line-through text-ghost/30' : 'text-ghost'}`}>{quest.title}</div>
                <div className="flex items-center gap-2 mt-1">
                    <span className="font-data text-[10px] text-ghost/40 tracking-wider">{quest.category}</span>
                    <span className={`font-data text-[10px] px-1.5 py-0.5 rounded ${diffColors[quest.difficulty]}`}>{quest.difficulty}</span>
                    {quest.proofUrl && <Camera size={10} className="text-green-400" />}
                </div>
            </div>
            <div className="font-data text-xs text-accent-secondary tracking-wider shrink-0">+{quest.xp} XP</div>
        </div>
    );
};

/* ── Stats Panel ── */
const StatsPanel = () => {
    const xpRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(xpRef.current, { innerText: 0 }, {
                innerText: 4920, duration: 2, ease: 'power2.out', snap: { innerText: 1 },
                onUpdate: function () { if (xpRef.current) xpRef.current.innerText = Math.round(Number(this.targets()[0].innerText)).toLocaleString(); }
            });
            gsap.from('.xp-log-item', { y: 20, opacity: 0, stagger: 0.1, duration: 0.5, ease: 'power3.out', delay: 0.5 });
        });
        return () => ctx.revert();
    }, []);

    const rings = [
        { label: 'Daily', current: 3, max: 5, color: '#00F5FF' },
        { label: 'Weekly', current: 1, max: 3, color: '#FFB800' },
        { label: 'Monthly', current: 0, max: 1, color: '#9B4EDD' },
    ];

    return (
        <div className="space-y-6">
            <div className="bg-[#0C1021] rounded-[2rem] border border-white/5 p-6 text-center">
                <div className="font-data text-xs text-ghost/40 tracking-widest uppercase mb-2">Total XP</div>
                <div className="font-heading font-black text-4xl text-accent text-shadow-glow" ref={xpRef}>0</div>
            </div>
            <div className="bg-[#0C1021] rounded-[2rem] border border-white/5 p-5 flex items-center gap-3">
                <div className="text-2xl">🔥</div>
                <div>
                    <div className="font-heading text-lg text-orange-400 font-bold">7 Days</div>
                    <div className="font-data text-[10px] text-ghost/40 tracking-wider">CURRENT STREAK</div>
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
            <div className="bg-[#0C1021] rounded-[2rem] border border-white/5 p-5 space-y-3">
                <div className="font-heading text-xs uppercase tracking-widest text-ghost/40 mb-3">Recent Activity</div>
                {recentXP.map((item, i) => (
                    <div key={i} className="xp-log-item flex justify-between items-center font-data text-xs">
                        <span className="text-accent">{item.text}</span>
                        <span className="text-ghost/30">{item.time}</span>
                    </div>
                ))}
            </div>
            <button className="btn-magnetic w-full py-4 rounded-2xl bg-tertiary/20 border border-tertiary/30 text-tertiary font-heading text-sm uppercase tracking-wider hover:bg-tertiary/30 transition-all">
                <span className="btn-content flex items-center justify-center gap-2"><Brain size={16} /> AI Quest Advisor</span>
            </button>
        </div>
    );
};

/* ── Dashboard Page ── */
export default function DashboardPage() {
    const tabs = ['daily', 'weekly', 'monthly', 'yearly'];
    const [activeTab, setActiveTab] = useState('daily');
    const [quests, setQuests] = useState(questsData);
    const [selectedQuest, setSelectedQuest] = useState<QuestItem | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    const handleQuestClick = (quest: QuestItem) => {
        if (quest.done) return;
        setSelectedQuest(quest);
        setModalOpen(true);
    };

    const handleQuestConfirm = (questId: string | number, proofUrl?: string) => {
        setQuests(prev => {
            const updated = { ...prev };
            for (const key of Object.keys(updated)) {
                updated[key] = updated[key].map(q =>
                    q.id === questId ? { ...q, done: true, proofUrl } : q
                );
            }
            return updated;
        });
        setModalOpen(false);
        setSelectedQuest(null);
    };

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from('.dash-card', { y: 30, opacity: 0, stagger: 0.15, duration: 0.6, ease: 'power3.out' });
        });
        return () => ctx.revert();
    }, []);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="dash-card lg:col-span-3">
                <CharacterCard />
            </div>
            <div className="dash-card lg:col-span-6">
                <div className="bg-[#0C1021] rounded-[2rem] border border-white/5 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="font-heading font-bold text-xl uppercase tracking-wider">Quest Board</h2>
                        <div className="font-data text-[10px] text-ghost/30 tracking-wider">{quests[activeTab].filter(q => q.done).length}/{quests[activeTab].length} COMPLETE</div>
                    </div>
                    <div className="flex gap-2 mb-6 bg-white/5 rounded-xl p-1">
                        {tabs.map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)}
                                className={`flex-1 py-2 rounded-lg font-data text-xs uppercase tracking-wider transition-all ${activeTab === tab ? 'bg-accent text-background font-bold' : 'text-ghost/50 hover:text-ghost'}`}>
                                {tab}
                            </button>
                        ))}
                    </div>
                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                        {quests[activeTab].length > 0 ? (
                            quests[activeTab].map(q => <QuestCard key={q.id} quest={q} onClick={handleQuestClick} />)
                        ) : (
                            <div className="text-center py-16">
                                <Sparkles size={40} className="mx-auto text-accent/30 mb-4 animate-bounce" />
                                <p className="font-sans text-ghost/40">No quests yet — Generate your first quest!</p>
                            </div>
                        )}
                    </div>
                    <button className="btn-magnetic w-full mt-6 py-4 rounded-2xl bg-accent-secondary/10 border border-accent-secondary/30 text-accent-secondary font-heading text-sm uppercase tracking-wider hover:bg-accent-secondary/20 transition-all animate-pulse">
                        <span className="btn-content flex items-center justify-center gap-2"><Sparkles size={16} /> Generate New Quests</span>
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
                <StatsPanel />
            </div>
        </div>
    );
}
