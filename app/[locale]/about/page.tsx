import Link from 'next/link'
import { setRequestLocale } from 'next-intl/server'
import { ArrowLeft, Zap } from 'lucide-react'

export default function AboutPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale)
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>

      <div className="glass-card gradient-border rounded-2xl p-8 sm:p-12">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <Zap className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">About XPLife</h1>
        </div>

        <div className="flex flex-col gap-6 text-sm leading-relaxed text-muted-foreground">
          <p>
            XPLife is a gamified life optimization app that turns your daily goals into epic quests.
            We combine RPG mechanics with AI-powered personalization to help you build better habits,
            stay consistent, and level up in real life.
          </p>
          <p>
            Our approach is based on the idea that the same psychological mechanics that make games
            addictive can be harnessed to make self-improvement engaging. Through XP points, streaks,
            levels, and leaderboards, we create the motivation loop that keeps you coming back.
          </p>
          <p>
            The Braverman personality assessment helps us understand your unique brain chemistry,
            so every quest is tailored to how YOU work best — not a generic one-size-fits-all approach.
          </p>
        </div>
      </div>
    </div>
  )
}
