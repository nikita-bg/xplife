'use client';

import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useTranslations } from 'next-intl';

gsap.registerPlugin(ScrollTrigger);

const AnimAvatar = () => (
    <div className="w-full h-full relative flex items-center justify-center p-8">
        <div className="relative w-full h-full max-w-xs max-h-xs animate-[spin_15s_linear_infinite]">
            <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible drop-shadow-[0_0_20px_rgba(0,245,255,0.4)]">
                <polygon points="50,5 95,25 95,75 50,95 5,75 5,25" fill="none" stroke="#00F5FF" strokeWidth="1" strokeDasharray="10 5" />
                <polygon points="50,15 85,35 85,65 50,85 15,65 15,35" fill="none" stroke="#9B4EDD" strokeWidth="2" opacity="0.6" />
                <circle cx="50" cy="50" r="15" fill="#FFB800" opacity="0.8" className="animate-pulse" />
                <path d="M50,5 L50,95 M5,25 L95,75 M5,75 L95,25" stroke="#FFFFFF" strokeWidth="0.5" opacity="0.3" />
            </svg>
        </div>
    </div>
);

const AnimScanner = () => (
    <div className="w-full h-full relative flex flex-col items-center justify-center p-8 overflow-hidden bg-[#0A0D1F]">
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:20px_20px]"></div>
        <div className="grid grid-cols-4 gap-4 w-full h-full max-w-sm relative z-10 opacity-70">
            {Array.from({ length: 16 }).map((_, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded flex items-center justify-center relative overflow-hidden">
                    {i % 3 === 0 && <div className="w-2 h-2 bg-accent rounded-full"></div>}
                </div>
            ))}
        </div>
        <div className="absolute top-0 left-0 w-full h-1 bg-accent shadow-[0_0_20px_#00F5FF,0_0_40px_#00F5FF] z-20 animate-[scan_3s_ease-in-out_infinite_alternate]"></div>
        <style>{`@keyframes scan { 0% { transform: translateY(-10px) } 100% { transform: translateY(350px) } }`}</style>
    </div>
);

const AnimEKG = () => (
    <div className="w-full h-full relative flex items-center justify-center p-8">
        <svg className="w-full h-32 drop-shadow-[0_0_20px_rgba(255,184,0,0.8)]" viewBox="0 0 500 100" fill="none" preserveAspectRatio="none">
            <path d="M0,50 L200,50 L220,20 L240,90 L260,10 L280,60 L300,50 L500,50" stroke="#FFFFFF" strokeWidth="1" opacity="0.1" />
            <path
                d="M0,50 L200,50 L220,20 L240,90 L260,10 L280,60 L300,50 L500,50"
                stroke="#FFB800" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round"
                className="ekg-path"
                style={{ strokeDasharray: '300, 1000', strokeDashoffset: '700' }}
            />
        </svg>
        <style>{`.ekg-path { animation: pulse-ekg 2.5s linear infinite; } @keyframes pulse-ekg { 0% { stroke-dashoffset: 700; } 100% { stroke-dashoffset: -300; } }`}</style>
    </div>
);

const Protocol = () => {
    const containerRef = useRef<HTMLElement>(null);
    const t = useTranslations('landing.howItWorks');

    const cards = [
        { id: "01", title: t('step1.title'), desc: t('step1.description'), Anim: AnimAvatar },
        { id: "02", title: t('step2.title'), desc: t('step2.description'), Anim: AnimScanner },
        { id: "03", title: t('step3.title'), desc: t('step3.description'), Anim: AnimEKG }
    ];

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            const cardEls = gsap.utils.toArray('.protocol-card') as HTMLElement[];
            if (cardEls.length === 0) return;

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: 'top top',
                    end: '+=300%',
                    pin: true,
                    scrub: true,
                }
            });

            tl.to(cardEls[0], { scale: 0.9, opacity: 0.5, filter: 'blur(20px)', duration: 1 }, 0);
            tl.fromTo(cardEls[1], { y: '100%' }, { y: '0%', duration: 1, ease: 'none' }, 0);
            tl.to(cardEls[0], { scale: 0.85, duration: 1 }, 1);
            tl.to(cardEls[1], { scale: 0.9, opacity: 0.5, filter: 'blur(20px)', duration: 1 }, 1);
            tl.fromTo(cardEls[2], { y: '100%' }, { y: '0%', duration: 1, ease: 'none' }, 1);
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={containerRef} className="w-full h-[100vh] bg-background relative overflow-hidden">
            {cards.map((card, i) => {
                const { Anim } = card;
                return (
                    <div key={card.id} className="protocol-card absolute top-0 left-0 w-full h-[100vh] flex flex-col md:flex-row items-center justify-center p-6 lg:p-12 will-change-transform" style={{ zIndex: i + 1 }}>
                        <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] items-center justify-between gap-12 lg:gap-24 h-[85vh] py-16 px-6 md:px-16 bg-[#0E1226] rounded-[3rem] border border-white/5 overflow-hidden relative">
                            <div className="w-full md:w-1/2 flex flex-col z-10">
                                <div className="font-data text-accent text-lg md:text-xl font-bold tracking-widest mb-6 py-1 px-3 border border-accent/30 rounded inline-flex self-start bg-accent/5">
                                    [{card.id}]
                                </div>
                                <h2 className="font-heading font-black text-4xl md:text-5xl lg:text-7xl text-ghost mb-6 uppercase tracking-tight leading-[1.1]">
                                    {card.title}
                                </h2>
                                <p className="font-sans text-lg md:text-xl text-ghost/60 leading-relaxed max-w-md">
                                    {card.desc}
                                </p>
                            </div>
                            <div className="w-full md:w-1/2 h-64 md:h-[500px] bg-[#080B1A] rounded-[2rem] border border-white/5 overflow-hidden relative flex-shrink-0 shadow-inner">
                                <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent"></div>
                                <Anim />
                            </div>
                        </div>
                    </div>
                );
            })}
        </section>
    );
};

export default Protocol;
