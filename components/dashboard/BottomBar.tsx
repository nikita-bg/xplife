'use client'

import { useEffect, useRef } from 'react'
import { motion, animate } from 'framer-motion'

interface BottomBarProps {
    streak?: number
    completed?: number
    total?: number
}

export function BottomBar({ streak = 47, completed = 3, total = 5 }: BottomBarProps) {
    const streakRef = useRef<HTMLSpanElement>(null)

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

    return (
        <motion.div
            initial={{ y: 72, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2, ease: 'easeOut' }}
            style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                height: '72px',
                zIndex: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 40px',
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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

            {/* Center — Progress */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                    <span
                        style={{
                            fontFamily: 'var(--font-orbitron), sans-serif',
                            fontSize: '20px',
                            fontWeight: 700,
                            color: 'var(--text-primary)',
                        }}
                    >
                        {completed}/{total}
                    </span>
                    <span
                        style={{
                            fontFamily: 'var(--font-inter), sans-serif',
                            fontSize: '13px',
                            color: 'var(--text-secondary)',
                            letterSpacing: '0.04em',
                        }}
                    >
                        COMPLETED
                    </span>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                    {Array.from({ length: total }, (_, i) => (
                        <div
                            key={i}
                            style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: i < completed ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.15)',
                                boxShadow: i < completed ? '0 0 6px var(--accent-cyan)' : 'none',
                                transition: 'all 0.3s ease',
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* Right — CTA Button */}
            <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                style={{
                    width: '200px',
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
                }}
            >
                START QUEST →
            </motion.button>
        </motion.div>
    )
}
