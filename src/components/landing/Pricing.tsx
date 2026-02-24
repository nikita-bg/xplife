'use client';

import React, { useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Check, Zap } from 'lucide-react';
import { useTranslations } from 'next-intl';

gsap.registerPlugin(ScrollTrigger);

interface PricingCardProps {
    title: string;
    price: string;
    annualPrice?: string;
    period?: string;
    annualNote?: string;
    desc: string;
    features: string[];
    highlighted: boolean;
    cta: string;
    badge?: string;
    badgeColor?: string;
    isAnnual?: boolean;
    ctaHref?: string;
}

const PricingCard = ({ title, price, annualPrice, desc, features, highlighted, cta, badge, badgeColor = 'tertiary', isAnnual }: PricingCardProps) => {
    const displayPrice = isAnnual && annualPrice ? annualPrice : price;
    const isLifetime = !annualPrice && price !== 'Free' && price !== '€0';

    return (
        <div className={`pricing-card relative flex flex-col p-8 rounded-[2rem] border ${highlighted
            ? 'border-tertiary bg-[#150F2D] scale-105 z-10 shadow-[0_20px_50px_rgba(155,78,221,0.2)]'
            : 'border-white/10 bg-[#0C1021] z-0'
            } transition-transform duration-500`}>

            {badge && (
                <div className={`absolute -top-4 left-1/2 -translate-x-1/2 font-data text-xs px-4 py-1 rounded-full uppercase tracking-widest font-bold whitespace-nowrap
                    ${badgeColor === 'tertiary' ? 'bg-tertiary text-white shadow-[0_0_15px_rgba(155,78,221,0.5)]' : ''}
                    ${badgeColor === 'accent' ? 'bg-accent text-background shadow-[0_0_15px_rgba(0,245,255,0.4)]' : ''}
                    ${badgeColor === 'amber' ? 'bg-amber-500 text-background shadow-[0_0_15px_rgba(245,158,11,0.5)]' : ''}
                `}>
                    {badge}
                </div>
            )}

            <h3 className="font-heading font-black text-2xl uppercase text-white mb-2 tracking-wide">{title}</h3>
            <p className="text-ghost/60 font-sans text-sm mb-6 pb-6 border-b border-white/10 min-h-[3.5rem]">{desc}</p>

            <div className="mb-2">
                <span className="font-data text-4xl text-white font-bold tracking-tighter">{displayPrice}</span>
                {!isLifetime && displayPrice !== 'Free' && displayPrice !== '€0' && (
                    <span className="text-ghost/40 text-sm ml-2">{isAnnual ? '/mo' : '/mo'}</span>
                )}
                {isLifetime && <span className="text-ghost/40 text-sm ml-2"> one-time</span>}
            </div>

            {isAnnual && annualPrice && (
                <div className="mb-6 flex items-center gap-2">
                    <span className="font-data text-xs text-accent bg-accent/10 border border-accent/20 px-2 py-0.5 rounded-full">
                        Save 30% — billed annually
                    </span>
                </div>
            )}
            {!isAnnual && annualPrice && <div className="mb-6" />}
            {isLifetime && <div className="mb-6" />}

            <ul className="flex-grow space-y-4 mb-8">
                {features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-ghost/80 font-sans">
                        <Check size={16} className={`shrink-0 mt-0.5 ${highlighted ? 'text-accent' : 'text-ghost/40'}`} />
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>

            <button className={`btn-magnetic w-full py-4 rounded-xl font-heading font-bold uppercase tracking-wider text-sm ${highlighted
                ? 'bg-accent text-primary shadow-[0_0_20px_rgba(0,245,255,0.3)] hover:shadow-[0_0_30px_rgba(0,245,255,0.5)]'
                : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
                }`}>
                <span className={highlighted ? 'bg-slider bg-white/20' : ''}></span>
                <span className="btn-content">{cta}</span>
            </button>
        </div>
    );
};

const Pricing = () => {
    const containerRef = useRef<HTMLElement>(null);
    const t = useTranslations('landing.pricing');
    const [isAnnual, setIsAnnual] = useState(false);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo('.pricing-card',
                { y: 60, opacity: 0 },
                {
                    y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: 'power3.out',
                    scrollTrigger: { trigger: containerRef.current, start: 'top 75%' }
                }
            );
        }, containerRef);
        return () => ctx.revert();
    }, []);

    return (
        <section ref={containerRef} id="pricing" className="w-full py-32 md:py-48 px-6 bg-background relative z-10">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="font-heading font-black text-4xl md:text-5xl lg:text-6xl text-ghost uppercase tracking-tight mb-6">
                        {t('title')} <span className="text-accent">{t('titleHighlight')}</span>
                    </h2>
                    <p className="font-sans text-lg text-ghost/60 max-w-2xl mx-auto mb-10">
                        {t('description')}
                    </p>

                    {/* Billing Toggle */}
                    <div className="inline-flex items-center gap-4 bg-[#0C1021] border border-white/10 rounded-2xl p-1.5">
                        <button
                            onClick={() => setIsAnnual(false)}
                            className={`px-5 py-2 rounded-xl font-data text-xs uppercase tracking-wider transition-all ${!isAnnual ? 'bg-white/10 text-white font-bold' : 'text-ghost/40 hover:text-ghost/60'}`}
                        >
                            {t('monthly')}
                        </button>
                        <button
                            onClick={() => setIsAnnual(true)}
                            className={`px-5 py-2 rounded-xl font-data text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${isAnnual ? 'bg-accent/20 text-accent font-bold border border-accent/30' : 'text-ghost/40 hover:text-ghost/60'}`}
                        >
                            {t('annual')}
                            <span className="bg-accent text-background text-[9px] px-1.5 py-0.5 rounded-full font-bold">-30%</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start relative max-w-6xl mx-auto">
                    {/* Free */}
                    <PricingCard
                        title={t('freeName')}
                        price={t('freePrice')}
                        desc={t('freeDesc')}
                        features={[t('freeF1'), t('freeF2'), t('freeF3'), t('freeF4'), t('freeF5')]}
                        cta={t('freeCta')}
                        highlighted={false}
                        isAnnual={isAnnual}
                    />

                    {/* Pro — highlighted */}
                    <PricingCard
                        title={t('proName')}
                        price={t('proPrice')}
                        annualPrice={t('proAnnualPrice')}
                        desc={t('proDesc')}
                        features={[t('proF1'), t('proF2'), t('proF3'), t('proF4'), t('proF5'), t('proF6')]}
                        cta={isAnnual ? t('proCtaAnnual') : t('proCta')}
                        highlighted={true}
                        badge={isAnnual ? t('annualBadge') : t('popularBadge')}
                        badgeColor="tertiary"
                        isAnnual={isAnnual}
                    />

                    {/* Lifetime */}
                    <PricingCard
                        title={t('lifeName')}
                        price={t('lifePrice')}
                        desc={t('lifeDesc')}
                        features={[t('lifeF1'), t('lifeF2'), t('lifeF3'), t('lifeF4'), t('lifeF5')]}
                        cta={t('lifeCta')}
                        highlighted={false}
                        badge={t('foundingBadge')}
                        badgeColor="amber"
                        isAnnual={isAnnual}
                    />
                </div>

                {/* Founding Price note */}
                <div className="text-center mt-12 flex items-center justify-center gap-2">
                    <Zap size={14} className="text-amber-400" />
                    <p className="font-data text-xs text-ghost/40 tracking-wider">
                        {t('foundingNote')}
                    </p>
                </div>
            </div>
        </section>
    );
};

export default Pricing;
