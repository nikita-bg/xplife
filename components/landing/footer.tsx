'use client'

import Link from "next/link"
import { Github, Instagram, Twitter, Zap } from "lucide-react"
import { useTranslations, useLocale } from 'next-intl'

export function Footer() {
  const t = useTranslations('footer')
  const locale = useLocale()

  return (
    <footer className="border-t border-border/50 py-12 px-4">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 md:flex-row md:justify-between">
        <Link href={`/${locale}`} className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Zap className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-bold tracking-wider text-foreground">
            XPLife
          </span>
        </Link>

        <nav className="flex flex-wrap items-center justify-center gap-6">
          <Link href={`/${locale}/about`} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            {t('links.about')}
          </Link>
          <Link href={`/${locale}/privacy`} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            {t('links.privacy')}
          </Link>
          <Link href={`/${locale}/terms`} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            {t('links.terms')}
          </Link>
          <Link href={`/${locale}/contact`} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            {t('links.contact')}
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <a href="#" className="text-muted-foreground transition-colors hover:text-foreground" aria-label="Twitter">
            <Twitter className="h-5 w-5" />
          </a>
          <a href="#" className="text-muted-foreground transition-colors hover:text-foreground" aria-label="Instagram">
            <Instagram className="h-5 w-5" />
          </a>
          <a href="#" className="text-muted-foreground transition-colors hover:text-foreground" aria-label="GitHub">
            <Github className="h-5 w-5" />
          </a>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-6xl border-t border-border/50 pt-8 text-center">
        <p className="text-xs text-muted-foreground">
          {t('copyright')}
        </p>
      </div>
    </footer>
  )
}
