'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Shield, Loader2 } from 'lucide-react';
import gsap from 'gsap';

interface CreateGuildModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreated: (guild: { id: string; name: string }) => void;
}

export default function CreateGuildModal({ isOpen, onClose, onCreated }: CreateGuildModalProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const modalRef = useRef<HTMLDivElement>(null);
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
        if (creating) return;
        if (modalRef.current && overlayRef.current) {
            gsap.to(modalRef.current, { opacity: 0, scale: 0.95, y: 10, duration: 0.2 });
            gsap.to(overlayRef.current, { opacity: 0, duration: 0.2, onComplete: onClose });
        } else {
            onClose();
        }
    };

    const handleCreate = async () => {
        if (!name.trim() || name.trim().length < 2) {
            setError('Guild name must be at least 2 characters');
            return;
        }

        setCreating(true);
        setError(null);

        try {
            const res = await fetch('/api/guilds', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name.trim(), description: description.trim() || null }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Failed to create guild');
                return;
            }

            onCreated(data.guild);
        } catch {
            setError('Something went wrong');
        } finally {
            setCreating(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div ref={overlayRef} className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />

            <div ref={modalRef} className="relative w-full max-w-md bg-[#0C1021]/95 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-[0_0_60px_rgba(155,78,221,0.08)] overflow-hidden">
                <button onClick={handleClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors z-10">
                    <X size={16} className="text-ghost/50" />
                </button>

                <div className="p-6 pt-8">
                    {/* Header */}
                    <div className="text-center mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-tertiary/10 border border-tertiary/20 flex items-center justify-center mx-auto mb-3">
                            <Shield size={28} className="text-tertiary" />
                        </div>
                        <h3 className="font-heading text-lg font-bold text-white uppercase tracking-wider">Create Guild</h3>
                        <p className="font-data text-[10px] text-ghost/40 mt-1 tracking-widest uppercase">
                            Unite Your Heroes
                        </p>
                    </div>

                    {/* Form */}
                    <div className="space-y-4 mb-6">
                        <div>
                            <label className="font-data text-[10px] text-ghost/40 tracking-wider uppercase mb-1.5 block">Guild Name</label>
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter guild name..."
                                maxLength={50}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 font-sans text-sm text-ghost placeholder:text-ghost/30 focus:outline-none focus:border-tertiary/30 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="font-data text-[10px] text-ghost/40 tracking-wider uppercase mb-1.5 block">Description (Optional)</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="What is your guild about?"
                                maxLength={200}
                                rows={3}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 font-sans text-sm text-ghost placeholder:text-ghost/30 focus:outline-none focus:border-tertiary/30 transition-colors resize-none"
                            />
                        </div>
                    </div>

                    {error && (
                        <p className="font-data text-xs text-red-400 text-center mb-4">{error}</p>
                    )}

                    <button
                        onClick={handleCreate}
                        disabled={creating || !name.trim()}
                        className="w-full py-4 rounded-2xl bg-tertiary/10 border border-tertiary/30 text-tertiary font-heading text-sm uppercase tracking-wider hover:bg-tertiary/20 hover:border-tertiary/50 hover:shadow-[0_0_20px_rgba(155,78,221,0.1)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {creating ? <Loader2 size={18} className="animate-spin" /> : <Shield size={18} />}
                        {creating ? 'Creating...' : 'Create Guild'}
                    </button>
                </div>
            </div>
        </div>
    );
}
