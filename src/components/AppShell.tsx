'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Trophy, Backpack, Store, User, Flame } from 'lucide-react';

const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    { to: '/inventory', label: 'Inventory', icon: Backpack },
    { to: '/market', label: 'Market', icon: Store },
    { to: '/profile', label: 'Profile', icon: User },
];

interface AppShellProps {
    children: React.ReactNode;
}

const AppShell = ({ children }: AppShellProps) => {
    const pathname = usePathname();

    // Extract locale from pathname (e.g., /en/dashboard -> en)
    const segments = pathname.split('/');
    const locale = segments[1] || 'en';

    const isActive = (path: string) => {
        return pathname.includes(path);
    };

    return (
        <div className="flex min-h-screen bg-background text-ghost">
            {/* ── Desktop Sidebar ── */}
            <aside className="hidden md:flex fixed top-0 left-0 w-64 h-screen flex-col z-40 bg-[#080B1A]/80 backdrop-blur-xl border-r border-white/5">
                {/* Logo */}
                <div className="px-6 py-6 border-b border-white/5">
                    <Link href={`/${locale}/dashboard`} className="flex items-center gap-2">
                        <span className="text-accent text-xl">⚡</span>
                        <span className="font-heading font-bold text-lg tracking-widest uppercase text-white">XPLife</span>
                    </Link>
                </div>

                {/* Profile Mini Card */}
                <div className="px-4 py-5 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-tertiary flex items-center justify-center text-sm font-bold text-background shrink-0">H</div>
                        <div className="flex-1 min-w-0">
                            <div className="font-heading text-sm font-bold text-white truncate">Hero</div>
                            <div className="font-data text-[10px] text-accent-secondary tracking-wider">Iron ⚔️</div>
                        </div>
                    </div>
                </div>

                {/* Nav Links */}
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
                                <span className="font-sans">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom: Streak + XP Bar */}
                <div className="px-4 py-5 border-t border-white/5 space-y-3">
                    <div className="flex items-center gap-2">
                        <Flame size={16} className="text-orange-400" />
                        <span className="font-data text-xs text-orange-400 tracking-wider">7 day streak</span>
                    </div>
                    <div className="space-y-1">
                        <div className="flex justify-between font-data text-[10px] text-ghost/50">
                            <span>Level 3</span>
                            <span>920 / 1500 XP</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-gradient-to-r from-accent to-tertiary transition-all duration-1000" style={{ width: '61%' }}></div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* ── Main Content ── */}
            <main className="flex-1 md:ml-64 pb-20 md:pb-0">
                <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
                    {children}
                </div>
            </main>

            {/* ── Mobile Bottom Tab Bar ── */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#080B1A]/90 backdrop-blur-xl border-t border-white/10 px-2 py-2 flex justify-around items-center">
                {navItems.map(item => {
                    const active = isActive(item.to);
                    return (
                        <Link
                            key={item.to}
                            href={`/${locale}${item.to}`}
                            className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-[10px] transition-all ${active ? 'text-accent' : 'text-ghost/40'}`}
                        >
                            <item.icon size={20} />
                            <span className="font-data">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
};

export default AppShell;
