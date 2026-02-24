'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import {
    type CharacterClass,
    type EquipSlot,
    CLASS_STYLES,
    RANK_EFFECTS,
    getEquipVisual,
    getWeaponShape,
} from './avatar-data'
import type { RankTier } from '@/lib/xpUtils'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface EquippedItemData {
    slot: EquipSlot
    name: string
    rarity: string
}

interface VoxelAvatarProps {
    characterClass?: CharacterClass
    rank?: RankTier
    equipped?: EquippedItemData[]
}

// ─── Helper: Voxel Box ──────────────────────────────────────────────────────

function VoxelBox({
    position,
    size,
    color,
    emissive = '#000000',
    emissiveIntensity = 0,
    opacity = 1,
}: {
    position: [number, number, number]
    size: [number, number, number]
    color: string
    emissive?: string
    emissiveIntensity?: number
    opacity?: number
}) {
    return (
        <mesh position={position}>
            <boxGeometry args={size} />
            <meshStandardMaterial
                color={color}
                emissive={emissive}
                emissiveIntensity={emissiveIntensity}
                transparent={opacity < 1}
                opacity={opacity}
                roughness={0.6}
                metalness={0.2}
            />
        </mesh>
    )
}

// ─── Weapon Meshes ──────────────────────────────────────────────────────────

function Weapon({ itemName, rarity }: { itemName: string; rarity: string }) {
    const shape = getWeaponShape(itemName)
    const vis = getEquipVisual(rarity)

    if (shape === 'staff') {
        return (
            <group position={[0.55, 0.2, 0]}>
                {/* Staff pole */}
                <VoxelBox position={[0, 0, 0]} size={[0.06, 1.2, 0.06]} color="#8B6914" />
                {/* Crystal top */}
                <mesh position={[0, 0.65, 0]}>
                    <octahedronGeometry args={[0.1]} />
                    <meshStandardMaterial
                        color={vis.color}
                        emissive={vis.emissive}
                        emissiveIntensity={vis.emissiveIntensity + 0.5}
                        roughness={0.1}
                        metalness={0.8}
                    />
                </mesh>
            </group>
        )
    }

    if (shape === 'hammer') {
        return (
            <group position={[0.55, 0.15, 0]}>
                {/* Handle */}
                <VoxelBox position={[0, 0, 0]} size={[0.06, 0.8, 0.06]} color="#8B6914" />
                {/* Head */}
                <VoxelBox position={[0, 0.45, 0]} size={[0.22, 0.15, 0.15]}
                    color={vis.color} emissive={vis.emissive} emissiveIntensity={vis.emissiveIntensity} />
            </group>
        )
    }

    // Default: sword
    return (
        <group position={[0.55, 0.1, 0]} rotation={[0, 0, -0.15]}>
            {/* Handle */}
            <VoxelBox position={[0, -0.1, 0]} size={[0.04, 0.2, 0.06]} color="#8B6914" />
            {/* Guard */}
            <VoxelBox position={[0, 0.02, 0]} size={[0.18, 0.04, 0.04]} color={vis.color} />
            {/* Blade */}
            <VoxelBox position={[0, 0.35, 0]} size={[0.06, 0.6, 0.02]}
                color={vis.color} emissive={vis.emissive} emissiveIntensity={vis.emissiveIntensity} />
        </group>
    )
}

// ─── Rank Aura ──────────────────────────────────────────────────────────────

function RankAura({ rank }: { rank: RankTier }) {
    const ref = useRef<THREE.Mesh>(null)
    const effect = RANK_EFFECTS[rank]

    useFrame(({ clock }) => {
        if (ref.current) {
            const s = 1 + Math.sin(clock.elapsedTime * 2) * 0.05
            ref.current.scale.set(s, s, s)
            ref.current.rotation.y = clock.elapsedTime * 0.5
        }
    })

    if (effect.glowIntensity <= 0) return null

    return (
        <mesh ref={ref} position={[0, 0.2, 0]}>
            <sphereGeometry args={[1.1, 16, 16]} />
            <meshStandardMaterial
                color={effect.auraColor}
                emissive={effect.auraColor}
                emissiveIntensity={effect.glowIntensity}
                transparent
                opacity={effect.glowIntensity * 0.15}
                side={THREE.BackSide}
            />
        </mesh>
    )
}

