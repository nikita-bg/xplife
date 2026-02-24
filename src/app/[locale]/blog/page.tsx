'use client';

import React from 'react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { useTranslations } from 'next-intl';

export default function BlogPage() {
    const t = useTranslations('blog');

    return (
        <div className="min-h-screen bg-background text-ghost">
            <Navbar />
            <main className="max-w-5xl mx-auto px-6 py-32">
                <div className="text-center mb-16">
                    <p className="font-data text-xs text-accent tracking-[0.3em] uppercase mb-4">{t('badge')}</p>
                    <h1 className="font-heading font-black text-4xl md:text-6xl text-ghost uppercase tracking-tight mb-6">
                        {t('title')} <span className="text-accent">{t('titleHighlight')}</span>
                    </h1>
                    <p className="text-ghost/60 font-sans text-lg max-w-2xl mx-auto">{t('subtitle')}</p>
                </div>

                {/* Empty state - placeholder for future blog posts from CMS or Supabase */}
                <div className="bg-[#0C1021] rounded-2xl border border-white/5 p-16 text-center">
                    <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
                        <span className="text-accent text-2xl">📝</span>
                    </div>
                    <h3 className="font-heading font-bold text-xl text-white mb-3">{t('emptyTitle')}</h3>
                    <p className="text-ghost/50 font-sans text-sm max-w-md mx-auto mb-8">{t('emptyDescription')}</p>
                    <a href="/" className="inline-block bg-accent text-primary font-heading font-bold uppercase tracking-wider text-sm px-8 py-3 rounded-xl hover:shadow-[0_0_20px_rgba(0,245,255,0.3)] transition-shadow">
                        {t('ctaButton')}
                    </a>
                </div>
            </main>
            <Footer />
        </div>
    );
}
