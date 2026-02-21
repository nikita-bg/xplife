'use client'

import { motion } from 'framer-motion'

interface LevelBadgeProps {
    level: number
    delay?: number
}

export function LevelBadge({ level, delay = 0.8 }: LevelBadgeProps) {
    return (
        <motion.div
            initial={{ rotate: -180, scale: 0, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            transition={{ delay, type: 'spring', stiffness: 200, damping: 18 }}
            style={{
                position: 'relative',
                width: '100px',
                height: '100px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '50%',
                    border: '2px solid transparent',
                    borderTopColor: 'var(--accent-cyan)',
                    borderRightColor: 'var(--accent-cyan)',
                    animation: 'lvl-ring-rotate 6s linear infinite',
                    opacity: 0.7,
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    inset: '6px',
                    borderRadius: '50%',
                    border: '1px solid transparent',
                    borderBottomColor: 'var(--accent-purple-mid)',
                    borderLeftColor: 'var(--accent-purple-mid)',
                    animation: 'lvl-ring-rotate 4s linear infinite reverse',
                    opacity: 0.5,
                }}
            />
            <div
                style={{
                    width: '80px',
                    height: '80px',
                    clipPath: 'polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)',
                    background: 'radial-gradient(circle at center, rgba(123, 47, 190, 0.9) 0%, rgba(8,11,26,0.95) 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    zIndex: 1,
                }}
            >
                <span
                    style={{
                        fontFamily: 'var(--font-inter), sans-serif',
                        fontSize: '10px',
                        color: 'var(--text-secondary)',
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        lineHeight: 1,
                    }}
                >
                    LVL
                </span>
                <span
                    style={{
                        fontFamily: 'var(--font-orbitron), sans-serif',
                        fontSize: '28px',
                        fontWeight: 900,
                        color: 'var(--text-primary)',
                        lineHeight: 1.1,
                        textShadow: '0 0 10px rgba(0,245,255,0.4)',
                    }}
                >
                    {level}
                </span>
            </div>
        </motion.div>
    )
}
