'use client'

import { useState } from 'react'
import { CharacterCard } from '@/components/dashboard/CharacterCard'
import { LeftSidebar } from '@/components/dashboard/LeftSidebar'
import { RightSidebar } from '@/components/dashboard/RightSidebar'
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
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '16px 12px',
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
    )
}

