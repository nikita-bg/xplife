'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { useRouter, usePathname } from 'next/navigation';
import { Dumbbell, BookOpen, Brain, Briefcase, Users, Heart, Palette, ArrowRight, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useTranslations, useMessages } from 'next-intl';

const categories = [
    { id: 'fitness', label: 'Fitness', icon: Dumbbell },
    { id: 'learning', label: 'Learning', icon: BookOpen },
    { id: 'mindfulness', label: 'Mindfulness', icon: Brain },
    { id: 'productivity', label: 'Productivity', icon: Briefcase },
    { id: 'social', label: 'Social', icon: Users },
    { id: 'health', label: 'Health', icon: Heart },
    { id: 'creativity', label: 'Creativity', icon: Palette },
];

// Quiz questions are now loaded from translations (see quizQuestions below)

// classData colors remain static; descriptions loaded from translations

/* ── Canvas Particles for Welcome Screen ── */
const WelcomeParticles = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        let animId: number;
        const dots: Array<{ x: number; y: number; r: number; dx: number; dy: number; alpha: number; pulse: number }> = [];
        const resize = () => { canvas.width = canvas.offsetWidth * 2; canvas.height = canvas.offsetHeight * 2; ctx.scale(2, 2); };
        resize();
        window.addEventListener('resize', resize);
        for (let i = 0; i < 50; i++) {
            dots.push({
                x: Math.random() * canvas.offsetWidth, y: Math.random() * canvas.offsetHeight,
                r: Math.random() * 2 + 1, dx: (Math.random() - 0.5) * 0.4, dy: (Math.random() - 0.5) * 0.4,
                alpha: Math.random() * 0.4 + 0.1, pulse: Math.random() * Math.PI * 2
            });
        }
        const draw = () => {
            const w = canvas.offsetWidth, h = canvas.offsetHeight;
            ctx.clearRect(0, 0, w, h);
            dots.forEach(d => {
                d.x += d.dx; d.y += d.dy; d.pulse += 0.02;
                if (d.x < 0) d.x = w; if (d.x > w) d.x = 0; if (d.y < 0) d.y = h; if (d.y > h) d.y = 0;
                const a = d.alpha * (0.5 + 0.5 * Math.sin(d.pulse));
                ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(0, 245, 255, ${a})`; ctx.fill();
            });
            animId = requestAnimationFrame(draw);
        };
        draw();
        return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
    }, []);
    return <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" style={{ width: '100%', height: '100%' }} />;
};

/* ── Onboarding Steps ── */
export default function OnboardingPage() {
    const t = useTranslations('onboarding');
    const messages = useMessages() as Record<string, unknown>;

    // Load quiz questions from translation messages
    const onboardingMsgs = (messages?.onboarding || {}) as Record<string, unknown>;
    const quizMsgs = (onboardingMsgs?.quiz || {}) as Record<string, unknown>;
    type QuizQuestion = { q: string; options: { text: string; cls: string }[] };
    const quizQuestions: QuizQuestion[] = Array.isArray(quizMsgs?.questions) ? (quizMsgs.questions as QuizQuestion[]) : [];
    const classDescriptions = (quizMsgs?.classDescriptions || {}) as Record<string, string>;

    const classColors: Record<string, string> = {
        Adventurer: 'text-accent-secondary',
        Thinker: 'text-accent',
        Guardian: 'text-tertiary',
        Connector: 'text-green-400',
    };
    const classEmojis: Record<string, string> = {
        Adventurer: '🗺️',
        Thinker: '🧠',
        Guardian: '🛡️',
        Connector: '🌿',
    };
    const [step, setStep] = useState(0);
    const [goals, setGoals] = useState<string[]>([]);
    const [quizAnswers, setQuizAnswers] = useState<string[]>([]);
    const [currentQ, setCurrentQ] = useState(0);
    const [revealedClass, setRevealedClass] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const pathname = usePathname();
    const locale = pathname.split('/')[1] || 'en';

    const totalSteps = 5;

    const animateStep = useCallback(() => {
        gsap.fromTo('.step-content', { opacity: 0, x: 60 }, { opacity: 1, x: 0, duration: 0.5, ease: 'power3.out' });
    }, []);

    useEffect(() => { animateStep(); }, [step, animateStep]);

    const nextStep = () => { if (step < totalSteps - 1) setStep(s => s + 1); };

    const toggleGoal = (id: string) => {
        setGoals(prev => prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]);
    };

    const CLASS_TO_PERSONALITY: Record<string, string> = {
        Adventurer: 'dopamine',
        Thinker: 'acetylcholine',
        Guardian: 'gaba',
        Connector: 'serotonin',
    };

    const [saving, setSaving] = useState(false);

    const answerQuiz = (cls: string) => {
        const newAnswers = [...quizAnswers, cls];
        setQuizAnswers(newAnswers);
        if (currentQ < quizQuestions.length - 1) {
            gsap.to('.quiz-options', {
                opacity: 0, x: -40, duration: 0.2, onComplete: () => {
                    setCurrentQ(q => q + 1);
                    gsap.fromTo('.quiz-options', { opacity: 0, x: 40 }, { opacity: 1, x: 0, duration: 0.3, ease: 'power3.out' });
                }
            });
        } else {
            const counts: Record<string, number> = {};
            newAnswers.forEach(a => { counts[a] = (counts[a] || 0) + 1; });
            const winner = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
            setRevealedClass(winner);

            // Save personality type to DB
            const savePersonality = async () => {
                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const personalityType = CLASS_TO_PERSONALITY[winner] || 'dopamine';
                    await supabase.from('users').update({
                        personality_type: personalityType,
                        updated_at: new Date().toISOString(),
                    }).eq('id', user.id);
                }
            };
            savePersonality();

            nextStep();
        }
    };

    const handleFinishOnboarding = async () => {
        setSaving(true);
        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                // Save goals
                if (goals.length > 0) {
                    const goalRows = goals.map(g => ({
                        user_id: user.id,
                        title: g.charAt(0).toUpperCase() + g.slice(1),
                        category: g,
                    }));
                    await supabase.from('goals').insert(goalRows);
                }

                // Set onboarding as completed
                await supabase.from('users').update({
                    onboarding_completed: true,
                    updated_at: new Date().toISOString(),
                }).eq('id', user.id);

                // Generate first quests via AI
                try {
                    await fetch('/api/ai/generate-tasks', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ questTimeframe: 'daily', locale }),
                    });
                } catch { /* non-critical */ }
            }
        } catch (err) {
            console.error('Onboarding save error:', err);
        }
        router.push(`/${locale}/dashboard`);
    };

    return (
        <div ref={containerRef} className="fixed inset-0 bg-background text-ghost z-50 flex flex-col">
            <div className="absolute top-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {Array.from({ length: totalSteps }).map((_, i) => (
                    <div key={i} className={`w-2 h-2 rounded-full transition-all duration-300 ${i <= step ? 'bg-accent shadow-[0_0_6px_#00F5FF]' : 'bg-white/10'}`}></div>
                ))}
            </div>

            <div className="flex-1 flex items-center justify-center px-6 overflow-hidden">
                <div className="step-content max-w-2xl w-full text-center">

                    {step === 0 && (
                        <div className="relative">
                            <WelcomeParticles />
                            <div className="relative z-10">
                                <h1 className="font-heading font-black text-4xl sm:text-5xl md:text-6xl uppercase tracking-tight text-white mb-4">
                                    {t('welcome.title')} <span className="text-accent text-shadow-glow">XPLife</span>
                                </h1>
                                <p className="font-drama italic text-xl sm:text-2xl text-ghost/60 mb-12 max-w-lg mx-auto">
                                    {t('welcome.description')}
                                </p>
                                <button onClick={nextStep} className="btn-magnetic px-10 py-4 rounded-full bg-gradient-to-r from-accent-secondary to-yellow-500 text-background font-heading font-bold text-lg uppercase tracking-wider shadow-[0_0_30px_rgba(255,184,0,0.3)]">
                                    <span className="btn-content flex items-center gap-3">{t('welcome.beginQuest')} <ArrowRight size={20} /></span>
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 1 && (
                        <div>
                            <h2 className="font-heading font-black text-3xl md:text-4xl uppercase tracking-tight text-white mb-2">{t('goalSetting.title')}</h2>
                            <p className="font-sans text-ghost/40 mb-10">{t('goalSetting.description', { maxGoals: 7 })}</p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-10 max-w-xl mx-auto">
                                {categories.map(c => {
                                    const selected = goals.includes(c.id);
                                    return (
                                        <button key={c.id} onClick={() => toggleGoal(c.id)}
                                            className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all duration-200 ${selected ? 'border-accent bg-accent/10 scale-105 shadow-[0_0_15px_rgba(0,245,255,0.1)]' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}>
                                            <c.icon size={24} className={selected ? 'text-accent' : 'text-ghost/40'} />
                                            <span className={`font-sans text-xs ${selected ? 'text-accent font-bold' : 'text-ghost/60'}`}>{c.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                            <button onClick={nextStep} disabled={goals.length === 0}
                                className={`btn-magnetic px-8 py-3 rounded-full font-heading font-bold text-sm uppercase tracking-wider transition-all ${goals.length > 0 ? 'bg-accent text-background' : 'bg-white/5 text-ghost/20 cursor-not-allowed'}`}>
                                <span className="btn-content flex items-center gap-2">{t('timePreferences.continue')} <ArrowRight size={16} /></span>
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div>
                            <div className="w-full max-w-md mx-auto h-1 bg-white/5 rounded-full mb-10 overflow-hidden">
                                <div className="h-full bg-accent rounded-full transition-all duration-300" style={{ width: `${((currentQ + 1) / quizQuestions.length) * 100}%` }}></div>
                            </div>
                            <h2 className="font-heading font-bold text-xl md:text-2xl uppercase tracking-tight text-white mb-8">{quizQuestions[currentQ].q}</h2>
                            <div className="quiz-options grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
                                {quizQuestions[currentQ].options.map((opt, i) => (
                                    <button key={i} onClick={() => answerQuiz(opt.cls)}
                                        className="p-4 rounded-2xl border border-white/10 bg-white/5 text-left font-sans text-sm text-ghost/80 hover:border-accent/50 hover:bg-accent/5 hover:scale-[1.02] transition-all duration-200 active:scale-95">
                                        {opt.text}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 3 && revealedClass && (
                        <div>
                            <div className="text-7xl mb-6 animate-bounce">{classEmojis[revealedClass] || '⭐'}</div>
                            <p className="font-sans text-ghost/40 uppercase tracking-widest text-xs mb-2">{t('result')}</p>
                            <h2 className={`font-drama italic font-bold text-4xl md:text-5xl ${classColors[revealedClass] || 'text-accent'} mb-4`}>The {revealedClass}</h2>
                            <p className="font-sans text-ghost/60 max-w-md mx-auto mb-10">{classDescriptions[revealedClass] || ''}</p>
                            <button onClick={nextStep} className="btn-magnetic px-8 py-3 rounded-full bg-gradient-to-r from-accent-secondary to-yellow-500 text-background font-heading font-bold text-sm uppercase tracking-wider">
                                <span className="btn-content flex items-center gap-2">{t('continue')} <ArrowRight size={16} /></span>
                            </button>
                        </div>
                    )}

                    {step === 4 && (
                        <div>
                            <h2 className="font-heading font-black text-3xl md:text-4xl uppercase tracking-tight text-white mb-2">{t('goalSetting.startAdventure')}</h2>
                            <p className="font-sans text-ghost/40 mb-10">{t('welcome.duration')}</p>
                            <div className="space-y-3 max-w-md mx-auto mb-10">
                                {[
                                    { title: 'Complete a 10-minute workout', xp: 30, diff: 'Easy' },
                                    { title: 'Read 10 pages of any book', xp: 25, diff: 'Easy' },
                                    { title: 'Write down 3 goals for this week', xp: 40, diff: 'Medium' },
                                ].map((q, i) => (
                                    <div key={i} className="bg-[#0C1021] rounded-2xl border border-white/5 p-4 flex items-center gap-4 text-left" style={{ animationDelay: `${i * 150}ms` }}>
                                        <div className="w-6 h-6 rounded-full border-2 border-white/20 shrink-0"></div>
                                        <div className="flex-1">
                                            <div className="font-sans text-sm text-ghost">{q.title}</div>
                                            <div className="font-data text-[10px] text-ghost/30 mt-1">{q.diff}</div>
                                        </div>
                                        <div className="font-data text-xs text-accent-secondary">+{q.xp} XP</div>
                                    </div>
                                ))}
                            </div>
                            <button onClick={handleFinishOnboarding} disabled={saving} className="btn-magnetic px-10 py-4 rounded-full bg-gradient-to-r from-accent-secondary to-yellow-500 text-background font-heading font-bold text-lg uppercase tracking-wider shadow-[0_0_30px_rgba(255,184,0,0.3)] disabled:opacity-50">
                                <span className="btn-content flex items-center gap-3">
                                    {saving ? <><Loader2 size={20} className="animate-spin" /> Setting up...</> : <>Enter XPLife <ArrowRight size={20} /></>}
                                </span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
