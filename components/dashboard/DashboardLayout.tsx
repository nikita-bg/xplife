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
    weeklyCompleted?: number
    weeklyTotal?: number
    monthlyCompleted?: number
    monthlyTotal?: number
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
                overflow: 'auto',
            }}
        >
            <ParticleBackground />
            <UnifiedNavbar user={user} locale={locale} />

            {/* Center content — card fills width, sidebars float over it */}
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
                    padding: '16px',
                    overflowY: 'auto',
                    zIndex: 10,
                }}
            >
                <CharacterCard character={character} user={user} />
                <LeftSidebar activeQuest={activeQuest} onQuestChange={setActiveQuest} />
                <RightSidebar />
            </div>

            <BottomBar
                streak={user?.streak ?? 0}
                daily={{ completed: user?.dailyCompleted ?? 0, total: user?.dailyTotal ?? 5 }}
                weekly={{ completed: user?.weeklyCompleted ?? 0, total: user?.weeklyTotal ?? 3 }}
                monthly={{ completed: user?.monthlyCompleted ?? 0, total: user?.monthlyTotal ?? 1 }}
                locale={locale}
            />
        </div>
    )
}
