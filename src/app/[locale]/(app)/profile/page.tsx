'use client';

import React, { useState } from 'react';
import { Camera, Globe, AlertTriangle } from 'lucide-react';

export default function ProfilePage() {
    const [displayName, setDisplayName] = useState('Hero');
    const [language, setLanguage] = useState('EN');

    const stats = [
        { label: 'Level', value: '3', color: 'text-accent' },
        { label: 'Total XP', value: '4,920', color: 'text-accent' },
        { label: 'Rank', value: 'Iron', color: 'text-ghost' },
        { label: 'Days Active', value: '24', color: 'text-accent-secondary' },
        { label: 'Quests Done', value: '47', color: 'text-tertiary' },
    ];

    return (
        <div className="max-w-3xl mx-auto">
            <h1 className="font-heading font-black text-3xl md:text-4xl uppercase tracking-tight text-white mb-8">Profile</h1>

            <div className="flex flex-col items-center mb-8">
                <div className="relative group cursor-pointer">
                    <div className="w-28 h-28 rounded-full bg-gradient-to-br from-accent to-tertiary flex items-center justify-center text-4xl font-bold text-background ring-4 ring-accent/20">H</div>
                    <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Camera size={24} className="text-white" />
                    </div>
                </div>
                <div className="font-heading font-bold text-xl text-white mt-4">Hero</div>
                <div className="font-data text-xs text-accent-secondary tracking-wider">Adventurer · Iron Rank</div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
                {stats.map(s => (
                    <div key={s.label} className="bg-[#0C1021] rounded-2xl border border-white/5 p-4 text-center">
                        <div className={`font-heading font-bold text-xl ${s.color}`}>{s.value}</div>
                        <div className="font-data text-[10px] text-ghost/40 tracking-wider uppercase mt-1">{s.label}</div>
                    </div>
                ))}
            </div>

            <div className="bg-[#0C1021] rounded-[2rem] border border-white/5 p-6 md:p-8 mb-6">
                <h2 className="font-heading text-sm font-bold uppercase tracking-widest text-ghost/60 mb-6">Account Settings</h2>
                <div className="space-y-5">
                    <div>
                        <label className="font-data text-xs text-ghost/40 uppercase tracking-wider block mb-2">Display Name</label>
                        <input value={displayName} onChange={e => setDisplayName(e.target.value)} className="w-full bg-background border border-white/10 rounded-xl py-3 px-4 font-sans text-sm text-ghost focus:outline-none focus:border-accent/30 transition-colors" />
                    </div>
                    <div>
                        <label className="font-data text-xs text-ghost/40 uppercase tracking-wider block mb-2">Email</label>
                        <input value="hero@xplife.app" readOnly className="w-full bg-background border border-white/5 rounded-xl py-3 px-4 font-sans text-sm text-ghost/30 cursor-not-allowed" />
                    </div>
                    <div>
                        <label className="font-data text-xs text-ghost/40 uppercase tracking-wider block mb-2">Language</label>
                        <div className="relative">
                            <Globe size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-ghost/30" />
                            <select value={language} onChange={e => setLanguage(e.target.value)} className="w-full bg-background border border-white/10 rounded-xl py-3 pl-10 pr-4 font-sans text-sm text-ghost focus:outline-none focus:border-accent/30 appearance-none cursor-pointer">
                                {['EN', 'BG', 'ES', 'JA', 'ZH'].map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                        </div>
                    </div>
                    <button className="btn-magnetic px-8 py-3 rounded-xl bg-accent text-background font-heading text-sm uppercase tracking-wider font-bold shadow-[0_0_15px_rgba(0,245,255,0.3)] hover:shadow-[0_0_25px_rgba(0,245,255,0.5)]">
                        <span className="btn-content">Save Changes</span>
                    </button>
                </div>
            </div>

            <div className="bg-[#0C1021] rounded-[2rem] border border-accent-secondary/20 p-6 md:p-8 mb-6">
                <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">🗺️</span>
                    <div>
                        <h3 className="font-heading font-bold text-white">The Adventurer</h3>
                        <div className="font-data text-xs text-accent-secondary tracking-wider">Your Class</div>
                    </div>
                </div>
                <p className="font-sans text-sm text-ghost/60 mb-4 leading-relaxed">
                    You thrive on exploration and new experiences. Your strength lies in adaptability and courage. Every challenge is a path to growth.
                </p>
                <button className="font-data text-xs text-ghost/40 hover:text-accent transition-colors underline underline-offset-4">Retake Personality Quiz</button>
            </div>

            <div className="bg-[#0C1021] rounded-[2rem] border border-white/5 p-6 md:p-8 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <div className="font-heading text-sm font-bold text-white uppercase tracking-wider">Free Adventurer</div>
                    <div className="font-sans text-xs text-ghost/40 mt-1">1 goal · 15 tasks/week · 15 AI chats/day</div>
                </div>
                <button className="btn-magnetic px-6 py-3 rounded-xl bg-gradient-to-r from-accent-secondary to-yellow-500 text-background font-heading text-sm uppercase tracking-wider font-bold shrink-0">
                    <span className="btn-content">Upgrade to Pro Hero</span>
                </button>
            </div>

            <div className="bg-[#0C1021] rounded-[2rem] border border-red-500/20 p-6 md:p-8">
                <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle size={16} className="text-red-400" />
                    <h3 className="font-heading text-sm font-bold text-red-400 uppercase tracking-wider">Danger Zone</h3>
                </div>
                <p className="font-sans text-xs text-ghost/40 mb-4">This action is permanent and cannot be undone.</p>
                <button className="px-6 py-2.5 rounded-xl border border-red-500/30 text-red-400 font-heading text-xs uppercase tracking-wider hover:bg-red-500/10 transition-colors">Delete Account</button>
            </div>
        </div>
    );
}
