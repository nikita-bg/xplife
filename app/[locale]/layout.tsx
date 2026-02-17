import React from 'react';
import type { Metadata } from 'next';
import Script from 'next/script';
import { Inter, Orbitron } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, type Locale } from '@/i18n';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const orbitron = Orbitron({ subsets: ['latin'], variable: '--font-orbitron' });

const gaId = process.env.NEXT_PUBLIC_GA_ID;

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
          url: 'https://xplife.app/og-image.jpg',
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
      images: ['https://xplife.app/og-image.jpg'],
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

  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages({ locale });

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <meta name="google-site-verification" content="iMF7KfylAIJLEsTxYpEIpjUuZ5TkMV5Dji9BDphMOvM" />
      </head>
      <body suppressHydrationWarning className={`${inter.variable} ${orbitron.variable} font-sans antialiased`}>
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
                screenshot: 'https://xplife.app/og-image.jpg',
              }),
            }}
          />
          {children}
        </NextIntlClientProvider>
        <Analytics />
        <SpeedInsights />
        {gaId && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
            <Script id="google-analytics" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');`}
            </Script>
          </>
        )}
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator){window.addEventListener('load',()=>{navigator.serviceWorker.register('/sw.js')})}`,
          }}
        />
      </body>
    </html>
  );
}
