'use client'

import Link from 'next/link'
import { Brain, ChevronRight } from 'lucide-react'

export function BravermanBanner() {
  return (
    <Link
      href="/braverman"
      className="glass-card flex items-center gap-4 rounded-2xl p-4 transition-all hover:bg-card/80 group"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
        <Brain className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-display text-sm font-bold text-foreground">
          Unlock Deep Personality Insights
        </p>
        <p className="text-xs text-muted-foreground">
          Take the Braverman Assessment for +500 XP and personalized quests
        </p>
      </div>
      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
    </Link>
  )
}
