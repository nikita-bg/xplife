'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Activity, Target, CalendarDays, MousePointer2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

gsap.registerPlugin(ScrollTrigger);

const QuestGenerator = () => {
    const defaultQuests = [
        { id: 1, type: 'daily', icon: <Target size={16} />, text: "Daily: Morning workout", color: "text-accent" },
        { id: 2, type: 'weekly', icon: <CalendarDays size={16} />, text: "Weekly: Read 3 chapters", color: "text-accent-secondary" },
        { id: 3, type: 'monthly', icon: <Activity size={16} />, text: "Monthly: Run 50km", color: "text-tertiary" }
    ];
    const [quests, setQuests] = useState(defaultQuests);

    useEffect(() => {
        const interval = setInterval(() => {
            setQuests(prev => {
                const newArr = [...prev];
                const last = newArr.pop()!;
                newArr.unshift(last);
                return newArr;
            });
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="h-full flex flex-col justify-end relative">
            <div className="relative h-48 w-full perspective-1000">
                {quests.map((q, i) => {
                    const yOffset = i * -15;
                    const scale = 1 - (i * 0.05);
                    const opacity = 1 - (i * 0.2);
                    const zIndex = 10 - i;
                    return (
                        <div
                            key={q.id}
                            className="absolute bottom-0 w-[95%] left-[2.5%] bg-[#12162B] border border-white/10 rounded-xl p-4 shadow-lg transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                            style={{ transform: `translateY(${yOffset}px) scale(${scale})`, opacity, zIndex }}
                        >
                            <div className={`font-data text-xs uppercase tracking-wider mb-2 flex items-center gap-2 ${q.color}`}>
                                {q.icon} {q.type}
                            </div>
                            <div className="font-sans text-ghost">{q.text}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const XPLiveFeed = () => {
    const messages = useMemo(() => ["+50 XP — Completed morning routine", "+120 XP — Weekly goal achieved", "🔥 7-day streak: +200 XP", "LEVEL UP: Iron -> Bronze"], []);
    const [displayedLines, setDisplayedLines] = useState<string[]>([]);
    const [currentLineIndex, setCurrentLineIndex] = useState(0);
    const [currentCharIndex, setCurrentCharIndex] = useState(0);

    useEffect(() => {
        if (currentLineIndex >= messages.length) return;
        const currentMsg = messages[currentLineIndex];
        if (currentCharIndex < currentMsg.length) {
            const timeout = setTimeout(() => {
                setDisplayedLines(prev => {
                    const newArr = [...prev];
                    if (newArr[currentLineIndex] === undefined) newArr[currentLineIndex] = '';
                    newArr[currentLineIndex] = currentMsg.substring(0, currentCharIndex + 1);
                    return newArr;
                });
                setCurrentCharIndex(prev => prev + 1);
            }, 40);
            return () => clearTimeout(timeout);
        } else {
            const timeout = setTimeout(() => {
                setCurrentLineIndex(prev => prev + 1);
                setCurrentCharIndex(0);
                if (currentLineIndex >= 2) {
                    setDisplayedLines(prev => { const next = [...prev]; next.shift(); return next; });
                    setCurrentLineIndex(prev => prev - 1);
                }
            }, 1500);
            return () => clearTimeout(timeout);
        }
    }, [currentCharIndex, currentLineIndex, messages]);

    return (
        <div className="h-full flex flex-col justify-between">
            <div className="bg-[#12162B] border border-white/5 rounded-full px-3 py-1.5 inline-flex items-center gap-2 self-start mb-4 shadow-inner">
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-accent shadow-[0_0_8px_#00F5FF]"></span>
                </span>
                <span className="font-data text-[10px] text-ghost/70 uppercase">Live Feed</span>
            </div>
            <div className="bg-background/80 rounded-xl p-4 border border-white/5 flex-grow font-data text-xs md:text-sm text-accent leading-relaxed relative overflow-hidden flex flex-col justify-end">
                {displayedLines.map((line, i) => (
                    <div key={i} className="mb-2">
                        <span className="opacity-50 text-ghost mr-2">{'>'}</span>{line}
                    </div>
                ))}
                {currentLineIndex < messages.length && (
                    <div className="animate-pulse w-2 h-4 bg-accent mt-1 inline-block"></div>
                )}
                <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-background to-transparent"></div>
            </div>
        </div>
    );
};

const HabitTrackerGrid = () => {
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const cursorRef = useRef<HTMLDivElement>(null);
    const cellRef = useRef<HTMLDivElement>(null);
    const btnRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({ repeat: -1, repeatDelay: 1 });
            tl.set(cursorRef.current, { x: 0, y: 50, opacity: 0 });
            tl.to(cursorRef.current, { x: 120, y: 15, opacity: 1, duration: 1, ease: 'power2.inOut' });
            tl.to(cursorRef.current, { scale: 0.8, duration: 0.1 })
                .to(cellRef.current, { backgroundColor: '#00F5FF', color: '#080B1A', duration: 0.1 }, "<")
                .to(cursorRef.current, { scale: 1, duration: 0.1 });
            tl.to(cursorRef.current, { x: 80, y: 80, duration: 0.6, ease: 'power2.inOut', delay: 0.2 });
            tl.to(cursorRef.current, { scale: 0.8, duration: 0.1 })
                .to(btnRef.current, { scale: 0.95, duration: 0.1 }, "<")
                .to(cursorRef.current, { scale: 1, duration: 0.1 })
                .to(btnRef.current, { scale: 1, duration: 0.1 }, "<");
            tl.to(cursorRef.current, { opacity: 0, duration: 0.5, delay: 0.5 })
                .set(cellRef.current, { backgroundColor: 'transparent', color: 'rgba(232,230,240,0.5)' });
        });
        return () => ctx.revert();
    }, []);

    return (
        <div className="h-full flex flex-col justify-end relative pb-2 pt-8">
            <div className="grid grid-cols-7 gap-1 mb-6">
                {days.map((d, i) => (
                    <div key={i} ref={i === 3 ? cellRef : null} className="aspect-square rounded-md border border-white/10 flex items-center justify-center font-data text-xs text-ghost/50 transition-colors">
                        {d}
                    </div>
                ))}
            </div>
            <button ref={btnRef} className="w-full py-2.5 rounded-lg border border-white/20 text-xs font-heading tracking-wider uppercase text-ghost/70">
                Complete Quest
            </button>
            <div ref={cursorRef} className="absolute left-0 top-0 pointer-events-none drop-shadow-md z-10 text-ghost">
                <MousePointer2 fill="currentColor" size={20} />
            </div>
        </div>
    );
};

const Features = () => {
    const containerRef = useRef<HTMLElement>(null);
    const t = useTranslations('landing.features');

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from('.feature-card', {
                y: 60, opacity: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out',
                scrollTrigger: { trigger: containerRef.current, start: 'top 75%' }
            });
        }, containerRef);
        return () => ctx.revert();
    }, []);

    return (
        <section ref={containerRef} id="features" className="w-full py-32 md:py-48 px-6 bg-background relative z-10">
            <div className="max-w-6xl mx-auto">
                <div className="mb-20">
                    <div className="font-data text-accent font-bold tracking-wider uppercase text-sm mb-4 flex items-center gap-3">
                        <span className="w-8 h-[1px] bg-accent"></span>
                        {t('subtitle')}
                    </div>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl text-ghost leading-tight max-w-2xl">
                        {t('title')} <span className="text-accent">{t('titleHighlight')}</span>
                    </h2>
                    <p className="mt-6 text-ghost/60 font-sans text-lg max-w-xl">
                        {t('description')}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
                    <div className="feature-card h-[400px] bg-[#0C1021] rounded-[2rem] border border-white/5 p-8 flex flex-col row-span-2">
                        <h3 className="font-heading font-bold text-lg mb-2 uppercase tracking-wide">{t('aiPowered.title')}</h3>
                        <p className="text-sm text-ghost/50 mb-8 font-sans">{t('aiPowered.description')}</p>
                        <div className="flex-grow rounded-xl bg-background border border-white/5 p-4 overflow-hidden shadow-inner">
                            <QuestGenerator />
                        </div>
                    </div>
                    <div className="feature-card h-[350px] bg-[#0C1021] rounded-[2rem] border border-white/5 p-8 flex flex-col">
                        <h3 className="font-heading font-bold text-lg mb-2 uppercase tracking-wide">{t('trackProgress.title')}</h3>
                        <p className="text-sm text-ghost/50 mb-8 font-sans">{t('trackProgress.description')}</p>
                        <div className="flex-grow rounded-xl overflow-hidden">
                            <XPLiveFeed />
                        </div>
                    </div>
                    <div className="feature-card h-[350px] bg-[#0C1021] rounded-[2rem] border border-white/5 p-8 flex flex-col">
                        <h3 className="font-heading font-bold text-lg mb-2 uppercase tracking-wide">{t('deepPersonalization.title')}</h3>
                        <p className="text-sm text-ghost/50 mb-8 font-sans">{t('deepPersonalization.description')}</p>
                        <div className="flex-grow rounded-xl bg-background border border-white/5 p-6 overflow-hidden shadow-inner">
                            <HabitTrackerGrid />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Features;
