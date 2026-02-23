'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Menu, X } from 'lucide-react';
import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher';
import { useTranslations } from 'next-intl';

gsap.registerPlugin(ScrollTrigger);

const Navbar = () => {
    const navRef = useRef<HTMLElement>(null);
    const [mobileOpen, setMobileOpen] = useState(false);
    const pathname = usePathname();
    const locale = pathname.split('/')[1] || 'en';
    const t = useTranslations('navbar');

    useEffect(() => {
        const ctx = gsap.context(() => {
            ScrollTrigger.create({
                start: 'top -50',
                end: 99999,
                onEnter: () => {
                    gsap.to(navRef.current, {
                        backgroundColor: 'rgba(8, 11, 26, 0.6)',
                        backdropFilter: 'blur(16px)',
                        borderColor: 'rgba(0, 245, 255, 0.1)',
                        duration: 0.3,
                        ease: 'power2.inOut',
                    });
                },
                onLeaveBack: () => {
                    gsap.to(navRef.current, {
                        backgroundColor: 'transparent',
                        backdropFilter: 'blur(0px)',
                        borderColor: 'transparent',
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
            {/* Logo */}
            <Link href={`/${locale}`} className="flex items-center gap-2 group">
                <span className="text-accent">⚡</span>
                <span className="font-heading font-bold text-xl tracking-wider uppercase text-white">
                    XPLife
                </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-6 font-sans text-sm font-medium tracking-wide">
                <a href="#how-it-works" className="text-ghost/60 hover:text-accent transition-colors">{t('howItWorks')}</a>
                <a href="#features" className="text-ghost/60 hover:text-accent transition-colors">{t('features')}</a>
                <a href="#pricing" className="text-ghost/60 hover:text-accent transition-colors">{t('pricing')}</a>
                <LanguageSwitcher />
                <Link
                    href={`/${locale}/login`}
                    className="text-ghost/60 hover:text-ghost transition-colors"
                >
                    {t('login')}
                </Link>
                <Link
                    href={`/${locale}/login`}
                    className="bg-accent text-primary px-5 py-2 rounded-full font-heading font-bold tracking-wider text-xs shadow-[0_0_15px_rgba(0,245,255,0.3)] hover:shadow-[0_0_25px_rgba(0,245,255,0.5)] transition-all"
                >
                    {t('signup')}
                </Link>
            </div>

            {/* Mobile Hamburger */}
            <button
                className="md:hidden text-ghost/60 hover:text-ghost transition-colors"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
            >
                {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#0C1021]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col gap-4 md:hidden">
                    <a href="#how-it-works" className="text-ghost/60 font-sans text-sm hover:text-accent transition-colors" onClick={() => setMobileOpen(false)}>
                        {t('howItWorks')}
                    </a>
                    <a href="#features" className="text-ghost/60 font-sans text-sm hover:text-accent transition-colors" onClick={() => setMobileOpen(false)}>
                        {t('features')}
                    </a>
                    <a href="#pricing" className="text-ghost/60 font-sans text-sm hover:text-accent transition-colors" onClick={() => setMobileOpen(false)}>
                        {t('pricing')}
                    </a>
                    <div className="py-1"><LanguageSwitcher /></div>
                    <Link
                        href={`/${locale}/login`}
                        className="text-ghost/60 font-sans text-sm hover:text-ghost transition-colors"
                        onClick={() => setMobileOpen(false)}
                    >
                        {t('login')}
                    </Link>
                    <Link
                        href={`/${locale}/login`}
                        className="bg-accent text-primary px-5 py-2.5 rounded-full font-heading font-bold tracking-wider text-sm text-center shadow-[0_0_15px_rgba(0,245,255,0.3)] transition-all"
                        onClick={() => setMobileOpen(false)}
                    >
                        {t('signup')}
                    </Link>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
