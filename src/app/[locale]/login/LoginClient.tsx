'use client';

import { createClient } from '@/lib/supabase/client';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function LoginClient() {
    const supabase = createClient();
    const pathname = usePathname();
    const router = useRouter();
    const locale = pathname.split('/')[1] || 'en';
    const tl = useTranslations('auth.login');
    const ts = useTranslations('auth.signup');

    const [mode, setMode] = useState<'login' | 'signup'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleOAuth = async (provider: 'google' | 'github') => {
        await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: `${window.location.origin}/${locale}/dashboard`,
            },
        });
    };

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            if (error.message.toLowerCase().includes('not confirmed')) {
                setError(tl('emailNotConfirmed'));
            } else {
                setError(tl('error'));
            }
            setLoading(false);
            return;
        }
        router.push(`/${locale}/dashboard`);
        router.refresh();
    };

    const handleEmailSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (password !== confirmPassword) {
            setError(ts('passwordMismatch'));
            setLoading(false);
            return;
        }
        if (password.length < 6) {
            setError(ts('passwordTooShort'));
            setLoading(false);
            return;
        }

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${window.location.origin}/${locale}/dashboard`,
            },
        });

        if (error) {
            if (error.message.toLowerCase().includes('already')) {
                setError(ts('alreadyRegistered'));
            } else {
                setError(error.message);
            }
            setLoading(false);
            return;
        }

        if (data?.user?.identities?.length === 0) {
            setError(ts('notConfirmedResent'));
            await supabase.auth.resend({ type: 'signup', email });
            setLoading(false);
            return;
        }

        setSuccess(true);
        setLoading(false);
    };

    const handleResend = async () => {
        await supabase.auth.resend({ type: 'signup', email });
        setError(ts('confirmationResent'));
    };

    if (success) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-[#0C1021] rounded-3xl border border-white/5 p-10 text-center">
                    <span className="text-4xl mb-3 block">✉️</span>
                    <h1 className="font-heading font-black text-2xl text-ghost uppercase tracking-tight">{ts('checkEmail')}</h1>
                    <p className="font-sans text-ghost/50 text-sm mt-4">{ts('checkEmailDesc', { email })}</p>
                    <Link href={`/${locale}/login`} className="inline-block mt-6 text-accent text-sm hover:underline" onClick={() => { setSuccess(false); setMode('login'); }}>
                        {tl('backToSignIn')}
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-[#0C1021] rounded-3xl border border-white/5 p-10">
                <div className="text-center mb-8">
                    <span className="text-4xl mb-3 block">⚡</span>
                    <h1 className="font-heading font-black text-2xl text-ghost uppercase tracking-tight">
                        {mode === 'login' ? tl('title') : ts('title')}
                    </h1>
                    <p className="font-sans text-ghost/50 text-sm mt-2">
                        {mode === 'login' ? tl('subtitle') : ts('subtitle')}
                    </p>
                </div>

                {/* OAuth */}
                <div className="space-y-3">
                    <button
                        onClick={() => handleOAuth('google')}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-ghost font-sans hover:bg-white/10 transition-colors"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" /><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                        {tl('continueWithGoogle')}
                    </button>
                    <button
                        onClick={() => handleOAuth('github')}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-ghost font-sans hover:bg-white/10 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" /></svg>
                        {tl('continueWithGithub')}
                    </button>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3 my-6">
                    <div className="h-px flex-1 bg-white/10" />
                    <span className="font-data text-xs text-ghost/30 tracking-wider">{tl('or')}</span>
                    <div className="h-px flex-1 bg-white/10" />
                </div>

                {/* Email/Password Form */}
                <form onSubmit={mode === 'login' ? handleEmailLogin : handleEmailSignup} className="space-y-4">
                    <div>
                        <label className="font-data text-xs text-ghost/50 tracking-wider block mb-1.5">{mode === 'login' ? tl('email') : ts('email')}</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder={mode === 'login' ? tl('emailPlaceholder') : ts('emailPlaceholder')}
                            required
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-ghost font-sans text-sm placeholder:text-ghost/20 focus:outline-none focus:border-accent/50 transition-colors"
                        />
                    </div>
                    <div>
                        <label className="font-data text-xs text-ghost/50 tracking-wider block mb-1.5">{mode === 'login' ? tl('password') : ts('password')}</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            minLength={6}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-ghost font-sans text-sm placeholder:text-ghost/20 focus:outline-none focus:border-accent/50 transition-colors"
                        />
                    </div>
                    {mode === 'signup' && (
                        <div>
                            <label className="font-data text-xs text-ghost/50 tracking-wider block mb-1.5">{ts('confirmPassword')}</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-ghost font-sans text-sm placeholder:text-ghost/20 focus:outline-none focus:border-accent/50 transition-colors"
                            />
                        </div>
                    )}

                    {error && (
                        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400 font-sans">
                            <p>{error}</p>
                            {error.includes('confirmed') && (
                                <button type="button" onClick={handleResend} className="mt-2 text-xs underline hover:no-underline text-red-300">
                                    {tl('resendConfirmation')}
                                </button>
                            )}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-accent text-primary rounded-xl font-heading font-bold tracking-wider text-sm shadow-[0_0_15px_rgba(0,245,255,0.3)] hover:shadow-[0_0_25px_rgba(0,245,255,0.5)] transition-all disabled:opacity-50"
                    >
                        {loading && <Loader2 size={16} className="animate-spin" />}
                        {mode === 'login' ? (loading ? tl('loggingIn') : tl('submit')) : (loading ? ts('creating') : ts('submit'))}
                    </button>
                </form>

                <p className="mt-6 text-center font-sans text-xs text-ghost/30">
                    {mode === 'login' ? (
                        <>{tl('noAccount')}{' '}<button onClick={() => { setMode('signup'); setError(null); }} className="text-accent hover:underline">{tl('signupLink')}</button></>
                    ) : (
                        <>{ts('hasAccount')}{' '}<button onClick={() => { setMode('login'); setError(null); }} className="text-accent hover:underline">{ts('loginLink')}</button></>
                    )}
                </p>

                <div className="mt-4 text-center">
                    <p className="font-sans text-xs text-ghost/20">{tl('terms')}</p>
                </div>
            </div>
        </div>
    );
}
