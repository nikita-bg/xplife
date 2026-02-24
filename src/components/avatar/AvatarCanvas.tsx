'use client'

import { Suspense, lazy } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { RANK_EFFECTS } from './avatar-data'
import type { RankTier } from '@/lib/xpUtils'
import type { EquippedItemData } from './VoxelAvatar'
import type { CharacterClass } from './avatar-data'

const VoxelAvatar = lazy(() => import('./VoxelAvatar'))

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

export default function AvatarCanvas({
    characterClass = 'Adventurer',
    rank = 'iron',
    equipped = [],
    size = 'md',
    interactive = true,
}: AvatarCanvasProps) {
    const dims = SIZE_MAP[size]
    const effect = RANK_EFFECTS[rank]

    return (
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
                gl={{ alpha: true, antialias: true }}
            >
                {/* Lighting */}
                <ambientLight intensity={0.4} />
                <directionalLight position={[3, 5, 4]} intensity={1.2} color="#ffffff" />
                <pointLight position={[-2, 2, 2]} color="#00F5FF" intensity={0.8} distance={8} />
                <pointLight position={[2, 0, -2]} color="#FFB800" intensity={0.5} distance={8} />

                {/* Avatar */}
                <Suspense fallback={null}>
                    <VoxelAvatar
                        characterClass={characterClass}
                        rank={rank}
                        equipped={equipped}
                    />
                </Suspense>

                {/* Controls */}
                <OrbitControls
                    enableZoom={false}
                    enablePan={false}
                    autoRotate
                    autoRotateSpeed={effect.autoRotateSpeed}
                    minPolarAngle={Math.PI / 4}
                    maxPolarAngle={Math.PI / 1.8}
                    enabled={interactive}
                />

                {/* Post-processing */}
                {effect.bloomStrength > 0 && (
                    <EffectComposer>
                        <Bloom
                            luminanceThreshold={0.4}
                            luminanceSmoothing={0.9}
                            intensity={effect.bloomStrength}
                        />
                    </EffectComposer>
                )}
            </Canvas>

            {/* Rank badge */}
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
        </div>
    )
}
