'use client';

import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Check } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface PricingCardProps {
    title: string;
    price: string;
    desc: string;
    features: string[];
    highlighted: boolean;
    cta: string;
}

const PricingCard = ({ title, price, desc, features, highlighted, cta }: PricingCardProps) => {
    return (
        <div className={`pricing-card relative flex flex-col p-8 rounded-[2rem] border ${highlighted ? 'border-tertiary bg-[#150F2D] scale-105 z-10 shadow-[0_20px_50px_rgba(155,78,221,0.2)]' : 'border-white/10 bg-[#0C1021] z-0'} transition-transform duration-500`}>
            {highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-tertiary text-white font-data text-xs px-4 py-1 rounded-full uppercase tracking-widest font-bold shadow-[0_0_15px_rgba(155,78,221,0.5)]">
                    Most Popular
                </div>
            )}
            <h3 className="font-heading font-black text-2xl uppercase text-white mb-2 tracking-wide">{title}</h3>
            <p className="text-ghost/60 font-sans text-sm mb-6 pb-6 border-b border-white/10 h-16">{desc}</p>
            <div className="mb-8">
                <span className="font-data text-4xl text-white font-bold tracking-tighter">{price}</span>
                {price !== 'Custom' && price !== 'Free' && price !== '$0' && <span className="text-ghost/40 text-sm ml-2">/mo</span>}
            </div>
            <ul className="flex-grow space-y-4 mb-8">
                {features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-ghost/80 font-sans">
                        <Check size={16} className={`shrink-0 mt-0.5 ${highlighted ? 'text-accent' : 'text-ghost/40'}`} />
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>
            <button className={`btn-magnetic w-full py-4 rounded-xl font-heading font-bold uppercase tracking-wider text-sm ${highlighted ? 'bg-accent text-primary shadow-[0_0_20px_rgba(0,245,255,0.3)] hover:shadow-[0_0_30px_rgba(0,245,255,0.5)]' : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'}`}>
                <span className={highlighted ? "bg-slider bg-white/20" : ""}></span>
                <span className="btn-content">{cta}</span>
            </button>
        </div>
    );
};

const Pricing = () => {
    const containerRef = useRef<HTMLElement>(null);

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
                <div className="text-center mb-20">
                    <h2 className="font-heading font-black text-4xl md:text-5xl lg:text-6xl text-ghost uppercase tracking-tight mb-6">
                        Unlock Your Potential
                    </h2>
                    <p className="font-sans text-lg text-ghost/60 max-w-2xl mx-auto">
                        Choose the tier that matches your ambition. Start your journey today.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start relative max-w-6xl mx-auto">
                    <PricingCard title="Free Adventurer" price="$0" desc="Perfect for starting your RPG journey." features={["1 Active Goal", "15 Tasks / Week", "15 AI Generations / Day", "Basic Progress Analytics"]} cta="Start Playing Free" highlighted={false} />
                    <PricingCard title="Pro Hero" price="$12" desc="For those serious about leveling up their life." features={["3 Active Goals", "Unlimited Tasks", "Unlimited AI Generations", "Advanced Streak Analytics", "Priority Support", "Exclusive Discord Role"]} cta="Upgrade to Pro" highlighted={true} />
                    <PricingCard title="Guild Master" price="$299" desc="The ultimate commitment to your evolution." features={["Lifetime Access to Pro Features", "All Future Updates Included", "Exclusive In-App Cosmetics", "Direct Feedback to Founders", "Guild Master Discord Badge"]} cta="Go Lifetime" highlighted={false} />
                </div>
            </div>
        </section>
    );
};

export default Pricing;
