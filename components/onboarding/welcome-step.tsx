'use client'

import { Sword, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface WelcomeStepProps {
  onContinue: () => void
}

export function WelcomeStep({ onContinue }: WelcomeStepProps) {
  return (
    <div className="glass-card gradient-border rounded-2xl p-8 text-center sm:p-12">
      <div className="mb-6 flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary animate-pulse-glow">
          <Zap className="h-9 w-9 text-primary-foreground" />
        </div>
      </div>

      <h1 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
        Welcome to <span className="gradient-text">XPLife</span>
      </h1>

      <p className="mx-auto mt-4 max-w-md text-muted-foreground leading-relaxed">
        {"You're about to embark on an epic quest to become your best self. Let's start by learning about you so we can craft the perfect challenges."}
      </p>

      <div className="mt-8 flex flex-col items-center gap-4">
        <Button
          onClick={onContinue}
          size="lg"
          className="gap-2 px-8"
        >
          <Sword className="h-4 w-4" />
          Begin Quest
        </Button>
        <p className="text-xs text-muted-foreground">Takes about 2 minutes</p>
      </div>
    </div>
  )
}
