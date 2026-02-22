'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Navbar = () => {
    const navRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            ScrollTrigger.create({
                start: 'top -50',
                end: 99999,
                toggleClass: {
                    targets: navRef.current!,
                    className: 'scrolled'
                },
                onEnter: () => {
                    gsap.to(navRef.current, {
                        backgroundColor: 'rgba(8, 11, 26, 0.6)',
                        backdropFilter: 'blur(16px)',
                        border: '1px solid rgba(0, 245, 255, 0.1)',
                        color: '#E8E6F0',
                        duration: 0.3,
                        ease: 'power2.inOut',
                    });
                },
                onLeaveBack: () => {
                    gsap.to(navRef.current, {
                        backgroundColor: 'transparent',
                        backdropFilter: 'blur(0px)',
                        border: '1px solid transparent',
                        color: '#E8E6F0',
                        duration: 0.3,
                        ease: 'power2.inOut',
                    });
                }
            });
        }, navRef);

        return () => ctx.revert();
    }, []);

    return (
        <nav
            ref={navRef}
            className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl rounded-full py-4 px-6 md:px-8 z-50 flex items-center justify-between border border-transparent transition-all duration-300"
        >
            <div className="flex items-center gap-2 group cursor-pointer">
                <span className="text-accent">⚡</span>
                <span className="font-heading font-bold text-xl tracking-wider uppercase text-white group-hover:text-shadow-glow transition-all">
                    XPLife
                </span>
            </div>

            <div className="hidden md:flex items-center gap-8 font-sans text-sm font-medium tracking-wide">
                <a href="#how-it-works" className="hover:text-accent transition-colors">How It Works</a>
                <a href="#features" className="hover:text-accent transition-colors">Features</a>
                <a href="#pricing" className="hover:text-accent transition-colors">Pricing</a>
            </div>

            <button className="btn-magnetic bg-accent text-primary px-5 py-2 rounded-full font-heading font-bold tracking-wider text-xs md:text-sm shadow-[0_0_15px_rgba(0,245,255,0.3)] hover:shadow-[0_0_25px_rgba(0,245,255,0.5)]">
                <span className="bg-slider bg-white/30"></span>
                <span className="btn-content">Start Playing Free</span>
            </button>
        </nav>
    );
};

export default Navbar;
