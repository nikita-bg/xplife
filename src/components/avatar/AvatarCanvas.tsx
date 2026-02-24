'use client'

import React, { Suspense, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { RANK_EFFECTS } from './avatar-data'
import type { RankTier } from '@/lib/xpUtils'
import type { EquippedItemData } from './VoxelAvatar'
import type { CharacterClass } from './avatar-data'
import VoxelAvatar from './VoxelAvatar'

interface AvatarCanvasProps {
    characterClass?: CharacterClass
    rank?: RankTier
    equipped?: EquippedItemData[]
    size?: 'sm' | 'md' | 'lg'
    interactive?: boolean
}

const SIZE_MAP = {
    sm: { width: 120, height: 150 },
    md: { width: 200, height: 260 },
    lg: { width: 320, height: 400 },
}

// Error boundary to prevent crashes from killing the whole page
class AvatarErrorBoundary extends React.Component<
    { children: React.ReactNode; fallback: React.ReactNode },
    { hasError: boolean }
> {
    constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
        super(props)
        this.state = { hasError: false }
    }
    static getDerivedStateFromError() {
        return { hasError: true }
    }
    componentDidCatch(error: Error) {
        console.warn('[AvatarCanvas] Render error caught:', error.message)
    }
    render() {
        if (this.state.hasError) return this.props.fallback
        return this.props.children
    }
}

function AvatarFallback({ size }: { size: 'sm' | 'md' | 'lg' }) {
    const dims = SIZE_MAP[size]
    return (
        <div
            style={{ width: dims.width, height: dims.height }}
            className="flex items-center justify-center bg-white/5 rounded-2xl mx-auto"
        >
            <span className="text-4xl">🧙</span>
        </div>
    )
}

export default function AvatarCanvas({
    characterClass = 'Adventurer',
    rank = 'iron',
    equipped = [],
    size = 'md',
    interactive = true,
}: AvatarCanvasProps) {
    const dims = SIZE_MAP[size]
    const effect = RANK_EFFECTS[rank]
    const [ready, setReady] = useState(false)

    return (
        <AvatarErrorBoundary fallback={<AvatarFallback size={size} />}>
            <div
                style={{ width: dims.width, height: dims.height }}
                className="relative mx-auto"
            >
                {/* Rank glow backdrop */}
                <div
                    className="absolute inset-0 rounded-2xl opacity-20 blur-xl pointer-events-none"
                    style={{ background: `radial-gradient(circle, ${effect.auraColor}40, transparent 70%)` }}
                />

                <Canvas
                    camera={{ position: [0, 0.5, 2.5], fov: 45 }}
                    style={{ background: 'transparent' }}
                    gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
                    onCreated={() => setReady(true)}
                >
                    <ambientLight intensity={0.4} />
                    <directionalLight position={[3, 5, 4]} intensity={1.2} color="#ffffff" />
                    <pointLight position={[-2, 2, 2]} color="#00F5FF" intensity={0.8} distance={8} />
                    <pointLight position={[2, 0, -2]} color="#FFB800" intensity={0.5} distance={8} />

                    <Suspense fallback={null}>
                        <VoxelAvatar
                            characterClass={characterClass}
                            rank={rank}
                            equipped={equipped}
                        />
                    </Suspense>

                    <OrbitControls
                        enableZoom={false}
                        enablePan={false}
                        autoRotate
                        autoRotateSpeed={effect.autoRotateSpeed}
                        minPolarAngle={Math.PI / 4}
                        maxPolarAngle={Math.PI / 1.8}
                        enabled={interactive}
                    />
                </Canvas>

                {/* Rank badge */}
                {ready && (
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 pointer-events-none">
                        <span
                            className="font-data text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full border"
                            style={{
                                color: effect.auraColor,
                                borderColor: `${effect.auraColor}40`,
                                background: `${effect.auraColor}15`,
                            }}
                        >
                            {rank}
                        </span>
                    </div>
                )}
            </div>
        </AvatarErrorBoundary>
    )
}
