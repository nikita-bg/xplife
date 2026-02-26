'use client';

import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import Features from '@/components/landing/Features';
import Philosophy from '@/components/landing/Philosophy';
import Protocol from '@/components/landing/Protocol';
import Pricing from '@/components/landing/Pricing';
import Footer from '@/components/landing/Footer';

export default function LandingClient() {
    return (
        <div className="w-full min-h-screen bg-background text-ghost overflow-hidden selection:bg-accent selection:text-primary relative">
            <Navbar />
            <Hero />
            <Features />
            <Philosophy />
            <Protocol />
            <Pricing />
            <Footer />
        </div>
    );
}
