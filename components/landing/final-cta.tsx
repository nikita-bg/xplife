'use client'

import Link from "next/link"
import { Sword } from "lucide-react"
import { useTranslations, useLocale } from 'next-intl'

export function FinalCTA() {
  const t = useTranslations('landing.finalCta')
  const locale = useLocale()

  return (
    <section id="signup" className="relative py-24 px-4">
      {/* Gradient glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px]" style={{ background: 'var(--accent-purple-dim)' }} />

      <div className="relative mx-auto max-w-3xl text-center">
        <div className="rounded-3xl px-8 py-16 sm:px-16" style={{
          background: 'var(--glass-bg)',
          border: '1px solid var(--glass-border)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 0 60px var(--accent-purple-dim)',
        }}>
          {/* Top gradient line */}
          <div className="absolute top-0 left-8 right-8 h-px rounded-full" style={{ background: 'var(--gradient-brand)' }} />

          <h2 className="text-balance font-display text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
            {t('title')}{" "}
            <span style={{
              background: 'var(--gradient-brand)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>{t('titleHighlight')}</span>
          </h2>
          <p className="mx-auto mt-4 max-w-md leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {t('description')}
          </p>
          <Link
            href={`/${locale}/signup`}
            className="mt-8 inline-flex items-center gap-2 rounded-xl px-10 py-4 font-bold text-white transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            style={{
              background: 'var(--gradient-brand)',
              boxShadow: '0 0 30px var(--accent-purple-dim)',
            }}
          >
            <Sword className="h-5 w-5" />
            {t('button')}
          </Link>
          <p className="mt-4 text-xs" style={{ color: 'var(--text-muted)' }}>
            {t('disclaimer')}
          </p>
        </div>
      </div>
    </section>
  )
}
