'use client';

import React from 'react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-background text-ghost">
            <Navbar />
            <main className="max-w-4xl mx-auto px-6 py-32">
                <h1 className="font-heading font-black text-4xl md:text-5xl text-ghost uppercase tracking-tight mb-8">
                    Privacy <span className="text-accent">Policy</span>
                </h1>
                <p className="text-ghost/40 font-data text-xs mb-12">Last updated: February 2025</p>

                <div className="space-y-8 text-ghost/70 font-sans text-sm leading-relaxed">
                    <section>
                        <h2 className="font-heading font-bold text-lg text-ghost mb-3">1. Information We Collect</h2>
                        <p>We collect information you provide directly: email address, display name, personality quiz answers, and goals you set within the app. We also collect usage data such as quest completions, XP earned, streak data, and in-app interactions to personalize your experience.</p>
                    </section>

                    <section>
                        <h2 className="font-heading font-bold text-lg text-ghost mb-3">2. How We Use Your Information</h2>
                        <p>Your data is used to: generate personalized AI quests, track your progress and achievements, maintain leaderboards, provide AI coaching, and improve our service. We never sell your personal data to third parties.</p>
                    </section>

                    <section>
                        <h2 className="font-heading font-bold text-lg text-ghost mb-3">3. Data Storage & Security</h2>
                        <p>Your data is stored securely using Supabase (PostgreSQL) with row-level security. All data transmission uses HTTPS/TLS encryption. We follow industry best practices for data protection.</p>
                    </section>

                    <section>
                        <h2 className="font-heading font-bold text-lg text-ghost mb-3">4. AI & Personalization</h2>
                        <p>We use AI (powered by Google Gemini) to generate personalized quests based on your personality type, goals, and lifestyle context. Your quiz answers and profile data are sent to AI providers solely for quest generation. This data is not used to train AI models.</p>
                    </section>

                    <section>
                        <h2 className="font-heading font-bold text-lg text-ghost mb-3">5. Third-Party Services</h2>
                        <p>We use: Supabase for authentication and database, Google Gemini for AI features, and Stripe for payment processing. Each service has its own privacy policy governing its use of your data.</p>
                    </section>

                    <section>
                        <h2 className="font-heading font-bold text-lg text-ghost mb-3">6. Cookies & Analytics</h2>
                        <p>We use essential cookies for authentication and session management. We may use analytics tools to understand usage patterns and improve our service. You can disable non-essential cookies in your browser settings.</p>
                    </section>

                    <section>
                        <h2 className="font-heading font-bold text-lg text-ghost mb-3">7. Your Rights</h2>
                        <p>You have the right to: access your data, correct inaccurate data, delete your account and all associated data, export your data, and opt out of non-essential data processing. To exercise these rights, contact us or use the account deletion feature in your profile settings.</p>
                    </section>

                    <section>
                        <h2 className="font-heading font-bold text-lg text-ghost mb-3">8. Data Retention</h2>
                        <p>We retain your data as long as your account is active. When you delete your account, all personal data is permanently removed within 30 days. Anonymized aggregate data may be retained for analytics purposes.</p>
                    </section>

                    <section>
                        <h2 className="font-heading font-bold text-lg text-ghost mb-3">9. Children&apos;s Privacy</h2>
                        <p>XPLife is not intended for children under 13. We do not knowingly collect personal information from children. If you believe a child has provided us personal data, please contact us immediately.</p>
                    </section>

                    <section>
                        <h2 className="font-heading font-bold text-lg text-ghost mb-3">10. Contact</h2>
                        <p>For privacy-related inquiries, contact us at <a href="mailto:privacy@xplife.app" className="text-accent hover:underline">privacy@xplife.app</a>.</p>
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
}
