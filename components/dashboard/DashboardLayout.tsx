'use client'

import { useState } from 'react'
import { ParticleBackground } from '@/components/ui/ParticleBackground'
import { UnifiedNavbar } from '@/components/shared/UnifiedNavbar'
import { LeftSidebar } from '@/components/dashboard/LeftSidebar'
import { RightSidebar } from '@/components/dashboard/RightSidebar'
import { CharacterCard } from '@/components/dashboard/CharacterCard'
import { BottomBar } from '@/components/dashboard/BottomBar'
import type { CharacterConfig, RankTier } from '@/components/character/CharacterConfig'

interface DashboardUser {
    avatar?: string | null
    username?: string
    totalXP?: number
    rank?: RankTier
    level?: number
    streak?: number
    dailyCompleted?: number
    dailyTotal?: number
}

interface DashboardLayoutProps {
    character: CharacterConfig & { currentXP?: number; maxXP?: number; level?: number }
    user: DashboardUser
    locale?: string
}

export function DashboardLayout({ character, user, locale = 'en' }: DashboardLayoutProps) {
    const [activeQuest, setActiveQuest] = useState('daily')

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 100,
                background: 'var(--bg-base)',
                overflow: 'hidden',
            }}
        >
            <ParticleBackground />
            <UnifiedNavbar user={user} locale={locale} />

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
                <LeftSidebar activeQuest={activeQuest} onQuestChange={setActiveQuest} />
                <CharacterCard character={character} user={user} />
                <RightSidebar />
            </div>

            <BottomBar
                streak={user?.streak ?? 0}
                completed={user?.dailyCompleted ?? 0}
                total={user?.dailyTotal ?? 5}
            />
        </div>
    )
}
