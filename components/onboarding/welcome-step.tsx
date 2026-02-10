'use client'

import { useTranslations } from 'next-intl'
import { Sword, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface WelcomeStepProps {
  onContinue: () => void
}

export function WelcomeStep({ onContinue }: WelcomeStepProps) {
  const t = useTranslations('onboarding')

  return (
    <div className="glass-card gradient-border rounded-2xl p-8 text-center sm:p-12">
      <div className="mb-6 flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary animate-pulse-glow">
          <Zap className="h-9 w-9 text-primary-foreground" />
        </div>
      </div>

      <h1 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
        {t('welcome.title')} <span className="gradient-text">XPLife</span>
      </h1>

      <p className="mx-auto mt-4 max-w-md text-muted-foreground leading-relaxed">
        {t('welcome.description')}
      </p>

      <div className="mt-8 flex flex-col items-center gap-4">
        <Button
          onClick={onContinue}
          size="lg"
          className="gap-2 px-8"
        >
          <Sword className="h-4 w-4" />
          {t('welcome.beginQuest')}
        </Button>
        <p className="text-xs text-muted-foreground">{t('welcome.duration')}</p>
      </div>
    </div>
  )
}
