'use client'

import { motion } from 'framer-motion'
import { Brain, CalendarDays, BookOpen } from 'lucide-react'
import { GlassButton } from '@/components/ui/GlassButton'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'

const BUTTONS = [
    { icon: Brain, label: 'Braverman Test', key: 'braverman', href: '/braverman' },
    { icon: CalendarDays, label: 'Weekly Review', key: 'review', href: '/quests' },
    { icon: BookOpen, label: 'Class Guide', key: 'guide', href: '/profile' },
]

export function RightSidebar() {
    const router = useRouter()
    const locale = useLocale()

    return (
        <motion.div
            className="hidden md:flex"
            style={{
                position: 'absolute',
                right: '40px',
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
                    initial={{ x: 40, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4 + i * 0.06, duration: 0.35, ease: 'easeOut' }}
                >
                    <GlassButton
                        icon={btn.icon}
                        label={btn.label}
                        accentSide="right"
                        accentColor="cyan"
                        onClick={() => router.push(`/${locale}${btn.href}`)}
                    />
                </motion.div>
            ))}
        </motion.div>
    )
}