// ─── Rank Particles ─────────────────────────────────────────────────────────

function RankParticles({ rank }: { rank: RankTier }) {
    const ref = useRef<THREE.Points>(null)
    const effect = RANK_EFFECTS[rank]

    const { positions, colors } = useMemo(() => {
        const count = 30
        const pos = new Float32Array(count * 3)
        const col = new Float32Array(count * 3)
        const c = new THREE.Color(effect.auraColor)

        for (let i = 0; i < count; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 2
            pos[i * 3 + 1] = Math.random() * 2.5 - 0.5
            pos[i * 3 + 2] = (Math.random() - 0.5) * 2
            col[i * 3] = c.r
            col[i * 3 + 1] = c.g
            col[i * 3 + 2] = c.b
        }
        return { positions: pos, colors: col }
    }, [effect.auraColor])

    useFrame(({ clock }) => {
        if (ref.current) {
            const posAttr = ref.current.geometry.attributes.position
            for (let i = 0; i < posAttr.count; i++) {
                let y = posAttr.getY(i)
                y += 0.005
                if (y > 2.5) y = -0.5
                posAttr.setY(i, y)
            }
            posAttr.needsUpdate = true
            ref.current.rotation.y = clock.elapsedTime * 0.3
        }
    })

    if (!effect.hasParticles) return null

    return (
        <points ref={ref}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    args={[positions, 3]}
                />
                <bufferAttribute
                    attach="attributes-color"
                    args={[colors, 3]}
                />
            </bufferGeometry>
            <pointsMaterial size={0.04} vertexColors transparent opacity={0.6} sizeAttenuation />
        </points>
    )
}

// ─── Main Avatar ────────────────────────────────────────────────────────────

