'use client';

import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useTranslations } from 'next-intl';

gsap.registerPlugin(ScrollTrigger);

const Philosophy = () => {
    const containerRef = useRef<HTMLElement>(null);
    const textRef = useRef<HTMLDivElement>(null);
    const t = useTranslations('hero');

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            gsap.to('.manifesto-bg', {
                yPercent: 30, ease: 'none',
                scrollTrigger: { trigger: containerRef.current, start: 'top bottom', end: 'bottom top', scrub: true }
            });
            const words = gsap.utils.toArray('.reveal-word');
            gsap.fromTo(words,
                { y: 50, opacity: 0, rotateZ: 5 },
                {
                    y: 0, opacity: 1, rotateZ: 0, duration: 0.8, stagger: 0.04, ease: 'power3.out',
                    scrollTrigger: { trigger: textRef.current, start: 'top 80%' }
                }
            );
            gsap.fromTo('.manifesto-intro',
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 1, scrollTrigger: { trigger: textRef.current, start: 'top 85%' } }
            );
        }, containerRef);
        return () => ctx.revert();
    }, []);

    const textToReveal = "making your real life feel like an epic RPG.";
    const renderWords = () => {
        return textToReveal.split(' ').map((word, i) => {
            const isAccent = word.includes('epic') || word.includes('RPG');
            return (
                <span key={i} className={`reveal-word inline-block mr-[2vw] ${isAccent ? 'text-accent text-shadow-glow' : 'text-ghost'}`}>
                    {word}
                </span>
            );
        });
    };

    return (
        <section ref={containerRef} className="relative w-full py-40 md:py-60 overflow-hidden bg-primary flex items-center justify-center">
            <div
                className="manifesto-bg absolute inset-0 z-0 bg-cover bg-center opacity-10 mix-blend-screen"
                style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2940&auto=format&fit=crop")' }}
            ></div>
            <div className="absolute inset-0 z-0 bg-gradient-to-b from-background via-transparent to-background hidden pointer-events-none"></div>
            <div className="relative z-10 max-w-7xl mx-auto px-6 w-full text-center flex flex-col items-center">
                <p className="manifesto-intro font-sans text-ghost/40 text-lg md:text-2xl mb-8 tracking-wide font-medium">
                    Most productivity apps focus on: task lists and reminders.
                </p>
                <div ref={textRef} className="overflow-visible">
                    <p className="manifesto-intro font-sans text-ghost/80 text-xl md:text-3xl mb-4 italic tracking-wide">
                        We focus on:
                    </p>
                    <h2 className="font-drama font-black italic text-5xl sm:text-7xl md:text-8xl lg:text-[7rem] leading-[1.1] tracking-tighter w-full max-w-[90vw] mx-auto text-balance">
                        {renderWords()}
                    </h2>
                </div>
                <div className="mt-20 w-[1px] h-32 bg-gradient-to-b from-accent to-transparent"></div>
            </div>
        </section>
    );
};

export default Philosophy;
