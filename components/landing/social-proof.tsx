'use client'

import { Star, Users } from "lucide-react"
import { useTranslations } from 'next-intl'

export function SocialProof() {
  const t = useTranslations('landing.socialProof')

  const testimonials = [
    {
      name: t('testimonial1.name'),
      role: t('testimonial1.role'),
      avatar: "AK",
      quote: t('testimonial1.quote'),
      level: 28,
    },
    {
      name: t('testimonial2.name'),
      role: t('testimonial2.role'),
      avatar: "PM",
      quote: t('testimonial2.quote'),
      level: 35,
    },
    {
      name: t('testimonial3.name'),
      role: t('testimonial3.role'),
      avatar: "JT",
      quote: t('testimonial3.quote'),
      level: 19,
    },
  ]

  return (
    <section className="relative py-24 px-4">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5" style={{
            background: 'var(--accent-gold-dim)',
            border: '1px solid var(--accent-gold)',
          }}>
            <Users className="h-4 w-4" style={{ color: 'var(--accent-gold)' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--accent-gold)' }}>{t('badge')}</span>
          </div>
          <h2 className="text-balance font-display text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
            {t('title')}{' '}
            <span style={{
              background: 'var(--gradient-brand)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>{t('titleHighlight')}</span>
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="rounded-2xl p-6 transition-all duration-300 hover:translate-y-[-2px]"
              style={{
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <div className="mb-4 flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={`star-${testimonial.name}-${i}`} className="h-4 w-4 fill-current" style={{ color: 'var(--accent-gold)' }} />
                ))}
              </div>

              <p className="mb-6 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {`"${testimonial.quote}"`}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full font-display text-xs font-bold text-white" style={{
                    background: 'var(--gradient-brand)',
                  }}>
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{testimonial.role}</p>
                  </div>
                </div>
                <span className="rounded-lg px-2 py-1 font-display text-xs font-bold" style={{
                  color: 'var(--accent-cyan)',
                  background: 'var(--accent-cyan-dim)',
                  border: '1px solid rgba(34,211,238,0.2)',
                }}>
                  LVL {testimonial.level}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
