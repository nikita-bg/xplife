"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useTranslations, useLocale } from "next-intl"
import { ArrowDown, Sword, Zap, Flame, Target, Crown, Sparkles } from "lucide-react"

// ─── Floating particle system ────────────────────────────────────────────────

function FloatingParticles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: `${2 + Math.random() * 4}px`,
            height: `${2 + Math.random() * 4}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: ['var(--accent-cyan)', 'var(--accent-purple)', 'var(--accent-gold)', 'var(--class-adventurer)'][Math.floor(Math.random() * 4)],
            opacity: 0.3 + Math.random() * 0.4,
            animation: `particle-float ${8 + Math.random() * 12}s ease-in-out infinite`,
            animationDelay: `${Math.random() * -20}s`,
          }}
        />
      ))}
    </div>
  )
}

// ─── Animated counter ───────────────────────────────────────────────────────

function AnimatedNumber({ target, duration = 2000 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let start = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setCount(target); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration])
  return <>{count.toLocaleString()}</>
}

// ─── Main Hero ──────────────────────────────────────────────────────────────

export function Hero() {
  const locale = useLocale()
  const t = useTranslations('hero')
  const [xpAnimated, setXpAnimated] = useState(false)
  const [level, setLevel] = useState(1)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const timer = setTimeout(() => setXpAnimated(true), 600)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!xpAnimated) return
    const interval = setInterval(() => {
      setLevel((prev) => prev >= 42 ? 42 : prev + 1)
    }, 50)
    return () => clearInterval(interval)
  }, [xpAnimated])

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 pt-24 sm:pt-16">
      {/* Animated mesh gradient background */}
      <div className="pointer-events-none absolute inset-0" style={{
        background: `
          radial-gradient(ellipse 80% 50% at 20% 40%, var(--accent-purple-dim) 0%, transparent 60%),
          radial-gradient(ellipse 60% 40% at 80% 30%, var(--accent-cyan-dim) 0%, transparent 50%),
          radial-gradient(ellipse 50% 60% at 50% 80%, var(--class-adventurer-dim) 0%, transparent 50%)
        `,
      }} />

      {/* Subtle grid */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(rgba(139,92,246,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.5) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />

      <FloatingParticles />

      <div className={`relative z-10 mx-auto flex max-w-6xl flex-col items-center gap-12 lg:flex-row lg:gap-16 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>

        {/* ── Left: Text Content ─────────────────────────────── */}
        <div className="flex flex-1 flex-col items-center text-center lg:items-start lg:text-left">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5" style={{
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            backdropFilter: 'blur(12px)',
          }}>
            <Sparkles className="h-3 w-3" style={{ color: 'var(--accent-gold)' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--accent-gold)' }}>
              {t('badge')}
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-balance font-display text-5xl font-bold leading-[1.1] sm:text-6xl lg:text-7xl">
            <span className="text-foreground">{t('title')}</span>
            <br />
            <span style={{
              background: 'var(--gradient-brand)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              {t('titleHighlight')}
            </span>
          </h1>

          <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">
            {t('description')}
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link
              href={`/${locale}/signup`}
              className="group relative inline-flex items-center justify-center gap-2 rounded-xl px-8 py-3.5 text-sm font-bold text-white transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              style={{
                background: 'var(--gradient-brand)',
                boxShadow: '0 0 30px var(--accent-purple-dim)',
              }}
            >
              <Sword className="h-4 w-4 transition-transform group-hover:rotate-12" />
              {t('cta')}
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center gap-2 rounded-xl px-8 py-3.5 text-sm font-medium transition-all hover:border-primary/50"
              style={{
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                color: 'var(--text-secondary)',
                backdropFilter: 'blur(12px)',
              }}
            >
              {t('ctaSecondary')}
              <ArrowDown className="h-4 w-4 animate-bounce" />
            </a>
          </div>

          {/* Social proof stats */}
          <div className="mt-10 flex items-center gap-8">
            <div>
              <div className="font-display text-2xl font-bold text-foreground">
                <AnimatedNumber target={5000} />+
              </div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Active Players</div>
            </div>
            <div className="h-8 w-px" style={{ background: 'var(--glass-border)' }} />
            <div>
              <div className="font-display text-2xl font-bold" style={{ color: 'var(--accent-gold)' }}>
                <AnimatedNumber target={150000} />+
              </div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Quests Completed</div>
            </div>
            <div className="h-8 w-px hidden sm:block" style={{ background: 'var(--glass-border)' }} />
            <div className="hidden sm:block">
              <div className="font-display text-2xl font-bold" style={{ color: 'var(--accent-cyan)' }}>
                4.9★
              </div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>User Rating</div>
            </div>
          </div>
        </div>

        {/* ── Right: Hero Card ───────────────────────────────── */}
        <div className="flex flex-1 items-center justify-center">
          <div className="animate-float w-full max-w-sm">
            <div className="rounded-2xl p-6 relative overflow-hidden" style={{
              background: 'var(--glass-bg)',
              border: '1px solid var(--glass-border)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 0 60px var(--accent-purple-dim), inset 0 1px 0 rgba(255,255,255,0.05)',
            }}>
              {/* Gradient shine */}
              <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'var(--gradient-brand)' }} />

              {/* Character header */}
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full" style={{
                    background: 'linear-gradient(135deg, var(--class-adventurer), var(--accent-gold))',
                    boxShadow: '0 0 20px var(--class-adventurer-dim)',
                  }}>
                    <Crown className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-display text-sm font-bold text-foreground">{t('heroUser')}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('heroRole')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 rounded-lg px-3 py-1" style={{
                  background: 'var(--accent-gold-dim)',
                  border: '1px solid var(--accent-gold)',
                }}>
                  <Zap className="h-3.5 w-3.5" style={{ color: 'var(--accent-gold)' }} />
                  <span className="font-display text-sm font-bold tabular-nums w-[70px] text-right" style={{ color: 'var(--accent-gold)' }}>
                    {t('level', { level })}
                  </span>
                </div>
              </div>

              {/* XP Bar */}
              <div className="mb-4">
                <div className="mb-1 flex justify-between text-xs">
                  <span style={{ color: 'var(--text-muted)' }}>{t('xpLabel')}</span>
                  <span className="font-display" style={{ color: 'var(--accent-cyan)' }}>
                    {t('xpProgress', { current: '8,500', total: '10,000' })}
                  </span>
                </div>
                <div className="h-3 overflow-hidden rounded-full" style={{ background: 'var(--bg-surface)' }}>
                  <div
                    className="h-full rounded-full transition-all ease-out"
                    style={{
                      transitionDuration: '2000ms',
                      width: xpAnimated ? '85%' : '0%',
                      background: 'var(--gradient-brand)',
                      boxShadow: xpAnimated ? '0 0 12px var(--accent-purple-dim)' : 'none',
                    }}
                  />
                </div>
              </div>

              {/* Quest list */}
              <div className="flex flex-col gap-2">
                <QuestItem title={t('questMorningMeditation')} xp={150} completed />
                <QuestItem title={t('questDeepWork')} xp={300} completed />
                <QuestItem title={t('questEveningReview')} xp={200} completed={false} />
              </div>

              {/* Stats */}
              <div className="mt-4 grid grid-cols-3 gap-2">
                <StatBox label={t('statStreak')} value="14d" icon={<Flame className="h-3 w-3 text-orange-400" />} />
                <StatBox label={t('statQuests')} value="247" icon={<Target className="h-3 w-3" style={{ color: 'var(--accent-cyan)' }} />} />
                <StatBox label={t('statRank')} value="#12" icon={<Crown className="h-3 w-3" style={{ color: 'var(--accent-gold)' }} />} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function QuestItem({ title, xp, completed }: { title: string; xp: number; completed: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-lg px-3 py-2" style={{
      background: completed ? 'var(--accent-cyan-dim)' : 'var(--bg-surface)',
      border: `1px solid ${completed ? 'rgba(34,211,238,0.15)' : 'transparent'}`,
    }}>
      <div className="flex items-center gap-2">
        <div className="h-4 w-4 rounded-full border-2 flex items-center justify-center" style={{
          borderColor: completed ? 'var(--accent-cyan)' : 'var(--text-muted)',
          background: completed ? 'var(--accent-cyan)' : 'transparent',
        }}>
          {completed && (
            <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        <span className={`text-xs ${completed ? "text-foreground" : "text-muted-foreground"}`}>{title}</span>
      </div>
      <span className="font-display text-xs" style={{ color: 'var(--accent-cyan)' }}>+{xp} XP</span>
    </div>
  )
}

function StatBox({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-lg px-3 py-2 text-center" style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--glass-border)',
    }}>
      <div className="flex items-center justify-center gap-1 mb-0.5">
        {icon}
        <p className="font-display text-sm font-bold text-foreground">{value}</p>
      </div>
      <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{label}</p>
    </div>
  )
}
