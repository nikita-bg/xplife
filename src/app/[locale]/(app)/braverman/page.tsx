'use client'

import React from 'react'
import BravermanTest from '@/components/braverman/BravermanTest'

export default function BravermanPage() {
    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-8">
                <h1 className="font-heading font-black text-3xl md:text-4xl uppercase tracking-tight text-white mb-2">
                    Braverman Nature Assessment
                </h1>
                <p className="font-sans text-sm text-ghost/40">
                    140 questions to discover your neurotransmitter profile. Earn 500 XP on completion.
                </p>
            </div>
            <BravermanTest />
        </div>
    )
}
