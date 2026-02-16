import React from 'react';
import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, type Locale } from '@/i18n';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });

  return {
    title: t('title'),
    description: t('description'),
    applicationName: 'XPLife',
    authors: [{ name: 'XPLife Team' }],
    keywords: ['gamification', 'productivity', 'RPG per life', 'ADHD tools', 'habit tracker', 'life rpg', 'креативност', 'продуктивност', 'навици'],
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: `https://xplife.app/${locale}`,
      siteName: 'XPLife',
      locale: locale,
      type: 'website',
      images: [
        {
          url: 'https://xplife.app/og-image.png',
          width: 1200,
          height: 630,
          alt: t('title'),
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
      images: ['https://xplife.app/og-image.png'],
      creator: '@xplifeapp',
    },
    manifest: '/manifest.json',
    icons: {
      icon: [
        { url: '/favicon.svg', type: 'image/svg+xml' },
        { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
        { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      ],
      apple: '/apple-touch-icon.png',
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: 'black-translucent',
      title: 'XPLife',
    },
    alternates: {
      canonical: `https://xplife.app/${locale}`,
      languages: {
        'en': 'https://xplife.app/en',
        'bg': 'https://xplife.app/bg',
        'es': 'https://xplife.app/es',
        'zh': 'https://xplife.app/zh',
        'ja': 'https://xplife.app/ja',
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params
}: Props) {
  const { locale } = await params;

  // Validate locale
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  // Enable static rendering and set locale context
  setRequestLocale(locale);

  // Load messages for this locale
  const messages = await getMessages({ locale });

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      {children}
    </NextIntlClientProvider>
  );
}
