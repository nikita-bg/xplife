'use client'

import { motion } from 'framer-motion'
import { Sword, Shield, Crown } from 'lucide-react'
import { GlassButton } from '@/components/ui/GlassButton'

const BUTTONS = [
    { icon: Sword, label: 'Daily Quest', key: 'daily' },
    { icon: Shield, label: 'Weekly Quest', key: 'weekly' },
    { icon: Crown, label: 'Monthly Quest', key: 'monthly' },
]

export function LeftSidebar({ activeQuest = 'daily', onQuestChange }) {
    return (
        <motion.div
            style={{
                position: 'absolute',
                left: '40px',
                top: '50%',
                transform: 'translateY(-50%)',
                display: 'flex',
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
                        onClick={() => onQuestChange?.(btn.key)}
                    />
                </motion.div>
            ))}
        </motion.div>
    )
}
