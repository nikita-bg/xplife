'use client'

import { useEffect, useRef } from 'react'
import { animate } from 'framer-motion'

export function XPProgressBar({ current, max, animated = true }) {
    const fillRef = useRef(null)
    const labelRef = useRef(null)
    const dotRef = useRef(null)
    const pct = Math.min(100, Math.max(0, (current / max) * 100))

    useEffect(() => {
        if (!animated) return

        const fillEl = fillRef.current
        const labelEl = labelRef.current
        if (!fillEl) return

        // Animate fill width from 0 to target
        const controls = animate(0, pct, {
            duration: 1.2,
            delay: 1.2,
            ease: [0.33, 1, 0.68, 1],
            onUpdate(v) {
                fillEl.style.width = `${v}%`
                if (dotRef.current) {
                    dotRef.current.style.left = `calc(${v}% - 4px)`
                }
            },
        })

        // Animate counter from 0 to current XP
        const counterControls = animate(0, current, {
            duration: 1.2,
            delay: 1.2,
            ease: [0.33, 1, 0.68, 1],
            onUpdate(v) {
                if (labelEl) {
                    labelEl.textContent = `${Math.round(v).toLocaleString()} / ${max.toLocaleString()} XP`
                }
            },
        })

        return () => {
            controls.stop()
            counterControls.stop()
        }
    }, [pct, current, max, animated])

    return (
        <div style={{ width: '100%', position: 'relative' }}>
            {/* Track */}
            <div
                style={{
                    height: '44px',
                    borderRadius: '22px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(155, 78, 221, 0.3)',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Fill */}
                <div
                    ref={fillRef}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        height: '100%',
                        width: animated ? '0%' : `${pct}%`,
                        borderRadius: '22px',
                        background: 'var(--gradient-xp-bar)',
                        transition: animated ? undefined : 'none',
                    }}
                />

                {/* Shimmer overlay */}
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '40%',
                        height: '100%',
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)',
                        animation: 'shimmer 2.5s ease-in-out infinite',
                        animationDelay: '2.5s',
                        pointerEvents: 'none',
                    }}
                />

                {/* Label centered */}
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 2,
                    }}
                >
                    <span
                        ref={labelRef}
                        style={{
                            fontFamily: 'var(--font-orbitron), sans-serif',
                            fontSize: '13px',
                            fontWeight: 700,
                            color: 'var(--text-primary)',
                            letterSpacing: '0.04em',
                            textShadow: '0 1px 4px rgba(0,0,0,0.5)',
                        }}
                    >
                        {animated ? `0 / ${max.toLocaleString()} XP` : `${current.toLocaleString()} / ${max.toLocaleString()} XP`}
                    </span>
                </div>
            </div>

            {/* Glow dot at fill endpoint */}
            <div
                ref={dotRef}
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: animated ? '0%' : `calc(${pct}% - 4px)`,
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#fff',
                    boxShadow: '0 0 8px 3px rgba(155,78,221,0.8)',
                    transform: 'translateY(-50%)',
                    animation: 'badge-dot-pulse 1.5s ease-in-out infinite',
                    animationDelay: '2.5s',
                    zIndex: 3,
                    pointerEvents: 'none',
                }}
            />
        </div>
    )
}
