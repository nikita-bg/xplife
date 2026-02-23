'use client';

import React, { useState, useEffect } from 'react';
import { Camera, Globe, AlertTriangle, Loader2, Save } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useProfile } from '@/hooks/use-profile';
import { getRankFromLevel } from '@/lib/xpUtils';
import { createClient } from '@/lib/supabase/client';
import { useRouter, usePathname } from 'next/navigation';

const PERSONALITY_CLASSES: Record<string, { name: string; emoji: string; desc: string }> = {
    dopamine: { name: 'The Adventurer', emoji: '🗺️', desc: 'You thrive on excitement, novelty, and bold challenges. Your quests focus on pushing boundaries and achieving ambitious goals.' },
    acetylcholine: { name: 'The Thinker', emoji: '🧠', desc: 'You love learning, creativity, and deep focus. Your quests center around skill mastery and intellectual growth.' },
    gaba: { name: 'The Guardian', emoji: '🛡️', desc: 'You value stability, consistency, and inner peace. Your quests build strong habits and promote balance.' },
    serotonin: { name: 'The Connector', emoji: '🌿', desc: 'You draw energy from relationships and community. Your quests strengthen bonds and promote meaningful connections.' },
};

const PLAN_LABELS: Record<string, { label: string; desc: string }> = {
    free: { label: 'Free Adventurer', desc: '1 goal · 15 tasks/week · 15 AI chats/day' },
    premium: { label: 'Pro Hero', desc: 'Unlimited goals · Unlimited tasks · Unlimited AI chats' },
    lifetime: { label: 'Legendary Hero', desc: 'Lifetime access · All features unlocked' },
};

const LANGUAGES = [
    { code: 'en', label: 'English' },
    { code: 'bg', label: 'Български' },
    { code: 'es', label: 'Español' },
    { code: 'ja', label: '日本語' },
    { code: 'zh', label: '中文' },
];

