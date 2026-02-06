"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowDown, Shield, Sword, Trophy } from "lucide-react"

export function Hero() {
  const [xpAnimated, setXpAnimated] = useState(false)
  const [level, setLevel] = useState(42)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setLevel(1)
    const timer = setTimeout(() => setXpAnimated(true), 500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!xpAnimated) return
    const interval = setInterval(() => {
      setLevel((prev) => {
        if (prev >= 42) return 42
        return prev + 1
      })
    }, 50)
    return () => clearInterval(interval)
  }, [xpAnimated])

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 pt-16">
      {/* Grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(139,92,246,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.5) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Gradient glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/4 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[120px]" />
      <div className="pointer-events-none absolute right-1/4 bottom-1/3 h-[300px] w-[300px] rounded-full bg-accent/15 blur-[100px]" />

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center gap-12 lg:flex-row lg:gap-16">
        {/* Text content */}
        <div className="flex flex-1 flex-col items-center text-center lg:items-start lg:text-left">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5">
            <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
            <span className="text-xs font-medium text-accent">New: AI-Powered Quests Available</span>
          </div>

          <h1 className="text-balance font-display text-5xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
            <span className="text-foreground">Level Up</span>
            <br />
            <span className="gradient-text">Your Life</span>
          </h1>

          <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">
            Turn your goals into epic quests. Earn XP. Track streaks. Become your best self.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="group relative inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-sm font-bold text-primary-foreground transition-all hover:shadow-xl hover:shadow-primary/30 animate-pulse-glow"
            >
              <Sword className="h-4 w-4" />
              Start Your Journey
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-secondary px-8 py-3.5 text-sm font-medium text-secondary-foreground transition-all hover:border-primary/50 hover:bg-secondary/80"
            >
              How It Works
              <ArrowDown className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Hero visual - RPG Character Card */}
        <div className="flex flex-1 items-center justify-center">
          <div className="animate-float w-full max-w-sm">
            <div className="glass-card gradient-border rounded-2xl p-6">
              {/* Character header */}
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-display text-sm font-bold text-foreground">HERO_USER</p>
                    <p className="text-xs text-muted-foreground">Life Optimizer</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 rounded-lg bg-accent/10 px-3 py-1">
                  <Trophy className="h-3.5 w-3.5 text-accent" />
                  <span className="font-display text-sm font-bold text-accent tabular-nums w-[70px] text-right">LVL {level}</span>
                </div>
              </div>

              {/* XP Bar */}
              <div className="mb-4">
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-muted-foreground">Experience Points</span>
                  <span className="font-display text-primary">8,500 / 10,000 XP</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-[2000ms] ease-out"
                    style={{ width: xpAnimated ? '85%' : '0%' }}
                  />
                </div>
              </div>

              {/* Quest list */}
              <div className="flex flex-col gap-2">
                <QuestItem title="Morning Meditation" xp={150} completed />
                <QuestItem title="30min Deep Work" xp={300} completed />
                <QuestItem title="Evening Review" xp={200} completed={false} />
              </div>

              {/* Stats */}
              <div className="mt-4 grid grid-cols-3 gap-2">
                <StatBox label="Streak" value="14d" />
                <StatBox label="Quests" value="247" />
                <StatBox label="Rank" value="#12" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function QuestItem({ title, xp, completed }: { title: string; xp: number; completed: boolean }) {
  return (
    <div className={`flex items-center justify-between rounded-lg px-3 py-2 ${completed ? "bg-primary/10" : "bg-muted"}`}>
      <div className="flex items-center gap-2">
        <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${completed ? "border-accent bg-accent" : "border-muted-foreground"}`}>
          {completed && (
            <svg className="h-2.5 w-2.5 text-accent-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        <span className={`text-xs ${completed ? "text-foreground" : "text-muted-foreground"}`}>{title}</span>
      </div>
      <span className="font-display text-xs text-primary">+{xp} XP</span>
    </div>
  )
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted px-3 py-2 text-center">
      <p className="font-display text-sm font-bold text-foreground">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  )
}
