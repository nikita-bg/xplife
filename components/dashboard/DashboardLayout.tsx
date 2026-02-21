'use client'

import { useState } from 'react'
import { ParticleBackground } from '@/components/ui/ParticleBackground'
import { Navbar } from '@/components/dashboard/Navbar'
import { LeftSidebar } from '@/components/dashboard/LeftSidebar'
import { RightSidebar } from '@/components/dashboard/RightSidebar'
import { CharacterCard } from '@/components/dashboard/CharacterCard'
import { BottomBar } from '@/components/dashboard/BottomBar'

export function DashboardLayout({ character, user, locale = 'en' }) {
    const [activeQuest, setActiveQuest] = useState('daily')

    return (
        /* Fixed overlay — covers the existing (app)/layout nav and container */
        <div
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 100,
                background: 'var(--bg-base)',
                overflow: 'hidden',
            }}
        >
            {/* Layer 0 — Particles */}
            <ParticleBackground />

            {/* Layer 50 — Navbar */}
            <Navbar user={user} locale={locale} />

            {/* Content zone: between navbar (64px) and bottom bar (72px) */}
            <div
                style={{
                    position: 'absolute',
                    top: '64px',
                    bottom: '72px',
                    left: 0,
                    right: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10,
                }}
            >
                {/* Left sidebar — absolute within content zone */}
                <LeftSidebar
                    activeQuest={activeQuest}
                    onQuestChange={setActiveQuest}
                />

                {/* Center — Character Card */}
                <CharacterCard character={character} user={user} />

                {/* Right sidebar — absolute within content zone */}
                <RightSidebar />
            </div>

            {/* Layer 40 — Bottom bar */}
            <BottomBar
                streak={user?.streak ?? 0}
                completed={user?.dailyCompleted ?? 0}
                total={user?.dailyTotal ?? 5}
            />
        </div>
    )
}
