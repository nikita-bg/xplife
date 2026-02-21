'use client'

import { useEffect, useState } from 'react'
import { useReducedMotion } from 'framer-motion'

const PARTICLE_COUNT = 25

function randomBetween(min, max) {
    return min + Math.random() * (max - min)
}

function generateParticles() {
    return Array.from({ length: PARTICLE_COUNT }, (_, i) => {
        const type = i % 3 === 0 ? 'diamond' : i % 3 === 1 ? 'triangle' : 'circle'
        const isC = i % 5 >= 3  // 40% cyan, 60% purple
        return {
            id: i,
            type,
            x: randomBetween(2, 98),       // % across viewport width
            y: randomBetween(10, 100),      // % down viewport height (start below visible)
            size: type === 'circle' ? randomBetween(2, 4) : randomBetween(4, 7),
            duration: randomBetween(14, 24),
            delay: randomBetween(0, 10),
            color: isC ? 'var(--accent-cyan)' : 'var(--accent-purple-mid)',
            opacity: type === 'diamond' ? 0.3 : type === 'triangle' ? 0.2 : 0.15,
        }
    })
}

function ParticleShape({ p }) {
    const baseStyle = {
        position: 'absolute',
        left: `${p.x}vw`,
        top: `${p.y}vh`,
        color: p.color,
        opacity: p.opacity,
        fontSize: `${p.size * 3}px`,
        animation: `particle-float ${p.duration}s ease-in-out ${p.delay}s infinite`,
        willChange: 'transform, opacity',
        pointerEvents: 'none',
        userSelect: 'none',
    }

    if (p.type === 'diamond') {
        return (
            <div
                style={{
                    ...baseStyle,
                    width: `${p.size}px`,
                    height: `${p.size}px`,
                    background: p.color,
                    transform: 'rotate(45deg)',
                    borderRadius: '1px',
                    opacity: p.opacity,
                    fontSize: undefined,
                }}
            />
        )
    }

    if (p.type === 'triangle') {
        return (
            <div
                style={{
                    ...baseStyle,
                    width: 0,
                    height: 0,
                    borderLeft: `${p.size}px solid transparent`,
                    borderRight: `${p.size}px solid transparent`,
                    borderBottom: `${p.size * 1.7}px solid ${p.color}`,
                    background: undefined,
                    fontSize: undefined,
                    opacity: p.opacity,
                }}
            />
        )
    }

    // circle
    return (
        <div
            style={{
                ...baseStyle,
                width: `${p.size}px`,
                height: `${p.size}px`,
                borderRadius: '50%',
                background: p.color,
                opacity: p.opacity,
                fontSize: undefined,
            }}
        />
    )
}

export function ParticleBackground() {
    const prefersReduced = useReducedMotion()
    const [particles, setParticles] = useState([])

    useEffect(() => {
        if (!prefersReduced) {
            setParticles(generateParticles())
        }
    }, [prefersReduced])

    if (prefersReduced || particles.length === 0) return null

    return (
        <div
            aria-hidden="true"
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 0,
                overflow: 'hidden',
                pointerEvents: 'none',
            }}
        >
            {particles.map((p) => (
                <ParticleShape key={p.id} p={p} />
            ))}
        </div>
    )
}
