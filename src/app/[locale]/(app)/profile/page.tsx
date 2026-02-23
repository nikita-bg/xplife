'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Camera, Globe, AlertTriangle, Loader2, Save, Clock, Heart, X, Plus } from 'lucide-react';
import { useTranslations, useMessages } from 'next-intl';
import { useProfile } from '@/hooks/use-profile';
import { getRankFromLevel } from '@/lib/xpUtils';
import { createClient } from '@/lib/supabase/client';
import { useRouter, usePathname } from 'next/navigation';

const INTEREST_OPTIONS = [
    'fitness', 'yoga', 'meditation', 'running', 'hiking', 'swimming',
    'coding', 'reading', 'writing', 'photography', 'music', 'cooking',
    'gaming', 'art', 'travel', 'languages', 'finance', 'gardening',
    'volunteering', 'public speaking', 'journaling', 'chess',
];

const TIME_OPTIONS = ['morning', 'afternoon', 'evening', 'night'];
const DURATION_OPTIONS = ['quick', 'medium', 'deep'];


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
    const cls = useTranslations('profile.class');
    const plan = useTranslations('profile.plan');
    const dz = useTranslations('profile.dangerZone');
    const sl = useTranslations('profile.statsLabels');
    const pers = useTranslations('profile.settings.personalization');
    const messages = useMessages() as Record<string, unknown>;
    const interestOptions = ((messages as Record<string, unknown>)?.onboarding as Record<string, unknown>)?.interests as Record<string, unknown>;
    const interestLabels = (interestOptions?.options || {}) as Record<string, string>;
    const getInterestLabel = (key: string) => interestLabels[key] || key.charAt(0).toUpperCase() + key.slice(1);
    const { profile, streak, loading, refresh } = useProfile();
    const router = useRouter();
    const pathname = usePathname();
    const segments = pathname.split('/');
    const locale = segments[1] || 'en';

    const [displayName, setDisplayName] = useState('');
    const [aboutMe, setAboutMe] = useState('');
    const [timePreference, setTimePreference] = useState('morning');
    const [taskDuration, setTaskDuration] = useState('medium');
    const [occupation, setOccupation] = useState('');
    const [workSchedule, setWorkSchedule] = useState('');
    const [lifePhase, setLifePhase] = useState('');
    const [mainChallenge, setMainChallenge] = useState('');
    const [interests, setInterests] = useState<string[]>([]);
    const [language, setLanguage] = useState(locale);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (profile) {
            setDisplayName(profile.display_name || '');
            setAboutMe(profile.about_me || '');
            setTimePreference(profile.time_preference || 'morning');
            setTaskDuration(profile.preferred_task_duration || 'medium');
            setOccupation(profile.occupation_type || '');
            setWorkSchedule(profile.work_schedule || '');
            setLifePhase(profile.life_phase || '');
            setMainChallenge(profile.main_challenge || '');
        }
    }, [profile]);

    // Load interests
    useEffect(() => {
        if (!profile?.id) return;
        const supabase = createClient();
        supabase.from('user_interests').select('interest').eq('user_id', profile.id)
            .then(({ data }) => {
                if (data) setInterests(data.map(d => d.interest));
            });
    }, [profile?.id]);

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !profile?.id) return;
        setUploadingAvatar(true);
        try {
            const supabase = createClient();
            const ext = file.name.split('.').pop();
            const path = `${profile.id}/avatar.${ext}`;
            const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
            if (uploadError) throw uploadError;
            const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
            await supabase.from('users').update({ avatar_url: publicUrl, updated_at: new Date().toISOString() }).eq('id', profile.id);
            refresh();
        } catch (err) { console.error('Avatar upload failed:', err); }
        setUploadingAvatar(false);
    };

    const level = profile?.level || 1;
    const totalXP = profile?.total_xp || 0;
    const rankTier = getRankFromLevel(level);
    const personalityType = profile?.personality_type || 'dopamine';
    const classMap: Record<string, string> = {
        dopamine: 'adventurer',
        acetylcholine: 'thinker',
        gaba: 'guardian',
        serotonin: 'connector',
    };
    const classKey = classMap[personalityType] || 'adventurer';
    const classEmojis: Record<string, string> = { dopamine: '🗺️', acetylcholine: '🧠', gaba: '🛡️', serotonin: '🌿' };
    const classEmoji = classEmojis[personalityType] || '🗺️';

    // Calculate days active
    const daysActive = profile?.created_at
        ? Math.max(1, Math.ceil((Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24)))
        : 0;

    const planKey = profile?.plan || 'free';

    const stats = [
        { label: sl('level'), value: String(level), color: 'text-accent' },
        { label: sl('totalXp'), value: totalXP.toLocaleString(), color: 'text-accent' },
        { label: sl('rank'), value: rankTier.charAt(0).toUpperCase() + rankTier.slice(1), color: 'text-ghost' },
        { label: sl('daysActive'), value: String(daysActive), color: 'text-accent-secondary' },
        { label: sl('streak'), value: String(streak?.current_streak || 0), color: 'text-orange-400' },
    ];

    const handleSave = async () => {
        setSaving(true);
        try {
            const supabase = createClient();
            const { error } = await supabase
                .from('users')
                .update({
                    display_name: displayName.trim(),
                    about_me: aboutMe.trim() || null,
                    time_preference: timePreference,
                    preferred_task_duration: taskDuration,
                    occupation_type: occupation.trim() || null,
                    work_schedule: workSchedule.trim() || null,
                    life_phase: lifePhase.trim() || null,
                    main_challenge: mainChallenge.trim() || null,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', profile?.id);

            // Save interests
            if (profile?.id) {
                await supabase.from('user_interests').delete().eq('user_id', profile.id);
                if (interests.length > 0) {
                    await supabase.from('user_interests').insert(
                        interests.map(interest => ({ user_id: profile.id, interest }))
                    );
                }
            }

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
        if (!confirm(dz('confirmMessage'))) return;
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
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <div className="w-28 h-28 rounded-full bg-gradient-to-br from-accent to-tertiary flex items-center justify-center text-4xl font-bold text-background ring-4 ring-accent/20 overflow-hidden">
                        {uploadingAvatar ? (
                            <Loader2 size={32} className="animate-spin text-white" />
                        ) : profile?.avatar_url ? (
                            <Image src={profile.avatar_url} alt="" width={112} height={112} className="w-full h-full object-cover" />
                        ) : (
                            displayName.charAt(0).toUpperCase() || 'H'
                        )}
                    </div>
                    <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Camera size={24} className="text-white" />
                    </div>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                </div>
                <div className="font-heading font-bold text-xl text-white mt-4">{displayName || 'Hero'}</div>
                <div className="font-data text-xs text-accent-secondary tracking-wider">{cls(classKey)} · {rankTier.charAt(0).toUpperCase() + rankTier.slice(1)}</div>
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
                        <label className="font-data text-xs text-ghost/40 uppercase tracking-wider block mb-2">{settings('aboutMe')}</label>
                        <textarea value={aboutMe} onChange={e => setAboutMe(e.target.value)} rows={3} placeholder={settings('aboutMePlaceholder')} className="w-full bg-background border border-white/10 rounded-xl py-3 px-4 font-sans text-sm text-ghost focus:outline-none focus:border-accent/30 transition-colors resize-none" />
                    </div>
                    <div>
                        <label className="font-data text-xs text-ghost/40 uppercase tracking-wider block mb-2">{t('language')}</label>
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

            {/* Personalization Settings */}
            <div className="bg-[#0C1021] rounded-[2rem] border border-white/5 p-6 md:p-8 mb-6">
                <div className="flex items-center gap-2 mb-6">
                    <Clock size={16} className="text-accent" />
                    <h2 className="font-heading text-sm font-bold uppercase tracking-widest text-ghost/60">{settings('tabs.personalization')}</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                        <label className="font-data text-xs text-ghost/40 uppercase tracking-wider block mb-2">{pers('timePreference')}</label>
                        <select value={timePreference} onChange={e => setTimePreference(e.target.value)} className="w-full bg-background border border-white/10 rounded-xl py-3 px-4 font-sans text-sm text-ghost focus:outline-none focus:border-accent/30 appearance-none cursor-pointer">
                            {TIME_OPTIONS.map(opt => <option key={opt} value={opt}>{pers(`timeOptions.${opt}`)}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="font-data text-xs text-ghost/40 uppercase tracking-wider block mb-2">{pers('taskDuration')}</label>
                        <select value={taskDuration} onChange={e => setTaskDuration(e.target.value)} className="w-full bg-background border border-white/10 rounded-xl py-3 px-4 font-sans text-sm text-ghost focus:outline-none focus:border-accent/30 appearance-none cursor-pointer">
                            {DURATION_OPTIONS.map(d => <option key={d} value={d}>{pers(`durationOptions.${d}`)}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="font-data text-xs text-ghost/40 uppercase tracking-wider block mb-2">{pers('occupation')}</label>
                        <input value={occupation} onChange={e => setOccupation(e.target.value)} placeholder={pers('selectOccupation')} className="w-full bg-background border border-white/10 rounded-xl py-3 px-4 font-sans text-sm text-ghost focus:outline-none focus:border-accent/30 transition-colors" />
                    </div>
                    <div>
                        <label className="font-data text-xs text-ghost/40 uppercase tracking-wider block mb-2">{pers('workSchedule')}</label>
                        <input value={workSchedule} onChange={e => setWorkSchedule(e.target.value)} placeholder={pers('selectSchedule')} className="w-full bg-background border border-white/10 rounded-xl py-3 px-4 font-sans text-sm text-ghost focus:outline-none focus:border-accent/30 transition-colors" />
                    </div>
                    <div>
                        <label className="font-data text-xs text-ghost/40 uppercase tracking-wider block mb-2">{pers('lifePhase')}</label>
                        <input value={lifePhase} onChange={e => setLifePhase(e.target.value)} placeholder={pers('selectLifePhase')} className="w-full bg-background border border-white/10 rounded-xl py-3 px-4 font-sans text-sm text-ghost focus:outline-none focus:border-accent/30 transition-colors" />
                    </div>
                    <div>
                        <label className="font-data text-xs text-ghost/40 uppercase tracking-wider block mb-2">{pers('mainChallenge')}</label>
                        <input value={mainChallenge} onChange={e => setMainChallenge(e.target.value)} placeholder={pers('selectChallenge')} className="w-full bg-background border border-white/10 rounded-xl py-3 px-4 font-sans text-sm text-ghost focus:outline-none focus:border-accent/30 transition-colors" />
                    </div>
                </div>
            </div>

            {/* Interests */}
            <div className="bg-[#0C1021] rounded-[2rem] border border-white/5 p-6 md:p-8 mb-6">
                <div className="flex items-center gap-2 mb-4">
                    <Heart size={16} className="text-tertiary" />
                    <h2 className="font-heading text-sm font-bold uppercase tracking-widest text-ghost/60">{pers('interests', { count: interests.length })}</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                    {INTEREST_OPTIONS.map(interest => {
                        const active = interests.includes(interest);
                        return (
                            <button
                                key={interest}
                                onClick={() => setInterests(prev => active ? prev.filter(i => i !== interest) : [...prev, interest])}
                                className={`px-3 py-1.5 rounded-full font-data text-xs tracking-wider transition-all ${active
                                    ? 'bg-accent/20 border border-accent/40 text-accent'
                                    : 'bg-white/5 border border-white/10 text-ghost/40 hover:border-white/20 hover:text-ghost/60'
                                    }`}
                            >
                                {active ? <X size={10} className="inline mr-1" /> : <Plus size={10} className="inline mr-1" />}
                                {getInterestLabel(interest)}
                            </button>
                        );
                    })}
                </div>
                <p className="font-sans text-[10px] text-ghost/30 mt-3">{pers('addCustomInterest')}</p>
            </div>

            <div className="bg-[#0C1021] rounded-[2rem] border border-accent-secondary/20 p-6 md:p-8 mb-6">
                <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{classEmoji}</span>
                    <div>
                        <h3 className="font-heading font-bold text-white">{cls(classKey)}</h3>
                        <div className="font-data text-xs text-accent-secondary tracking-wider">{cls('title')}</div>
                    </div>
                </div>
                <p className="font-sans text-sm text-ghost/60 mb-4 leading-relaxed">{cls(`${classKey}Desc`)}</p>
                <button onClick={handleRetakeQuiz} className="font-data text-xs text-ghost/40 hover:text-accent transition-colors underline underline-offset-4">
                    {cls('retakeQuiz')}
                </button>
            </div>

            <div className="bg-[#0C1021] rounded-[2rem] border border-white/5 p-6 md:p-8 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <div className="font-heading text-sm font-bold text-white uppercase tracking-wider">{plan(planKey)}</div>
                    <div className="font-sans text-xs text-ghost/40 mt-1">{plan(`${planKey}Desc`)}</div>
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
                        <span className="btn-content">{plan('upgrade')}</span>
                    </button>
                )}
            </div>

            <div className="bg-[#0C1021] rounded-[2rem] border border-red-500/20 p-6 md:p-8">
                <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle size={16} className="text-red-400" />
                    <h3 className="font-heading text-sm font-bold text-red-400 uppercase tracking-wider">{dz('title')}</h3>
                </div>
                <p className="font-sans text-xs text-ghost/40 mb-4">{dz('description')}</p>
                <button
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                    className="px-6 py-2.5 rounded-xl border border-red-500/30 text-red-400 font-heading text-xs uppercase tracking-wider hover:bg-red-500/10 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                    {deleting && <Loader2 size={12} className="animate-spin" />}
                    {deleting ? dz('deleting') : dz('deleteAccount')}
                </button>
            </div>
        </div>
    );
}
