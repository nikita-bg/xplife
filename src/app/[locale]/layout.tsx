import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import Script from 'next/script';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { locales } from '@/i18n';
import { Inter, Orbitron, JetBrains_Mono } from 'next/font/google';
import { generatePageMetadata, getPageSEO } from '@/lib/seo';

const inter = Inter({
    subsets: ['latin', 'cyrillic'],
    variable: '--font-inter',
    display: 'swap',
});

const orbitron = Orbitron({
    subsets: ['latin'],
    variable: '--font-orbitron',
    display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
    subsets: ['latin', 'cyrillic'],
    variable: '--font-jetbrains',
    display: 'swap',
});

export function generateStaticParams() {
    return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
    const seo = getPageSEO('home', locale);
    return generatePageMetadata({ title: seo.title, description: seo.description, path: '', locale });
}

export default async function LocaleLayout({
    children,
    params: { locale },
}: {
    children: React.ReactNode;
    params: { locale: string };
}) {
    // Validate locale
    if (!(locales as readonly string[]).includes(locale)) {
        notFound();
    }

    const messages = await getMessages({ locale });

    return (
        <html lang={locale} suppressHydrationWarning>
            <head>
                <meta name="google-site-verification" content="iMF7KfylAIJLEsTxYpEIpjUuZ5TkMV5Dji9BDphMOvM" />
            </head>
            <body className={`${inter.variable} ${orbitron.variable} ${jetbrainsMono.variable} font-sans`}>
                <NextIntlClientProvider locale={locale} messages={messages}>
                    {children}
                </NextIntlClientProvider>
                <Analytics />
                <SpeedInsights />
                {process.env.NEXT_PUBLIC_GA_ID && (
                    <>
                        <Script
                            src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
                            strategy="afterInteractive"
                        />
                        <Script id="google-analytics" strategy="afterInteractive">
                            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${process.env.NEXT_PUBLIC_GA_ID}');`}
                        </Script>
                    </>
                )}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@type': 'SoftwareApplication',
                            name: 'XPLife',
                            applicationCategory: 'ProductivityApplication',
                            operatingSystem: 'Web',
                            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
                            description: 'Turn your life into an RPG. Gamify tasks, habits, and goals to level up your real life.',
                            inLanguage: locale,
                            url: `https://xplife.app/${locale}`,
                            author: { '@type': 'Organization', name: 'XPLife Team', url: 'https://xplife.app' },
                        }),
                    }}
                />
                <Script src="https://assets.lemonsqueezy.com/lemon.js" strategy="afterInteractive" />
            </body>
        </html>
    );
}

