'use client'

import { motion } from 'framer-motion'
import { Sword, Shield, Crown } from 'lucide-react'
import { GlassButton } from '@/components/ui/GlassButton'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'

interface LeftSidebarProps {
    activeQuest?: string
    onQuestChange?: (key: string) => void
}

const BUTTONS = [
    { icon: Sword, label: 'Daily Quest', key: 'daily' },
    { icon: Shield, label: 'Weekly Quest', key: 'weekly' },
    { icon: Crown, label: 'Monthly Quest', key: 'monthly' },
]

export function LeftSidebar({ activeQuest = 'daily', onQuestChange }: LeftSidebarProps) {
    const router = useRouter()
    const locale = useLocale()

    const handleClick = (key: string) => {
        onQuestChange?.(key)
        router.push(`/${locale}/quests`)
    }

    return (
        <motion.div
            className="hidden md:flex"
            style={{
                position: 'absolute',
                left: '40px',
                top: '50%',
                transform: 'translateY(-50%)',
                flexDirection: 'column',
                gap: '16px',
                zIndex: 10,
            }}
        >
            {BUTTONS.map((btn, i) => (
                <motion.div
                    key={btn.key}
                    initial={{ x: -40, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4 + i * 0.06, duration: 0.35, ease: 'easeOut' }}
                >
                    <GlassButton
                        icon={btn.icon}
                        label={btn.label}
                        accentSide="left"
                        accentColor="purple"
                        isActive={activeQuest === btn.key}
                        onClick={() => handleClick(btn.key)}
                    />
                </motion.div>
            ))}
        </motion.div>
    )
}
