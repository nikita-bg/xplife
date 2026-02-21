'use client'

import { ArrowRight, ClipboardList, Sparkles, Trophy } from "lucide-react"
import { useTranslations } from 'next-intl'

export function HowItWorks() {
  const t = useTranslations('landing.howItWorks')

  const steps = [
    {
      icon: ClipboardList,
      step: t('step1.step'),
      title: t('step1.title'),
      description: t('step1.description'),
      color: 'var(--accent-cyan)',
    },
    {
      icon: Sparkles,
      step: t('step2.step'),
      title: t('step2.title'),
      description: t('step2.description'),
      color: 'var(--accent-purple)',
    },
    {
      icon: Trophy,
      step: t('step3.step'),
      title: t('step3.title'),
      description: t('step3.description'),
      color: 'var(--accent-gold)',
    },
  ]

  return (
    <section id="how-it-works" className="relative py-24 px-4">
      <div className="pointer-events-none absolute left-0 top-1/2 h-[400px] w-[400px] -translate-y-1/2 rounded-full blur-[120px]" style={{ background: 'var(--accent-purple-dim)' }} />

      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <p className="mb-3 font-display text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--accent-purple)' }}>
            {t('subtitle')}
          </p>
          <h2 className="text-balance font-display text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
            {t('title')}{' '}
            <span style={{
              background: 'var(--gradient-brand)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>{t('titleHighlight')}</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {t('description')}
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((item, index) => (
            <div key={item.title} className="relative flex flex-col items-center text-center">
              {/* Connector arrow */}
              {index < steps.length - 1 && (
                <div className="pointer-events-none absolute right-0 top-12 hidden translate-x-1/2 md:block">
                  <ArrowRight className="h-6 w-6" style={{ color: 'var(--text-muted)' }} />
                </div>
              )}

              {/* Step icon */}
              <div className="mb-6 relative">
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl" style={{
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--glass-border)',
                  backdropFilter: 'blur(12px)',
                  boxShadow: `0 0 30px ${item.color}15`,
                }}>
                  <item.icon className="h-10 w-10" style={{ color: item.color }} />
                </div>
                <span className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full font-display text-xs font-bold text-white" style={{
                  background: 'var(--gradient-brand)',
                }}>
                  {item.step}
                </span>
              </div>

              <h3 className="mb-3 font-display text-lg font-bold text-foreground">
                {item.title}
              </h3>
              <p className="max-w-xs text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
