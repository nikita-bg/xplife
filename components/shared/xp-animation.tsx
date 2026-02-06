'use client'

import { useEffect, useState } from 'react'
import { Zap } from 'lucide-react'

interface XpAnimationProps {
  xp: number
}

export function XpAnimation({ xp }: XpAnimationProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="animate-bounce flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 shadow-2xl shadow-primary/30">
        <Zap className="h-6 w-6 text-primary-foreground" />
        <span className="font-display text-2xl font-bold text-primary-foreground">+{xp} XP</span>
      </div>
    </div>
  )
}
