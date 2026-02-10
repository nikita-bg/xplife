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
      gradient: "from-primary to-primary/60",
    },
    {
      icon: TrendingUp,
      title: t('trackProgress.title'),
      description: t('trackProgress.description'),
      gradient: "from-accent to-accent/60",
    },
    {
      icon: Brain,
      title: t('deepPersonalization.title'),
      description: t('deepPersonalization.description'),
      gradient: "from-primary to-accent",
    },
  ]

  return (
    <section id="features" className="relative py-24 px-4">
      <div className="pointer-events-none absolute right-0 top-0 h-[400px] w-[400px] rounded-full bg-accent/10 blur-[120px]" />

      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <p className="mb-3 font-display text-xs font-bold uppercase tracking-widest text-accent">
            {t('subtitle')}
          </p>
          <h2 className="text-balance font-display text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
            {t('title')} <span className="gradient-text">{t('titleHighlight')}</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground leading-relaxed">
            {t('description')}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group glass-card rounded-2xl p-8 transition-all duration-300 hover:bg-card/80 hover:shadow-xl hover:shadow-primary/5"
            >
              <div className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} text-primary-foreground`}>
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-3 font-display text-lg font-bold text-foreground">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
