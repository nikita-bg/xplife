'use client'

import { motion } from 'framer-motion'
import { Brain, CalendarDays, BookOpen } from 'lucide-react'
import { GlassButton } from '@/components/ui/GlassButton'

const BUTTONS = [
    { icon: Brain, label: 'Braverman Test', key: 'braverman', href: '/braverman' },
    { icon: CalendarDays, label: 'Weekly Review', key: 'review' },
    { icon: BookOpen, label: 'Class Guide', key: 'guide' },
]

export function RightSidebar({ onToolSelect }) {
    return (
        <motion.div
            style={{
                position: 'absolute',
                right: '40px',
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
                    initial={{ x: 40, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4 + i * 0.06, duration: 0.35, ease: 'easeOut' }}
                >
                    <GlassButton
                        icon={btn.icon}
                        label={btn.label}
                        accentSide="right"
                        accentColor="cyan"
                        onClick={() => onToolSelect?.(btn.key)}
                    />
                </motion.div>
            ))}
        </motion.div>
    )
}
