'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

const Footer = () => {
    const t = useTranslations('footer');
    return (
        <footer className="w-full bg-[#050714] text-ghost/80 py-16 px-6 md:px-12 rounded-t-[4rem] border-t border-white/5 relative z-20 mt-20">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12">
                <div className="col-span-1 md:col-span-4 flex flex-col items-start">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-accent text-xl">⚡</span>
                        <span className="font-heading font-bold text-2xl tracking-widest uppercase text-white">
                            XPLife
                        </span>
                    </div>
                    <p className="font-sans text-sm text-ghost/50 mb-8 max-w-sm">
                        {t('tagline')}
                    </p>
                    <div className="inline-flex items-center gap-3 bg-background border border-white/10 rounded-full px-4 py-2 mt-auto">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                        </span>
                        <span className="font-data text-[10px] sm:text-xs text-ghost/70 tracking-wider">
                            Quest Engine Online · 99.9% uptime
                        </span>
                    </div>
                </div>

                <div className="col-span-1 md:col-span-8 flex flex-wrap md:justify-end gap-12 lg:gap-24">
                    <div className="flex flex-col gap-4">
                        <h4 className="font-heading font-bold text-white uppercase tracking-wider text-sm mb-2">Product</h4>
                        <a href="#" className="font-sans text-sm hover:text-accent transition-colors">Features</a>
                        <a href="#" className="font-sans text-sm hover:text-accent transition-colors">Pricing</a>
                        <a href="#" className="font-sans text-sm hover:text-accent transition-colors">Changelog</a>
                    </div>
                    <div className="flex flex-col gap-4">
                        <h4 className="font-heading font-bold text-white uppercase tracking-wider text-sm mb-2">Community</h4>
                        <a href="#" className="font-sans text-sm hover:text-accent transition-colors">Discord</a>
                        <a href="#" className="font-sans text-sm hover:text-accent transition-colors">Twitter (X)</a>
                        <a href="#" className="font-sans text-sm hover:text-accent transition-colors">Leaderboards</a>
                    </div>
                    <div className="flex flex-col gap-4">
                        <h4 className="font-heading font-bold text-white uppercase tracking-wider text-sm mb-2">Legal</h4>
                        <a href="#" className="font-sans text-sm hover:text-accent transition-colors">Privacy Policy</a>
                        <a href="#" className="font-sans text-sm hover:text-accent transition-colors">Terms of Service</a>
                        <a href="#" className="font-sans text-sm hover:text-accent transition-colors">Contact</a>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="font-sans text-xs text-ghost/40">
                    {t('copyright')}
                </p>
                <div className="font-data text-[10px] text-ghost/20 tracking-widest uppercase">
                    SYSTEM_VERSION: 3.0.0-PRO
                </div>
            </div>
        </footer>
    );
};

export default Footer;
