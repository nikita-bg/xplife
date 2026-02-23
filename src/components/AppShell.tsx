'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Trophy, Backpack, Store, User, Flame, Shield, Skull, BookOpen, LogOut } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import ChatWidget from '@/components/chat/ChatWidget';

const navItems = [
    { to: '/dashboard', labelKey: 'dashboard', icon: LayoutDashboard },
    { to: '/leaderboard', labelKey: 'leaderboard', icon: Trophy },
    { to: '/guild', labelKey: 'guild', icon: Shield },
    { to: '/boss', labelKey: 'boss', icon: Skull },
    { to: '/journal', labelKey: 'journal', icon: BookOpen },
    { to: '/inventory', labelKey: 'inventory', icon: Backpack },
    { to: '/market', labelKey: 'market', icon: Store },
    { to: '/profile', labelKey: 'profile', icon: User },
];

interface AppShellProps {
    children: React.ReactNode;
}

const AppShell = ({ children }: AppShellProps) => {
    const pathname = usePathname();
    const router = useRouter();
    const t = useTranslations('appShell');
    const nav = useTranslations('appShell.nav');
    const [displayName, setDisplayName] = useState('Hero');
    const [userClass, setUserClass] = useState('Adventurer');
    const [currentStreak, setCurrentStreak] = useState(0);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    const segments = pathname.split('/');
    const locale = segments[1] || 'en';

    const isActive = (path: string) => pathname.includes(path);

    useEffect(() => {
        const fetchUser = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const [profileRes, streakRes] = await Promise.all([
                    supabase.from('users').select('display_name, personality_type, avatar_url').eq('id', user.id).single(),
                    supabase.from('streaks').select('current_streak').eq('user_id', user.id).single(),
                ]);
                if (profileRes.data) {
                    setDisplayName(profileRes.data.display_name || user.email?.split('@')[0] || 'Hero');
                    const classMap: Record<string, string> = { dopamine: 'Adventurer', acetylcholine: 'Thinker', gaba: 'Guardian', serotonin: 'Connector' };
                    setUserClass(classMap[profileRes.data.personality_type || ''] || 'Adventurer');
                    setAvatarUrl(profileRes.data.avatar_url || null);
                }
                if (streakRes.data) {
                    setCurrentStreak(streakRes.data.current_streak || 0);
                }
            }
        };
        fetchUser();
    }, []);

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push(`/${locale}/login`);
        router.refresh();
    };

    return (
        <div className="flex min-h-screen bg-background text-ghost">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex fixed top-0 left-0 w-64 h-screen flex-col z-40 bg-[#080B1A]/80 backdrop-blur-xl border-r border-white/5">
                <div className="px-6 py-6 border-b border-white/5">
                    <Link href={`/${locale}/dashboard`} className="flex items-center gap-2">
                        <span className="text-accent text-xl">⚡</span>
                        <span className="font-heading font-bold text-lg tracking-widest uppercase text-white">XPLife</span>
                    </Link>
                </div>

                <div className="px-4 py-5 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-tertiary flex items-center justify-center text-sm font-bold text-background shrink-0 overflow-hidden">
                            {avatarUrl ? (
                                <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                                displayName.charAt(0).toUpperCase()
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="font-heading text-sm font-bold text-white truncate">{displayName}</div>
                            <div className="font-data text-[10px] text-accent-secondary tracking-wider">{userClass} ⚔️</div>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
                    {navItems.map(item => {
                        const active = isActive(item.to);
                        return (
                            <Link
                                key={item.to}
                                href={`/${locale}${item.to}`}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${active
                                    ? 'bg-accent/10 text-accent border-l-2 border-accent shadow-[inset_0_0_20px_rgba(0,245,255,0.05)]'
                                    : 'text-ghost/60 hover:text-ghost hover:bg-white/5 border-l-2 border-transparent'
                                    }`}
                            >
                                <item.icon size={18} className="shrink-0 group-hover:scale-110 transition-transform" />
                                <span className="font-sans">{nav(item.labelKey)}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="px-4 py-5 border-t border-white/5 space-y-3">
                    <div className="flex items-center gap-2">
                        <Flame size={16} className="text-orange-400" />
                        <span className="font-data text-xs text-orange-400 tracking-wider">{t('streak', { count: currentStreak })}</span>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-sans text-red-400/70 hover:text-red-400 hover:bg-red-400/5 border border-red-400/10 hover:border-red-400/20 transition-all"
                    >
                        <LogOut size={16} />
                        {t('signOut')}
                    </button>
                </div>
            </aside>

            <main className="flex-1 md:ml-64 pb-20 md:pb-0">
                <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
                    {children}
                </div>
            </main>

            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#080B1A]/90 backdrop-blur-xl border-t border-white/10 px-2 py-2 flex justify-around items-center">
                {navItems.slice(0, 5).map(item => {
                    const active = isActive(item.to);
                    return (
                        <Link
                            key={item.to}
                            href={`/${locale}${item.to}`}
                            className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-[10px] transition-all ${active ? 'text-accent' : 'text-ghost/40'}`}
                        >
                            <item.icon size={20} />
                            <span className="font-data">{nav(item.labelKey)}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Floating AI Chat */}
            <ChatWidget />
        </div>
    );
};

export default AppShell;
