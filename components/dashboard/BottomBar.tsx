'use client'

import { useEffect, useRef } from 'react'
import { motion, animate } from 'framer-motion'
import { useRouter } from 'next/navigation'

interface QuestProgress {
    completed: number
    total: number
}

interface BottomBarProps {
    streak?: number
    daily?: QuestProgress
    weekly?: QuestProgress
    monthly?: QuestProgress
    locale?: string
}

function progressColor(completed: number, total: number): string {
    if (total === 0) return 'var(--text-muted)'
    const ratio = completed / total
    if (ratio >= 1) return '#4ADE80'   // green
    if (ratio > 0) return '#FBBF24'    // yellow
    return '#F87171'                    // red
}

export function BottomBar({
    streak = 0,
    daily = { completed: 0, total: 5 },
    weekly = { completed: 0, total: 3 },
    monthly = { completed: 0, total: 1 },
    locale = 'en',
}: BottomBarProps) {
    const streakRef = useRef<HTMLSpanElement>(null)
    const router = useRouter()

    useEffect(() => {
        const el = streakRef.current
        if (!el) return
        const controls = animate(0, streak, {
            duration: 0.8,
            delay: 1.4,
            ease: [0.33, 1, 0.68, 1],
            onUpdate(v: number) {
                el.textContent = Math.round(v).toString()
            },
        })
        return () => controls.stop()
    }, [streak])

    const totalCompleted = daily.completed + weekly.completed + monthly.completed
    const totalAll = daily.total + weekly.total + monthly.total

    return (
        <motion.div
            initial={{ y: 72, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2, ease: 'easeOut' }}
            className="flex items-center justify-between gap-4 px-4 md:px-10"
            style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                height: '72px',
                zIndex: 40,
                background: 'rgba(8, 11, 26, 0.9)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderTop: '1px solid transparent',
                backgroundImage:
                    'linear-gradient(rgba(8, 11, 26, 0.9), rgba(8, 11, 26, 0.9)), linear-gradient(90deg, var(--accent-purple-mid), var(--accent-cyan))',
                backgroundOrigin: 'border-box',
                backgroundClip: 'padding-box, border-box',
            }}
        >
            {/* Left — Streak */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                <span style={{ fontSize: '28px', lineHeight: 1 }}>🔥</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                    <span
                        ref={streakRef}
                        style={{
                            fontFamily: 'var(--font-orbitron), sans-serif',
                            fontSize: '28px',
                            fontWeight: 900,
                            color: 'var(--accent-gold)',
                            lineHeight: 1,
                        }}
                    >
                        0
                    </span>
                    <span
                        className="hidden sm:inline"
                        style={{
                            fontFamily: 'var(--font-orbitron), sans-serif',
                            fontSize: '13px',
                            color: 'var(--text-secondary)',
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                        }}
                    >
                        Day Streak
                    </span>
                </div>
            </div>

            {/* Center — Quest Breakdown */}
            <div className="hidden sm:flex" style={{ flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {[
                        { label: 'Daily', data: daily },
                        { label: 'Weekly', data: weekly },
                        { label: 'Monthly', data: monthly },
                    ].map((q, i) => (
                        <div key={q.label} style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                            {i > 0 && (
                                <span style={{ color: 'var(--text-muted)', margin: '0 2px', fontSize: '11px' }}>·</span>
                            )}
                            <span
                                style={{
                                    fontFamily: 'var(--font-orbitron), sans-serif',
                                    fontSize: '11px',
                                    letterSpacing: '0.06em',
                                    color: progressColor(q.data.completed, q.data.total),
                                    textTransform: 'uppercase',
                                }}
                            >
                                {q.label}
                            </span>
                            <span
                                style={{
                                    fontFamily: 'var(--font-orbitron), sans-serif',
                                    fontSize: '14px',
                                    fontWeight: 700,
                                    color: 'var(--text-primary)',
                                }}
                            >
                                {q.data.completed}/{q.data.total}
                            </span>
                        </div>
                    ))}
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                    {Array.from({ length: Math.min(totalAll, 12) }, (_, i) => (
                        <div
                            key={i}
                            style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                background: i < totalCompleted ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.15)',
                                boxShadow: i < totalCompleted ? '0 0 4px var(--accent-cyan)' : 'none',
                                transition: 'all 0.3s ease',
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* Right — CTA Button */}
            <motion.button
                onClick={() => router.push(`/${locale}/quests`)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="w-auto sm:w-[200px]"
                style={{
                    height: '48px',
                    borderRadius: '24px',
                    background: 'linear-gradient(135deg, #00C8FF, #00F5FF)',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-orbitron), sans-serif',
                    fontSize: '13px',
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    color: 'var(--bg-base)',
                    animation: 'cta-pulse 2s ease-in-out infinite',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '0 20px',
                    flexShrink: 0,
                }}
            >
                START QUEST →
            </motion.button>
        </motion.div>
    )
}
