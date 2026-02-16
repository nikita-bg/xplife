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
        'x-default': 'https://xplife.app/en',
      },
    },

    // Enhanced keywords for better discoverability
    keywords: [
      'gamification', 'productivity app', 'RPG life', 'ADHD tools', 'habit tracker',
      'goal setting', 'personal development', 'life rpg', 'quest tracker', 'level up life',
      'креативност', 'продуктивност', 'навици', 'самоусъвършенстване', 'игровизация',
      'management', 'focus'
    ],
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
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded"
      >
        Skip to main content
      </a>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'XPLife',
            applicationCategory: 'ProductivityApplication',
            operatingSystem: 'Web, Android',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
            },
            description: 'Turn your life into an RPG. Gamify your tasks, habits, and goals to level up your real life.',
            inLanguage: locale,
            url: `https://xplife.app/${locale}`,
            author: {
              '@type': 'Organization',
              name: 'XPLife Team',
              url: 'https://xplife.app',
            },
            screenshot: 'https://xplife.app/og-image.png',
          }),
        }}
      />
      {children}
    </NextIntlClientProvider>
  );
}
