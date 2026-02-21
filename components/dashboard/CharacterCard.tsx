'use client'

import { Suspense, lazy, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { GradientBorderCard } from '@/components/ui/GradientBorderCard'
import { LevelBadge } from '@/components/ui/LevelBadge'
import { RankBadge } from '@/components/ui/RankBadge'
import { XPProgressBar } from '@/components/ui/XPProgressBar'

const CharacterSVG = lazy(() => import('@/components/character/CharacterSVG'))

const CLASS_LABELS = {
    adventurer: 'THE ADVENTURER',
    thinker: 'THE THINKER',
    guardian: 'THE GUARDIAN',
    connector: 'THE CONNECTOR',
}

const RANK_COLORS = {
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

function CharacterFallback() {
    return (
        <div
            style={{
                width: '100%',
                height: '280px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0.4,
            }}
        >
            <div
                style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-cyan))',
                    animation: 'badge-dot-pulse 1.5s ease-in-out infinite',
                }}
            />
        </div>
    )
}

export function CharacterCard({ character, user }) {
    const trackingZoneRef = useRef(null)
    const charRef = useRef(null)

    const rankColor = RANK_COLORS[character?.rank] ?? RANK_COLORS.gold
    const classLabel = CLASS_LABELS[character?.class] ?? 'THE ADVENTURER'

    const handleMouseMove = useCallback((e) => {
        const zone = trackingZoneRef.current
        if (!zone) return
        const rect = zone.getBoundingClientRect()
        const x = (e.clientX - rect.left) / rect.width
        const y = (e.clientY - rect.top) / rect.height
        // Expose coords for CharacterSVG's tracking hook via a data attribute
        zone.dataset.cursorX = x.toFixed(3)
        zone.dataset.cursorY = y.toFixed(3)
    }, [])

    return (
        <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5, type: 'spring', stiffness: 150, damping: 20 }}
            style={{ position: 'relative', zIndex: 10 }}
        >
            <GradientBorderCard
                style={{
                    width: '560px',
                    minHeight: '520px',
                }}
            >
                {/* Inner content */}
                <div
                    style={{
                        padding: '28px 28px 24px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '16px',
                        position: 'relative',
                        minHeight: '520px',
                    }}
                >
                    {/* LVL badge — absolute top right */}
                    <div style={{ position: 'absolute', top: '24px', right: '24px', zIndex: 5 }}>
                        <LevelBadge level={character?.level ?? 1} delay={0.8} />
                    </div>

                    {/* Character viewer zone */}
                    <div
                        ref={trackingZoneRef}
                        onMouseMove={handleMouseMove}
                        style={{
                            width: '100%',
                            height: '280px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative',
                            cursor: 'none',
                            flexShrink: 0,
                        }}
                    >
                        {/* Radial glow behind character */}
                        <div
                            aria-hidden="true"
                            style={{
                                position: 'absolute',
                                inset: 0,
                                background: 'radial-gradient(ellipse at center, rgba(0,245,255,0.07) 0%, transparent 70%)',
                                pointerEvents: 'none',
                            }}
                        />

                        {/* Character SVG — lazy loaded */}
                        <Suspense fallback={<CharacterFallback />}>
                            <CharacterSVG
                                ref={charRef}
                                config={character}
                                className="w-full h-full"
                            />
                        </Suspense>

                        {/* Aura at feet */}
                        <div
                            aria-hidden="true"
                            style={{
                                position: 'absolute',
                                bottom: '12px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                width: '120px',
                                height: '20px',
                                background: `radial-gradient(ellipse at center, ${rankColor}66 0%, transparent 70%)`,
                                filter: 'blur(8px)',
                                pointerEvents: 'none',
                            }}
                        />
                    </div>

                    {/* Class label */}
                    <div style={{ textAlign: 'center', marginTop: '4px' }}>
                        <h2
                            style={{
                                fontFamily: 'var(--font-orbitron), sans-serif',
                                fontSize: '22px',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                color: 'var(--accent-gold)',
                                textShadow: '0 0 20px rgba(255, 184, 0, 0.5)',
                                letterSpacing: '0.04em',
                                margin: 0,
                            }}
                        >
                            {classLabel}
                        </h2>
                    </div>

                    {/* Rank badge */}
                    <RankBadge rank={character?.rank ?? 'gold'} />

                    {/* XP Progress Bar */}
                    <div style={{ width: '100%', marginTop: 'auto', paddingTop: '8px' }}>
                        <XPProgressBar
                            current={user?.totalXP ?? character?.currentXP ?? 0}
                            max={character?.maxXP ?? 10000}
                            animated
                        />
                    </div>
                </div>
            </GradientBorderCard>
        </motion.div>
    )
}
