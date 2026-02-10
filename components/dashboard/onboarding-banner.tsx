'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Scroll, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { OnboardingFlow } from '@/components/onboarding/onboarding-flow'
import { useTranslations } from 'next-intl'

interface OnboardingBannerProps {
  userId: string
}

export function OnboardingBanner({ userId }: OnboardingBannerProps) {
  const t = useTranslations('dashboard.banners.onboarding')
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
            {t('title')}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('description')}
          </p>
        </div>
        <Button onClick={() => setStarted(true)} className="gap-2">
          {t('startQuiz')}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
