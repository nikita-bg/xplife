'use client';

import React from 'react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { Shield, Target, Zap, Users, Brain, Trophy } from 'lucide-react';

const values = [
    { icon: Brain, title: 'Science-Backed', desc: 'Quests are built on neuroscience — Braverman personality profiling, dopamine-driven rewards, and habit-formation psychology.' },
    { icon: Target, title: 'Personalized', desc: 'No two players are the same. AI adapts to your personality type, lifestyle, schedule, and goals for truly custom challenges.' },
    { icon: Zap, title: 'Gamified', desc: 'XP, levels, streaks, guilds, boss battles, and leaderboards make self-improvement feel like an adventure, not a chore.' },
    { icon: Users, title: 'Community', desc: 'Join guilds, compete in leaderboards, and fight world bosses together. Self-improvement is better with allies.' },
    { icon: Shield, title: 'Privacy-First', desc: 'Your data stays yours. We never sell personal information. Row-level security and encryption protect your progress.' },
    { icon: Trophy, title: 'Results-Driven', desc: 'Every feature is designed to create measurable behavior change. Track progress with journal and analytics.' },
];

export default function AboutClient() {
    return (
        <div className="min-h-screen bg-background text-ghost">
            <Navbar />
            <main className="max-w-5xl mx-auto px-6 py-32">
                <div className="text-center mb-20">
                    <p className="font-data text-xs text-accent tracking-[0.3em] uppercase mb-4">About XPLife</p>
                    <h1 className="font-heading font-black text-4xl md:text-6xl text-ghost uppercase tracking-tight mb-6">
                        Level Up <span className="text-accent">Your Life</span>
                    </h1>
                    <p className="text-ghost/60 font-sans text-lg max-w-2xl mx-auto">
                        XPLife transforms boring to-do lists into personalized RPG quests. Powered by AI and neuroscience, we help you build habits, crush goals, and become your best self — one quest at a time.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
                    {values.map((v, i) => (
                        <div key={i} className="bg-[#0C1021] rounded-2xl border border-white/5 p-6 hover:border-accent/20 transition-colors">
                            <v.icon size={24} className="text-accent mb-4" />
                            <h3 className="font-heading font-bold text-white text-sm uppercase tracking-wider mb-2">{v.title}</h3>
                            <p className="text-ghost/50 font-sans text-sm leading-relaxed">{v.desc}</p>
                        </div>
                    ))}
                </div>

                <div className="bg-[#0C1021] rounded-2xl border border-white/5 p-8 md:p-12 text-center">
                    <h2 className="font-heading font-bold text-2xl text-ghost uppercase tracking-wide mb-4">The Mission</h2>
                    <p className="text-ghost/60 font-sans text-base max-w-3xl mx-auto leading-relaxed">
                        We believe everyone deserves a life that feels like an adventure. Traditional productivity tools fail because they ignore human psychology. XPLife uses the same reward mechanics that make games addictive — XP, levels, streaks, and social competition — but applies them to real-world goals. Combined with AI that understands your unique brain chemistry, we create a system that makes self-improvement genuinely enjoyable.
                    </p>
                </div>
            </main>
            <Footer />
        </div>
    );
}
