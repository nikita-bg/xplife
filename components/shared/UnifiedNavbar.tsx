'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { Bell, Zap, LogOut, Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { LanguageSwitcher } from '@/components/i18n/language-switcher'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import type { RankTier } from '@/components/character/CharacterConfig'

const NAV_KEYS = [
    { key: 'dashboard', href: '/dashboard' },
    { key: 'quests', href: '/quests' },
    { key: 'leaderboard', href: '/leaderboard' },
    { key: 'inventory', href: '/inventory' },
    { key: 'market', href: '/market' },
    { key: 'profile', href: '/profile' },
]

const RANK_BORDER: Record<RankTier, string> = {
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

interface UnifiedNavbarUser {
    avatar?: string | null
    username?: string
    totalXP?: number
    rank?: RankTier
    level?: number
}

interface UnifiedNavbarProps {
    user: UnifiedNavbarUser
    locale?: string
}

export function UnifiedNavbar({ user, locale = 'en' }: UnifiedNavbarProps) {
    const pathname = usePathname()
    const router = useRouter()
    const [mobileOpen, setMobileOpen] = useState(false)
    const t = useTranslations('navigation')

    const isActive = (href: string) => pathname.includes(href.replace('/', ''))

    const rankColor = user?.rank ? (RANK_BORDER[user.rank] ?? '#9E9E9E') : '#9E9E9E'

    const handleLogout = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push(`/${locale}`)
        router.refresh()
    }

    return (
        <>
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

                {/* Nav links — desktop */}
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }} className="hidden md:flex">
                    {NAV_KEYS.map((link) => {
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
                                {t(link.key)}
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

                {/* Right section — desktop */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }} className="hidden md:flex">
                    {/* Language switcher */}
                    <LanguageSwitcher />

                    {/* Bell with notification dot */}
                    <button
                        onClick={() => toast.info('Notifications coming soon!')}
                        style={{
                            position: 'relative',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                        }}
                        aria-label="Notifications"
                    >
                        <Bell size={20} style={{ color: 'var(--text-secondary)' }} />
                    </button>

                    {/* Avatar + rank indicator — links to profile */}
                    <Link href={`/${locale}/profile`} style={{ position: 'relative', flexShrink: 0, textDecoration: 'none' }}>
                        {user?.avatar ? (
                            <Image
                                src={user.avatar}
                                alt={user.username || 'User'}
                                width={40}
                                height={40}
                                style={{
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
                            &#9670;
                        </span>
                    </Link>

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
                            {t('totalXp')}:
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

                    {/* Logout */}
                    <button
                        onClick={handleLogout}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                        }}
                        aria-label="Log out"
                    >
                        <LogOut size={18} style={{ color: 'var(--text-secondary)', transition: 'color 0.15s' }} />
                    </button>
                </div>

                {/* Mobile hamburger */}
                <button
                    type="button"
                    className="md:hidden"
                    onClick={() => setMobileOpen(!mobileOpen)}
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        color: 'var(--text-primary)',
                    }}
                    aria-label="Toggle menu"
                >
                    {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </motion.nav >

            {/* Mobile menu */}
            <AnimatePresence>
                {
                    mobileOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            style={{
                                position: 'fixed',
                                top: '64px',
                                left: 0,
                                right: 0,
                                zIndex: 49,
                                background: 'rgba(8, 11, 26, 0.95)',
                                backdropFilter: 'blur(24px)',
                                WebkitBackdropFilter: 'blur(24px)',
                                borderBottom: '1px solid rgba(155, 78, 221, 0.2)',
                                padding: '16px',
                            }}
                            className="md:hidden"
                        >
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                {/* User info */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '8px 12px',
                                    marginBottom: '8px',
                                    borderBottom: '1px solid rgba(155, 78, 221, 0.15)',
                                    paddingBottom: '16px',
                                }}>
                                    <div style={{ position: 'relative', flexShrink: 0 }}>
                                        {user?.avatar ? (
                                            <Image
                                                src={user.avatar}
                                                alt={user.username || 'User'}
                                                width={36}
                                                height={36}
                                                style={{
                                                    borderRadius: '50%',
                                                    objectFit: 'cover',
                                                    border: `2px solid ${rankColor}`,
                                                }}
                                            />
                                        ) : (
                                            <div
                                                style={{
                                                    width: '36px',
                                                    height: '36px',
                                                    borderRadius: '50%',
                                                    background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-cyan))',
                                                    border: `2px solid ${rankColor}`,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontFamily: 'var(--font-orbitron), sans-serif',
                                                    fontSize: '12px',
                                                    fontWeight: 700,
                                                    color: '#fff',
                                                }}
                                            >
                                                {(user?.username || 'H')[0].toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <div style={{
                                            fontFamily: 'var(--font-orbitron), sans-serif',
                                            fontSize: '13px',
                                            fontWeight: 700,
                                            color: 'var(--text-primary)',
                                        }}>
                                            {user?.username || 'Hero'}
                                        </div>
                                        <div style={{
                                            fontFamily: 'var(--font-orbitron), sans-serif',
                                            fontSize: '12px',
                                            fontWeight: 700,
                                            color: 'var(--accent-cyan)',
                                        }}>
                                            {(user?.totalXP ?? 0).toLocaleString()} XP
                                        </div>
                                    </div>
                                </div>

                                {/* Nav links */}
                                {NAV_KEYS.map((link) => {
                                    const active = isActive(link.href)
                                    return (
                                        <Link
                                            key={link.href}
                                            href={`/${locale}${link.href}`}
                                            onClick={() => setMobileOpen(false)}
                                            style={{
                                                display: 'block',
                                                padding: '10px 12px',
                                                borderRadius: '8px',
                                                textDecoration: 'none',
                                                fontFamily: 'var(--font-orbitron), sans-serif',
                                                fontSize: '13px',
                                                letterSpacing: '0.08em',
                                                textTransform: 'uppercase',
                                                color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                                                fontWeight: active ? 700 : 500,
                                                background: active ? 'rgba(155, 78, 221, 0.15)' : 'transparent',
                                                transition: 'all 0.15s ease',
                                            }}
                                        >
                                            {t(link.key)}
                                        </Link>
                                    )
                                })}

                                {/* Language switcher + logout */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    marginTop: '8px',
                                    paddingTop: '12px',
                                    borderTop: '1px solid rgba(155, 78, 221, 0.15)',
                                }}>
                                    <LanguageSwitcher />
                                    <button
                                        onClick={() => {
                                            setMobileOpen(false)
                                            handleLogout()
                                        }}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            padding: '8px 12px',
                                            borderRadius: '8px',
                                            fontFamily: 'var(--font-orbitron), sans-serif',
                                            fontSize: '12px',
                                            letterSpacing: '0.08em',
                                            textTransform: 'uppercase',
                                            color: 'var(--text-secondary)',
                                        }}
                                    >
                                        <LogOut size={16} />
                                        {t('logout')}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )
                }
            </AnimatePresence >
        </>
    )
}
