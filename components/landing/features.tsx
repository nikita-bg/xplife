'use client'

import { Brain, Crosshair, TrendingUp } from "lucide-react"
import { useTranslations } from 'next-intl'

export function Features() {
  const t = useTranslations('landing.features')

  const features = [
    {
      icon: Crosshair,
      title: t('aiPowered.title'),
      description: t('aiPowered.description'),
      color: 'var(--accent-cyan)',
      glow: 'var(--accent-cyan-dim)',
    },
    {
      icon: TrendingUp,
      title: t('trackProgress.title'),
      description: t('trackProgress.description'),
      color: 'var(--accent-gold)',
      glow: 'var(--accent-gold-dim)',
    },
    {
      icon: Brain,
      title: t('deepPersonalization.title'),
      description: t('deepPersonalization.description'),
      color: 'var(--accent-purple)',
      glow: 'var(--accent-purple-dim)',
    },
  ]

  return (
    <section id="features" className="relative py-24 px-4">
      <div className="pointer-events-none absolute right-0 top-0 h-[400px] w-[400px] rounded-full blur-[120px]" style={{ background: 'var(--accent-cyan-dim)' }} />

      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <p className="mb-3 font-display text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--accent-cyan)' }}>
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

        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl p-8 transition-all duration-300 hover:translate-y-[-2px]"
              style={{
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <div
                className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl"
                style={{
                  background: feature.glow,
                  border: `1px solid ${feature.color}`,
                  boxShadow: `0 0 20px ${feature.glow}`,
                }}
              >
                <feature.icon className="h-6 w-6" style={{ color: feature.color }} />
              </div>
              <h3 className="mb-3 font-display text-lg font-bold text-foreground">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
