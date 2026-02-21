'use client'

import { useEffect, useRef } from 'react'
import { animate } from 'framer-motion'

interface XPProgressBarProps {
    current: number
    max: number
    animated?: boolean
}

export function XPProgressBar({ current, max, animated = true }: XPProgressBarProps) {
    const fillRef = useRef<HTMLDivElement>(null)
    const labelRef = useRef<HTMLSpanElement>(null)
    const dotRef = useRef<HTMLDivElement>(null)
    const pct = Math.min(100, Math.max(0, (current / max) * 100))

    useEffect(() => {
        if (!animated) return

        const fillEl = fillRef.current
        const labelEl = labelRef.current
        if (!fillEl) return

        const controls = animate(0, pct, {
            duration: 1.2,
            delay: 1.2,
            ease: [0.33, 1, 0.68, 1],
            onUpdate(v: number) {
                fillEl.style.width = `${v}%`
                if (dotRef.current) {
                    dotRef.current.style.left = `calc(${v}% - 4px)`
                }
            },
        })

        const counterControls = animate(0, current, {
            duration: 1.2,
            delay: 1.2,
            ease: [0.33, 1, 0.68, 1],
            onUpdate(v: number) {
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
                    }}
                />
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
