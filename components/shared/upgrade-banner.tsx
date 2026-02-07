'use client'

import Script from 'next/script'
import { Crown, Gem, Sparkles } from 'lucide-react'
import { PLANS } from '@/lib/constants/pricing'

interface UpgradeBannerProps {
  variant?: 'compact' | 'full'
}

export function UpgradeBanner({ variant = 'full' }: UpgradeBannerProps) {
  if (variant === 'compact') {
    return (
      <>
        <div className="glass-card rounded-2xl border border-primary/20 p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/20">
                <Crown className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">Upgrade to Premium</p>
                <p className="text-xs text-muted-foreground">Unlimited AI tasks & more</p>
              </div>
            </div>
            <a
              href={`${PLANS.premium.checkoutUrl}?embed=1`}
              className="lemonsqueezy-button shrink-0 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground transition-all hover:opacity-90"
            >
              €4.99/mo
            </a>
          </div>
        </div>
        <Script src="https://assets.lemonsqueezy.com/lemon.js" strategy="lazyOnload" />
      </>
    )
  }

  return (
    <>
      <div className="glass-card rounded-2xl border border-primary/20 p-6">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="font-display text-lg font-bold text-foreground">Upgrade Your Plan</h3>
        </div>
        <p className="mb-5 text-sm text-muted-foreground">
          Unlock unlimited AI tasks, 3 parallel goals, coaching & more.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <a
            href={`${PLANS.premium.checkoutUrl}?embed=1`}
            className="lemonsqueezy-button flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground transition-all hover:shadow-lg hover:shadow-primary/25 hover:opacity-90"
          >
            <Crown className="h-4 w-4" />
            Premium — €4.99/mo
          </a>
          <a
            href={`${PLANS.lifetime.checkoutUrl}?embed=1`}
            className="lemonsqueezy-button flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 py-3 text-sm font-bold text-black transition-all hover:shadow-lg hover:shadow-amber-500/25 hover:opacity-90"
          >
            <Gem className="h-4 w-4" />
            Lifetime — €49
          </a>
        </div>
      </div>
      <Script src="https://assets.lemonsqueezy.com/lemon.js" strategy="lazyOnload" />
    </>
  )
}
