'use client'

import Image from 'next/image'
import { Shield, Crown, Gem } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface ProfileHeaderProps {
  displayName: string
  avatarUrl: string | null
  level: number
  levelTitle: string
  plan?: string
}

export function ProfileHeader({ displayName, avatarUrl, level, levelTitle, plan = 'free' }: ProfileHeaderProps) {
  const t = useTranslations('profile.planNames')
  return (
    <div className="rounded-2xl p-8 text-center" style={{
      background: 'var(--glass-bg)',
      border: '1px solid var(--glass-border)',
      backdropFilter: 'blur(12px)',
    }}>
      <div className="mb-4 flex justify-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold text-white" style={{
          background: 'var(--gradient-brand)',
          boxShadow: '0 0 30px var(--accent-purple-dim)',
        }}>
          {avatarUrl ? (
            <div className="relative h-full w-full">
              <Image src={avatarUrl} alt={displayName} fill className="rounded-full object-cover" />
            </div>
          ) : (
            displayName[0]?.toUpperCase()
          )}
        </div>
      </div>

      <h1 className="font-display text-2xl font-bold text-foreground">{displayName}</h1>

      <div className="mt-2 flex items-center justify-center gap-2">
        <div className="inline-flex items-center gap-2 rounded-lg px-3 py-1" style={{
          background: 'var(--accent-cyan-dim)',
          border: '1px solid rgba(34,211,238,0.2)',
        }}>
          <Shield className="h-4 w-4" style={{ color: 'var(--accent-cyan)' }} />
          <span className="font-display text-sm font-bold" style={{ color: 'var(--accent-cyan)' }}>
            LVL {level} &middot; {levelTitle}
          </span>
        </div>

        {plan === 'premium' && (
          <div className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1" style={{
            background: 'var(--accent-purple-dim)',
            border: '1px solid rgba(139,92,246,0.2)',
          }}>
            <Crown className="h-3.5 w-3.5" style={{ color: 'var(--accent-purple)' }} />
            <span className="font-display text-sm font-bold" style={{ color: 'var(--accent-purple)' }}>{t('premium')}</span>
          </div>
        )}
        {plan === 'lifetime' && (
          <div className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1" style={{
            background: 'var(--accent-gold-dim)',
            border: '1px solid rgba(245,158,11,0.2)',
          }}>
            <Gem className="h-3.5 w-3.5" style={{ color: 'var(--accent-gold)' }} />
            <span className="font-display text-sm font-bold" style={{ color: 'var(--accent-gold)' }}>{t('lifetime')}</span>
          </div>
        )}
      </div>
    </div>
  )
}
