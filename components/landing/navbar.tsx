"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useTranslations, useLocale } from "next-intl"
import { Menu, X } from "lucide-react"
import { LanguageSwitcher } from "@/components/i18n/language-switcher"

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const locale = useLocale()
  const t = useTranslations('navbar')

  return (
    <nav className="fixed top-0 left-0 right-0 z-50" style={{
      background: 'var(--glass-bg)',
      borderBottom: '1px solid var(--glass-border)',
      backdropFilter: 'blur(20px)',
    }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href={`/${locale}`} className="flex items-center gap-2">
            <Image src="/logo.svg" alt="XPLife" width={36} height={36} className="rounded-full" />
            <span className="font-display text-lg font-bold tracking-wider text-foreground">
              XPLife
            </span>
          </Link>

          <div className="hidden items-center gap-6 md:flex">
            <a href="#features" className="text-sm transition-colors hover:text-foreground" style={{ color: 'var(--text-secondary)' }}>
              {t('features')}
            </a>
            <a href="#how-it-works" className="text-sm transition-colors hover:text-foreground" style={{ color: 'var(--text-secondary)' }}>
              {t('howItWorks')}
            </a>
            <a href="#pricing" className="text-sm transition-colors hover:text-foreground" style={{ color: 'var(--text-secondary)' }}>
              {t('pricing')}
            </a>
            <LanguageSwitcher />
            <Link href={`/${locale}/login`} className="text-sm transition-colors hover:text-foreground" style={{ color: 'var(--text-secondary)' }}>
              {t('login')}
            </Link>
            <Link
              href={`/${locale}/signup`}
              className="rounded-lg px-5 py-2 text-sm font-semibold text-white transition-all hover:shadow-lg hover:scale-105"
              style={{
                background: 'var(--gradient-brand)',
                boxShadow: '0 0 20px var(--accent-purple-dim)',
              }}
            >
              {t('signup')}
            </Link>
          </div>

          <button
            type="button"
            className="md:hidden text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden" style={{
          borderTop: '1px solid var(--glass-border)',
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(20px)',
        }}>
          <div className="flex flex-col gap-4 px-4 py-6">
            <a href="#features" className="text-sm transition-colors hover:text-foreground" style={{ color: 'var(--text-secondary)' }} onClick={() => setMobileOpen(false)}>
              {t('features')}
            </a>
            <a href="#how-it-works" className="text-sm transition-colors hover:text-foreground" style={{ color: 'var(--text-secondary)' }} onClick={() => setMobileOpen(false)}>
              {t('howItWorks')}
            </a>
            <a href="#pricing" className="text-sm transition-colors hover:text-foreground" style={{ color: 'var(--text-secondary)' }} onClick={() => setMobileOpen(false)}>
              {t('pricing')}
            </a>
            <div className="py-2">
              <LanguageSwitcher />
            </div>
            <Link href={`/${locale}/login`} className="text-sm transition-colors hover:text-foreground" style={{ color: 'var(--text-secondary)' }} onClick={() => setMobileOpen(false)}>
              {t('login')}
            </Link>
            <Link
              href={`/${locale}/signup`}
              className="rounded-lg px-5 py-2.5 text-center text-sm font-semibold text-white transition-all"
              style={{ background: 'var(--gradient-brand)' }}
              onClick={() => setMobileOpen(false)}
            >
              {t('signup')}
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