export default function ProfilePage() {
    const t = useTranslations('profile');
    const settings = useTranslations('profile.settings');
    const { profile, streak, loading, refresh } = useProfile();
    const router = useRouter();
    const pathname = usePathname();
    const segments = pathname.split('/');
    const locale = segments[1] || 'en';

    const [displayName, setDisplayName] = useState('');
    const [language, setLanguage] = useState(locale);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        if (profile) {
            setDisplayName(profile.display_name || '');
        }
    }, [profile]);

    const level = profile?.level || 1;
    const totalXP = profile?.total_xp || 0;
    const rankTier = getRankFromLevel(level);
    const personalityType = profile?.personality_type || 'dopamine';
    const classInfo = PERSONALITY_CLASSES[personalityType] || PERSONALITY_CLASSES.dopamine;
    const planInfo = PLAN_LABELS[profile?.plan || 'free'] || PLAN_LABELS.free;

    // Calculate days active
    const daysActive = profile?.created_at
        ? Math.max(1, Math.ceil((Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24)))
        : 0;

    const stats = [
        { label: 'Level', value: String(level), color: 'text-accent' },
        { label: 'Total XP', value: totalXP.toLocaleString(), color: 'text-accent' },
        { label: 'Rank', value: rankTier.charAt(0).toUpperCase() + rankTier.slice(1), color: 'text-ghost' },
        { label: 'Days Active', value: String(daysActive), color: 'text-accent-secondary' },
        { label: 'Streak', value: String(streak?.current_streak || 0), color: 'text-orange-400' },
    ];

    const handleSave = async () => {
        setSaving(true);
        try {
            const supabase = createClient();
            const { error } = await supabase
                .from('users')
                .update({ display_name: displayName.trim(), updated_at: new Date().toISOString() })
                .eq('id', profile?.id);

            if (!error) {
                setSaved(true);
                setTimeout(() => setSaved(false), 2000);
                refresh();
            }
        } catch (err) {
            console.error('Save failed:', err);
        }
        setSaving(false);
    };

    const handleLanguageChange = (newLocale: string) => {
        setLanguage(newLocale);
        const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
        router.push(newPath);
    };

    const handleDeleteAccount = async () => {
        if (!confirm('Are you sure? This action is permanent and cannot be undone.')) return;
        setDeleting(true);
        try {
            const res = await fetch('/api/account/delete', { method: 'POST' });
            if (res.ok) {
                router.push(`/${locale}/login`);
            }
        } catch (err) {
            console.error('Delete failed:', err);
        }
        setDeleting(false);
    };

    const handleRetakeQuiz = () => {
        router.push(`/${locale}/onboarding`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 size={24} className="animate-spin text-accent/50" />
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto">
            <h1 className="font-heading font-black text-3xl md:text-4xl uppercase tracking-tight text-white mb-8">{t('title')}</h1>

            <div className="flex flex-col items-center mb-8">
                <div className="relative group cursor-pointer">
                    <div className="w-28 h-28 rounded-full bg-gradient-to-br from-accent to-tertiary flex items-center justify-center text-4xl font-bold text-background ring-4 ring-accent/20 overflow-hidden">
                        {profile?.avatar_url ? (
                            <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                            displayName.charAt(0).toUpperCase() || 'H'
                        )}
                    </div>
                    <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Camera size={24} className="text-white" />
                    </div>
                </div>
                <div className="font-heading font-bold text-xl text-white mt-4">{displayName || 'Hero'}</div>
                <div className="font-data text-xs text-accent-secondary tracking-wider">{classInfo.name} · {rankTier.charAt(0).toUpperCase() + rankTier.slice(1)} Rank</div>
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
                <h2 className="font-heading text-sm font-bold uppercase tracking-widest text-ghost/60 mb-6">{settings('title')}</h2>
                <div className="space-y-5">
                    <div>
                        <label className="font-data text-xs text-ghost/40 uppercase tracking-wider block mb-2">{t('displayName')}</label>
                        <input value={displayName} onChange={e => setDisplayName(e.target.value)} className="w-full bg-background border border-white/10 rounded-xl py-3 px-4 font-sans text-sm text-ghost focus:outline-none focus:border-accent/30 transition-colors" />
                    </div>
                    <div>
                        <label className="font-data text-xs text-ghost/40 uppercase tracking-wider block mb-2">{t('email')}</label>
                        <input value={profile?.email || ''} readOnly className="w-full bg-background border border-white/5 rounded-xl py-3 px-4 font-sans text-sm text-ghost/30 cursor-not-allowed" />
                    </div>
                    <div>
                        <label className="font-data text-xs text-ghost/40 uppercase tracking-wider block mb-2">Language</label>
                        <div className="relative">
                            <Globe size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-ghost/30" />
                            <select value={language} onChange={e => handleLanguageChange(e.target.value)} className="w-full bg-background border border-white/10 rounded-xl py-3 pl-10 pr-4 font-sans text-sm text-ghost focus:outline-none focus:border-accent/30 appearance-none cursor-pointer">
                                {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
                            </select>
                        </div>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="btn-magnetic px-8 py-3 rounded-xl bg-accent text-background font-heading text-sm uppercase tracking-wider font-bold shadow-[0_0_15px_rgba(0,245,255,0.3)] hover:shadow-[0_0_25px_rgba(0,245,255,0.5)] disabled:opacity-50 flex items-center gap-2"
                    >
                        {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <Save size={14} /> : null}
                        <span className="btn-content">{saved ? settings('saveSuccess') : saving ? settings('saving') : settings('save')}</span>
                    </button>
                </div>
            </div>

            <div className="bg-[#0C1021] rounded-[2rem] border border-accent-secondary/20 p-6 md:p-8 mb-6">
                <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{classInfo.emoji}</span>
                    <div>
                        <h3 className="font-heading font-bold text-white">{classInfo.name}</h3>
                        <div className="font-data text-xs text-accent-secondary tracking-wider">Your Class</div>
                    </div>
                </div>
                <p className="font-sans text-sm text-ghost/60 mb-4 leading-relaxed">{classInfo.desc}</p>
                <button onClick={handleRetakeQuiz} className="font-data text-xs text-ghost/40 hover:text-accent transition-colors underline underline-offset-4">
                    Retake Personality Quiz
                </button>
            </div>

            <div className="bg-[#0C1021] rounded-[2rem] border border-white/5 p-6 md:p-8 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <div className="font-heading text-sm font-bold text-white uppercase tracking-wider">{planInfo.label}</div>
                    <div className="font-sans text-xs text-ghost/40 mt-1">{planInfo.desc}</div>
                </div>
                {profile?.plan === 'free' && (
                    <button
                        onClick={() => {
                            const checkoutUrl = process.env.NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_URL
                            if (checkoutUrl) {
                                window.open(`${checkoutUrl}?checkout[email]=${encodeURIComponent(profile?.email || '')}`, '_blank')
                            } else {
                                alert('Checkout is not configured yet. Please contact support.')
                            }
                        }}
                        className="btn-magnetic px-6 py-3 rounded-xl bg-gradient-to-r from-accent-secondary to-yellow-500 text-background font-heading text-sm uppercase tracking-wider font-bold shrink-0"
                    >
                        <span className="btn-content">Upgrade to Pro Hero</span>
                    </button>
                )}
            </div>

            <div className="bg-[#0C1021] rounded-[2rem] border border-red-500/20 p-6 md:p-8">
                <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle size={16} className="text-red-400" />
                    <h3 className="font-heading text-sm font-bold text-red-400 uppercase tracking-wider">Danger Zone</h3>
                </div>
                <p className="font-sans text-xs text-ghost/40 mb-4">This action is permanent and cannot be undone.</p>
                <button
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                    className="px-6 py-2.5 rounded-xl border border-red-500/30 text-red-400 font-heading text-xs uppercase tracking-wider hover:bg-red-500/10 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                    {deleting && <Loader2 size={12} className="animate-spin" />}
                    {deleting ? 'Deleting...' : 'Delete Account'}
                </button>
            </div>
        </div>
    );
}
