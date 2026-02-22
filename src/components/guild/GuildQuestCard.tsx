'use client';

import React from 'react';
import { Swords, Users, Check } from 'lucide-react';

interface GuildQuestCardProps {
    quest: {
        id: string;
        title: string;
        description?: string | null;
        category: string;
        difficulty: string;
        xp_reward: number;
        target_contributions: number;
        current_contributions: number;
        status: string;
    };
    onContribute: (questId: string) => void;
    contributing?: boolean;
}

const diffColors: Record<string, string> = {
    easy: 'text-green-400 bg-green-400/10 border-green-400/20',
    medium: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    hard: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
    epic: 'text-red-400 bg-red-400/10 border-red-400/20',
};

export default function GuildQuestCard({ quest, onContribute, contributing }: GuildQuestCardProps) {
    const progress = quest.target_contributions > 0
        ? Math.min((quest.current_contributions / quest.target_contributions) * 100, 100)
        : 0;
    const isCompleted = quest.status === 'completed';

    return (
        <div className={`bg-[#0C1021] rounded-2xl border p-4 transition-all duration-300 ${isCompleted ? 'border-green-500/20 opacity-70' : 'border-white/5 hover:border-accent/30'}`}>
            {/* Header */}
            <div className="flex items-start gap-3 mb-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isCompleted ? 'bg-green-400/10' : 'bg-tertiary/10'}`}>
                    {isCompleted ? <Check size={18} className="text-green-400" /> : <Swords size={18} className="text-tertiary" />}
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className={`font-sans text-sm font-medium ${isCompleted ? 'line-through text-ghost/30' : 'text-ghost'}`}>
                        {quest.title}
                    </h4>
                    {quest.description && (
                        <p className="font-sans text-xs text-ghost/40 mt-0.5 line-clamp-2">{quest.description}</p>
                    )}
                </div>
            </div>

            {/* Tags */}
            <div className="flex items-center gap-2 mb-3">
                <span className="font-data text-[10px] text-ghost/40 tracking-wider uppercase">{quest.category}</span>
                <span className={`font-data text-[10px] px-1.5 py-0.5 rounded-full border ${diffColors[quest.difficulty] || 'text-ghost/40 bg-white/5 border-white/10'}`}>
                    {quest.difficulty}
                </span>
                <span className="font-data text-xs text-accent-secondary ml-auto">+{quest.xp_reward} XP</span>
            </div>

            {/* Progress bar */}
            <div className="mb-3">
                <div className="flex justify-between mb-1">
                    <span className="font-data text-[10px] text-ghost/40 tracking-wider flex items-center gap-1">
                        <Users size={10} /> {quest.current_contributions}/{quest.target_contributions}
                    </span>
                    <span className="font-data text-[10px] text-ghost/40">{Math.round(progress)}%</span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${isCompleted ? 'bg-green-400' : 'bg-gradient-to-r from-accent to-tertiary'}`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Contribute button */}
            {!isCompleted && (
                <button
                    onClick={() => onContribute(quest.id)}
                    disabled={contributing}
                    className="w-full py-2.5 rounded-xl bg-tertiary/10 border border-tertiary/20 text-tertiary font-data text-xs uppercase tracking-wider hover:bg-tertiary/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    <Swords size={14} />
                    {contributing ? 'Contributing...' : 'Contribute'}
                </button>
            )}
        </div>
    );
}
