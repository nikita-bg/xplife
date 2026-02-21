'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, Zap } from 'lucide-react'
import { motion } from 'framer-motion'

const NAV_LINKS = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Quests', href: '/quests' },
    { label: 'Leaderboard', href: '/leaderboard' },
    { label: 'Profile', href: '/profile' },
]

const RANK_BORDER = {
    iron: '#9E9E9E',
    bronze: '#CD7F32',
    silver: '#C0C0C0',
    gold: '#FFB800',
    platinum: '#00F5FF',
    diamond: '#6495ED',
    master: '#9D4EDD',
    grandmaster: '#FF4500',
    challenger: '#FFD700',
}

export function Navbar({ user, activeRoute = 'dashboard', locale = 'en' }) {
    const pathname = usePathname()
    const isActive = (href) =>
        pathname.includes(href.replace('/', '')) || activeRoute === href.replace('/', '')

    const rankColor = RANK_BORDER[user?.rank] ?? '#9E9E9E'

    return (
        <motion.nav
            initial={{ y: -64, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                height: '64px',
                zIndex: 50,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 32px',
                background: 'rgba(8, 11, 26, 0.85)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                borderBottom: '1px solid rgba(155, 78, 221, 0.2)',
            }}
        >
            {/* Logo */}
            <Link
                href={`/${locale}/dashboard`}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
            >
                <Zap size={22} style={{ color: 'var(--accent-cyan)' }} />
                <span
                    style={{
                        fontFamily: 'var(--font-orbitron), sans-serif',
                        fontSize: '22px',
                        fontWeight: 800,
                        letterSpacing: '-0.01em',
                    }}
                >
                    <span style={{ color: 'var(--accent-cyan)' }}>XP</span>
                    <span style={{ color: 'var(--text-primary)' }}>Life</span>
                </span>
            </Link>

            {/* Nav links */}
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                {NAV_LINKS.map((link) => {
                    const active = isActive(link.href)
                    return (
                        <Link
                            key={link.href}
                            href={`/${locale}${link.href}`}
                            style={{
                                position: 'relative',
                                padding: '6px 14px',
                                textDecoration: 'none',
                                fontFamily: 'var(--font-orbitron), sans-serif',
                                fontSize: '12px',
                                letterSpacing: '0.1em',
                                textTransform: 'uppercase',
                                color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                                fontWeight: active ? 700 : 500,
                                textShadow: active ? '0 0 12px rgba(255,255,255,0.4)' : 'none',
                                transition: 'color 0.15s ease',
                            }}
                        >
                            {link.label}
                            {active && (
                                <span
                                    style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        left: '14px',
                                        right: '14px',
                                        height: '2px',
                                        borderRadius: '1px',
                                        background: 'linear-gradient(90deg, var(--accent-purple-mid), var(--accent-cyan))',
                                    }}
                                />
                            )}
                        </Link>
                    )
                })}
            </div>

            {/* Right section */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {/* Bell with notification dot */}
                <div style={{ position: 'relative' }}>
                    <Bell size={20} style={{ color: 'var(--text-secondary)' }} />
                    <span
                        style={{
                            position: 'absolute',
                            top: '-2px',
                            right: '-2px',
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: '#FF3B3B',
                            animation: 'badge-dot-pulse 1.5s ease-in-out infinite',
                        }}
                    />
                </div>

                {/* Avatar + rank indicator */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                    {user?.avatar ? (
                        <img
                            src={user.avatar}
                            alt={user.username || 'User'}
                            style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                objectFit: 'cover',
                                border: `2px solid ${rankColor}`,
                                boxShadow: `0 0 10px ${rankColor}60`,
                            }}
                        />
                    ) : (
                        <div
                            style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-cyan))',
                                border: `2px solid ${rankColor}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontFamily: 'var(--font-orbitron), sans-serif',
                                fontSize: '14px',
                                fontWeight: 700,
                                color: '#fff',
                            }}
                        >
                            {(user?.username || 'H')[0].toUpperCase()}
                        </div>
                    )}
                    {/* Rank mini diamond below avatar */}
                    <span
                        style={{
                            position: 'absolute',
                            bottom: '-4px',
                            right: '-4px',
                            fontSize: '10px',
                            color: rankColor,
                            filter: `drop-shadow(0 0 4px ${rankColor})`,
                        }}
                    >
                        ◆
                    </span>
                </div>

                {/* Total XP display */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <span
                        style={{
                            fontFamily: 'var(--font-inter), sans-serif',
                            fontSize: '11px',
                            color: 'var(--text-secondary)',
                            letterSpacing: '0.04em',
                        }}
                    >
                        Total XP:
                    </span>
                    <span
                        style={{
                            fontFamily: 'var(--font-orbitron), sans-serif',
                            fontSize: '15px',
                            fontWeight: 700,
                            color: 'var(--accent-cyan)',
                            lineHeight: 1,
                        }}
                    >
                        {(user?.totalXP ?? 0).toLocaleString()}
                    </span>
                </div>
            </div>
        </motion.nav>
    )
}
