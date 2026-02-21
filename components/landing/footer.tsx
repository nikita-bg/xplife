'use client'

import Link from "next/link"
import { Github, Instagram, Twitter, Zap } from "lucide-react"
import { useTranslations, useLocale } from 'next-intl'

export function Footer() {
  const t = useTranslations('footer')
  const locale = useLocale()

  return (
    <footer className="py-12 px-4" style={{ borderTop: '1px solid var(--glass-border)' }}>
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 md:flex-row md:justify-between">
        <Link href={`/${locale}`} className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: 'var(--gradient-brand)' }}>
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="font-display text-lg font-bold tracking-wider text-foreground">
            XPLife
          </span>
        </Link>

        <nav className="flex flex-wrap items-center justify-center gap-6">
          {['about', 'blog', 'privacy', 'terms', 'contact'].map((link) => (
            <Link key={link} href={`/${locale}/${link}`} className="text-sm transition-colors hover:text-foreground" style={{ color: 'var(--text-secondary)' }}>
              {t(`links.${link}`)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          {[
            { href: "https://x.com/XPlife_App", icon: Twitter, label: "Twitter" },
            { href: "https://instagram.com/xplife.app", icon: Instagram, label: "Instagram" },
            { href: "https://github.com/nikita-bg/xplife", icon: Github, label: "GitHub" },
          ].map(({ href, icon: Icon, label }) => (
            <a key={label} href={href} className="transition-colors hover:text-foreground" style={{ color: 'var(--text-secondary)' }} aria-label={label}>
              <Icon className="h-5 w-5" />
            </a>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-6xl pt-8 text-center" style={{ borderTop: '1px solid var(--glass-border)' }}>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {t('copyright')}
        </p>
      </div>
    </footer>
  )
}
