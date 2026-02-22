'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Zap, ChevronRight, Check, Loader2 } from 'lucide-react';
import gsap from 'gsap';

interface PackSummary {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    questCount: number;
    totalXp: number;
}

interface TemplatePackModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApplied: (packName: string, count: number) => void;
}

const colorMap: Record<string, string> = {
    amber: 'from-amber-500/20 to-amber-600/5 border-amber-400/30 text-amber-400',
    red: 'from-red-500/20 to-red-600/5 border-red-400/30 text-red-400',
    blue: 'from-blue-500/20 to-blue-600/5 border-blue-400/30 text-blue-400',
    pink: 'from-pink-500/20 to-pink-600/5 border-pink-400/30 text-pink-400',
    emerald: 'from-emerald-500/20 to-emerald-600/5 border-emerald-400/30 text-emerald-400',
    violet: 'from-violet-500/20 to-violet-600/5 border-violet-400/30 text-violet-400',
    teal: 'from-teal-500/20 to-teal-600/5 border-teal-400/30 text-teal-400',
    orange: 'from-orange-500/20 to-orange-600/5 border-orange-400/30 text-orange-400',
};

export default function TemplatePackModal({ isOpen, onClose, onApplied }: TemplatePackModalProps) {
    const [packs, setPacks] = useState<PackSummary[]>([]);
    const [applying, setApplying] = useState<string | null>(null);
    const [applied, setApplied] = useState<string | null>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            fetch('/api/templates')
                .then(r => r.json())
                .then(d => setPacks(d.packs || []));

            if (modalRef.current && overlayRef.current) {
                gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2 });
                gsap.fromTo(modalRef.current,
                    { opacity: 0, scale: 0.9, y: 20 },
                    { opacity: 1, scale: 1, y: 0, duration: 0.3, ease: 'back.out(1.5)' }
                );
            }
        }
    }, [isOpen]);

    const handleClose = () => {
        if (applying) return;
        if (modalRef.current && overlayRef.current) {
            gsap.to(modalRef.current, { opacity: 0, scale: 0.95, y: 10, duration: 0.2 });
            gsap.to(overlayRef.current, { opacity: 0, duration: 0.2, onComplete: onClose });
        } else {
            onClose();
        }
    };

    const handleApply = async (packId: string) => {
        setApplying(packId);
        try {
            const res = await fetch('/api/templates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ packId }),
            });
            if (res.ok) {
                const data = await res.json();
                setApplied(packId);
                setTimeout(() => {
                    onApplied(data.applied, data.tasksCreated);
                }, 800);
            }
        } catch { /* silent */ }
        setApplying(null);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div ref={overlayRef} className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />

            <div ref={modalRef} className="relative w-full max-w-lg bg-[#0C1021]/95 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-[0_0_60px_rgba(155,78,221,0.08)] overflow-hidden max-h-[80vh]">
                <button onClick={handleClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors z-10">
                    <X size={16} className="text-ghost/50" />
                </button>

                <div className="p-6 pt-8">
                    <div className="text-center mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-3">
                            <Sparkles size={28} className="text-accent" />
                        </div>
                        <h3 className="font-heading text-lg font-bold text-white uppercase tracking-wider">Quest Packs</h3>
                        <p className="font-data text-[10px] text-ghost/40 mt-1 tracking-widest uppercase">
                            Instant quest collections
                        </p>
                    </div>

                    <div className="space-y-3 overflow-y-auto max-h-[50vh] pr-1">
                        {packs.map(pack => {
                            const colors = colorMap[pack.color] || colorMap.blue;
                            const isApplied = applied === pack.id;
                            const isApplying = applying === pack.id;

                            return (
                                <button
                                    key={pack.id}
                                    onClick={() => !isApplied && handleApply(pack.id)}
                                    disabled={!!applying || isApplied}
                                    className={`w-full text-left p-4 rounded-2xl bg-gradient-to-r ${colors} border transition-all duration-300 hover:scale-[1.01] disabled:opacity-70 disabled:hover:scale-100`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-heading text-sm font-bold uppercase tracking-wider">{pack.name}</h4>
                                            <p className="font-sans text-xs text-ghost/50 mt-0.5">{pack.description}</p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <div className="font-data text-xs flex items-center gap-1">
                                                <Zap size={10} /> {pack.totalXp} XP
                                            </div>
                                            <div className="font-data text-[10px] text-ghost/30 mt-0.5">{pack.questCount} quests</div>
                                        </div>
                                        <div className="shrink-0 ml-1">
                                            {isApplied ? (
                                                <Check size={18} className="text-green-400" />
                                            ) : isApplying ? (
                                                <Loader2 size={18} className="animate-spin" />
                                            ) : (
                                                <ChevronRight size={18} className="text-ghost/30" />
                                            )}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
