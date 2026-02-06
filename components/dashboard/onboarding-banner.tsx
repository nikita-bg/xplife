'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Scroll, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { OnboardingFlow } from '@/components/onboarding/onboarding-flow'

interface OnboardingBannerProps {
  userId: string
}

export function OnboardingBanner({ userId }: OnboardingBannerProps) {
  const router = useRouter()
  const [started, setStarted] = useState(false)

  const handleComplete = () => {
    router.refresh()
  }

  if (started) {
    return (
      <div className="glass-card gradient-border rounded-2xl p-6">
        <OnboardingFlow userId={userId} onComplete={handleComplete} />
      </div>
    )
  }

  return (
    <div className="glass-card gradient-border rounded-2xl p-6">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/20">
          <Scroll className="h-7 w-7 text-primary" />
        </div>
        <div className="flex-1">
          <h2 className="font-display text-lg font-bold text-foreground">
            Complete your quest setup!
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Answer a few questions so we can personalize your daily quests and XP rewards.
          </p>
        </div>
        <Button onClick={() => setStarted(true)} className="gap-2">
          Start Quiz
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
