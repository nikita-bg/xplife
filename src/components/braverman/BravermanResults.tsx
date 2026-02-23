'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import type { PersonalityType } from '@/lib/types'

interface BravermanResultsProps {
    scores: Record<PersonalityType, number>
    dominantType: string
    locale?: string
}

const NT_COLORS: Record<PersonalityType, { bar: string; text: string }> = {
    dopamine: { bar: 'bg-red-500', text: 'text-red-400' },
    acetylcholine: { bar: 'bg-blue-500', text: 'text-blue-400' },
    gaba: { bar: 'bg-green-500', text: 'text-green-400' },
    serotonin: { bar: 'bg-purple-500', text: 'text-purple-400' },
}

const NT_LABELS: Record<PersonalityType, { name: string; className: string }> = {
    dopamine: { name: 'Dopamine', className: 'The Adventurer' },
    acetylcholine: { name: 'Acetylcholine', className: 'The Thinker' },
    gaba: { name: 'GABA', className: 'The Guardian' },
    serotonin: { name: 'Serotonin', className: 'The Connector' },
}

const NT_KEYS: PersonalityType[] = ['dopamine', 'acetylcholine', 'gaba', 'serotonin']
const MAX_SCORE = 105 // 35 questions * max 3

export default function BravermanResults({ scores, dominantType, locale = 'en' }: BravermanResultsProps) {
    const router = useRouter()
    const dominant = NT_LABELS[dominantType as PersonalityType] || NT_LABELS.dopamine

    return (
        <div className="space-y-6">
            {/* Dominant Type */}
            <div className="bg-[#0C1021] rounded-[2rem] border border-white/5 p-8 text-center">
                <p className="font-data text-xs text-ghost/40 uppercase tracking-widest mb-2">Your Dominant Type:</p>
                <h2 className="font-heading text-3xl font-black text-accent uppercase tracking-tight mb-2">{dominant.className}</h2>
                <p className="font-data text-sm text-ghost/50">{dominant.name} dominant</p>
            </div>

            {/* Score Bars */}
            <div className="bg-[#0C1021] rounded-[2rem] border border-white/5 p-8">
                <h3 className="font-heading text-lg font-bold text-white uppercase tracking-wider mb-2">Deficiency Scores</h3>
                <p className="font-data text-[10px] text-ghost/40 tracking-wider mb-6">Higher scores indicate greater deficiency — your quests will target these areas.</p>
                <div className="space-y-5">
                    {NT_KEYS.map(key => {
                        const score = scores[key] ?? 0
                        const percentage = Math.round((score / MAX_SCORE) * 100)
                        const isDominant = key === dominantType
                        const colors = NT_COLORS[key]
                        const label = NT_LABELS[key]

                        return (
                            <div key={key}>
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className={`font-sans text-sm font-medium ${isDominant ? 'text-white' : 'text-ghost/60'}`}>
                                        {label.name}
                                        {isDominant && <span className="ml-2 font-data text-[10px] text-accent tracking-wider">(Dominant)</span>}
                                    </span>
                                    <span className="font-data text-xs text-ghost/40">{score} / {MAX_SCORE}</span>
                                </div>
                                <div className="h-3 overflow-hidden rounded-full bg-white/5">
                                    <div
                                        className={`h-full rounded-full transition-all duration-700 ${colors.bar}`}
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Back to Dashboard */}
            <div className="flex justify-center">
                <button
                    onClick={() => router.push(`/${locale}/dashboard`)}
                    className="btn-magnetic px-8 py-3 rounded-full bg-accent/10 border border-accent/30 text-accent font-heading text-sm uppercase tracking-wider hover:bg-accent/20 transition-all"
                >
                    <span className="btn-content">Back to Dashboard</span>
                </button>
            </div>
        </div>
    )
}
