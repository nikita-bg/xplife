'use client';

import React, { useState } from 'react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { Mail, MessageSquare, Send } from 'lucide-react';

export default function ContactPage() {
    const [sent, setSent] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSent(true);
    };

    return (
        <div className="min-h-screen bg-background text-ghost">
            <Navbar />
            <main className="max-w-4xl mx-auto px-6 py-32">
                <div className="text-center mb-16">
                    <p className="font-data text-xs text-accent tracking-[0.3em] uppercase mb-4">Get In Touch</p>
                    <h1 className="font-heading font-black text-4xl md:text-5xl text-ghost uppercase tracking-tight mb-6">
                        Contact <span className="text-accent">Us</span>
                    </h1>
                    <p className="text-ghost/60 font-sans text-lg max-w-xl mx-auto">
                        Have questions, feedback, or partnership ideas? We&apos;d love to hear from you.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div className="bg-[#0C1021] rounded-2xl border border-white/5 p-6">
                            <Mail size={20} className="text-accent mb-3" />
                            <h3 className="font-heading font-bold text-white text-sm uppercase tracking-wider mb-1">Email</h3>
                            <a href="mailto:hello@xplife.app" className="text-accent hover:underline text-sm">hello@xplife.app</a>
                        </div>
                        <div className="bg-[#0C1021] rounded-2xl border border-white/5 p-6">
                            <MessageSquare size={20} className="text-accent mb-3" />
                            <h3 className="font-heading font-bold text-white text-sm uppercase tracking-wider mb-1">Discord</h3>
                            <p className="text-ghost/50 text-sm">Join our community for real-time support and discussions.</p>
                        </div>
                    </div>

                    <div className="bg-[#0C1021] rounded-2xl border border-white/5 p-8">
                        {sent ? (
                            <div className="text-center py-12">
                                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                                    <Send size={20} className="text-accent" />
                                </div>
                                <h3 className="font-heading font-bold text-white text-lg mb-2">Message Sent!</h3>
                                <p className="text-ghost/50 text-sm">We&apos;ll get back to you within 24 hours.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="font-data text-xs text-ghost/40 uppercase tracking-wider mb-1 block">Name</label>
                                    <input type="text" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-ghost text-sm font-sans focus:border-accent/50 focus:outline-none transition-colors" placeholder="Your name" />
                                </div>
                                <div>
                                    <label className="font-data text-xs text-ghost/40 uppercase tracking-wider mb-1 block">Email</label>
                                    <input type="email" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-ghost text-sm font-sans focus:border-accent/50 focus:outline-none transition-colors" placeholder="hero@example.com" />
                                </div>
                                <div>
                                    <label className="font-data text-xs text-ghost/40 uppercase tracking-wider mb-1 block">Message</label>
                                    <textarea required rows={4} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-ghost text-sm font-sans focus:border-accent/50 focus:outline-none transition-colors resize-none" placeholder="Tell us what's on your mind..." />
                                </div>
                                <button type="submit" className="w-full bg-accent text-primary font-heading font-bold uppercase tracking-wider text-sm py-3 rounded-xl hover:shadow-[0_0_20px_rgba(0,245,255,0.3)] transition-shadow">
                                    Send Message
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
