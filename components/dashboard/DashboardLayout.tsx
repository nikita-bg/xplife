'use client'

import { useState } from 'react'
import { ParticleBackground } from '@/components/ui/ParticleBackground'
import { UnifiedNavbar } from '@/components/shared/UnifiedNavbar'
import { LeftSidebar } from '@/components/dashboard/LeftSidebar'
import { RightSidebar } from '@/components/dashboard/RightSidebar'
import { CharacterCard } from '@/components/dashboard/CharacterCard'
import { BottomBar } from '@/components/dashboard/BottomBar'
import { QuestsView } from '@/components/dashboard/quests-view'
import type { CharacterConfig, RankTier } from '@/components/character/CharacterConfig'
import type { Task } from '@/lib/types'

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

interface QuestsData {
    yearly: Task[]
    monthly: Task[]
    weekly: Task[]
    daily: Task[]
    plan: string
}

interface DashboardLayoutProps {
    character: CharacterConfig & { currentXP?: number; maxXP?: number; level?: number }
    user: DashboardUser
    locale?: string
    quests?: QuestsData
}

export function DashboardLayout({ character, user, locale = 'en', quests }: DashboardLayoutProps) {
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

            {/* Scrollable content area */}
            <div
                style={{
                    position: 'relative',
                    marginTop: '64px',
                    marginBottom: '72px',
                    minHeight: 'calc(100vh - 136px)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '16px',
                    zIndex: 10,
                }}
            >
                {/* Character + Sidebars row */}
                <div style={{
                    position: 'relative',
                    width: '100%',
                    maxWidth: '800px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <CharacterCard character={character} user={user} />
                    <LeftSidebar activeQuest={activeQuest} onQuestChange={setActiveQuest} />
                    <RightSidebar />
                </div>

                {/* Embedded Quests Section */}
                {quests && (
                    <div style={{
                        width: '100%',
                        maxWidth: '800px',
                        marginTop: '24px',
                    }}>
                        <QuestsView
                            yearlyQuests={quests.yearly}
                            monthlyQuests={quests.monthly}
                            weeklyQuests={quests.weekly}
                            dailyQuests={quests.daily}
                            plan={quests.plan}
                            initialTab={activeQuest}
                        />
                    </div>
                )}
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
