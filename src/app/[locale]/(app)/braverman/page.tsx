'use client'

import React from 'react'
import BravermanTest from '@/components/braverman/BravermanTest'
import { useTranslations } from 'next-intl'

export default function BravermanPage() {
    const t = useTranslations('braverman.page')
    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-8">
                <h1 className="font-heading font-black text-3xl md:text-4xl uppercase tracking-tight text-white mb-2">
                    {t('title')}
                </h1>
                <p className="font-sans text-sm text-ghost/40">
                    {t('subtitle')}
                </p>
            </div>
            <BravermanTest />
        </div>
    )
}
