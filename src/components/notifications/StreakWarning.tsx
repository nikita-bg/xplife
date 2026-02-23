'use client'

import React, { useState, useEffect } from 'react'
import { AlertTriangle, X, Flame } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'

export default function StreakWarning() {
    const t = useTranslations('streakWarning')
    const [show, setShow] = useState(false)
    const [streakDays, setStreakDays] = useState(0)

    useEffect(() => {
        const check = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data: streak } = await supabase
                .from('streaks')
                .select('current_streak, last_activity_date')
                .eq('user_id', user.id)
                .single()

            if (streak && streak.current_streak > 0 && streak.last_activity_date) {
                const today = new Date().toISOString().split('T')[0]
                const last = streak.last_activity_date
                if (last !== today) {
                    // Check if it was yesterday (streak is at risk)
                    const lastDate = new Date(last + 'T00:00:00')
                    const todayDate = new Date(today + 'T00:00:00')
                    const diffDays = Math.round((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
                    if (diffDays === 1) {
                        // Streak at risk — no quests completed today
                        setStreakDays(streak.current_streak)
                        setShow(true)
                    }
                }
            }
        }
        check()
    }, [])

    if (!show) return null

    return (
        <div className="mb-4 bg-orange-500/5 border border-orange-500/20 rounded-2xl p-4 flex items-start gap-3 relative">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
                <Flame size={20} className="text-orange-400" />
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="font-heading text-sm font-bold text-orange-400 uppercase tracking-wider flex items-center gap-2">
                    <AlertTriangle size={14} /> {t('title')}
                </h4>
                <p className="font-sans text-xs text-ghost/50 mt-1">
                    {t('description', { days: streakDays })}
                </p>
            </div>
            <button
                onClick={() => setShow(false)}
                className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors shrink-0"
            >
                <X size={12} className="text-ghost/40" />
            </button>
        </div>
    )
}