export default function VoxelAvatar({
    characterClass = 'Adventurer',
    rank = 'iron',
    equipped = [],
}: VoxelAvatarProps) {
    const groupRef = useRef<THREE.Group>(null)
    const style = CLASS_STYLES[characterClass]
    const { headScale, torsoWidth, limbWidth } = style.proportions

    // Find equipped items by slot
    const equippedMap = useMemo(() => {
        const map: Partial<Record<EquipSlot, EquippedItemData>> = {}
        for (const item of equipped) {
            map[item.slot] = item
        }
        return map
    }, [equipped])

    const headItem = equippedMap.Head
    const bodyItem = equippedMap.Body
    const armsItem = equippedMap.Arms
    const legsItem = equippedMap.Legs
    const weaponItem = equippedMap.Weapon

    const headVis = headItem ? getEquipVisual(headItem.rarity) : null
    const bodyVis = bodyItem ? getEquipVisual(bodyItem.rarity) : null
    const armsVis = armsItem ? getEquipVisual(armsItem.rarity) : null
    const legsVis = legsItem ? getEquipVisual(legsItem.rarity) : null

    return (
        <group ref={groupRef} position={[0, -0.8, 0]}>
            {/* ── Head ── */}
            <group position={[0, 1.55, 0]} scale={[headScale, headScale, headScale]}>
                {/* Base head */}
                <VoxelBox position={[0, 0, 0]} size={[0.4, 0.45, 0.4]} color={style.skinTone} />
                {/* Eyes */}
                <VoxelBox position={[-0.1, 0.02, 0.21]} size={[0.07, 0.05, 0.02]} color="#1a1a2e" />
                <VoxelBox position={[0.1, 0.02, 0.21]} size={[0.07, 0.05, 0.02]} color="#1a1a2e" />
                {/* Hair */}
                <VoxelBox position={[0, 0.2, -0.02]} size={[0.44, 0.12, 0.44]} color="#4A3728" />
                <VoxelBox position={[0, 0.1, -0.22]} size={[0.42, 0.3, 0.06]} color="#4A3728" />

                {/* Helmet overlay */}
                {headVis && (
                    <VoxelBox position={[0, 0.08, 0]} size={[0.48, 0.38, 0.48]}
                        color={headVis.color} emissive={headVis.emissive}
                        emissiveIntensity={headVis.emissiveIntensity} opacity={0.85} />
                )}
            </group>

            {/* ── Neck ── */}
            <VoxelBox position={[0, 1.28, 0]} size={[0.15, 0.08, 0.15]} color={style.skinTone} />

            {/* ── Torso ── */}
            <group>
                {/* Base torso */}
                <VoxelBox position={[0, 0.9, 0]}
                    size={[0.5 * torsoWidth, 0.65, 0.3]}
                    color={style.bodyColor} />
                {/* Accent stripe */}
                <VoxelBox position={[0, 0.9, 0.155]}
                    size={[0.08, 0.6, 0.01]}
                    color={style.accentColor}
                    emissive={style.accentColor}
                    emissiveIntensity={0.3} />

                {/* Armor overlay */}
                {bodyVis && (
                    <VoxelBox position={[0, 0.9, 0]} size={[0.55 * torsoWidth, 0.6, 0.35]}
                        color={bodyVis.color} emissive={bodyVis.emissive}
                        emissiveIntensity={bodyVis.emissiveIntensity} opacity={0.8} />
                )}
            </group>

            {/* ── Arms ── */}
            {/* Left arm */}
            <group>
                <VoxelBox position={[-0.35 * torsoWidth, 1.0, 0]}
                    size={[0.15 * limbWidth, 0.25, 0.18]}
                    color={style.bodyColor} />
                <VoxelBox position={[-0.35 * torsoWidth, 0.7, 0]}
                    size={[0.13 * limbWidth, 0.35, 0.15]}
                    color={style.skinTone} />
                {armsVis && (
                    <VoxelBox position={[-0.35 * torsoWidth, 0.72, 0]}
                        size={[0.17 * limbWidth, 0.2, 0.19]}
                        color={armsVis.color} emissive={armsVis.emissive}
                        emissiveIntensity={armsVis.emissiveIntensity} opacity={0.85} />
                )}
            </group>
            {/* Right arm */}
            <group>
                <VoxelBox position={[0.35 * torsoWidth, 1.0, 0]}
                    size={[0.15 * limbWidth, 0.25, 0.18]}
                    color={style.bodyColor} />
                <VoxelBox position={[0.35 * torsoWidth, 0.7, 0]}
                    size={[0.13 * limbWidth, 0.35, 0.15]}
                    color={style.skinTone} />
                {armsVis && (
                    <VoxelBox position={[0.35 * torsoWidth, 0.72, 0]}
                        size={[0.17 * limbWidth, 0.2, 0.19]}
                        color={armsVis.color} emissive={armsVis.emissive}
                        emissiveIntensity={armsVis.emissiveIntensity} opacity={0.85} />
                )}
            </group>

            {/* ── Legs ── */}
            {/* Left leg */}
            <group>
                <VoxelBox position={[-0.12, 0.35, 0]} size={[0.18 * limbWidth, 0.5, 0.2]}
                    color={legsVis ? legsVis.color : '#1a1a2e'} />
                {/* Boot */}
                <VoxelBox position={[-0.12, 0.07, 0.04]}
                    size={[0.2 * limbWidth, 0.14, 0.28]}
                    color={legsVis ? legsVis.color : '#3a3a4e'}
                    emissive={legsVis ? legsVis.emissive : '#000000'}
                    emissiveIntensity={legsVis ? legsVis.emissiveIntensity : 0} />
            </group>
            {/* Right leg */}
            <group>
                <VoxelBox position={[0.12, 0.35, 0]} size={[0.18 * limbWidth, 0.5, 0.2]}
                    color={legsVis ? legsVis.color : '#1a1a2e'} />
                {/* Boot */}
                <VoxelBox position={[0.12, 0.07, 0.04]}
                    size={[0.2 * limbWidth, 0.14, 0.28]}
                    color={legsVis ? legsVis.color : '#3a3a4e'}
                    emissive={legsVis ? legsVis.emissive : '#000000'}
                    emissiveIntensity={legsVis ? legsVis.emissiveIntensity : 0} />
            </group>

            {/* ── Weapon ── */}
            {weaponItem && (
                <Weapon itemName={weaponItem.name} rarity={weaponItem.rarity} />
            )}

            {/* ── Ground Shadow ── */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
                <circleGeometry args={[0.4, 32]} />
                <meshStandardMaterial color="#000000" transparent opacity={0.3} />
            </mesh>

            {/* ── Rank Effects ── */}
            <RankAura rank={rank} />
            <RankParticles rank={rank} />
        </group>
    )
}
