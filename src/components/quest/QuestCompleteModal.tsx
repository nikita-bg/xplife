'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Check, Camera, Zap, Shield } from 'lucide-react';
import gsap from 'gsap';
import ProofUpload from './ProofUpload';

interface Quest {
    id: string | number;
    title: string;
    description?: string | null;
    category: string | null;
    difficulty: string;
    xp?: number;
    xp_reward?: number;
}

interface QuestCompleteModalProps {
    quest: Quest;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (questId: string | number, proofUrl?: string) => void;
}

const diffColors: Record<string, string> = {
    Easy: 'text-green-400 bg-green-400/10 border-green-400/20',
    Medium: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    Hard: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
    Epic: 'text-red-400 bg-red-400/10 border-red-400/20',
    easy: 'text-green-400 bg-green-400/10 border-green-400/20',
    medium: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    hard: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
    epic: 'text-red-400 bg-red-400/10 border-red-400/20',
};

export default function QuestCompleteModal({ quest, isOpen, onClose, onConfirm }: QuestCompleteModalProps) {
    const [showProofUpload, setShowProofUpload] = useState(false);
    const [proofUrl, setProofUrl] = useState<string | null>(null);
    const [completing, setCompleting] = useState(false);
    const [showXpAnimation, setShowXpAnimation] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);
    const xpRef = useRef<HTMLDivElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && modalRef.current && overlayRef.current) {
            gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2 });
            gsap.fromTo(modalRef.current,
                { opacity: 0, scale: 0.9, y: 20 },
                { opacity: 1, scale: 1, y: 0, duration: 0.3, ease: 'back.out(1.5)' }
            );
        }
    }, [isOpen]);

    const handleClose = () => {
        if (completing) return;
        if (modalRef.current && overlayRef.current) {
            gsap.to(modalRef.current, { opacity: 0, scale: 0.95, y: 10, duration: 0.2 });
            gsap.to(overlayRef.current, { opacity: 0, duration: 0.2, onComplete: onClose });
        } else {
            onClose();
        }
    };

    const handleConfirm = async () => {
        setCompleting(true);
        setShowXpAnimation(true);

        const xpAmount = quest.xp_reward || quest.xp || 50;

        // XP counter animation using a plain object (reliable GSAP pattern)
        if (xpRef.current) {
            xpRef.current.innerText = '+0 XP';
            const counter = { val: 0 };
            gsap.fromTo(xpRef.current,
                { scale: 0.5, opacity: 0 },
                { scale: 1, opacity: 1, duration: 0.3, ease: 'power2.out' }
            );
            gsap.to(counter, {
                val: xpAmount,
                duration: 1.2,
                ease: 'power2.out',
                onUpdate: () => {
                    if (xpRef.current) {
                        xpRef.current.innerText = `+${Math.round(counter.val)} XP`;
                    }
                },
            });
        }

        // Wait for animation then confirm
        setTimeout(() => {
            onConfirm(quest.id, proofUrl || undefined);
        }, 1500);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                ref={overlayRef}
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Modal */}
            <div
                ref={modalRef}
                className="relative w-full max-w-md bg-[#0C1021]/95 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-[0_0_60px_rgba(0,245,255,0.08)] overflow-hidden"
            >
                {/* Close button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors z-10"
                >
                    <X size={16} className="text-ghost/50" />
                </button>

                {/* XP Animation Overlay */}
                {showXpAnimation && (
                    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20">
                        <div className="w-20 h-20 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center mb-4 animate-pulse">
                            <Zap size={36} className="text-accent" />
                        </div>
                        <div
                            ref={xpRef}
                            className="font-heading text-4xl font-black text-accent"
                            style={{ textShadow: '0 0 30px rgba(0,245,255,0.5)' }}
                        >

                        </div>
                        <p className="font-data text-xs text-ghost/40 mt-2 tracking-wider uppercase">Quest Complete!</p>

                        {/* Particle burst */}
                        <div className="absolute inset-0 pointer-events-none overflow-hidden">
                            {[...Array(12)].map((_, i) => (
                                <span
                                    key={i}
                                    className="absolute w-1.5 h-1.5 rounded-full"
                                    style={{
                                        top: '50%',
                                        left: '50%',
                                        backgroundColor: i % 3 === 0 ? '#00F5FF' : i % 3 === 1 ? '#FFB800' : '#9B4EDD',
                                        animation: `particle-burst 1s ease-out ${i * 0.05}s forwards`,
                                        transform: `rotate(${i * 30}deg) translateY(-20px)`,
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Content */}
                <div className="p-6 pt-8">
                    {/* Header */}
                    <div className="text-center mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-3">
                            <Shield size={28} className="text-accent" />
                        </div>
                        <h3 className="font-heading text-lg font-bold text-white uppercase tracking-wider">
                            Complete Quest?
                        </h3>
                        <p className="font-data text-[10px] text-ghost/40 mt-1 tracking-widest uppercase">
                            Honor System Verification
                        </p>
                    </div>

                    {/* Quest Info */}
                    <div className="bg-white/[0.03] rounded-xl border border-white/5 p-4 mb-6">
                        <h4 className="font-sans text-sm text-ghost font-medium mb-2">{quest.title}</h4>
                        {quest.description && (
                            <p className="font-sans text-xs text-ghost/50 mb-3 max-h-32 overflow-y-auto">{quest.description}</p>
                        )}
                        <div className="flex items-center gap-3">
                            <span className="font-data text-[10px] text-ghost/40 tracking-wider uppercase">{quest.category}</span>
                            <span className={`font-data text-[10px] px-2 py-0.5 rounded-full border ${diffColors[quest.difficulty] || 'text-ghost/40 bg-white/5 border-white/10'}`}>
                                {quest.difficulty}
                            </span>
                            <span className="font-data text-xs text-accent-secondary ml-auto">+{quest.xp_reward || quest.xp || 50} XP</span>
                        </div>
                    </div>

                    {/* Proof Upload Section */}
                    {showProofUpload && (
                        <div className="mb-4">
                            <ProofUpload
                                taskId={String(quest.id)}
                                onUploadComplete={(url) => {
                                    setProofUrl(url);
                                    setShowProofUpload(false);
                                }}
                                onCancel={() => setShowProofUpload(false)}
                            />
                        </div>
                    )}

                    {/* Proof badge if uploaded */}
                    {proofUrl && !showProofUpload && (
                        <div className="mb-4 flex items-center gap-2 bg-green-400/5 rounded-xl border border-green-400/20 p-3">
                            <Camera size={16} className="text-green-400" />
                            <span className="font-data text-xs text-green-400 tracking-wider">PROOF UPLOADED</span>
                            <Check size={14} className="text-green-400 ml-auto" />
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="space-y-2">
                        <button
                            onClick={handleConfirm}
                            disabled={completing}
                            className="w-full py-4 rounded-2xl bg-accent/10 border border-accent/30 text-accent font-heading text-sm uppercase tracking-wider hover:bg-accent/20 hover:border-accent/50 hover:shadow-[0_0_20px_rgba(0,245,255,0.1)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <Check size={18} />
                            {completing ? 'Completing...' : 'I Completed This Quest'}
                        </button>

                        {!showProofUpload && !proofUrl && (
                            <button
                                onClick={() => setShowProofUpload(true)}
                                disabled={completing}
                                className="w-full py-3 rounded-2xl bg-white/[0.03] border border-white/10 text-ghost/50 font-data text-xs uppercase tracking-wider hover:bg-white/[0.06] hover:text-ghost/70 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                <Camera size={14} />
                                Upload Proof (Optional)
                            </button>
                        )}
                    </div>
                </div>

                {/* Particle animation keyframes */}
                <style jsx>{`
          @keyframes particle-burst {
            0% {
              transform: rotate(var(--angle)) translateY(0);
              opacity: 1;
            }
            100% {
              transform: rotate(var(--angle)) translateY(-100px);
              opacity: 0;
            }
          }
        `}</style>
            </div>
        </div>
    );
}
